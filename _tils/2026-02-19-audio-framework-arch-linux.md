---
layout: post
title: "Fix Audio on Framework Laptop (Arch Linux)"
date: 2026-02-19 10:00:00 0000
permalink: /guides/audio-framework-arch-linux
tags: 
    - linux
    - arch
    - framework
description: "How to fix audio on a Framework laptop on Arch Linux"
---

Audio issues on modern Arch/Framework setups (defaulting to PipeWire) often occur because the sound server assigns the wrong profile (e.g., "Pro Audio" or "Off") instead of the standard HiFi/Analog Stereo profile.

### Prerequisites

Ensure packages are installed and WirePlumber is running:
```bash
sudo pacman -S pipewire pipewire-pulse pipewire-alsa wireplumber pavucontrol
systemctl --user enable --now wireplumber.service
```

### Method 1: UI (pavucontrol)

1.  Run `pavucontrol`.
2.  Go to **Configuration** tab.

![pavucontrol](/assets/imgs/pavucontrol.png)

3.  Change Profile to **Play HiFi quality Music (Mic1, Mic2, Speaker)
4.  Check **Output Devices** and **Playback** tabs to ensure each app is playing through the right output

### Method 2: Terminal (pactl)

**1. Find your card name:**
```bash
pactl list cards short
# Look for something like: alsa_card.pci-0000_00_1f.3
```

**2. Set the correct profile:**
```bash
pactl set-card-profile alsa_card.pci-0000_00_1f.3 output:analog-stereo+input:analog-stereo
```

**3. Unmute (if needed):**
```bash
pactl set-sink-mute @DEFAULT_SINK@ 0
```


















