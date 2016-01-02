angular.module('speakEasy.services', [])

.factory('Dialog', ['Auth', '$http', '$location', '$window', '$mdDialog', '$mdMedia', function (Auth, $http, $location, $window, $mdDialog, $mdMedia) {

  // Opens the login dialog window
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

  // Opens the signup dialog window
  var signupWindow = function (ev, $scope) {
    $mdDialog.show({
        templateUrl: 'dialog/signup.html',
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

  // Custom functions to close dialog windows independent of clicking outside the window,
  // since that functionality may not be clear to all users
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
    closeWindow: closeWindow,
    hideWindow: hideWindow
  };

}])

.factory('Auth', function ($http, $location, $window) {

  // The entire purpose of logging in and signing up is to give our users tokens
  // which authorize them to use certain parts of the site (and let us keep tabs
  // on what they're doing)
  var login = function (user) {
    console.log('Auths login')
    return $http({
        method: 'POST',
        url: '/api/users/signin',
        data: user
      })
      .then(function (resp) {
        console.log('Auth login resp', resp)
        return resp.data;
      });
  };

  var signup = function (user) {
    return $http({
        method: 'POST',
        url: '/api/users/signup',
        data: user
      })
      .then(function (resp) {
        return resp.data.token;
      });
  };

  // We occasionally check if a user is or isn't authorized for protected parts of the site and
  // rendering certain elements
  var isAuth = function () {
    return !!$window.localStorage.getItem('com.speakEasy');
  };

  var signout = function () {
    $window.localStorage.removeItem('com.speakEasy');
    elementSwap('.loginButton', '.logoutButton');
    // If we're on the landing, change the main chat button to a login button because
    // only logged in users can access the chat page
    if ( $location.$$path === '/landing' ) {
      elementSwap('.landingLoginButton', '.landingChatButton');
    }
    // Protect the chat page by returning users to landing after logging out
    if ( $location.$$path === '/chat' ) {
      $location.path('/landing');
    }
  };

  // Takes two classes for one element to be shown (swapIn) and another to be hidden (swapOut)
  // then changes their styles. Ex: In order to change Login button to Signout button
  var elementSwap = function (swapIn, swapOut) {
    var inElement = angular.element(document.querySelector(swapIn));
    var outElement = angular.element(document.querySelector(swapOut));
    outElement[0].style.display = 'none';
    inElement[0].style.display = 'block';
  }

  return {
    login: login,
    signup: signup,
    isAuth: isAuth,
    signout: signout,
    elementSwap: elementSwap
  };
});
