# Bias Overview: How it was built

## Inputs used
- `analysis/bias_entity_stats.csv` for People-related entities (`POK`, `Government`, `GAStech`, `APA`).
- `analysis/bias_place_stats.csv` for Places (`Abila`, `Kronos`, `Tethys`).
- `analysis/bias_frame_stats.csv` for Events framing (`kidnapping_crisis`, `protest_unrest`, `economic_ipo`).

## Scoring steps
1. People score per source: sum over entities of `max(0, neg_words - pos_words) * log(1 + mentions)`.
2. Places score per source: sum over places of `max(0, neg - pos) * log(1 + mentions)`.
3. Events score per source: `max(0, (kidnapping_crisis/articles) + 0.5*(protest_unrest/articles) - 0.3*(economic_ipo/articles))`.
4. Each dimension is min-max normalized to `[0,1]` across sources.
5. Overall score is the mean of normalized `People`, `Places`, and `Events` scores.

## Outputs generated
- Heatmap: `analysis/images/11_bias_overview_heatmap.svg`.
- Table: `analysis/bias_overview_scores.csv`.

## Top 5 sources by overall bias score
1. Central Bulletin: overall=0.726, people=0.800, places=0.378, events=1.000
2. The Abila Post: overall=0.725, people=0.744, places=1.000, events=0.430
3. Athena Speaks: overall=0.672, people=0.671, places=0.431, events=0.915
4. News Online Today: overall=0.644, people=1.000, places=0.663, events=0.269
5. News Desk: overall=0.635, people=0.706, places=0.353, events=0.846
