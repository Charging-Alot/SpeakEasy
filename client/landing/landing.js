angular.module('speakEasy')

.controller('LandingCtrl', ['$scope', '$interval', 'Auth', function ($scope, $interval, Auth) {
   // If the user has our token, we render the chat button instead of the login button
  if ( Auth.isAuth() ) {
    // landing's loginButton out, chatButton in
    Auth.elementSwap('.landingChatButton', '.landingLoginButton');
  }

  var maximum = document.getElementById('container').clientWidth / 2 || 300;
  $scope.data = [
    []
  ];

  $scope.chartColors = 
    [{ 
      "fillColor": "#E3F2FD",
      "pointColor": "#64B5F6",
      "strokeColor": "#1976D2"
    }];
  $scope.labels = [];
  $scope.options = {
    animation: false,
    showScale: false,
    showTooltips: false,
    pointDot: false,
    datasetStrokeWidth: 0.5
  };

  // Update the dataset at 25FPS for a smoothly-animating chart
  $interval(function () {
    getLiveChartData();
  }, 40);

  function getLiveChartData() {
    if ($scope.data[0].length) {
      $scope.labels = $scope.labels.slice(1);
      $scope.data[0] = $scope.data[0].slice(1);
    }

    while ($scope.data[0].length < maximum) {
      $scope.labels.push('');
      $scope.data[0].push(getRandomValue($scope.data[0]));
    }
  }

  function getRandomValue(data) {
    var l = data.length,
      previous = l ? data[l - 1] : 50;
    var y = previous + Math.random() * 10 - 5;
    return y < 0 ? 0 : y > 50 ? 50 : y;
  }
}]);
