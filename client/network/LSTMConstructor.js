if(module) {
  var Network = require('./NetworkConstructor.js').Network
}
/*
 * Creates a single LSTM node which is intended for use in an LSTM network.  
 * Note that this is a subnetwork and not a neuron.
 * Should be called with the new keyword.
 *
 * @param {network} null - A place holder variable to maintain the pattern of the network constructor
 * @param {rate} number - The learning rate for this node
 * @param {maxGradient} number - The max gradient to be used for gradient clipping
 * @return network object
 */
var LSTM = function (network, rate, maxGradient) {
  //this is a tensorflow style lstm.
  Network.call(this, null, rate, maxGradient);
  //input layer
  this.appendNodeLayer(4);
  this.nodes[0].nodes[3].squash = 'hyperbolicTangent';
  this.appendNodeLayer(1); //memory cell
  this.nodes[1].nodes[0].bias = 0;
  this.nodes[1].nodes[0].trainable = false;
  this.nodes[1].nodes[0].squash = 'hyperbolicTangent';
  this.appendNodeLayer(1); //output holder.  allows gating the out put within the network
  this.nodes[2].nodes[0].bias = 0;
  this.nodes[2].nodes[0].trainable = false;
  this.nodes[2].nodes[0].squash = 'none';

  // //input to gates from previous layer
  // this.joinLayers(this.nodes[0], this.nodes[1], false);
  // this.connections[0][1][0].weight = enbWeights[0];
  // this.joinLayers(this.nodes[0], this.nodes[2], false);
  // this.connections[0][2][0].weight = enbWeights[1];
  // this.joinLayers(this.nodes[0], this.nodes[3], false);
  // this.connections[0][3][0].weight = enbWeights[2];
  // this.joinLayers(this.nodes[0], this.nodes[4], false);
  // this.connections[0][4][0].weight = enbWeights[3];

  //input to gates from this lstms output
  // this.joinLayers(this.nodes[6], this.nodes[1], false);
  // this.connections[6][1][0].weight = selfWeights[0];
  // this.joinLayers(this.nodes[6], this.nodes[2], false);
  // this.connections[6][2][0].weight = selfWeights[1];
  // this.joinLayers(this.nodes[6], this.nodes[3], false);
  // this.connections[6][3][0].weight = selfWeights[2];
  // this.joinLayers(this.nodes[6], this.nodes[4], false);
  // this.connections[6][4][0].weight = selfWeights[3];

  //input to memory cell
  this.joinNodes(this.nodes[0].nodes[3], this.nodes[1].nodes[0], false);
  this.connections.internal[1][0][0].weight = 1;
  this.connections.internal[1][0][0].trainable = false;

  //join memory cell to itself.
  this.joinNodes(this.nodes[1].nodes[0], this.nodes[1].nodes[0], false);
  this.nodes[1].nodes[0].selfConnection.weight = 1;
  this.nodes[1].nodes[0].selfConnection.trainable = false;

  //join memory cell to second output layer
  this.joinNodes(this.nodes[1].nodes[0], this.nodes[2].nodes[0], false);
  this.connections.internal[2][1][0].weight = 1;
  this.connections.internal[2][1][0].trainable = false;

  //gate memory cell self connection (forget gate)
  this.gateConnection(this.nodes[1].nodes[0].selfConnection, this.nodes[0].nodes[0]);// either this or connection from 6 to

  //gate input to memory cell (remember gate)
  this.gateConnection(this.connections.internal[1][0][0], this.nodes[0].nodes[1]);

  //gate memory cell to output (output gate)
  this.gateConnection(this.connections.internal[2][1][0], this.nodes[0].nodes[2]);

  this.initNeurons();
}

LSTM.prototype = Object.create(Network.prototype);
LSTM.prototype.constructor = LSTM;

if(module) {
  exports.LSTM = LSTM
}
