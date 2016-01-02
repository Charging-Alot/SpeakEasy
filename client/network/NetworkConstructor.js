if (module) {
  var Neuron = require('./NeuronConstructor.js').Neuron
}
/*
 * Network constructor.  
 * Takes all or part of a Network object, And builds any structures that were not all ready in the object and returns an object.
 * Should be called with the new keyword.
 *
 * @param {partialNetwork} object - An object containing some or all parts of a single network.  Structured as follows:
 * {
 *   id: int
 *   layerId: int
 *   type: string
 *   initialized: boolean
 *   rate: float
 *   maxGradient: float
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
 *       internal: array
 *         [
 *           Connection objects
 *         ]
 *     }
 *   gatedNodes: object
 *     {
 *       Node object
 *     }
 * }
 * @return network object
 */
var Network = function (network, rate, maxGradient) {
  this.type = 'network';
  this.initialized = false;
  this.rate = rate;
  this.maxGradient = rate;
  if (!network) {
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

/*
 * Updates the subnetwork or neuron corresponding to the input model's id and layerId within the network.
 *
 * @param {model} object - Must be have the structure of either a network or a neuron with the correct type property
 */
Network.prototype.update = function (model) {
  console.log('MOOOOOOOOOO', model)
  console.log('DOOOOOOOOOD', this)
  this.rate = model.rate
  this.maxGradient = model.maxGradient
  if (model.type !== 'network') {
    // if (model.node.subNetworkId !== -1) {
    //   this.layers[model.node.subNetworkLayerId][model.node.subNetworkId].update(model)
    // } else {
    this.layers[model.node.layerId][model.node.id].update(model);
    // }
    // if(model.node.subNetworkId === -1 || (model.node.subNetworkId !== this.id && model.node.subNetworkLayerId !== this.layerId)) {
    //   this.layers[model.node.layerId][model.node.id].update(model);
    // } else {
    //   // this.layers[model.node.subNetworkLayerId][model.node.subNetworkId].layers[model.node.layerId][model.node.id].update(model)
    //   this.layers[model.node.layerId][model.node.id].update(model)
    // }
  } else {
    for (var i = 0; i < model.layers.length; ++i) {
      for (var j = 0; j < model.layers[i].length; ++j) {
        this.layers[i][j].update(model.layers[i][j])
      }
    }
  }
}

/*
 * Initializes the neurons in a network.  This network's nodes and connections arrays must already have been created and filled in.
 * No nodes or connections should be added after this has been called and no work should be done by this network until after this function has been called.
 * Sets the initialized property to true.
 */
Network.prototype.initNeurons = function () {
  var selfConnGateNode;
  for (var layer = 0; layer < this.nodes.length; ++layer) {
    this.layers.push([]);
    for (var node = 0; node < this.nodes[layer].nodes.length; ++node) {
      if (this.nodes[layer].nodes[node].type === 'neuron') {
        this.layers[layer].push(new Neuron({
          node: this.nodes[layer].nodes[node]
        }));
        this.layers[layer][node].isOutput = (layer === this.nodes.length - 1)
      } else {
        if (!this.nodes[layer].nodes[node].initialized) {
          this.nodes[layer].nodes[node].initNeurons();
        }
        this.layers[layer].push(this.nodes[layer].nodes[node])
      }
    }
  }

  this.placeConnectionsInNeurons();

  var neuron;
  var network;
  for (layer = 0; layer < this.nodes.length; ++layer) {
    for (node = 0; node < this.nodes[layer].nodes.length; ++node) {
      if (this.layers[layer][node].type === 'network') {
        network = this.layers[layer][node];
        for (var input = 0; input < network.layers[0].length; ++input) {
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

/*
 * Takes a neuron with node and connections already established and initializes all of it's elegibilities and extended elegibilities to 0.
 *
 * @param {neuron} Object - The neuron whose elegibilities should be initialized
 */
Network.prototype.initializeElegibilitiesForNeuron = function (neuron) {
  var layer = neuron.node.layerId;
  var node = neuron.node.id
  this.layers[layer][node].node.elegibilities = [];
  this.layers[layer][node].node.extendedElegibilities = {};
  for (var input = 0; input < neuron.connections.inputs.length; ++input) {
    neuron.node.elegibilities.push(0);
    for (var gated in neuron.gatedNodes) {
      if (!neuron.node.extendedElegibilities[gated]) {
        neuron.node.extendedElegibilities[gated] = [];
      }
      neuron.node.extendedElegibilities[gated].push(0);
    }
  }
}

/*
 * Iterates over the network's internal connection array and places the Connection objects into the neurons that they connect to, originate from or are gated by.
 * Also places the nodes that the connection goes to, comes from and is gated by into the connection.
 * In the case that one of these nodes is a network, places the connection object in the appropriate input or output of that network.
 */
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
  for (var layer = 0; layer < this.layers.length; ++layer) {
    for (var node = 0; node < this.layers[layer].length; ++node) {
      var selfConnedNode = this.layers[layer][node]
      if (selfConnedNode.type !== 'network') {
        var gateNode = selfConnedNode.node.selfConnection.gateNode
        if (gateNode !== null) {
          var gateNeuron = this.layers[gateNode.layerId][gateNode.id]
          gateNeuron.connections.gated.push(selfConnedNode.node.selfConnection);
          gateNeuron.gatedNodes[selfConnedNode.node.id] = selfConnedNode.node;
        }
      }
    }
  }

  //other connections
  for (var toLayerId in this.connections.internal) {
    for (var fromLayerId in this.connections.internal[toLayerId]) {
      for (var i = 0; i < this.connections.internal[toLayerId][fromLayerId].length; ++i) {
        connection = this.connections.internal[toLayerId][fromLayerId][i];

        if (connection.fromSubNetworkId === -1) {
          fromNeuron = this.layers[fromLayerId][connection.fromNodeId];
          fromNode = this.nodes[fromLayerId].nodes[connection.fromNodeId];
        } else {
          fromNetwork = this.layers[connection.fromSubNetworkLayerId][connection.fromSubNetworkId];
          fromNeuron = fromNetwork.layers[connection.fromLayerId][connection.fromNodeId];
          fromNode = fromNetwork.nodes[connection.fromLayerId][connection.fromNodeId]
        }

        if (connection.toSubNetworkId === -1) {
          toNeuron = this.layers[toLayerId][connection.toNodeId];
          toNode = this.nodes[toLayerId].nodes[connection.toNodeId];
        } else {
          toNetwork = this.layers[connection.toSubNetworkLayerId][connection.toSubNetworkId];
          toNeuron = toNetwork.layers[connection.toLayerId][connection.toNodeId];
          toNode = toNetwork.nodes[connection.toLayerId].nodes[connection.toNodeId]
        }

        fromNeuron.connections.outputs.push(connection);
        toNeuron.connections.inputs.push(connection);

        if (connection.gateNodeId !== -1) {
          if (connection.gateSubNetworkId === -1) {
            gateNeuron = this.layers[connection.gateLayerId][connection.gateNodeId];
          } else {
            gateNeuron = this.layers[connection.gateSubNetworkLayerId][connection.gateSubNetworkId].layers[connection.gateLayerId][connection.gateNodeId]
          }
          gateNeuron.connections.gated.push(connection);
          if (!gateNeuron.gatedNodes[toNode.id]) {
            gateNeuron.gatedNodes[toNode.id] = toNode;
          }
        }
      }
    }
  }
}

/*
 * Initializes a new layer of nodes of the specified size and puts it at the end of the current network.
 *
 * @param {numberOfNodes} number - The desired size of the layer being appended
 */
Network.prototype.appendNodeLayer = function (numberOfNodes) {
  this.nodes.push(this.createAllNodesInLayer(this.nodes.length, numberOfNodes))
}

/*
 * Creates an object with a property, layerId, set to the specified number and another property, nodes, which is an array of nodes of the specified length.
 *
 * @param {layerId} number - The layerId of this layer in the network
 * @param {numberOfNodes} number - The desired size of the layer to be returned
 * @ @return array of nodes
 */
Network.prototype.createAllNodesInLayer = function (layerId, numberOfNodes) {
  var nodeLayer = {
    id: layerId,
    nodes: []
  };
  for (var i = 0; i < numberOfNodes; ++i) {
    nodeLayer.nodes.push(Node(layerId, i));
  }
  return nodeLayer;
}

/*
 * Initializes a new layer of networks using the specified pseudoclassical constructor of the specified size and puts it at the end of the end of the current network.
 *
 * @param {networkConstructor} function - Pseudoclassical network constructor
 * @param {numberOfNodes} number - The desired size of the layer being appended
 */
Network.prototype.appendNetworkLayer = function (networkConstructor, numberOfNodes) {
  this.nodes.push(this.createAllNetworksInLayer(networkConstructor, this.nodes.length, numberOfNodes))
}

/*
 * Creates an object with a property, layerId, set to the specified number and another property, nodes, which is an array of networks of the specified length created using the specified pseudoclassical constructor.
 *
 * @param {networkConstructor} function - Pseudoclassical network constructor
 * @param {layerId} number - The layerId of this layer in the network
 * @param {numberOfNodes} number - The desired size of the layer to be returned
 * @ @return array of nodes
 */
Network.prototype.createAllNetworksInLayer = function (networkConstructor, layerId, numberOfNodes) {
  var networkLayer = {
    id: layerId,
    nodes: []
  }
  for (var i = 0; i < numberOfNodes; ++i) {
    networkLayer.nodes.push(new networkConstructor(null, this.rate, this.maxGradient))
    networkLayer.nodes[i].setId(layerId, i);
  }
  return networkLayer;
}

/*
 * Sets the specified layerId and id as this network's id and layerId.
 * Also sets the specified layerId and id as each internal node's subNetworkId and subNetworkLayerId.
 *
 * @param {layerId} number - The layerId of this network in the context of it's parent network
 * @param {id} number - The id of this network in it's layer in the context of it's parent network
 */
Network.prototype.setId = function (layerId, id) {
  this.layerId = layerId;
  this.id = id;
  for (var i = 0; i < this.nodes.length; ++i) {
    for (var j = 0; j < this.nodes[i].nodes.length; ++j) {
      this.nodes[i].nodes[j].subNetworkId = id;
      this.nodes[i].nodes[j].subNetworkLayerId = layerId;
    }
  }
}

/*
 * Returns a node with default properties and randomized bias.
 * 
 * @param {layerId} number - The id of the layer this neuron is in
 * @param {id} number - The id if this neuron within it's layer
 * @return object
 */
var Node = function (layerId, id) {
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
    selfConnection: {
      weight: 0,
      gain: 1,
      gateNodeId: -1,
      gateLayerId: -1,
      gateNode: null
    },
    elegibilities: [],
    extendedElegibilities: {},
    errorResponsibility: 0,
    errorProjected: 0,
    errorGated: 0,
    bias: Math.random() * 0.2 - 0.1
  }
}
/*
 * Takes two layers and creates connections between their children nodes within this network's internal connections array. 
 * If allToAll is true then each node in the first layer will be connected to every node in the second layer.
 * Otherwise it will connect each node in the first layer only to the node in the second layer with the same id.
 *
 * @param {fromLayer} array of node objects or network objects - The layer from which the connections will originate
 * @param {toLayer} array of node objects or network objects - The layer at which the connections terminate
 */
Network.prototype.joinLayers = function (fromLayer, toLayer, allToAll) {
  if (allToAll) {
    for (var i = 0; i < fromLayer.nodes.length; ++i) {
      for (var j = 0; j < toLayer.nodes.length; ++j) {
        this.joinNodes(fromLayer.nodes[i], toLayer.nodes[j], true);
      }
    }
  } else if (toLayer.nodes.length === fromLayer.nodes.length) {
    for (var k = 0; k < fromLayer.nodes.length; ++k) {
      this.joinNodes(fromLayer.nodes[k], toLayer.nodes[k], true);
    }
  } else {
    console.error('layers cannot be joined that way!')
  }
}
/*
 * Creates one or more connection objects linking the toNode and fromNode. 
 * If only one of the nodes is a network, then the other node will be joined to all, either inputs or outputs, depending on which node is a network.
 * If both nodes are networks then joinLayers will be called on the output layer of the fromNode and the input layer of the toNode, using the allToAll variable in this function call.
 *
 * @param {fromNode} a node object or network object - The node from which the connection/s will originate
 * @param {fromNode} a node object or network object - The node at which the connection/s will terminate
 */
Network.prototype.joinNodes = function (fromNode, toNode, allToAll) {
  if (toNode.subNetworkLayerId === -1) {
    var toLayerId = toNode.layerId;
  } else {
    toLayerId = toNode.subNetworkLayerId
  }
  if (fromNode.subNetworkLayerId === -1) {
    var fromLayerId = fromNode.layerId;
  } else {
    fromLayerId = fromNode.subNetworkLayerId
  }

  if (!this.connections.internal[toLayerId]) {
    this.connections.internal[toLayerId] = {}
  }
  if (!this.connections.internal[toLayerId][fromLayerId]) {
    this.connections.internal[toLayerId][fromLayerId] = [];
  }

  if (fromNode.type === 'network' && toNode.type === 'network') {
    this.joinLayers(fromNode.nodes[fromNode.nodes.length - 1], toNode.nodes[0], allToAll)
  } else if (fromNode.type === 'network') {
    for (var i = 0; i < fromNode.nodes[fromNode.nodes.length - 1].nodes.length; ++i) {
      this.joinNodes(fromNode.nodes[fromNode.nodes.length - 1].nodes[i], toNode, allToAll);
    }
  } else if (toNode.type === 'network') {
    for (var j = 0; j < toNode.nodes[0].nodes.length; ++j) {
      this.joinNodes(fromNode, toNode.nodes[0].nodes[j], allToAll);
    }
  } else {
    if (fromNode.layerId === toNode.layerId && fromNode.id === toNode.id && fromNode.subNetworkId === toNode.subNetworkId && fromNode.subNetworkLayerId === toNode.subNetworkLayerId) {
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

/*
 * Creates a gating relationship between nodes in the gating layer and exactly one of the connections which span the layers whose ids are specified.
 * There must be the same number of nodes in the gating layer as connections going from the fromLayer to the toLayer.
 *
 * @param {gatingLayer} array of node objects or network objects - The layer of nodes which will gate the specified connections
 * @param {fromLayerId} number - The id of the layer that the gated connections originate from
 * @param {toLayerId} number - The id of the layer that the gated connections go to
 */
Network.prototype.gateLayerOneToOne = function (gatingLayer, fromLayerId, toLayerId) {
  if (fromLayerId !== toLayerId) {
    var connectionArr = this.connections.internal[toLayerId][fromLayerId];
    if (connectionArr.length === gatingLayer.nodes.length) {
      for (var k = 0; k < gatingLayer.nodes.length; ++k) {
        this.gateConnection(connectionArr[k], gatingLayer.nodes[k]);
      }
    } else {
      console.error('layers cannot be gated that way!')
    }
  } else {
    if (gatingLayer.nodes.length === this.nodes[fromLayerId].nodes.length) {
      for (var k = 0; k < gatingLayer.nodes.length; ++k) {
        this.gateConnection(this.nodes[fromLayerId].nodes[k].selfConnection, gatingLayer.nodes[k]);
      }
    } else {
      console.error('layers cannot be gated that way!')
    }
  }
}

/*
 * Creates a gating relationship between the gateNode and the connection.
 *
 * @param {connection} connection object - Connection to be gated
 * @param {gateNode} node object - Gating node
 */
Network.prototype.gateConnection = function (connection, gateNode) {
  if (gateNode.type === 'network') {
    connection.gateSubNetworkId = gateNode.subNetworkId;
    connection.gateSubNetworkLayerId = gateNode.subNetworkLayerId;
  }
  connection.gateNodeId = gateNode.id;
  connection.gateLayerId = gateNode.layerId;
  connection.gateNode = gateNode;
}

/*
 * Creates a connection between the specified nodes with the indicated id.
 *
 * @param {connId} number - The id of this connection
 * @param {toNode} node object - Terminating node
 * @param {fromNode} node object - Originating node
 * @return connection object
 */
var Connection = function (connId, toNode, fromNode) {

  var response = {
    // return {
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
  if (response.toNode === response.fromNode) {
    response.toNode = null;
    response.fromNode = null;
  }
  return response;
}

/*
 * Iterates over the input array and sets the activation for each input node in the network.
 *
 * @param {inputArr} array of numbers - Array of inputs to the network
 */
Network.prototype.activateFirstLayer = function (inputArr) {
  for (var i = 0; i < this.layers[0].length; ++i) {
    this.layers[0][i].node.activation = inputArr[i];
    this.layers[0][i].node.bias = 0;
    this.layers[0][i].node.derivative = 0;
  }
}

/*
 * Iterates over an array of expected outputs and initializes their projected error, gated error and error responsibility for backPropagation.
 * Simple error calculation is used, a more sophisticated loss calculation may be implemented in the future.
 * 
 * @param {targetArr} array of numbers - Array of expected outputs from the network
 */
Network.prototype.setLastLayerError = function (targetArr) {
  var error;
  var lastIndex = this.layers.length - 1
  for (var i = 0; i < this.layers[lastIndex].length; ++i) {
    error = targetArr[i] - this.layers[lastIndex][i].node.activation
    this.layers[lastIndex][i].node.errorProjected = error;
    this.layers[lastIndex][i].node.errorResponsibility = error;
    this.layers[lastIndex][i].node.errorGated = 0
  }
}

if (module) {
  exports.Network = Network
}
