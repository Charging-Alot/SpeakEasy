angular.module('speakEasy.about', [])

.controller('AboutCtrl', ['$scope', '$mdDialog', '$mdMedia', '$state', 'Auth', function ($scope, $mdDialog, $mdMedia, $state, Auth) {

  // There's a big wall of text on the about page, but most of it is hidden. $scope.aboutMore is
  // triggered by a "more text" link. It swaps out the link and swaps in all the extra text.
  $scope.aboutMore = function () {
    Auth.elementSwap('.aboutExtra', '.aboutMore');
  }

  // This hides all the extra text and puts the "more text" link back
  $scope.aboutLess = function () {
    Auth.elementSwap('.aboutMore', '.aboutExtra');
  }

  // These are links to other parts of the site mentioned in the big wall of text
  $scope.goToChat = function () {
    $state.go('chat');
  }

  // Context will be defined later with a team member object in the info object that will
  // determine changes to $scope variables rendered in our personal bio window
  var context;

  // Each member of the team has an object in info with our name, pic, links etc.  This info is used to set
  // $scope variables by on-click functions defined below and is used to render portrait.html dynamically

  var info = {
    andy: {
      name: 'Andrew Vickory',
      portrait: "../assets/img/andyheadshot.jpg",
      p1: "Andrew is excited to be a part of SpeakEasy and to share his love of algorithms with the world. He was responsible for writing the distributed learning algorithm which we use to train Marvin how to speak.",
      p2: "A San Francisco transplant from Portland, Oregon, Andrew recently completed a bachelor degree in mechanical engineering at Carnegie Mellon University, and, realizing that he was unlikely to become Iron Man in the near futue, decided to take a detour into machine learning and computer science.",
      //p3: "He is a proud alumnus of the Hack Reactor Immersive Software Engineering program.",
      gitHubLink: 'https://github.com/AVickory',
      linkedInLink: 'https://www.linkedin.com/in/andrewvickory'
    },
    will: {
      name: 'Will Dembinski',
      portrait: "../assets/img/willheadshot.jpg",
      p1: "Will spearheaded our server deployment team and implemented the 'distributed' portion of SpeakEasy's distributed Neural Network using WebRTC. He believes that machine learning is literally the future of computing.",
      p2: "He's also enormously interested in all forms of cryptography and considers himself the world's foremost public-key encryption enthusiast.",
      p3: "He graduated from UCSB with a BS in Biospychology and a BA in Spanish Language.",
      gitHubLink: 'https://github.com/willdembinski',
      linkedInLink: 'https://www.linkedin.com/in/willdembinski'
    },
    laura: {
      name: 'Laura Gelston',
      portrait: "../assets/img/lauraheadshot.jpg",
      p1: "Laura used Google’s Tensorflow library to build our python-based model that detects patterns in conversational data she mined from Reddit comments.",
      p2: "She graduated with an MS in Molecular Microbiology and Immunology from Johns Hopkins in 2013 and is interested in technologies that drive research and improve public health.",
      //p3: "Here's more stuff to fill in the page. And just a little bit more to see.",
      gitHubLink: 'https://github.com/gelsto',
      linkedInLink: 'https://www.linkedin.com/in/laura-gelston-2782852b'
    },
    sam: {
      name: 'Sam Crawford',
      portrait: "../assets/img/samheadshot.jpg",
      p1: "Our Chrome Extension will borrow a small bit of your processing power, which will be used to help SpeakEasy learn faster.",
      p2: "You'll be able to turn this off at any time with the click of a button within the Extension's menu.",
      p3: "Here's more stuff to fill in the page. And just a little bit more to see.",
      gitHubLink: 'https://github.com/RS-Crawford',
      linkedInLink: 'https://www.linkedin.com/in/robertscrawford'
    }
  }

  //These ___Info calls set context based on what was clicked and pass that info to portraitWindow
  $scope.andyInfo = function (ev) {
    context = info.andy;
    $scope.portraitWindow(ev, context);
  }

  $scope.willInfo = function (ev) {
    context = info.will;
    $scope.portraitWindow(ev, context);
  }

  $scope.lauraInfo = function (ev) {
    context = info.laura;
    $scope.portraitWindow(ev, context);
  }

  $scope.samInfo = function (ev) {
    context = info.sam;
    $scope.portraitWindow(ev, context);
  }

  // For portraitWindow we receive context from ___Info, use it to define our necessary $scope variables for
  // portrait.html, and then open a dynamically generated dialog window using portrait.html
  $scope.portraitWindow = function (ev, context) {

    $scope.name = context.name;
    $scope.portrait = context.portrait;
    $scope.p1 = context.p1;
    $scope.p2 = context.p2;
    $scope.p3 = context.p3;
    $scope.gitHubLink = context.gitHubLink;
    $scope.linkedInLink = context.linkedInLink;

    $mdDialog.show({
        templateUrl: 'portrait/portrait.html',
        parent: angular.element(document.body),
        scope: $scope,
        preserveScope: true,
        targetEvent: ev,
        clickOutsideToClose: true,
        fullscreen: $mdMedia('sm') && $scope.customFullscreen
      })
      .then(function () {
        console.log('DIALOGUE SUCCESS STATUS')
      }, function () {
        $scope.status = 'You cancelled the dialog.';
        console.log('DIALOGUE FAIL STATUS', $scope.status)
      });
  }

  // Gives window closing functionality to the top-right X button in portrait.html
  $scope.closeWindow = function () {
    $mdDialog.cancel();
  }

  $scope.hideWindow = function () {
    console.log('dialog submit called')
    $mdDialog.hide();
  }

}]);
