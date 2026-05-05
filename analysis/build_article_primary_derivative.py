#!/usr/bin/env python3
"""
Label each news article as Primary or Derivative based on shared TITLE across sources.

Heuristic (title + date only):
- Normalize TITLE (uppercase, collapsed whitespace).
- Group all articles with the same normalized title.
- Within a group, parse PUBLISHED dates; the earliest calendar date in the corpus
  is treated as the first-wave story. Articles on that earliest date are Primary;
  strictly later dates are Derivative. Articles with no parsable date → Unknown.
- Single-article groups are always Primary.

Outputs:
- analysis/article_primary_derivative_labels.csv
- Inserts or updates `STORY_ROLE: Primary|Derivative|Unknown` in each .txt file
  under MC1/News Articles/ (below SOURCE:, before TITLE:).
"""

from __future__ import annotations

import csv
import re
from collections import defaultdict
from datetime import date, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NEWS_ROOT = ROOT / "MC1" / "News Articles"
OUT_CSV = ROOT / "analysis" / "article_primary_derivative_labels.csv"

MONTH_MAP = {
    "jan": 1, "january": 1, "feb": 2, "february": 2, "mar": 3, "march": 3,
    "apr": 4, "april": 4, "may": 5, "jun": 6, "june": 6, "jul": 7,
    "july": 7, "aug": 8, "august": 8, "sep": 9, "sept": 9,
    "september": 9, "oct": 10, "october": 10, "nov": 11, "november": 11,
    "dec": 12, "december": 12,
}


def valid_year(y: int) -> bool:
    return 1900 <= y <= 2030


def parse_date(raw: str) -> date | None:
    s = raw.strip()
    if not s:
        return None
    s = re.sub(r"\s+", " ", s)
    s = re.sub(r"(\d)([A-Za-z])", r"\1 \2", s)
    s = re.sub(r"([A-Za-z])(\d)", r"\1 \2", s)

    for fmt in (
        "%Y/%m/%d",
        "%Y-%m-%d",
        "%d %B %Y",
        "%d %b %Y",
        "%B %d %Y",
        "%b %d %Y",
    ):
        try:
            d = datetime.strptime(s, fmt).date()
            if valid_year(d.year):
                return d
        except ValueError:
            pass

    toks = re.split(r"[\s,/-]+", s)
    toks = [t for t in toks if t]
    nums = []
    for t in toks:
        if re.fullmatch(r"\d{1,4}", t):
            nums.append(int(t))

    month = None
    for t in toks:
        tl = t.lower()
        if tl in MONTH_MAP:
            month = MONTH_MAP[tl]

    year = None
    for n in nums:
        if 1000 <= n <= 9999 and valid_year(n):
            year = n
            break

    day = None
    if year is None and len(nums) >= 3:
        cand_y, cand_m, cand_d = nums[0], nums[1], nums[2]
        if valid_year(cand_y) and 1 <= cand_m <= 12 and 1 <= cand_d <= 31:
            try:
                return datetime(cand_y, cand_m, cand_d).date()
            except ValueError:
                pass

    for n in nums:
        if 1 <= n <= 31:
            day = n
            break
    if year and month:
        try:
            d = day or 1
            return datetime(year, month, d).date()
        except ValueError:
            pass
    return None


def norm_title(t: str) -> str:
    t = (t or "").strip().upper()
    t = re.sub(r"\s+", " ", t)
    return t


def extract_fields(text: str) -> dict[str, str | None]:
    def line_pat(key: str) -> str | None:
        m = re.search(rf"^{re.escape(key)}:\s*(.*)$", text, re.MULTILINE)
        return m.group(1).strip() if m else None

    return {
        "source": line_pat("SOURCE"),
        "title": line_pat("TITLE"),
        "published": line_pat("PUBLISHED"),
    }


