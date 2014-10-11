Architecture and Working
========================

The app has fairly basic architecture. Currently it is not relying on any data-store and is using memory for all caches. Here's a quick walk-through:

* When a user enter a username or trend, a subscription is made in sockets.
* This subscription is stored locally for that client and is used to increment the number of client subscribed to a particular user/trend.
* A recurring task for user and trends get latest tweets for every user and trend that has at least one subscriber.
* The tweets are communicated to appropriate rooms to make sure each client gets only relevant tweets.
* When a client disconnects, the global counter for that user/trend is decremented. If it hits 0, that user/trend is deleted.

To-Do/Pending
=========================
* A mechanism to limit the number of requests according to twitter's API rate limit of around 180 requests per 15 minutes.
* Store the caches in a fast data store like redis to avoid memory clogging.
* Cache previous few tweets from a room to server a client on connection. Currently, the first client for a user/trend will get their last 5 tweets to begin with. Subsequent clients will only see the updates from after they subscribed.

If I built Twitter?
=========================
If you ignore the scale of twitter, the actual data structure is rather a collection of simple primitives. It will have (to begin with):

* User (name, email...)
* Tweets: This needs to be in separate collection since we can't realistically nest a thousand tweets in a user document.
* Trends: This will be a collection of small documents which will need to be referenced by tweets. It would have to be indexed properly to ensure fast retrieval.

There will be other considerations as we delve into more functionality. Fore example, the tweets can pe independent, retweets or replies. The independent tweets are straigtforward. Retweets will be independent tweets + reference to source. Same goes with replies.

Favorites are a MxN relationship. A tweet can have many user favoriting it and a user can favorite many tweets. There are many strategies of dealing with this type of relationship (storing reference in child or parent), but here, maintaining a separate collection cross referencing a tweet and user will probably with practical.

Choice of modules and architecture
===================================
The modules `express` and `socket` are pretty standard for building a realtime application.

I chose `jade` because I hate writing html (especially having to type all those angle brackets). As an aside, a jade file is simply  much cleaner and shorter than equivalent ejs.

I suppose I could have managed without `twit` since I am mostly using ReST APIs. Still, it helped me with the twitter authentication which might have taken some time with getting the headers in line.

On front-end, bootstrap is used for quickly getting a presentable layout (responsiveness free with it). Even if I were doing this as a long term project, I would have started with bootstrap and built on it.

I also used Angular.js. I could have gotten along with just JQuery but angular helped me get a quick working prototype. Plus I was able to separate the service (socket) cleanly from code and saved some time with repeat directive which I might have spent searching for equivalent plugin or reinventing the wheel of bindings.

