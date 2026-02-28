---
layout: post
title: "Fast Lightweight Photo Culling and Editing on Linux"
date: 2026-02-28 13:21:26 +0000
tags: 
    - linux
    - photography
description: "A highly efficient, no-nonsense workflow for culling and editing RAW photos on Linux without heavy software."
---

If you're looking for a highly efficient, no-nonsense photography workflow without getting bogged down by the steep learning curves of heavy software like Darktable or RawTherapee, Linux has some fantastic, fast, and lightweight tools.


### Step 1: Blazing Fast Culling with Geeqie


**Geeqie** is notoriously fast as it loads the embedded JPEG in your RAW files, meaning you can flip through huge DSLR files instantly.

#### The Workflow
Instead of complicated rating systems, keep things simple:
1. Open up a directory of raw photos in Geeqie.
2. Rapidly go through them: use `SPACE` to go to the next photo, and `BACKSPACE` to go to the previous photo.
3. If you like a photo, press `1` or `2` to toggle a "mark" (marks are essentially tags in Geeqie).
4. Once you're done going through the album, press `Shift + 1` or `Shift + 2` to select all of your marked photos.
5. Right-click the selected photos and move them to a new, custom directory.
6. Once the good photos are gone, simply delete the original directory containing all your non-marked (discarded) files to free up space.

*(Installation on Arch Linux: `sudo pacman -S geeqie`)*

### Step 2: Simple Editing & Exporting with Shotwell

You want basic sliders (contrast, saturation, shadows, highlights) without a dashboard that looks like an airplane cockpit.

**Shotwell** is essentially the Linux equivalent of Apple Photos. It handles RAW files natively and has a dedicated "Enhance" feature, plus very simple sliders for Exposure, Contrast, Tint, Temperature, and Saturation.

#### The Workflow
1. Drag the "accepted" folder of pulled photos from your Geeqie directory directly into Shotwell.
2. Make your quick edits - they are non-destructive, and you can rapidly cycle through images.
3. Once the photo is looking how you want, just hit `File > Export` to push it out as a JPEG or PNG at whatever quality/size you need.

*(Installation on Arch Linux: `sudo pacman -S shotwell`)*
