angular.module('speakEasy.about', [])

.controller('AboutCtrl', ['$scope','$mdDialog', '$mdMedia', '$state', function ($scope, $mdDialog, $mdMedia, $state) {
  
  // The relationships object creates the connections between the clicked profile and the
  // info page that will shift in, and the card that will shift out
  var relationships = {
    // Card A (the ng339 value is the JSON.stringify return of $event.currentTarget after a click)
    '{"ng339":26}': {
      'info': document.querySelector('.cardAInfo'),
      'neighbor': document.querySelector('.cardB')
    },
    // Card B
    '{"ng339":31}': {
      'info': document.querySelector('.cardBInfo'),
      'neighbor': document.querySelector('.cardC')
    },
    // Card C
    '{"ng339":36}': {
      'info': document.querySelector('.cardCInfo'),
      'neighbor': document.querySelector('.cardB')
    },
    // Card D
    '{"ng339":41}': {
      'info': document.querySelector('.cardDInfo'),
      'neighbor': document.querySelector('.cardC')
    }
  }

  var expander = angular.element(document.querySelector('.testCard'));
  console.log(expander)
  $scope.animate = function ($event) {
    console.log('ANIMATIONNN!');
    console.log('ev', $event.currentTarget)
    var element = $event.currentTarget;
    // Here we get the 'ng339' value, which is a key in the relationships object
    var stringified = JSON.stringify(element);
    console.log(JSON.stringify(element))
    // Here we establish the context of our click via the relationships object
    var context = relationships[stringified];
    console.log('context', context)
    console.log('context k/v', context.info, context.neighbor);
    //element.style.width = '0%'
    var numUp = 0;
    var numDown = 25;
    var fn = function () {
      numUp += 1;
      numDown -= 1;
      context.info.style.width = '' + numUp + '%';
      context.neighbor.style.width = String(numDown) + '%';
      if ( context.info.style.width === '5%' )  {
        context.info.style.display = 'block';
      }
      if ( context.info.style.width === '25%' ) {
        return;
      }
      if ( context.neighbor.style.width === '5%' ) {
        context.neighbor.style.display = 'none';
      }
      a();
    };
    var a = function() {setTimeout(fn, 100)}
    a();
  }
}]);
