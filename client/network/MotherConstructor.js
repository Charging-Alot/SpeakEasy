if (module) {
  var Network = require('./NetworkConstructor.js').Network;
  var Neuron = require('./NeuronConstructor.js').Neuron;
  var IoHandler = require('./IoHandler.js').IoHandler;
}

/*
 * Mother constructor.  
 * Creates a top tier (2) controller which is intended to delegate all steps of activation or backpropagation for the master model to tier 1 controllers.
 * 
 * @param {network} object - Network to be used as model. may or may not have been fully initialized.
 * @param {sendFunction} function - A function which takes a number indicating the level the message is meant to go to, followed by a string containing the message to be sent
 */
var Mother = function (network, sendFunction) {
  this.rate = 0.1;
  this.maxGradient = 5;
  this.model = network || new Network(null, this.rate, this.maxGradient)
  this.toManager = new IoHandler(2, 1, this, sendFunction);
}
/*
 * Takes a json string, parses it and then adds it to the input queue.
 *
 * @param {jsonString} - String containing a taskObj
 */
Mother.prototype.input = function (object) {
  object = JSON.parse(object)
  this.toManager.addToIn(object)
}

/*
 * Selectively updates controller's current model.
 *
 * @param {command} string - String containing the command to be run or the command being returned
 * @param {section} number - Indicates of the section of the command being returned
 * @param {partialModel} network object or neuron object - Object to use in updating model
 */
Mother.prototype.update = function (command, section, model) {
  // model.gatedNodes = {};
  if (model.type === 'network') {
    this.model.layers[model.layerId][model.id].update(model)
  } else {
    this.model.update(model);
  }
}

/*
 * Delegates activation of all network components to tier 1 controllers.
 *
 * @param {inputArr} array of numbers - Array of input activations
 * @param {callback} function - Function to be called on completion of all activation steps for the model.
 */
Mother.prototype.activate = function (inputArr, callback) {
  if (this.model.initialized) {
    this.model.activateFirstLayer(inputArr);
    var layerCounter = 1;
    var activationCallback = function () {
      // debugger
      console.log('\n\nderpherp\n\n')
      layerCounter++
      if (layerCounter < this.model.layers.length) {
        this.activateLayer(layerCounter, activationCallback);
      } else {
        callback();
      }
    }.bind(this);
    this.activateLayer(layerCounter, activationCallback); //activates first non input layer
  } else {
    console.error('You must call initNeurons on model before activation!');
  }
}

/* 
 * Delegates activation of all components of a single layer to tier 1 controllers to be executed in parallel.
 *
 * @param {layerId} number - The id of the layer to be activated
 * @param {callback} function - Function to be called when all network components in this layer have been activated.
 */
Mother.prototype.activateLayer = function (layerId, callback) {
  for (var i = 0; i < this.model.layers[layerId].length; ++i) {
    this.queueCommandManager('activate', i, this.model.layers[layerId][i])
  }
  this.toManager.runAllOutputs(callback)
}

/*
 * Creates an object with the appropriate values for the command and section passed in and adds it to the downstream output queue.  
 * Binds the callback to the controller as context.
 *
 * @param {command} string - String containing the function for the downstream controller to call
 * @param {section} number - Number indicating the section of this command
 * @param {neuron} neuron object - The neuron on which the command should operate
 * @param {callback} function - Callback to be called on response from downstream controller
 */
Mother.prototype.queueCommandManager = function (command, section, neuron, callback) {
  if (command === 'activate') {
    var partialNeuron = neuron
  } else if (command === 'backPropagate') {
    partialNeuron = neuron
  }
  partialNeuron.rate = this.rate;
  partialNeuron.maxGradient = this.maxGradient
  this.toManager.addToOut(command, section, partialNeuron, callback)
}
/*
 * Delegates backpropagation through all network components to tier 1 controllers.
 *
 * @param {targetArr} array of numbers - Array of expected output activations
 * @param {callback} function - Function to be called on completion of all backpropagation steps for the model.
 */
Mother.prototype.backPropagate = function (targetArr, callback) {
  if (this.model.initialized) {
    this.model.setLastLayerError(targetArr);
    var layerCounter = this.model.layers.length - 1;
    var backPropagationCallback = function () {
      layerCounter--;
      if (layerCounter >= 0) {
        this.backPropagateLayer(layerCounter, backPropagationCallback);
      } else {
        callback();
      }
    }.bind(this)
    this.backPropagateLayer(layerCounter, backPropagationCallback); //activates first non input layer
  } else {
    console.log("You must call initNeurons on model before backPropagate! (don't forget to activate first as well)");
  }
}

/* 
 * Delegates backpropagation through all components of a single layer to tier 1 controllers to be executed in parallel.
 *
 * @param {layerId} number - The id of the layer to backpropagate through
 * @param {callback} function - Function to be called when backpropagation is complete for all network components in this layer.
 */
Mother.prototype.backPropagateLayer = function (layerId, callback) {
  for (var i = 0; i < this.model.layers[layerId].length; ++i) {
    this.queueCommandManager('backPropagate', i, this.model.layers[layerId][i])
  }
  this.toManager.runAllOutputs(callback);
}

if (module) {
  exports.Mother = Mother
}
