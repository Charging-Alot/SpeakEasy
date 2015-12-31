var Neuron = function (partialNeuron) {
  this.type = 'neuron';
  if(partialNeuron !== undefined && partialNeuron !== null) {
    this.trainable = partialNeuron.trainable
    this.isOutput = partialNeuron.isOutput;
    this.rate = partialNeuron.rate;
    this.maxGradient = partialNeuron.maxGradient;
    this.node = partialNeuron.node || {}
    this.connections = {};
    if(partialNeuron.connections) {
      this.connections.inputs = partialNeuron.connections.inputs || [];
      this.connections.outputs = partialNeuron.connections.outputs || [];
      this.connections.gated = partialNeuron.connections.gated || [];
    } else {
      this.connections = {}
      this.connections.inputs = [];
      this.connections.outputs = [];
      this.connections.gated = [];
    }
    this.gatedNodes = partialNeuron.gatedNodes || {}
  } else {
    this.node = {};
    this.connections = {};
    this.connections.inputs = [];
    this.connections.outputs = [];
    this.connections.gated = [];
    this.gatedNodes = {};
  }
};

Neuron.prototype.update = function (partialNeuron) {
  //properties of this node
  if(partialNeuron.node) {
    for(var nodeProp in partialNeuron.node) {
      if(nodeProp === 'extendedElegibilities') {
        for(var gatedNode in partialNeuron.node.extendedElegibilities) {
          this.node.extendedElegibilities[gatedNode] = partialNeuron.node.extendedElegibilities[gatedNode]
        }
      } else {
        this.node[nodeProp] = partialNeuron.node[nodeProp];
      }
    }
  }
  if(partialNeuron.gatedNodes) {
    for(var node in partialNeuron.gatedNodes) {
      if(!this.gatedNodes[node]) {
        this.gatedNodes[node] = {};
      }
      for(gatedProp in partialNeuron.gatedNodes[node]) {
        this.gatedNodes[node][gatedProp] = partialNeuron.gatedNodes[node][gatedProp];
      }
    }
  }
  if(partialNeuron.connections) {
    for(var connType in partialNeuron.connections) {
      for(var connection in partialNeuron.connections[connType]) {
        if(!this.connections[connType][connection]) {
          this.connections[connType][connection] = {};
        }
        for(var property in partialNeuron.connections[connType][connection]) {
          if(property !== 'toNode' && property !== 'fromNode' && property !== 'gateNode') {
            this.connections[connType][connection][property] = partialNeuron.connections[connType][connection][property];
          }
        }
      }
    }
  }
}

//synchronous backprop and activation
Neuron.prototype.activateSync = function () {
  this.initialState();
  this.activationStep();
  this.squashState();
  this.influenceStep();
  this.elegibilityStep();
  for(var i in this.gatedNodes) {
    this.extendedElegibilityStep(i);
  }
}

Neuron.prototype.backPropagateSync = function () {
  if(this.isOutput && this.node.subNetworkId === -1) {
    this.learningStep();
    this.adjustBias();
  } else {
    this.projectedErrorStep();
    this.gatedErrorStep();
    this.setErrorResponsibility();
    this.learningStep();
    this.adjustBias();
  }
}

//constant time steps
Neuron.prototype.initialState = function () {
  this.node.prevState = this.node.state;
  this.node.state = this.node.bias + this.node.prevState * (this.node.selfConnection.gateNode ? this.node.selfConnection.gateNode.activation : 1) * this.node.selfConnection.weight;
}

Neuron.prototype.squashState = function () {
  if(!this.node.squash) {
    this.node.activation = squash['sigmoid'].activation(this.node.state); //this.squashAct(this.node.state);
    this.node.derivative = squash['sigmoid'].derivative(this.node.state); //this.squashDer(this.node.state);
  } else {
    this.node.activation = squash[this.node.squash].activation(this.node.state); //this.squashAct(this.node.state);
    this.node.derivative = squash[this.node.squash].derivative(this.node.state); //this.squashDer(this.node.state);
  }
}

Neuron.prototype.adjustBias = function () {
  if(this.node.trainable) {
    this.node.bias += this.rate * this.node.errorResponsibility;
  }
}

Neuron.prototype.setErrorResponsibility = function () {
  this.node.errorResponsibility = this.node.errorGated + this.node.errorProjected;
}

