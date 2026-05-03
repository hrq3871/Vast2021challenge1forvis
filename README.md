# VAST 2021 MC1 Task 3 Relationship Workbench

This project is an interactive relationship analysis workbench for VAST 2021 Mini-Challenge 1 Task 3. It helps analysts explain how official and unofficial relationships connect GAStech, the Kronos Government, Protectors of Kronos (POK), the Asterian People's Army (APA), ARISE, and several key people around the kidnapping case.

The system does not try to produce a single automatic answer. Instead, it turns employee records, news articles, historical documents, and email headers into a traceable evidence network. Users can start from organization structure, anomalous emails, the timeline, or guided hypothesis paths, then inspect the source evidence behind each claim in the evidence panel.

## Questions This Workbench Helps Answer

- What public and formal relationships exist between GAStech and the Kronos Government?
- Why does POK have a conflict relationship with GAStech and the government?
- Why is Isia Vann a key bridge between GAStech Security and the POK narrative?
- Why might Sanjorge be a high-value target?
- Is APA / ARISE a confirmed actor, or only a weak external risk signal?
- Which claims are directly supported, and which claims are only reasonable hypotheses?

## Data Sources

The app reads generated JSON files from `public/data`. Those JSON files are derived from the original VAST materials. A normal user only needs the checked-in JSON files to run the app; the raw data is only needed when regenerating the dataset.

### Employee Records

Source: `EmployeeRecords.xlsx`

Meaning:

- Contains GAStech employee names, email addresses, departments, titles, start dates, and some profile fields.
- Builds the official internal organization structure for GAStech.
- Places people such as Isia Vann inside GAStech Security and identifies Sanjorge as GAStech leadership.

How the app uses it:

- The `Org Chart` view displays GAStech departments and employees.
- Clicking an employee makes that person the current analysis focus and opens related anomalous email flow.
- Official employment and department relationships in the graph are mainly derived from this source.

### Email Headers

Source: `email headers.csv`

Meaning:

- Contains sender, recipient, timestamp, and subject for email headers.
- The system does not show every routine email. It first filters for subjects that are relevant to the case logic.

Keyword-based classification:

- `arise`: the subject contains `arise`.
  - Meaning: tracks whether ARISE / APA-related ideas or external risk signals appear inside GAStech communication.
- `ipo`: the subject contains `ipo`.
  - Meaning: tracks listing, wealth, and executive value as a possible economic motive around the kidnapping.
- `security`: the subject contains `security` or `patrol`.
  - Meaning: tracks security, patrol, route, and internal protection signals.

Filtering result:

- Only emails matching one of the three categories are included in the frontend analysis.
- The current generated dataset contains `220` anomalous email flows:
  - `security`: 136 flows
  - `ipo`: 57 flows
  - `arise`: 27 flows
- Routine daily emails are excluded so the email network stays focused on the core case logic.

How the app uses it:

- `Email Network` shows anomalous email movement between senders and recipients.
- Clicking an email path reveals the subject, timestamp, sender, and recipient for the grouped messages.
- The global search box searches email subjects, participants, and timestamps.

### Historical Documents

Source: `HistoricalDocuments/*.docx`

Meaning:

- Provides long-term background about POK origins, Tiskele water contamination, Juliana Vann's death, Vann family ties, and Mandor Vann's political role.
- These documents mainly support unofficial relationships: conflict, motive, personal bridges, and historical grievances.

How the app uses it:

- Supports the conflict relationship between POK and GAStech.
- Supports POK's accountability conflict with the Kronos Government.
- Supports Isia Vann's connection to Juliana Vann, Mandor Vann, and the POK background.

### News Articles

Source: `News Articles/*`

Meaning:

- Provides public reporting around the 2014 case events.
- Covers GAStech-government partnership, the government reception, Sanjorge escaping the kidnapping, missing GAStech leadership, POK ransom reporting, and APA / ARISE risk reporting.

How the app uses it:

- Supports official partnership relationships and public events on the kidnapping timeline.
- Supports the Sanjorge target / motive story path.
- Supports APA / ARISE as a weak risk signal without upgrading it into a confirmed conclusion.

## Generated Data Files

The frontend reads JSON files from `public/data`:

