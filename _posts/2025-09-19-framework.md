---
layout: post
title: "I bought a Framework laptop and put Linux on it - should you too?"
date: 2025-09-19 18:00:00 +0100
author: Indigo Nolan
permalink: /blog/framework-laptop-linux-fedora
tags: 
    - coding
manual_related: 
    - /blog/framework-laptop-with-fedora-arch-linux-dualboot
---
For about five years now, I've been using my Macbook Air 2020 with the M1 chip as my daily driver. To be honest, even though it might get me crucified in some developer communities, I do love it and would still recommend a Macbook Air to Computer Science students, especially the newer ones with the M3 and M4 chips - absolute powerhouses. Battery life is great, performance is great, fanless and light. 

Over the last couple of months, though, I've been feeling the failures of MacOS more and more. I kept running into Windows software I wanted to run (but couldn't, since my Macbook is newer and has the M1 arm architecture), or wanted to relax and play some games on Steam but could only play the ones compatible with Mac. 

I'm always scanning the web for good tech, even if I'm not in the market to buy one, and I kept coming across the Framework Laptop. The pitch is simple, and incredibly compelling: what if you owned a laptop that you could actually 'own'? A laptop designed from the ground up to be repairable, upgradeable, and customisable by its user. The idea definitely stuck with me. And as somebody who (before the Macbook) used Linux as a daily driver, the 'please come back' callings had been getting to me. The idea of the Framework laptop was the complete antithesis of the beautiful, but ultimately disposable, sealed unibody of my MacBook.

After weeks of obsessive research, as I always do when buying anything, and a lot of late-night "should I, shouldn't I?" debates, I finally decided to take the plunge. I configured a Framework Laptop 13 DIY Edition with a new AMD Ryzen AI 5 350 processor, 16GB of RAM, and a 1TB SSD - on paper, a massive step up from my Mac's 8GB/256GB config. Hitting buy on any purchase that costs over £1,000 always feels daunting, but it also felt like it would definitely be an investment into my future.

## The Arrival (and a minor disaster)

When the box arrived, I quickly saw how different the experience was going to be. Inside was not simply a laptop, but a large and comprehensive toolkit. The DIY assembly, which I was admittedly extremely excited for, turned out to be a genuinely fun 15-20 minute process of seating the RAM and SSD, connecting the keyboard and trackpad, and snapping on the magnetic screen bezel. It was like a grown-up Lego kit, and at the end of it, I felt a personal connection to the laptop that I've never felt with any other product. 

However, this is where my journey hits its first snag. In my excitment during putting the laptop together, I encountered - what is, according to Google, a very common problem with the setup process - I managed to bend the plastic bezel by accidentally leaving the display cables routed under the hinge instead of over. In my defence, this was *definitely* not immediately visible, or stated extremely clearly in the setup guide, but I could probably have figured it out if I gave it a couple more seconds. After hearing a loud snap and thinking I'd just broken my £1,000 machine, I was somewhat relieved to see it was just the clips on the bezel broken. However, the bezel had wedged itself inbetween my screen and keyboard, so I spent a tense ten minutes pushing it out, trying my best not to damage any cables. I think in the process I bent the display a little, and it definitely no longer sits flush - but I'm currently typing the blog post on the laptop, so it works, for now. But I'm getting ahead of myself. 

![The broken bezel](/assets/imgs/fw.jpg)

The broken bezel ^ 

The great thing about the Framework laptop is, with such a breakage as this, I don't need a thousand-pound replacement - I can just buy a new bezel. I've contacted Framework support and explained what happened, but I'm doubtful they'll send me a replacement bezel as it was technically 'my fault', so I have also placed an order for a replacement bezel - this time, I've gone for a fun translucent purple, so I'm excited about that. 

