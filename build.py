#!/usr/bin/env python3
"""Build the site from Markdown ideas and UI screenshots.

    ideas/*.md      one file per idea (front matter + Markdown body)
    ui/*.png|jpg..  screenshots of UI designs you like
    ui/<name>.md    optional notes for the screenshot with the same name

Usage:  python build.py        (needs: pip install markdown)
Output: dist/
"""
import html
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

esc = html.escape


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
    out = markdown.markdown(body, extensions=["fenced_code", "tables"])
    out = out.replace("<li>[ ]", '<li class="task"><input type="checkbox" disabled>')
    out = re.sub(r"<li>\[[xX]\]", '<li class="task done"><input type="checkbox" checked disabled>', out)
    return out


def title_from(stem: str) -> str:
    return re.sub(r"[-_]+", " ", stem).strip().title()


def tag_pills(tags):
    return "".join('<span class="tag">{}</span>'.format(esc(t)) for t in tags)


def tag_key(tags):
    return "|".join(t.lower() for t in tags)


def chip_row(all_tags):
    """Filter chips, most used tags first."""
    counts, names = {}, {}
    for tags in all_tags:
        for t in tags:
            counts[t.lower()] = counts.get(t.lower(), 0) + 1
            names.setdefault(t.lower(), t)
    if not counts:
        return ""
    order = sorted(counts, key=lambda k: (-counts[k], k))
    chips = ['<button type="button" class="chip on" data-tag="">All</button>']
    chips += ['<button type="button" class="chip" data-tag="{}">{}</button>'.format(esc(k), esc(names[k])) for k in order]
    return '<div class="chips" role="group" aria-label="Filter by tag">' + "".join(chips) + "</div>"


def progress(body: str):
    done = len(re.findall(r"^\s*[-*] \[[xX]\]", body, re.M))
    todo = len(re.findall(r"^\s*[-*] \[ \]", body, re.M))
    return done, done + todo


def page(title, root, active, content):
    tpl = (TEMPLATES / "base.html").read_text(encoding="utf-8")
    full_title = SITE_NAME if title is None else f"{title} | {SITE_NAME}"
    return (
        tpl.replace("__TITLE__", esc(full_title))
        .replace("__ROOT__", root)
        .replace("__SITE__", esc(SITE_NAME))
        .replace("__CUR_IDEAS__", ' aria-current="page"' if active == "ideas" else "")
        .replace("__CUR_UI__", ' aria-current="page"' if active == "ui" else "")
        .replace("__CONTENT__", content)
    )


def build_ideas():
    files = sorted(p for p in IDEAS_DIR.glob("*.md") if not p.name.startswith("_"))
    cards, all_tags = [], []
    for path in files:
        meta, body = parse(path)
        slug = path.stem
        title = meta.get("title") or title_from(slug)
        summary = meta.get("summary", "")
        tags = parse_tags(meta.get("tags", ""))
        status = meta.get("status", "seed").lower()
        done, total = progress(body)
        all_tags.append(tags)

        prog_html = ""
        if total:
            pct = round(100 * done / total)
            prog_html = (
                '<div class="progress" title="{d} of {t} roadmap steps done">'
                '<div class="bar"><span style="width:{p}%"></span></div><span class="count">{d}/{t}</span></div>'
            ).format(d=done, t=total, p=pct)

        cards.append(
            '<article class="item card" data-tags="{tk}" data-text="{tx}">'
            '<a class="card-link" href="ideas/{slug}.html">'
            '<span class="status s-{st}">{st}</span>'
            "<h3>{title}</h3><p>{summary}</p>"
            '<div class="tags">{pills}</div>{prog}</a></article>'.format(
                tk=esc(tag_key(tags)),
                tx=esc((title + " " + summary + " " + " ".join(tags)).lower()),
                slug=esc(slug), st=esc(status), title=esc(title), summary=esc(summary),
                pills=tag_pills(tags), prog=prog_html,
            )
        )

        status_html = '<span class="status s-{0}">{0}</span>'.format(esc(status))
        prog_line = ""
        if total:
            prog_line = '<span class="meta-prog">{} of {} roadmap steps done</span>'.format(done, total)
        content = (
            '<article class="prose idea">'
            '<a class="back" href="../index.html">All ideas</a>'
            "<h1>{title}</h1>"
            '<div class="meta">{status}{pills}{prog}</div>{body}</article>'
        ).format(title=esc(title), status=status_html, pills=tag_pills(tags), prog=prog_line, body=render_md(body))
        out = DIST / "ideas" / f"{slug}.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(page(title, "../", "ideas", content), encoding="utf-8")

    if cards:
        listing = (
            '<div class="tools"><label class="sr" for="q">Search ideas</label>'
            '<input id="q" type="search" placeholder="Search ideas" autocomplete="off">{chips}</div>'
            '<div class="grid" id="list">{cards}</div>'
            '<p class="empty" id="empty" hidden>No ideas match that search.</p>'
        ).format(chips=chip_row(all_tags), cards="".join(cards))
    else:
        listing = '<p class="empty">No ideas yet. Add a Markdown file to the <code>ideas</code> folder.</p>'

    content = (
        '<section class="intro"><h1>Project ideas</h1>'
        "<p>{n} ideas, each with a scope and a roadmap. Search, or filter by tag.</p></section>{listing}"
    ).format(n=len(cards), listing=listing)
    (DIST / "index.html").write_text(page(None, "", "ideas", content), encoding="utf-8")
    return len(cards)


