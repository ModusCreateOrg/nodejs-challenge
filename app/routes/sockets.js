var rooms = {
  users: {},
  hashes: {}
};

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

var unsubscribe = function(data){
  if(!data) return;
  var room = rooms[data.type];
  if(room[data.value] && room[data.value].count > 1)
    room[data.value].count -= 1;
  else
    delete room[data.value];
};

var refresh = {
  users: function(name, props, io){
    twitter.get('statuses/user_timeline', {
      screen_name: name,
      count: 5,
      since_id: props.last_id
    }, function(err, data, resp){
      if(data && data.length) props.last_id = data[0].id;
      io.to('users_' + name).emit('feed_update', data);
    });
  },
  hashes: function(name, props, io){
    twitter.get('search/tweets', {
      q: '#' + name,
      count: 5,
      result_type: 'recent',
      since_id: props.last_id
    }, function(err, data, resp){
      if(data && data.statuses.length) props.last_id = data.statuses[0].id;
      io.to('hashes_' + name).emit('feed_update', data);
    });
  }
};

module.exports = function(io, twitter){

  setInterval(function(){
    for(var user in rooms.users){
      refresh.users(user, rooms.users[user], io);
    }
  }, 30000);

  setInterval(function(){
    for(var hash in rooms.hashes){
      refresh.hashes(hash, rooms.hashes[hash], io);
    }
  }, 30000);

  io.on('connection', function(socket){
    var subscription;

    socket.on('sub', function(data){
      subscription = data;
      subscribe(subscription);
      socket.join(data.type + '_' + data.value);
      refresh[data.type](data.value, rooms[data.type][data.value], io);
    });

    socket.on('disconnect', function(){
      unsubscribe(subscription);
    });

    socket.on('check', function(){
      console.log(subscription, rooms);
    });
  });
};
