---
layout: post
title: "2D Ratings? Head and Heart"
date: 2026-02-05 10:00:00 +0000
author: Indigo Nolan
permalink: /headandheart
tags: 
    - projects
    - coding
    - design
manual_related: 
    - /blog/rating-systems-head-and-heart-and-favourites-me
    - /favourites-me
---
*This is Part 3 of a 3-part post: [Part 1](../favourites-me) - [Part 2](blog/rating-systems-head-and-heart-and-favourites-me).*

---

If you read [Part 1](../favourites-me), you’ll remember I was adamant about two things: I wanted to own my data, and I didn't want a server. I wanted everything local, with a hacked-together Google Drive sync. Well, I have a confession to make. I broke my own rules.

It turns out that writing your own conflict-resolution logic for JSON files stored in Google Drive is a unique form of torture that I wouldn't wish on my worst enemy. So, I did what any reasonable developer does when they hit a wall: I rewrote the entire stack.

Welcome to **Head and Heart**.

## The Cloud (Sort of)

I decided to migrate the backend to **Convex**.

For those who haven't used it, Convex is a backend-as-a-service that handles your database, authentication, and real-time updates. It allows me to keep the app feeling "local" (it’s insanely fast) while actually having the ability to save data cross-device (honestly, who would use the website if that wasn't a builtin feature.)

This means yes, I had to add authentication. The app now uses **Convex Auth** to handle user sessions. I know, I know. I said "no accounts" previously. But the trade-off is that now you can actually log in from your phone and your laptop and not worry about overwriting your database with an old CSV file.

## The Implementation: From 1-3 to 5x5

In [Part 2](blog/rating-systems-head-and-heart-and-favourites-me), I theorised that a 1-3 scale was perfect. 1 for bad, 2 for okay, 3 for great.

As soon as I started coding the actual grid component, I realised I had made a mistake. 1-3 is too vague. If I rate *Interstellar* a 3 on Head, where do I put *The Menu*? I liked it a lot, I thought it was excellently made. Is it also a 3? Probably. But is it the *same* 3? Is it as good? I don't think so. I don't want to give it a 2, because then I'm equating it with worse films, and then I fell into the same pattern again.

So, I decided to expand the grid to 5x5. It gives juust enough precision so you can differentiate "Good" from "Masterpiece" without falling back into the trap of "Is this a 72 or a 73 out of 100?" (which I did a lot when I used favourites.me)

I built this using a custom SVG component. Each cell in the grid represents a coordinate pair: `headRating` and `heartRating`.

The code for the grid interaction is surprisingly simple, handled by updating local state before firing a mutation to Convex:

```typescript
// The grid is essentially just a visualization of two numbers
interface RatingGridProps {
  head: number;
  heart: number;
  onChange: (head: number, heart: number) => void;
}

// Visual feedback is key - hovering a cell explains the rating
const RATING_DESCRIPTIONS = {
  1: "Flawed / A Slog",
  // ...
  5: "Masterpiece / Loved it"
};

```

## Visualising the Data

This is the part I’m most excited about. The whole point of tracking this data isn't just to have a list; it's to see *trends*.

In the `Stats.tsx` view, I’ve built a scatter plot using SVGs. Since I’m collecting `type` (Movie, Book, Game), `head`, and `heart`, I can plot everything on a single chart.

I added a diagonal line of `y = x` to the graph. This is the "Line of Agreement."

* **Above the line:** Media that captured my heart more than my head (The "Guilty Pleasures" zone).
* **Below the line:** Media that I respect intellectually but didn't actually enjoy that much (The "Schindler's List" zone).

This means I can create a heatmap (something I'd wanted to visualise for a while) very easily, something that simply wouldn't look good at all on a 3x3 grid.

It looks something like this:

![Head and Heart Heatmap](blog/whyibuilt/imgs/headandheartheatmap.png)


## What about the CSVs?

I promised I wouldn't lock data away, and I stick to that. Even though I'm using a database now, I built a robust Import/Export system.

The `ImportModal` component is actually one of the most complex parts of the new app. It parses the CSVs from the old version of favourites.me and maps the fields to the new Convex schema.

```typescript
// convex/schema.ts
export default defineSchema({
  mediaEntries: defineTable({
    userId: v.string(),
    title: v.string(),
    type: v.string(), // "Movie", "Book", "Game", "TV", "Board"
    headRating: v.number(),
    heartRating: v.number(),
    dateWatched: v.string(),
    notes: v.optional(v.string()),
  }).index("by_user", ["userId"]),
});

```

## Final Thoughts

The transition from a spreadsheet to a local React app to a full-stack Convex application has been a bit of a journey. I've had to learn a lot about backend mutations and authentication flows (and why `useEffect` is sometimes dangerous), but the result is something I actually use every day. I stopped using favourites.me because I had too much choice paralysis on a 100-point scale, but I didn't want to go back to Letterboxd's 10-point scale - so here is my new, all-improved, 25-point scale. Revolutionary, I know.

The **Head and Heart** system feels right to me. It frees me from the pressure of "objective" reviews and lets me admit that sometimes, I just really love a dumb action movie, and that's okay.

The new version is live now. If you have data on the old version, just export your CSV and import it into the new one.

Go rate some stuff!

[Check out the new Head & Heart system at headandheart.app](https://headandheart.app)!