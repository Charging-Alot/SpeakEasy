angular.module('speakEasy')

.controller('toolBarCtrl', ['$scope', '$mdDialog', '$mdMedia', '$state', '$window', '$rootScope', 'Dialog', function ($scope, $mdDialog, $mdMedia, $state, $window, $rootScope, Dialog) {
  $scope.goToLogin = function (ev) {
    Dialog.loginWindow(ev, $scope);
  }

  $scope.goToDownload = function (ev) {
    Dialog.downloadWindow(ev, $scope);
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

}]);
//  ____                               _   _               
// / ___|  ___  _ __ ___   ___    ___ | |_| |__   ___ _ __ 
// \___ \ / _ \| '_ ` _ \ / _ \  / _ \| __| '_ \ / _ \ '__|
//  ___) | (_) | | | | | |  __/ | (_) | |_| | | |  __/ |   
// |____/ \___/|_| |_| |_|\___|  \___/ \__|_| |_|\___|_|   

//      _          __  __ 
//  ___| |_ _   _ / _|/ _|
// / __| __| | | | |_| |_ 
// \__ \ |_| |_| |  _|  _|
// |___/\__|\__,_|_| |_|


function userCtrl($scope, $mdDialog, $mdMedia, $state, $window, Auth, Dialog) {
  $scope.goToSignup = function (ev) {
    $mdDialog.show({
        controller: userCtrl,
        templateUrl: 'user/signup.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        fullscreen: $mdMedia('sm') && $scope.customFullscreen
      })
      .then(function (answer) {
        $scope.status = 'You said the information was "' + answer + '".';
      }, function () {
        $scope.status = 'You cancelled the dialog.';
      });
    $scope.$watch(function () {
      return $mdMedia('sm');
    }, function (sm) {
      $scope.customFullscreen = (sm === true);
    });
  }

  $scope.submit = function () {
    console.log('calling dialog submit')
    Dialog.hideWindow();
  }

  $scope.downloadExtension = function () {
    console.log("Downloading Chrome Extension!");
  }

}