![Translucent purple bezel](https://preview.redd.it/new-purple-translucent-bezel-on-fw13-v0-pvmgfrqgrqxe1.jpg?width=640&crop=smart&auto=webp&s=c482ce63c895472879b7af4d844681d7d6de7381)

(Not my laptop - but hopefully what it'll look like soon!)

## Installing Linux

With the building out of the way, I decided to go all-in. My initial plan had been to dual-boot Windows for ultimate compatibility, but the desire for a new, clean development environment won out. I was going to my Linux my home. I flashed a USB driver with Fedora 42 Workstation, [one of Framework's officially supported distros](https://frame.work/gb/en/linux), and wiped the drive clean.

The installation was, as expected, seamless, but the real work - the *linux tinkering* began after the first boot. The first order of business was the post-install ritual I had seen thousands of times online: updating the entire system, even though I'd just installed it, enabling the RPM Fusion repositories to install multimedia codecs and drivers that Fedora really *should* ship with (but I understand that it can't because of licensing reasons). 

## WiFi Problems 

I soon hit my first non-build technical challenge. My Wi-Fi was abysmal, with speeds far slower than my phone in the same spot. For a moment, the old doubt crept in: "Is this just a Linux problem?" But instead of giving up, I went straight to the terminal. A few commands revealed some problems - my WiFi card was stubbornly connecting to the slower 2.4GHz band instead of the higher-speed 5GHz band that was both available and compatible. After figuring out how to command my laptop to lock onto the 5GHz signal's specific address (its BSSID) my speeds skyrocketed. It was a moment I was quite proud of - I had just fixed my first real problem.

Riding high on this victory, for the rest of the first day, things seemed to just work. I hadn't picked a *particularly* fickle distro like Arch Linux (although Omarchy and DHH on twitter were *really* tempting me, but maybe another time), so I wasn't too surprised. My external keyboard and mouse worked, my camera worked, the trackpad worked, my external monitor worked. Great stuff!

I did notice, however, that the internal microphone didn't seem to work. Now, my guess for this, is that I probably pinched and severed the cable which connects the microphone when I broke the bezel earlier. This could be extremely annoying, but I probably won't use the laptop without external headphones anyway, so it's not too big of a deal. Still, one of those things that will get in my way sometimes. 

## Display Drivers and Descent into Madness

The next day, I went to do what I thought would be a simple task - connecting my laptop to my ancient Samsung TV via HDMI to watch a movie. This is where my triumphant narrative hits a snag - the TV seemed to recognise the cable was plugged in, but stubbornly displayed No Signal. The laptop screen would flicker when plugged in as it does when it detects a new display, but nothing would appear.

This time, my dive into the terminal was a lot less successful. The system logs (`dmesg`) showed cryptic errors like `usci_acpi` and `xhci_hcd`, pointing to what was looking like a power-management issue with the USB-C port. I swapped the cables and ports a few times, something that the Framework laptop is uniquely capable of, thanks to its expansion card system.

![Framework expansion cards](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNravz048Mu0vasS5tQkYszv8XVBGeghMy2Q&s)

One of the ports actually worked with a HDMI-USB C cable, but locked the TV to a terrible 640x480 resolution. 

This began a multi-hour descent into madness (the world of Linux display drivers). I learned about display servers, switching from the default Wayland to the legacy 'Xorg', which apparently has better support. I became intimately familiar with a command line tool descriptively called `xrandr`, a tool to manipulate and manage displays. I used `cvt` and `gtf` to generate 'modelines' - which I think is something like timing information for the signal that I was trying to get the laptop to send.

Each failed attempt was met with either a blunt `Configure crtc failed` error, or stony silence. I tried lower refresh rates, different resolutions, and even passed parameters directly to the kernel at boot time to try and force the issue. Nothing worked. The software seemed to *think* it had succeeded, but the hardware refused to comply. I had reached the end of the line. This specific combination of such a recent OS, modern laptop hardware, and what was probably a very old, picky TV was an edge case that I didn't have the energy to solve. I had to give up. 

I'm now tempted to install Windows alongside to see if it works there - my instinct is that it will, flawlessly. It did on my Mac. 

## Was it worth it?

I think so. I've had it for a couple of days and really like it. The fan isn't too loud, the processors are powerful, I can play the games I wanted to via Proton (thank you Steam). I always love using Linux and am enjoying web development on it, and it definitely feels more expandable and customisable than MacOS. 

And for every disappointment (I couldn't watch Tenet on my TV last night, much to my disappointment), in return I learned even more about how a computer sends a signal to a screen than I would have with plug-and-play Windows or MacOS. 

More blog posts will come whenever I find anything cool in Fedora 42 or discover anything new about the Framework Laptop 13 that I will share. I'm still using the semi-broken bezel for now, and excited for the delivery of the new one! Photos will be coming soon.