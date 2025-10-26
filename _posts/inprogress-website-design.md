---
layout: post
title: "Designing your personal space on the internet"
date: 2025-10-24 18:00:00 +0100
author: Indigo Nolan
permalink: /blog/designing-a-personal-website
tags: 
    - design
---
My website used to be a lot flashier. There was a period where I had typewriter effects on almost every textbox, I had flashy animations covering the screen, swooshing shapes, scroll snapping, projects jumping up at you, the works. It was, for all intents and purposes, a tech demo masquerading as a portfolio. It was a digital playground to show off every cool new CSS and JavaScript trick I'd just learned. As every personal site, it evolved over time, and one day I removed my triangular-style header animations, so it would work better on slower devices.

Some time in the next week, I remember one of my classmates going: 'Indy, what happened to your website? I liked the trapezium thingy you had...'. Now, while he meant this as a compliment, for me it was a moment of terrifying clarity. The 'trapezium header' was a complicated, animated header that I'd spent a weekend building. And that was the problem - the single most memorable part of my portfolio site wasn't anything about me, my projects, or any of my content - it was some gimmicky, and frankly cheap, animation.  
 
Over the last summer I redesigned the site, prioritising accessibility, usability, and reducing the cognitive load. I learnt quite a lot in the process. 

## Flashiness is definitely tempting

Look, let's be honest - overengineering a personal site is a rite of passage for any developer. It's a space with no limits, no product managers, no clients, and no real-world constraints. It's the perfect place to try out any obscure library or parallax scrolling effect you've just seen on social media. 

This impulse comes from a very good place - genuine love for the craft and a desire to push your own skills. But it comes, in my opinion, at the cost of the very reason someone visits our site in the first place - to learn who we are, what we've built, or read what we've written. The flashy animations aren't communicating anything about us, other than the fact that we had a spare couple of days to wrestle with uncooperative CSS transforms.

## Evaluating 'hidden taxes'

Whenever designing anything, it's important to look for 'hidden taxes'.

 For example, the **accessibility tax**. Let's take a typewrite effect as an example. Yes, it's possible to create accessible companion elements for screenreaders - but natively, they will often try and read out each letter as it appears, resulting in an indecipherable mess. The scroll-snapping that feels so slick with a trackpad? It makes keyboard navigation a frustrating battle. Finding someone's website and discovering they haven't made it usable on a phone is a frustrating experience, but the main person who loses out is them, not me, as I'll just immediately close the site. 

If your design relies on a single, optimal way of being experienced, it is (for the most part) inherently exclusionary. That said, this doesn't apply everywhere - for example, it makes sense for VR experiences to not support screen readers, et cetera. But you know what I'm trying to say - experiences that want to be accessible to everybody but aren't. A website that isn't navigable by keyboard or comprehensible to a screen reader isn't clever, it's a broken website.

There's also the **performance tax**. I like websites which have background images, I must admit. I've had one periodically on my site - there might even be one there while you read this very article. But any vaguely high-resolution image, not to even speak of all the heavy JavaScript libraries, meant my site took an eternity to load on anything less than a high-speed connection. Forcing a visitor to download megabytes of assets just to see my email address is poor communication. A lightweight, fast-loading site is essential to get across who you really are without bothering with the fluff.

Last and possibly the most important is the **cognitive tax**. The entire point of a personal / portfolio site is *communication*. You are selling yourself. Every unnecessary animation, every unexpected layout shift, every element that vies for attention, actively works against that purpose. It creates *cognitive noise*, forcing the user's brain to work harder to filter out the rubbish and find the information they came for. A user shouldn't have to fight your design to get to the content they want! I've always liked websites that are upfront and clear about what exactly they offer.  

## The 'cosy human' approach

So, what is the alternative then, a boring old text document? No, calm down. The opposite of 'flashy' isn't 'dull and colourless', it's 'thoughtful'. 

My goal for my redesign was to create a space where I could store my things on the internet, at the same time as selling myself. I wanted a space that felt human, calm, and welcoming. I'm not just a developer, I'm also a writer, a photographer, and I don't want to limit myself by creating a website that looks like it came straight out of a 2000s hacker movie.

I swapped out my geometric coding monospace font for a warmer, more handwritten one: <a href='https://fonts.google.com/specimen/Syne+Mono'>Syne Mono</a>. I think it strikes a very good balance between monospace and friendly. 

I did the same with the colour palette. I moved away from high-contrast blacks and whites to a softer, pastel-adjacent scheme that I think feels calmer. Hopefully all the text is still readable, but I feel it provides a comfier atmosphere. 

I mentioned being 'upfront and clear about what your site offers'. This is what my landing page attempts to be - a form of main menu, with options prioritised by the order I want users' eyes to follow. I've previously had an 'About Me' first, and then a button to access my projects, but as I grew my site, adding various different things, I found myself getting overwhelmed and cramped and not sure where to put everything. A way to solve this is an easy-to-navigate menu, meaning I can add more information to the site later and I simply have to expand the main menu, not refactor the entire site's design. 

Perhaps most importantly, I embraced whitespace. Whitespace is a wonderfully underutilised design tool. My old site was crammed with elements and I was terrified of leaving a single pixel empty. Negative space is not simply 'empty' - it's an active design element that reduces clutter, allows the content to breathe, and guides the user's eye to what's important. 

Of course, a personal website is one of the few corners of today's internet that you can *really own*. It doesn't need to conform to the engagement-driven design of social media, or the conversion-focused layout of a company's landing page. It can be simply you. Don't let me tell you how to build your websites. Let your creativity run wild, by all means. But keep your eye on the goal - a pleasant experience for everybody who stumbles across it.

My old site reflected a version of me that was eager to shout his technical skills (or what I'm learning of them) from the rooftops. I hope, at least, that this new one reflects a version of me that is more interested in thinking thoughtfully and creating a calming space where you can find out more about me and what I do. And while I do occasionally miss the novelty of the huge sliding trapezium I used to have, I'll take an easy-to-scale, easy-to-maintain, and easy-to-access user experience every time. 

