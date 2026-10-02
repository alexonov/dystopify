"""Score premise/hypothesis pairs with the local DeBERTa checkpoint. No network calls after the weights are on disk."""

import json
import sys

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

MODEL = "MoritzLaurer/deberta-v3-base-zeroshot-v2.0"
BATCH = 16


def main() -> None:
    payload = json.load(sys.stdin)
    pairs = payload.get("pairs", [])
    if not pairs:
        json.dump({}, sys.stdout)
        return

    tokenizer = AutoTokenizer.from_pretrained(MODEL, local_files_only=True)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL, local_files_only=True)
    model.eval()
    labels = {int(index): str(name).lower() for index, name in model.config.id2label.items()}
    entailment = next(index for index, name in labels.items() if name == "entailment")

    scores: dict[str, float] = {}
    for start in range(0, len(pairs), BATCH):
        chunk = pairs[start : start + BATCH]
        encoded = tokenizer(
            [item["premise"] for item in chunk],
            [item["hypothesis"] for item in chunk],
            padding=True,
            truncation=True,
            max_length=128,
            return_tensors="pt",
        )
        with torch.inference_mode():
            logits = model(**encoded).logits
            probs = torch.softmax(logits, dim=-1)[:, entailment].tolist()
        for item, prob in zip(chunk, probs):
            scores[item["id"]] = float(prob)

    json.dump(scores, sys.stdout)


if __name__ == "__main__":
    main()
