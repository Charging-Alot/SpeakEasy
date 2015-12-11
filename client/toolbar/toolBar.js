angular.module('speakEasy')

.controller('toolBarCtrl', ['$scope','$mdDialog', '$mdMedia', '$state', function ($scope, $mdDialog, $mdMedia, $state, Auth) {
	$scope.goToLogin = function(ev) {
    $mdDialog.show({
      controller: userCtrl,
      templateUrl: 'user/login.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: $mdMedia('sm') && $scope.customFullscreen
    })
    .then(function(answer) {
      $scope.status = 'You said the information was "' + answer + '".';
    }, function() {
      $scope.status = 'You cancelled the dialog.';
    });
    $scope.$watch(function() {
      return $mdMedia('sm');
    }, function(sm) {
      $scope.customFullscreen = (sm === true);
    });
  }

  $scope.goToLanding = function () {
    console.log("GOING TO goToLanding")
    $state.go('landing');
  }

	$scope.goToInfo = function () {
		console.log("GOING TO goToInfo")
    $state.go('about');

	}

	$scope.goToChat = function () {
		console.log("GOING TO goToChat")
    $state.go('chat');
	}

	$scope.goToDownload = function (ev) {
		console.log("GOING TO goToDownload")
    $mdDialog.show({
      controller: userCtrl,
      templateUrl: 'download/download.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: $mdMedia('sm') && $scope.customFullscreen
    })
    .then(function(answer) {
      $scope.status = 'You said the information was "' + answer + '".';
    }, function() {
      $scope.status = 'You cancelled the dialog.';
    });
    $scope.$watch(function() {
      return $mdMedia('sm');
    }, function(sm) {
      $scope.customFullscreen = (sm === true);
    });
	}
	
	$scope.goToMetrics = function () {
		console.log("GOING TO goToMetrics")

	}

}]);

function userCtrl ($scope, $mdDialog, $mdMedia, $state, Auth) {
  $scope.goToSignup = function(ev) {
    $mdDialog.show({
      controller: userCtrl,
      templateUrl: 'user/signup.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: $mdMedia('sm') && $scope.customFullscreen
    })
    .then(function(answer) {
      $scope.status = 'You said the information was "' + answer + '".';
    }, function() {
      $scope.status = 'You cancelled the dialog.';
    });
    $scope.$watch(function() {
      return $mdMedia('sm');
    }, function(sm) {
      $scope.customFullscreen = (sm === true);
    });
  }
  
  $scope.user = {};
  $scope.login = function () {
    console.log('logging into SkyNet!', $scope.user);
    Auth.login($scope.user)
      .then(function (token) {
        $window.localStorage.setItem('com.speakEasy', token);
        $location.path('/links'); // this path is wrong... where should it go?
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  $scope.signup = function () {
    console.log('signing up to build SkyNet!', $scope.user);
    Auth.signup($scope.user)
      .then(function (token) {
        $window.localStorage.setItem('com.speakEasy', token);
        $location.path('/links'); // this path is wrong... where should it go?
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  $scope.closeDialog = function () {
    $mdDialog.hide();
  }

  $scope.downloadExtension = function () {
    console.log("Downloading Chrome Extension!");
  }

}
