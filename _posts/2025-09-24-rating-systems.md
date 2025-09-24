---
layout: post
title: "The problem with the five-star rating system (Head and Heart)"
date: 2025-09-24 00:00:10 +0100
author: Indigo Nolan
permalink: /blog/rating-systems-head-and-heart-and-favourites-me
tags: 
    - design
    - coding
---
What does a three-star rating *really* mean? Is it a positive recommendation? Is it a 'meh'? Is it a warning? We've all been trapped for far too long, in my opinion, by the vague tyranny of the five-star system. It's a system that *feels* objective, but is actually deeply personal, often failing to capture how we truly feel about a film, book, or album. 

I'm still trying to design a rating system for [favourites.me](https://favourites.me) that works better than stars. I've been doing it for a [while now](../favourites-me). I started off, as everybody does, with the traditional five-star system. Now the problem with this, which Roger Ebert (film critic for the Chicago Sun-Times) states in [this wonderful article which I will refer back to a lot](https://www.rogerebert.com/roger-ebert/you-give-out-too-many-stars), it's nowhere near perfect. 

Consider you watch a film, and then decide to give it a 2.5 star rating. Let's say that the rating scale permits 0 stars and permits 5 stars. This means that 2.5 stars is the exact middle that you can possibly give the film. It's mediocre. It's okay. It's neither good nor bad. But this isn't how 2.5 stars is interpreted socially. 2.5 stars means a *bad* movie. 2.5 stars means you would recommend against it to your friends. Or maybe it doesn't - it's so easy to interpret differently. It's the same reason that 60 or even 70% can have felt like a bad grade at school - everything is subjective and when in perspective can be interpreted differently. So a different scale is needed, one which does not have the stigma attached to it that the five-star system does.

One of my favourites is the San Francisco Chronicle's Little Man:

![The little man of the San Francisco Chronicle](https://static.rogerebert.com/redactor_assets/pictures/rogers-journal/you-give-out-too-many-stars/littleman-thumb-500x49.jpg)

The little man is on a scale from:

>(1) jumping out of his seat and applauding wildly; (2) sitting up happily and applauding; (3) sitting attentively; (4) asleep in his seat; or (5) gone from his seat

Now, the great thing about this scale, is that it provides a middle point that I am content with - 'sitting attentively'. This does not state whether the film is bad or good, but simply that the little man is not considering leaving the cinema and wants to see what happens next. 

Because I am a massive nerd, for my [excel spreadsheet](../favourites-me) and original idea, I had a scaling system which went from 1-100. I liked this because it was essentially a five-star system, scaled onto a 1-10 system, and zoomed in onto a 1-100 system. This meant I was able to differentiate between two films which were both 8/10. I liked this a lot, especially when it meant I could tell the difference between all the films I gave five stars in very granular terms. 

The problem with this, of course, is that you run into uncertainties. Much like Roger Ebert, who is much more culturally educated and has so much more authority to talk about this, I also *enjoy* watching films. I do not go to watch a film with the idea to criticise and review it - I go with the idea of pleasure, and then by an extension of my desire to view statistics and numbers, I rate and review it afterwards. The same goes for books and video games (and everything else you can track on [favourites.me](https://favourites.me)).

So, I ended up with a large bias towards higher ratings, and a significant lack of lower ratings (because it feels *mean* to give a film a rating in the 40s! Even if objectively, it's the equivalent of rating in the 60s but leaning towards dislike!) But they clearly have very different vibes. Even giving a film I quite liked a rating in the 60s felt harsh.

![The original stats graph](/assets/imgs/fme3.png)

So, I knew I needed to create something different. I didn't want rating to become this laborious task that I had to complete each time I watched something or read a book. I needed to have a system that felt easy to engage with, but was still statistically meaningful and significant enough that it was worth me recording the data. So I did what anybody would do, and went out researching famous film critics and their systems.

## Popular examples  

### Thumbs up / Thumbs down

Roger Ebert (who I've mentioned) and Gene Siskel used a rather aggressive system for their chat show 'At The Movies' - a simple thumbs up / thumbs down system. That's it. A binary choice - is it worth seeing, or is it not worth seeing. This is a lot less effort for both reviewer and viewer, but it removes almost all nuance, so I swiftly moved onwards.

### Academic Grades

Another popular option is the 'Academic' system used by various magazines including *Entertainment Weekly*. This assigns each film a letter grade from A to F. This has the benefit of being more widely understood - C clearly means average, while 5/10 or 2.5 stars carry a more negative connotation for some reason.

### Qualitative 'moods'

This is more of a modern approach, and something I heavily considered. Instead of a simple star or number rating system, a lot of places use quirky words or phrases, such as 'Only watch if you're drunk' or 'A great time with friends'. This works for the average viewer, but it may be hard to express quite how much you loved, hated, or had a very particular thought about a film, if you are forced into these pre-defined boxes.

## My Solution - Head and Heart

These systems all have their pros and cons, so I decided to strip what I liked from each of them and create an entirely new system. The Thumbs Up is brilliantly simple and easy to log, the letter grade adds a bit more clarity, and qualitative tags provide essential context.

This led me to develop a two-axis system I call **Head and Heart**.

Essentially, there are *two* scales:

- **Head**: Artistic Merit / Craft: How well-made was it? Cinematography, acting, directing, script, score, etc
- **Heart**: Personal Enjoyment / Fun Factor: How much did *you* enjoy it? Were you stuck to your chair? Did you laugh the whole time?

Both of these are on scales of 1-3. This is to minimise friction - I considered 1-5, or even 1-10, as my statistics brain was itching again, but I feel that both of those begin to create that overwhelming feeling again, and I was really looking for the most comfortable system possible.

The reason I really liked this idea was because it immediately solved a pain point I had been struggling with for a while - movies that are so good they're bad. 

Things like *Naked Gun* and *Airplane*. I absolutely love these movies, but on my previous scales, I felt bad putting them next to my absolute favourites like *12 Angry Men* and *Duel*, because cinematically speaking, they were simply nowhere near as good - but god are they fun to watch! So I needed some way to express that yes, they may not quite be *Dune*, but I would heartily recommend them. So, on the Head,Heart scale, I would give them a 2,3. They're a middle of the road with respect to cinematography, acting, directing, et cetera, but a 'approved', a 'recommended' when it comes to my personal enjoyment.

Here's my initial thoughts about the Head vs Heart scale:

* **Head**
    * 1: Flawed: (Noticable issues, poor script, weak acting, clumsy directing)
    * 2: Competent (Well-made, solid piece of work)
    * 3: Masterful (Exceptional artistry in every way)
* **Heart**
    * 1: A Slog (You were bored, frustrated, or simply didn't enjoy it)
    * 2: Engaging (It held your attention enough to finish the film, and was worthwhile)
    * 3: Loved it (You were captivated or enjoyed it a lot. Something you'd rewatch in a heartbeat)


Something like *Schindlers List* could even be a Head: 3 Heart: 1. It's all deeply personal and subjective, but you could genuinely recognise the artistry and the importance of the film, but felt deeply uncomfortable (understandable) and would not re-watch it. 

I feel this captures a lot of the nuance that is lost with a 1-axis scale. I tested the scale by inputting some examples from my personal library (all opinions subject to change, made in a rush in photoshop):

![The head vs heart chart](/assets/imgs/fme5.png)

I'm about to begin implementing this on [favourites.me](https://favourites.me). I'll transition from the 0-100 scale soon, but my eventual goal is to offer all possible rating systems, and even user-customisable ones in the future. I want you to *own* your media, but at the same time I want to explore the psychology of enjoyment and how different people rate and review media.

It will require a lot of work to get just right, so [let me know what you think about this scale](mailto:fme@indigonolan.com), and hopefully you'll see it live soon!

