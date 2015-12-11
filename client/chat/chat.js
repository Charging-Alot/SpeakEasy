angular.module('speakEasy.chat', [])

.factory('ChatFactory', function ($http, $location, $window) {
  // Your code here
  var serveMessage = function (message) {
    console.log('ChatFactory serveMessage', message);
    return $http({
      method: 'POST',
      url: '/api/chat/chat',
      data: message
    })
    .then(function (resp) {
      console.log('response in ChatFact.serveMsg', resp.data)
      return resp.data;
    });
  }

  return {
    serveMessage: serveMessage
  };
})

.controller('ChatCtrl', ['$scope','$mdDialog', '$mdMedia', '$state', 'ChatFactory', function ($scope, $mdDialog, $mdMedia, $state, ChatFactory) {
  $scope.message = {};
  $scope.sendMessage = function () {
    console.log('sending message!', $scope.message);

    ChatFactory.serveMessage($scope.message)
      .then(function (data) {
        // this resets message to blank and also clears the message field
        $scope.message = {};
        console.log('then function from ChatCtrl serveMsg call', data);
      })
      .catch(function (error) {
        console.error(error);
      });
  }
}]);
