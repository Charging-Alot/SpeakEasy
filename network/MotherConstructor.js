var Mother = function (layerLengths) {
  this.nextConnectionId = 0;
  this.nextGateId = 0;
  this.connections = []; // will become an array of objects of arrays.  cause simple would be boring.
  this.layers = [];
  if(layerLengths.length === 2) {
    console.alert('INVALID NUMBER OF LAYERS');
  }
  this.createAllLayers(layerLengths);
  this.createAllConnections();
  this.toManager = new IoHandler(0, 1, this.update.bind(this), this.send);
}

Mother.prototype.createAllLayers = function (layerLengths) {
  for(var i = 0; i < layerLengths; ++i) {
    if(layerLengths[i] <= 0) {
      console.alert('INVALID LAYER LENGTH');
    } else {
      this.connections.push({});
      this.layers.push(createLayer(i, layerLengths[i]))
    }
  }
}

Mother.prototype.createLayer = function (layerId, numberOfNodes) {
  //this will change
  var layer = {id: layerId, nodes: []};
  for(var i = 0; i < numberOfNodes; ++i) {
    layer.nodes.push(new Neuron({
      node: {
        id: i,
        layerId: layerId,
        state: 0,
        prevState: 0,
        activation: 0,
        selfconnection = {weight: 0, gain: 1}
        bias = Math.random() * 0.2 - 0.1;
      }
    }));
  }
  return layer;
}

Mother.prototype.createAllConnections = function (layerLengths) {
  //this will change
  for(var i = 0; i < layerLength-1; ++i) {
    this.joinLayers(this.layers[i], this.layers[i+1], true);
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
  if(!this.connections[toLayerId][fromLayerId]) {
    this.connections[toLayerId][fromLayerId] = [];
  }
  var connId = this.connections[toLayerId][fromLayerId].length
  this.connections[toLayerId][fromLayerId].push({
    id: connId
    from: {}, 
    to: {},
    gate: {},
    selfConned: false
  });
  var connection = this.connections[toLayerId][fromLayerId][connId];

  if(fromNode.layerId === toNode.layerId && fromNode.id === toNode.id) {
    toNode.selfconnection.weight = 1;
    toNode.selfconnection.id = connId;
    connection.selfConned = true;
  }

  this.initConnectionInNode(fromLayerId, toLayerId, fromNode, 'from');
  this.initConnectionInNode(fromLayerId, toLayerId, toNode, 'to');

  // if(fromNode.id === toNode.id) {
  //   this.updateConnection(fromLayerId, toLayerId, connId, 'weights', 1);
  // } else {
  //   this.updateConnection(fromLayerId, toLayerId, connId, 'weights', Math.random() * .2 - .1);
  // }
  // this.updateConnection(fromLayerId, toLayerId, connId, 'gains', 1);
}

Mother.prototype.initConnectionInNode = function (connection, node, fromLayerId, toLayerId, fromToOrGate) {
  if(fromToOrGated === 'from') {
    var nodeObj = node.outputConns;
    var connectionObj = connection.from;
  } else if(fromToOrGated === 'to') {
    nodeObj = node.inputConns;
    connectionObj = connection.to
  } else if(fromToOrGated === 'gate') {
    nodeObj = node.gatedConns;
    connectionObj = connection.gate
  }
  if(!nodeObj.ids) {
    nodeObj.ids = [];
    nodeObj.fromLayer = [];
    nodeObj.toLayer = [];
  }
  connectionObj.nodeId = node.id;
  connectionObj.layerId = node.layerId;
  connectionObj.index = nodeObj.ids.length;
  nodeObj.ids.push(connection.Id);
  nodeObj.fromLayer.push(fromLayerId);
  nodeObj.toLayerId.push(toLayerId);
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
  this.initConnectionInNode(fromLayerId, toLayerId, gateNode, 'gate');
}

Mother.prototype.initAllConnectionData = function () {
  //should be run once, and after all connections AND gates are in place
  for(var i = 0; i < this.connections.length; ++i) {
    var connectionsToLayer = this.connections[i]
    if(connectionsToLayer[i]) {
      var isSelfConnedLayer = true;
    } else {
      isSelfConnedLayer = false;
    }
    for(var j in connectionsToLayer) {
      var connectionsToLayerFromLayer = connectionsToLayer[j];
      for(var k = 0; k < connectionsToLayerFromLayer.length; ++k) {
        this.initConnection(connectionsToLayerFromLayer[k], isSelfConnedLayer);
      }
    }
  }
}

Mother.prototype.initConnection(connection, isSelfConnedLayer) {
  connection.selfConned = isSelfConnedLayer;
  
}

Mother.prototype.updateConnectionAttribute = function (fromLayerId, toLayerId, connId, attribute, value) {
  var connection = this.connections[toLayerId][fromLayerId][connId]
  if(attribute !== 'prevState') {
    if(!connection.from.outputConns[attribute]) {
      connection.from.outputConns[attribute] = []
    } else if(!connection.to.neuron.inputConns[attribute]) {
      connection.from.outputConns[attribute] = []
    }
    connection.from.neuron.outputConns[attribute][connection.from.index] = value;
    connection.to.neuron.inputConns[attribute][connection.to.index] = value;
  }
  if(connection.gate) {
    if(!connection.gate.neuron.gatedConns[attribute]) {
      connection.gate.neuron.gatedConns[attribute] = [];
    }
    connection.gate.neuron.gatedConns[attribute][connection.gate.index] = value;
    if(connection.to.neuron.node.selfConnection.weight !== 0) {
      if(attribute === 'prevState') {
        if(!connection.gate.neuron.gatedConns.selfConned.InitialInfluences) {
          connection.gate.neuron.gatedConns.selfConned.InitialInfluences = {};
        }
        connection.gate.neuron.gatedConns.selfConned.InitialInfluences[connection.to.neuron.node.id] = value
      } else if(attribute === 'weights'){
        if(!connection.gate.neuron.gatedConns.selfConned.weights) {
          connection.gate.neuron.gatedConns.selfConned.weights = {};
        }
        connection.gate.neuron.gatedConns.selfConned.weights[connection.to.neuron.node.id] = value;
      } else if(attribute === 'gains')
        if(!connection.gate.neuron.gatedConns.selfConned.gains) {
          connection.gate.neuron.gatedConns.selfConned.gains = {};
        }
        connection.gate.neuron.gatedConns.selfConned.gains[connection.to.neuron.node.id] = value;
    }
  }
}
