from __future__ import annotations

from collections.abc import Callable
from concurrent.futures import Future, ThreadPoolExecutor
from dataclasses import dataclass
from threading import BoundedSemaphore, Lock
from time import sleep


@dataclass(frozen=True)
class QueueMetrics:
    submitted: int
    completed: int
    failed: int
    rejected: int
    retried: int
    in_flight: int


class PersistenceWriteQueue:
    def __init__(
        self,
        max_pending: int = 1000,
        workers: int = 2,
        max_retries: int = 2,
        backoff_seconds: float = 0.1,
        max_backoff_seconds: float = 1.0,
    ) -> None:
        if max_pending < 1 or workers < 1:
            raise ValueError("queue bounds must be positive")
        if max_retries < 0:
            raise ValueError("max_retries must be non-negative")
        if backoff_seconds < 0 or max_backoff_seconds < backoff_seconds:
            raise ValueError("invalid retry backoff bounds")
        self._slots = BoundedSemaphore(max_pending)
        self._executor = ThreadPoolExecutor(max_workers=workers, thread_name_prefix="db-write")
        self._lock = Lock()
        self._futures: set[Future[object]] = set()
        self._submitted = 0
        self._completed = 0
        self._failed = 0
        self._rejected = 0
        self._retried = 0
        self._max_retries = max_retries
        self._backoff_seconds = backoff_seconds
        self._max_backoff_seconds = max_backoff_seconds
        self._closed = False

    def submit(self, operation: Callable[[], object]) -> bool:
        with self._lock:
            if self._closed:
                self._rejected += 1
                return False
        if not self._slots.acquire(blocking=False):
            with self._lock:
                self._rejected += 1
            return False
        future = self._executor.submit(self._run_with_retry, operation)
        with self._lock:
            self._submitted += 1
            self._futures.add(future)
        future.add_done_callback(self._done)
        return True

    def _run_with_retry(self, operation: Callable[[], object]) -> object:
        attempt = 0
        while True:
            try:
                return operation()
            except Exception:
                if attempt >= self._max_retries:
                    raise
                delay = min(self._backoff_seconds * (2**attempt), self._max_backoff_seconds)
                with self._lock:
                    self._retried += 1
                if delay > 0:
                    sleep(delay)
                attempt += 1

    def _done(self, future: Future[object]) -> None:
        with self._lock:
            self._futures.discard(future)
            if future.exception() is None:
                self._completed += 1
            else:
                self._failed += 1
        self._slots.release()

    def metrics(self) -> QueueMetrics:
        with self._lock:
            return QueueMetrics(
                submitted=self._submitted,
                completed=self._completed,
                failed=self._failed,
                rejected=self._rejected,
                retried=self._retried,
                in_flight=len(self._futures),
            )

    def close(self, wait: bool = True) -> QueueMetrics:
        with self._lock:
            self._closed = True
        self._executor.shutdown(wait=wait, cancel_futures=not wait)
        return self.metrics()
