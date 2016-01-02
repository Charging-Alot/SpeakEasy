angular.module('speakEasy')

.controller('DialogCtrl', ['$window', '$scope', '$location', 'Auth', 'Dialog', function ($window, $scope, $location, Auth, Dialog) {
  $scope.dialogMessage = '';
  $scope.user = {};

  $scope.login = function () {
    Auth.login($scope.user).then(function (data) {
        if ( data.token ) {
          console.log('TOKENNN', data.token)
          $scope.user = {};
          $window.localStorage.setItem('com.speakEasy', data.token);
          Auth.elementSwap('.logoutButton', '.loginButton');
          if ( $location.$$path === '/landing' ) {
            Auth.elementSwap('.landingChatButton', '.landingLoginButton');
          }
          $scope.closeDialog();
        } else if ( data.message ) {
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
