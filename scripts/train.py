import argparse
import torch
from torch.utils.data import DataLoader
from src.threatnet.core.model import SequenceClassifier
from src.threatnet.core.trainer import Trainer
from src.threatnet.core.dataset import TabularSequenceDataset
from src.threatnet.config import MODEL_DIR


def collate_fn(batch):
    import numpy as np
    import torch
    # convert variable-length vectors to fixed tensors by padding to max length in batch
    features, labels = zip(*batch)
    max_len = max(f.shape[0] for f in features)
    padded = []
    for f in features:
        if f.shape[0] < max_len:
            pad = np.zeros(max_len - f.shape[0], dtype=f.dtype)
            padded.append(np.concatenate([f, pad]))
        else:
            padded.append(f)
    X = torch.tensor(padded, dtype=torch.float32)
    # interpret as (batch, seq_len, 1) if features were 1D per-timestep OR (batch, feature_dim)
    # Here we treat each sample as sequence length = original vector length, feature_dim=1
    X = X.unsqueeze(-1)
    y = torch.tensor(labels, dtype=torch.long)
    return X, y


def main():
    parser = argparse.ArgumentParser("Train Sentinel Weave model")
    parser.add_argument("--data", required=True, help="CSV with features,label columns")
    parser.add_argument("--out", default=str(MODEL_DIR), help="Output checkpoint directory")
    parser.add_argument("--epochs", type=int, default=5)
    parser.add_argument("--batch-size", type=int, default=16)
    args = parser.parse_args()

    ds = TabularSequenceDataset(args.data)
    loader = DataLoader(ds, batch_size=args.batch_size, shuffle=True, collate_fn=collate_fn)

    # derive input dim from first batch
    for X, y in loader:
        # X is (batch, seq_len, 1) -> input_dim = 1
        input_dim = X.shape[-1]
        break

    model = SequenceClassifier(input_dim=input_dim)
    trainer = Trainer(model, device='cpu')
    for epoch in range(args.epochs):
        stats = trainer.train_epoch(loader)
        print(f"Epoch {epoch+1}/{args.epochs} - loss={stats['loss']:.4f} acc={stats['acc']:.4f}")
    out_path = f"{args.out}/model.pt"
    trainer.save_checkpoint(out_path)
    print(f"Saved model to {out_path}")

if __name__ == '__main__':
    main()
