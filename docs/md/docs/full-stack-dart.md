# Full Stack Dart

Around a year ago I started looking at Flutter as an option at work to reduce the cognitive load of developing two separate native apps for the platform I work on.  It started with the exciting possibility of only having to write the native hardware requirements of our app related to BLE and being able to write the UI in a single express framework.

After months I managed to craft a POC showing that we could actually rebuild the app and it would allow us to cut what was two large mobile codebases into a single smaller one.

Fast forward a year later and Quarantine has happened and I have spare time to work on my personal projects and I started to think (_This is where I usually get in trouble_).  

Dart has been around since 2013 but its really hitting its stride in the last year or so as Flutter has grown in hype/popularity.  I remember reading an article a couple months ago about how Google was thinking that Dart might be a good language to use for Cloud Functions.  So that got me thinking again...

> "Is it possible to build a full-stack dart application?"

**TLDR:  "Yes, But...."**

This is the story of how I built a mostly functional Dart REST platform in a single day.

## Deciding what to build!

When I decide to YOLO build something usually I have something I want to build and this is one of those cases.  I play a lot of D&D and I enjoy it a lot.  I have this campaign I'm working on that is kind of like the Pathfinder Kingmaker campaign setting but it has a lot of homebrew in it.  So rather than keeping track of everything in a spreadsheet-like I used to I wanted to build an app that I can host on the internet that people can connect to.

### Requirements:

- Should be a publically available app
- Should not require a download
- The app should synchronize between the different users
- The app should allow me to keep notes from non-admin users
- The app should have a basic account system
- The app should have some sort of Auth

Stretch Goals:
- It should be able to integrate with my foundry vtt app I'm hosting.


## Discovering the World of Dart Rest APIs
_TLDR: Solid Simple frameworks and fairly quick to get started but there are some pain points_

After I set some goals I started digging into what I refer to as the _dart_ story.  I am familiar enough with the language itself from my work with Flutter so figuring out how to write a REST API focused more on finding the right framework and understanding what the threading model would look like for a backend application.

Flutter operates mostly on a single thread where you can run long-running operations in **Isolates**.  I decided that I would do the same think on the backend since I didn't need to scale this project beyond 10 people.  

After looking into what frameworks would be available to ease backend development I settled on using **Shelf**.  [Shelf](https://pub.dev/packages/shelf) was by far the simplest framework I saw and combined with the Shelf Router package I was able to spin up a very simple REST API.

```dart | main.dart

import 'package:shelf/shelf.dart' as shelf;
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as io;
import 'package:args/args.dart';
import 'package:shelf_router/shelf_router.dart';
import 'dart:io';

const _hostname = 'localhost';

void main(List<String> args) async {
  
  var parser = ArgParser()..addOption('port', abbr: 'p');
  var result = parser.parse(args);
  

  var portStr = result['port'] ?? Platform.environment['PORT'] ?? '8080';
  var port = int.tryParse(portStr);

  if (port == null) {
    stdout.writeln('Could not parse port value "$portStr" into a number.');
    exitCode = 64;
    return;
  }

  /// Set up dependency tree;

  var router = Router();
  
  router.get('/', (Request request) {
      return Response.ok('running');
  });

  router.get('/hello/<name>', (Request request, String name){
      return shelf.Response.ok("Hello $name");
  });

  var handler = const shelf.Pipeline()
      .addMiddleware(shelf.logRequests())
      .addHandler(router.handler);
  
 
  var server = await io.serve(handler, _hostname, port);
  print('Serving at http://${server.address.host}:${server.port}');
}

```

I guess this would be a good time to mention that I found out about **Stagehand** at this point.  Stagehand will allow you to generate dart projects.  I used it to generate both my backend project and the project that I use to share view object between the backend and the frontend currently written in Flutter (for web).


### Databasing in the world of dart

I would love to say that databasing was as easy as getting started but unfortunately that's not the case.  I wanted a simple database connection I wouldn't have to host on my target environment.  I was hoping to use sqlite or firebase but I ran into problems trying to use them with dartvm.  

The problem resulted from how the libraries were designed to be used either in Flutter or in dartjs where the HTML package was available.  In this case neither were correct so I was unable to use them.

I also tried to use the in-memory database from the [database](https://pub.dev/packages/database) package where the API looked really nice but unfortunately I ran into a lot of the same problems I had with the other initial databases I looked into.

That leads me into discussing the database that I ended up going with and that is called [Sembast](https://pub.dev/packages/sembast) which is a document database similar to nedb from nodejs.  

It fit the niche that I was looking for in a database and was reasonably fast.  I am getting around 8ms response times in most cases and with the data sizing I'm expecting in this app I doubt it will get any worse.

#### Example of data in the Sembast database

``` json | local.db
{"version":1,"sembast":1}
{"key":4,"value":{"id":"05b31344-afa0-4e80-9546-07a7ce6d2c6d","name":"house name 1","currentDate":{"dayOfYear":0,"year":0,"month":"a","dayOfMonth":1},"events":[],"memberIds":[],"type":"HOUSE"}}

```

It's a pretty standard nosql database which made it fairly easy to view and tweak the data if I needed to fix certain conditions.  I also appreciate the fact it does soft deletes which was a nice little feature. (I didn't include that in the example above.)

### Json handling

If you are familiar with Flutter you know that it doesn't have runtime reflection and since I'm targeting Flutter for my frontend when it came to my view objects I needed to solve the problem on how to generate the JSON that was going to power my app.

I intially planned on writing all the Json handling manually because I'm a glutten for punishment but after I started looking around for something else I found a project called [json_serializable](https://pub.dev/packages/json_serializable).  I heard about this package mentioned a while ago on a talk by the Flutter team but I didn't think to look it up.  I missed out because this package saved me so much time.  Being able to generate the json serialization and deserialization methods so easily meant I could get to the interesting stuff a lot faster. 


#### Serialization example

```dart | user.dart


import 'package:json_annotation/json_annotation.dart';

part 'user.g.dart';

@JsonSerializable(nullable: false)
class User {
  bool admin;
  String name;
  String id;
  User(){

  }
  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);

}

```
#### Here is the generated file:

``` dart | user.g.dart 
// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

User _$UserFromJson(Map<String, dynamic> json) {
  return User()
    ..admin = json['admin'] as bool
    ..name = json['name'] as String
    ..id = json['id'] as String;
}

Map<String, dynamic> _$UserToJson(User instance) => <String, dynamic>{
      'admin': instance.admin,
      'name': instance.name,
      'id': instance.id,
    };

```

## Summary

I am not going to go everything I learned but I will say I found out about a lot of interesting packages I didn't know existed before and it was a good time figuring out how to combine the different packages to build something.  As I finish the frontend and expand on the backend I plan to post the about this project here and eventually put the code up on github for ya'll to explore.

Until next time!
Tim