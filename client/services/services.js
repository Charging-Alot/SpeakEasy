angular.module('speakEasy.services', [])

.factory('Dialog', ['Auth', '$http', '$location', '$window', '$mdDialog', '$mdMedia', function (Auth, $http, $location, $window, $mdDialog, $mdMedia) {

  var loginWindow = function (ev, $scope) {
    $mdDialog.show({
        templateUrl: 'dialog/login.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        fullscreen: $mdMedia('sm') && $scope.customFullscreen
      })
      .then(function () {
        console.log('DIALOGUE SUCCESS STATUS')
        Auth.login();
      }, function () {
        $scope.status = 'You cancelled the dialog.';
        console.log('DIALOGUE FAIL STATUS', $scope.status)
      });
    $scope.$watch(function () {
      return $mdMedia('sm');
    }, function (sm) {
      $scope.customFullscreen = (sm === true);
    });
  }

  var signupWindow = function (ev, $scope) {
    $mdDialog.show({
        templateUrl: 'dialog/signup.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        fullscreen: $mdMedia('sm') && $scope.customFullscreen
      })
      .then(function (answer) {
        console.log("Bizzle")
        $scope.status = 'You said the information was "' + answer + '".';
      }, function () {
        console.log("Fizzle")
        $scope.status = 'You cancelled the dialog.';
      });
    $scope.$watch(function () {
      return $mdMedia('sm');
    }, function (sm) {
      $scope.customFullscreen = (sm === true);
    });
  }

  var downloadWindow = function (ev, $scope) {
    console.log("GOING TO goToDownload")
    $mdDialog.show({
        controller: userCtrl,
        templateUrl: 'download/download.html',
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

  var closeWindow = function () {
    $mdDialog.cancel();
  }

  var hideWindow = function () {
    console.log('dialog submit called')
    $mdDialog.hide();
  }

  return {
    loginWindow: loginWindow,
    signupWindow: signupWindow,
    downloadWindow: downloadWindow,
    closeWindow: closeWindow,
    hideWindow: hideWindow
  };

}])

.factory('Auth', function ($http, $location, $window) {
  // Don't touch this Auth service!!!
  // it is responsible for authenticating our user
  // by exchanging the user's username and password
  // for a JWT from the server
  // that JWT is then stored in localStorage as 'com.shortly'
  // after you signin/signup open devtools, click resources,
  // then localStorage and you'll see your token from the server
  var login = function (user) {
    console.log('Auths login')
    return $http({
        method: 'POST',
        url: '/api/users/signin',
        data: user
      })
      .then(function (resp) {
        return resp.data.token;
      });
  };

  var signup = function (user) {
    console.log('Auths signup')
    return $http({
        method: 'POST',
        url: '/api/users/signup',
        data: user
      })
      .then(function (resp) {
        return resp.data.token;
      });
  };

  var isAuth = function () {
    console.log('Auth.isAuth', !!$window.localStorage.getItem('com.speakEasy'))
    return !!$window.localStorage.getItem('com.speakEasy');
  };

  var signout = function () {
    $window.localStorage.removeItem('com.speakEasy');
    $location.path('/landing');
  };

  return {
    login: login,
    signup: signup,
    isAuth: isAuth,
    signout: signout
  };
});