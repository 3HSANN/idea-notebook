# Idea Notebook

A plain website for project ideas, plus a gallery of UI screenshots you like. Everything is a file in this repo, and GitHub rebuilds the site on every push.

- **Ideas**: one Markdown file per idea in `ideas/`. The home page lists them with search, tag filters, a status label and a roadmap progress bar. Each idea gets its own page.
- **UI inspiration**: images in `ui/`. The gallery page shows them in a grid, with tag filters, search and a full-size viewer.

## Add an idea

1. Copy `ideas/_template.md` to `ideas/my-idea.md`
2. Fill in the title, summary, tags and status, then write the sections
3. Tick roadmap steps as you go by changing `- [ ]` to `- [x]`
4. Commit and push

The eight ideas that come with the repo are samples. Delete or replace them.

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

1. Create a repository on GitHub and push this folder to the `main` branch
2. Open Settings, then Pages, and set Source to **GitHub Actions**
3. Push any change, or run "Deploy site" from the Actions tab
4. The site appears at `https://<your-username>.github.io/<repo-name>/`

Free accounts need a public repository for Pages. If you want the ideas private, keep the repo private and run the site locally instead.

## Run it locally

```
pip install markdown
python build.py
python -m http.server --directory dist 8000
```

Then open http://localhost:8000.

## Settings

- Site name: change `SITE_NAME` at the top of `build.py`
- Idea front matter: `title`, `summary`, `tags: [A, B]`, `status` (`seed`, `planned`, `building`, `done`)
- Screenshot front matter: `title`, `tags`, `source` (a link)
- Files starting with `_` are ignored
