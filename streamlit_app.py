from __future__ import annotations

import json
import re
from pathlib import Path

import streamlit as st
import streamlit.components.v1 as components


ROOT = Path(__file__).parent
DIST_DIR = ROOT / "dist"
DATA_DIR = ROOT / "public" / "data"
STREAMLIT_TOP_SAFE_AREA = 48
APP_HEIGHT = 1040 + STREAMLIT_TOP_SAFE_AREA


def _read_text(path: Path, *, encoding: str = "utf-8") -> str:
    return path.read_text(encoding=encoding)


@st.cache_data(show_spinner=False)
def load_data_files() -> dict[str, object]:
    if not DATA_DIR.exists():
        raise FileNotFoundError("public/data is missing. Generate and commit the Task 3 JSON files first.")

    return {
        path.name: json.loads(_read_text(path, encoding="utf-8-sig"))
        for path in sorted(DATA_DIR.glob("*.json"))
    }


def read_dist_asset(asset_url: str) -> str:
    asset_path = DIST_DIR / asset_url.lstrip("/")
    if not asset_path.exists():
        raise FileNotFoundError(f"Missing built Vite asset: {asset_url}. Run `npm run build`.")
    return _read_text(asset_path)


def inline_stylesheets(html: str) -> str:
    pattern = re.compile(r'<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>')

    def replace(match: re.Match[str]) -> str:
        return f"<style>\n{read_dist_asset(match.group(1))}\n</style>"

    return pattern.sub(replace, html)


def inline_module_scripts(html: str) -> str:
    pattern = re.compile(r'<script type="module"[^>]*src="([^"]+)"></script>')

    def replace(match: re.Match[str]) -> str:
        js = read_dist_asset(match.group(1)).replace("</script", "<\\/script")
        return f'<script type="module">\n{js}\n</script>'

    return pattern.sub(replace, html)


def data_fetch_bridge() -> str:
    data_json = json.dumps(load_data_files(), ensure_ascii=False, separators=(",", ":"))
    return f"""
    <script>
      window.__TASK3_DATA__ = {data_json};
      const __task3NativeFetch = window.fetch.bind(window);

      window.fetch = (input, init) => {{
        const raw = typeof input === 'string' ? input : input?.url;
        const normalized = String(raw || '')
          .replace(/^https?:\\/\\/[^/]+/, '')
          .split('?')[0]
          .split('#')[0]
          .replace(/\\\\/g, '/');
        const key = normalized.split('/').pop();
        const isTask3DataRequest =
          normalized.includes('/data/') ||
          normalized.startsWith('./data/') ||
          normalized.startsWith('data/');

        if (isTask3DataRequest && Object.prototype.hasOwnProperty.call(window.__TASK3_DATA__, key)) {{
          return Promise.resolve(new Response(JSON.stringify(window.__TASK3_DATA__[key]), {{
            status: 200,
            headers: {{ 'Content-Type': 'application/json' }}
          }}));
        }}

        return __task3NativeFetch(input, init);
      }};
    </script>
    """


@st.cache_data(show_spinner=False)
def load_frontend_html() -> str:
    index_path = DIST_DIR / "index.html"
    if not index_path.exists():
        raise FileNotFoundError("dist/index.html is missing. Run `npm run build` before deployment.")

    html = _read_text(index_path)
    html = inline_stylesheets(html)
    html = html.replace('<script type="module"', f"{data_fetch_bridge()}\n    <script type=\"module\"", 1)
    html = inline_module_scripts(html)
    return html


