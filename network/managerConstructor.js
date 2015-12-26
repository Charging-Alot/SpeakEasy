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
  this.node.state = this.node.bias + this.node.prevState * (this.node.selfConnection.gateNode ? this.node.selfConnection.gateNode.activation : 1) * this.node.selfConnection.weight;

  this.queueCommandPleb('activationStep', null, function () {
  });
  
  this.queueCommandPleb('influenceStep', null, function () {
  });

  this.queueCommandPleb('elegibilityStep', null, function () {
  });

  this.toPleb.runAllOutputs(function () {
      var exElResponseCounter = 0;
    for(var i in this.gatedNodes) {
      this.queueCommandPleb('extendedElegibilityStep', i, function (command, section, partialNeuron) {
      });
    }
    this.toPleb.runAllOutputs(function () {
      this.queueCommandMother('activate', section);
      this.toMother.runAllOutputs();
      this.toMother.runAllInputs();
    }.bind(this));
  }.bind(this));
}

Manager.prototype.backPropagate = function (section) {
  if(this.isOutput) {
    this.queueCommandPleb('learningStep', null, function () {
      this.node.bias += this.rate * this.node.errorResponsibility
      this.queueCommandMother('backPropagate', section)
      this.toMother.runAllOutputs();
      this.toMother.runAllInputs();
    }.bind(this));
    this.toPleb.runAllOutputs();
  } else {
    this.node.errorProjected = 0;
    var hasLearned = false;
    var hasGatedError = false;
    var hasProjectedError = false
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
      if(this.node.trainable) {
        this.node.bias += this.rate * this.node.errorResponsibility
      }
      if(hasLearned) {
        this.toPleb.runAllOutputs(function () {
        this.queueCommandMother('backPropagate', section);
        this.toMother.runAllOutputs();
        this.toMother.runAllInputs();
        }.bind(this))
      }
    }.bind(this))
  }
}

Manager.prototype.queueCommandPleb = function (command, section, callback) {
  var value = new Neuron();
  if(command === 'activationStep') {
    value.connections.inputs = this.connections.inputs;
    value.node.state = this.node.state
  } else if(command === 'influenceStep') {
    value.node.id = this.node.id;
    value.node.layerId = this.node.layerId;
    value.gatedNodes = this.gatedNodes;
    value.connections.gated = this.connections.gated;
  } else if(command === 'elegibilityStep') {
    value.node.elegibilities = this.node.elegibilities;
    value.node.selfConnection = this.node.selfConnection;
    value.connections.inputs = this.connections.inputs;
  } else if(command === 'extendedElegibilityStep') {
    value.node.influences = this.node.influences
    value.node.extendedElegibilities = {}
    value.node.extendedElegibilities[section] = this.node.extendedElegibilities[section];
    value.node.elegibilities = this.node.elegibilities
    value.node.derivative = this.node.derivative
    value.gatedNodes[section] = this.gatedNodes[section];
  } else if(command === 'gainStep') {
    value.node.activation = this.node.activation; //not used currently
  } else if(command === 'projectedErrorStep') {
    value.connections.outputs = this.connections.outputs;
    value.node.derivative = this.node.derivative;
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
  if (command === 'activate') {
    value.node = this.node;
    value.node.influences = {};




    value.connections.gatedConns = this.connections.gatedConns;
    value.connections.outputs = this.connections.outputs;
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
