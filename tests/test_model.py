import torch
from src.threatnet.core.model import SequenceClassifier


def test_model_forward():
    # create dummy data: batch of 2, seq_len=4, feature_dim=1
    model = SequenceClassifier(input_dim=1)
    x = torch.randn(2, 4, 1)
    logits = model(x)
    assert logits.shape == (2, 2)
