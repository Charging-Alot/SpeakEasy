if(module) {
  var Neuron = require('./NeuronConstructor.js').Neuron
}

var Network = function (network, rate, maxGradient) {
  this.type = 'network';
  this.initialized = false;
  this.rate = rate;
  this.maxGradient = rate;
  if(!network) {
    this.layers = [];
    this.nodes = [];
    this.connections = {};
    this.connections.internal = {};
    this.connections.inputs = [];
    this.connections.outputs = [];
    this.connections.gated = [];
    this.gatedNodes = {};
  } else {
    this.id = network.id;
    this.layerId = network.layerId;
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

Network.prototype.update = function (model) {
  // if(this.nodes[1] && this.nodes[1].nodes[0] && this.nodes[1].nodes[0].type === 'network') {
  //   debugger
  // }
  this.rate = model.rate
  this.maxGradient = model.maxGradient
  if(model.type !== 'network') {
    if(model.node.subNetworkId !== -1) {
      this.layers[model.node.subNetworkLayerId][model.node.subNetworkId].update(model)
    } else {
      this.layers[model.node.layerId][model.node.id].update(model);
    }
    // if(model.node.subNetworkId === -1 || (model.node.subNetworkId !== this.id && model.node.subNetworkLayerId !== this.layerId)) {
    //   this.layers[model.node.layerId][model.node.id].update(model);
    // } else {
    //   // this.layers[model.node.subNetworkLayerId][model.node.subNetworkId].layers[model.node.layerId][model.node.id].update(model)
    //   this.layers[model.node.layerId][model.node.id].update(model)
    // }
  } else {
    for(var i = 0; i < model.layers.length; ++i) {
      for(var j = 0; j < model.layers[i].length; ++j) {
        this.update(model.layers[i][j])
      }
    }
  }
}

Network.prototype.initNeurons = function () {
  var selfConnGateNode;
  for(var layer = 0; layer < this.nodes.length; ++layer) {
    this.layers.push([]);
    for(var node = 0; node < this.nodes[layer].nodes.length; ++node) {
      if(this.nodes[layer].nodes[node].type === 'neuron') {
        this.layers[layer].push(new Neuron({node: this.nodes[layer].nodes[node]}));
        this.layers[layer][node].isOutput = (layer === this.nodes.length - 1)
      } else {
        if(!this.nodes[layer].nodes[node].initialized) {
          this.nodes[layer].nodes[node].initNeurons();
        }
        this.layers[layer].push(this.nodes[layer].nodes[node])
      }
    }
  }

  this.placeConnectionsInNeurons();

  var neuron;
  var network;
  for(layer = 0; layer < this.nodes.length; ++layer) {
    for(node = 0; node < this.nodes[layer].nodes.length; ++node) {
      if(this.layers[layer][node].type === 'network') {
        network = this.layers[layer][node];
        for(var input = 0; input < network.layers[0].length; ++input) {
          neuron = network.layers[0][input]
          network.initializeElegibilitiesForNeuron(neuron);
        }
      } else {
        neuron = this.layers[layer][node];
        this.initializeElegibilitiesForNeuron(neuron);
      }
    }
  }

  this.initialized = true;
}

Network.prototype.initializeElegibilitiesForNeuron = function (neuron) {
  var layer = neuron.node.layerId;
  var node = neuron.node.id
  this.layers[layer][node].node.elegibilities = [];
  this.layers[layer][node].node.extendedElegibilities = {};
  for(var input = 0; input < neuron.connections.inputs.length; ++input) {
    neuron.node.elegibilities.push(0);
    for(var gated in neuron.gatedNodes) {
      if(!neuron.node.extendedElegibilities[gated]) {
        neuron.node.extendedElegibilities[gated] = [];
      }
      neuron.node.extendedElegibilities[gated].push(0);
    }
  }
}

Network.prototype.placeConnectionsInNeurons = function () {
  var connection;
  var fromNode;
  var toNode;
  var fromNeuron;
  var toNeuron;
  var fromNetwork;
  var toNetwork;
  var gateNode;

  //check for gated selfConnections
  for(var layer = 0; layer < this.layers.length; ++layer) {
    for(var node = 0; node < this.layers[layer].length; ++node) {
      var selfConnedNode = this.layers[layer][node]
      if(selfConnedNode.type !== 'network') {
        var gateNode = selfConnedNode.node.selfConnection.gateNode
        if(gateNode !== null) {
          var gateNeuron = this.layers[gateNode.layerId][gateNode.id]
          gateNeuron.connections.gated.push(selfConnedNode.node.selfConnection);
          gateNeuron.gatedNodes[selfConnedNode.node.id] = selfConnedNode.node;
        }
      }
    }
  }

  //other connections
  for(var toLayerId in this.connections.internal) {
    for(var fromLayerId in this.connections.internal[toLayerId]) {
      for(var i = 0; i < this.connections.internal[toLayerId][fromLayerId].length; ++i) {
        connection = this.connections.internal[toLayerId][fromLayerId][i];

        if(connection.fromSubNetworkId === -1) {
          fromNeuron = this.layers[fromLayerId][connection.fromNodeId];
          fromNode = this.nodes[fromLayerId].nodes[connection.fromNodeId];
        } else {
          fromNetwork = this.layers[connection.fromSubNetworkLayerId][connection.fromSubNetworkId];
          fromNeuron = fromNetwork.layers[connection.fromLayerId][connection.fromNodeId];
          fromNode = fromNetwork.nodes[connection.fromLayerId][connection.fromNodeId]
        }

        if(connection.toSubNetworkId === -1) {
          toNeuron = this.layers[toLayerId][connection.toNodeId];
          toNode = this.nodes[toLayerId].nodes[connection.toNodeId];
        } else {
          toNetwork = this.layers[connection.toSubNetworkLayerId][connection.toSubNetworkId];
          toNeuron = toNetwork.layers[connection.toLayerId][connection.toNodeId];
          toNode = toNetwork.nodes[connection.toLayerId].nodes[connection.toNodeId]
        }

        fromNeuron.connections.outputs.push(connection);
        toNeuron.connections.inputs.push(connection);

        if(connection.gateNodeId !== -1) {
          if(connection.gateSubNetworkId === -1) {
            gateNeuron = this.layers[connection.gateLayerId][connection.gateNodeId];
          } else {
            gateNeuron = this.layers[connection.gateSubNetworkLayerId][connection.gateSubNetworkId].layers[connection.gateLayerId][connection.gateNodeId]
          }
          gateNeuron.connections.gated.push(connection);
          if(!gateNeuron.gatedNodes[toNode.id]) {
            gateNeuron.gatedNodes[toNode.id] = toNode;
          }
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
  this.nodes.push(this.createAllNetworksInLayer(networkConstructor, this.nodes.length, numberOfNodes))
}

Network.prototype.createAllNetworksInLayer = function (networkConstructor, layerId, numberOfNodes) {
  var networkLayer = {id: layerId, nodes: []}
  for(var i = 0; i < numberOfNodes; ++i) {
    networkLayer.nodes.push(new networkConstructor(null, this.rate, this.maxGradient))
    networkLayer.nodes[i].setId(layerId, i);
  }
  return networkLayer;
}

Network.prototype.setId = function (layerId, id) {
  this.layerId = layerId;
  this.id = id;
  for(var i = 0; i < this.nodes.length; ++i) {
    for(var j = 0; j < this.nodes[i].nodes.length; ++j) {
      this.nodes[i].nodes[j].subNetworkId = id;
      this.nodes[i].nodes[j].subNetworkLayerId = layerId;
    }
  }
}

Node = function (layerId, id) {
  return {
    type: 'neuron',
    subNetworkId: -1,
    subNetworkLayerId: -1,
    trainable: true,
    squash: 'sigmoid',
    id: id,
    layerId: layerId,
    state: 0,
    prevState: 0,
    activation: 0,
    derivative: 0,
    selfConnection: {weight: 0, gain: 1, gateNodeId: -1, gateLayerId: -1, gateNode: null},
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
        this.joinNodes(fromLayer.nodes[i], toLayer.nodes[j], true);
      }
    }
  } else if(toLayer.nodes.length === fromLayer.nodes.length) {
    for(var k = 0; k < fromLayer.nodes.length; ++k) {
      this.joinNodes(fromLayer.nodes[k], toLayer.nodes[k], true);
    }
  } else {
    console.error('layers cannot be joined that way!')
  }
}

Network.prototype.joinNodes = function (fromNode, toNode, allToAll) {
  if(toNode.subNetworkLayerId === -1) {
    var toLayerId = toNode.layerId;
  } else {
    toLayerId = toNode.subNetworkLayerId
  }
  if(fromNode.subNetworkLayerId === -1) {
    var fromLayerId = fromNode.layerId;
  } else {
    fromLayerId = fromNode.subNetworkLayerId
  }

  if(!this.connections.internal[toLayerId]) {
    this.connections.internal[toLayerId] = {}
  }
  if(!this.connections.internal[toLayerId][fromLayerId]) {
    this.connections.internal[toLayerId][fromLayerId] = [];
  }

  if(fromNode.type === 'network' && toNode.type === 'network') {
    this.joinLayers(fromNode.nodes[fromNode.nodes.length - 1], toNode.nodes[0], allToAll)
  } else if(fromNode.type === 'network') {
    for(var i = 0; i < fromNode.nodes[fromNode.nodes.length - 1].nodes.length; ++i) {
      this.joinNodes(fromNode.nodes[fromNode.nodes.length - 1].nodes[i], toNode, allToAll);
    }
  } else if(toNode.type === 'network') {
    for(var j = 0; j < toNode.nodes[0].nodes.length; ++j) {
      this.joinNodes(fromNode, toNode.nodes[0].nodes[j], allToAll);
    }
  } else {
    if(fromNode.layerId === toNode.layerId && fromNode.id === toNode.id && fromNode.subNetworkId === toNode.subNetworkId && fromNode.subNetworkLayerId === toNode.subNetworkLayerId) {
      var connection = Connection(null, toNode, fromNode)
      connection.weight = 1;
      connection.trainable = false;
      toNode.selfConnection = connection;
    } else {
      connId = this.connections.internal[toLayerId][fromLayerId].length
      connection = Connection(connId, toNode, fromNode)
      this.connections.internal[toLayerId][fromLayerId].push(connection);
    }
  }
}

Network.prototype.gateLayerOneToOne = function (gatingLayer, fromLayerId, toLayerId) {
  //gates all inputs to toLayer from fromLayer, provided there are the same number of outputs in the gatingLayer 
  //as there are connections.
  if(fromLayerId !== toLayerId) {
    var connectionArr = this.connections.internal[toLayerId][fromLayerId];
    if(connectionArr.length === gatingLayer.nodes.length) {
      for(var k = 0; k < gatingLayer.nodes.length; ++k) {
        this.gateConnection(connectionArr[k], gatingLayer.nodes[k]);
      }
    } else {
      console.error('layers cannot be gated that way!')
    }
  } else {
    if(gatingLayer.nodes.length === this.nodes[fromLayerId].nodes.length) {
      for(var k = 0; k < gatingLayer.nodes.length; ++k) {
        this.gateConnection(this.nodes[fromLayerId].nodes[k].selfConnection, gatingLayer.nodes[k]);
      }
    } else {
      console.error('layers cannot be gated that way!')
    }
  }
}

Network.prototype.gateConnection = function (connection, gateNode) {
  if(gateNode.type === 'network') {
    connection.gateSubNetworkId = gateNode.subNetworkId;
    connection.gateSubNetworkLayerId = gateNode.subNetworkLayerId;
  }
  connection.gateNodeId = gateNode.id;
  connection.gateLayerId = gateNode.layerId;
  connection.gateNode = gateNode;
}

var Connection = function (connId, toNode, fromNode) {
  return {
    trainable: true,
    id: connId,
    toNode: toNode,
    toNodeId: toNode.id,
    toLayerId: toNode.layerId,
    toSubNetworkId: toNode.subNetworkId,
    toSubNetworkLayerId: toNode.subNetworkLayerId,
    fromNode: fromNode,
    fromNodeId: fromNode.id,
    fromLayerId: fromNode.layerId,
    fromSubNetworkId: fromNode.subNetworkId,
    fromSubNetworkLayerId: fromNode.subNetworkLayerId,
    gateNode: null,
    gateNodeId: -1,
    gateLayerId: -1,
    gateSubNetworkLayerId: -1,
    gateSubNetworkId: -1,
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

Network.prototype.setLastLayerError = function (targetArr) {
  var error;
  var lastIndex = this.layers.length - 1
  for(var i = 0; i < this.layers[lastIndex].length; ++i) {
    error = targetArr[i] - this.layers[lastIndex][i].node.activation
    this.layers[lastIndex][i].node.errorProjected = error;
    this.layers[lastIndex][i].node.errorResponsibility = error;
    this.layers[lastIndex][i].node.errorGated = 0
  }
}

if(module) {
  exports.Network = Network
}

