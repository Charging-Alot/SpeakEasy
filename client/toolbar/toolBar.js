angular.module('speakEasy')

.controller('toolBarCtrl', ['$scope','$mdDialog', '$mdMedia', function ($scope, $mdDialog, $mdMedia) {
	$scope.goToUser = function(ev) {
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

	$scope.goToInfo = function () {
		console.log("GOING TO goToInfo")


	}

	$scope.goToChat = function () {
		console.log("GOING TO goToChat")
		
	}

	$scope.goToDownload = function () {
		console.log("GOING TO goToDownload")

	}
	
	$scope.goToMetrics = function () {
		console.log("GOING TO goToMetrics")

	}

  // methods to be used inside home.html
}]);

function userCtrl ($scope, $mdDialog, $mdMedia) {
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

  $scope.login = function () {
    console.log('logging into SkyNet!')
  }

  $scope.signup = function () {
    console.log('signing up to build SkyNet!')
  }
}
