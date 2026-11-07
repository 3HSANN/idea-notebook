---
title: Personal handwriting OCR
summary: Fine-tune a model on your own handwriting so it learns to read it, and make it simple enough that anyone can do the same.
tags: [ML, AI]
status: seed
---

## The idea

General OCR struggles with real handwriting, and the harder your handwriting is to read, the worse it does. This project trains a model on your own handwriting so it adapts to the way you write. You feed it samples of your writing, it is fine-tuned on them, and it gets better at reading you specifically.

The most important part: **anyone should be able to do this**. It should not take machine learning knowledge. A person with a phone and some pages of their own writing should be able to end up with a model tuned to their hand.

## How it works

1. **Collect.** The app gives you short passages to copy out by hand. You photograph or scan the pages.
2. **Prepare.** Pages are split into lines and each line is paired with the text you were copying, so the labels come for free.
3. **Fine-tune.** A pretrained handwriting recognition model is adapted using your lines.
4. **Check.** The model is tested on lines it has not seen, and the app shows how much it improved.
5. **Use.** Scan new handwritten pages and get text back.

## Scope

- In: one person, one model, trained on that person's own samples
- In: a guided flow with no code and plain-language steps
- In: showing a before and after accuracy number so the improvement is visible
- Later: handwritten notes with diagrams or math, and several people sharing one app
- Out for now: reading handwriting the model was never trained on, or other languages

## Open questions

- How many pages of samples are needed before the improvement is clear?
- Can the training run on a laptop or phone, or does it need a cloud GPU?
- Which pretrained model is the best starting point, and does a light fine-tuning method work with so little data?
- Privacy: can everything stay on the user's own device so the handwriting never leaves it?

## Roadmap

- [ ] Write out a first set of my own samples and label them by hand
- [ ] Measure how well a ready-made handwriting model reads them (the baseline)
- [ ] Fine-tune on my samples and compare against the baseline
- [ ] Find how few samples are enough
- [ ] Automate line splitting and labelling from a photographed page
- [ ] Build the guided flow so a non-technical person can run it
- [ ] Let people download their trained model
