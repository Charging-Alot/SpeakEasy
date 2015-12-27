var Manager = function (partialModel, sendFunction) {
  this.makeNewModel(partialModel);  //model can be neuron or network
  this.toPleb = new IoHandler(1, 0, this, sendFunction);
  this.toMother = new IoHandler(1, 2, this, sendFunction);
}

Manager.prototype.update = function(command, section, partialModel) {
  if(command === 'activate' || command === 'backPropagate') {
    this.makeNewModel(partialNeuron);
  } else {
    this.model.update(command, section, partialModel);
  }
}

Manager.prototype.makeNewModel = function (partialModel) {
  if(partialModel.type === 'network') {
    this.model = new Network(partialModel)
  } else {
    this.model = new Neuron(partialModel)
  }
}

Manager.prototype.run = function (command, section) {
  this[command](section);
}

Manager.prototype.finishCommand = function (command, section) {
  this.queueCommandMother(command, section);
  this.toMother.runAllOutputs();
  this.toMother.runAllInputs();
}

Manager.prototype.forEachAsync = function (array, iterator, callback) {
  var returnCounter = 0;
  var iteratorCallback = function () {
    ++returnCounter;
    if(returnCounter === array.length) {
      callback.call(this)
    }
  }
  for(var i = 0; i < array.length; ++i) {
    iterator.call(this, array[i], i, iteratorCallback)
  }
}

Manager.prototype.activate = function (section) {
  if(this.model.type === 'neuron') {
    this.activateNeuron(this.model, section, function () {
      this.finishCommand('activate', section);
    }.bind(this));
  } else {
    this.forEachAsync(this.model.layers[0], this.activateNeuron, function () {
      for(var j = 1; j < this.model.layers.length; ++j) {
        for(var k = 0; k < this.model.layers[j].length; ++k) {
          this.model.layers[j][k].activateSync();
        }
      }
      this.finishCommand('activate', section);
    })
    }
  }
}

Manager.activateNeuron = function (neuron, section, callback) {
  neuron.initialState();

  this.queueCommandPleb('activationStep', section, neuron, function () {
    neuron.squashState();
  });
  
  this.queueCommandPleb('influenceStep', section, neuron, function () {
  });

  this.queueCommandPleb('elegibilityStep', section, neuron, function () {
  });

  this.toPleb.runAllOutputs(function () {
    for(var i in this.gatedNodes) {
      this.queueCommandPleb('extendedElegibilityStep', i, neuron, function (command, section, partialNeuron) {
      });
    }
    this.toPleb.runAllOutputs(function () {
      callback();
    }.bind(this));
  }.bind(this));
}

Manager.prototype.backPropagate = function (section) {
  if(this.model.type === 'neuron') {
    this.backPropagateNeuron(this.model, section, function () {
      finishCommand('backPropagate', section)
    }.bind(this));
  } else {
    this.forEachAsync(this.model.layers[this.model.layers.length - 1], this.backPropagateNeuron, function () {
      for(var j = this.model.layers.length - 2; j >= 1; --j) {
        for(var k = 0; k < this.model.layers[j].length; ++k) {
          this.model.layers[j][k].backPropagateSync();
        }
      }
      this.forEachAsync(this.model.layers[0], backPropagateNeuron, function () {
        this.finishCommand
      })
    })
  }
}

Manager.prototype.backPropagateNeuron = function (neuron, section, callback) {
  if(this.isOutput) {
    this.queueCommandPleb
    this.queueCommandPleb('learningStep', section, neuron, function () {
      this.adjustBias();
      callback();
    }.bind(this));
    this.toPleb.runAllOutputs();
  } else {
    var hasLearned = false;
    var hasGatedError = false;
    var hasProjectedError = false
    this.queueCommandPleb('projectedErrorStep', section, neuron, function () {
      hasProjectedError = true
      this.queueCommandPleb('learningStep', section, neuron, function () {
        this.adjustBias();
        hasLearned = true;
        if(hasGatedError) {
          callback();
        }
      }.bind(this))
      this.toPleb.runAllOutputs()
    }.bind(this))
    this.queueCommandPleb('gatedErrorStep', section, neuron, function () {
      hasGatedError = true
    })
    this.toPleb.runAllOutputs(function () {
      this.setErrorResponsibility();
      if(hasLearned) {
        callback();
      }
    }.bind(this))
  }
}

Manager.prototype.queueCommandPleb = function (command, section, neuron, callback) {
  var value = new Neuron();
  if(this.model.type === 'network') {
    if(neuron.layerId === 0) {
      neuron.connections.inputs = this.model.connections.inputs
    } else if(neuron.layerId === this.model.layers.length - 1) {
      neuron.connections.outputs = this.model.connections.outputs;
      neuron.connections.gated = this.model.connections.gated;
    }
  }
  if(command === 'activationStep') {
    value.connections.inputs = neuron.connections.inputs;
    value.node.state = neuron.node.state
  } else if(command === 'influenceStep') {
    value.node.id = neuron.node.id;
    value.node.layerId = neuron.node.layerId;
    value.gatedNodes = neuron.gatedNodes;
    value.connections.gated = neuron.connections.gated;
  } else if(command === 'elegibilityStep') {
    value.node.elegibilities = neuron.node.elegibilities;
    value.node.selfConnection = neuron.node.selfConnection;
    value.connections.inputs = neuron.connections.inputs;
  } else if(command === 'extendedElegibilityStep') {
    value.node.influences = neuron.node.influences
    value.node.extendedElegibilities = {}
    value.node.extendedElegibilities[section] = neuron.node.extendedElegibilities[section];
    value.node.elegibilities = neuron.node.elegibilities
    value.node.derivative = neuron.node.derivative
    value.gatedNodes[section] = neuron.gatedNodes[section];
  } else if(command === 'gainStep') {
    value.node.activation = neuron.node.activation; //not used currently
  } else if(command === 'projectedErrorStep') {
    value.connections.outputs = neuron.connections.outputs;
    value.node.derivative = neuron.node.derivative;
  } else if(command === 'gatedErrorStep') {
    value.connections.gated = neuron.connections.gated;
    value.gatedNodes = neuron.gatedNodes;
    value.node.id = neuron.node.id;
    value.node.layerId = neuron.node.layerId;
    value.node.derivative = neuron.node.derivative;
  } else if(command === 'learningStep') {
    value.connections.inputs = neuron.connections.inputs
    value.gatedNodes = neuron.gatedNodes;
    value.node.errorProjected = neuron.node.errorProjected
    value.node.elegibilities = neuron.node.elegibilities;
    value.node.extendedElegibilities = neuron.node.extendedElegibilities;
    value.rate = neuron.rate;
    value.maxGradient = neuron.maxGradient;

  }
  if(callback && section) {
    callback.bind(neuron, section);
  } else if(callback) {
    callback.bind(neuron)
  }
  this.toPleb.addToOut(command, section, value, callback);
}

Manager.prototype.queueCommandMother = function (command, section, callback) {
  if(this.model.type === neuron) {
    var value = new Neuron();
    if(command === 'activate') {
      value.node = this.node;
    } else if(command === 'backPropagate') {
      value.node = this.node;
      value.elegibilities = [];
      value.extendedElegibilities = {};
      value.connections.inputs = this.connections.inputs;
    }
  } else {
    value =  new Network(this.model);
    if(command === 'activate') {
      value
    }
  }
  if (command === 'activate') {
    value.node = this.node;
    value.node.influences = {};
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