def insert_story_role(text: str, role: str) -> str:
    line = f"STORY_ROLE: {role}"
    if re.search(r"^STORY_ROLE:\s*\S+", text, re.MULTILINE):
        return re.sub(
            r"^STORY_ROLE:\s*\S+.*$",
            line,
            text,
            count=1,
            flags=re.MULTILINE,
        )
    # Insert after SOURCE: line and blank line, before TITLE: (canonical MC1 layout)
    m = re.search(r"^(SOURCE:.+)\n(\n)(TITLE:)", text, re.MULTILINE | re.DOTALL)
    if m:
        return (
            text[: m.start()]
            + f"{m.group(1)}\n{line}\n{m.group(2)}{m.group(3)}"
            + text[m.end() :]
        )
    # Fallback: first line TITLE without blank line pattern
    m2 = re.search(r"^(SOURCE:.+\n)(TITLE:)", text, re.MULTILINE | re.DOTALL)
    if m2:
        return (
            text[: m2.start()]
            + f"{m2.group(1)}{line}\n{m2.group(2)}"
            + text[m2.end() :]
        )
    return line + "\n\n" + text


def collect_articles():
    rows = []
    for path in sorted(NEWS_ROOT.rglob("*.txt")):
        rel = path.relative_to(ROOT).as_posix()
        txt = path.read_text(encoding="utf-8", errors="replace")
        f = extract_fields(txt)
        title = f["title"]
        nt = norm_title(title or "") if title else ""
        if not nt:
            rows.append({
                "rel_path": rel,
                "source": (f["source"] or path.parent.name or "").strip(),
                "title": title or "",
                "title_norm": "",
                "published_raw": (f["published"] or "").strip(),
                "date": None,
            })
            continue
        d = parse_date(f["published"] or "")
        rows.append({
            "rel_path": rel,
            "source": (f["source"] or path.parent.name or "").strip(),
            "title": title or "",
            "title_norm": nt,
            "published_raw": (f["published"] or "").strip(),
            "date": d,
        })
    return rows


def assign_roles(rows: list[dict]) -> list[dict]:
    by_title = defaultdict(list)
    for r in rows:
        if r["title_norm"]:
            by_title[r["title_norm"]].append(r)

    path_role: dict[str, str] = {}
    for tn, grp in by_title.items():
        if len(grp) == 1:
            path_role[grp[0]["rel_path"]] = "Primary"
            continue
        with_date = [g for g in grp if g["date"]]
        if not with_date:
            for g in grp:
                path_role[g["rel_path"]] = "Unknown"
            continue
        min_d = min(g["date"] for g in with_date)
        for g in grp:
            if g["date"] is None:
                path_role[g["rel_path"]] = "Unknown"
            elif g["date"] > min_d:
                path_role[g["rel_path"]] = "Derivative"
            else:
                path_role[g["rel_path"]] = "Primary"

    for r in rows:
        if not r["title_norm"]:
            path_role[r["rel_path"]] = "Unknown"

    enriched = []
    for r in rows:
        role = path_role[r["rel_path"]]
        tn = r["title_norm"]
        cluster = by_title[tn] if tn else []
        sources = sorted(set(x["source"] for x in cluster))
        enriched.append({
            **r,
            "story_role": role,
            "cluster_size": len(cluster),
            "cluster_sources_count": len(sources),
            "date_iso": r["date"].isoformat() if r["date"] else "",
        })
    return enriched


def write_csv(rows: list[dict]) -> None:
    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = [
        "rel_path", "source", "title", "title_norm", "published_raw", "date_iso",
        "cluster_size", "cluster_sources_count", "story_role",
    ]
    with OUT_CSV.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        w.writeheader()
        for r in sorted(rows, key=lambda x: x["rel_path"]):
            w.writerow({k: r.get(k, "") for k in fieldnames})


def patch_files_fixed(rows: list[dict]) -> int:
    n = 0
    role_by_path = {r["rel_path"]: r["story_role"] for r in rows}
    for path in NEWS_ROOT.rglob("*.txt"):
        rel = path.relative_to(ROOT).as_posix()
        role = role_by_path.get(rel, "Unknown")
        text = path.read_text(encoding="utf-8", errors="replace")
        new_text = insert_story_role(text, role)
        if new_text != text:
            path.write_text(new_text, encoding="utf-8")
            n += 1
    return n


def main() -> None:
    rows = collect_articles()
    labeled = assign_roles(rows)
    write_csv(labeled)
    changed = patch_files_fixed(labeled)
    print(f"Wrote {OUT_CSV} ({len(labeled)} rows). Updated {changed} article files.")


if __name__ == "__main__":
    main()
