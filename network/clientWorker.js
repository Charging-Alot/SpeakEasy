var roles = [
  'mother', //0
  'nodeCtrl', //1
  'pleb' //2
]

var actions = [
  'init', //0
  'update', //1
  'activate', //2
  'backPropagate', //3
  'clearState', //4
]

var command;
var roleCode = -1;

var neuron;
var gatedConns;

var startCommand = function (commandArr, neuron) {
  var action = actions[commandArr[1]];
  var role = roles[commandArr[0]];
  command = commandArr;
  if(roleCode === -1) {
    var roleCode = command[0]
  }
  if(command[0] === roleCode) {
    //from upstream, starts action cascade downstream
    updateneuron[role][action]
    actions[role][action].call(neuron, argArr);
  } else {
    //from downstream, starts update cascade upstream
    storeResponse[role][action].call(neuron, argArr);
  }
}

var makeResponse = function () {
  if(roles[command[1]] === 'activate') {
    return [command, [
      this.id, //0
      this.state, //1
      this.old, //2
      this.bias, //3
      this.activation, //4
      this.derivative, //5
      this.inputConns.elegibilities, //6
      this.gatedConns.extendedEligibilities //7
      ];
    ]
  } else if (action === '')
}

var sendDownstream = function () {

}

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
  nodeCtrl: {
    init: function (newNeuron) {
      if(typeof newNeuron.id !== neuron.id) {
        neuron = newNeuron;
      }
        /* newNeuron is an object of the structure:
        {
          id: int
          children: array of objects
            {
              id: int
              socket: connection
              prevJob: int
            }
          state: float
          prevState: float
          bias: float
          activation: float
          derivative: float
          selfConn: object
            {
              gain: float
              weight: float
            }
          inputConns: object
            {
              ids: array of ints
              activations: array of floats
              weights: array of floats
              gains: array of floats
              elegibilities: array of floats *private
            }
          gatedConns: object
            {
              ids: array of ints
              tos: array of ints
              activations: array of floats
              weights: array of floats
              gains: array of floats
              extendedElegibilities: array of arrays of floats *private
              selfConns: object of objects
                {
                  initialInfluences: object
                    {
                      <id of gated, selfConned neuron>: <prevState>
                    }
                  gains: object
                    {
                      <id of gated, selfConned neuron>: float
                    }
                  weights: object
                    {
                      <id of gated, selfConned neuron>: float
                    }
                }
            }
          
        }*/
        //I left out influences, which for each gated node would have had all of the 
        //connections to that node which were gated by this one.  We can find this by
        //iterating over gatedConns and collecting all of the connections that point to
        //the same node.
        //*private means that the value here is specific to this neuron and is not the same value as it would be
        //for other neurons even though they might both include the connection in their neuron.
      } 
    },
    activate: function (activationArr) {
      neuron.prevState = neuron.state;
      neuron.state = neuron.bias + neuron.old * neuron.selfConn.gain * neuron.selfConn.weight;
      //activate step
      neuron.inputConns.activations = activationArr;
      for(var i = 0; i < neuron.inputConns.ids.length; ++i) {
        neuron.state += neuron.inputConns.weights[i] * neuron.inputConns.gains[i] * neuron.inputConns.activations[i];
      }
      neuron.activation = squash(neuron.state);
      neuron.derivative = squash(neuron.state, true);
      //influence step
      var influences = gatedConns.selfConns.initialInfluences;
      for(var j = 0; j < gatedConns.tos.length; ++j) {
        if(influences[gatedConns.tos[j]] === undefined) {
          //if we haven't seen neuron before then initialize it to 0
          influences[gatedConns.tos[j]] =  0; 
        }
        influences[gatedConns.tos[j]] += gatedConns.weights[j] * gatedConns.activations[j];
      }
      //elegibility step
      for(var k = 0; k < neuron.inputConns.activations.length; ++k) {
        neuron.inputConns.elegibilities[k] *= neuron.selfConnection.weights[k] * neuron.selfConnection.gains[k];
        neuron.inputs.elegibilities[k] += neuron.inputs.gains[k] * neuron.inputs.activations[k];
      }
      //extended elegibility step
      for (var l = 0; l < gatedConns.ids.length; ++l) {
        var gatedNeuron = gatedConns.tos[l];
        for(var m = 0; m < neuron.inputConns.ids.length; ++m) {
        neuron.gatedConns.extendedEligibilities[l][m] *= gatedConns.selfConnWeight[gatedNeuron]
                                                        * gatedConns.selfConnGain[gatedNeuron]
        neuron.gatedConns.extendedEligibilities[l][m] += neuron.derivative * neuron.inputConns.elegibilities[k] 
                                                        * influences[gatedNeuron];
        }
      }
      //gain step?  Should do upstream

      //send changed values back to manager
      sendUpstream();

    },
    backPropagate: function (argArr) {

    },
    clearState: function (argArr) {

    }
  },
  pleb: {
    activateStep1: function (argArr) {
      neuron
    }
  }
}

updateneuron:

