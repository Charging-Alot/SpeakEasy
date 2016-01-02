// angular.module('speakEasy.portrait', [])

// .controller('PortraitCtrl', ['$http', '$location', '$window', '$mdDialog', '$mdMedia', function ($http, $location, $window, $mdDialog, $mdMedia) {
//     // We receive context from our on-click event in about.js which is a link to the proper html file
//   var info = {
//     andy: {
//       name: 'Andrew Vickory',
//       portrait: "http://pre07.deviantart.net/5b03/th/pre/f/2013/246/5/5/cyclops_by_davidrapozaart-d6kya2b.jpg",
//       p1: "Our Chrome Extension will borrow a small bit of your processing power, which will be used to help SpeakEasy learn faster.",
//       p2: "You'll be able to turn this off at any time with the click of a button within the Extension's menu.",
//       p3: "Here's more stuff to fill in the page. And just a little bit more to see.",
//       gitHubLink: 'https://github.com/AVickory',
//       linkedInLink: 'https://www.linkedin.com/in/andrewvickory'
//     },
//     will: {
//       name: 'Will Dembinski',
//       portrait: "http://pre07.deviantart.net/5b03/th/pre/f/2013/246/5/5/cyclops_by_davidrapozaart-d6kya2b.jpg",
//       p1: "Our Chrome Extension will borrow a small bit of your processing power, which will be used to help SpeakEasy learn faster.",
//       p2: "You'll be able to turn this off at any time with the click of a button within the Extension's menu.",
//       p3: "Here's more stuff to fill in the page. And just a little bit more to see.",
//       gitHubLink: 'https://github.com/willdembinski',
//       linkedInLink: 'https://www.linkedin.com/in/willdembinski'
//     },
//     laura: {
//       name: 'Laura Gelston',
//       portrait: "http://pre07.deviantart.net/5b03/th/pre/f/2013/246/5/5/cyclops_by_davidrapozaart-d6kya2b.jpg",
//       p1: "Our Chrome Extension will borrow a small bit of your processing power, which will be used to help SpeakEasy learn faster.",
//       p2: "You'll be able to turn this off at any time with the click of a button within the Extension's menu.",
//       p3: "Here's more stuff to fill in the page. And just a little bit more to see.",
//       gitHubLink: 'https://github.com/gelsto',
//       linkedInLink: 'https://www.linkedin.com/in/laura-gelston-2782852b'
//     },
//     sam: {
//       name: 'Sam Crawford',
//       portrait: "http://pre07.deviantart.net/5b03/th/pre/f/2013/246/5/5/cyclops_by_davidrapozaart-d6kya2b.jpg",
//       p1: "Our Chrome Extension will borrow a small bit of your processing power, which will be used to help SpeakEasy learn faster.",
//       p2: "You'll be able to turn this off at any time with the click of a button within the Extension's menu.",
//       p3: "Here's more stuff to fill in the page. And just a little bit more to see.",
//       gitHubLink: 'https://github.com/RS-Crawford',
//       linkedInLink: 'https://www.linkedin.com/in/robertscrawford'
//     }
//   }

//   $scope.name;
//   $scope.portrait;
//   $scope.p1;
//   $scope.p2;
//   $scope.p3;
//   $scope.gitHubLink;
//   $scope.linkedInLink;

//   $scope.portraitWindow = function (ev, $scope, context) {
//     var context = info.context;
//     $scope.name = context.name;
//     $scope.portrait = context.portrait;
//     $scope.p1 = context.p1;
//     $scope.p2 = context.p2;
//     $scope.p3 = context.p3;
//     $scope.gitHubLink = context.gitHubLink;
//     $scope.linkedInLink = context.linkedInLink;

//     $mdDialog.show({
//         templateUrl: 'portrait/portrait.html',
//         parent: angular.element(document.body),
//         targetEvent: ev,
//         clickOutsideToClose: true,
//         fullscreen: $mdMedia('sm') && $scope.customFullscreen
//       })
//       .then(function () {
//         console.log('DIALOGUE SUCCESS STATUS')
//       }, function () {
//         $scope.status = 'You cancelled the dialog.';
//         console.log('DIALOGUE FAIL STATUS', $scope.status)
//       });
//   }

//   $scope.closeWindow = function () {
//     $mdDialog.cancel();
//   }

//   $scope.hideWindow = function () {
//     console.log('dialog submit called')
//     $mdDialog.hide();
//   }

// }])
