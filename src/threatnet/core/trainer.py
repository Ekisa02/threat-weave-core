import torch
from torch.utils.data import DataLoader
import torch.nn.functional as F
from sklearn.metrics import accuracy_score
import os

class Trainer:
    def __init__(self, model, device='cpu', lr=1e-3):
        self.model = model.to(device)
        self.device = device
        self.opt = torch.optim.Adam(self.model.parameters(), lr=lr)

    def train_epoch(self, dataloader):
        self.model.train()
        losses = []
        preds = []
        targets = []
        for X, y in dataloader:
            X = X.to(self.device)
            y = y.to(self.device)
            self.opt.zero_grad()
            logits = self.model(X)
            loss = F.cross_entropy(logits, y)
            loss.backward()
            self.opt.step()
            losses.append(loss.item())
            preds.extend(torch.argmax(logits, dim=1).cpu().numpy().tolist())
            targets.extend(y.cpu().numpy().tolist())
        acc = accuracy_score(targets, preds) if targets else 0.0
        return {'loss': sum(losses) / max(1, len(losses)), 'acc': acc}

    @torch.no_grad()
    def evaluate(self, dataloader):
        self.model.eval()
        preds = []
        targets = []
        for X, y in dataloader:
            X = X.to(self.device)
            logits = self.model(X)
            preds.extend(torch.argmax(logits, dim=1).cpu().numpy().tolist())
            targets.extend(y.numpy().tolist())
        acc = accuracy_score(targets, preds) if targets else 0.0
        return {'acc': acc}

    def save_checkpoint(self, path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        torch.save(self.model.state_dict(), path)

    def load_checkpoint(self, path):
        self.model.load_state_dict(torch.load(path, map_location=self.device))
