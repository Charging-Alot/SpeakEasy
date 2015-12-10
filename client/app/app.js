angular.module('speakEasy', [
  'ngMaterial',
  'ngMessages',
  'ui.router',
  'speakEasy.home', //should need as a separate module
  'speakEasy.services'
])

.config( function ($stateProvider, $urlRouterProvider, $mdThemingProvider) {
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
    

    // As described in styles.css, background color can be a little funky in Material
    // So these settings combined with .backgroundPalette('background') get us to where
    // we want to be in terms of control
    
    var background = $mdThemingProvider
                    .extendPalette('grey', { 'A100': '#CFD8DC' }); // prev: 'f2f2f2'

    $mdThemingProvider.definePalette('background', background);

    $mdThemingProvider
      .theme('default')
      .primaryPalette('blue')
      .accentPalette('orange')
      .warnPalette('red', { 'default': '900' })
      .backgroundPalette('background');

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
