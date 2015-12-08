angular.module('speakEasy', [
  'ngMaterial',
  'ngMessages',
  'ui.router',
  'speakEasy.home', //should need as a separate module
  'speakEasy.services'
])

.config( function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/landing');

  $stateProvider
    .state('/', {
      redirectTo: '/landing'
    })
    .state('home', {
      url: '/home',
      templateUrl: '/home/home.html',
      controller: 'HomeCtrl'
    })
    .state('landing', {
      url: '/landing',
      templateUrl: '/landing/landing.html',
      controller: 'LandingCtrl'
    })
    .state('about', {
      url: '/about',
      templateUrl: '/about/about.html',
      controller: 'AboutCtrl'
    })

    //$httpProvider.interceptors.push('AttachTokens');
})

.factory('AttachTokens', function ($window,user,$rootScope) {
  var attach = {
    request: function (object) {
      var jwt = $rootScope.authToken;
      if (jwt) {
        object.data['x-access-token'] = jwt;
      }
      object.headers['Allow-Control-Allow-Origin'] = '*';
      return object;
    }
  };
  return attach;
})
