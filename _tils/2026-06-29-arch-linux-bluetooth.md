---
layout: post
title: "Bluetooth device connection arch linux"
date: 2026-06-29 10:00:00 +0500
tags: 
    - linux
---

If you need to connect to a bluetooth device on arch linux:

(Especially if it's worked before, but you need to disconnect and reconnect):


Open bluetoothctl:

```
bluetoothctl
```

List all paired devices to find your devices's MAC address (it will look like XX:XX:XX:XX:XX:XX):
    
```
devices
```

Remove the device using its MAC address:

```
remove XX:XX:XX:XX:XX:XX
```

Turn the Bluetooth controller off and on to reset the session:
```
power off
power on
```

Start scanning for new devices:

```
scan on
```

Put your device in pairing mode:

When it appears in the list (hopefully it does), pair with it:

```
pair XX:XX:XX:XX:XX:XX
```

Trust the device to allow automatic connections in the future:

```
trust XX:XX:XX:XX:XX:XX
```

Then connect with it:

```
connect XX:XX:XX:XX:XX:XX
```

Finally, exit

```
exit
```

