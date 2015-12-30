var LSTMNetwork = function (arrayOfLayerSizes, rate, maxGradient) {
  Network.call(this, null, rate, maxGradient);
  this.appendNodeLayer(arrayOfLayerSizes[0])
  for(var i = 1; i < arrayOfLayerSizes.length - 1; ++i) {
    this.appendNetworkLayer(LSTM, arrayOfLayerSizes[i])
  }
  this.appendNodeLayer(arrayOfLayerSizes[arrayOfLayerSizes.length - 1]);

  for(var j = 0; j < arrayOfLayerSizes.length - 2; ++j) {
    this.joinLayers(this.nodes[j], this.nodes[j], true); //recurrent connections for layers
    this.joinLayers(this.nodes[j], this.nodes[j+1], true);
  }

  this.initNeurons();
}

if(module) {
  var Network = require('./NetworkConstructor')
  var LSTM = require('./LSTMConstructor')
  module.exports = LSTMNetwork;
}

LSTMNetwork.prototype = Object.create(Network.prototype);
LSTMNetwork.prototype.constructor = LSTMNetwork;
