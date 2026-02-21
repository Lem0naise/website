---
layout: post
title: "Installing Arch Linux with Caelestia alongside another OS"
date: 2026-02-20 10:00:00 0000
permalink: /guides/installing-arch-linux-with-caelestia
tags: 
    - linux
    - arch
---

The core lesson: Do not use `archinstall` for existing multi-boot setups or shared partition schemes. It will likely throw a `ValueError: mount point is not specified`. (You can still use `archinstall` for standard, single-OS installations or when wiping a Windows drive entirely, but for this specific guided setup, you should do it the "Arch Way"). And back your files up! Always back important data up! You will never regret it! I promise!


### Pre-Flight: Disable Secure Boot


**This step is mandatory for Windows laptops.** Windows laptops almost always have Secure Boot enabled in BIOS/UEFI. The standard Arch Linux ISO and GRUB bootloader do not support Secure Boot out-of-the-box.

1. Restart your laptop and enter BIOS/UEFI setup (typically press `Del`, `F2`, `F10`, or `Esc` during boot—check your manufacturer's splash screen).

2. Locate the **Security** tab and find **Secure Boot**.

3. Set it to **Disabled**.

4. Save and exit. Your laptop will reboot.

5. Now boot from your Arch Live USB.


### Phase 1: Partitioning (The Setup)


Do this from a [GParted Live USB](https://gparted.org/liveusb.php) so you aren't modifying mounted file systems.

Shrink your existing OS (Windows or Fedora) to make unallocated space.

Create new partitions:

* Root (/): Format as ext4 (or btrfs).

* Shared Data: Format as ntfs. Why NTFS? It completely bypasses Linux uid/gid permission headaches when sharing files (like Steam libraries or Documents) between two OSs.

Identify your EFI partition: In GParted, look for a 100-500MB partition with a `fat32` file system and the `boot, esp` flags. Do not format this! Just carefully note its identifier (such as `/dev/nvme0n1p1` or `/dev/sda1`). You will need this later.

### Phase 2: The Core Arch Install


Boot into an [Arch Live USB](https://archlinux.org/download/). Connect to Wi-Fi using `iwctl` if needed.

1. Mount the new partitions:
Double-check your partition names by running `lsblk` first. Then, connect them:

```bash
# Mount the new Arch root partition
mount /dev/nvme0n1p5 /mnt

# Create the EFI directory and mount the EXISTING EFI partition
mkdir -p /mnt/boot/efi
mount /dev/nvme0n1p1 /mnt/boot/efi
```


2. Install the base system, microcode, and generate file system table:

Determine your CPU type and include the appropriate microcode:

```bash
# For Intel CPUs:
pacstrap /mnt base linux linux-firmware nano intel-ucode

# For AMD CPUs:
pacstrap /mnt base linux linux-firmware nano amd-ucode

# Then generate the fstab:
genfstab -U /mnt >> /mnt/etc/fstab
```


3. Enter the new system:

```bash
arch-chroot /mnt
```

### Phase 3: System Configuration & User Setup

This is the most critical initialization step where you set up your timezones, localization, root password, new user account, and graphics drivers. Run the following step-by-step.

**Note:** You are currently logged in as `root`. Stay as root for this entire phase.

1. Setup Timezone and Clock:

```bash
ln -sf /usr/share/zoneinfo/America/New_York /etc/localtime
hwclock --systohc
```
*(Replace `America/New_York` with your region and city).*

2. Setup Localization:
Edit `/etc/locale.gen` and uncomment `en_US.UTF-8 UTF-8` (or your preferred locale):

```bash
nano /etc/locale.gen
locale-gen
echo "LANG=en_US.UTF-8" > /etc/locale.conf
```

3. Setup Hostname (Your computer's name):

```bash
echo "arch-caelestia" > /etc/hostname
```

4. Install Required Base Utilities and Graphics Drivers:

First, install the core utilities:
```bash
pacman -S sudo networkmanager vim base-devel git fish
```

Then, install graphics drivers for your hardware:

```bash
# For Intel GPUs:
pacman -S mesa vulkan-intel

# For AMD GPUs:
pacman -S mesa vulkan-radeon

# For NVIDIA GPUs (requires additional Wayland support):
pacman -S nvidia-dkms nvidia-utils vulkan-icd-loader
```

5. Set Passwords & Create User:

First, set your root password:
```bash
passwd
```

Next, create your everyday user account. Do NOT skip this, because `makepkg` (which compiles AUR packages) will refuse to run as root later on for security reasons.

```bash
useradd -m -G wheel -s /bin/bash your_username
passwd your_username
```

6. Grant Sudo Privileges:

```bash
EDITOR=nano visudo
```
Find the line `# %wheel ALL=(ALL:ALL) ALL` and delete the `#` to uncomment it. Save and exit.

### Phase 4: Bootloader & Chainloading (GRUB)

**Stay logged in as root for this phase.**

os-prober often fails to detect other operating systems on complex BTRFS subvolumes (like Fedora) or specific Windows setups. A manual chainloader is the most bulletproof fix.

1. Install GRUB and dependencies:

```bash
pacman -S grub efibootmgr
grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=GRUB
```


2. Add a manual chainloader for your other OS:

Open the custom GRUB config:
```bash
nano /etc/grub.d/40_custom
```

Append the relevant block for your secondary OS:

For Windows:
```plaintext
menuentry "Windows 11" {
    search --no-floppy --fs-uuid --set=root YOUR-EFI-PARTITION-UUID
    chainloader /EFI/Microsoft/Boot/bootmgfw.efi
}
```


For Fedora:
```plaintext
menuentry "Fedora" {
    search --no-floppy --fs-uuid --set=root YOUR-EFI-PARTITION-UUID
    chainloader /EFI/fedora/grubx64.efi
}
```

To find your exact EFI UUID for the configuration above, run:
```bash
blkid | grep vfat
```
Copy the `UUID="XXXX-XXXX"` value and replace `YOUR-EFI-PARTITION-UUID` above with it.


3. Generate the GRUB config:

```bash
grub-mkconfig -o /boot/grub/grub.cfg
```

### Phase 5: The Shared Data Drive

**Stay logged in as root for this phase.**

If you created a shared NTFS partition, you need the right driver, or it will silently fail to mount and lock up your file system on boot. 

*As of Linux Kernel 5.15, Linux natively supports NTFS via the `ntfs3` driver, so you no longer need the older `ntfs-3g` package explicitly, but ensure it is correctly defined in your file system table. If something errors, please try switching to `ntfs-3g` and see if that works.*

1. Create the mount point and edit fstab:

```bash
mkdir /data
nano /etc/fstab
```

First, find your NTFS partition's UUID by running:
```bash
blkid | grep ntfs
```

Then, add this line at the bottom of the file (ensure you use `ntfs3`, and replace the UUID with your actual value):
```plaintext
UUID=your-ntfs-uuid-here  /data  ntfs3  defaults,uid=1000,gid=1000,umask=022  0 0
```


Run `mount -a` to verify it works without throwing permission errors.

### Phase 6: Display Manager (SDDM)

**Stay logged in as root for this phase.**

Without a Display Manager, you will reboot into a black text console (TTY) with no graphical login screen. Install and enable SDDM so you can boot into a graphical login screen. If you like, you can replace SDDM with another login manager later.

```bash
pacman -S sddm qt5-wayland qt6-wayland
systemctl enable sddm
```

### Phase 7: Networking & Bluetooth

**Stay logged in as root for this phase.**

Before rebooting, ensure your new installation won't be completely offline. You already installed NetworkManager in Phase 3.

1. Install Bluez:

```bash
pacman -S bluez bluez-utils
```

2. Enable the services so they start automatically on boot:

```bash
systemctl enable NetworkManager
systemctl enable bluetooth
systemctl enable sddm
```

### Phase 8: Caelestia Dotfiles (Hyprland)

**Now log in as your new user before running these commands.**

```bash
su - your_username
```

Caelestia requires fish and an AUR helper to install its Quickshell and Hyprland dependencies.

1. Install an AUR helper (`yay`):

```bash
git clone https://aur.archlinux.org/yay.git
cd yay
makepkg -si
cd ~
```


2. Install Caelestia:

```bash
yay -S caelestia-shell 
git clone https://github.com/caelestia-dots/caelestia.git ~/.local/share/caelestia
~/.local/share/caelestia/install.fish
```


3. Tweak your UI:
You can modify your window gaps, opacity, and shortcuts by editing `~/.config/hypr/hypr-vars.conf`:

```plaintext
$browser = firefox
$editor = code
$workspaceGaps = 10
$windowGapsIn = 5
$windowGapsOut = 10
$windowOpacity = 0.95
$windowRounding = 10
```

### Phase 9: Finishing Up

You are done! Exit the user session and reboot:

```bash
exit
reboot
```

Once rebooted, you should see the SDDM login screen. Log in with your new user account. SDDM will automatically launch Hyprland (Caelestia). NetworkManager will be running in the background. You can manage your Wi-Fi connections via the Caelestia/Hyprland network applets, or from the terminal using `nmcli device wifi connect "SSID" password "PASSWORD"`. Welcome to your new, dual-booted Arch setup with Hyprland!