| File | Meaning |
| --- | --- |
| `task3_bundle.json` | Combined bundle containing employees, emails, relationships, events, evidence, and hypotheses |
| `employees.json` | GAStech employees, departments, titles, and email addresses |
| `email_edges.json` | Anomalous email flows after keyword filtering |
| `relationship_nodes.json` | People, organizations, events, and topic nodes |
| `relationship_edges.json` | Relationships between nodes |
| `timeline_events.json` | Key events from 1994 to 2014 |
| `evidence_items.json` | Evidence cards shown in the right panel |
| `hypotheses.json` | Three guided analysis paths |

Current generated data size:

- 54 employees
- 220 anomalous email flows
- 20 relationship nodes
- 16 relationship edges
- 9 timeline events
- 15 evidence items
- 3 hypothesis paths

## Evidence Strength Rules

The app labels relationships and evidence with three confidence levels:

- `confirmed`
  - Directly supported by a source such as an employee record, historical document, or explicit news text.
  - In a story, this can be phrased as "the evidence shows".
- `probable`
  - Supported by multiple clues, but not directly proven by one source.
  - In a story, this should be phrased as "likely" or "can be reasonably inferred".
- `hypothesis`
  - Based on weak or indirect clues. Useful for exploration, but not final proof.
  - In a story, this should be phrased as "may suggest" or "should be treated cautiously".

Important: APA / ARISE material is intentionally kept at `hypothesis` strength. News evidence supports the APA-ARISE connection, and email evidence shows ARISE subjects entering GAStech communication. However, the data does not prove that APA cooperated with POK or GAStech insiders.

## System Modules

### Top Bar

The top bar is the global control area.

Functions:

- `Search`: searches relationships, nodes, evidence, timeline events, and anomalous emails.
- `Topic`: focuses the system on a topic such as Government, POK Motive, Vann Bridge, ARISE, IPO, Kidnapping, or Security.
- `Path`: selects one of the guided hypothesis paths.
- `Reset`: clears search, topic, path, and the current selection.

How it links modules:

- Search affects the relationship graph, evidence panel, timeline, and email network.
- Topic filtering focuses multiple modules on the same analytical theme.
- Path selection highlights the relationships and evidence needed for a complete story path.

### Relations

`Relations` is the main relationship graph. It shows how official and unofficial relationships overlap.

Node meanings:

- Circle: person
- Rounded rectangle: organization or department
- Diamond: event
- Hexagon: topic

Color meanings:

- GAStech: internal company actors and topics
- Government: Kronos government nodes
- POK: Protectors of Kronos nodes
- APA: APA / ARISE nodes
- Conflict: kidnapping, pollution, and other conflict events

Line meanings:

- Blue line: official-leaning relationship, such as government partnership, employment, or department membership.
- Amber line: unofficial-leaning relationship, such as conflict, family bridge, or weak risk signal.
- Solid line: `confirmed`.
- Dashed line: `probable` or `hypothesis`.

Common operations:

- Click a node to see evidence related to that person, organization, event, or topic.
- Click a relationship line to see the evidence behind that relationship.
- Select a Topic to show only relationships under that analytical theme.
- Select a Path to show only relationships needed for a guided story.

### Org Chart

`Org Chart` explains official structure and external organization panels.

GAStech section:

- Displays employees by department.
- Makes key departments such as Executive and Security easy to inspect.
- Clicking an employee focuses on that person and opens the email network filtered to their anomalous communication.

External organization panels:

- `Protectors of Kronos`: shows POK roles, objectives, and evidence links.
- `APA / Arise`: shows APA and ARISE as weak risk signals.
- `Kronos Government`: shows the government as official partner, reception host, and accountability target for POK.

Best used for:

- Writing the official relationship section.
- Confirming who holds which formal GAStech role.
- Comparing government cooperation with POK / APA unofficial relationships.

### Email Network

`Email Network` shows anomalous email flow between senders and recipients.

The system does not show every email. It only displays emails that passed keyword-based anomaly filtering. Email topics are grouped as:

- `ARISE`
- `IPO`
- `SECURITY`
- `All Email`

Graph meaning:

- Left side: major senders.
- Right side: major recipients.
- Thicker curves mean more anomalous emails along that sender-recipient path.
- Clicking a curve opens the message subjects, timestamps, senders, and recipients in that path.

