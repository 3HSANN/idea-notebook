#!/usr/bin/env python3
"""Build the desktop site from Markdown ideas and UI screenshots.

    ideas/*.md      one file per idea (front matter + Markdown body)
    ui/*.png|jpg..  screenshots of UI designs you like
    ui/<name>.md    optional notes for the screenshot with the same name
    static/         wallpaper.jpg, style.css, app.js (copied as-is)

Usage:  python build.py        (needs: pip install markdown)
Output: dist/
"""
import json
import re
import shutil
from pathlib import Path
from urllib.parse import quote

import markdown

SITE_NAME = "Idea Notebook"  # change this to rename the site

ROOT = Path(__file__).parent
IDEAS_DIR = ROOT / "ideas"
UI_DIR = ROOT / "ui"
TEMPLATES = ROOT / "templates"
STATIC = ROOT / "static"
DIST = ROOT / "dist"
IMAGE_EXT = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"}


def parse(path: Path):
    """Return (front matter dict, markdown body). Front matter is simple `key: value` lines."""
    text = path.read_text(encoding="utf-8")
    meta, body = {}, text
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n?(.*)$", text, re.S)
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip().lower()] = v.strip()
        body = m.group(2)
    return meta, body


def parse_tags(raw: str):
    raw = raw.strip().strip("[]")
    return [t.strip().strip("'\"") for t in raw.split(",") if t.strip()]


def render_md(body: str) -> str:
    if not body.strip():
        return ""
    out = markdown.markdown(body, extensions=["fenced_code", "tables"])
    out = out.replace("<li>[ ]", '<li class="task"><input type="checkbox" disabled>')
    out = re.sub(r"<li>\[[xX]\]", '<li class="task done"><input type="checkbox" checked disabled>', out)
    return out


def title_from(stem: str) -> str:
    return re.sub(r"[-_]+", " ", stem).strip().title()


def progress(body: str):
    done = len(re.findall(r"^\s*[-*] \[[xX]\]", body, re.M))
    todo = len(re.findall(r"^\s*[-*] \[ \]", body, re.M))
    return done, done + todo


def collect_ideas():
    ideas = []
    for path in sorted(p for p in IDEAS_DIR.glob("*.md") if not p.name.startswith("_")):
        meta, body = parse(path)
        done, total = progress(body)
        ideas.append({
            "slug": path.stem,
            "title": meta.get("title") or title_from(path.stem),
            "summary": meta.get("summary", ""),
            "tags": parse_tags(meta.get("tags", "")),
            "status": meta.get("status", "seed").lower(),
            "done": done,
            "total": total,
            "html": render_md(body),
        })
    return ideas


def collect_ui():
    (DIST / "ui").mkdir(parents=True, exist_ok=True)
    shots = []
    if not UI_DIR.exists():
        return shots
    images = sorted(
        p for p in UI_DIR.iterdir()
        if p.is_file() and p.suffix.lower() in IMAGE_EXT and not p.name.startswith("_")
    )
    for img in images:
        shutil.copy2(img, DIST / "ui" / img.name)
        side = UI_DIR / (img.stem + ".md")
        meta, body = parse(side) if side.exists() else ({}, "")
        source = meta.get("source", "")
        shots.append({
            "file": img.name,
            "src": "ui/" + quote(img.name),
            "title": meta.get("title") or title_from(img.stem),
            "tags": parse_tags(meta.get("tags", "")),
            "source": source if re.match(r"^https?://", source) else "",
            "html": render_md(body),
        })
    return shots


def main():
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)
    for f in STATIC.iterdir():
        if f.is_file():
            shutil.copy2(f, DIST / f.name)

    data = {"site": SITE_NAME, "ideas": collect_ideas(), "ui": collect_ui()}
    payload = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    page = (TEMPLATES / "desktop.html").read_text(encoding="utf-8")
    page = page.replace("__SITE__", SITE_NAME.replace("&", "&amp;").replace("<", "&lt;")).replace("__DATA__", payload)
    (DIST / "index.html").write_text(page, encoding="utf-8")
    print(f"Built {len(data['ideas'])} ideas and {len(data['ui'])} UI screenshots into {DIST}")


if __name__ == "__main__":
    main()
