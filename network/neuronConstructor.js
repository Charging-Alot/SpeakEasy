var Neuron = function (partialNeuron) {
  this.node = this.node || {};
  this.inputConns = this.inputConns || {};
  this.gatedConns = this.gatedConns || {};
  this.gatedConns.influences = this.gatedConns.influences || {};
  this.gatedConns.selfConned = this.gatedConns.selfConned || {};
  if(partialNeuron) {
    this.update(partialNeuron);
  } 
}

Neuron.prototype.constructor = Neuron

Neuron.prototype.update = function (partialNeuron) {
  //properties of this node
  for(var nodeProp in paritalneuron.node) {
    this.node[nodeProp] = paritalneuron.node[nodeProp];
  }

  //properties of this node's input connections
  for(var inputProp in paritalneuron.inputConns) {
    this.inputConns[inputProp] = partialNeuron.inputConns[inputProp]
  }

  //properties of the connections that this node gates
  for(var gatedProp in paritalneuron.gatedConns) {
    if(gatedProp !== 'selfConned') {
      this.gatedConns[gatedProp] = partialNeuron.gatedConns[gatedProp]
    }
  }

  //properties of the to-nodes of the connections that this node gates and have a self connection.
  for(var selfProp in paritalneuron.gatedConns.selfConned) {
    this.gatedConns.selfConned[selfProp] = partialNeuron.gatedConns.selfConned[selfProp]
  }
}

if(module && module.exports) {
  module.exports = Neuron;
}

//Full Neuron Template
/* newNeuron is an object of the structure:
        {
          id: int
          job: int
          level: int
          children: array of objects
            {
              id: int
              socket: connection
              prevJob: int
            }
          state: float
          prevState: float
          bias: float
          activation: float
          derivative: float
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
          gatedConns: object
            {
              ids: array of ints
              tos: array of ints
              activations: array of floats
              weights: array of floats
              gains: array of floats
              extendedElegibilities: array of arrays of floats *private
              selfConns: object of objects
                {
                  initialInfluences: object
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
