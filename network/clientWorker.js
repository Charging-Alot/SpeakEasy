var roles = [
  'mother', //0
  'branchCtrl', //1
  'nodeCtrl', //2
  'pleb' //3
]

var actions = [
  'activate', //0
  'backPropagate', //1
  'clearState', //2
  //calculation steps
  'activation', //3
  'influence', //4
  'elegibility', //5
  'extendedElegibility', //6
  'gain' //7
]

var role = '';

var startCommand = function (commandArr, argArr) {
  role = roles[commandArr[0]];
  var action = actions[commandArr[1]];
}

var sendModel = function () {
  return actions[role][command](argArr); //this actually needs to be emitted to upstream manager, but this'll work for now
}

var sigStack = [];

var model = [];

var actions = {
  mother: {
    init: function (argArr) {

    },
    activate: function (argArr) {

    },
    backPropagate: function (argArr) {

    },
    clearState: function () {

    }
  },
  branchCtrl: {
    init: function (argArr) {

    },
    activate: function (argArr) {

    },
    backPropagate: function (argArr) {

    },
    clearState: function () {

    }
  },
  nodeCtrl: {
    init: function (argArr) {

    },
    activate: function (argArr) {

    },
    backPropagate: function (argArr) {

    },
    clearState: function (argArr) {

    }
  },
  pleb: {
    activation: function (argArr) {
      // input: array of arrays.  
      //   sub array format: 
      //     [
      //       <input connection weight>,
      //       <input connection gain>,
      //       <activation of upstream neuron>
      //     ]
      model = 0;
      for (var i = 0; i < argArr.length; ++i) {
        model += argArr[0]*argArr[1]*argArr[2];
      }
      sendModel();
    },
    influence: function (argArr) {
      
    },
    elegibility: function (argArr) {

    },
    extendedElegibility: function (argArr) {

    },
    gain: function (argArr) {

    }
  }
}


