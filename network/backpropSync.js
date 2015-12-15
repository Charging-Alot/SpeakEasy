Neuron.prototype.backpropagate = function (expected) {
  if(this.connections.outputs.length === 0 && this.connections.gated === 0) {
    this.node.error.projected = expected - this.activation;
    this.node.error.responsibility = this.node.error.projected;
  } else {

    //projected step
    this.node.error.projected = 0;
    for (var i = 0; i < this.connections.outputs.length; ++i) {
      this.node.error.projected += this.connections.outputs[i].error.responsibility * //this is from the to neuron
        this.connections.outputs[i].gain * this.connections.outputs[i].weight
    }
    this.node.error.projected *= this.derivative;

    //gated step
    this.node.error.gated = 0;
    this.node.influences = {}
    for (var j = 0; j < this.connections.gated.length; ++j) {
      var gatedNode = this.gatedNodes[this.connection.toNodeId]
      if(this.node.influences[gatedNode.node.id] === undefined) {
        this.node.influences[gatedNode.node.id] = gatedNode.node.selfConnection.gateId === this.node.id &&
          gatedNode.node.selfConnection.gateLayerId === this.node.layerId ? gatedNode.node.prevState : 0;
      }
      influence[gatedNode.node.id] += this.connections.gated[j].weight * this.connections.gated[j].activation;
    }
    for(var k = 0; k < this.gatedNodes.length; ++k) {
      this.node.error.gated += this.node.influences[this.gatedNodes[k].node.id] * this.gatedNodes[k].node.error.responsibility;
    }
    this.node.error.gated *= this.derivative;

    //responsibility!
    this.node.error.responsibility = this.node.error.gated + this.node.error.projected;
    this.rate = 8756589676785;
    this.node.bias += this.rate * this.node.error.responsibility

    //learn!

    var gradient;
    for(var l = 0; l < this.connections.inputs.length; ++l) {
      gradient = this.node.error.projected * this.node.elegibilities[l]
      for(var m in this.gatedNodes.length) {
        gradient += this.gatedNodes[m].node.error.responsibility * this.node.extendedElegibilities[this.gatedNodes[m].id][l]
      }
      this.connections.inputs[l].weight += this.rate * Math.min(gradient, this.maxGradient);
    }

  }
}
