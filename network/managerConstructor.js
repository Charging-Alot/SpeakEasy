var Manager = function (partialNeuron, sendFunction) {
  Neuron.call(this, partialNeuron);
  this.toPleb = new IoHandler(1, 0, this, sendFunction);
  this.toMother = new IoHandler(1, 2, this, sendFunction);
}
Manager.prototype = Object.create(Neuron.prototype);
Manager.prototype.constructor = Manager;

Manager.prototype.update = function(command, section, partialNeuron) {
  if(command === 'activate' || command === 'backPropagate') {
    Neuron.call(this, partialNeuron);
  } else {
    Neuron.prototype.update.call(this, command, section, partialNeuron);
  }
}

Manager.prototype.activate = function(section) {
  this.node.prevState = this.node.state;
  this.node.state = this.node.bias + this.node.prevState * this.node.selfConnection.gain * this.node.selfConnection.weight;

  this.queueCommandPleb('activationStep', null, function () {
    // this.queueCommandMother('activationStep');
    // this.toMother.runAllOutputs();
  });

  this.queueCommandPleb('influenceStep', null, function () {
    // this.queueCommandMother('influenceStep', null);
    // this.toMother.runAllOutputs();
    // gets rewritten at backPropagation. and on next activation.
  });

  this.queueCommandPleb('elegibilityStep', null, function () {
    // this.queueCommandMother('elegibilityStep');
    // this.toMother.runAllOutputs();
  });

  this.toPleb.runAllOutputs(function () {
      var exElResponseCounter = 0;
    for(var i in this.gatedNodes) {
      this.queueCommandPleb('extendedElegibilityStep', i, function (command, section, partialNeuron) {
        // ++exElResponseCounter;
        // if(exElResponseCounter === gatedConns.ids.length) {
        //   this.queueCommandMother('extendedElegibilityStep');
        //   this.toMother.runAllOutputs();
        // }
        // this.queueCommandMother('extendedElegibilityStep', i);
        // should these get passed back bit by bit?
      });
    }
    this.toPleb.runAllOutputs(function () {
      for(var i = 0; i < this.connections.gated.length; ++i) {
        this.connections.gated[i].gain = this.node.activation;
      }
      for(var j = 0; j < this.connections.outputs; ++j) {
        this.connections.outputNodes.activation = this.node.activation;
      }
      this.queueCommandMother('activate', section);
      this.toMother.runAllOutputs();
      // this.toMother.runAllInputs();
    }.bind(this));
  }.bind(this));
}

Manager.prototype.backPropagate = function (section) {
  this.node.errorProjected = 0;
  var hasLearned = false;
  var hasGatedError = false;
  var hasProjectedError = false
  //race condition?  depends if it handles learning and gatedError at the same time
  this.queueCommandPleb('projectedErrorStep', null, function () {
    hasProjectedError = true
    this.queueCommandPleb('learningStep', null, function () {
      hasLearned = true
      if(hasGatedError) {
        this.queueCommandMother('backPropagate', section)
        this.toMother.runAllOutputs();
        this.toMother.runAllInputs();
      }
    }.bind(this))
    this.toPleb.runAllOutputs()
  }.bind(this))
  this.queueCommandPleb('gatedErrorStep', null, function () {
    hasGatedError = true
  })
  this.toPleb.runAllOutputs(function () {
    this.node.errorResponsibility = this.node.errorGated + this.node.errorProjected;
    for(var n = 0; n < this.connections.outputs.length; ++n) {
      this.connections.inputs[n].errorResponsibility = this.node.errorResponsibility
    }
    this.node.bias += this.rate * this.node.errorResponsibility
    if(hasLearned) {
      this.toPleb.runAllOutputs(function () {
      this.queueCommandMother('backPropagate', section);
      this.toMother.runAllOutputs();
      this.toMother.runAllInputs();
      }.bind(this))
    }
  }.bind(this))
}

Manager.prototype.queueCommandPleb = function (command, section, callback) {
  var value = new Neuron();
  if(command === 'activationStep') {
    value.connections.inputs = this.connections.inputs;
    value.node.state = this.node.state
    value.inputNodes = this.inputNodes;
    // value.inputConns.weights = this.inputConns.weights;
    // value.inputConns.gains = this.inputConns.gains;
    // value.inputConns.activations = this.inputConns.activations;
    // value.node.state = this.node.state;
    // value.node.prevState = this.node.prevState;
  } else if(command === 'influenceStep') {
    value.node.id = this.node.id;
    value.node.layerId = this.node.layerId;
    value.gatedNodes = this.gatedNodes;
    value.connections.gated = this.connections.gated;
    // value.gatedConns.tos = this.gatedConns.tos;
    // value.gatedConns.weights = this.gatedConns.weights;
    // value.gatedConns.activations = this.gatedConns.activations;
    // value.gatedConns.selfConns.initialInfluences = this.gatedConns.selfConns.initialInfluences
  } else if(command === 'elegibilityStep') {
    value.node.elegibilities = this.node.elegibilities;
    value.node.selfConnection = this.node.selfConnection;
    value.connections.inputs = this.connections.inputs;
    value.inputNodes = this.inputNodes;
    // value.inputConns.elegibilities = this.inputConns.elegibilities;
    // value.node.selfConnection = this.node.selfConnection;
    // value.inputConns.gains = this.inputConns.gains;
    // value.inputConns.activations = this.inputConns.activations;
  } else if(command === 'extendedElegibilityStep') {
    value.node.extendedElegibilities = {}
    value.node.extendedElegibilities[section] = this.node.extendedElegibilities[section];
    value.node.elegibilities = this.node.elegibilities
    value.node.derivative = this.node.derivative
    value.gatedNodes[section] = this.gatedNodes[section];
    // value.gatedConns.to = this.gatedConns.tos[section];
    // value.node.derivative = this.node.derivative;
    // value.gatedConns.selfConns.weight = this.gatedConns.selfConned.weights[this.gatedConns.tos[section]] || 0;
    // value.gatedConns.selfConns.gain = this.gatedConns.selfConned.gains[this.gatedConns.tos[section]] || 1;
    // value.gatedConns.influence = this.gatedConns.influences[this.gatedConns.tos[section]];
    // value.gatedConns.extendedElegibility = this.gatedConns.extendedElegibilities[section]
  } else if(command === 'gainStep') {
    value.node.activation = this.node.activation; //not used currently
  } else if(command === 'projectedErrorStep') {
    value.connections.outputs = this.connections.outputs;
    value.node.derivative = this.node.derivative;
    value.outputNodes = this.outputNodes
  } else if(command === 'gatedErrorStep') {
    value.connections.gated = this.connections.gated;
    value.gatedNodes = this.gatedNodes;
    value.node.id = this.node.id;
    value.node.layerId = this.node.layerId;
    value.node.derivative = this.node.derivative;
  } else if(command === 'learningStep') {
    value.connections.inputs = this.connections.inputs
    value.gatedNodes = this.gatedNodes;
    value.node.errorProjected = this.node.errorProjected
    value.node.elegibilities = this.node.elegibilities;
    value.node.extendedElegibilities = this.node.extendedElegibilities;
    value.rate = this.rate;
    value.maxGradient = this.maxGradient;

  }
  if(callback && section) {
    callback.bind(this, section);
  } else if(callback) {
    callback.bind(this)
  }
  this.toPleb.addToOut(command, section, value, callback);
}

Manager.prototype.queueCommandMother = function (command, section, callback) {
  var value = new Neuron();
  // if(command === 'activationStep') {
  //   value.node.id = this.node.id;
  //   value.node.state = this.node.state;
  //   value.node.derivative = this.node.derivative;
  //   value.node.activation = this.node.activation;
  //   command = 'action';
  // } else if(command === 'elegibilityStep') {
  //   value.inputConns.ids;
  //   value.inputConns.elegibilities = this.inputConns.elegibilities;
  //   command = 'action';
  // } else if(command === 'extendedElegibilityStep') {
  //   value.gatedConns.ids;
  //   value.gatedConns.extendedElegibility = this.gatedConns.extendedElegibility;
  //   command = 'action';
  // } else if(command === 'gainStep') {
  //   value.gatedConns.gains;
  //   command = 'action';
  // }
  //will figure out how to recieve these separately later
  if (command === 'activate') {
    value.node = this.node;
    value.node.influences = {};




    value.connections.gatedConns = this.connections.gatedConns;
    value.connections.outputs = this.connections.outputs;
    // value.node.id = this.node.id;
    // value.node.state = this.node.state;
    // value.node.derivative = this.node.derivative;
    // value.node.activation = this.node.activation;
    // value.inputConns.ids;
    // value.inputConns.elegibilities = this.inputConns.elegibilities;
    // value.gatedConns.ids;
    // value.gatedConns.extendedElegibility = this.gatedConns.extendedElegibility;
    // value.gatedConns.gains;
  } else if (command === 'backPropagate') {
    value.node.id = this.node.id;
    value.node.layerId = this.node.layerId
    value.node.errorProjected = this.node.errorProjected
    value.node.errorResponsibility = this.node.errorResponsibility
    value.node.errorGated = this.node.errorGated
    value.node.bias = this.node.bias;

    value.connections.outputs = this.connections.outputs
    value.connections.inputs = this.connections.inputs

  }
  if(callback && section) {
    callback.bind(this, section);
  } else if(callback) {
    callback.bind(this)
  }
  this.toMother.addToOut(command, section, value, callback);
}
