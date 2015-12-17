angular.module('speakEasy', [
  'ngMaterial',
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

.run(function ($rootScope, $location, $state, Auth, Dialog) {
  // here inside the run phase of angular, our services and controllers
  // have just been registered and our app is ready
  // however, we want to make sure the user is authorized
  // we listen for when angular is trying to change routes
  // when it does change routes, we then look for the token in localstorage
  // and send that token to the server to see if it is a real user or hasn't expired
  // if it's not valid, we then redirect back to signin/signup
  $rootScope.$on('$stateChangeStart', function (evt, next, current) {
    console.log('run.evt', evt, 'run.next', next, 'run.current', current)
    if ( next.name === "chat" && !Auth.isAuth() ) {
      console.log('statechange if statement')
      evt.preventDefault();
      //$state.go('landing');
      Dialog.loginWindow();
      //$rootScope.$broadcast('badJwt');
    }
    // if (next.$$route && next.$$route.authenticate && !Auth.isAuth()) {
    //   $location.path('/signin');
    // }
  });
});

  // this is an $httpInterceptor
  // its job is to stop all out going requests
  // then look in local storage and find the user's token
  // then add it to the header so the server can validate the request
// .factory('AttachTokens', function ($window, user, $rootScope) {
//   var attach = {
//     request: function (object) {
//       var jwt = $window.localStorage.getItem('com.shortly');
//       if (jwt) {
//         object.headers['x-access-token'] = jwt;
//       }
//       object.headers['Allow-Control-Allow-Origin'] = '*';
//       return object;
//     }
//   };
//   return attach;
// })

