from __future__ import annotations

import csv
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Any
from xml.etree import ElementTree as ET
from zipfile import ZipFile

import openpyxl

PROJECT_ROOT = Path(r"D:\HKUST\5005 Data visualization\project-vast2021")
WORKSPACE_ROOT = PROJECT_ROOT / "MC1"
RAW_DATA_ROOT = WORKSPACE_ROOT / "MC1"
CODE_ROOT = WORKSPACE_ROOT / "code"
DATA_OUT = CODE_ROOT / "public" / "data"

EMPLOYEE_FILE = RAW_DATA_ROOT / "EmployeeRecords.xlsx"
EMAIL_FILE = RAW_DATA_ROOT / "email headers.csv"
HISTORICAL_ROOT = RAW_DATA_ROOT / "HistoricalDocuments"
NEWS_ROOT = RAW_DATA_ROOT / "News Articles"


def iso_date(value: Any) -> str | None:
    if value is None or value == "":
        return None
    if isinstance(value, datetime):
        return value.date().isoformat()
    return str(value)


def slug(value: str) -> str:
    cleaned = re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_")
    return cleaned or "unknown"


def read_text(path: Path, encoding: str = "utf-8") -> str:
    return path.read_text(encoding=encoding, errors="replace")


def read_docx_paragraphs(path: Path) -> list[str]:
    with ZipFile(path) as archive:
        xml = archive.read("word/document.xml")
    root = ET.fromstring(xml)
    namespace = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
    paragraphs: list[str] = []
    for paragraph in root.iter(f"{namespace}p"):
        text = "".join(node.text or "" for node in paragraph.iter(f"{namespace}t")).strip()
        if text:
            paragraphs.append(text)
    return paragraphs


def find_paragraph(paragraphs: list[str], *needles: str) -> str:
    lowered = [(paragraph, paragraph.lower()) for paragraph in paragraphs]
    for paragraph, paragraph_lower in lowered:
        if all(needle.lower() in paragraph_lower for needle in needles):
            return paragraph
    for paragraph, paragraph_lower in lowered:
        if any(needle.lower() in paragraph_lower for needle in needles):
            return paragraph
    return paragraphs[0] if paragraphs else ""


def parse_news_article(relative_path: str) -> dict[str, str]:
    path = NEWS_ROOT / relative_path
    text = read_text(path)
    source_match = re.search(r"^SOURCE:\s*(.+)$", text, re.MULTILINE)
    title_match = re.search(r"^TITLE:\s*(.+)$", text, re.MULTILINE)
    published_match = re.search(r"^PUBLISHED:\s*(.+)$", text, re.MULTILINE)
    body = re.split(r"\n\s*LOCATION:", text, maxsplit=1)
    body_text = body[-1] if len(body) > 1 else text
    first_body = " ".join(line.strip() for line in body_text.splitlines() if line.strip())

    return {
        "source": source_match.group(1).strip() if source_match else relative_path.split("/")[0],
        "title": title_match.group(1).strip() if title_match else relative_path,
        "published": published_match.group(1).strip() if published_match else "",
        "snippet": first_body[:420],
        "relativePath": f"News Articles/{relative_path}",
    }


def load_employees() -> list[dict[str, Any]]:
    workbook = openpyxl.load_workbook(EMPLOYEE_FILE, data_only=True)
    sheet = workbook["Employee Records"]
    rows = list(sheet.iter_rows(values_only=True))
    headers = [str(value) for value in rows[0]]
    employees: list[dict[str, Any]] = []

    for row in rows[1:]:
        record = dict(zip(headers, row))
        email = record.get("EmailAddress")
        first_name = record.get("FirstName")
        last_name = record.get("LastName")
        if not email or not first_name or not last_name:
            continue

        employees.append(
            {
                "id": str(email),
                "name": f"{first_name} {last_name}",
                "firstName": first_name,
                "lastName": last_name,
                "birthCountry": record.get("BirthCountry"),
                "citizenshipCountry": record.get("CitizenshipCountry"),
                "department": record.get("CurrentEmploymentType"),
                "title": record.get("CurrentEmploymentTitle"),
                "email": email,
                "employmentStartDate": iso_date(record.get("CurrentEmploymentStartDate")),
                "militaryService": record.get("MilitaryServiceBranch"),
                "militaryDischargeType": record.get("MilitaryDischargeType"),
                "militaryDischargeDate": iso_date(record.get("MilitaryDischargeDate")),
            }
        )

    return employees


