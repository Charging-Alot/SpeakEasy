var Network = function () {
  this.type = 'network';
  this.layers = [];
  this.nodes = [];
  this.connections = {};
}

Network.prototype.update = function (layerId, neuronId, partialNeuron) {
  this.layers[layerId][neuronId].update(partialNeuron);
}

Network.prototype.initNeurons = function () {
  for(var layer = 0; layer < this.nodes.length; ++layer) {
    this.layers.push([]);
    for(var node = 0; node < this.nodes[layer].nodes.length; ++node) {
      this.layers[layer].push(new Neuron({node: this.nodes[layer].nodes[node]}));
      this.layers[layer][node].isOutput = (layer === this.nodes.length - 1)
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
  for(var toLayerId in this.connections) {
    for(var fromLayerId in this.connections[toLayerId]) {
      for(var i = 0; i < this.connections[toLayerId][fromLayerId].length; ++i) {
        connection = this.connections[toLayerId][fromLayerId][i];
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
  if(!this.connections[toLayerId]) {
    this.connections[toLayerId] = {}
  }
  if(!this.connections[toLayerId][fromLayerId]) {
    this.connections[toLayerId][fromLayerId] = [];
  }  
  var connId = this.connections[toLayerId][fromLayerId].length
  var connection = this.Connection(toLayerId, fromLayerId, toNode.id, fromNode.id, connId)
  if(fromNode.layerId === toNode.layerId && fromNode.id === toNode.id) {
    connection.weight = 1;
    toNode.selfConnection = connection;
  }
  this.connections[toLayerId][fromLayerId].push(connection);
}

Network.prototype.gateLayerOneToOne = function (gatingLayer, fromLayerId, toLayerId) {
  //gates all inputs to toLayer from fromLayer, provided there are the same number of outputs in the gatingLayer 
  //as there are connections.
  //otherwise, fuck you.
  var connectionArr = this.connections[toLayerId][fromLayerId];
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
