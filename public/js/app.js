var app = angular.module('twitter_bot', []);
var socket = io();

socket.on('feed_update', function(data){
  console.log((data.statuses || data).map(function(ev){return ev.text}).join('\n'));
});
