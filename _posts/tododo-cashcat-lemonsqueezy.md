<!-- ---
layout: post
title: "Monetising CashCat: Escaping the Google Tax and Taming Webhooks with Lemon Squeezy"
date: 2026-02-26 08:00:00 +0000
author: Indigo Nolan
permalink: /blog/monetising-cashcat-lemonsqueezy-supabase
tags: 
    - coding
manual_related: 
    - /blog/cashcat-on-android-and-ios-mobile-capacitor
--- -->

Building a personal finance app is inherently ironic. You are spending thousands of hours constructing a tool designed to help people save money, and then - eventually - you have to ask those same people to hand some of that saved money over to you. 

For the last few months, my focus on CashCat has been entirely technical: finalizing the Capacitor wrappers, perfecting the Next.js routing, and crushing bugs. But server costs don't pay themselves. Database reads (especially the aggressive querying required for dynamic financial charts) start stacking up. It was time to build a monetisation engine. 

I knew from the outset I didn't want to build a billing engine from scratch. Dealing with global tax compliance, VAT MOSS, and currency conversion is a nightmare I wouldn't wish on anyone. I needed a Merchant of Record (MoR), not just a payment gateway. Enter [Lemon Squeezy](https://www.lemonsqueezy.com/).

Here is the deep dive into how I wired up Next.js, Supabase, Capacitor, and Lemon Squeezy to build "CashCat Pro" - without getting my app nuked from the Google Play Store.

## The Strategy: Friction over Free Trials

Pricing psychology is a dark art. I eventually settled on a "CashCat Pro" tier priced at £4.99/mo and £49.99/yr. It safely clears the £3.99 "dead zone" (where you get all the support tickets but none of the actual revenue) and severely undercuts the £100/yr VC-funded juggernauts I'm competing against.

But how do you handle onboarding? The standard SaaS playbook dictates a 7-day free trial. However, a time-based trial for a personal finance app is a massive vulnerability. Users can sign up, import three years of historical CSV bank data, let the app generate all their categorical insights, take screenshots of their spending habits, and then cancel on day 6. The classic "hit-and-run."

Instead, I implemented a strict freemium model governed by action limits, rather than time limits. New users are granted exactly **2 free CSV imports and 3 free CSV exports**. 

From a technical standpoint, this is incredibly simple to implement. I don't need complex CRON jobs running every minute to check if trials have expired. I don't need to juggle timezone offsets. I just increment integers in the database.

It also guarantees the user reaches the "Aha!" moment. They see the magic of their automated dashboard. But next month, when they need to import their new data, they encounter the friction. The value proposition is already proven; now they just pay for continuity.

## Supabase: Schema Surgery and The Founder Bypass

My entire backend relies on Supabase. To handle this new logic, I had to extend my central `profiles` table.

I evaluated Lemon Squeezy's built-in "License Keys" feature, but that’s really designed for downloadable electron apps, not a continuous cloud SaaS. Instead, I wired everything manually by adding three columns to the `profiles` schema:
*   `is_pro` (boolean, default: false)
*   `free_imports_used` (integer, default: 0)
*   `free_exports_used` (integer, default: 0)

### Row Level Security (RLS)

Of course, securing this is paramount. You can't just have a client-side update flipping `is_pro` to true. I updated my Supabase Row Level Security (RLS) policies to ensure that these specific columns can only be modified by the `service_role` key - meaning only my secure server-side API endpoints can touch them.

### The Founder Bypass

There is nothing worse than deleting a test user during development and accidentally locking yourself out of your own Pro features. It halts development while you scramble to manually edit rows in the Supabase Studio dashboard.

To save my sanity, I added a "Founder Bypass" into my core Next.js utility function:

```typescript
export async function checkSubscription(userId: string, email: string) {
  // The ultimate developer override
  if (email === "cashcat@indigonolan.com") {
    return { isPro: true, importsUsed: 0, exportsUsed: 0 };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('is_pro, free_imports_used, free_exports_used')
    .eq('id', userId)
    .single();
    
  // ... handle errors and return state
}
```
It’s a tiny shortcut, but it's a lifesaver when you're rapidly wiping the local database.

## Webhooks and Next.js: Taming the Beast

Integrating the checkout flow wasn't too bad. I set up an A Record to map `pro.cashcat.app` directly to Lemon Squeezy's IP address (`3.33.255.208`), giving me a beautiful, white-labeled checkout page.

The critical requirement during checkout initialization was passing the authenticated Supabase `user_id` into Lemon Squeezy's `custom_data` object. When the payment clears, Lemon Squeezy fires a webhook back to my server, carrying that ID with it so I know exactly whose database row to update.

The real headache was securely receiving that webhook. Next.js App Router (`app/api/...`) does some aggressive abstraction, especially around raw request bodies. To verify a Lemon Squeezy webhook signature, you *must* hash the absolute raw body of the request against your signing secret using `crypto.createHmac`. If Next.js parses the JSON first, the whitespace changes, the hash fails, and the webhook is rejected.

Building the receiver looked something like this:

```typescript
// app/api/webhooks/lemonsqueezy/route.ts

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  const signature = req.headers.get('x-signature');
  
  // You HAVE to get the text exactly as sent
  const rawBody = await req.text(); 
  
  const hmac = crypto.createHmac('sha256', secret);
  const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
  const signatureBuffer = Buffer.from(signature, 'utf8');

  // Guard against timing attacks
  if (!crypto.timingSafeEqual(digest, signatureBuffer)) {
    return new Response('Invalid signature', { status: 403 });
  }

  const payload = JSON.parse(rawBody);
  
  if (payload.meta.event_name === 'subscription_created') {
    const userId = payload.meta.custom_data.user_id;
    
    // Elevate privileges to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    await supabaseAdmin
      .from('profiles')
      .update({ is_pro: true })
      .eq('id', userId);
  }
  
  return new Response('OK', { status: 200 });
}
```
Using `crypto.timingSafeEqual` is absolutely necessary here to prevent timing attacks. Once the signature clears safely, the server role elevates its privileges and flips the boolean. 

## Dodging the "Google Tax" on Android

Here is where the architecture really gets put to the test. As I detailed in my [Capacitor post](/blog/cashcat-on-android-and-ios-mobile-capacitor), CashCat is shipped as an Android app. 

The Google Play Store has a draconian policy: if you unlock digital content or features natively inside an app, you *must* use Google Play Billing. If you route them to an external payment gateway like Stripe or Lemon Squeezy, your app will be banned and permanently removed. They want their 30%. Because I refuse to manage two completely separate billing architectures, I opted for the "Reader App" loophole. 

Essentially, you are allowed to have an app where features unlock based on a user's web subscription, as long as you *do not link out* to the payment page from within the app itself.

Thanks to Capacitor, this was remarkably elegant. I created a generic helper to detect if the React code was executing inside a native shell.

```typescript
export const isNativeApp = () => typeof window !== 'undefined' && !!window.Capacitor;
```

I then wrapped my paywalls and upgrade components in a conditional render. If you hit the import limit on the web version, a beautiful gradient "Upgrade to Pro" button appears, routing you to Lemon Squeezy.

If you hit the exact same limit inside the Android app, `isNativeApp()` evaluates to true. The button is completely stripped from the DOM. Instead, a plain text paragraph appears: 

> *"You have reached your free import limit. To unlock unlimited imports, please manage your subscription by logging into your account at cashcat.app from a web browser."*

No hyperlinks. No buttons. No Google policy violations. A single unified codebase.

## The Paywall UX and Final Polish

The final piece of the puzzle was the user experience of the paywall itself. "Surprise paywalls" are a dark pattern that instantly destroy user trust. 

Instead of a hard block on their 3rd attempt to export data, the UI acts as a constant, transparent dashboard. The Export and Import buttons continuously read the `free_exports_used` column from Supabase and display dynamic subtitle labels. Before they even think about exporting a second time, they see *"1 of 2 free exports remaining"*. 

Once that integer hits the limit, the UI morphs dynamically. The action buttons transform into a sleek, dark-mode call-to-action modal. This modal doesn't just ask for money; it clearly outlines the actual value proposition of CashCat Pro: custom date ranges, complex money flow diagrams, and unlimited data handling.

It converts the user at the exact point of friction, but only after clearly outlining what they stand to gain.

***

Building a monetised application from absolute scratch, bypassing the pitfalls of app store monopolies, and securely handling webhooks has been an exhausting but incredibly satisfying milestone. With Lemon Squeezy handling the tax headaches, Supabase locking down the data, and Capacitor dodging Google's 30% cut, I can finally go back to working on what actually matters: figuring out why my Sankey diagrams look so terrible.

> *If you'd like to check out the finished product (and perhaps hit that import limit yourself), visit [cashcat.app](https://cashcat.app).*
