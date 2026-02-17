---
layout: post
title: "Shipping Android and iOS apps at speed"
date: 2026-02-10TODO 08:00:00 +0000
author: Indigo Nolan
permalink: /blog/cashcat-on-android-and-ios-mobile-capacitor
tags: 
    - coding
---

Most of my work on CashCat had been working on the web version, the Next.js app deployed at [cashcat.app](https://cashcat.app). 

Because we're focusing on a web-first outlook, this has meant super-fast deployments, easy iterations, and fast development, without any reviewers or gatekeepers in our way. In the modern day, with agentic coding and such rapid progressions in technology, this is vital. 

To use CashCat on mobile, I added PWA (Progressive Web App) support. You may have seen this before - it's when you visit a website on your phone and it prompts you to add it to your home screen. It's supported on both Android and iOS, and most major browsers (Firefox, Chrome, etc), and as far as I am concerned, worked flawlessly, and I used it daily. 

But of course, I know that any app which takes itself seriously should hage a presence in both the Google Play Store and the Apple App Store.

Not only that, the offline capabilities of PWAs, even with service workers and aggressive `localStorage` and `indexedDb` caching, are severely limited. 

> *If you're interested in trying out [CashCat](https://cashcat.app), which I'm building with [Josh Wilcox](https://josh.software), and you have an Android or iOS device, email me to get added to our app tests!*