Linked operations:

- Clicking an employee in `Org Chart` filters `Email Network` to anomalous emails related to that employee.
- Searching for Sanjorge, Vann, ARISE, IPO, or similar terms filters the email network.
- Choosing `ARISE` helps inspect whether APA / ARISE is only a weak signal.
- Choosing `IPO` helps inspect executive wealth and target value.
- Choosing `SECURITY` helps inspect security, patrol, and route-related communication.

### Evidence Panel

The right-side `Evidence Panel` is the source inspection area.

It updates automatically based on the current action:

- Click a node: shows evidence related to that person, organization, event, or topic.
- Click a relationship line: shows evidence supporting that relationship.
- Click a timeline event: shows evidence behind that event.
- Select a hypothesis path: shows evidence required by that path.
- Enter a search term: shows matching evidence cards.

Each evidence card includes:

- Title
- Source
- Snippet
- Date
- Confidence level
- Bias warning

Clicking an evidence card opens more source text. `Copy Evidence Summary` copies the current evidence list for use in a report or story script.

### Timeline

`Timeline` connects long-term background and kidnapping-day events in chronological order.

It covers key events from 1994 to 2014:

- 1994: GAStech-Kronos partnership becomes an economic baseline.
- 1997: POK forms around Tiskele water contamination.
- 1998: Juliana Vann dies and becomes a POK symbol.
- 2009: Isia Vann's profile links GAStech Security to POK family history.
- 2014-01-13: ARISE and IPO anomalous email subjects appear.
- 2014-01-19: Government reception for GAStech executives is reported.
- 2014-01-20: GAStech leadership is confirmed missing.
- 2014-01-21: POK ransom claim and Sanjorge escape coverage appear.

Best used for:

- Placing official relationships in political and business context.
- Placing unofficial relationships in pollution, family, and activist context.
- Writing a story that follows event sequence instead of only listing people.

### Hypotheses

`Hypotheses` provides three guided story paths.

#### Sanjorge as target / motive anchor

Strength: `probable`

Meaning:

- Sanjorge connects GAStech leadership, IPO wealth, the government reception route, and the kidnapping event.
- This path explains why he may be a high-value target.

How to use it:

- Select this Path.
- Inspect the highlighted CEO, IPO, Government Reception, Kidnapping, and POK conflict relationships.
- Compare news and IPO email evidence in the evidence panel.

#### Isia Vann as personal bridge

Strength: `confirmed`

Meaning:

- Isia Vann is both a GAStech Security employee and a documented Vann family / POK-linked figure.
- This is the strongest personal bridge in the system.

How to use it:

- Select this Path.
- Inspect Isia Vann, GAStech Security, POK, Juliana Vann, and Mandor Vann.
- Use the timeline to move from pollution, to Juliana Vann, to Isia Vann's profile.

#### APA / Arise as weak external risk

Strength: `hypothesis`

Meaning:

- APA is connected to ARISE in news evidence.
- ARISE subjects appear in GAStech email headers.
- No evidence proves that APA cooperated with POK or GAStech insiders.

How to use it:

- Open `Email Network`.
- Switch to `ARISE`.
- Select this Path.
- In reporting, keep this as a weak risk signal, not a confirmed conclusion.

## Cross-Module Workflow Examples

### Start From Official Relationships

1. Click `Reset`.
2. Open `Org Chart`.
3. Review GAStech departments and employee titles.
4. Review the `Kronos Government` panel for government partnership and reception relationships.
5. Click relationship cards under `Evidence Links`.
6. Record the news source, date, and snippet from the evidence panel.
7. Use `Timeline` to connect the 1994 partnership background with the 2014-01-19 government reception event.

Story wording example:

> Officially, GAStech and the Kronos Government maintain a long-running partnership. The government reception shows that this relationship was not only background cooperation, but also part of the public event chain around the kidnapping.

### Start From POK Unofficial Conflict

1. Click `Relations`.
2. Set `Topic` to `POK Motive`.
3. Click the relationship lines among POK, GAStech, and the Kronos Government.
4. Inspect the historical document and news evidence in the right panel.
5. Use `Timeline` to connect the 1997 pollution issue, Juliana Vann in 1998, and the 2014 ransom claim.

Story wording example:

