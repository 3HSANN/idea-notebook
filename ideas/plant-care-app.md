---
title: Plant care app
summary: Take a photo of a plant, identify it, get a watering routine and weekly reminders. Bonus: turn the photo into a 3D model you can view.
tags: [ML, AI, Mobile]
status: seed
---

## The idea

Most people lose plants because they do not know what the plant is or how often to water it. This app lets you take a picture of a plant, works out what it is, gives you a watering routine for it, and reminds you every week.

The bonus feature is turning the picture into a 3D render of the plant that you can rotate and look at.

## How it works

1. **Photo.** You take a picture of your plant with the phone camera.
2. **Identify.** A model classifies the plant and shows its best guesses. You confirm the right one.
3. **Routine.** The app gives a watering routine for that plant: how often and how much.
4. **Reminders.** You get a reminder each week, or on the schedule the routine calls for.
5. **Bonus: 3D view.** The photo (or several photos) becomes a 3D model you can spin around in the app.

## Scope

- In: photo to plant type, plant type to watering routine, weekly reminders
- Later: a list of all your plants, with watering history and a "watered it" button
- Bonus: the 3D render
- Out for now: diagnosing diseases or pests, and shopping or selling plants

## Open questions

- Which model is the starting point: a pretrained image classifier fine-tuned on a plant dataset, or an existing plant identification service?
- Where does the care information come from? A small hand-written list for 30 common plants may be enough to start.
- Watering depends on more than the species: pot size, light, season. Does the first version ask for these?
- Reminders: local notifications on the phone, or a server that sends them?
- 3D: can a single photo give a decent model, or does the user need to walk around the plant and take many photos?
- Should the model run on the phone or on a server?

## Roadmap

- [ ] Collect a plant photo dataset and pick a model
- [ ] Get plant identification working on test photos
- [ ] Write the care data for the first 30 plants
- [ ] Show the watering routine for the identified plant
- [ ] Weekly reminders
- [ ] Phone app with the camera screen
- [ ] My plants list with watering history
- [ ] Bonus: try 3D from several photos, then from one
