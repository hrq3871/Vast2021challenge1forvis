#!/usr/bin/env python3
"""Build Task2 → Task3 bias tables from existing bias_*_stats CSVs."""

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "analysis"
ENTITIES = {"GAStech", "POK", "APA", "Government"}
PLACES = {"Abila", "Kronos", "Tethys"}


def main() -> None:
    # 1 — entity × lexical tone (same as bias_entity_stats tone_score)
    out1 = ROOT / "task2_source_entity_bias.csv"
    rows = []
    with (ROOT / "bias_entity_stats.csv").open(encoding="utf-8", newline="") as f:
        for r in csv.DictReader(f):
            if r["entity"] not in ENTITIES:
                continue
            rows.append({
                "source": r["source"],
                "entity": r["entity"],
                "mentions": r["mentions"],
                "pos_words": r["pos_words"],
                "neg_words": r["neg_words"],
                "bias_score": r["tone_score"],
            })
    rows.sort(key=lambda x: (x["source"], x["entity"]))
    with out1.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)

    # 2 — place × lexical tone
    out2 = ROOT / "task2_source_place_bias.csv"
    rows2 = []
    with (ROOT / "bias_place_stats.csv").open(encoding="utf-8", newline="") as f:
        for r in csv.DictReader(f):
            if r["place"] not in PLACES:
                continue
            rows2.append({
                "source": r["source"],
                "place": r["place"],
                "mentions": r["mentions"],
                "pos_words": r["pos"],
                "neg_words": r["neg"],
                "bias_score": r["tone"],
            })
    rows2.sort(key=lambda x: (x["source"], x["place"]))
    with out2.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows2[0].keys()))
        w.writeheader()
        w.writerows(rows2)

    # 3 — event framing intensity (hits per article)
    out3 = ROOT / "task2_source_event_bias.csv"
    evt = [
        ("protest_unrest", "Protest_Unrest"),
        ("economic_ipo", "Economic_IPO"),
        ("kidnapping_crisis", "Kidnapping_Crisis"),
    ]
    rows3 = []
    with (ROOT / "bias_frame_stats.csv").open(encoding="utf-8", newline="") as f:
        for r in csv.DictReader(f):
            art = int(r["articles"])
            denom = art if art > 0 else 1
            for key, label in evt:
                h = int(r[key])
                rows3.append({
                    "source": r["source"],
                    "event": label,
                    "keyword_hits": h,
                    "articles": art,
                    "bias_score": round(h / denom, 6),
                })
    rows3.sort(key=lambda x: (x["source"], x["event"]))
    with out3.open("w", newline="", encoding="utf-8") as f:
        flds = ["source", "event", "keyword_hits", "articles", "bias_score"]
        w = csv.DictWriter(f, fieldnames=flds)
        w.writeheader()
        w.writerows(rows3)

    print(f"Wrote {out1} ({len(rows)} rows)")
    print(f"Wrote {out2} ({len(rows2)} rows)")
    print(f"Wrote {out3} ({len(rows3)} rows)")


if __name__ == "__main__":
    main()
