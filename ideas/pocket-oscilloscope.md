---
title: Pocket oscilloscope
summary: ESP32 and a phone screen working as a scope.
tags: [ELE, Hardware]
status: seed
---

## Why this is interesting

A cheap scope for low-frequency signals, with a phone as the display, covers most of what lab practice needs at home.

## Scope

- ESP32 samples an analog input
- Streams readings over Wi-Fi to a web page
- Page draws the waveform with a trigger and time scale

## Roadmap

- [ ] Read the ADC and print values
- [ ] Stream to a web page
- [ ] Trigger and time-per-division controls
- [ ] Input protection and divider
