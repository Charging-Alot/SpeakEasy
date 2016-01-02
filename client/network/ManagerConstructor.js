if (module) {
  var Network = require('./NetworkConstructor.js').Network;
  var Neuron = require('./neuronConstructor.js').Neuron;
  var IoHandler = require('./IoHandler.js').IoHandler;
}
var Manager = function (partialModel, sendFunction) {
  if (partialModel) {
    this.makeNewModel(partialModel); //model can be neuron or network
  } else {
    this.model = new Neuron();
  }
  this.toPleb = new IoHandler(1, 0, this, sendFunction);
  this.toMother = new IoHandler(1, 2, this, sendFunction);
}

Manager.prototype.update = function (command, section, partialModel) {
  // if (object.value.type === 'network') {
  //    object.value = new Network(object.value, object.value.rate, object.value.maxGradient)
  //    object.value.initNeurons();
  //  } else {
  //    object.value = new Neuron(object.value)
  //  }
  if (command === 'activate' || command === 'backPropagate') {
    this.makeNewModel(partialModel);
    // if (this.model.type === 'network') {
    //   this.model.initNeurons();
    //   this.model.layers = partialModel.layers
    // }
    // this.model.rate = partialModel.rate
    // this.model.maxGradient = partialModel.maxGradient
  } else {
    if (this.model.type === 'network') {
      // this.model.layers[partialModel.node.layerId][partialModel.node.id].update(partialModel)
      this.model.update(partialModel)
    } else {
      this.model.update(partialModel);
    }
  }
}

Manager.prototype.input = function (object) {
  object = JSON.parse(object)
  console.log("\nIN MANAGER INPUT AND THIS IS FIRING\n", object)
  if (object.command === 'activate' || object.command == 'backPropagate') {
    // if (object.value.type === 'network') {
    //   object.value = new Network(object.value, object.value.rate, object.value.maxGradient)
    //   object.value.initNeurons();
    // } else {
    //   object.value = new Neuron(object.value)
    // }
    console.log("||||||||||||||||||||||||||||||||||||")
    this.toMother.addToIn(object)
  } else {
    console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")

    this.toPleb.addToIn(object)
  }
}

Manager.prototype.makeNewModel = function (partialModel) {
  if (partialModel.type === 'network') {
    this.model = new Network(partialModel || null);
    if (partialModel) {
      this.model.initNeurons();
    }
    // this.model.layers = partialModel.layers
    // this.model.initialized = true
  } else {
    this.model = new Neuron(partialModel)
  }
}

Manager.prototype.run = function (command, section) {
  console.log("P{P{P{P{P{P{P{P{P{P{P{", command)
  this[command](section);
}

Manager.prototype.finishCommand = function (command, section) {
  this.queueCommandMother(command, section);
  this.toMother.runAllOutputs();
  this.toMother.runAllInputs();
}

Manager.prototype.forEachAsync = function (array, iterator, callback) {
  var i = 0;
  var iteratorCallback = function () {
    ++i;
    if (i === array.length) {
      callback.call(this)
    } else {
      iterator.call(this, array[i], i, iteratorCallback)
    }
  }.bind(this)
  iterator.call(this, array[i], i, iteratorCallback)
}

Manager.prototype.activate = function (section) {
  if (this.model.type === 'neuron') {
    this.activateNeuron(this.model, section, function () {
      this.finishCommand('activate', section);
    }.bind(this));
  } else {
    this.forEachAsync(this.model.layers[0], this.activateNeuron, function () {
      for (var j = 1; j < this.model.layers.length; ++j) {
        for (var k = 0; k < this.model.layers[j].length; ++k) {
          this.model.layers[j][k].activateSync();
        }
      }
      this.finishCommand('activate', section);
    })
  }
}

Manager.prototype.activateNeuron = function (neuron, section, callback) {
  neuron.initialState();

  this.queueCommandPleb('activationStep', section, neuron, function () {
    neuron.squashState();
  });

  this.queueCommandPleb('influenceStep', section, neuron, function () {});

  this.queueCommandPleb('elegibilityStep', section, neuron, function () {});

  this.toPleb.runAllOutputs(function () {
    for (var i in this.model.gatedNodes) {
      this.queueCommandPleb('extendedElegibilityStep', i, neuron, function (command, section, partialNeuron) {});
    }
    this.toPleb.runAllOutputs(function () {
      callback.call(this);
    }.bind(this));
  }.bind(this));
}

Manager.prototype.backPropagate = function (section) {
  if (this.model.type === 'neuron') {
    this.backPropagateNeuron(this.model, section, function () {
      this.finishCommand('backPropagate', section)
    }.bind(this));
  } else {
    this.forEachAsync(this.model.layers[this.model.layers.length - 1], this.backPropagateNeuron, function () {
      for (var j = this.model.layers.length - 2; j >= 1; --j) {
        for (var k = 0; k < this.model.layers[j].length; ++k) {
          this.model.layers[j][k].rate = this.model.rate;
          this.model.layers[j][k].maxGradient = this.model.maxGradient
          this.model.layers[j][k].backPropagateSync();
        }
      }
      this.forEachAsync(this.model.layers[0], this.backPropagateNeuron, function () {
        this.finishCommand('backPropagate', section)
      })
    })
  }
}

