var Mother = function (sendFunction) {
  //make all nodes
  //make all connections and gates
  //initialize neurons
  this.connections = {}; // will become an object of objects of arrays.  cause simple would be boring.
  this.nodes = [];
  this.layers = [];
  this.toManager = new IoHandler(2, 1, this, sendFunction);
  this.initialized = false;
}

Mother.prototype.update = function (command, section, partialNeuron) {
  this.layers[partialNeuron.node.layerId][partialNeuron.node.id].update(command, section, partialNeuron);
}

Mother.prototype.activate = function (inputArr, callback) {
  if(this.initialized) {
    this.activationUpdatesForLayer(0, inputArr);
    var layerCounter = 1;
    var activationCallback = function () {
      layerCounter++
      if(layerCounter < this.layers.length) {
        console.log(layerCounter)
        this.activateLayer(layerCounter, activationCallback);
      } else {
        callback();
      }
    }.bind(this)
    this.activateLayer(layerCounter, activationCallback); //activates first non input layer
  } else {
    console.log('You must call initNeurons before activation!');
  }
}

Mother.prototype.activateLayer = function (layerId, callback) {
  // console.log('activating layer', layerId)
  for(var i = 0; i < this.layers[layerId].length; ++i) {
    this.queueCommandManager('activate', i, this.layers[layerId][i])
  }
  this.toManager.runAllOutputs(callback);
}

Mother.prototype.queueCommandManager = function (command, section, neuron, callback) {
  if(command === 'activate' ) {
    var partialNeuron = neuron
    // new Neuron({
    //   node: neuron.node,
    //   gatedNode: neuron.gatedNodes,
    //   connections: {
    //     outputs: neuron.connections.outputs,
    //     inputs: neuron.connections.inputs,
    //     gated: neuron.connections.gated,
    //   }
    // });
  } else if(command === 'backPropagate') {
    var partialNeuron = neuron
  }
  this.toManager.addToOut(command, section, partialNeuron, callback)
}

Mother.prototype.activationUpdatesForLayer = function (layerId, inputArr) {
  for(var i = 0; i < this.layers[layerId].length; ++i) {
    this.activationUpdate(this.layers[layerId][i], inputArr[i]);
  }
}

//node manager does this.
Mother.prototype.activationUpdate = function (neuron, activation) {
  neuron.node.activation = activation;
  var activation = neuron.node.activation;
  var outputs = neuron.connections.outputs;
  var gated = neuron.connections.gated;
  for(var i = 0; i < outputs.length; ++i) {
    outputs[i].activation = activation;
  }
  for(var j = 0; j < gated.length; ++j) {
    gated[j].gain = activation;
  }
}

Mother.prototype.backPropagate = function (targetArr, callback) {
  if(this.initialized) {
    this.errorUpdatesForLayer(this.layers.length-1, targetArr);
    var layerCounter = this.layers.length - 2;
    var backPropagationCallback = function () {
      layerCounter--
      if(layerCounter >= 0) {
        console.log(layerCounter)
        this.backPropagateLayer(layerCounter, backPropagationCallback);
      } else {
        callback();
      }
    }.bind(this)
    this.backPropagateLayer(layerCounter, backPropagationCallback); //activates first non input layer
  } else {
    console.log("You must call initNeurons before backPropagate! (don't forget to activate first as well)");
  } 
}

Mother.prototype.backPropagateLayer = function (layerId, callback) {
  for(var i = 0; i < this.layers[layerId].length; ++i) {
    this.queueCommandManager('backPropagate', i, this.layers[layerId][i])
  }
  this.toManager.runAllOutputs(callback);
}

Mother.prototype.errorUpdatesForLayer = function(layerId, targetArr) {
  for(var i = 0; i < this.layers[layerId].length; ++i) {
    this.errorUpdate(this.layers[layerId][i], targetArr[i]);
  }
}

Mother.prototype.errorUpdate = function (neuron, target) {
  var error = target - neuron.node.activation
  neuron.node.errorProjected = error;
  neuron.node.errorResponsibility = error;
  var inputs = neuron.connections.inputs
  for(var i = 0; i < inputs.length; ++i) {
    inputs[i].errorResponsibility = error
  }
}

Mother.prototype.initNeurons = function () {
  for(var layer = 0; layer < this.nodes.length; ++layer) {
    this.layers.push([]);
    for(var node = 0; node < this.nodes[layer].nodes.length; ++node) {
      this.layers[layer].push(new Neuron({node: this.nodes[layer].nodes[node]}));
    }
  }
  this.placeConnectionsInNeurons();
  
  for(layer = 0; layer < this.nodes.length; ++layer) {
    for(node = 0; node < this.nodes[layer].length; ++node) {
      this.layers[layer][node].elegibility = [];
      this.layers[layer][node].extendedEligibility = {};
      for(var input = 0; input < this.layers[layer][node].connections.inputs.length; ++input) {
        this.layers[layer][node].elegibility.push(0);
        for(var gated in this.layers[layer][node].connections.gated)
          if(!this.layers[layer][node].extendedEligibility[gated]) {
            this.layers[layer][node].extendedEligibility[gated] = [];
          }
          this.layers[layer][node].extendedEligibility[gated].push(0);
      }
    }
  }
  this.initialized = true
}