def render_streamlit_shell() -> None:
    st.markdown(
        """
        <style>
          :root {
            --streamlit-top-safe-area: 48px;
          }

          .stApp {
            background: #f6f7fb;
          }

          .block-container {
            max-width: none;
            margin: 0;
            padding: var(--streamlit-top-safe-area) 0 0;
          }

          .deploy-top-actions {
            position: fixed;
            top: 8px;
            right: 16px;
            z-index: 100000;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            height: 34px;
            border: 1px solid rgba(15, 23, 42, 0.12);
            border-radius: 999px;
            padding: 3px 5px 3px 10px;
            background: rgba(255, 255, 255, 0.92);
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
            backdrop-filter: blur(12px);
            color: #111827;
            font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
          }

          .deploy-top-actions a,
          .deploy-top-actions span {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 26px;
            border-radius: 999px;
            color: inherit;
            font-size: 13px;
            font-weight: 700;
            line-height: 1;
            text-decoration: none;
            white-space: nowrap;
          }

          .deploy-top-actions__label {
            padding: 0 8px 0 0;
            color: #475467;
            font-size: 12px !important;
            font-weight: 800 !important;
            letter-spacing: 0.02em;
            text-transform: uppercase;
          }

          .deploy-top-actions__link {
            gap: 6px;
            padding: 0 9px;
            transition: background 140ms ease, color 140ms ease;
          }

          .deploy-top-actions__link:hover {
            background: #eef2f7;
            color: #0f172a;
          }

          .deploy-top-actions__icon {
            width: 28px;
            padding: 0;
          }

          .deploy-top-actions svg {
            width: 16px;
            height: 16px;
            fill: none;
            stroke: currentColor;
            stroke-width: 2.2;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          @media (max-width: 760px) {
            .deploy-top-actions {
              right: 8px;
              gap: 4px;
            }

            .deploy-top-actions__label {
              display: none !important;
            }

            .deploy-top-actions__link {
              padding: 0 7px;
              font-size: 12px;
            }
          }

          .stApp > header,
          [data-testid="stHeader"] {
            height: 0 !important;
            min-height: 0 !important;
            background: transparent !important;
            pointer-events: none !important;
            visibility: hidden !important;
          }

          header,
          footer,
          [data-testid="stToolbar"],
          [data-testid="stToolbarActions"],
          [data-testid="stDecoration"],
          [data-testid="stStatusWidget"],
          [data-testid="stMainMenu"] {
            display: none !important;
            height: 0 !important;
            min-height: 0 !important;
            visibility: hidden !important;
          }

          iframe {
            display: block;
            border: 0;
          }
        </style>
        <div class="deploy-top-actions" aria-label="Project actions">
          <span class="deploy-top-actions__label">VAST MC1</span>
          <a class="deploy-top-actions__link" href="https://github.com/hrq3871/Vast2021challenge1forvis" target="_blank" rel="noreferrer">
            Share
          </a>
          <a class="deploy-top-actions__link deploy-top-actions__icon" href="https://github.com/hrq3871/Vast2021challenge1forvis" target="_blank" rel="noreferrer" aria-label="Open GitHub repository">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1.2-3.7c4 0 8.2-2 8.2-8.6A6.7 6.7 0 0 0 20.1 1S18.6.5 15 2.8a16.4 16.4 0 0 0-6 0C5.4.5 3.9 1 3.9 1A6.7 6.7 0 0 0 2 5.7c0 6.6 4.2 8.6 8.2 8.6A4.8 4.8 0 0 0 9 18v4"></path>
              <path d="M9 18c-4.5 2-5-2-7-2"></path>
            </svg>
          </a>
          <span class="deploy-top-actions__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </span>
        </div>
        """,
        unsafe_allow_html=True,
    )


def main() -> None:
    st.set_page_config(
        page_title="VAST 2021 MC1 Task 3 Relationship Workbench",
        page_icon="V",
        layout="wide",
        initial_sidebar_state="collapsed",
    )
    render_streamlit_shell()

    try:
        components.html(load_frontend_html(), height=APP_HEIGHT, scrolling=True)
    except FileNotFoundError as error:
        st.error(str(error))
        st.code("npm install\nnpm run build\nstreamlit run streamlit_app.py", language="bash")


if __name__ == "__main__":
    main()
