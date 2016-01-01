angular.module('speakEasy', [
  'ngMaterial',
  'ui.router',
  'chart.js', // required for angular-chart.js
  'speakEasy.home', //should need as a separate module
  'speakEasy.services',
  'speakEasy.chat',
  'speakEasy.about'
])

.config(function ($stateProvider, $urlRouterProvider, $mdThemingProvider) {
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
    .extendPalette('blue', {
      // 'A100': '#FFFFFF'
      'A100': '#E3F2FD'
        // 'A100': '#EAF1F5' // original chart color
    }); // prev: '#CFD8DC'

  $mdThemingProvider.definePalette('background', background);

  $mdThemingProvider
    .theme('default')
    .primaryPalette('blue')
    .accentPalette('deep-orange')
    .warnPalette('red', {
      'default': '900'
    })
    .backgroundPalette('background');

})

.run(function ($rootScope, $location, $state, Auth, Dialog) {
  // This sets us up to watch for a change of state to the chat page.
  // We want to protect that page to avoid random spam etc., so we check to see 
  // if the user is authorized.  If they're not, we prevent the state change and 
  // open the login window
  $rootScope.$on('$stateChangeStart', function (evt, next, current) {
    if (next.name === "chat" && !Auth.isAuth()) {
      evt.preventDefault(); // this prevents state change, protecting the chat page
      Dialog.loginWindow();
    }
  });

  // Snaps to the top of the page when a view changes, so the user isn't randomly halfway down
  // the page after clicking a new link
  $rootScope.$on('$stateChangeSuccess', function (evt, next, current) {
    window.scrollTo(0, 0);
  });

  // If the user has our token, we render the logout button instead of the login button
  if (Auth.isAuth()) {
    // swaps out loginButton for logoutButton
    Auth.elementSwap('.logoutButton', '.loginButton');
  }

});