def build_ui():
    (DIST / "ui").mkdir(parents=True, exist_ok=True)
    images = sorted(p for p in UI_DIR.iterdir() if p.is_file() and p.suffix.lower() in IMAGE_EXT and not p.name.startswith("_"))
    shots, all_tags = [], []
    for img in images:
        shutil.copy2(img, DIST / "ui" / img.name)
        side = UI_DIR / (img.stem + ".md")
        meta, body = parse(side) if side.exists() else ({}, "")
        title = meta.get("title") or title_from(img.stem)
        tags = parse_tags(meta.get("tags", ""))
        all_tags.append(tags)
        source = meta.get("source", "")
        source_attr = esc(source, quote=True) if re.match(r"^https?://", source) else ""
        shots.append(
            '<figure class="item shot" data-tags="{tk}" data-text="{tx}">'
            '<button type="button" class="shot-btn" aria-label="Open {title}">'
            '<img src="ui/{src}" alt="{title}" loading="lazy"></button>'
            '<figcaption><strong>{title}</strong><div class="tags">{pills}</div></figcaption>'
            '<div class="shot-detail" hidden data-source="{source}">{notes}</div></figure>'.format(
                tk=esc(tag_key(tags)),
                tx=esc((title + " " + " ".join(tags) + " " + body).lower()),
                title=esc(title), src=quote(img.name), pills=tag_pills(tags),
                source=source_attr, notes=render_md(body) if body.strip() else "",
            )
        )

    if shots:
        gallery = (
            '<div class="tools"><label class="sr" for="q">Search screenshots</label>'
            '<input id="q" type="search" placeholder="Search screenshots" autocomplete="off">{chips}</div>'
            '<div class="gallery" id="list">{shots}</div>'
            '<p class="empty" id="empty" hidden>No screenshots match that search.</p>'
            '<dialog id="lb" aria-labelledby="lb-title"><form method="dialog"><button class="close" aria-label="Close">&times;</button></form>'
            '<div class="lb-body"><img id="lb-img" alt=""><div class="lb-side"><h2 id="lb-title"></h2>'
            '<div id="lb-tags" class="tags"></div><div id="lb-notes" class="prose"></div>'
            '<a id="lb-src" hidden target="_blank" rel="noopener noreferrer">Open the source</a></div></div></dialog>'
        ).format(chips=chip_row(all_tags), shots="".join(shots))
    else:
        gallery = (
            '<p class="empty">No screenshots yet. Add images to the <code>ui</code> folder and push. '
            "See the README for the quick way to do it from your phone.</p>"
        )

    content = (
        '<section class="intro"><h1>UI inspiration</h1>'
        "<p>Screenshots of interfaces I like, with notes on what works. {n} saved.</p></section>{gallery}"
    ).format(n=len(shots), gallery=gallery)
    (DIST / "ui.html").write_text(page("UI inspiration", "", "ui", content), encoding="utf-8")
    return len(shots)


def main():
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)
    for f in STATIC.iterdir():
        if f.is_file():
            shutil.copy2(f, DIST / f.name)
    n_ideas = build_ideas()
    n_ui = build_ui()
    print(f"Built {n_ideas} ideas and {n_ui} UI screenshots into {DIST}")


if __name__ == "__main__":
    main()
