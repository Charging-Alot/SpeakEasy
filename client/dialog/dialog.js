angular.module('speakEasy')

.controller('DialogCtrl', ['$scope', 'Auth', "Dialog", function ($scope, Auth, Dialog) {
	$scope.dialogMessage = "Fizzle my bizzle";
	$scope.user = {};
	$scope.secondPass;

	$scope.login = function () {
		Auth.login($scope.user).then(function (token) {
				$scope.user = {};
				$window.localStorage.setItem('com.speakEasy', token);
				$scope.closeDialog();
			})
			.catch(function (error) {
				console.error(error);
			});
	}

	$scope.closeDialog = function () {
		Dialog.closeWindow();
	}

	$scope.signup = function () {
		Auth.signup($scope.user)
			.then(function (token) {
				$scope.user = {};
				$scope.secondPass = '';
				$window.localStorage.setItem('com.speakEasy', token);
				$scope.closeDialog();
			})
			.catch(function (error) {
				console.error(error);
			});
	}

	$scope.goToSignup = function (ev) {
		Dialog.closeWindow();
		Dialog.signupWindow(ev, $scope);
	}



}]);