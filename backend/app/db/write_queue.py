from __future__ import annotations

from collections.abc import Callable
from concurrent.futures import Future, ThreadPoolExecutor
from dataclasses import dataclass
from threading import BoundedSemaphore, Lock


@dataclass(frozen=True)
class QueueMetrics:
    submitted: int
    completed: int
    failed: int
    rejected: int
    in_flight: int


class PersistenceWriteQueue:
    def __init__(self, max_pending: int = 1000, workers: int = 2) -> None:
        if max_pending < 1 or workers < 1:
            raise ValueError("queue bounds must be positive")
        self._slots = BoundedSemaphore(max_pending)
        self._executor = ThreadPoolExecutor(max_workers=workers, thread_name_prefix="db-write")
        self._lock = Lock()
        self._futures: set[Future[object]] = set()
        self._submitted = 0
        self._completed = 0
        self._failed = 0
        self._rejected = 0

    def submit(self, operation: Callable[[], object]) -> bool:
        if not self._slots.acquire(blocking=False):
            with self._lock:
                self._rejected += 1
            return False
        future = self._executor.submit(operation)
        with self._lock:
            self._submitted += 1
            self._futures.add(future)
        future.add_done_callback(self._done)
        return True

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
                in_flight=len(self._futures),
            )

    def close(self, wait: bool = True) -> QueueMetrics:
        self._executor.shutdown(wait=wait, cancel_futures=not wait)
        return self.metrics()
