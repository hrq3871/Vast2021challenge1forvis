# VAST 2021 MC1 Task 3 Visualization Workbench

This folder contains the interactive visualization system for Mini-Challenge 1 Task 3. It is a local web app built with Vite and D3.js.

The app helps analysts explore official and unofficial relationships among GAStech, POK, APA, the Kronos Government, and key people such as Sten Sanjorge Jr. and Isia Vann.

## Absolute Paths

Expected local project paths:

```text
PROJECT_ROOT   = D:\HKUST\5005 Data visualization\project-vast2021
WORKSPACE_ROOT = D:\HKUST\5005 Data visualization\project-vast2021\MC1
CODE_ROOT      = D:\HKUST\5005 Data visualization\project-vast2021\MC1\code
RAW_DATA_ROOT  = D:\HKUST\5005 Data visualization\project-vast2021\MC1\MC1
```

Important files:

```text
App entry      = D:\HKUST\5005 Data visualization\project-vast2021\MC1\code\index.html
Data script    = D:\HKUST\5005 Data visualization\project-vast2021\MC1\code\scripts\build_task3_data.py
Generated data = D:\HKUST\5005 Data visualization\project-vast2021\MC1\code\public\data\task3_bundle.json
Plan document  = D:\HKUST\5005 Data visualization\project-vast2021\MC1\code\task3_visual_system_development_plan.md
```

Raw VAST files are intentionally not committed to GitHub. The local `RAW_DATA_ROOT` folder must exist if you need to regenerate data.

## Local Data Placement

After cloning this repository, other teammates should keep the code and raw data in this layout:

```text
D:\HKUST\5005 Data visualization\project-vast2021
├─ Team8_The_GAStech_Files_Visualizing_the_Threads_Behind_the_Kidnappings.pptx
└─ MC1
   ├─ code
   │  ├─ README.md
   │  ├─ package.json
   │  ├─ scripts
   │  ├─ src
   │  └─ public
   └─ MC1
      ├─ EmployeeRecords.xlsx
      ├─ email headers.csv
      ├─ GAStechKronos-org-chart.pdf
      ├─ FACTBOOK-Kronos.docx
      ├─ FACTBOOK-Tethys.docx
      ├─ A Map of Kronos.jpg
      ├─ AnswerSheet
      ├─ HistoricalDocuments
      │  ├─ 10 year historical document clean.docx
      │  └─ 5 year report clean.docx
      ├─ News Articles
      ├─ resumes
      ├─ task1_results
      │  └─ readme.md
      └─ task2_results
         ├─ readme.md
         └─ task2_bias
            ├─ task2_source_entity_bias.csv
            ├─ task2_source_event_bias.csv
            └─ task2_source_place_bias.csv
```

Important naming rule:

- Use `task1_results`, not `任务1完成后的结果`.
- Use `task2_results`, not `任务2完成后的结果`.

If a teammate only wants to run the web app, the committed `public/data/*.json` files are enough. They do not need raw data.

If a teammate wants to regenerate data with `npm run data`, the raw data folder above must exist on their machine.

## First Run

Open PowerShell:

```powershell
cd "D:\HKUST\5005 Data visualization\project-vast2021\MC1\code"
npm install
npm run dev
```

Then open:

```text
http://127.0.0.1:5173
```

`npm install` installs dependencies such as Vite, D3, Vitest, and Lucide. You usually only need to run it once after cloning or pulling.

## Daily Use

If dependencies are already installed:

```powershell
cd "D:\HKUST\5005 Data visualization\project-vast2021\MC1\code"
npm run dev
```

Use the browser page for analysis and recording the solution walkthrough.

## Regenerate Data

Only run this when local raw data is available at `RAW_DATA_ROOT`:

```powershell
cd "D:\HKUST\5005 Data visualization\project-vast2021\MC1\code"
npm run data
```

This reads:

- `EmployeeRecords.xlsx`
- `email headers.csv`
- `HistoricalDocuments/*.docx`
- selected news articles under `News Articles`

It writes derived frontend JSON files to:

```text
D:\HKUST\5005 Data visualization\project-vast2021\MC1\code\public\data
```

## Verification

Run tests:

```powershell
npm test
```

Build production assets:

```powershell
npm run build
```

Security audit:

```powershell
npm audit
```

Expected current result:

- 15 tests pass.
- production build succeeds.
- `npm audit` reports 0 vulnerabilities.

## Streamlit Deployment

The repository includes a Streamlit wrapper at `streamlit_app.py`. It embeds the Vite production build and intercepts the app's `./data/*.json` fetches so the existing D3 interface can run inside Streamlit without a separate Vite server.

Local Streamlit run:

```powershell
npm install
npm run build
pip install -r requirements.txt
streamlit run streamlit_app.py
```

Streamlit Cloud settings:

- Repository: this GitHub repository.
- Branch: `main`.
- Main file path: `streamlit_app.py`.
- Python dependencies: `requirements.txt`.

Deployment note: keep the built `dist/index.html`, `dist/assets/*.js`, and `dist/assets/*.css` files committed. They are needed because Streamlit Cloud installs Python dependencies but does not automatically run the Vite build.

## How To Use The App

Main layout:

- top bar: search, topic filter, hypothesis path selector, reset
- left rail: Overview, Official, POK Motive, Email Network, Hypotheses
- center: D3 relationship graph or email arc diagram
- right panel: traceable evidence snippets
- bottom: 1993-2014 evidence timeline

Recommended recording paths:

1. Sanjorge target / motive path
   - Search `kidnapping`.
   - Click the 2014 kidnapping timeline events.
   - Select `Sanjorge as target / motive anchor`.
   - Inspect Sanjorge, IPO, government reception, and ransom evidence.

2. GAStech-Government official relationship
   - Open `Official`.
   - Review GAStech-Government partnership edges.
   - Use the evidence panel to cite government reception and partnership evidence.

3. POK / Vann personal bridge
   - Open `POK Motive`.
   - Select `Isia Vann as personal bridge`.
   - Inspect Isia Vann employment, Security department, Juliana Vann, Mandor Vann, and POK evidence.

4. APA / Arise weak hypothesis
   - Open `Email Network`.
   - Select ARISE.
   - Select `APA / Arise as weak external risk`.
   - Keep this as hypothesis-strength evidence, not confirmed cooperation.

## Evidence Strength Rules

The app uses three confidence levels:

- `confirmed`: directly supported by employee records, historical documents, or source text.
- `probable`: multiple clues support the relationship, but the source does not directly prove it.
- `hypothesis`: weak or indirect relationship, useful for exploration but not final proof.

Important: APA / Arise is intentionally displayed as `hypothesis`, not `confirmed`.

## Files To Edit

Common places for future changes:

```text
src/main.js                         app bootstrap and layout wiring
src/styles.css                      visual design and responsive layout
src/views/relationshipGraph.js      main D3 relationship graph
src/views/emailNetwork.js           email arc diagram
src/views/timelineView.js           bottom timeline
src/views/evidencePanel.js          evidence cards
src/views/hypothesisExplorer.js     guided analysis cards
scripts/build_task3_data.py         preprocessing and derived data
tests/*.test.js                     regression tests
```

## Git Notes

Do not commit:

- `node_modules/`
- `dist/**/*.map`
- local logs
- raw VAST data under `MC1/`

These are covered by `.gitignore`.
