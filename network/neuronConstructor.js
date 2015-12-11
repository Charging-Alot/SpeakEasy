var Neuron = function (partialNeuron, fromUpstream) {
  if(fromUpstream) {
    this.node = partialNeuron.node || {};
    this.connections = {};
    this.connections.inputs = partialNeuron.connections.inputs || [];
    this.connections.outputs = partialNeuron.connections.outputs || [];
    this.connections.gated = partialNeuron.connections.gated || [];
    this.gatedNodes = partialNeuron.gatedNodes || {};
  }
    this.node = {};
    this.connections = {};
    this.connections.inputs = [];
    this.connections.outputs = [];
    this.connections.gated = [];
    this.gatedNodes = {}; //
  if(partialNeuron && !fromUpstream) {
    this.update(partialNeuron);
  }
};

Neuron.prototype.constructor = Neuron

Neuron.prototype.update = function (partialNeuron, fromUpstream) {
  if(fromUpstream)

  //properties of this node
  if(partialNeuron.node) {
    for(var nodeProp in paritalneuron.node) {
      this.node[nodeProp] = paritalneuron.node[nodeProp];
    }
  }
  if(partialNeuron.connections) {
    for(var connType in partialNeuron.connections) {
      for(var connection in partialNeuron.connections[connType]) {
        for(var property in partialNeuron.connections[connType][connection]) {
          if(property !== 'selfConned') {
            this.connections[connType][connection][property] = partialNeuron.connections[connType][connection][property];
          } else {
            for(var nodeProperty in this.connections[connType][connection]['selfConned']) {
              this.connections[connType][connection]['selfConned'][nodeProperty] = partialNeuron.connections[connType][connection]['selfConned'][nodeProperty];
            }
          }
        }
      }
    }
  }

  // //properties of this node's input connections
  // for(var inputProp in paritalneuron.inputConns) {
  //   this.inputConns[inputProp] = partialNeuron.inputConns[inputProp]
  // }

  // //properties of the connections that this node gates
  // for(var gatedProp in paritalneuron.gatedConns) {
  //   if(gatedProp !== 'selfConned' || gatedProp !== 'extendedElegibility') {
  //     this.gatedConns[gatedProp] = partialNeuron.gatedConns[gatedProp]
  //   } else if (gatedProp === 'extendedElegibility') {
  //     this.gatedProp.extendedElegibilities[section] = partialNeuron.extendedElegibility
  //   }
  // }

  // //properties of the to-nodes of the connections that this node gates and have a self connection.
  // for(var selfProp in paritalneuron.gatedConns.selfConned) {
  //   this.gatedConns.selfConned[selfProp] = partialNeuron.gatedConns.selfConned[selfProp]
  // }
}

if(module && module.exports) {
  module.exports = Neuron;
}

// Neuron.prototype.get = function () {
//   var target = this;
//   for(var i = 0; i < arguments.length; ++i) {
//     target = target[arguments[i]];
//   }
//   if(typeof target === object) {
//     return target
//   } else {
//     return target[0];
//   }
// }

// Neuron.prototype.set = function () {
//   var target = this;
//   if(typeof arguments[arguments.length -1] !== 'string') {
//     var value = arguments.pop();
//   } else {
//     var opString = arguments.pop();
//     value = arguments.pop();
//   }

//   for(var i = 0; i < arguments.length - 1; ++i) {
//       target = target[arguments[i]];
//   }
//   if(typeof value === 'object') {
//     target = value;
//     return;
//   }

//   if(!opString) {
//     target[0] = value;
//   } else if (opString  === '+') {
//     target[0] += value;
//   } else if (opString  === '-') {
//     target[0] -= value;
//   } else if (opString  === '*') {
//     target[0] *= value;
//   } else if (opString  === '/') {
//     target[0] /= value;
//   }
// }

// Neuron.prototype.getNodeAtt = Neuron.prototype.get.bind(this.node);
// Neuron.prototype.getInputAtt = Neuron.prototype.get.bind(this.inputConns);
// Neuron.prototype.getOutputAtt = Neuron.prototype.get.bind(this.outputConns);
// Neuron.prototype.getGatedAtt = Neuron.prototype.get.bind(this.gatedConns);

// Neuron.prototype.setNodeAtt = Neuron.prototype.set.bind(this.node);
// Neuron.prototype.setInputAtt = Neuron.prototype.set.bind(this.inputConns);
// Neuron.prototype.setOutputAtt = Neuron.prototype.set.bind(this.outputConns);
// Neuron.prototype.setGatedAtt = Neuron.prototype.set.bind(this.gatedConns);
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
