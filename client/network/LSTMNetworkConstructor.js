if(module) {
  var Network = require('./NetworkConstructor.js').Network
  var LSTM = require('./LSTMConstructor.js').LSTM
}

/*
 * Creates a network of LSTM nodes using the same style as google's tensorflow library.
 * Notice that this constructor uses a functional style instead of a pseudoClassicalStyle and so does not need the new keyword.
 *
 * @param {arrayOfLayerSizes} array of numbers - Array of numbers indicating the size of each layer.  Note that at least three layers are required for a well formed LSTM network.
 * @param {rate} number - The learning rate for this network
 * @param {maxGradient} number - The max gradient to be used for gradient clipping
 * @return network object
 */
var MakeLSTMNetwork = function (arrayOfLayerSizes, rate, maxGradient) {
  var lstmNetwork = new Network(null, rate, maxGradient)
  lstmNetwork.appendNodeLayer(arrayOfLayerSizes[0])
  for(var i = 1; i < arrayOfLayerSizes.length - 1; ++i) {
    lstmNetwork.appendNetworkLayer(LSTM, arrayOfLayerSizes[i])
  }
  lstmNetwork.appendNodeLayer(arrayOfLayerSizes[arrayOfLayerSizes.length - 1]);

  for(var j = 0; j < arrayOfLayerSizes.length - 2; ++j) {
    lstmNetwork.joinLayers(lstmNetwork.nodes[j], lstmNetwork.nodes[j], true); //recurrent connections for layers
    lstmNetwork.joinLayers(lstmNetwork.nodes[j], lstmNetwork.nodes[j+1], true);
  }

  lstmNetwork.initNeurons();
  return lstmNetwork;
}

if(module) {
  exports.MakeLSTMNetwork = MakeLSTMNetwork;
}
