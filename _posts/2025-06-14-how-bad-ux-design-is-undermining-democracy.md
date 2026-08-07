---
layout: post
title: "Voting has bad user experience"
date: 2025-06-14 14:15:00 +0100
author: Indigo Nolan
permalink: /blog/voting-has-bad-user-experience
redirect_from:
    - /blog/bad-ux-design-undermining-democracy
    - /blog/voting
tags: 
    - essay
---

You've just downloaded a brand-new app. It asks for your preferences, you tap through setup, and you're in. Nothing is like what you wanted. The icons are bright blue, and all the text is in Mandarin. That's because the app ignored *your* preferences and ships whatever is most popular worldwide - blue, and Mandarin - so that's what everybody gets.

That's First Past the Post - the voting system behind the United Kingdom, and Belarus[^1] (famously democratic). Having the same voting system as an authoritarian dictatorship is not something a single person in this country should be proud of.

The system is simple - a common defence which I will address later. Voters vote on a list of candidates, and the candidate with the most votes wins. Sounds good enough, right? Well, to demonstrate why it's not, here is an example I made. 

![](/assets/imgs/fptpelec1.svg) Let's say everybody votes for the candidate they truly want. Here, Caroline wins the seat, with 32% of the vote. A combined total of 58% voted for Louis or Sam, and yet ended up with Caroline. 

To fix this, we invented 'tactical voting'. 

##  Tactical Voting

Louis knows he can't win without Sam's supporters. So, Louis and his team encourage "Tactical Voting" - that is, many of Sam's supporters should vote for Louis, to stop Caroline from winning. They claim, "Sam can't win here, it's a race to stop Caroline!" Caroline's supporters will do the exact same with Ronald's supporters. The problem, however, is the picture this paints. You'll end up with an election result resembling something like:

![](/assets/imgs/fptpelec2.svg)

This 'fixes' the winner - Louis now wins the seat over Caroline. But while a much larger proportion than 6% of the public actually support Sam, you can't see this in the election results, and it seems they are significantly less popular! This means you'll end up under-estimating candidates who have a lower chance of winning, which is a self-fulfilling cycle. This election result is exactly what Louis needs to claim it is a two-horse race the next time, and it will tend towards a two-party system, as we see in the US and the UK.

Tactical voting saw a huge rise in name recognition over the July 2024 UK election, with websites such as tactical.vote[^2] and stopthetories.vote[^3] saying it was the only way to stop the Conservatives or Reform UK. Don't get me wrong - tactical voting 'works'. It often prevents, temporarily, candidates from getting in. But then what? You haven't stopped the rise in popularity of other candidates, all you have done is depress voters by forcing them to compromise and vote for a candidate they don't truly believe in.

After the 2024 election in the UK, 6 out of 10 citizens were represented by an MP they did not vote for.[^5] This is clearly unsustainable.

