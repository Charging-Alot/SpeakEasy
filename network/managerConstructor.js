var Manager = function (partialNeuron) {
  Neuron.call(paritalNeuron);
  this.toPleb = new IoHandler(1, 0, this.update.bind(this), send);
  this.toMother = new IoHandler(1, 2, this.update.bind(this), send);
}
Manager.prototype = Object.create(Neuron.prototype);
Manager.prototype.constructor = Manager;

Manager.prototype.activate = function() {
  this.node.prevState = this.node.state;
  this.node.state = this.node.bias + this.node.old * this.node.selfConnection.gain * this.node.selfConnection.weight;

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
    for(var i = 0; i < this.gatedNodes.length; ++i) {
      this.queueCommandPleb('extendedElegibilityStep', i, function () {
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
      //this part is done on mother
      // for(var i = 0; i < this.connections.gated.length; ++i) {
      //   this.connections.gated.gains[i] = this.node.activation;
      // }
      this.queueCommandMother('activate');
      this.toMother.runAllInputs();
    }.bind(this));
  }.bind(this));

}

Manager.prototype.queueCommandPleb = function (command, section, callback) {
  var value = new Neuron();
  if(command === 'activationStep') {
    value.connections.inputs = this.connections.inputs;
    value.node = this.node
    // value.inputConns.weights = this.inputConns.weights;
    // value.inputConns.gains = this.inputConns.gains;
    // value.inputConns.activations = this.inputConns.activations;
    // value.node.state = this.node.state;
    // value.node.prevState = this.node.prevState;
  } else if(command === 'influenceStep') {
    value.node = this.node;
    value.gatedNodes = this.gatedNodes;
    value.connections.gated = this.connections.gated;
    // value.gatedConns.tos = this.gatedConns.tos;
    // value.gatedConns.weights = this.gatedConns.weights;
    // value.gatedConns.activations = this.gatedConns.activations;
    // value.gatedConns.selfConns.initialInfluences = this.gatedConns.selfConns.initialInfluences
  } else if(command === 'elegibilityStep') {
    value.node = this.node;
    value.connections.inputs = value.connections.inputs;
    // value.inputConns.elegibilities = this.inputConns.elegibilities;
    // value.node.selfConnection = this.node.selfConnection;
    // value.inputConns.gains = this.inputConns.gains;
    // value.inputConns.activations = this.inputConns.activations;
  } else if(command === 'extendedElegibilityStep') {
    value.node = this.node;
    value.gatedNodes = this.gatedNodes;
    // value.gatedConns.to = this.gatedConns.tos[section];
    // value.node.derivative = this.node.derivative;
    // value.gatedConns.selfConns.weight = this.gatedConns.selfConned.weights[this.gatedConns.tos[section]] || 0;
    // value.gatedConns.selfConns.gain = this.gatedConns.selfConned.gains[this.gatedConns.tos[section]] || 1;
    // value.gatedConns.influence = this.gatedConns.influences[this.gatedConns.tos[section]];
    // value.gatedConns.extendedElegibility = this.gatedConns.extendedElegibilities[section]
  } else if(command === 'gainStep') {
    value.node.activation = this.node.activation; //not used currently
  }
  if(callback) {
    callback.bind(this);
  }
  this.toPleb.addToOut(command, section, value, callback);
}

Manager.prototype.queueCommandMother = function (command, callback) {
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
    value.node
    //add an output to add activation to;
    value.connections.gatedConns;
    // value.node.id = this.node.id;
    // value.node.state = this.node.state;
    // value.node.derivative = this.node.derivative;
    // value.node.activation = this.node.activation;
    // value.inputConns.ids;
    // value.inputConns.elegibilities = this.inputConns.elegibilities;
    // value.gatedConns.ids;
    // value.gatedConns.extendedElegibility = this.gatedConns.extendedElegibility;
    // value.gatedConns.gains;
  }
  if(callback) {
    callback = callback.bind(this);
  }
  this.toMother.addToOut(command, section, value);
}


if(module && module.exports) {
  module.exports = Manager;
}
