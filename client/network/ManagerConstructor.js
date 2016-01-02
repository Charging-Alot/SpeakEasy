if (module) {
  var Network = require('./NetworkConstructor.js').Network;
  var Neuron = require('./neuronConstructor.js').Neuron;
  var IoHandler = require('./IoHandler.js').IoHandler;
}

/*
 * Manager constructor.  
 * Creates a middle tier (1) controller which is intended to delegate all steps of activation or backpropagation for a recieved neuron or subnetwork and then return it upstream.
 * 
 * @param {partialModel} object - All or part of neuron or subnetwork which will be used to instantiate this controller's model
 * @param {sendFunction} function - A function which takes a number indicating the level the message is meant to go to, followed by a string containing the message to be sent
 */
var Manager = function (partialModel, sendFunction) {
  if (partialModel) {
    this.makeNewModel(partialModel); //model can be neuron or network
  } else {
    this.model = new Neuron();
  }
  this.toPleb = new IoHandler(1, 0, this, sendFunction);
  this.toMother = new IoHandler(1, 2, this, sendFunction);
}
/*
 * If the command comes from downstream (is not either 'activation' or 'backpropagation') then the controller selectively updates it's current model.
 * If the command comes from upstream then the controller replaces it's entire model.
 *
 * @param {command} string - String containing the command to be run or the command being returned
 * @param {section} number - Indicates of the section of the command being completed
 * @param {partialModel} network object or neuron object - Object to use in replacing or updating model
 */
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
/*
 * Takes a json string, parses it and then adds it to the appropriate input queue.
 *
 * @param {jsonString} - String containing a taskObj
 */
Manager.prototype.input = function (jsonString) {
  var object = JSON.parse(jsonString)
  if (object.command === 'activate' || object.command == 'backPropagate') {
    // if (object.value.type === 'network') {
    //   object.value = new Network(object.value, object.value.rate, object.value.maxGradient)
    //   object.value.initNeurons();
    // } else {
    //   object.value = new Neuron(object.value)
    // }
    this.toMother.addToIn(object)
  } else {

    this.toPleb.addToIn(object)
  }
}

/*
 * Overwrites the current model with the partial model passed in
 *
 * @param {partialModel} object - An object with the structure of a neuron or network, specifying the characteristics of the new model
 */
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

/*
 * Runs the function specified by the command, passing in the section.
 *
 * @param {command} string - A string of the name of the function to be run.
 * @param {section} number - The section of the command just recieved.
 */
Manager.prototype.run = function (command, section) {
  this[command](section);
}

/*
 * Sends a response command to mother and then checks it's input queue.
 *
 * @param {command} string - A string corresponding to the command that was just run
 * @param {section} number - A number corresponding to the section of this command completed
 */
Manager.prototype.finishCommand = function (command, section) {
  this.queueCommandMother(command, section);
  this.toMother.runAllOutputs();
  this.toMother.runAllInputs();
}

/*
 * Runs the iterator on each element of the array as a callback to itself, and runs the passed in callback after the iterator has been run on all elements of the array.
 *
 * @param {array} array - The array to be iterated over
 * @param {iterator} function - The function to be called on every element of the array
 * @param {callback} function - The function to be called when the function has finished running  
 */
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
  if(array.length) {
    iterator.call(this, array[i], i, iteratorCallback)
  } else {
    callback.call(this)
  }
}

/*
 * Delegates all steps for activating the current model.
 *
 * @param {section} number - Number indicating the id of the current model relative to it's parent in the upstream model
 */
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

/*
 * Delegates all steps for activating the specified neuron.
 *
 * @param {neuron} neuron object - Neuron to be activated
 * @param {section} number - Number indicating the id of the current model relative to it's parent in the upstream model
 * @param {callback} function - The function to be called when activation of this neuron is complete
 */
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

/*
 * Delegates all steps for backPropagating through the current model.
 *
 * @param {section} number - Number indicating the id of the current model relative to it's parent in the upstream model
 */
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

/*
 * Delegates all steps for backPropagating through the specified neuron.
 *
 * @param {neuron} neuron object - Neuron to backpropagate
 * @param {section} number - Number indicating the id of the current model relative to it's parent in the upstream model
 * @param {callback} function - The function to be called when backpropagation of this neuron is complete
 */
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

/*
 * Creates an object with the appropriate values for the command and section passed in and adds it to the downstream output queue.  
 * Binds the callback to the controller as context.
 *
 * @param {command} string - String containing the function for the downstream controller to call
 * @param {section} number - Number indicating the section of this command
 * @param {neuron} neuron object - The neuron on which the command should operate
 * @param {callback} function - Function to be called on response from downstream controller
 */
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
  this.toPleb.addToOut(command, section, neuron, callback);
}

/*
 * Creates an object with the appropriate values for the command and section passed in and adds it to the upstream output queue.  
 * Binds the callback to the controller as context.
 *
 * @param {command} string - String containing the function that prompted this command being sent
 * @param {section} number - Number indicating the section of this command
 * @param {callback} function - Function to be called on response from controller up one tier from this one
 */
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
