var Network = function (network, rate, maxGradient) {
  this.type = 'network';
  if(!network) {
    this.layers = [];
    this.nodes = [];
    this.connections = {};
    this.connections.internal = {};
    this.connections.inputs = [];
    this.connections.outputs = [];
    this.connections.gated = [];
    this.gatedNodes = {};
  else (network) {
    this.layers = [];
    this.nodes = network.nodes || [];
    this.connections = {};
    this.connections.internal = network.connections.internal || {};
    this.connections.inputs = network.connections.inputs || [];
    this.connections.outputs = network.connections.outputs || [];
    this.connections.gated = network.connections.gated || [];
    this.gatedNodes = network.gatedNodes || {};
    this.initNeurons();
  }
}

Network.prototype.update = function (layerId, neuronId, model) {
  if(model.type === 'neuron') {
    this.layers[layerId][neuronId].update(model);
  } else {
    for(var i = 0; i < model.layers.length; ++i) {
      for(var j = 0; j < model.layers[i].length; ++j) {
        this.layers[layerId][neuronId].update(model.layers[i][j])
      }
    }
  }
}

Network.prototype.initNeurons = function () {
  for(var layer = 0; layer < this.nodes.length; ++layer) {
    this.layers.push([]);
    for(var node = 0; node < this.nodes[layer].nodes.length; ++node) {
      if(this.nodes[layer].nodes[node].type === 'neuron') {
        this.layers[layer].push(new Neuron({node: this.nodes[layer].nodes[node]}));
        this.layers[layer][node].isOutput = (layer === this.nodes.length - 1)
      } else {
        this.layers[layer].push(node: this.nodes[layer])
      }
    }
  }
  this.placeConnectionsInNeurons();
  
  for(layer = 0; layer < this.nodes.length; ++layer) {
    for(node = 0; node < this.nodes[layer].nodes.length; ++node) {
      this.layers[layer][node].node.elegibilities = [];
      this.layers[layer][node].node.extendedElegibilities = {};
      for(var input = 0; input < this.layers[layer][node].connections.inputs.length; ++input) {
        this.layers[layer][node].node.elegibilities.push(0);
        for(var gated in this.layers[layer][node].gatedNodes) {
          if(!this.layers[layer][node].node.extendedElegibilities[gated]) {
            this.layers[layer][node].node.extendedElegibilities[gated] = [];
          }
          this.layers[layer][node].node.extendedElegibilities[gated].push(0);
        }
      }
    }
  }

  this.initialized = true;
}

Network.prototype.placeConnectionsInNeurons = function () {
  var connection;
  var fromNode;
  var toNode;
  var fromNeuron;
  var toNeuron;
  var gateNode;
  for(var toLayerId in this.connections.internal) {
    for(var fromLayerId in this.connections.internal[toLayerId]) {
      for(var i = 0; i < this.connections.internal[toLayerId][fromLayerId].length; ++i) {
        connection = this.connections.internal[toLayerId][fromLayerId][i];
        fromNeuron = this.layers[fromLayerId][connection.fromNodeId];
        toNeuron = this.layers[toLayerId][connection.toNodeId];
        fromNode = this.nodes[fromLayerId].nodes[connection.fromNodeId];
        toNode = this.nodes[toLayerId].nodes[connection.toNodeId];
        fromNeuron.connections.outputs.push(connection);
        toNeuron.connections.inputs.push(connection);
        if(connection.gateNodeId !== -1) {
          gateNode = this.layers[connection.gateLayerId][connection.gateNodeId];
          gateNode.connections.gated.push(connection);
          if(!gateNode.gatedNodes[toNode.id]) {
            gateNode.gatedNodes[toNode.id] = toNode;
          }
        }
      }
    }
  }

Network.prototype.appendNodeLayer = function (numberOfNodes) {
  this.nodes.push(this.createAllNodesInLayer(this.nodes.length, numberOfNodes))
}

Network.prototype.createAllNodesInLayer = function (layerId, numberOfNodes) {
  var nodeLayer = {id: layerId, nodes: []};
  for(var i = 0; i < numberOfNodes; ++i) {
    nodeLayer.nodes.push(Node(layerId, i));
  }
  return nodeLayer;
}

Network.prototype.appendNetworkLayer = function (networkConstructor, numberOfNodes) {
  this.nodes.push(this.createAllNetworksInLayers(networkConstructor, this.nodes.length, numberOfNodes))
}

Network.prototype.createAllNetworksInLayer = function (networkConstructor, layerId, numberOfNodes) {
  var networkLayer = {id: layerId, nodes: []}
  for(var i = 0; i < numberOfNodes; ++i) {
    networkLayer.push(new networkConstructor())
    networkLayer[i].id = i;
    networkLayer.layerId = layerId
  }
  return networkLayer;
}



Node = function (layerId, id) {
  return {
    trainable: true,
    squash: 'sigmoid'
    id: id,
    layerId: layerId,
    state: 0,
    prevState: 0,
    activation: 0,
    derivative: 0,
    selfConnection: {weight: 0, gain: 1, gateId: -1, gateLayer: -1},
    elegibilities: [],
    extendedElegibilities: {},
    errorResponsibility: 0,
    errorProjected: 0,
    errorGated: 0,
    bias: Math.random() * 0.2 - 0.1
  }
}

Network.prototype.joinLayers = function (fromLayer, toLayer, allToAll) {
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
    console.error('layers cannot be joined that way!')
  }
}

Network.prototype.joinNodes = function (fromNode, toNode) {
  var fromLayerId = fromNode.layerId;
  var toLayerId = toNode.layerId;
  if(!this.connections.internal[toLayerId]) {
    this.connections.internal[toLayerId] = {}
  }
  if(!this.connections.internal[toLayerId][fromLayerId]) {
    this.connections.internal[toLayerId][fromLayerId] = [];
  }  
  if(fromNode.layerId === toNode.layerId && fromNode.id === toNode.id) {
    var connection = this.Connection(toLayerId, fromLayerId, toNode.id, fromNode.id, connId)
    connection.weight = 1;
    toNode.selfConnection = connection;
  } else {
    var connId = this.connections.internal[toLayerId][fromLayerId].length
    connection = this.Connection(toLayerId, fromLayerId, toNode.id, fromNode.id, connId)
    this.connections.internal[toLayerId][fromLayerId].push(connection);
  }
}

Network.prototype.gateLayerOneToOne = function (gatingLayer, fromLayerId, toLayerId) {
  //gates all inputs to toLayer from fromLayer, provided there are the same number of outputs in the gatingLayer 
  //as there are connections.
  var connectionArr = this.connections.internal[toLayerId][fromLayerId];
  if(connectionArr.length === gatingLayer.nodes.length) {
    for(var k = 0; k < gatingLayer.nodes.length; ++k) {
      this.gateConnection(connectionArr[k], gatingLayer.nodes[k].id, gatingLayer.nodes[k].layerId);
    }
  } else {
    console.alert('layers cannot be gated that way!')
  }
}

Network.prototype.gateConnection = function (connection, gateNodeId, gateLayerId) {
  connection.gateNodeId = gateNodeId;
  connection.gateLayerId = gateLayerId;
  connection.gateNode = this.nodes[gateLayerId].nodes[gateNodeId];
}

Network.prototype.Connection = function (toLayerId, fromLayerId, toNodeId, fromNodeId, connId) {
  return {
    trainable: true,
    id: connId,
    toNode: this.nodes[toLayerId].nodes[toNodeId],
    toNodeId: toNodeId,
    toLayerId: toLayerId,
    fromNode: this.nodes[fromLayerId].nodes[fromNodeId],
    fromNodeId: fromNodeId,
    fromLayerId: fromLayerId,
    gateNode: null,
    gateNodeId: -1,
    gateLayerId: -1,
    // activation: 0,
    // gain: 1,
    weight: Math.random() * .2 - .1 // -1 /sqrt(n) and 1/sqrt(n)
  }
}

Network.prototype.activateFirstLayer = function (inputArr) {
  for(var i = 0; i < this.layers[0].length; ++i) {
    this.layers[0][i].node.activation = inputArr[i];
    this.layers[0][i].node.bias = 0;
    this.layers[0][i].node.derivative = 0;
  }
}

Network.prototype.SetLastLayerError = function (targetArr) {
  var error;
  var lastIndex = this.layers.length - 1
  for(var i = 0; i < this.layers[lastIndex].length; ++i) {
    error = targetArr[i] - this.layers[lastIndex][i].node.activation
    this.layers[lastIndex][i].node.errorProjected = error;
    this.layers[lastIndex][i].node.errorResponsibility = error;
    this.layers[lastIndex][i].node.errorGated = 0
  }
}
