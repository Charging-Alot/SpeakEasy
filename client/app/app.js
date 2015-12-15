angular.module('speakEasy', [
  'ngMaterial',
  'ngMessages', // messages may not be necessary since they don't work in md-dialogs
  'ui.router',
  'speakEasy.home', //should need as a separate module
  'speakEasy.services',
  'speakEasy.chat',
  'speakEasy.about'
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
    .state('chat', {
      url: '/chat',
      templateUrl: '/chat/chat.html',
      controller: 'ChatCtrl'
    })
    

    // As described in styles.css, background color can be a little funky in Material
    // So these settings combined with .backgroundPalette('background') get us to where
    // we want to be in terms of control (also after being coupled with the CSS changes)

    var background = $mdThemingProvider
                    .extendPalette('grey', { 'A100': '#CFD8DC' }); // prev: 'f2f2f2'

    $mdThemingProvider.definePalette('background', background);

    $mdThemingProvider
      .theme('default')
      .primaryPalette('blue')
      .accentPalette('deep-orange')
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
