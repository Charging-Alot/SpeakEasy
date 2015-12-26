var Neuron = function (partialNeuron) {
  this.type = 'neuron';
  if(partialNeuron !== undefined && partialNeuron !== null) {
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

Neuron.prototype.update = function (command, section, partialNeuron) {
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
          this.connections[connType][connection][property] = partialNeuron.connections[connType][connection][property];
        }
      }
    }
  }
}