def person_id_from_email(email: str) -> str:
    local = email.split("@", 1)[0]
    local = local.replace(" Jr.", "").replace("Jr.", "")
    parts = [part for part in re.split(r"[.\s-]+", local) if part]
    if len(parts) >= 2:
        return f"person_{slug('_'.join(parts[:2]))}"
    return f"person_{slug(local)}"


def person_label_from_email(email: str) -> str:
    local = email.split("@", 1)[0].replace(".", " ")
    local = local.replace(" Jr ", " Jr. ")
    return re.sub(r"\s+", " ", local).strip()


def parse_email_date(value: str) -> str:
    return datetime.strptime(value.strip(), "%m/%d/%Y %H:%M").isoformat(timespec="minutes")


def classify_email_subject(subject: str) -> tuple[str, bool]:
    subject_lower = subject.lower()
    if "arise" in subject_lower:
        return "arise", True
    if "ipo" in subject_lower:
        return "ipo", True
    if "security" in subject_lower or "patrol" in subject_lower:
        return "security", True
    return "routine", False


def load_email_edges() -> list[dict[str, Any]]:
    edges: list[dict[str, Any]] = []
    with EMAIL_FILE.open(encoding="cp1252", newline="") as handle:
        reader = csv.DictReader(handle)
        for row_number, row in enumerate(reader, start=2):
            topic, anomalous = classify_email_subject(row["Subject"])
            if not anomalous:
                continue
            recipients = [recipient.strip() for recipient in row["To"].split(",") if recipient.strip()]
            for recipient in recipients:
                edges.append(
                    {
                        "id": f"email_{row_number}_{slug(row['From'])}_{slug(recipient)}",
                        "source": person_id_from_email(row["From"]),
                        "sourceEmail": row["From"],
                        "sourceLabel": person_label_from_email(row["From"]),
                        "target": person_id_from_email(recipient),
                        "targetEmail": recipient,
                        "targetLabel": person_label_from_email(recipient),
                        "datetime": parse_email_date(row["Date"]),
                        "date": parse_email_date(row["Date"])[:10],
                        "subject": row["Subject"],
                        "topic": topic,
                        "isAnomalous": anomalous,
                        "rowNumber": row_number,
                    }
                )
    return edges


def evidence_item(
    item_id: str,
    title: str,
    source: str,
    snippet: str,
    *,
    date: str,
    confidence: str,
    source_role: str,
    bias_warning: str = "none",
    topics: list[str] | None = None,
) -> dict[str, Any]:
    return {
        "id": item_id,
        "title": title,
        "source": source,
        "date": date,
        "confidence": confidence,
        "sourceRole": source_role,
        "biasWarning": bias_warning,
        "topics": topics or [],
        "snippet": re.sub(r"\s+", " ", snippet).strip()[:620],
    }


def make_node(node_id: str, label: str, node_type: str, group: str, **extra: Any) -> dict[str, Any]:
    return {
        "id": node_id,
        "label": label,
        "type": node_type,
        "group": group,
        **extra,
    }


def make_edge(
    edge_id: str,
    source: str,
    target: str,
    relation: str,
    confidence: str,
    evidence_ids: list[str],
    topics: list[str],
    date: str,
    **extra: Any,
) -> dict[str, Any]:
    return {
        "id": edge_id,
        "source": source,
        "target": target,
        "relation": relation,
        "confidence": confidence,
        "evidenceIds": evidence_ids,
        "topics": topics,
        "date": date,
        **extra,
    }


