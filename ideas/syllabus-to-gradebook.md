---
title: Syllabus to gradebook
summary: Read a syllabus PDF and build the grade tracker table for me.
tags: [AI, Tools]
status: planned
---

## Why this is interesting

Every course syllabus lists the same things in a different layout: assessment names, weights, dates. Setting up a grade tracker by hand each semester is repetitive.

## Scope

- Upload a syllabus PDF
- Extract assessments, weights and due dates
- Produce a table where you type scores and see your running grade

## Stack

- Python, a PDF text extractor, an LLM call for the messy layouts
- A simple web or spreadsheet front end

## Roadmap

- [ ] Hand-parse one syllabus into the table format
- [ ] Automate extraction for text PDFs
- [ ] Handle weights like "best 3 of 4 quizzes"
- [ ] Export to a spreadsheet
