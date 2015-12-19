angular.module('speakEasy')

.controller('DialogCtrl', ['$window', '$scope', 'Auth', 'Dialog', function ($window, $scope, Auth, Dialog) {
	$scope.dialogMessage = "Fizzle my bizzle";
	$scope.user = {};

	$scope.login = function () {
		Auth.login($scope.user).then(function (token) {
				$scope.user = {};
				$window.localStorage.setItem('com.speakEasy', token);
				Auth.loginSwap();
				$scope.closeDialog();
			})
			.catch(function (error) {
				console.error(error);
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
				Auth.loginSwap();
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
