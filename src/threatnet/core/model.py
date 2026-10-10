import torch
import torch.nn as nn

class SequenceClassifier(nn.Module):
    """A compact sequence classifier for telemetry/log feature vectors.

    Expects input shape: (batch, seq_len, feature_dim) OR flattened single-vector as (batch, feature_dim)
    """
    def __init__(self, input_dim: int, hidden_dim: int = 64, num_layers: int = 1, num_classes: int = 2, bidirectional: bool = False):
        super().__init__()
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        self.bidirectional = bidirectional
        self.gru = nn.GRU(input_dim, hidden_dim, num_layers=num_layers, batch_first=True, bidirectional=bidirectional)
        fc_in = hidden_dim * (2 if bidirectional else 1)
        self.fc = nn.Sequential(
            nn.Linear(fc_in, fc_in // 2),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(fc_in // 2, num_classes)
        )

    def forward(self, x):
        # Accept both (batch, feature_dim) and (batch, seq_len, feature_dim)
        if x.dim() == 2:
            x = x.unsqueeze(1)  # treat as seq_len=1
        out, _ = self.gru(x)
        # use final timestep
        last = out[:, -1, :]
        logits = self.fc(last)
        return logits
