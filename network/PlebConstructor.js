var Pleb = function (partialNeuron) {
  Neuron.call(this.paritalneuron);
  this.delegator = new DelegationQueue()
}
Pleb.prototype = Object.create(Neuron.prototype);
Pleb.prototype.constructor = Pleb;

Pleb.prototype.activate = function() {
  if(this.job === 1) {
    this.activationStep();
  } else if(this.job === 2) {
    this.influenceStep();
  } else if(this.job === 3) {
    this.elegibilityStep();
  } else {
    this.extendedElegibilityStep();
  }
  this.sendUpstream();
}

Pleb.prototype.activationStep = function () {
  for(var i = 0; i < this.inputConns.ids.length; ++i) {
    this.state += this.inputConns.weights[i] * this.inputConns.gains[i] * this.inputConns.activations[i];
  }
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
}

Pleb.prototype.elegibilityStep = function () {

}

Pleb.prototype.extendedElegibilityStep = function () {

}

if(module && module.exports) {
  module.exports = Pleb;
}
