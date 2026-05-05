# Sentiment Timeline: Method

## Data source
- Parsed all text files under `MC1/News Articles`.
- Extracted `PUBLISHED` date and article body text.

## Event tagging
- Fire: keywords like `fire`, `bombing`, `arson`.
- Hostage: keywords like `kidnapping`, `hostage`, `ransom`.
- Standoff: keywords like `standoff`, `siege`, `confrontation`.
- Each article is assigned to the event with the highest keyword hit count.

## Sentiment scoring
- Lexicon-based score per article: `(positive_count - negative_count) / (positive_count + negative_count + 1)`.
- Monthly average sentiment is computed for each event category.

## Outputs
- Timeline SVG: `analysis/images/12_sentiment_timeline_events.svg`.
- Aggregated table: `analysis/sentiment_timeline_events.csv`.

## Coverage
- Tagged articles: 159 (Fire=85, Hostage=59, Standoff=15).
- Timeline range: 1995-11 to 2014-01.