> Unofficially, the POK-GAStech conflict grows out of long-term pollution and accountability narratives. POK targets not only the company, but also the government that partners with it.

### Start From Isia Vann as Personal Bridge

1. Select `Isia Vann as personal bridge` in `Path`.
2. Click the Isia Vann node.
3. Review employee-record evidence and historical-document evidence in the evidence panel.
4. Click Isia Vann in `Org Chart` to open `Email Network`.
5. Inspect whether related anomalous emails cluster around Security, ARISE, or other themes.

Story wording example:

> Isia Vann is a key bridge. His formal identity belongs to GAStech Security, while historical material places him within the Vann family and POK background. He therefore connects the official company structure with the unofficial conflict network.

### Start From APA / ARISE Weak Signal

1. Open `Email Network`.
2. Select `ARISE`.
3. Click the main email paths to inspect subjects and participants.
4. Select `APA / Arise as weak external risk` in `Path`.
5. Compare APA news evidence with ARISE email evidence.

Story wording example:

> APA / ARISE should be treated as a cautious external risk signal. The system shows ARISE subjects entering GAStech communication and news links between APA and ARISE, but this is not enough to prove that APA worked with POK or GAStech insiders on the kidnapping.

## Recommended Story Structure

Use this order for an analysis report:

1. **Official background**
   - GAStech is an important company in Kronos.
   - GAStech has a public partnership with the Kronos Government.
   - Executives are connected to a formal government reception.

2. **Unofficial conflict**
   - POK's motive comes from pollution, protest, and accountability.
   - The conflict targets both GAStech and its government partner.

3. **Personal bridge**
   - Isia Vann connects GAStech Security with the Vann / POK background.
   - Mandor Vann and Juliana Vann add political and emotional context to that bridge.

4. **Economic and route value**
   - The IPO gives GAStech executives high economic value.
   - The government reception places executive movement and timing into the public event chain.

5. **Weak external risk**
   - APA / ARISE should remain a supporting risk signal.
   - It should not be written as a confirmed participant.

6. **Conclusion**
   - The kidnapping should be understood as a multi-organization relationship network shaped by official cooperation, environmental conflict, personal ties, and weak external signals.

## Run The Project

Install dependencies:

```powershell
npm install
```

Start the local development server:

```powershell
npm run dev
```

Default URL:

```text
http://127.0.0.1:5173
```

Regenerate data:

```powershell
npm run data
```

Run tests:

```powershell
npm test
```

Build production assets:

```powershell
npm run build
```

Preview the Streamlit wrapper locally:

```powershell
pip install -r requirements.txt
streamlit run streamlit_app.py
```

## Deployment

The main interface is still the Vite + D3 app. Streamlit is only used as a public deployment shell. `streamlit_app.py` reads the built `dist` files and the JSON data in `public/data`.

Before deployment, make sure these files are committed:

- `streamlit_app.py`
- `requirements.txt`
- `public/data/*.json`
- `dist/index.html`
- `dist/assets/*.js`
- `dist/assets/*.css`

## Main Code Files

| File | Purpose |
| --- | --- |
| `scripts/build_task3_data.py` | Generates frontend JSON data from raw materials |
| `src/main.js` | Page shell, module mounting, and initial state |
| `src/state.js` | Global interaction state: search, topic, path, and selection |
| `src/dataLoader.js` | Loads and validates JSON data |
| `src/utils/filters.js` | Filters relationships, timeline events, and evidence |
| `src/utils/evidenceScoring.js` | Handles evidence confidence and ranking |
| `src/views/searchPanel.js` | Top search, topic, path, and reset controls |
| `src/views/relationshipGraph.js` | `Relations` and `Org Chart` views |
| `src/views/emailNetwork.js` | Anomalous email flow view |
| `src/views/evidencePanel.js` | Right-side evidence cards and source text |
| `src/views/timelineView.js` | Timeline view |
| `src/views/hypothesisExplorer.js` | Guided hypothesis paths and walkthrough steps |
| `streamlit_app.py` | Streamlit deployment shell |

## Git Notes

Do not commit:

- `node_modules/`
- Local logs
- Raw VAST source data
- Temporary files or local experiment output

The checked-in `public/data/*.json` files and deployment-ready `dist` assets are required for the deployed version.