Mother.prototype.placeConnectionsInNeurons = function () {
  var connection;
  var fromNode;
  var toNode;
  var gateNode;
  for(var toLayerId in this.connections) {
    for(var fromLayerId in this.connections[toLayerId]) {
      for(var i = 0; i < this.connections[toLayerId][fromLayerId].length; ++i) {
        connection = this.connections[toLayerId][fromLayerId][i];
        fromNode = this.layers[fromLayerId][connection.fromNodeId]
        toNode = this.layers[toLayerId][connection.toNodeId]
        fromNode.connections.outputs.push(connection);
        toNode.connections.inputs.push(connection);
        // console.log(connection)
        if(connection.gateId !== -1) {
          gateNode = this.layers[connection.gateLayerId][connection.gateId]
          gateNode.connections.gated.push(connection)
          if(!gateNode.gatedNodes[toNode.id]) {
            gateNode.gatedNodes[toNode.id] = toNode;
          }
        }
      }
    }
  }
}

Mother.prototype.createLSTMNetworkNodes = function (vocabularySize, hiddenSize, numberOfLSTMLayers) {
  // needs gates and the right count of neurons in an lstm
  var numberOfLayersInLSTM = 3;
  this.nodes.push(this.createAllNodesInLayer(0, vocabularySize));
  for(var i = 0; i < numberOfLSTMLayers; ++i) {
    for(var j = 0; j < numberOfLayersInLSTM; ++j) {
      this.nodes.push(this.createAllNodesInLayer(this.nodes.length, hiddenSize));
      this.joinLayers(this.nodes[this.nodes.length - 2], this.nodes[this.nodes.length -1], j === 0);
    }
  }
  this.layers.push(createAllNodesInLayer(this.layers.length, vocabularySize));
  this.joinLayers(this.nodes[this.nodes.length - 2], this.nodes[this.nodes.length -1], true);
}

Mother.prototype.appendNodeLayer = function (numberOfNodes) {
  this.nodes.push(this.createAllNodesInLayer(this.nodes.length, numberOfNodes))
}

Mother.prototype.createAllNodesInLayer = function (layerId, numberOfNodes) {
  var nodeLayer = {id: layerId, nodes: []};
  for(var i = 0; i < numberOfNodes; ++i) {
    nodeLayer.nodes.push(Node(layerId, i));
  }
  return nodeLayer;
}

var Node = function (layerId, id) {
  return {
    id: id,
    layerId: layerId,
    state: 0.0,
    prevState: 0.0,
    activation: 0.0,
    selfConnection: {weight: 0, gain: 1, gateId: -1, gateLayer: -1},
    elegibility: [],
    extendedEligibility: {},
    bias: Math.random() * 0.2 - 0.1
  }
}

Mother.prototype.joinLayers = function (fromLayer, toLayer, allToAll) {
  if(allToAll) {
    for(var i = 0; i < fromLayer.nodes.length; ++i) {
      for(var j = 0; j < toLayer.nodes.length; ++j) {
        this.joinNodes(fromLayer.nodes[i], toLayer.nodes[j]);
      }
    }
  } else if(toLayer.nodes.length === fromLayer.nodes.length) {
    for(var k = 0; k < fromLayer.nodes.length; ++k) {
      this.joinNodes(fromLayer.nodes[k], toLayer.nodes[k]);
    }
  } else {
    console.log('layers cannot be joined that way!')
  }
}

Mother.prototype.joinNodes = function (fromNode, toNode) {
  var fromLayerId = fromNode.layerId;
  var toLayerId = toNode.layerId;
  if(!this.connections[toLayerId]) {
    this.connections[toLayerId] = {}
  }
  if(!this.connections[toLayerId][fromLayerId]) {
    this.connections[toLayerId][fromLayerId] = [];
  }  
  var connId = this.connections[toLayerId][fromLayerId].length
  var connection = Connection(toLayerId, fromLayerId, toNode.id, fromNode.id, connId)
  if(fromNode.layerId === toNode.layerId && fromNode.id === toNode.id) {
    connection.weight = 1;
    connection.gain = 1;
    toNode.selfConnection = connection;
  }
  this.connections[toLayerId][fromLayerId].push(connection);
}

Mother.prototype.gateLayerOneToOne = function (gatingLayer, fromLayerId, toLayerId) {
  //gates all inputs to toLayer from fromLayer, provided there are the same number of outputs in the gatingLayer 
  //as there are connections.
  //otherwise, fuck you.
  var connectionArr = this.connections[toLayerId][fromLayerId];
  if(connectionArr.length === gatingLayer.nodes.length) {
    for(var k = 0; k < gatingLayer.nodes.length; ++k) {
      this.gateConnection(connectionArr[k], gatingLayer.nodes[k]);
    }
  } else {
    console.log('layers cannot be gated that way!')
  }
}

Mother.prototype.gateConnection = function (connection, gateNode) {
  connection.gateId = gateNode.id;
  connection.gateLayerId = gateNode.layerId;
}

var Connection = function (toLayerId, fromLayerId, toNodeId, fromNodeId, connId) {
  return {
    id: connId,
    toNodeId: toNodeId,
    toLayerId: toLayerId,
    fromNodeId: fromNodeId,
    fromLayerId: fromLayerId,
    gateId: -1,
    gateLayerId: -1,
    activation: 0,
    gain: 0,
    weight: Math.random() * .2 - .1
  }
}
