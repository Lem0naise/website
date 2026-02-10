---
layout: post
title: "The death of Open Banking"
date: 2026-02-10 08:00:00 +0000
author: Indigo Nolan
permalink: /cashcat-open-banking
tags: 
    - coding
---

You may know that I'm building <a href='https://cashcat.app'>CashCat</a> (along with <a href='https://josh.software'>Josh Wilcox</a>,), a personal budgeting app which uses zero-based budgeting techniques to help you save money. 

It's going extremely well. The main dashboard works perfectly, transactions are flawless, the budget is smooth and easy. Our next big step to join the big players was to add bank integration. We had a master plan for this, a small subscription fee to cover the price we'd researched a year back, it was all sorted.

And then, I ran into the brick wall that is the current state of Open Banking.

## The Golden Age (That I Missed)

A few years ago, the promise of <a href='https://www.ecb.europa.eu/press/intro/mip-online/2018/html/1803_revisedpsd.en.html'>PSD2</a> (the EU regulation that forced banks to open up their data) was that innovation would flourish. Startups like Nordigen appeared, offering free API access to bank feeds for developers.

In 2022, Nordigen was acquired by the UK company GoCardless. I saw this when researching a year or so ago when I had the idea for CashCat, and was a bit concerned, but "Fine," I thought. "GoCardless is a big respectable company, surely they'll keep the free tier for developers."


Unfortunately, they did not keep the free tier for developers.

Six months ago, they shut down the API access for the Open Banking service. Now, to get access, you need a full business account with them, which is completely trapped behind enterprise sales calls, minimum monthly spends, or strict regulatory requirements that require me to be an AISP (Account Information Service Provider). Which I cannot do. 

It’s not just them, though, I went looking for alternatives, trust me. The entire ecosystem has consolidated. Plaid, Yodlee, Truelayer, all exist, but they are all designed for business-to-business. They want to sell to apps with 10,000 users and a legal team - not me building a tool right now with no budget. The "Minimum Monthly Commit" is usually enough to pay for a lifetime subscription to YNAB. I guess the compliance costs are simply too high that they aren't willing to risk serving hobbyists at a loss anymore.

I looked into Mellio and a few other smaller aggregators, but it's the same story everywhere:

* To access the APIs legally, you often need your own regulatory license or to act as an "agent" of the provider.

* The "Pay as you go" models are vanishing.

* Even if I hacked it together, Open Banking requires you to re-authenticate every 90 days, which is really annoying even in services like YNAB.

So here I am, I have Cashcat designed, the budgeting system working, the transaction view perfected, but I have no automated pipeline for the transactions.

Don't get me wrong though, CashCat works fine without Open Banking. I use it daily, with manual transaction entry (and to be honest, it feels even better as a tool that way - you actually have to think about each transaction you're making, which makes it even more likely you'll stop in your tracks.) But I do recognise that most people will not have the time or want to put in the effort. 

## So What Next? (The Return of the CSV)

So, the only option seems to be shamefully and manually exporting a CSV from the banking app every week and dragging it into Cashcat, so we're working on a CSV import feature.

It does turn out parsing bank CSVs is a bit of a nightmare though. Every bank formats the date differently. Some use DD/MM/YYYY, some use YYYY-MM-DD. Some put the merchant in a column called "Description", some split it into "Counterparty".

So CashCat, I think, will have to lack the magic of 'it just works'. It feels so weird, in this age of hyper-automation, that I can't do this simply. It is frustrating and disappointing. I am angry, but I'm not sure at who. For now, I have to adapt. 