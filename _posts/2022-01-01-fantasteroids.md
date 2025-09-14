---
layout: post
title: "Fantasteroids - Deep Dive"
date: 2022-09-09 14:15:00 +0100
author: Indigo Nolan
permalink: /fantasteroids
tags: 
    - coding
    - project-updates
---
[Here's a link to the game!](https://store.steampowered.com/app/1790870/Fantasteroids/)

This was one of my first ever projects, and definitely the first 'big' one. I built it while I was still in school, so it took _a while_. The thing I'm most proud of, though, was that I finished it, at least to a level I was satisfied with. Every developer knows the easiest part of a project is starting it, and the last 20% is the absolute hardest thing you will ever do.

![](https://shared.steamstatic.com/store_item_assets/steam/apps/1790870/header.jpg?t=1663613994)

I have always played a lot of video games, and after visiting the [London Science Museum](https://www.sciencemuseum.org.uk/see-and-do/power) (highly recommend), where I got to play classic games like Pong and Pacman, I got the itch that you will know all too well - that itch to create something.

So, I went home and booted up my laptop. My only experience in game-making at that point was dozens of unfinished Unity projects, thanks to the wizard that is [Brackeys](https://www.youtube.com/watch?v=IlKaB1etrik) (I owe so much of my childhood to that man!). For some reason, I had recently discovered [Godot](https://godotengine.org/) and played around with a bit, and after thinking for a bit, I decided why not, and chose to make this new, yet-unnamed project, in Godot. It's open-source, had a lot fewer tutorials and was a lot less well-known at the time, but why not, give myself another challenge.

I know now in hindsight that working in a team makes everything easier. Despite that, I came home most nights from school, opened Godot, and kept tapping away at the keyboard. I had decided by that point to make an asteroids-inspired game. It was originally going to be a rhythm game, where you had to dodge asteroids which would fall from the sky to the beat of a song, but after some quick googling I discovered the terrors that are music licensing laws, and I quickly pivoted to a more traditional random asteroid style.

Before long, I had a working demo. Soon enough, I was working on the project on the terrible PCs in the library. I would bring a Godot executable and the game files on a USB stick and plug it in, and tap away for hours. After a couple of weeks of doing this at lunchtimes, a classmate of mine saw me, came up to me, and we started talking. It turns out he was a remarkably good artist with a knack for pixel art, and we soon began collaborating on the game. To this day, he is still one of my best friends!

A lot of the art I drew myself. Every time I'd draw something, I'd send it to him on Discord and he'd send back an alternate version for me to pick from. I would say that about 50% of the assets are mine and 50% are his. My greatest idea was, in a typical move done by mobile app developers, 'add hundreds of skins!'. Because the gameplay loop was relatively simple, I thought a great way to show the achievement of progress would be via skins, and I would like to say I was right. This also meant it was easy to pump lots of new art into the game - if you want to draw something, just add a new skin! We added dozens of skins this way, and that is his main contribution to the game.

<img class='pixel-image' src='/assets/imgs/clock.png'>

The clock was one of the first skins I drew, and I liked it so much it's basically all I ever play with myself. It was so fun to draw!


<img class='pixel-image' src='/assets/imgs/prestige_crown.png'>


<img class='pixel-image' src='/assets/imgs/cat.png'>

You can't make a set of skins without a cat!

The next thing to work on was music! I composed one of the music tracks myself, and one of them was acquired from a random royalty-free source online - it was just too good in my mind at the time to pass up. I had so much fun in Fruity Loops Studio, but only ended up with one track that my friends didn't all immediately pile onto as terrible music, so that's the one I used.

## Steam Integration

After making an initial working demo, I decided quite quickly I wanted to publish the game on Steam. This would both give me an exciting project to announce, and also give me a final goal to work towards, thereby making me more likely to finish it.

After making an account on the Steamworks Developer Portal (or whatever they call it nowadays), the 'Leaderboards' button caught my eye. After reading up on the page a little, I decided I would definitely add Steam leaderboards into the game - just like a traditional arcade game, leaderboards are what drives it. You would go back again and again to the arcade to try and beat your friends' high scores, and I think leaderboards create a huge sense of friendly competition and community engagement.

The Steam APIs are not super easy to work with, but after weeks and weeks of bugfixing, I got steam leaderboards to work! Wonderful. We are getting close to release time!

## Release And Beyond

The days leading up to the release were exciting. I'd decided on a date, and I kept advertising it in person, I'm sure I was extremely annoying at school, but anything to get the word out there. I'd chosen to make it free instead of paid, even though the idea of earning a little money was definitely attractive to me, I just knew that I would get infinitely more engagement if I made it free, and it was really for practice and fun anyway!

When the release date arrived, I was absolutely thrilled. It felt like I was finally getting my creativity out into the world, something I had procrastinated for a decade and more! I'd spent so long working on it in a bubble that it was a huge rush to see people I knew, and even complete strangers, download and play it!

That was the best part about a Steam release. You get on all of the Steam new game pages, if only for a day or so, and the online presence means you're found by web scrapers - there are a handful of YouTube videos about the game, gameplay, trailers, you name it!

I was temporarily caught out by the sudden influx of (merely dozens) of international people playing my game - the pixel font I had chosen for the leaderboard didn't support non-Latin characters! Worst of all, the new top player on the leaderboard was Korean, and their name wasn't even being shown! I quickly wrote a hotfix to substitute the font, and the Korean player got their dignity back. (I think they're still top to this day - incredibly impressive playing, shout out to them. See if you can beat them!)

## What I Learned

The most important thing I learnt was the power of finishing a project, and how much easier it is with friends. Collaboration boosts your productivity immensely, and humans much prefer working with others, especially for long-term projects, than alone.

Community was also incredible - I was right to make it free, and I was doubly right to add Steam leaderboards - seeing people from all over my school, the country, and even the world, play this little game I made in my free time, was such a joyous feeling.

Fantasteroids was my first big leap into the world of game development, in fact any development at all. It's not perfect, definitely not, but it's a testament to what's possible when I actually finish the projects I start.

[You can play it completely for free on Steam! Try and beat my highscores.](https://store.steampowered.com/app/1790870/Fantasteroids/)