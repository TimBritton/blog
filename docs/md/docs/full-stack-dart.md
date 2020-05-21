# Full Stack Dart

Around a year ago I started looking at Flutter as an option at work to reduce the cognitive load of developing two separate native apps for the platform I work on.  It started with the exciting possibility of only having to write the native hardware requirements of our app related to BLE and being able to write the ui in a single express framework.

After months I managed to craft a POC showing that we could actually rebuild the app and it would allow us cut what was two large mobile code bases into a single smaller one.

Fast forward a year later and Quarentine has happened and I have spare time to work on my personal projects and I started to think (_This is where I usually get in trouble_).  

Dart has been around since 2013 but its really hitting its stride in the last year or so as Flutter has grown in hype/popularity.  I remember reading an article a couple months ago how Google was thinking that Dart might be a good language to use for Cloud Functions.  So that got me thinking again...

> "Is it possible to build a full stack dart application?"

**TLDR:  "Yes, But...."**

This is the story on how I built a mostly functional Dart REST platform in a single day.

## Deciding what to build!

When I decide to YOLO build something usually I have something I want to build and this is one of those cases.  I play a lot of D&D and I enjoy it a lot.  I have this campaign I'm working on that is kind of like the Pathfinder Kingmaker campaign setting but it has a lot of homebrew in it.  So rather than keeping track of everything in a spreadsheet like I used to I wanted to build an app that I can host on the internet that people can connect to.

### Requirements:

- Should be a publically availiable app
- Should not require a download
- The app should syncronize between the different users
- The app should allow me to keep notes from non admin users
- The app should have a basic account system
- The app should have some sort of Auth

Stretch Goals:
- It should be able to integrate with my foundry vtt app I'm hosting.


## Discovering the World of Dart Rest APIs

