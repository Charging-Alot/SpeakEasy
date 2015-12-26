var Mother = function (network, sendFunction) {
  this.rate = 0.1;
  this.maxGradient = 5;
  this.model = network || new Network;
  this.toManager = new IoHandler(2, 1, this, sendFunction);
}

Mother.prototype.update = function (command, section, partialNeuron) {
  partialNeuron.gatedNodes = {};
  this.model.update(partialNeuron.node.layerId, partialNeuron.node.id, partialNeuron)
}

Mother.prototype.activate = function (inputArr, callback) {
  if(this.initialized) {
    this.activationUpdatesForLayer(0, inputArr);
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
    console.error('You must call initNeurons before activation!');
  }
}

Mother.prototype.activateLayer = function (layerId, callback) {
  for(var i = 0; i < this.model.layers[layerId].length; ++i) {
    this.queueCommandManager('activate', i, this.model.layers[layerId][i])
  }
  this.toManager.runAllOutputs(callback);
}

Mother.prototype.queueCommandManager = function (command, section, neuron, callback) {
  if(command === 'activate' ) {
    var partialNeuron = neuron
  } else if(command === 'backPropagate') {
    var partialNeuron = neuron
  }
  partialNeuron.rate = this.rate;
  partialNeuron.maxGradient = this.maxGradient
  this.toManager.addToOut(command, section, partialNeuron, callback)
}

Mother.prototype.activationUpdatesForLayer = function (layerId, inputArr) {
  for(var i = 0; i < this.model.layers[layerId].length; ++i) {
    this.model.layers[layerId][i].node.activation = inputArr[i];
    this.model.layers[layerId][i].node.bias = 0;
    this.model.layers[layerId][i].node.derivative = 0;
  }
}

Mother.prototype.backPropagate = function (targetArr, callback) {
  if(this.initialized) {
    this.errorUpdatesForLayer(this.model.layers.length-1, targetArr);
    var layerCounter = this.model.layers.length - 1;
    var backPropagationCallback = function () {
      layerCounter--
      if(layerCounter >= 0) {
        this.backPropagateLayer(layerCounter, backPropagationCallback);
      } else {
        callback();
      }
    }.bind(this)
    this.backPropagateLayer(layerCounter, backPropagationCallback); //activates first non input layer
  } else {
    console.log("You must call initNeurons before backPropagate! (don't forget to activate first as well)");
  } 
}

Mother.prototype.backPropagateLayer = function (layerId, callback) {
  for(var i = 0; i < this.model.layers[layerId].length; ++i) {
    this.queueCommandManager('backPropagate', i, this.model.layers[layerId][i])
  }
  this.toManager.runAllOutputs(callback);
}

Mother.prototype.errorUpdatesForLayer = function(layerId, targetArr) {
  var error;
  for(var i = 0; i < this.model.layers[layerId].length; ++i) {
    error = targetArr[i] - this.model.layers[layerId][i].node.activation
    this.model.layers[layerId][i].node.errorProjected = error;
    this.model.layers[layerId][i].node.errorResponsibility = error;
    this.model.layers[layerId][i].node.errorGated = 0
  }
}

