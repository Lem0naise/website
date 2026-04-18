---
layout: post
title: "Why is audio on Linux such a headache?"
date: 2026-04-18 08:00:00 +0000
author: Indigo Nolan
permalink: /blog/audio-on-linux
tags: 
    - coding
---

Any Linux user will tell you that audio is a nightmare. While Windows and macOS users have always benefited from unified, vertically integrated audio (CoreAudio, WASAPI), Linux users have to deal with ever distribution managing audio slightly differently, every new laptop requiring a new open-source driver to be acquired, and every year a newcomer on the field coming in who thinks their new sound server is going to fix everything. 

The complexity comes from a fundamental architectural challenge - how do you allow multiple applications to share a single piece of hardware (your sound card) without introducing massive lag or stability issues?

Nowadays, we've reached a relatively stable era with the widespread adoption of PipeWire[^1] in the late 2010s and early 2020s[^2], but to understand where PipeWire came from, we have to look at the gradual revolution which attempted, in various forms of success, to fix the Linux audio problem decades ago. 

[^1]: Pipewire was released in 2018 <https://archive.fosdem.org/2019/schedule/event/pipewire/>
[^2]: In 2023: <https://www.phoronix.com/news/PipeWire-1.0-Released>


## We start with ALSA

At the very bottom of the stack sits ALSA (Advanced Linux Sound Architecture). ALSA is a kernel-level framework which talks directly to the hardware (your sound card). 

In the early days (and still technically nowadays), ALSA followed a strict rule of "one pipe, one process". If your music player was using the audio 'pipe', your web browser was locked out. You wouldn't be able to hear a notification sound if your sound card was occupied with playing you some Radiohead. After various attempted framework-level solutions[^13], collectives of developers began to build a sprawling and fragile scaffolding of pipes on top of ALSA. 

[^13]: While ALSA eventually added a software mixer called `dmix`, it was difficult to configure and lacked the flexibility required for a modern desktop.

## Enter PulseAudio

PulseAudio entered the stage as an ambitious plumber who tried to fix the 'one user' problem[^3]. It acted as a middleman, standing in front of ALSA, accepting audio from every app, mixing it together, and then shoving it into the ALSA pipe, pretending it was all one audio stream[^4]. 


[^3]: In 2006: <https://0pointer.net/blog/projects/pulse-release.html>
[^4]: PulseAudio was creaeted by <a href='https://0pointer.net/lennart'>Lennart Poettering</a>, the same developer behind the equally controversial `systemd`.

On paper, PulseAudio was a revolution. In practice, for at least the first five years, it was a thorn for everybody who used a Linux desktop. It was famous for stuttering, high CPU usage, and the dreaded `Internal Error` that would leave your system entirely mute until you gave it a full reboot[^5]. Sometimes, if you killed PulseAudio after it bugged out, your sound card would be overwhelmed with every queued audio event, and you would be gifted with a loud `SCRMZMNEKEJEIOWJSANNSDMN` before you reached for the power button. Another key problem was it would often 'hang', which is where a program stops responding, which would often be caused by resource overloading or crashing - but this would often block other programs from running[^6]. 


[^5]: Jeffrey Stedfast wrote extensive criticisms of PulseAudio in 2008. <https://jeffreystedfast.blogspot.com/2008/06/pulseaudio-solution-in-search-of.html> 
[^6]: <https://jeffreystedfast.blogspot.com/2008/07/pulseaudio-again.html>

### Glitch-Free Architecture 

Admittedly, these were early days for PulseAudio - and many bug reports and patches were submitted over the years[^8] [^12] which improved the experience massively for the average user[^7]. The PulseAudio developers hit back at criticism, claiming that it was only natural that new software released to so many people at once would result in many bugs being found[^9], especially such complex software as a sound server. Poettering even developed a 'Glitch-Free' version of PulseAudio[^10]. Yes, all software should be glitch-free, you say - a 'glitch' in terms of a sound server is a moment where the CPU is busy and the sound card has a moment where the audio stream is interrupted - you may have heard this when your speakers go `pop` or a `click` or a brief moment of silence. PulseAudio, as of 0.9.11[^10], moved from a simple `push` system to a `smart timer` system. 

Historically, audio worked in 'fragments', scheduled via hardware <a href='https://en.wikipedia.org/wiki/Interrupt_request'>Interrupt Requests (IRQs)</a>.. The playback buffer is divided into a fixed number of 'fragments'. The sound card plays one fragment, and then sends an interrupt to the CPU to request the next one. The interrupt interval `T_int` can be defined as `buffer_size / (number_fragments * rate)`. This results in a significant trade-off - to achieve low latency, you have to use smaller and smaller fragments, which increases the number of interrupts per second, forcing the CPU to wake up more frequently and consume more power[^11]. Poettering's 'glitch-free' model replaces hardware interrupts with high-resolution system timers[^10]. Instead of the sound card asking for data when it's done, the audio server (PulseAudio in this case) proactively schedules CPU wakeups based off the system clock.

The system configures your sound card with the largest possible buffer (even up to 2 seconds). This provides a massive safety margin for any potential CPU scheduling delays. PulseAudio calculated the 'time-to-empty' based on the current playback position, and scheduled a wakeup 10ms before the buffer is projected to empty. If a buffer underrun[^11] occurs, the system will also dynamically increase the safety margin it assigned itself to prevent future glitches, essentially learning how jittery your system typically is, and adapting to it. 

Now, you may think that a 2-second buffer would result in 2 seconds of latency in the case of a dropout. However, Glitch-Free architecture allowed for zero-latency interaction via something called buffer rewriting. Whenever a user interacted with the audio (ie hitting pause, or playing a new sound), the server would recalculate exactly which samples have not yet been processed, rewrite the samples in-place, and re-align the buffer to request new data dynamically. 

This was a hugely impactful update and moved away from static, hardware-defined timing to dynamic, software-defined scheduling, which improved PulseAudio's power efficiency (fewer CPU wakeups) while also improving the ability to react to user input with lower latency.


[^7]: <https://jeffreystedfast.blogspot.com/2008/07/pulseaudio-i-told-you-so.html>
[^8]: <https://bugzilla.gnome.org/show_bug.cgi?id=542391>
[^9]: <https://0pointer.de/blog/projects/jeffrey-stedfast.html>
[^10]: Also called timer-based audio scheduling, it was released in 2008: <https://0pointer.de/blog/projects/pulse-glitch-free.html>
[^11]: When the sound drops out, this is called a buffer underrun or a 'dropout'. <https://en.wikipedia.org/wiki/Circular_buffer>
[^12]: <https://0pointer.de/public/foss.in-pulse.pdf>



[^conf]: https://hal.science/hal-05194352v1/file/proceedings.pdf











