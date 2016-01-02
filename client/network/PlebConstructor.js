if (module) {
  var Neuron = require('./neuronConstructor.js').Neuron
  var IoHandler = require('./IoHandler.js').IoHandler;
}
/*
 * Pleb Constructor.  
 * Creates a new controller at the lowest tier (0) which is intended to complete a single step on a recieved neuron and then return the neuron to it's parent controller.
 * 
 * @param {partialNeuron} object - All or part of neuron which will be used to instantiate this controller's model
 * @param {sendFunction} function - A function which takes a number indicating the level the message is meant to go to, followed by a string containing the message to be sent
 */
var Pleb = function (partialNeuron, sendFunction) {
  Neuron.call(this, partialNeuron);
  this.toManager = new IoHandler(0, 1, this, sendFunction);
}
Pleb.prototype = Object.create(Neuron.prototype);
Pleb.prototype.constructor = Pleb;
/*
 * Updates controller model.
 *
 * @param {command} string - Unused, indicates the command accompanying the neuron
 * @param {section} number - Unused, indicates what index the command corresponds to
 * @param {partialNeuron} neuron object - All or part of the neuron, which work is to be done on
 */
Pleb.prototype.update = function (command, section, partialNeuron) {
  Neuron.call(this, partialNeuron);
}

/*
 * Takes a json string, parses it and sends it to this controllers input queue.
 *
 * @param {jsonString} string - A json string containing the taskObj to be run
 */
Pleb.prototype.input = function (jsonString) {
  object = JSON.parse(jsonString)
  this.toManager.addToIn(jsonString)
}

/*
 * Runs the given command with section as an argument and then sends it's response upstream.  
 * Then checks it's input queue for input.
 *
 * @param {command} string - String containing the function name to be called
 * @param {section} number - Number to be passed to the command function (usually an index)
 */
Pleb.prototype.run = function (command, section) {
  this[command](section);
  this.queueCommandManager(command, section);
  this.toManager.runAllOutputs();
  this.toManager.runAllInputs();
}

/*
 * Creates an object with the appropriate values for the command and section passed in and adds it to the output queue.  
 * Binds the callback to the controller as context.
 *
 * @param {command} string - String containing the function that prompted this command being sent
 * @param {section} number - Number indicating the section of this command
 * @param {callback} function - Function to be called on response from controller up one tier from this one
 */
Pleb.prototype.queueCommandManager = function (command, section, callback) {
  var value = new Neuron();
  value.node.id = this.node.id;
  value.node.layerId = this.node.layerId;
  value.node.subNetworkId = this.node.subNetworkId;
  value.node.subNetworkLayerId = this.node.subNetworkLayerId;
  if (command === 'activationStep') {
    value.node.state = this.node.state;
    value.node.activation = this.node.activation;
    value.node.derivative = this.node.derivative;
  } else if (command === 'influenceStep') {
    value.node.influences = this.node.influences;
  } else if (command === 'elegibilityStep') {
    value.node.elegibilities = this.node.elegibilities;
  } else if (command === 'extendedElegibilityStep') {
    value.node.extendedElegibilities = this.node.extendedElegibilities;
  } else if (command === 'projectedErrorStep') {
    value.node.errorProjected = this.node.errorProjected;
  } else if (command === 'gatedErrorStep') {
    value.node.errorGated = this.node.errorGated
  } else if (command === 'learningStep') {
    value.connections.inputs = this.connections.inputs
  }
  if (callback) {
    callback = callback.bind(this)
  }
  this.toManager.addToOut(command, section, value, callback);
}

if (module) {
  exports.Pleb = Pleb
}
