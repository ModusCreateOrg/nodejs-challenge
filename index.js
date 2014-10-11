var express       = require('express'),
    Twit          = require('twit'),
    config        = require('./config.js'),
    user_routes   = require('./app/routes/users.js'),
    hash_routes   = require('./app/routes/hashes.js'),
    path          = require('path'),
    app           = express(),
    server        = require('http').createServer(app),
    io            = require('socket.io').listen(server);
    socket_routes = require('./app/routes/sockets.js'),
    twitter       = new Twit(config.twitter);

app.set('views', path.join(__dirname, 'app', 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

app.use('/u', user_routes);
app.use('/h', hash_routes);

socket_routes(io, twitter);

server.listen(config.port, function(){
  console.log('Server started on:' + config.port);
});
