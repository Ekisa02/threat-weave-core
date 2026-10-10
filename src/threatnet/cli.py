import argparse
from src.threatnet.logging_config import setup_logging
from src.threatnet.core.inference import ThreatDetector

logger = setup_logging()

def main():
    parser = argparse.ArgumentParser("Sentinel Weave CLI")
    parser.add_argument("--predict", nargs='+', type=float, help="Provide a list of floats to run a prediction")
    args = parser.parse_args()
    if args.predict:
        detector = ThreatDetector()
        print(detector.predict(args.predict))

if __name__ == '__main__':
    main()