![](https://www.fairvote.ca/wp-content/uploads/2024/07/UK-Election-2024.png)

## People Who End Up Not Voting

Because of this depressing atmosphere where you're eternally forced to compromise and give up the values you believe in, it's understandable that some people will resign themselves to not vote. 

I stand by the saying 'if you don't do politics, politics will do you'. If you use the roads, if you've been to a hospital, if you've been to school, if you have children, relatives, anyone who receives any benefits, 'politics' is something you participate in every day.

I believe we need compulsory voting. If citizens are given the ability to not show up to vote (as in the UK or US), this will be exercised by people too busy or apathetic to vote. This includes people with caring responsibilities, workers with busy shifts, and many other vulnerable demographics who would find it hard to take time out of their day to vote. The day of the election should be a national holiday to ensure everybody who wants to vote is able to. This way, the current demographic of retired people who routinely vote can finally be joined by the working-class and younger population. And if you really hate the establishment, you can always spoil your ballot.

We have the opportunity to participate in one of the greatest human inventions - democracy. And it is for this crucial reason we need to show people that their votes count. First Past the Post creates this toxic atmosphere and sense that your vote is 'wasted'. This is _terrible user experience._ What is the point of a system where the majority of users' input ends up being wasted?[^4]

## So, What Are The Alternatives?

Well, there's proportional representation. Proportional representation isn't one specific voting ruleset - it's the general idea that a parliament should be representative of the people who elected it. Proportional representation, as a concept, should be what living in a democracy means. It means that your interests are represented 'proportionally'. If 30% of users want light mode and 70% want dark mode, 30% of users get light mode, and 70% of users get dark mode. If 30% of voters vote for Party A, and 70% of voters vote for Party B, then the parliament should be roughly in that proportion.

But, I hear you say, the problem with this system is you lose your local MP! Worry not, various countries have come up with various solutions for this. 

### The German System (Mixed Member Proportional)

In Germany, when voting for the members of the Bundestag (Parliament), voters have _two_ votes. The first vote is for your local candidate, who is usually associated with a party. The second vote is for a 'Party List' - there's no local candidates here, you just place a single vote for a party.


![A German ballot card](https://upload.wikimedia.org/wikipedia/commons/c/c5/Bundestagswahl2005_stimmzettel_small.jpg)
A German ballot card
{: .caption}


The system used for the 'first' vote is, admittedly, First Past the Post. This way, voters still get a local representative from their region / constituency. With a purely proportional system, you'd lose the aspect of a local MP, and this is how Germany prevents this issue.

The key to the German system however is the second vote. Any party that received at least 5 percent of the vote (electoral threshold) receives representation in the Bundestag, in proportion to the vote share they received[^6]. The list vote sets overall party seat totals, and constituency winners take seats within that total. 

This way, even if you want to do [tactical voting](#tactical-voting) locally to prevent a candidate from winning, you can still also vote for your preferred party without worrying about "wasting" your vote.

This system is known as Mixed Member Proportional, and is used in countries like Germany, New Zealand, and Korea. Variations of it, such as Parallel Voting, where often 50% of MPs are elected via First Past the Post, and the other 50% are elected via Party List Proportional, are used in countries like Ukraine, Italy, Japan, and Lithuania.

### Scotland and Wales

It's not just dozens of countries internationally though - both Scotland and Wales use the "Additional Member System (AMS)" for their parliaments, which is a type of Mixed Member Proportional, where voters get two votes _(Wales will soon switch to an even more proportional system)._[^7] Not only that, the London Assembly uses the same system!

Now, I hear you protest again, this is still essentially FPTP - just with a little proportional add-on taped to the top! If we really want to move past FPTP, the Irish have the solution. 

### The Irish System (Single Transferable Vote)

In Ireland, voters use the Single Transferable Vote (STV) system — a model often praised for being one of the fairest and most representative. Here's how it works: instead of choosing just one candidate, voters rank them in order of preference — 1st, 2nd, 3rd, and so on. If you've been following the news lately, this is similar to the Ranked Choice Voting model used in the New York Mayoral Primary[^8]. 

![A Sankey Diagram of STV transfer for Louis](/assets/imgs/sankey.svg)
An example of Ranked Choice applied to our simulation: 
{: .caption}


In Single Transferable Vote however, unlike Ranked Choice where there is only one Mayor to elect, each constituency elects multiple representatives. Candidates must reach a minimum quota of votes to get elected, and if they reach that quota, their surplus votes are given to other candidates based on the voter's ranking card. The candidates with the fewest votes are also eliminated and their votes are redistributed.


The result? A much better user experience for the voters. Fewer 'wasted' votes, better representation, and drastically reduced pressure to vote tactically. If your favourite candidate doesn't make it, your vote still counts. This also, coincidentally, makes for a much friendlier campaigning environment. If you're canvassing for Sam, and you meet a voter who prefers Louis, you don't have to argue with them - you can say: _"Amazing! I love Louis too! Rank Louis #1, and then you can rank Sam #2!"_ This will ensure voters who want to vote for Sam can do so, knowing that their votes will flow to Louis in the case it comes down to a two-horse race between Louis and Caroline.

This system is also used in Malta and some Australian elections, and has been trialled in places like Scotland for local elections. And despite being slightly more complex, voters routinely understand and engage with it[^9] - proving that pure simplicity isn't everything when it comes to good design.

## But Aren't These Systems More Complicated?

A common argument for First Past the Post is: _"It's simple. Voters don't want to be taught anything else."_ But simplicity is not the same as usability - think about when you're trying to find an option in a help centre or a settings menu, and it's just not there. Sometimes websites have sleek, minimalist navigation options, and hide complicated settings deep down for the sake of "simplicity" - but this often makes for bad user experience, if the options are frequently needed. Furthermore, voters recognise and reject[^10] the distorting effect of First Past the Post, with a majority supporting PR - only 26% want to retain the current system. Reform of the voting system is ranked second among suggested democratic reforms in the UK. [^11]

As any good designer knows, the real goal is clarity and usability, not just minimalism. STV and proportional systems might seem more complex on the surface, but they produce results that make a lot more intuitive sense to voters. That's the difference between modern calculator apps and the abacus - one is simpler, but the other is clearly more functional - and it is the key to voters' disillusionment in the UK electoral system.

Each implementation of proportional representation has its own quirks. Mixed Member Proportional is only half proportional - but it makes this sacrifice to provide citizens with a local MP, something in which pure proportional representation fails. STV requires multiple representatives for each region to be ideally proportional - something voters in Ireland are used to, but may not be intuitive to everybody. No system is quite perfect - but we have to keep trying.

## Let's Design a Better Democracy

If we designed our democratic system like we design other things, First Past the Post wouldn't even survive the first usability test. Too many dead ends, too little feedback, too little user choice.

We'd look for better systems. Systems that have user intent and feedback built into them naturally. With fallback mechanisms (like second preferences), responsive outcomes (like proportional representation), and better error tolerance (like how MMP avoids total domination by one party.)

The future of voting is a design problem, not a political problem. And we deserve better design.[^12] [^13]

[^1]: <https://freedomhouse.org/country/belarus> On paper has FPTP constituency contests
[^2]: <https://tactical.vote> Constituency-by-constituency tactical voting guide for the 2024 UK election
[^3]: <https://stopthetories.vote> Another 2024 tactical voting site aimed at stopping the Conservatives / Reform
[^4]: <https://www.fairvote.ca/07/07/2024/uk-election-first-past-the-post/> On the 2024 UK election: Labour won ~63% of seats on ~34% of the vote; most ballots elected nobody
[^5]: <https://makevotesmatter.org.uk/> UK campaign for proportional representation; source for the “6 in 10” figure after 2024
[^6]: <https://en.wikipedia.org/wiki/Sainte-Lagu%C3%AB_method> The formula Germany (and others) use to turn party-list vote shares into seats
[^7]: <https://theconversation.com/wales-is-overhauling-its-democracy-heres-whats-changing-256640> From 2026 the Senedd drops AMS for a closed-list proportional system
[^8]: <https://vote.nyc/page/ranked-choice-voting> Official NYC explainer for ranked-choice / preferential voting
[^9]: <https://electoral-reform.org.uk/in-ireland-it-actually-feels-like-my-vote-makes-a-difference/> ERS interview with a voter comparing Irish STV to UK FPTP
[^10]: <https://post.parliament.uk/elections-and-their-reform/> UK Parliament POST note; cites YouGov finding 45% prefer PR vs 26% keep FPTP
[^11]: <https://www.pewresearch.org/global/2024/03/13/electoral-reform-and-direct-democracy/> Pew: electoral reform ranked in the top five issues in 7 of 24 countries, and 2nd in the UK
[^12]: <https://electoral-reform.org.uk/> Electoral Reform Society — UK campaign for fairer voting systems
[^13]: <https://makevotesmatter.org.uk/> Make Votes Matter — UK campaign for proportional representation