var Manager = function (partialNeuron) {
  Neuron.call(this.paritalNeuron);
  this.toPleb = makeIOStacks(0);
  this.toMother = makeIOStacks(2);
}
Manager.prototype = Object.create(Neuron.prototype);
Manager.prototype.constructor = Manager;



Manager.prototype.activate = function() {
  this.node.prevState = this.node.state;
  this.node.state = this.node.bias + this.node.old * this.node.selfConn.gain * this.node.selfConn.weight;
  //activate step
  stepCount = 3

  this.queueCommand('activationStep', function (state) {
    this.activation = squash(this.state);
    this.derivative = squash(this.state, true);
  });

  //influence step

  this.queueCommand('influenceStep', function (influences) {

  })
  //elegibility step
  for(var k = 0; k < node.inputConns.activations.length; ++k) {
    this.node.inputConns.elegibilities[k] *= this.node.selfConnection.weights[k] * this.node.selfConnection.gains[k];
    this.node.inputs.elegibilities[k] += this.node.inputs.gains[k] * this.node.inputs.activations[k];
  }
  //extended elegibility step
  for (var l = 0; l < gatedConns.ids.length; ++l) {
    var gatedNode = gatedConns.tos[l];
    for(var m = 0; m < node.inputConns.ids.length; ++m) {
    this.node.gatedConns.extendedEligibilities[l][m] *= this.gatedConns.selfConnWeight[gatedNode]
                                                    * this.gatedConns.selfConnGain[gatedNode]
    this.node.gatedConns.extendedEligibilities[l][m] += this.node.derivative * this.node.inputConns.elegibilities[k] 
                                                    * influences[gatedNode];
    }
  }
  //gain step?  Should do upstream

  //send changed values back to manager
  sendUpstream();

}

if(module && module.exports) {
  module.exports = Manager;
}
