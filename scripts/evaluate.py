import argparse
from torch.utils.data import DataLoader
from src.threatnet.core.dataset import TabularSequenceDataset
from src.threatnet.core.model import SequenceClassifier
from src.threatnet.core.trainer import Trainer


def collate_fn(batch):
    import numpy as np
    import torch
    features, labels = zip(*batch)
    max_len = max(f.shape[0] for f in features)
    padded = []
    for f in features:
        if f.shape[0] < max_len:
            pad = np.zeros(max_len - f.shape[0], dtype=f.dtype)
            padded.append(np.concatenate([f, pad]))
        else:
            padded.append(f)
    X = torch.tensor(padded, dtype=torch.float32).unsqueeze(-1)
    y = torch.tensor(labels, dtype=torch.long)
    return X, y


def main():
    parser = argparse.ArgumentParser("Evaluate Sentinel Weave model")
    parser.add_argument("--data", required=True)
    parser.add_argument("--model", required=True)
    args = parser.parse_args()

    ds = TabularSequenceDataset(args.data)
    loader = DataLoader(ds, batch_size=32, collate_fn=collate_fn)
    # infer input dim
    for X, y in loader:
        input_dim = X.shape[-1]
        break
    model = SequenceClassifier(input_dim=input_dim)
    trainer = Trainer(model)
    trainer.load_checkpoint(args.model)
    stats = trainer.evaluate(loader)
    print(f"Evaluation metrics: {stats}")

if __name__ == '__main__':
    main()
