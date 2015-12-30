var Pleb = function (partialNeuron, sendFunction) {
  Neuron.call(this, partialNeuron);
  this.toManager = new IoHandler(0, 1, this, sendFunction)
}
Pleb.prototype = Object.create(Neuron.prototype);
Pleb.prototype.constructor = Pleb;

Pleb.prototype.update = function (command, section, partialNeuron) {
  Neuron.call(this, partialNeuron);
}

Pleb.prototype.run = function (command, section) {
  this[command](section);
  this.queueCommandManager(command, section);
  this.toManager.runAllOutputs();
  this.toManager.runAllInputs();
}

Pleb.prototype.queueCommandManager = function (command, section, callback) {
  var value = new Neuron();
  value.node.id = this.node.id;
  value.node.layerId = this.node.layerId;
  value.node.subNetworkId = this.node.subNetworkId;
  value.node.subNetworkLayerId = this.node.subNetworkLayerId;
  if(command === 'activationStep') {
    value.node.state = this.node.state;
    value.node.activation = this.node.activation;
    value.node.derivative = this.node.derivative;
  } else if(command === 'influenceStep') {
    value.node.influences = this.node.influences;
  } else if(command === 'elegibilityStep') {
    value.node.elegibilities = this.node.elegibilities;
  } else if(command === 'extendedElegibilityStep') {
    value.node.extendedElegibilities = this.node.extendedElegibilities;
  } else if(command === 'projectedErrorStep') {
    value.node.errorProjected = this.node.errorProjected;
  } else if(command === 'gatedErrorStep') {
    value.node.errorGated = this.node.errorGated
  } else if(command === 'learningStep') {
    value.connections.inputs = this.connections.inputs
  }
  if(callback) {
    callback = callback.bind('this')
  }
  this.toManager.addToOut(command, section, value, callback);
}

if(module) {
  module.exports = Pleb
}
