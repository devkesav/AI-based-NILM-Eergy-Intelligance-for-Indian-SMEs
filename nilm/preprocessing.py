"""Signal preprocessing for NILM Seq2Point windows."""

from typing import List
import numpy as np

class NILMPreprocessor:
    def __init__(self, window_size: int = 30, mean_kw: float = 15.0, std_kw: float = 10.0):
        self.window_size = window_size
        self.mean_kw = mean_kw
        self.std_kw = std_kw

    def normalize(self, window: List[float]) -> np.ndarray:
        arr = np.array(window, dtype=np.float32)
        if len(arr) < self.window_size:
            # Pad with first element if buffer is warming up
            pad_len = self.window_size - len(arr)
            arr = np.pad(arr, (pad_len, 0), mode='edge')
        elif len(arr) > self.window_size:
            arr = arr[-self.window_size:]
        return (arr - self.mean_kw) / max(1e-3, self.std_kw)

    def denormalize(self, norm_val: float) -> float:
        return float(norm_val * self.std_kw + self.mean_kw)
