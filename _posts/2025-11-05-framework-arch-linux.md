---
layout: post
title: "I use Arch, btw (yes, on the Framework)"
date: 2025-11-05 11:20:10 +0000
author: Indigo Nolan
permalink: /blog/framework-laptop-with-fedora-arch-linux-dualboot
tags: 
    - linux
    - coding
---

I've been happily running Fedora 42 on my Framework laptop for a couple of weeks, but I recently got that itch that every Linux user gets (it's always distro-hopping time). Somewhere on the internet I'd seen the <a href='https://github.com/caelestia-dots/caelestia'>Caelestia dotfiles</a>, and spun up an Arch Linux VM with the config applied - I was blown away. It looked incredible, and I almost immediately knew I had to have it running on bare metal. This sparked an amazing project that I could distract myself from university assignments with - dual-booting Arch alongside my existing Fedora install. And because I love taking risks, I decided I also wanted a shared data partition so I could share `~/Documents` (and importantly `steamapps`) between the two systems.

I knew this would mean partitioning my main NVMe drive - so I dutifully ignored all the massive red warning boxes in every tutorial telling me how dangerous this was when it was the only place I had a running linux system. While I could have easily wiped my drive and started fresh, my goal was to perform this surgery without losing my stable Fedora install. I'd heard all about how unstable Arch Linux was, and I ideally wanted to have some system alive and ready to run in case I needed to do, you know, things like Bluetooth, Wifi, use my microphone, external displays, that sort of thing.

## The Partitioning Surgery

My first move was to try and partition from *within* Fedora. This was a non-starter; you can't resize the foundation while you're standing in the house. The solution was booting from a dedicated <a href='https://gparted.org/'>GParted Live USB</a> to perform the operation from a neutral environment.

I shrank my main `btrfs` partition and created two new ones:
1.  An `ext4` partition for the Arch root (`/`).
2.  An `ntfs` partition for my shared `/data` drive. (Pro-tip - using `ntfs` is a life-saver, as it avoids all the Linux `uid`/`gid` permission headaches between two different distros).

### Let's use `archinstall`, right?

With my partitions ready, I booted from my Arch Live USB. My secret weapon, I thought, would be the `archinstall` script I'd seen on YouTube. I've used Linux before but I was doing this in my spare time and I didn't want to spend hours setting up arch. This script was supposed to automate the whole process. 

I ran `archinstall`, selected 'Manual partitioning' (so it didn't overwrite my entire Fedora install) and pointed it at the new partitions I'd just made earlier:
- `/dev/nmve0n1p5` (my `ext4` partition) - mount point `/`
- `/dev/nvme0n1p1` (my existing EFI partition) - mount point `/boot/efi`

I hit install, and ... `ValueError: mount point is not specified`

I went back and did it all again. From the beginning. Fresh Arch install, `archinstall`, iterate through. Same error. I dug deeper. I googled a *lot*. I made *sure* my EFI partition was marked with the `Esp`. I googled even more. The `archinstall` script, it turns out, is fantastic for clean installs, but gets very confused when I try to manually partition my drives. While great for clean installs, gets very confused by existing multi-boot setups. Fedora also often maps multiple subvolumes together nowadays, in a way that makes discovery tricky. It was time to do it the real Arch way.

### The Real Arch Way™

I had to abandon the script and go manual. Time to pull up the Arch Wiki.
- `mount /dev/nvme0n1p5 /mnt`
- `mkdir -p /mnt/boot/efi && mount /dev/nvme0n1p1 /mnt/boot/efi` to mount my partitioned drives
- `pacstrap /mnt base linux...` to install the core system.
- `genfstab -U /mnt >> /mnt/etc/fstab` to set up the partitions.
- `arch-chroot /mnt` to go "inside" my new system.

Now I was inside the system. I created my user accounts, set my locale, my passwords, all of that. Now just the bootloader so the next time I logged in it doesn't just explode my entire system...

### GRUB

I first ran `grub-install` - `efibootmgr` not found. A quick `pacman -S efibootmgr` fixed that, but it was a sign of what was to come. 

I had decided to keep GRUB for its `os-prober` feature, as I was led to believe this would automatically find my Fedora installation. No such luck, unfortunately.

- `grub-mkconfig` failed: `os-prober` ran but found... nothing. It turns out, I'm not smart enough to figure out how to get `os-prober` to scan Fedora's `btrfs` subvolumes, even with `btrfs-progs` installed. I'm still not 100% sure if I had something misconfigured, but I pushed forward anyway.

The solution was to stop relying on automation and write a manual chainloader. My first attempt failed, but the final, working solution was adding this to `/etc/grub.d/40_custom`:

```
menuentry "Fedora" {
    search --no-floppy --fs-uuid --set=root YOU-DONT-NEED-MY-UUID
    chainloader /EFI/fedora/grubx64.efi
}
```

I rebooted my laptop, and the beautiful GRUB menu appeared. I could boot into Arch. Wonderful. 

### Shared partition

I rebooted again, this time into Fedora. 

`sudo mkdir /data, sudo nano /etc/fstab` - I added the magic line for my `ntfs` drive, gave myself ownership of it. I tried to move some of my documents into `/data`. Permission denied. 

My old nemesis. I ran `findmnt /data` and saw the problem - my root drive hadn't mounted at all. I looked back at my `fstab` - a lovely little typo, `ntfs` instead of `ntfs-3g`. I fixed it, ran `sudo mount -a` and tried again. This time, it worked! I moved all of my documents, game saves, pictures, all that fun stuff, into my data drive, and then scribbled down a little list of software I would need to reinstall on Arch (raw image viewers, VS code, browsers, PDF viewers, Discord, Spotify, I could go on).


## Caelestia

I cannot thank the team behind the caelestia dotfiles enough. The Hyprland config, along with the <a href='https://github.com/caelestia-dots/shell'>Quickshell config</a>, makes this the prettiest operating system I've ever used, with almost no competition. 

After less than an hour of installing `fish` and all the pre-requisite packages, running the installation scripts, erroring, debugging, rebooting, and tweaking Hyprland config, I was satisfied. Here are some of my custom configs:


``` 
#--# hypr-vars.conf
$browser = firefox
$editor = code
$touchpadDisableTyping = false
$workspaceGaps = 10
$windowGapsIn = 5
$windowGapsOut = 10
$singleWindowGapsOut = 5
$windowOpacity = 0.95
$windowRounding = 10

$kbMoveWinToWs = Super+Shift 
$kbSystemMonitor = Super, Escape
```


![My caelestia config](/assets/imgs/caelestia.png)

Look at this. Could you ever go back?

## Final thoughts

One of the most surprising things I experienced was when I plugged my laptop into my HDMI cable, fully expecting absolutely nothing to happen, the display to tear, or some horrendously scaled image to appear - only for a beautifully intact, perfectly scaled monitor to materialise in front of my eyes. It actually worked *better* on Hyprland / Arch than it did on Fedora with GNOME. There's no going back now.

Yes, it does get a bit tiring connecting to WiFi and Bluetooth devices with my terminal using `nmcli dev wifi connect "eduroam"` and `bluetootctl devices`, but it's probably good practice for me to understand more about the operating system anyway - for when it inevitably breaks and I need to fix it on the fly. 

Most importantly, I can now, finally, say:

> "I use Arch, btw". 

Happy days.