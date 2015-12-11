var Pleb = function (partialNeuron) {
  Neuron.call(this.paritalneuron);
  this.toManager = new IoHandler(0,1)
}
Pleb.prototype = Object.create(Neuron.prototype);
Pleb.prototype.constructor = Pleb;

Pleb.prototype.activationStep = function () {
  for(var i = 0; i < this.connections.inputs.length; ++i) {
    this.node.state += this.connections.inputs[i].weight * this.connections.inputs[i].gain * this.connections.inputs[i].activations;
  }
  this.queueCommandManager('activationStep', null);
  this.toManager.runAllOutputs();
  this.node.activation = squash(this.state);
  this.node.derivative = squash(this.state, true);
  /*
  node
    state
    activation
    derivative
  connections.inputs
    weight
    gain
    activation
  */
}

Pleb.prototype.influenceStep = function () {
  for(var i = 0; i < this.connections.gated.length; ++i) {
    gatedNode = this.gatedNodes[this.connections.gated[i].toId]
    if(gatedNode.influence === undefined) {
      //if we haven't seen neuron before then initialize it to 0 or prevState if the to node is selfConnected
      gatedNode.influence = gatedNode.selfConnection.gateId === this.node.id  && 
        gatedNode.selfConnection.gateLayer === this.node.layerId ? gatedNode.prevState : 0; 
    }
    gatedNode.influence += this.connections.gated[i].weight * this.connections.gated[i].activation;
  }
  this.queueCommandManager('influenceStep', null);
  this.toManager.runAllOutouts();
  /*
  connections.gated
    to
    weight
    activation
  gatedNodes
    selfConnection
      gateId
    prevState
    influence (out only)
  node
    id
  */

}

Pleb.prototype.elegibilityStep = function () {
  for(var i = 0; i < this.connections.inputs[i].activations; ++i) {
    this.node.elegibilities[i] *= this.node.selfConnection.weight * this.node.selfConnection.gain;
    this.node.elegibilities[i] += this.connections.inputs[i].gain * this.connections.inputs[i].activation;
  }
  this.queueCommandManager('elegibilityStep', null)
  this.toManager.runAllOutouts();
  /*
  node
    elegibilities
    sefconnection
      weight
      gain
  connections.inputs
    gain
    activation
    weight
  */
}

Pleb.prototype.extendedElegibilityStep = function () {
  for(var i = 0; i < this.node.elegibilities.length; ++i) {
    this.node.extendedEligibilities[0][i] *= this.gatedNodes[0].selfConnection.weight
                                                  * this.gatedNodes[0].selfConnection.gain;
    this.node.extendedEligibilities[0][i] += this.node.derivative * this.node.elegibilities[i] 
                                                  * this.gatedNodes[0].influence;
  }
  this.queueCommandManager('extendedElegibilityStep', this.section);
  this.toManager.runAllOutouts();
  /*
  node
    extendedEligibilities (just one)
    elegibilities
    derivative
  gatedNodes (just one)
    selfConnection
      weight
      gain
    influence
  */
}

Pleb.prototype.gainStep = function () {
  //not currently used;
}

Pleb.prototype.queueCommandManager = function (command, section) {
  var value = new Neuron();
  if(command === 'activationStep') {
    value.node.state = this.node.state;
    value.node.activation = this.node.activation;
    value.node.derivative = this.node.derivative;
  } else if(command === 'influenceStep') {
    value.connections.gated = this.connections.gated;
  } else if(command === 'elegibilityStep')
    value.node.elegibilities = this.node.elegibilities;
  } else if(command === 'extendedElegibilityStep') {
    value.node.extendedEligibility = this.node.extendedEligibility;
  }
  this.toPleb.addToOut(command, section, value, callback.bind('this'));
}

if(module && module.exports) {
  module.exports = Pleb;
}
