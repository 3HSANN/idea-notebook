---
title: Traffic spike spotter
summary: Flag odd spikes in network logs before they page anyone.
tags: [ML, Telecom]
status: seed
---

## Why this is interesting

Fixed thresholds fire too often or too late. A model of normal traffic by hour and day can flag what is actually unusual.

## Scope

- Take a time series of traffic counts
- Learn a baseline per hour of week
- Flag points far from the baseline and explain why

## Roadmap

- [ ] Find or generate a sample log
- [ ] Rolling mean and deviation baseline
- [ ] Try an isolation forest
- [ ] Small dashboard
