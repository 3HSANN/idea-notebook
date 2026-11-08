# Idea Notebook

A website that looks like a retro desktop. Your project ideas and UI screenshots live in two folders on the desktop. Double-click a folder to open it in a window, double-click an idea to read it, double-click a screenshot to view it. On a phone, a single tap opens things and windows fill the screen.

Everything is a file in this repo, and GitHub rebuilds the site on every push.

- **Ideas** folder: one Markdown file per idea in `ideas/`. Each idea shows its status and roadmap progress. The folder window has search and tag filters.
- **UI Inspiration** folder: images in `ui/`, shown as thumbnails with search and tag filters. Opening one shows the full image with your notes.

## Add an idea

1. Copy `ideas/_template.md` to `ideas/my-idea.md`
2. Fill in the title, summary, tags and status, then write the sections
3. Tick roadmap steps as you go by changing `- [ ]` to `- [x]`
4. Commit and push

## Add UI screenshots

Uploading happens through GitHub, since the site itself is static:

1. Open the repo on github.com (the phone browser works too)
2. Go into the `ui` folder, then Add file, then Upload files
3. Drop in your screenshots and commit

The site updates in about a minute. The file name becomes the title.

To add notes, tags or a source link to a screenshot, put a Markdown file with the same name beside it. For `login-screen.png`, create `login-screen.md`:

```
---
title: Login screen
tags: [Auth, Forms]
source: https://example.com/where-i-found-it
---
The password field shows its rules before you type, not after you fail.
```

## Put it online (GitHub Pages)

1. Open Settings, then Pages, and set Source to **GitHub Actions**
2. Open the Actions tab, pick "Deploy site", and run it (it also runs on every push)
3. The site appears at `https://3hsann.github.io/idea-notebook`

Free accounts need a public repository for Pages.

## Run it locally

```
pip install markdown
python build.py
python -m http.server --directory dist 8000
```

Then open http://localhost:8000.

## Settings

- Site name: change `SITE_NAME` at the top of `build.py`
- Wallpaper: replace `static/wallpaper.jpg` with any image
- Idea front matter: `title`, `summary`, `tags: [A, B]`, `status` (`seed`, `planned`, `building`, `done`)
- Screenshot front matter: `title`, `tags`, `source` (a link)
- Files starting with `_` are ignored

## Links to a window

The address updates as you open things, so you can share a link that opens straight to one window: `#ideas`, `#ui`, `#idea/<file-name-without-.md>` or `#shot/<image-file-name>`.
