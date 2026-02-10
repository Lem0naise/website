---
layout: post
title: "The death of Open Banking for hobbyists"
date: 2026-02-10 08:00:00 +0000
author: Indigo Nolan
permalink: /cashcat-open-banking
tags: 
    - coding
---

Open Banking is a wonderful concept. A more transparent society, boosting competition, allowing immense analytical power of financial data, and only with user's consent and desire! So why is it collapsing? 

I'm currently building a personal budgeting app. It's going extremely well. The main dashboard works great, transactions are easy to manage and the budget is smooth (<a href='https://cashcat.app'>CashCat</a>). Our next big step to join the big players was to add bank integration for automated transaction syncing. We had a master plan for this, a small subscription fee to cover the price we'd researched a year back, it was all loosely planned. 

And then, I ran into the brick wall that is the current state of Open Banking.

## The Golden Age (That I Unfortunately Missed)

A few years ago, the promise of <a href='https://www.ecb.europa.eu/press/intro/mip-online/2018/html/1803_revisedpsd.en.html'>PSD2</a> (the EU regulation that forced banks to open up their data) was that innovation would flourish. Startups like the Latvian Nordigen appeared, offering free API access to bank feeds for developers.

In 2022, Nordigen was acquired by the UK company GoCardless. I saw this when researching a year or so ago when I had the idea for CashCat, and was a bit concerned, but "Fine," I thought. "GoCardless is a big respectable company, surely they'll keep the affordable tier for developers."


Unfortunately, they did not keep the affordable tier for developers.

Six months ago, they shut down the individual access for the Open Banking service. Now, to get access, you need a full business account with them, which is completely trapped behind enterprise sales calls, minimum monthly spends, or strict regulatory requirements that require me to be an AISP (Account Information Service Provider). Which I cannot do. I do not have bank-level cash just sitting around, unfortunately, nor do I have the time or experience to jump thousands of regulatory loopholes. 

It’s not just them, though, I went looking for alternatives, trust me. The entire ecosystem has consolidated. Plaid, Yodlee, Truelayer, all exist, but they are all designed for business-to-business. They want to sell to apps with 100,000 users and a legal team - not me building a tool right now with no budget. The "Minimum Monthly Commit" is usually enough to pay for a lifetime subscription to YNAB. I guess the compliance costs are simply too high that they aren't willing to risk serving hobbyists at a loss anymore.

I looked into Mellio and a few other smaller aggregators, but it's the same story everywhere. 

Some sites ([Enable Banking](https://enablebanking.com/)) seem to have potential, but so far only support EU banks and nothing in the UK yet. I will keep an eye on them, and see if support is extended to the UK soon. Otherwise, it always goes like:

* To access the APIs legally, you often need your own regulatory license or to act as an "agent" of the provider (TrueLayer, Plaid, etc). 

* The "Pay as you go" models for the right to be an agent to the provider are vanishing, replaced with large, and often unaffordable, minimum contracts. That I can't afford. 


So here I am, I have Cashcat designed, the budgeting system working, the transaction view perfected, but I have no automated pipeline for the transactions.

Don't get me wrong though, CashCat works fine without Open Banking. I use it daily, with manual transaction entry (and to be honest, it feels even better as a tool that way - you actually have to think about each transaction you're making, which makes it even more likely you'll stop in your tracks.) But I do recognise that most people will not have the time or want to put in the effort. 

## So What Next? (The Return of the CSV)

So, the only option seems to be shamefully and manually exporting a CSV from the banking app every week and dragging it into Cashcat, so we're working on a easy-to-use CSV import feature.

It does turn out parsing bank CSVs is a bit of a nightmare though. Every bank formats the date differently. Some use DD/MM/YYYY, some use YYYY-MM-DD. Some put the merchant in a column called "Description", some split it into "Counterparty", some have two columns for income and outflow, some merge them. It would be great if there was some form of standardisation, with templates provided by regulators. They could be published openly and given to all banks! That would make it much easier to make financial apps. We could call it something like... Open Banking. 

So CashCat, I think, will have to lack the magic of 'it just works'. It feels so weird, in this age of hyper-automation, that I can't do this simply. It is frustrating and disappointing. I am angry, but I'm not sure where to direct that. For now, I have to adapt. 



> *If you're interested in [CashCat](https://cashcat.app)"", which I'm building with [Josh Wilcox](https://josh.software), you can visit our site to see more!*