def build_bundle() -> dict[str, Any]:
    employees = load_employees()
    email_edges = load_email_edges()
    employee_by_name = {employee["name"].lower(): employee for employee in employees}

    doc_5_year = read_docx_paragraphs(HISTORICAL_ROOT / "5 year report clean.docx")
    doc_10_year = read_docx_paragraphs(HISTORICAL_ROOT / "10 year historical document clean.docx")

    news_sanjorge = parse_news_article("International News/689.txt")
    news_leadership = parse_news_article("The Abila Post/713.txt")
    news_partnership = parse_news_article("Kronos Star/174.txt")
    news_ransom = parse_news_article("Modern Rubicon/106.txt")
    news_apa = parse_news_article("World Source/775.txt")
    news_risk = parse_news_article("International Times/167.txt")

    isia_employee = employee_by_name.get("isia vann", {})
    sanjorge_employee = {
        "name": "Sten Sanjorge Jr.",
        "title": "President and CEO",
        "department": "Executive",
        "email": "Sten.Sanjorge Jr.@gastech.com.tethys",
    }

    arise_edges = [edge for edge in email_edges if edge["topic"] == "arise"]
    ipo_edges = [edge for edge in email_edges if edge["topic"] == "ipo"]

    evidence = [
        evidence_item(
            "ev_gastech_government_partnership",
            news_partnership["title"],
            news_partnership["relativePath"],
            news_partnership["snippet"],
            date="2014-01-19",
            confidence="confirmed",
            source_role="news",
            bias_warning="low",
            topics=["government_reception", "official_partnership"],
        ),
        evidence_item(
            "ev_sanjorge_escaped_kidnapping",
            news_sanjorge["title"],
            news_sanjorge["relativePath"],
            news_sanjorge["snippet"],
            date="2014-01-21",
            confidence="confirmed",
            source_role="news",
            bias_warning="low",
            topics=["kidnapping", "sanjorge"],
        ),
        evidence_item(
            "ev_leadership_missing_ipo",
            news_leadership["title"],
            news_leadership["relativePath"],
            news_leadership["snippet"],
            date="2014-01-20",
            confidence="confirmed",
            source_role="news",
            bias_warning="medium",
            topics=["kidnapping", "ipo", "government_reception"],
        ),
        evidence_item(
            "ev_pok_ransom",
            news_ransom["title"],
            news_ransom["relativePath"],
            news_ransom["snippet"],
            date="2014-01-21",
            confidence="probable",
            source_role="news",
            bias_warning="high",
            topics=["kidnapping", "ransom", "pok_motive"],
        ),
        evidence_item(
            "ev_pok_origin_1997",
            "POK grassroots origin and anti-GAStech grievance",
            "HistoricalDocuments/5 year report clean.docx",
            find_paragraph(doc_5_year, "Protectors of Kronos", "contamination", "Tiskele"),
            date="1997-01-01",
            confidence="confirmed",
            source_role="historical_document",
            topics=["pollution", "pok_motive"],
        ),
        evidence_item(
            "ev_pok_founders_waste_pipe",
            "POK founders and GAStech waste discharge discovery",
            "HistoricalDocuments/10 year historical document clean.docx",
            find_paragraph(doc_10_year, "waste discharge pipe", "GAStech"),
            date="1997-01-01",
            confidence="confirmed",
            source_role="historical_document",
            topics=["pollution", "pok_motive"],
        ),
        evidence_item(
            "ev_juliana_vann_death",
            "Juliana Vann becomes a POK rallying symbol",
            "HistoricalDocuments/10 year historical document clean.docx",
            find_paragraph(doc_10_year, "Juliana Vann", "died"),
            date="1998-08-18",
            confidence="confirmed",
            source_role="historical_document",
            topics=["personal_bridge", "pok_motive"],
        ),
        evidence_item(
            "ev_isia_vann_pok_family",
            "Isia Vann family relationship and POK forceful approach",
            "HistoricalDocuments/5 year report clean.docx",
            find_paragraph(doc_5_year, "Isia Vann", "Juliana Vann", "Mandor Vann"),
            date="2009-01-01",
            confidence="confirmed",
            source_role="historical_document",
            topics=["personal_bridge", "pok_motive"],
        ),
        evidence_item(
            "ev_mandor_vann_pok_strategy",
            "Mandor Vann as POK political strategist",
            "HistoricalDocuments/5 year report clean.docx",
            find_paragraph(doc_5_year, "Mandor Vann", "political strategist"),
            date="2009-01-01",
            confidence="confirmed",
            source_role="historical_document",
            topics=["personal_bridge", "pok_motive"],
        ),
        evidence_item(
            "ev_employee_isia_security",
            "Employee record places Isia Vann in GAStech Security",
            "EmployeeRecords.xlsx",
            (
                f"Isia Vann works in {isia_employee.get('department', 'Security')} as "
                f"{isia_employee.get('title', 'Perimeter Control')}; military service: "
                f"{isia_employee.get('militaryService', 'ArmedForcesOfKronos')}."
            ),
            date=isia_employee.get("employmentStartDate") or "2007-01-01",
            confidence="confirmed",
            source_role="employee_record",
            topics=["employment", "personal_bridge", "security"],
        ),
        evidence_item(
            "ev_employee_sanjorge_ceo",
            "Sanjorge identified as GAStech President and CEO",
            news_sanjorge["relativePath"],
            f"{sanjorge_employee['name']} is identified as {sanjorge_employee['title']} in the kidnapping coverage.",
            date="2014-01-21",
            confidence="confirmed",
            source_role="news",
            bias_warning="low",
            topics=["employment", "sanjorge"],
        ),
        evidence_item(
            "ev_apa_arise_publication",
            news_apa["title"],
            news_apa["relativePath"],
            news_apa["snippet"],
            date="2013-10-22",
            confidence="confirmed",
            source_role="news",
            bias_warning="low",
            topics=["apa", "arise"],
        ),
        evidence_item(
            "ev_pok_apa_kidnapping_risk",
            news_risk["title"],
            news_risk["relativePath"],
            news_risk["snippet"],
            date="2014-01-21",
            confidence="probable",
            source_role="news",
            bias_warning="medium",
            topics=["apa", "arise", "kidnapping"],
        ),
        evidence_item(
            "ev_arise_email_forward",
            "ARISE subject spreads into GAStech Security email",
            "email headers.csv",
            "; ".join(
                f"row {edge['rowNumber']}: {edge['sourceLabel']} -> {edge['targetLabel']} at {edge['datetime']}"
                for edge in arise_edges[:9]
            ),
            date="2014-01-13",
            confidence="hypothesis",
            source_role="email_header",
            bias_warning="none",
            topics=["arise", "email_anomaly", "security"],
        ),
        evidence_item(
            "ev_ipo_email_perception",
            "Executive email thread manages IPO perception",
            "email headers.csv",
            "; ".join(
                f"row {edge['rowNumber']}: {edge['sourceLabel']} -> {edge['targetLabel']} at {edge['datetime']}"
                for edge in ipo_edges[:8]
            ),
            date="2014-01-13",
            confidence="probable",
            source_role="email_header",
            bias_warning="none",
            topics=["ipo", "sanjorge"],
        ),
    ]

    nodes = [
        make_node("org_gastech", "GAStech", "organization", "GAStech", importance=1.0),
        make_node("org_government", "Kronos Government", "organization", "Government", importance=0.92),
        make_node("org_pok", "Protectors of Kronos", "organization", "POK", importance=0.94),
        make_node("org_apa", "Asterian People's Army", "organization", "APA", importance=0.72),
        make_node("dept_security", "GAStech Security", "organization", "GAStech", importance=0.72),
        make_node("topic_ipo", "IPO Wealth", "topic", "GAStech", importance=0.66),
        make_node("topic_arise", "Arise Magazine / Subject", "topic", "APA", importance=0.55),
        make_node("topic_government_reception", "Government Reception", "event", "Government", importance=0.75),
        make_node("event_kidnapping", "GAStech Kidnapping", "event", "Conflict", importance=1.0),
        make_node("event_pollution", "Tiskele Water Contamination", "event", "POK", importance=0.88),
        make_node("person_sanjorge", "Sten Sanjorge Jr.", "person", "GAStech", role="President and CEO", importance=0.96),
        make_node("person_isia_vann", "Isia Vann", "person", "GAStech", role="Security / Perimeter Control", importance=0.92),
        make_node("person_juliana_vann", "Juliana Vann", "person", "POK", role="Pollution victim and POK symbol", importance=0.78),
        make_node("person_mandor_vann", "Mandor Vann", "person", "POK", role="POK political strategist", importance=0.78),
        make_node("person_rachel_pantanal", "Rachel Pantanal", "person", "GAStech", role="Assistant to CIO", importance=0.45),
        make_node("person_ruscella_mies_haber", "Ruscella Mies Haber", "person", "GAStech", role="Administration", importance=0.54),
        make_node("person_inga_ferro", "Inga Ferro", "person", "GAStech", role="Security", importance=0.42),
        make_node("person_loreto_bodrogi", "Loreto Bodrogi", "person", "GAStech", role="Security", importance=0.5),
        make_node("person_hennie_osvaldo", "Hennie Osvaldo", "person", "GAStech", role="Security", importance=0.5),
        make_node("person_minke_mies", "Minke Mies", "person", "GAStech", role="Security", importance=0.5),
    ]

    edges = [
        make_edge(
            "edge_gastech_government_partnership",
            "org_gastech",
            "org_government",
            "official_partnership",
            "confirmed",
            ["ev_gastech_government_partnership"],
            ["official_partnership", "government_reception"],
            "2014-01-19",
            narrative="GAStech and Kronos state celebrate a long-running operating partnership.",
        ),
        make_edge(
            "edge_sanjorge_gastech_ceo",
            "person_sanjorge",
            "org_gastech",
            "leadership",
            "confirmed",
            ["ev_employee_sanjorge_ceo"],
            ["employment", "sanjorge"],
            "2014-01-21",
        ),
        make_edge(
            "edge_sanjorge_government_reception",
            "person_sanjorge",
            "topic_government_reception",
            "expected_at_government_reception",
            "confirmed",
            ["ev_sanjorge_escaped_kidnapping", "ev_gastech_government_partnership"],
            ["government_reception", "sanjorge"],
            "2014-01-20",
        ),
        make_edge(
            "edge_sanjorge_ipo_motive",
            "person_sanjorge",
            "topic_ipo",
            "financial_motive_anchor",
            "probable",
            ["ev_leadership_missing_ipo", "ev_ipo_email_perception"],
            ["ipo", "sanjorge"],
            "2014-01-20",
        ),
        make_edge(
            "edge_sanjorge_kidnapping_target",
            "person_sanjorge",
            "event_kidnapping",
            "escaped_kidnapping_target_context",
            "probable",
            ["ev_sanjorge_escaped_kidnapping", "ev_leadership_missing_ipo", "ev_pok_ransom"],
            ["kidnapping", "sanjorge", "ransom"],
            "2014-01-21",
        ),
        make_edge(
            "edge_pok_gastech_conflict",
            "org_pok",
            "org_gastech",
            "conflict",
            "confirmed",
            ["ev_pok_origin_1997", "ev_pok_founders_waste_pipe", "ev_pok_ransom"],
            ["pollution", "pok_motive", "kidnapping"],
            "1997-01-01",
        ),
        make_edge(
            "edge_pok_government_accountability",
            "org_pok",
            "org_government",
            "government_accountability_conflict",
            "confirmed",
            ["ev_pok_origin_1997"],
            ["pok_motive", "official_partnership"],
            "2004-01-01",
        ),
        make_edge(
            "edge_isia_gastech_security",
            "person_isia_vann",
            "dept_security",
            "employment",
            "confirmed",
            ["ev_employee_isia_security"],
            ["employment", "personal_bridge", "security"],
            isia_employee.get("employmentStartDate") or "2007-01-01",
        ),
        make_edge(
            "edge_security_gastech",
            "dept_security",
            "org_gastech",
            "department_membership",
            "confirmed",
            ["ev_employee_isia_security"],
            ["employment", "security"],
            "2007-01-01",
        ),
        make_edge(
            "edge_isia_pok_member",
            "person_isia_vann",
            "org_pok",
            "personal_bridge",
            "confirmed",
            ["ev_isia_vann_pok_family", "ev_employee_isia_security"],
            ["personal_bridge", "pok_motive", "security"],
            "2009-01-01",
        ),
        make_edge(
            "edge_isia_juliana_family",
            "person_isia_vann",
            "person_juliana_vann",
            "sibling",
            "confirmed",
            ["ev_isia_vann_pok_family", "ev_juliana_vann_death"],
            ["personal_bridge", "pok_motive"],
            "1998-08-18",
        ),
        make_edge(
            "edge_isia_mandor_family",
            "person_isia_vann",
            "person_mandor_vann",
            "nephew_uncle",
            "confirmed",
            ["ev_isia_vann_pok_family", "ev_mandor_vann_pok_strategy"],
            ["personal_bridge", "pok_motive"],
            "2009-01-01",
        ),
        make_edge(
            "edge_mandor_pok_strategy",
            "person_mandor_vann",
            "org_pok",
            "political_strategy",
            "confirmed",
            ["ev_mandor_vann_pok_strategy"],
            ["personal_bridge", "pok_motive"],
            "2009-01-01",
        ),
        make_edge(
            "edge_apa_arise_publication",
            "org_apa",
            "topic_arise",
            "publishes_arise",
            "hypothesis",
            ["ev_apa_arise_publication"],
            ["apa", "arise"],
            "2013-10-22",
            narrative="The publication is confirmed, but its relevance to the GAStech kidnapping is only a weak bridge.",
        ),
        make_edge(
            "edge_arise_gastech_security_email",
            "topic_arise",
            "dept_security",
            "email_subject_reaches_security",
            "hypothesis",
            ["ev_arise_email_forward"],
            ["arise", "email_anomaly", "security"],
            "2014-01-13",
        ),
        make_edge(
            "edge_apa_pok_regional_risk",
            "org_apa",
            "org_pok",
            "shared_regional_risk_frame",
            "hypothesis",
            ["ev_pok_apa_kidnapping_risk"],
            ["apa", "arise", "kidnapping", "pok_motive"],
            "2014-01-21",
        ),
    ]

    events = [
        {
            "id": "event_1994_partnership",
            "label": "GAStech-Kronos partnership becomes state economic baseline",
            "date": "1994-01-01",
            "type": "official_partnership",
            "evidenceIds": ["ev_gastech_government_partnership"],
            "nodeIds": ["org_gastech", "org_government"],
        },
        {
            "id": "event_1997_pok_origin",
            "label": "POK forms around Tiskele water contamination",
            "date": "1997-01-01",
            "type": "pollution",
            "evidenceIds": ["ev_pok_origin_1997", "ev_pok_founders_waste_pipe"],
            "nodeIds": ["org_pok", "org_gastech", "event_pollution"],
        },
        {
            "id": "event_1998_juliana",
            "label": "Juliana Vann dies and becomes a POK symbol",
            "date": "1998-08-18",
            "type": "personal_bridge",
            "evidenceIds": ["ev_juliana_vann_death"],
            "nodeIds": ["person_juliana_vann", "org_pok"],
        },
        {
            "id": "event_2009_isia",
            "label": "Isia Vann profile links GAStech Security to POK family history",
            "date": "2009-01-01",
            "type": "personal_bridge",
            "evidenceIds": ["ev_isia_vann_pok_family", "ev_employee_isia_security"],
            "nodeIds": ["person_isia_vann", "org_pok", "dept_security"],
        },
        {
            "id": "event_2014_01_13_arise",
            "label": "ARISE subject spreads into Security email recipients",
            "date": "2014-01-13",
            "type": "email_anomaly",
            "evidenceIds": ["ev_arise_email_forward"],
            "nodeIds": ["topic_arise", "dept_security"],
        },
        {
            "id": "event_2014_01_13_ipo",
            "label": "Executive thread manages perceptions about the IPO",
            "date": "2014-01-13",
            "type": "ipo",
            "evidenceIds": ["ev_ipo_email_perception"],
            "nodeIds": ["person_sanjorge", "topic_ipo"],
        },
        {
            "id": "event_2014_01_19_reception",
            "label": "Government reception announced for GAStech executives",
            "date": "2014-01-19",
            "type": "government_reception",
            "evidenceIds": ["ev_gastech_government_partnership"],
            "nodeIds": ["person_sanjorge", "org_government", "topic_government_reception"],
        },
        {
            "id": "event_2014_01_20_kidnapping",
            "label": "GAStech leadership confirmed missing after meeting",
            "date": "2014-01-20",
            "type": "kidnapping",
            "evidenceIds": ["ev_leadership_missing_ipo"],
            "nodeIds": ["event_kidnapping", "person_sanjorge", "org_gastech"],
        },
        {
            "id": "event_2014_01_21_ransom",
            "label": "POK ransom claim and Sanjorge escape coverage appear",
            "date": "2014-01-21",
            "type": "kidnapping",
            "evidenceIds": ["ev_sanjorge_escaped_kidnapping", "ev_pok_ransom", "ev_pok_apa_kidnapping_risk"],
            "nodeIds": ["event_kidnapping", "person_sanjorge", "org_pok", "org_apa"],
        },
    ]

    hypotheses = [
        {
            "id": "h_sanjorge_target",
            "title": "Sanjorge as target / motive anchor",
            "confidence": "probable",
            "summary": "Sanjorge is a high-value target because he connects GAStech leadership, IPO wealth, and the government reception route on the kidnapping day.",
            "nodeIds": ["person_sanjorge", "org_gastech", "org_government", "topic_ipo", "topic_government_reception", "event_kidnapping", "org_pok"],
            "edgeIds": [
                "edge_sanjorge_gastech_ceo",
                "edge_sanjorge_government_reception",
                "edge_sanjorge_ipo_motive",
                "edge_sanjorge_kidnapping_target",
                "edge_gastech_government_partnership",
                "edge_pok_gastech_conflict",
            ],
            "eventIds": ["event_2014_01_13_ipo", "event_2014_01_19_reception", "event_2014_01_20_kidnapping", "event_2014_01_21_ransom"],
            "evidenceIds": [
                "ev_employee_sanjorge_ceo",
                "ev_sanjorge_escaped_kidnapping",
                "ev_leadership_missing_ipo",
                "ev_gastech_government_partnership",
                "ev_pok_ransom",
                "ev_ipo_email_perception",
            ],
            "walkthrough": [
                "Search kidnapping and open the 2014-01-20/21 timeline events.",
                "Click Sanjorge to highlight CEO, IPO, reception, and kidnapping context.",
                "Compare news and email evidence in the evidence panel.",
            ],
        },
        {
            "id": "h_isia_personal_bridge",
            "title": "Isia Vann as personal bridge",
            "confidence": "confirmed",
            "summary": "Isia Vann is both a GAStech Security employee and a documented POK-linked Vann family member, making him the strongest personal bridge in the data.",
            "nodeIds": ["person_isia_vann", "dept_security", "org_gastech", "org_pok", "person_juliana_vann", "person_mandor_vann", "event_pollution"],
            "edgeIds": [
                "edge_isia_gastech_security",
                "edge_security_gastech",
                "edge_isia_pok_member",
                "edge_isia_juliana_family",
                "edge_isia_mandor_family",
                "edge_mandor_pok_strategy",
                "edge_pok_gastech_conflict",
            ],
            "eventIds": ["event_1997_pok_origin", "event_1998_juliana", "event_2009_isia"],
            "evidenceIds": [
                "ev_employee_isia_security",
                "ev_isia_vann_pok_family",
                "ev_juliana_vann_death",
                "ev_mandor_vann_pok_strategy",
                "ev_pok_origin_1997",
            ],
            "walkthrough": [
                "Open Unofficial Ties and filter Security.",
                "Click Isia Vann to show employment and POK family evidence together.",
                "Use the timeline to move from Juliana Vann to the 2009 Isia profile.",
            ],
        },
        {
            "id": "h_apa_arise_weak_risk",
            "title": "APA / Arise as weak external risk",
            "confidence": "hypothesis",
            "summary": "APA is connected to Arise in news and Arise appears in GAStech email headers, but no source proves APA worked with POK or GAStech insiders.",
            "nodeIds": ["org_apa", "topic_arise", "dept_security", "org_pok", "event_kidnapping", "person_isia_vann"],
            "edgeIds": ["edge_apa_arise_publication", "edge_arise_gastech_security_email", "edge_apa_pok_regional_risk", "edge_isia_gastech_security"],
            "eventIds": ["event_2014_01_13_arise", "event_2014_01_21_ransom"],
            "evidenceIds": ["ev_apa_arise_publication", "ev_arise_email_forward", "ev_pok_apa_kidnapping_risk"],
            "walkthrough": [
                "Open Email Network and switch to ARISE only.",
                "Click the Arise topic and compare its email evidence with APA news.",
                "Keep this path labeled as hypothesis, not confirmed cooperation.",
            ],
        },
    ]

    return {
        "metadata": {
            "generatedAt": datetime.now().isoformat(timespec="seconds"),
            "rawDataRoot": str(RAW_DATA_ROOT),
            "scope": "VAST 2021 MC1 Task 3 only",
        },
        "employees": employees,
        "emailEdges": email_edges,
        "nodes": nodes,
        "edges": edges,
        "events": events,
        "evidence": evidence,
        "hypotheses": hypotheses,
    }


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    bundle = build_bundle()
    DATA_OUT.mkdir(parents=True, exist_ok=True)

    write_json(DATA_OUT / "task3_bundle.json", bundle)
    write_json(DATA_OUT / "employees.json", bundle["employees"])
    write_json(DATA_OUT / "email_edges.json", bundle["emailEdges"])
    write_json(DATA_OUT / "relationship_nodes.json", bundle["nodes"])
    write_json(DATA_OUT / "relationship_edges.json", bundle["edges"])
    write_json(DATA_OUT / "timeline_events.json", bundle["events"])
    write_json(DATA_OUT / "evidence_items.json", bundle["evidence"])
    write_json(DATA_OUT / "hypotheses.json", bundle["hypotheses"])

    print(f"Wrote Task 3 data bundle to {DATA_OUT / 'task3_bundle.json'}")
    print(f"Nodes: {len(bundle['nodes'])}; edges: {len(bundle['edges'])}; evidence: {len(bundle['evidence'])}; email edges: {len(bundle['emailEdges'])}")


if __name__ == "__main__":
    main()
