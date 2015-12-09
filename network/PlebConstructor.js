var Pleb = function (partialNeuron) {
  Neuron.call(this.paritalneuron);
  this.toManager = new IoHandler(0,1)
}
Pleb.prototype = Object.create(Neuron.prototype);
Pleb.prototype.constructor = Pleb;

Pleb.prototype.activationStep = function () {
  for(var i = 0; i < this.inputConns.inputConns.length; ++i) {
    this.node.state += this.inputConns.weights[i] * this.inputConns.gains[i] * this.inputConns.activations[i];
  }
  this.queueCommandManager('activationStep', null);
  this.toManager.runAllOutouts();
}

Pleb.prototype.influenceStep = function () {
  this.gatedConns.influences = {};
  for(var i = 0; i < this.gatedConns.tos.length; ++i) {
    if(this.gatedConns.influences[this.gatedConns.tos[i]] === undefined) {
      //if we haven't seen neuron before then initialize it to 0 or prevState if the to node is selfConnected
      this.gatedConns.influences[this.gatedConns.tos[i]] =  this.gatedConns.selfConns.initialInfluences[this.gatedConns.tos[i]] || 0; 
    }
    this.gatedConns.influences[this.gatedConns.tos[i]] += this.gatedConns.weights[i] * this.gatedConns.activations[i];
  }
  this.queueCommandManager('influenceStep', null)
  this.toManager.runAllOutouts();
}

Pleb.prototype.elegibilityStep = function () {
  for(var i = 0; i < this.inputConns.activations.length; ++i) {
    this.inputConns.elegibilities[i] *= this.node.selfConnection.weight[i] * this.node.selfConnection.gain[i];
    this.inputConns.elegibilities[i] += this.inputConns.gains[i] * this.inputConns.activations[i];
  }
  this.queueCommandManager('elegibilityStep', null)
  this.toManager.runAllOutouts();
}

Pleb.prototype.extendedElegibilityStep = function () {
  var gatedNode = this.gatedConns.to;
  for(var m = 0; m < this.node.inputConns.ids.length; ++m) {
    if(this.gatedConns.selfConned.weight) {
      this.gatedConns.extendedEligibility[m] *= this.gatedConns.selfConned.weight
                                                  * this.gatedConns.selfConned.gain
    } else {
      this.gatedConns.extendedEligibility[m] = 0;
    }
    this.gatedConns.extendedEligibility[m] += this.node.derivative * this.inputConns.elegibilities[m] 
                                                  * this.gatedConns.influences[l];
  }
  this.queueCommandManager('extendedElegibilityStep', this.section);
  this.toManager.runAllOutouts();
}

Pleb.prototype.queueCommandManager = function (command, section) {
  var value = new Neuron();
  if(command === 'activationStep') {
    value.node.state = this.node.state
  } else if(command === 'influenceStep') {
    value.gatedConns.influences = this.gatedConns.influences;
  } else if(command === 'elegibilityStep')
    value.inputConns.elegibilities = this.inputConns.elegibilities;
  } else if(command === 'extendedElegibilityStep') {
    value.gatedConns.extendedEligibility = this.gatedConns.extendedEligibility;
  }
  this.toPleb.addToOut(command, section, callback.bind('this'));
}

if(module && module.exports) {
  module.exports = Pleb;
}