//iterative steps
Neuron.prototype.activationStep = function () {
  for(var i = 0; i < this.connections.inputs.length; ++i) {
    if(this.connections.inputs[i].gateNode) {
      this.node.state += (this.connections.inputs[i].weight * this.connections.inputs[i].gateNode.activation * this.connections.inputs[i].fromNode.activation);
    } else {
      this.node.state += (this.connections.inputs[i].weight * this.connections.inputs[i].fromNode.activation);
    }
  }

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
// Neuron.prototype.activationStep.iteratesOver = 'inputs'

Neuron.prototype.influenceStep = function () {
  this.node.influences = {};
  for(var i = 0; i < this.connections.gated.length; ++i) {
    gatedNode = this.connections.gated[i].toNode //does not account for gated nodes in multiple layers
    if(this.node.influences[gatedNode.id] === undefined) {
      //if we haven't seen neuron before then initialize it to 0 or prevState if the to node is selfConnected
      this.node.influences[gatedNode.id] = gatedNode.selfConnection.gateId === this.node.id  && 
        gatedNode.selfConnection.gateLayer === this.node.layerId ? gatedNode.prevState : 0; 
    }
    this.node.influences[gatedNode.id] += this.connections.gated[i].weight * this.connections.gated[i].fromNode.activation;
  }
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
// Neuron.prototype.influenceStep.iteratesOver = 'gates'

Neuron.prototype.elegibilityStep = function () {
  for(var i = 0; i < this.connections.inputs.length; ++i) {
    this.node.elegibilities[i] *= this.node.selfConnection.weight * (this.node.selfConnection.gateNode ? this.node.selfConnection.gateNode.activation : 1);
    this.node.elegibilities[i] += (this.connections.inputs[i].gateNode ? this.connections.inputs[i].gateNode.activation : 1) * this.connections.inputs[i].fromNode.activation;
  }
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

// Neuron.prototype.elegibilityStep.iteratesOver = 'inputs'

Neuron.prototype.extendedElegibilityStep = function (gateNeuronId) { // should have key other than 0 for extendedEls
    for(var i = 0; i < this.node.elegibilities.length; ++i) {
      this.node.extendedElegibilities[gateNeuronId][i] *= this.gatedNodes[gateNeuronId].selfConnection.weight
        * (this.gatedNodes[gateNeuronId].selfConnection.gateNode ? this.gatedNodes[gateNeuronId].selfConnection.gateNode.activation : 1);
      this.node.extendedElegibilities[gateNeuronId][i] += this.node.derivative * this.node.elegibilities[i] 
        * this.node.influences[gateNeuronId];
    }
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

// Neuron.prototype.extendedElegibilityStep.iteratesOver = 'inputs'

Neuron.prototype.projectedErrorStep = function () {
  this.node.errorProjected = 0;
  for (var i = 0; i < this.connections.outputs.length; ++i) {
    this.node.errorProjected += this.connections.outputs[i].toNode.errorResponsibility * //this is from the to neuron
      (this.connections.outputs[i].gateNode !== null ? this.connections.outputs[i].gateNode.activation : 1) * this.connections.outputs[i].weight
  }
  this.node.errorProjected *= this.node.derivative;
  /*
    connections.outputs
      errorResponsibility
      gain
      weight
    node
      derivative
  */
}

// Neuron.prototype.projectedErrorStep.iteratesOver = 'outputs'

Neuron.prototype.gatedErrorStep = function () {
  this.node.errorGated = 0;
  this.node.influences = {}
  for (var j = 0; j < this.connections.gated.length; ++j) {
    var gatedNode = this.gatedNodes[this.connections.gated[j].toNodeId]
    if(this.node.influences[gatedNode.id] === undefined) {
      this.node.influences[gatedNode.id] = gatedNode.selfConnection.gateId === this.node.id &&
        gatedNode.selfConnection.gateLayerId === this.node.layerId ? gatedNode.prevState : 0;
    }

    this.node.influences[gatedNode.id] += this.connections.gated[j].weight * this.connections.gated[j].fromNode.activation;
  }
  for(var k in this.gatedNodes) {
    this.node.errorGated += this.node.influences[this.gatedNodes[k].id] * this.gatedNodes[k].errorResponsibility;
  }
  this.node.errorGated *= this.node.derivative;
}

// Neuron.prototype.gatedErrorStep.iteratesOver = 'gatedNodes'

Neuron.prototype.learningStep = function () {
  var gradient;
  for(var i = 0; i < this.connections.inputs.length; ++i) {
    if(this.connections.inputs[i].trainable) {
      gradient = this.node.errorProjected * this.node.elegibilities[i]
      for(var j in this.gatedNodes) {
        gradient += this.gatedNodes[j].errorResponsibility * this.node.extendedElegibilities[j][i]
      }
      this.connections.inputs[i].weight += this.rate * (gradient >= 0 ? Math.min(gradient, this.maxGradient) : Math.max(gradient, -this.maxGradient));
    }
  }
}

// Neuron.prototype.learningStep.iteratesOver = 'inputs'

var squash = {
  'sigmoid': {
    'activation': function (x) {
      return 1/(1 + Math.exp(-x))
    },
    'derivative': function (x) {
      return Math.exp(x)/Math.pow(1 + Math.exp(x), 2)
    }
  },
  'hyperbolicTangent': {
    'activation': function (x) {
      return (Math.exp(2*x)  - 1) / (Math.exp(2*x) + 1)
    },
    'derivative': function (x) {
      return 4*Math.exp(2*x) / ((Math.exp(2*x) + 1)^2)
    }
  },
  'none': {
    'activation': function (x) {
      return x
    },
    'derivative': function (x) {
      return x
    }
  },
}

if(module) {
  module.exports.Neuron = Neuron;
}
