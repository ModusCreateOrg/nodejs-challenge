/* @rooms registers last tweet id of a user of hash and the
 * number of clients subscribed to them
 */
var rooms = {
  users: {},
  hashes: {}
};

/* Creates a new user/hash in appropriate room if not present.
 * Else, increments the counter of the user/hash.
 */
var subscribe = function(data){
  var room = rooms[data.type];
  if(room[data.value])
    room[data.value].count += 1;
  else
    room[data.value] = {
      last_id: 1,
      count: 1
    };
};

/* Decrements counter of user/hash if 2 or more subscribers.
 * Else, the last subscriber has left; therefore deletes this room.
 */
var unsubscribe = function(data){
  if(!data) return;
  var room = rooms[data.type];
  if(room[data.value] && room[data.value].count > 1)
    room[data.value].count -= 1;
  else
    delete room[data.value];
};

/* Gets latest tweets for a user or trend(hash) and updates clients
 * @name  (String) = name of user/trend
 * @props (Object) = { last_id, count }
 * @io    (Object) = socket io for emitting changes
 */
var refresh = {
  users: function(name, props, io){
    twitter.get('statuses/user_timeline', {
      screen_name: name,
      count: 5,
      since_id: props.last_id // Don't download same tweets again
    }, function(err, data, resp){
      /* Cache last id and update clients */
      if(data && data.length) props.last_id = data[0].id;
      io.to('users_' + name).emit('feed_update', data);
    });
  },
  hashes: function(name, props, io){
    twitter.get('search/tweets', {
      q: '#' + name,
      count: 5,
      result_type: 'recent',
      since_id: props.last_id // Don't download same tweets again
    }, function(err, data, resp){
      /* Cache last id and update clients */
      if(data && data.statuses.length) props.last_id = data.statuses[0].id;
      io.to('hashes_' + name).emit('feed_update', data);
    });
  }
};

module.exports = function(io, twitter){

  /* Refresh users every few seconds */
  setInterval(function(){
    for(var user in rooms.users){
      refresh.users(user, rooms.users[user], io);
    }
  }, 30000);

  /* Refresh trends(hashes) every few seconds */
  setInterval(function(){
    for(var hash in rooms.hashes){
      refresh.hashes(hash, rooms.hashes[hash], io);
    }
  }, 30000);

  /*************** Socket handlers ********************/
  io.on('connection', function(socket){
    var subscription;

    /* Subscribe: cache data in local @subscription,
     * add/increment room counter,
     * join the room for user/trend to get only relevant updates,
     * try and get a new copy of data immediately.
     */
    socket.on('sub', function(data){
      subscription = data;
      subscribe(subscription);
      socket.join(data.type + '_' + data.value);
      refresh[data.type](data.value, rooms[data.type][data.value], io);
    });

    /* Use @subscription to decrement/delete room */
    socket.on('disconnect', function(){
      unsubscribe(subscription);
    });

    /* Helper function to check current states */
    socket.on('check', function(){
      console.log(subscription, rooms);
    });
  });
};
