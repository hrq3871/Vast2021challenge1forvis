from __future__ import annotations

import json
import re
from pathlib import Path

import streamlit as st
import streamlit.components.v1 as components


ROOT = Path(__file__).parent
DIST_DIR = ROOT / "dist"
DATA_DIR = ROOT / "public" / "data"


@st.cache_data(show_spinner=False)
def load_frontend_html() -> str:
    index_path = DIST_DIR / "index.html"
    if not index_path.exists():
        raise FileNotFoundError("dist/index.html is missing. Run `npm run build` before launching Streamlit.")

    html = index_path.read_text(encoding="utf-8")
    html = inline_stylesheets(html)
    html = html.replace('<script type="module"', f"{data_fetch_bridge()}\n    <script type=\"module\"", 1)
    html = inline_module_scripts(html)
    return html


@st.cache_data(show_spinner=False)
def load_data_files() -> dict[str, object]:
    if not DATA_DIR.exists():
        raise FileNotFoundError("public/data is missing. The visualization needs the generated JSON data files.")

    return {
        path.name: json.loads(path.read_text(encoding="utf-8-sig"))
        for path in sorted(DATA_DIR.glob("*.json"))
    }


def read_dist_asset(asset_url: str) -> str:
    asset_path = DIST_DIR / asset_url.lstrip("/")
    if not asset_path.exists() or not asset_path.is_file():
        raise FileNotFoundError(f"Unable to find built asset: {asset_url}")
    return asset_path.read_text(encoding="utf-8")


def inline_stylesheets(html: str) -> str:
    pattern = re.compile(r'<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>')

    def replace(match: re.Match[str]) -> str:
        css = read_dist_asset(match.group(1))
        return f"<style>\n{css}\n</style>"

    return pattern.sub(replace, html)


def inline_module_scripts(html: str) -> str:
    pattern = re.compile(r'<script type="module"[^>]*src="([^"]+)"></script>')

    def replace(match: re.Match[str]) -> str:
        js = read_dist_asset(match.group(1)).replace("</script", "<\\/script")
        return f'<script type="module">\n{js}\n</script>'

    return pattern.sub(replace, html)


def data_fetch_bridge() -> str:
    data_json = json.dumps(load_data_files(), ensure_ascii=False)
    return f"""
    <script>
      window.__TASK3_DATA__ = {data_json};
      const __task3NativeFetch = window.fetch.bind(window);
      window.fetch = (input, init) => {{
        const raw = typeof input === 'string' ? input : input?.url;
        const path = String(raw || '').replace(/^https?:\\/\\/[^/]+/, '');
        const normalized = path.split('?')[0].split('#')[0].replace(/\\\\/g, '/');
        const key = normalized.split('/').pop();
        const isDataRequest = normalized.includes('/data/') || normalized.startsWith('./data/') || normalized.startsWith('data/');

        if (isDataRequest && Object.prototype.hasOwnProperty.call(window.__TASK3_DATA__, key)) {{
          return Promise.resolve(new Response(JSON.stringify(window.__TASK3_DATA__[key]), {{
            status: 200,
            headers: {{ 'Content-Type': 'application/json' }}
          }}));
        }}

        return __task3NativeFetch(input, init);
      }};
    </script>
    """


def main() -> None:
    st.set_page_config(
        page_title="VAST 2021 MC1 Task 3 Relationship Workbench",
        page_icon="V",
        layout="wide",
        initial_sidebar_state="collapsed",
    )

    st.markdown(
        """
        <style>
          .block-container {
            padding: 0;
            max-width: none;
          }

          header,
          footer,
          [data-testid="stToolbar"],
          [data-testid="stDecoration"] {
            display: none;
          }
        </style>
        """,
        unsafe_allow_html=True,
    )

    try:
        html = load_frontend_html()
    except FileNotFoundError as error:
        st.error(str(error))
        st.code("npm install\nnpm run build\nstreamlit run streamlit_app.py", language="bash")
        return

    components.html(html, height=980, scrolling=True)


if __name__ == "__main__":
    main()
