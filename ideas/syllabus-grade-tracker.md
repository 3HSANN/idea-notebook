---
title: PDF syllabus parser for grade tracking
summary: Upload a course syllabus PDF and get a grade-tracking table set up for you automatically.
tags: [AI, Tools]
status: planned
---

## The idea

Every course syllabus has a grading breakdown buried in it: quizzes, assignments, midterm, final, each with a weight. Setting up a grade tracker by hand at the start of every semester is repetitive. This tool reads the syllabus PDF, finds the grading breakdown, and builds the tracking table for you.

## How it works

1. You upload a syllabus PDF.
2. The parser finds the grading section and pulls out each category and its weight.
3. It builds a table with one row per graded item: name, category, weight, your score.
4. You type in scores as you get them and the table shows your current grade.

## Scope

- In: text-based PDFs, weights given as percentages, categories like quizzes, labs, midterm and final
- Later: rules such as "best 3 of 4 quizzes" or "lowest grade dropped", and scanned PDFs
- Out for now: pulling grades from the university portal

## Open questions

- How different are syllabus layouts across my own courses? Collect a handful first.
- Is a rules-based parser enough, or does it need a language model for messy layouts?
- Where does the table live: a web page, a spreadsheet export, or both?

## Roadmap

- [ ] Collect five or more real syllabi and note where the grading section sits in each
- [ ] Extract the text and find the grading breakdown
- [ ] Turn the breakdown into categories and weights
- [ ] Generate the grade table and calculate the running grade
- [ ] Handle drop-lowest and best-of rules
- [ ] Export to a spreadsheet
