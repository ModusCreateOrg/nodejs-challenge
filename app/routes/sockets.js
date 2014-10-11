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

module.exports = function(io, twitter){

  setInterval(function(){
    for(var user in rooms.users){
      twitter.get('statuses/user_timeline', {
        screen_name: user,
        count: 5,
        since_id: rooms.users[user].last_id
      }, function(err, data, resp){
        if(data && data.length) rooms.users[user].last_id = data[0].id;
        io.to('users_' + user).emit('feed_update', data);
      });
    }
  }, 30000);

  setInterval(function(){
    for(var hash in rooms.hashes){
      twitter.get('search/tweets', {
        q: '#' + hash,
        count: 5,
        result_type: 'recent',
        since_id: rooms.hashes[hash].last_id
      }, function(err, data, resp){
        if(data && data.statuses.length) rooms.hashes[hash].last_id = data.statuses[0].id;
        io.to('hashes_' + hash).emit('feed_update', data);
      });
    }
  }, 30000);

  io.on('connection', function(socket){
    var subscription;

    socket.on('sub', function(data){
      subscription = data;
      subscribe(subscription);
      socket.join(data.type + '_' + data.value);
    });

    socket.on('disconnect', function(){
      unsubscribe(subscription);
    });

    socket.on('check', function(){
      console.log(subscription, rooms);
    });
  });
};
