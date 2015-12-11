var Mother = function (vocabularySize, hiddenSize, numberOfLSTMLayers) {
  this.connections = {}; // will become an object of objects of arrays.  cause simple would be boring.
  this.nodes = [];
  this.layers = [];
  this.createLSTMNetwork(vocabularySize, hiddenSize, numberOfLSTMLayers);
  Mother.initNeurons();
  this.toManager = new IoHandler(0, 1, this.update.bind(this), this.send);
  //ALL LSTMS LOOK LIKE
  //INPUT LAYER
  //LSTM INARDS
  //OUTPUT LAYER
}

Mother.prototype.initNeurons = function () {
  for(layer = 0; layer < this.nodes.length; ++layer) {
    this.layers.push([]);
    for(node = 0; node < this.nodes[layer].length; ++node) {
      this.layers[layer].push(new Neuron({node: this.nodes[layer].nodes[node]}, true));
    }
  }
  this.placeConnectionsInNeurons();
}

Mother.prototype.placeConnectionsInNeurons = function () {
  var connection;
  var fromNode;
  var toNode;
  var gateNode;
  for(toLayerId in this.connections) {
    for(fromLayer in this.connections[toLayer]) {
      for(var i = 0; i < this.connections[toLayer][fromLayer]; ++i) {
        connection = this.connections[toLayer][fromLayer][i];
        fromNeuron = this.layers[fromLayer][connection.fromNodeId]
        toNeuron = this.layers[toLayer][connection.toNodeId]
        fromNeuron.connections.outputs.push(connection);
        toNeuron.connections.inputs.push(connection);
        if(connection.gateNodeId) {
          gateNeuron = this.layers[connection.gateLayer][connection.gateNodeId]
          gateNeuron.connections.gated.push(connection)
          if(!gateNeuron.gatedNodes[toNode.id]) {
            gateNeuron.gatedNodes[toNode.id] = toNode;
          }
        }
      }
    }
  }
}

Mother.prototype.createLSTMNetworkNodes = function (vocabularySize, hiddenSize, numberOfLSTMLayers) {
  var numberOfLayersInLSTM = 3;
  this.nodes.push(this.createAllNodesInLayer(0, vocabularySize));
  for(var i = 0; i < numberOfLSTMLayers; ++i) {
    for(var j = 0; j < numberOfLayersInLSTM; ++j) {
      this.nodes.push(this.createAllNodesInLayer(this.nodes.length, hiddenSize));
    }
  }
  this.layers.push(createAllNodesInLayer(this.layers.length, vocabularySize));
}

Mother.prototype.createAllNodesInLayer = function (layerId, numberOfNodes) {
  //this will change
  var nodeLayer = {id: layerId, nodes: []};
  for(var i = 0; i < numberOfNodes; ++i) {
    nodeLayer.nodes.push(Node(layerId, i));
  }
  return layer;
}

var Node = function (layerId, id) {
  return {
    id: id,
    layerId: layerId,
    state: 0,
    prevState: 0,
    activation: 0,
    selfconnection = {weight: 0, gain: 1, gateId: -1, gateLayer: -1}
    elegibility = [];
    extendedEligibility = [];
    bias = Math.random() * 0.2 - 0.1;
  }
}

Mother.prototype.createAllConnections = function (layerLengths) {
  //this will change
  for(var i = 0; i < layerLength-1; ++i) {
    this.joinLayers(this.nodes[i], this.nodes[i+1], true);
  }
}

Mother.prototype.joinLayers = function (fromLayer, toLayer, allToAll) {
  if(allToAll) {
    for(var i = 0; i < fromLayer.nodes.length; ++i) {
      for(var j = 0; j < toLayer.nodes.length; ++j) {
        this.joinNodes(fromLayer.nodes[i], toLayer.nodes[j]);
      }
    }
  } else if(toLayer.nodes.length === this.nodes.length) {
    for(var k = 0; k < fromLayer.nodes.length; ++k) {
      this.joinNodes(fromLayer.nodes[k], toLayer.nodes[k]);
    }
  } else {
    console.alert('layers cannot be joined that way!')
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
  this.connections[toLayerId][fromLayerId].push(connection(toLayerId, fromLayerId, toNode.id, fromNode.id, connId));
  var connection = this.connections[toLayerId][fromLayerId][connId];

  if(fromNode.layerId === toNode.layerId && fromNode.id === toNode.id) {
    toNode.selfconnection = connection;
  }
}

Mother.prototype.gateLayerOneToOne = function (gatingLayer, fromLayerId, toLayerId) {
  //gates all inputs to toLayer from fromLayer, provided there are the same number of outputs in the gatingLayer 
  //as there are connections.
  //otherwise, fuck you.
  var connectionArr = connections[toLayerId][fromLayerId];
  if(connectionArr.length === gatingLayer.nodes.length) {
    for(var k = 0; k < gatingLayer.nodes.length; ++k) {
      this.gateConnection(connectionArr[k], gatingLayer[k]);
    }
  } else {
    console.alert('layers cannot be gated that way!')
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
    gateNodeId: -1
    gateLayerId: -1
    activation: 0,
    gain: 0,
    weight: Math.random() * .2 - .1
  }
}
