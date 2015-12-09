var Manager = function (partialNeuron) {
  Neuron.call(this.paritalNeuron);
  this.toPleb = new IoHandler(1, 0, this.update.bind(this), send);
  this.toMother = new IoHandler(1, 2, this.update.bind(this), send);
}
Manager.prototype = Object.create(Neuron.prototype);
Manager.prototype.constructor = Manager;

Manager.prototype.activate = function() {
  this.node.prevState = this.node.state;
  this.node.state = this.node.bias + this.node.old * this.node.selfConn.gain * this.node.selfConn.weight;

  this.queueCommandPleb('activationStep', null, function () {
    this.activation = squash(this.state);
    this.derivative = squash(this.state, true);
    this.queueCommandMother('activationStep', null);
    this.toMother.runAllOutputs();
  });

  this.queueCommandPleb('influenceStep', null, function () {
    // this.queueCommandMother('influenceStep', null);
    // this.toMother.runAllOutputs();
    // gets rewritten at backPropagation.
  });

  this.queueCommandPleb('elegibilityStep', null, function () {
    this.queueCommandMother('elegibilityStep', null);
    this.toMother.runAllOutputs();
  });

  this.toPleb.runAllOutputs(function () {
    for(var i = 0; i < gatedConns.ids.length; ++i) {
      this.queueCommandPleb('extendedElegibilityStep', i, function () {
        // this.queueCommandMother('extendedElegibilityStep', i);
        //should these get passed back bit by bit?
      });
    }
    this.toPleb.runAllOutputs(function () {
      this.queueCommandMother('activate', null);
      this.toMother.runAllOutputs();
      this.toMother.runAllInputs();
    }.bind(this));
  });

}

Manager.prototype.queueCommandPleb = function (command, section, callback) {
  var value = new Neuron();
  if(command === 'activationStep') {
    value.inputConns.weights = this.inputConns.weights;
    value.inputConns.gains = this.inputConns.gains;
    value.inputConns.activations = this.inputConns.activations;
    value.node.state = this.node.state;
  } else if(command === 'influenceStep') {
    value.gatedConns.tos = this.gatedConns.tos;
    value.gatedConns.weights = this.gatedConns.weights;
    value.gatedConns.activations = this.gatedConns.activations;
    value.gatedConns.selfConns.initialInfluences = this.gatedConns.selfConns.initialInfluences
  } else if(command === 'elegibilityStep') {
    value.inputConns.elegibilities = this.inputConns.elegibilities;
    value.node.selfConnection = this.node.selfConnection;
    value.inputConns.gains = this.inputConns.gains;
    value.inputConns.activations = this.inputConns.activations;
  } else if(command === 'extendedElegibilityStep') {
    value.gatedConns.to = this.gatedConns.tos[section];
    value.node.derivative = this.node.derivative;
    value.gatedConns.selfConns.weight = this.gatedConns.selfConned.weights[this.gatedConns.tos[section]];
    value.gatedConns.selfConns.gain = this.gatedConns.selfConned.gains[this.gatedConns.tos[section]];
    value.gatedConns.influence = this.gatedConns.influences[this.gatedConns.tos[section]];
    value.gatedConns.extendedElegibility = this.gatedConns.extendedElegibilities[section]
  }
  this.toPleb.addToOut(command, section, value, callback.bind(this));
}

Manager.prototype.queueCommandMother = function (command, section, callback) {
  var value = new Neuron();
  if(command === 'activationStep') {
    value.node.state = this.node.state;
    value.node.derivative = this.node.derivative;
    value.node.activation = this.node.activation;
    command = 'update';
  } else if(command === 'elegibilityStep') {
    value.inputConns.elegibilities = this.inputConns.elegibilities;
    command = 'update';
  } else if(command === 'activate') {
    value.gatedConns.extendedElegibility = this.gatedConns.extendedElegibility
  }
  this.toMother.addToOut(command, section, callback.bind('this'));
}


if(module && module.exports) {
  module.exports = Manager;
}
