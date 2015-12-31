if(module) {
  var Network = require('./NetworkConstructor.js').Network
  var LSTM = require('./LSTMConstructor.js').LSTM
}

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
