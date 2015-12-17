angular.module('speakEasy')

.controller('toolBarCtrl', ['$scope','$mdDialog', '$mdMedia', '$state', '$window', '$rootScope', 'Auth', 'Dialog', function ($scope, $mdDialog, $mdMedia, $state, $window, $rootScope, Auth, Dialog) {
  $scope.goToLogin = function (ev) {
    Dialog.loginWindow(ev, $scope);
  }
	// $scope.goToLogin = function(ev) {
 //    $mdDialog.show({
 //      controller: userCtrl,
 //      templateUrl: 'user/login.html',
 //      parent: angular.element(document.body),
 //      targetEvent: ev,
 //      clickOutsideToClose:true,
 //      fullscreen: $mdMedia('sm') && $scope.customFullscreen
 //    })
 //    .then(function(answer) {
 //      $scope.status = 'You said the information was "' + answer + '".';
 //    }, function() {
 //      $scope.status = 'You cancelled the dialog.';
 //    });
 //    $scope.$watch(function() {
 //      return $mdMedia('sm');
 //    }, function(sm) {
 //      $scope.customFullscreen = (sm === true);
 //    });
 //  }

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
    console.log("token cheeckkk!",$window.localStorage.getItem('com.speakEasy'));
    $state.go('chat');
    // var jwt = $window.localStorage.getItem('com.speakEasy');
    // if (jwt) {
    //   console.log('theres jwt!!')
    //   $state.go('chat');
    //   $window.localStorage.removeItem('com.speakEasy');
    // } else {
    //  $scope.goToLogin();
    //}


    // original
    //$state.go('chat');
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
    $window.localStorage.removeItem('com.speakEasy');

	}

  $rootScope.$on('badJwt', 
    function() { 
      console.log('EMMMMIITTTTT')
      $scope.goToLogin(); 
    } );

}]);

function userCtrl ($scope, $mdDialog, $mdMedia, $state, $window, Auth, Dialog) {
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
  
  $scope.submit = function () {
    console.log('calling dialog submit')
    Dialog.hideWindow();
  }

  $scope.user = {};
  $scope.secondPass;
  $scope.login = function () {
    console.log('logging into SkyNet!', $scope.user);
    Auth.login($scope.user)
      .then(function (token) {
        $scope.user = {};
        $window.localStorage.setItem('com.speakEasy', token);
        $scope.closeDialog();
        //$location.path('/landing'); // this path is wrong... where should it go?
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  $scope.signup = function () {
    console.log('signing up to build SkyNet!', $scope.user);
    Auth.signup($scope.user)
      .then(function (token) {
        $scope.user = {};
        $scope.secondPass = '';
        console.log('signup set token')
        $window.localStorage.setItem('com.speakEasy', token);
        $scope.closeDialog();
        //$location.path('/landing'); // this path is wrong... where should it go?
      })
      .catch(function (error) {
        console.log('SIGNUP ERROR IN TOOLBAR')
        console.error(error);
      });
  }

  $scope.closeDialog = function () {
    Dialog.closeWindow();
  }

  $scope.downloadExtension = function () {
    console.log("Downloading Chrome Extension!");
  }

}
