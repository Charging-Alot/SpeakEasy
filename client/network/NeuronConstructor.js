/*
 * Neuron constructor.  
 * Takes all or part of a Neuron object, including it's node and relevant connections
 * And builds any structures that were not all ready in the object.
 * Should be called with the new keyword
 * 
 * @param {partialNeuron} object - An object containing some or all parts of a single neuron.  Structured as follows:
 * {
 *   trainable: boolean
 *   isOutput: boolean
 *   rate: float
 *   maxGradient: float
 *   node: Node object (see factory in Network Constructor)
 *   connections: object 
 *     {
 *       inputs: array
 *         [
 *           Connection objects (see factory in Network Constructor)
 *         ]
 *       outputs: array
 *         [
 *           Connection objects
 *         ]
 *       gated: array
 *         [
 *           Connection objects
 *         ]
 *     }
 *   gatedNodes: object
 *     {
 *       Node object
 *     }
 * }
 * @return neuron object
 */
var Neuron = function (partialNeuron) {
  this.type = 'neuron';
  if (partialNeuron !== undefined && partialNeuron !== null) {
    this.trainable = partialNeuron.trainable
    this.isOutput = partialNeuron.isOutput;
    this.rate = partialNeuron.rate;
    this.maxGradient = partialNeuron.maxGradient;
    this.node = partialNeuron.node || {}
    this.connections = {};
    if (partialNeuron.connections) {
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

/*
 * Updates an existing Neuron, changing only primitively valued properties to those in the partial neuron
 * 
 * @param {partialNeuron} object - An object containing some or all parts of a single neuron.
 */
Neuron.prototype.update = function (partialNeuron) {
  //properties of this node
  if (partialNeuron.node) {
    for (var nodeProp in partialNeuron.node) {
      if (nodeProp === 'extendedElegibilities') {
        for (var gatedNode in partialNeuron.node.extendedElegibilities) {
          this.node.extendedElegibilities[gatedNode] = partialNeuron.node.extendedElegibilities[gatedNode]
        }
      } else {
        this.node[nodeProp] = partialNeuron.node[nodeProp];
      }
    }
  }
  if (partialNeuron.gatedNodes) {
    for (var node in partialNeuron.gatedNodes) {
      if (!this.gatedNodes[node]) {
        this.gatedNodes[node] = {};
      }
      for (gatedProp in partialNeuron.gatedNodes[node]) {
        this.gatedNodes[node][gatedProp] = partialNeuron.gatedNodes[node][gatedProp];
      }
    }
  }
  if (partialNeuron.connections) {
    for (var connType in partialNeuron.connections) {
      for (var connection in partialNeuron.connections[connType]) {
        if (!this.connections[connType][connection]) {
          this.connections[connType][connection] = {};
        }
        for (var property in partialNeuron.connections[connType][connection]) {
          if (property !== 'toNode' && property !== 'fromNode' && property !== 'gateNode') {
            this.connections[connType][connection][property] = partialNeuron.connections[connType][connection][property];
          }
        }
      }
    }
  }
}

//synchronous backprop and activation

/*
 * activates the neuron based on it's current state, setting the state, derivative, activation and elegibilities of the neuron's node.
 * Neuron must contain a complete node and have at least one input connection.
 */
Neuron.prototype.activateSync = function () {
  this.initialState();
  this.activationStep();
  this.squashState();
  this.influenceStep();
  this.elegibilityStep();
  for (var i in this.gatedNodes) {
    this.extendedElegibilityStep(i);
  }
}

/*
 * backpropagates error in the neuron's output nodes through the neuron, setting the bias and error of the neuron's node and the weights of all of the neuron's input connections.
 */
Neuron.prototype.backPropagateSync = function () {
  if (this.isOutput && this.node.subNetworkId === -1) {
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

/*
 * Sets the neuron's state before inputs are accounted for.
 */
Neuron.prototype.initialState = function () {
  this.node.prevState = this.node.state;
  this.node.state = this.node.bias + this.node.prevState * (this.node.selfConnection.gateNode ? this.node.selfConnection.gateNode.activation : 1) * this.node.selfConnection.weight;
}

/*
 * Sets the neuron's activation and derivative properties by calling the neuron's squashing function on it's current state.
 * if a squashing function is not specifically set in the neuron's node, it defaults to the sigmoid function.
 */
Neuron.prototype.squashState = function () {
  if (!this.node.squash) {
    this.node.activation = squash['sigmoid'].activation(this.node.state); //this.squashAct(this.node.state);
    this.node.derivative = squash['sigmoid'].derivative(this.node.state); //this.squashDer(this.node.state);
  } else {
    this.node.activation = squash[this.node.squash].activation(this.node.state); //this.squashAct(this.node.state);
    this.node.derivative = squash[this.node.squash].derivative(this.node.state); //this.squashDer(this.node.state);
  }
}


/*
 * Sets the neuron's bias based on the learning rate associated with the neuron and it's current errorResponsibility
 */
Neuron.prototype.adjustBias = function () {
  if (this.node.trainable) {
    this.node.bias += this.rate * this.node.errorResponsibility;
  }
}

/*
 * Sets the neuron's node error responsibility based on it's current gated and projected error
 */
Neuron.prototype.setErrorResponsibility = function () {
  this.node.errorResponsibility = this.node.errorGated + this.node.errorProjected;
}

//iterative steps

/*
 * Sets the state of the neuron's node based on the state of it's inputs.  
 * Requires the following properties to exist on the neuron:
 * node
 *   state
 * connections.inputs
 *   weight
 *   gain (gate node activation)
 *   activation
 */
Neuron.prototype.activationStep = function () {
    for (var i = 0; i < this.connections.inputs.length; ++i) {
      if (this.connections.inputs[i].gateNode) {
        this.node.state += (this.connections.inputs[i].weight * this.connections.inputs[i].gateNode.activation * this.connections.inputs[i].fromNode.activation);
      } else {
        this.node.state += (this.connections.inputs[i].weight * this.connections.inputs[i].fromNode.activation);
      }
    }

  }

/*
 * Sets the influence of each input to this neuron on each node whose input/s are gated by this node.  
 * This is an intermediate step to calculating the extended elegibilities for this node.
 * Requires the following properties to exist on the neuron:
 * node
 *   id
 *   layerId
 *   prevState
 *   activation
 *   selfConnection
 *     gateId
 *     gateLayer
 * connections.gated
 *   weight
 *   toNode
 *     id
 *     prevState
 *     selfConnection
 *       gateId
 *       gateLayer
 *   fromNode
 *     activation
 */
Neuron.prototype.influenceStep = function () {
    this.node.influences = {};
    var fromNode;
    for (var i = 0; i < this.connections.gated.length; ++i) {
      gatedNode = this.connections.gated[i].toNode || this.node; //toNode will be null for selfConnections
      if (this.node.influences[gatedNode.id] === undefined) {
        //if we haven't seen neuron before then initialize it to 0 or prevState if the to node is selfConnected
        this.node.influences[gatedNode.id] = gatedNode.selfConnection.gateId === this.node.id &&
          gatedNode.selfConnection.gateLayer === this.node.layerId ? gatedNode.prevState : 0;
      }
      var fromNode = this.connections.gated[i].fromNode || this.node
      this.node.influences[gatedNode.id] += this.connections.gated[i].weight * fromNode.activation;
    }
  }

/*
 * Sets the elegibilities in the neuron's node for each input connection.
 * Requires the following properties to exist on the neuron:
 * node
 *   elegibilities
 *   selfConnection
 *     weight
 *     gateNode
 *       activation
 * connections.inputs
 *   fromNode
 *     activation
 *   gateNode
 *     activation
 */
Neuron.prototype.elegibilityStep = function () {
  for (var i = 0; i < this.connections.inputs.length; ++i) {
    this.node.elegibilities[i] *= this.node.selfConnection.weight * (this.node.selfConnection.gateNode ? this.node.selfConnection.gateNode.activation : 1);
    this.node.elegibilities[i] += (this.connections.inputs[i].gateNode ? this.connections.inputs[i].gateNode.activation : 1) * this.connections.inputs[i].fromNode.activation;
  }
}

/*
 * Sets the extendedElegibilities in the neuron's node for the given gated node for each input connection
 * Requires the following properties to exist on the neuron:
 * node
 *   extendedElegibilities
 *   derivative
 *   elegibilities
 *   influences
 * gatedNodes
 *   selfConnection
 *     gateNode
 *       activation
 *     weight
 * @param {gateNeuronId} number - The Id of the node in this neuron's gatedNodes object for which the extended elegibilities are being calculated.
 */
Neuron.prototype.extendedElegibilityStep = function (gateNeuronId) { // should have key other than 0 for extendedEls
  for (var i = 0; i < this.node.elegibilities.length; ++i) {
    this.node.extendedElegibilities[gateNeuronId][i] *= this.gatedNodes[gateNeuronId].selfConnection.weight * (this.gatedNodes[gateNeuronId].selfConnection.gateNode ? this.gatedNodes[gateNeuronId].selfConnection.gateNode.activation : 1);
    this.node.extendedElegibilities[gateNeuronId][i] += this.node.derivative * this.node.elegibilities[i] * this.node.influences[gateNeuronId];
  }
}

/*
 * Sets the projected Error for this neuron's node based on the error responsibility in it's output connections
 * Requires the following properties to exist on the neuron:
 * node
 *   derivitive
 * connections.outputs
 *   weight
 *   toNode
 *     errorResponsibility
 *   gateNode
 *     activation
 */
Neuron.prototype.projectedErrorStep = function () {
  this.node.errorProjected = 0;
  for (var i = 0; i < this.connections.outputs.length; ++i) {
    this.node.errorProjected += this.connections.outputs[i].toNode.errorResponsibility * //this is from the to neuron
      (this.connections.outputs[i].gateNode !== null ? this.connections.outputs[i].gateNode.activation : 1) * this.connections.outputs[i].weight
  }
  this.node.errorProjected *= this.node.derivative;
}

/*
 * Sets the gated error for this neuron's node based on the error responsibility of each of it's gated nodes
 * Requires the following properties to exist on the neuron:
 * node
 *   derivative
 *   id
 *   layerId
 * gatedNodes
 *   id
 *   prevState
 *   errorResponsibility
 *   selfConnection
 *     gateId
 *     gateLayerId
 * connections.gated
 *   toNodeId
 *   weight
 *   fromNode
 *     activation
 */
Neuron.prototype.gatedErrorStep = function () {
  this.node.errorGated = 0;
  this.node.influences = {}
  for (var j = 0; j < this.connections.gated.length; ++j) {
    var gatedNode = this.gatedNodes[this.connections.gated[j].toNodeId]
    if (this.node.influences[gatedNode.id] === undefined) {
      this.node.influences[gatedNode.id] = gatedNode.selfConnection.gateId === this.node.id &&
        gatedNode.selfConnection.gateLayerId === this.node.layerId ? gatedNode.prevState : 0;
    }

    this.node.influences[gatedNode.id] += this.connections.gated[j].weight * (this.connections.gated[j].fromNode ? this.connections.gated[j].fromNode.activation : this.node.activation);
  }
  for (var k in this.gatedNodes) {
    this.node.errorGated += this.node.influences[this.gatedNodes[k].id] * this.gatedNodes[k].errorResponsibility;
  }
  this.node.errorGated *= this.node.derivative;
}

/*
 * Sets the weights in all of this neuron's inputs based on its node's error responsibility, elegibilities and extended elegibilities
 * Gradient clipping is done per input instead of based on the norm as a stop-gap measure.  This will likely change at a later date.
 * Requires the following properties to exist on the neuron:
 * rate
 * maxGradient
 * node
 *   errorProjected
 *   elegibilities
 *   extendedElegibilities
 * connections.inputs
 *   trainable
 *   weight
 * gatedNodes
 *   errorResponsibility
 */
Neuron.prototype.learningStep = function () {
  var gradient;
  for (var i = 0; i < this.connections.inputs.length; ++i) {
    if (this.connections.inputs[i].trainable) {
      gradient = this.node.errorProjected * this.node.elegibilities[i]
      for (var j in this.gatedNodes) {
        gradient += this.gatedNodes[j].errorResponsibility * this.node.extendedElegibilities[j][i]
      }
      this.connections.inputs[i].weight += this.rate * (gradient >= 0 ? Math.min(gradient, this.maxGradient) : Math.max(gradient, -this.maxGradient));
    }
  }
}

var squash = {
  'sigmoid': {
    'activation': function (x) {
      return 1 / (1 + Math.exp(-x))
    },
    'derivative': function (x) {
      return Math.exp(x) / Math.pow(1 + Math.exp(x), 2)
    }
  },
  'hyperbolicTangent': {
    'activation': function (x) {
      return (Math.exp(2 * x) - 1) / (Math.exp(2 * x) + 1)
    },
    'derivative': function (x) {
      return 4 * Math.exp(2 * x) / ((Math.exp(2 * x) + 1) ^ 2)
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

if (module) {
  module.exports.Neuron = Neuron;
}
