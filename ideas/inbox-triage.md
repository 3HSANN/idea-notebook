---
title: Inbox triage
summary: Sort my email by what needs a reply today.
tags: [ML, AI]
status: seed
---

## Why this is interesting

Most email needs no action. A model that ranks messages by "needs a reply" would cut the daily scan to a few minutes.

## Scope

- Label a few hundred of my own emails by hand
- Train or prompt a classifier: reply today, reply later, no action
- Show a short ranked list

## Roadmap

- [ ] Export and label a small sample
- [ ] Baseline with simple text features
- [ ] Compare against an LLM prompt
- [ ] Daily digest
