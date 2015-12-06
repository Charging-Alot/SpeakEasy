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

var runCommand = function (commandArr, argArr) {
  var role = roles[commandArr[0]];
  var action = actions[commandArr[1]];
  return actions[role][command](argArr);
}

var actions = {
  mother: {
    activate: function (argArr) {

    },
    backPropagate: function (argArr) {

    },
    clearState: function () {

    }
  },
  branchCtrl: {
    activate: function (argArr) {

    },
    backPropagate: function (argArr) {

    },
    clearState: function () {

    }
  },
  nodeCtrl: {
    activate: function (argArr) {

    },
    backPropagate: function (argArr) {

    },
    clearState: function (argArr) {

    }
  },
  pleb: {
    activation: function (argArr) {
      //input: array of objects.  Sub arrays format {}
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


