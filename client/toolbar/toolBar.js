angular.module('speakEasy')

.controller('toolBarCtrl', ['$scope', '$mdDialog', '$mdMedia', '$state', '$window', '$rootScope', 'Dialog', 'Auth', function ($scope, $mdDialog, $mdMedia, $state, $window, $rootScope, Dialog, Auth) {

  $scope.goToLogin = function (ev) {
    Dialog.loginWindow(ev, $scope);
  }

  $scope.goToLanding = function () {
    $state.go('landing');
  }

  $scope.goToSignup = function () {
    $state.go('signup');
  }

  $scope.goToInfo = function () {
    $state.go('about');
  }

  $scope.goToChat = function () {
    $state.go('chat');
  }

  $scope.goToMetrics = function () {
    $state.go('metrics');
  }

  $scope.signout = function () {
    Auth.signout();
  }

}]);
