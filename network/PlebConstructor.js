var Pleb = function (partialNeuron, sendFunction) {
  Neuron.call(this, partialNeuron);
  this.toManager = new IoHandler(0, 1, this, sendFunction)
}
Pleb.prototype = Object.create(Neuron.prototype);
Pleb.prototype.constructor = Pleb;

Pleb.prototype.update = function (command, section, partialNeuron) {
  Neuron.call(this, partialNeuron);
}

Pleb.prototype.activationStep = function () {
  for(var i = 0; i < this.connections.inputs.length; ++i) {
    this.node.state += this.connections.inputs[i].weight * this.connections.inputs[i].gain * this.connections.inputs[i].activation;
  }
  this.node.activation = this.squashAct(this.node.state);
  this.node.derivative = this.squashDer(this.node.state);
  this.queueCommandManager('activationStep', null);
  this.toManager.runAllOutputs();

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
  this.node.influences = {};

  for(var i = 0; i < this.connections.gated.length; ++i) {
    console.log(this.connections.gated[i].toNodeId)
    gatedNode = this.gatedNodes[this.connections.gated[i].toNodeId] //does not account for gated nodes in multiple layers
    if(this.node.influences[gatedNode.id] === undefined) {
      //if we haven't seen neuron before then initialize it to 0 or prevState if the to node is selfConnected
      this.node.influences[gatedNode.id] = gatedNode.selfConnection.gateId === this.node.id  && 
        gatedNode.selfConnection.gateLayer === this.node.layerId ? gatedNode.prevState : 0; 
    }
    this.node.influences[gatedNode.id] += this.connections.gated[i].weight * this.connections.gated[i].activation;
  }
  this.queueCommandManager('influenceStep', null);
  this.toManager.runAllOutputs();
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
  for(var i = 0; i < this.connections.inputs.length; ++i) {
    this.node.elegibilities[i] *= this.node.selfConnection.weight * this.node.selfConnection.gain;
    this.node.elegibilities[i] += this.connections.inputs[i].gain * this.connections.inputs[i].activation;
  }
  this.queueCommandManager('elegibilityStep', null)
  this.toManager.runAllOutputs();
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

Pleb.prototype.extendedElegibilityStep = function (section) { // should have key other than 0 for extendedEls
  // for(gatedNodeId in this.node.extendedElegibilities) { //there's only one for each pleb, but this is an easy way to extract it
    for(var i = 0; i < this.node.elegibilities.length; ++i) {
      this.node.extendedElegibilities[section][i] *= this.gatedNodes[section].selfConnection.weight
        * this.gatedNodes[section].selfConnection.gain;
      this.node.extendedElegibilities[section][i] += this.node.derivative * this.node.elegibilities[i] 
        * this.node.influences[section];
    }
  // }
  this.queueCommandManager('extendedElegibilityStep', section);
  this.toManager.runAllOutputs();
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

Pleb.prototype.projectedErrorStep = function () {
  this.node.errorProjected = 0;
  for (var i = 0; i < this.connections.outputs.length; ++i) {
    this.node.errorProjected += this.connections.outputs[i].errorResponsibility * //this is from the to neuron
      this.connections.outputs[i].gain * this.connections.outputs[i].weight
  }
  this.node.errorProjected *= this.derivative;

  this.queueCommandManager('projectedErrorStep', null)
  this.toManager.runAllOutputs();
  /*
    connections.outputs
      errorResponsibility
      gain
      weight
    node
      derivative
  */
}

Pleb.prototype.gatedErrorStep = function () {
  this.node.errorGated = 0;
  this.node.influences = {}
  for (var j = 0; j < this.connections.gated.length; ++j) {
    var gatedNode = this.gatedNodes[this.connection.toNodeId]
    if(this.node.influences[gatedNode.node.id] === undefined) {
      this.node.influences[gatedNode.node.id] = gatedNode.node.selfConnection.gateId === this.node.id &&
        gatedNode.node.selfConnection.gateLayerId === this.node.layerId ? gatedNode.node.prevState : 0;
    }
    influence[gatedNode.node.id] += this.connections.gated[j].weight * this.connections.gated[j].activation;
  }
  for(var k = 0; k < this.gatedNodes.length; ++k) {
    this.node.errorGated += this.node.influences[this.gatedNodes[k].node.id] * this.gatedNodes[k].node.errorResponsibility;
  }
  this.node.errorGated *= this.derivative;
  this.queueCommandManager('gatedErrorStep', null);
  this.toManager.runAllOutputs();

}

Pleb.prototype.learningStep = function () {
    var gradient;
    for(var l = 0; l < this.connections.inputs.length; ++l) {
      gradient = this.node.errorProjected * this.node.elegibilities[l]
      for(var m in this.gatedNodes.length) {
        gradient += this.gatedNodes[m].node.errorResponsibility * this.node.extendedElegibilities[this.gatedNodes[m].id][l]
      }
      this.connections.inputs[l].weight += this.rate * Math.min(gradient, this.maxGradient);
    }
    this.queueCommandManager('learningStep', null);
    this.toManager.runAllOutputs();
}

Pleb.prototype.queueCommandManager = function (command, section, callback) {
  var value = new Neuron();
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

Pleb.prototype.squashAct = function(x) {
  return 1/(1-Math.exp(-x))
}
Pleb.prototype.squashDer = function (x) {
  return Math.exp(x)/Math.pow(1-Math.exp(x), 2)
}
