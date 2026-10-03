"""Seq2Point 1D-CNN Neural Network for Non-Intrusive Load Disaggregation."""

try:
    import torch
    import torch.nn as nn
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

if TORCH_AVAILABLE:
    class Seq2Point1DCNN(nn.Module):
        """Sequence-to-Point 1D Convolutional Neural Network for NILM."""
        def __init__(self, window_size: int = 30):
            super().__init__()
            self.conv1 = nn.Conv1d(in_channels=1, out_channels=32, kernel_size=5, padding=2)
            self.conv2 = nn.Conv1d(in_channels=32, out_channels=64, kernel_size=5, padding=2)
            self.conv3 = nn.Conv1d(in_channels=64, out_channels=128, kernel_size=3, padding=1)
            self.relu = nn.ReLU()
            self.flatten = nn.Flatten()
            self.fc1 = nn.Linear(128 * window_size, 128)
            self.fc2 = nn.Linear(128, 1)

        def forward(self, x):
            # x shape: (batch_size, 1, window_size)
            x = self.relu(self.conv1(x))
            x = self.relu(self.conv2(x))
            x = self.relu(self.conv3(x))
            x = self.flatten(x)
            x = self.relu(self.fc1(x))
            out = self.fc2(x)
            return out
else:
    class Seq2Point1DCNN:
        """Fallback lightweight representation when PyTorch is not yet installed."""
        def __init__(self, window_size: int = 30):
            self.window_size = window_size
