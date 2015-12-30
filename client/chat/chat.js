angular.module('speakEasy.chat', [])

.factory('ChatFactory', function ($http, $location, $window) {
  // Your code here
  var serveMessage = function (message) {
    message = { 'prompt': message.text };
    console.log('ChatFactory serveMessage', message);
    return $http({
        method: 'POST',
        url:  '/marvin', //'/api/chat/chat', OLD TESTING PATH
        data: message
      })
      .then(function (resp) {
        return resp.data;
      });
  }

  return {
    serveMessage: serveMessage
  };
})

.controller('ChatCtrl', ['$scope', '$mdDialog', '$mdMedia', '$state', '$window', '$rootScope', 'ChatFactory', function ($scope, $mdDialog, $mdMedia, $state, $window, $rootScope, ChatFactory) {
  // find chatBox in our HTML to append onto it later
  var chatBox = angular.element(document.querySelector('.chatBox'));
  // find chatWrap to ensure proper scrolling later
  var chatWrap = angular.element(document.querySelector('.chatBoxWrap'));

  $scope.message = {};

  $scope.sendMessage = function () {
    // We don't want to allow users to send messages with odd characters as the robot can't interpret them easily
    var regexTest = $scope.message.text.match(/[<>+_@#$%^&*\[\]{}\\\/|=-]/g);
    if ( regexTest && regexTest.length ) {
      $scope.renderMessage('robot', "Sorry, you used some characters I don't understand! Try to stick to simple punctuation.");
      $scope.message = {};
      return;
    }

    if ( $scope.message.text.length > 140 ) {
      $scope.renderMessage('robot', "Sorry, your message was too long! Try sending me something shorter next time.");
      $scope.message = {};
      return;
    }
    $scope.renderMessage('user', "what do you think about music ?")
    $scope.renderMessage('robot', "I think it's a good thing .")
    
    var messageHolder = $scope.message;
    // this resets message to blank, but importantly also clears the message field
    $scope.message = {};
    //$scope.renderMessage('user', messageHolder.text);
    chatBox.append('<img class="pendingGif" src="assets/img/pending.gif">');
    // This makes sure the chatbox follows the pending gif as it causes overflow
    chatWrap[0].scrollTop = chatWrap[0].scrollHeight;
    var pendingGif = angular.element(document.querySelector('.pendingGif'));

    // ChatFactory.serveMessage(messageHolder)
    //   .then(function (data) {
    //     pendingGif[0].parentNode.removeChild(pendingGif[0]);
    //     $scope.renderMessage('robot', data.response);
    //   })
    //   .catch(function (error) {
    //     console.error(error);
    //   });

  }

  $scope.renderMessage = function (context, message) {
    
    if (message.length === 0) {
      $scope.message = {};
      return;
    }

    var messageElement = '<div flex class="messageWrap"><div ';

    if (context === 'user') {
      // With context of 'user' we give the element class of userMessage.
      messageElement += 'class="userMessage">';
    } else if (context === 'robot') {
      // With context of 'robot' we give the element class of robotMessage.
      // These two class types define separate styling
      messageElement += 'class="robotMessage">';
    }

    messageElement += ('<p>' + message + '</p></div></div>');

    chatBox.append(messageElement);

    // This makes sure the chatbox follows new messages as they cause overflow
    chatWrap[0].scrollTop = chatWrap[0].scrollHeight;
  }

}]);
