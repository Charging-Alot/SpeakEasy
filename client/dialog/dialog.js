angular.module('speakEasy')

.controller('DialogCtrl', ['$window', '$scope', '$location', 'Auth', 'Dialog', function ($window, $scope, $location, Auth, Dialog) {
  $scope.dialogMessage = '';
  $scope.user = {};

  $scope.login = function () {
    Auth.login($scope.user).then(function (data) {
        if ( data.token ) {
          $scope.user = {};
          $window.localStorage.setItem('com.speakEasy', data.token);
          Auth.elementSwap('.logoutButton', '.loginButton');
          if ( $location.$$path === '/landing' ) {
            Auth.elementSwap('.landingChatButton', '.landingLoginButton');
          }
          $scope.closeDialog();
        } else if ( data.message ) {
          // We need to display the error message, so we find it and change its display
          var errorElement = angular.element(document.querySelector('.dialogErrorMessage'));
          errorElement[0].style.display = 'block';
          // This sets the on-page text to the error message that was returned
          $scope.dialogMessage = data.message;
        }
      })
      .catch(function (error, message) {
        console.error(error, message);
        $scope.dialogMessage = message;
      });
  };

  $scope.closeDialog = function () {
    console.log("Def firing")
    Dialog.closeWindow();
  }

  $scope.signup = function () {
    Auth.signup($scope.user)
      .then(function (token) {
        $scope.user = {};
        $window.localStorage.setItem('com.speakEasy', token);
        Auth.elementSwap('.logoutButton', '.loginButton');
        if ( $location.$$path === '/landing' ) {
          Auth.elementSwap('.landingChatButton', '.landingLoginButton');
        }
        $scope.closeDialog();
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  $scope.goToSignup = function (ev) {
    Dialog.signupWindow(ev, $scope);
  };
}]);
