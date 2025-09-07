---
layout: post
title: "Why I built favourites.me"
date: 2025-09-07 18:00:00 +0100
author: Indigo Nolan
permalink: /favourites-me
tags: 
    - coding
    - project-deep-dive
---
I have always been a bit of a nerd about statistics and collecting data. I've kept a journal for over seven years, and I religiously track books I read, movies I watch, and games I play. Until about a year ago, I did what most people do and tracked my books and reviewed them on [Goodreads](https://www.goodreads.com), my movies on [Letterboxd](https://letterboxd.com), and my games on [Steam](https://store.steampowered.com). 

Over the summer of 2024, when I had a lot more time on my hands than I was used to, I decided to make the leap and compile all the media I had ever consumed into one beautiful Excel spreadsheet (or technically a Google sheet). It started off as a plaintext list, and then I started adding features like ordering by rating, composite ratings, reviews, colour-coding, all the jazz. 
It looked something like this:
![My original spreadsheet](/assets/imgs/excel.png)

I used that for a while, and very much enjoyed the ability to quickly refer back to it to see if I'd watched a certain film and when I'd done that. 

A couple months ago, about halfway through 2025, I decided to make another leap. I am a big fan of building things to solve your own problems, and since I'm constantly looking for things to build and new Github repos to create and then abandon, I started writing a typescript mockup for what I wanted. I made what was functionally a web interface of a spreadsheet, with tabs for each media category, like this:
![The first mockup](/assets/imgs/fme1.png)

It's a React app, and all the data is stored locally in the browser. There are no accounts, which was something I wanted because I didn't want all the user's data to be tied to some company's server. The whole point was that I didn't like having all my information spread across all these different sites, and wanted to consolidate it all into one place that I owned. So, quickly added onto the roadmap was a sort of 'sync' feature. I easily enough added CSV import and export, although semi-writing my own CSV parser was probably not a great decision initially, and I am already considering using papa-parse in the later steps I'm currently working on (why reinvent the wheel?). 

That worked fine enough, and I exported my original spreadsheet into the site. At this point I began domain hunting, brainstormed for a little bit, and settled on something to do with favourites, as the intent of the site is to act as a hub for your favourite media items from all types of media (books, board games, video games, movies, tv shows). I found favourites.me available (probably because Americans spell the word 'favorites', and so the domain is quite worthless on its own). It's not great for that point, because if I tell a non-British person that my site is called 'favourites.me', they're almost certainly going to type in 'favorites.me', but that domain is on sale for £14,395.85 and I don't have that kind of money. If anybody wants to pitch in, please let me know :)

Once the site was published, it was go time. I had the CSV export and import functionality, but all that meant was that I could back up my data on-device. I use both my laptop and my phone frequently, so that wasn't much use to me. It was time to explore alternatives, without breaking my rule of nothing server-side and no accounts, but still provide cross-platform sync. The first thing that came to mind was Google Drive, considering I stored my favourites on there before anyway. So, I explored the Google Drive API. 

I don't know who reading this will have experienced the Google Cloud Platform console, but let me grace your eyes:

![The Google Cloud Platform UI](/assets/imgs/fme2.webp)

It's truly nightmarish. I exaggerate, of course it is usable and I did in fact use it to access the Google Drive API, but it does genuinely feel like three different decades of Google designers and engineers all screaming at me at the same time to use THEIR menus and THEIR popup windows.

Nevertheless, I bravely powered through, and managed to set up a GCP app which is called client-side from the React app with a local Google Drive sync, so you can functionally use the import and export CSV feature, but just with Google Drive instead of local files. This is how I sync from my laptop to my phone, and also to any other browsers - whenever I make a change, I 'save' it to Google Drive, and whenever I open the app, I re-'import' the file from Google Drive.

I'm currently working on separating out the core media-managing code into a [separate, open-source repo](https://github.com/Lem0naise/favourites-media-manager), which will make maintaining the React app a lot easier, and also hopefully allow anybody who wants to to look at the code and make any changes or suggestions they want. It's not too complicated, it's just a collection of sorted and logically structured datasets which you can query and change on the fly.

Another blog post will be coming soon once I make progress with the open-sourcing, but for now, that's all I have to say about [favourites.me](https://favourites.me). Consider taking a look and seeing if you're interested! Please email me with any suggestions or thoughts you have on it, and thanks for reading :)