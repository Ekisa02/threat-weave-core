import torch

def to_device(batch, device):
    X, y = batch
    return X.to(device), y.to(device)
