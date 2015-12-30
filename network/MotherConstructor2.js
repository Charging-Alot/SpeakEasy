var Mother = function (network, sendFunction) {
  this.rate = 0.1;
  this.maxGradient = 5;
  this.model = network || new Network(null, this.rate, this.maxGradient)
  this.toManager = new IoHandler(2, 1, this, sendFunction);
}

Mother.prototype.update = function (command, section, model) {
  // model.gatedNodes = {};
  this.model.update(model);
}

Mother.prototype.activate = function (inputArr, callback) {
  if(this.model.initialized) {
    this.model.activateFirstLayer(inputArr);
    var layerCounter = 1;
    var activationCallback = function () {
      // debugger
      layerCounter++
      if(layerCounter < this.model.layers.length) {
        this.activateLayer(layerCounter, activationCallback);
      } else {
        callback();
      }
    }.bind(this);
    this.activateLayer(layerCounter, activationCallback); //activates first non input layer
  } else {
    console.error('You must call initNeurons on model before activation!');
  }
}

Mother.prototype.activateLayer = function (layerId, callback) {
  for(var i = 0; i < this.model.layers[layerId].length; ++i) {
    this.queueCommandManager('activate', i, this.model.layers[layerId][i])
  }
  this.toManager.runAllOutputs(callback)
}

Mother.prototype.queueCommandManager = function (command, section, neuron, callback) {
  if(command === 'activate' ) {
    var partialNeuron = neuron
  } else if(command === 'backPropagate') {
    partialNeuron = neuron
  }
  partialNeuron.rate = this.rate;
  partialNeuron.maxGradient = this.maxGradient
  this.toManager.addToOut(command, section, partialNeuron, callback)
}

Mother.prototype.backPropagate = function (targetArr, callback) {
  if(this.model.initialized) {
    this.model.setLastLayerError(targetArr);
    var layerCounter = this.model.layers.length - 1;
    var backPropagationCallback = function () {
      layerCounter--;
      if(layerCounter >= 0) {
        this.backPropagateLayer(layerCounter, backPropagationCallback);
      } else {
        callback();
      }
    }.bind(this)
    this.backPropagateLayer(layerCounter, backPropagationCallback); //activates first non input layer
  } else {
    console.log("You must call initNeurons on model before backPropagate! (don't forget to activate first as well)");
  } 
}

Mother.prototype.backPropagateLayer = function (layerId, callback) {
  for(var i = 0; i < this.model.layers[layerId].length; ++i) {
    this.queueCommandManager('backPropagate', i, this.model.layers[layerId][i])
  }
  this.toManager.runAllOutputs(callback);
}

Mother.prototype.train = function () {};

