var Neuron = function (partialNeuron) {
  if(partialNeuron !== undefined) {
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

// Neuron.prototype.constructor = Neuron

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
  //properties of gated nodes
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
  //properties of input, output and gated connections
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

//Full Neuron Template
/* newNeuron is an object of the structure:
        {
          node: 
            {
              layer: int
              id: int
              state: float
              prevState: float
              bias: float
              activation: float
              derivative: float
            }
          selfConn: object
            {
              gain: float
              weight: float
            }
          inputConns: object
            {
              ids: array of ints
              activations: array of floats
              weights: array of floats
              gains: array of floats
              elegibilities: array of floats *private
            }
          outputConns: object 
            {
            }
          gatedConns: object
            {
              //anything in this section may be singular for plebs
              ids: array of ints
              tos: array of ints
              activations: array of floats
              weights: array of floats
              gains: array of floats
              extendedElegibilities: array of arrays of floats *private
              selfConned: object of objects
                {
                  prevState: object
                    {
                      <id of gated, selfConned neuron>: <prevState>
                    }
                  gains: object
                    {
                      <id of gated, selfConned neuron>: float
                    }
                  weights: object
                    {
                      <id of gated, selfConned neuron>: float
                    }
                }
            }
          
        }*/
        //I left out influences, which for each gated node would have had all of the 
        //connections to that node which were gated by this one.  We can find this by
        //iterating over gatedConns and collecting all of the connections that point to
        //the same node.
        //*private means that the value here is specific to this neuron and is not the same value as it would be
        //for other neurons even though they might both include the connection in their neuron.
