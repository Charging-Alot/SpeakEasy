angular.module('speakEasy', [
  'ngMaterial',
  'ui.router',

  'starter.home'
])

.config( function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/home');

  $stateProvider
    .state('/', {
      redirectTo: '/home'
    })
    .state('home', {
      url: '/home',
      templateUrl: '/home/home.html',
      controller: 'HomeCtrl'
    })
})
/**
 * Create an array of all the right files in the source dir
 * @param      {String}   Some stuffff
 * @param      {Object}   Some more stuffff
 * @param      {Function} Some callback stufff
 * @return     {Array} return a thing that is arrr
 */

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
