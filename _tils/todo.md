

Option 1: The Command Line Way (pw-dump + ffmpeg)

If you want to stick to the terminal, you can use FFmpeg to grab the monitor stream of your output. This is the most direct equivalent to what you'd do with parec.

    Identify your monitor source:
    Bash

    pactl list short sources

    Look for a line ending in .monitor. It usually looks something like alsa_output.pci-0000_00_1f.3.analog-stereo.monitor.

    Record and convert on the fly:
    Replace YOUR_SOURCE_HERE with the name you found above:
    Bash

    ffmpeg -f pulse -i YOUR_SOURCE_HERE -t 00:03:00 -acodec libmp3lame -ab 320k output_song.mp3

        -t 00:03:00: Stops recording automatically after 3 minutes.

        -ab 320k: Sets a high-quality bitrate.

Option 2: The GUI Way (Audio Reloader / Helvum)

If you find the terminal routing a bit tedious, you can use a patchbay to "wire" Firefox's output directly into a recording app.

    Install a Patchbay: Use helvum or qpwgraph.

    Install a Recorder: Use audacity or gnome-sound-recorder.

The Workflow:

    Open Helvum.

    Start playing the song in Firefox.

    Open your recording software and hit record.

    In Helvum, click and drag a line from the Firefox output nodes to the input nodes of your recording software. This captures the digital stream perfectly without picking up your microphone.

Option 3: The "Set and Forget" App (Easy)

If you just want this done without messing with nodes or long strings of commands, install Audacity.

    Open Audacity.

    Set the Host to ALSA or PulseAudio.

    Set the Recording Device to pipewire or the "Monitor" of your speakers.

    Hit Record, play the song, and then go to File > Export > Export as MP3.

A Quick Tip on Arch Packages

Make sure you have the necessary codecs installed to save as MP3, otherwise FFmpeg or Audacity might complain:
Bash

sudo pacman -S ffmpeg libmp3lame












