(function(){
  var app = angular.module('twitter_bot');

  app.controller('FeedsCtrl', ['$scope', 'socket', function($scope, socket){

    $scope.feedSrc = {};
    $scope.tweets = [];

    $scope.loadFeed = function(data){
      $scope.feedSrc = data;
      socket.emit('sub', $scope.feedSrc);
    }

    socket.on('feed_update', function(data){
      console.log(data);
      $scope.tweets = (data.statuses || data).concat($scope.tweets);
    });
  }]);
})();
