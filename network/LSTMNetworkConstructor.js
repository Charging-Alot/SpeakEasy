var LSTMNetwork = function (arrayOfLayerSizes, arrayOfBiasArrays, arrayOfWeightTensors) {
  Network.call(this);
  this.appendNodeLayer(arrayOfLayerSizes[0])
  for(var i = 1; i < arrayOfLayerSizes.length - 1; ++i) {
    this.appendNetworkLayer(LSTM, arrayOfLayerSizes[i])
  }
  this.appendNodeLayer(arrayOfLayerSizes[arrayOfLayerSizes.length - 1]);

  for(var j = 0; j < arrayOfLayerSizes.length - 1; ++j) {
    this.joinLayers
  }
}

LSTMNetwork.prototype = Object.create(Network.prototype);
LSTMNetwork.prototype.constructor = LSTMNetwork;