Manager.prototype.backPropagateNeuron = function (neuron, section, callback) {
  neuron.rate = this.model.rate
  neuron.maxGradient = this.model.maxGradient
  if (neuron.isOutput && this.model.type !== 'network') {
    neuron.learningStep();
    neuron.adjustBias();
    callback()
  } else {
    var hasLearned = false;
    var hasGatedError = false;
    var hasProjectedError = false
    this.queueCommandPleb('projectedErrorStep', section, neuron, function () {
      hasProjectedError = true
      this.queueCommandPleb('learningStep', section, neuron, function () {
        neuron.adjustBias();
        hasLearned = true;
        if (hasGatedError) {
          callback();
        }
      }.bind(this))
      this.toPleb.runAllOutputs(function () {})
    }.bind(this))
    this.queueCommandPleb('gatedErrorStep', section, neuron, function () {
      hasGatedError = true
    })
    this.toPleb.runAllOutputs(function () {
      neuron.setErrorResponsibility();
      if (hasLearned) {
        callback();
      }
    }.bind(this))
  }
}

Manager.prototype.queueCommandPleb = function (command, section, neuron, callback) {
  var value = new Neuron();
  // if(this.model.type === 'network') {
  //   if(neuron.layerId === 0) {
  //     neuron.connections.inputs = this.model.connections.inputs
  //   } else if(neuron.layerId === this.model.layers.length - 1) {
  //     neuron.connections.outputs = this.model.connections.outputs;
  //     neuron.connections.gated = this.model.connections.gated;
  //   }
  // }
  value.node.id = neuron.node.id
  value.node.layerId = neuron.node.layerId;
  value.node.subNetworkId = neuron.node.subNetworkId
  value.node.subNetworkLayerId = neuron.node.subNetworkLayerId;
  value.maxGradient = this.model.maxGradient;
  value.rate = this.model.rate;
  if (command === 'activationStep') {
    value.connections.inputs = neuron.connections.inputs;
    value.node.state = neuron.node.state
  } else if (command === 'influenceStep') {
    value.gatedNodes = neuron.gatedNodes;
    value.connections.gated = neuron.connections.gated;
  } else if (command === 'elegibilityStep') {
    value.node.elegibilities = neuron.node.elegibilities;
    value.node.selfConnection = neuron.node.selfConnection;
    value.connections.inputs = neuron.connections.inputs;
  } else if (command === 'extendedElegibilityStep') {
    value.node.influences = neuron.node.influences
    value.node.extendedElegibilities = {}
    value.node.extendedElegibilities[section] = neuron.node.extendedElegibilities[section];
    value.node.elegibilities = neuron.node.elegibilities
    value.node.derivative = neuron.node.derivative
    value.gatedNodes[section] = neuron.gatedNodes[section];

  } else if (command === 'projectedErrorStep') {
    value.connections.outputs = neuron.connections.outputs;
    value.node.derivative = neuron.node.derivative;
  } else if (command === 'gatedErrorStep') {
    value.connections.gated = neuron.connections.gated;
    value.gatedNodes = neuron.gatedNodes;
    value.node.id = neuron.node.id;
    value.node.layerId = neuron.node.layerId;
    value.node.derivative = neuron.node.derivative;
  } else if (command === 'learningStep') {
    value.connections.inputs = neuron.connections.inputs
    value.gatedNodes = neuron.gatedNodes;
    value.node.errorProjected = neuron.node.errorProjected
    value.node.elegibilities = neuron.node.elegibilities;
    value.node.extendedElegibilities = neuron.node.extendedElegibilities;
  }
  if (callback && section) {
    callback.bind(this, section);
  } else if (callback) {
    callback.bind(this)
  }
  // this.toPleb.addToOut(command, section, value, callback);
  this.toPleb.addToOut(command, section, neuron, callback);
}

Manager.prototype.queueCommandMother = function (command, section, callback) {
  if (this.model.type === 'neuron') {
    var value = new Neuron();
    if (command === 'activate') {
      value.node = this.model.node;
    } else if (command === 'backPropagate') {
      value.node = this.model.node;
      value.connections.inputs = this.model.connections.inputs;
    }
  } else {
    value = new Network(this.model);
  }
  // if (command === 'activate') {
  //   if(this.model === 'neuron') {
  //     value.node = this.model.node;
  //     value.node.influences = {};
  //   }
  // } else if (command === 'backPropagate') {
  //   value.node.id = this.model.node.id;
  //   value.node.layerId = this.model.node.layerId
  //   value.node.errorProjected = this.model.node.errorProjected
  //   value.node.errorResponsibility = this.model.node.errorResponsibility
  //   value.node.errorGated = this.model.node.errorGated
  //   value.node.bias = this.model.node.bias;
  //   value.connections.outputs = this.model.connections.outputs
  //   value.connections.inputs = this.model.connections.inputs

  // }
  if (callback && section) {
    callback.bind(this, section);
  } else if (callback) {
    callback.bind(this)
  }
  this.toMother.addToOut(command, section, value, callback);
}

if (module) {
  module.exports.Manager = Manager
}
