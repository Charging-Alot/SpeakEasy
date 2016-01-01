angular.module('speakEasy.chat', [])

.factory('ChatFactory', function ($http, $location, $window) {
  // This sends an http request with message data to /marvin, which gets routed by our proxy server to
  // our dedicated python server which uses the data to calculate and return our AI's response
  var serveMessage = function (message) {
    // The Marvin AI expects data to be a json object formatted as seen below
    message = { 'prompt': message.text };
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
    // We also want to prevent super long messages
    if ( $scope.message.text.length > 140 ) {
      $scope.renderMessage('robot', "Sorry, your message was too long! Try sending me something shorter next time.");
      $scope.message = {};
      return;
    }
    
    // hold onto message data to allow us to reset the $scope.message object
    var messageHolder = $scope.message;
    // this resets message to blank, but importantly also clears the message field
    $scope.message = {};
    $scope.renderMessage('user', messageHolder.text);
    chatBox.append('<img class="pendingGif" src="assets/img/pending.gif">');
    // This makes sure the chatbox follows the pending gif as it causes overflow
    chatWrap[0].scrollTop = chatWrap[0].scrollHeight;
    // We grab the gif we just appended in order to remove it when necessary
    var pendingGif = angular.element(document.querySelector('.pendingGif'));

    ChatFactory.serveMessage(messageHolder)
      .then(function (data) {
        pendingGif[0].parentNode.removeChild(pendingGif[0]);
        $scope.renderMessage('robot', data.response);
      })
      .catch(function (error) {
        console.error(error);
      });

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

  // Marvin's opening message to make the purpose of the chat page/messaging box more clear
  $scope.renderMessage('robot', "Hi! I'm Marvin. Talk to me by entering messages below!");

  // Chart data goes down here
  // $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
  // $scope.series = ['Series A', 'Series B'];
  // $scope.data = [
  //   [65, 59, 80, 81, 56, 55, 40],
  //   [28, 48, 40, 19, 86, 27, 90]
  // ];

  $scope.chartColors = 
    [{ 
      "fillColor": "#E3F2FD",
      "pointColor": "#64B5F6",
      "strokeColor": "#1976D2"
    }];

  $scope.labels = ['', '', '', '',
                   '', '', '', '',
                   '', '', '', '',
                   '', '', '', '', ''];
  $scope.data = [
    [440, 160, 120, 100, 90, 70, 60, 50, 45, 40, 35, 30, 25, 22, 18, 19, 20] // 17
  ];
  $scope.series = ['Overall Complexity'];
  
}]);
