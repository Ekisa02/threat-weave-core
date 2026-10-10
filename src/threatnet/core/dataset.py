import pandas as pd
import numpy as np
from torch.utils.data import Dataset

class TabularSequenceDataset(Dataset):
    """Simple CSV-backed dataset. Expects columns: features (comma-separated) and label.

    Example CSV:
    features,label
    "1,2,3,4",0
    "5,6,7,8",1
    """
    def __init__(self, csv_path, feature_col="features", label_col="label", delimiter=","):
        self.df = pd.read_csv(csv_path)
        if feature_col not in self.df.columns or label_col not in self.df.columns:
            raise ValueError(f"CSV must contain columns '{feature_col}' and '{label_col}'")
        self.feature_col = feature_col
        self.label_col = label_col

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        raw = self.df.iloc[idx][self.feature_col]
        # allow stored as string "1,2,3" or as list-like
        if isinstance(raw, str):
            features = np.array([float(x) for x in raw.split(',')], dtype=np.float32)
        else:
            features = np.asarray(raw, dtype=np.float32)
        label = int(self.df.iloc[idx][self.label_col])
        return features, label
