if(module) {
  var Mother = require('./MotherConstructor.js').Mother;
  var MakeLSTMNetwork = require('./LSTMNetworkConstructor.js').MakeLSTMNetwork;
  var fs = require('fs');
}

var Seq2SeqServer = function (arrayOfLayerSizes, send) {
  this.enc = new Mother(null, send);
  this.enc.model = MakeLSTMNetwork(arrayOfLayerSizes, 0.1, 5)
  this.dec = new Mother(null, send);
  this.dec.model = MakeLSTMNetwork(arrayOfLayerSizes, 0.1, 5)
  this.saveTo = this.enc
}

Seq2SeqServer.prototype.input = function (object) {
  this.saveTo.input(object)
}

Seq2SeqServer.prototype.trainCallResponse = function (call, response, callback) {
  var i = 0;
  this.call = call;
  this.response = response;
  this.trainCall(0, this.trainResponse.bind(this, 0, callback));
}

Seq2SeqServer.prototype.trainCall = function (index, callback) {
  this.saveTo = this.enc
  if(index < this.call.length) {
    this.enc.activate(this.call[index], 
      this.enc.backPropagate.bind(this.enc, this.response[this.call.length - 1 - index], 
        this.trainCall.bind(this, index + 1, 
          callback
          )
        )
      );
  } else {
    callback.call(this);
  }
}

Seq2SeqServer.prototype.trainResponse = function (index, callback) {
  this.saveTo = this.dec
  if(index === 0) {
    this.setDecoderState()
  }
  if(index < this.response.length - 1) {
    this.dec.activate(this.response[index], 
      this.dec.backPropagate.bind(this.dec, this.response[index + 1], 
        this.trainResponse.bind(this, index + 1,
          callback
          )
        )
      );
  } else {
    callback.call(this);
  }
}

Seq2SeqServer.prototype.setDecoderState = function () {
  for(var i = 0; i < this.enc.model.layers.length; ++i) {
    for(var j = 0; j < this.enc.model.layers[i].length; ++j) {

      if(this.enc.model.layers[i][j].type === 'network') {

        for(var k = 0; k < this.enc.model.layers[i][j].layers.length; ++k) {
          for(var l = 0; l < this.enc.model.layers[i][j].layers[k].length; ++l) {
            this.enc.model.layers[i][j].layers[k][l].node.state = this.dec.model.layers[i][j].layers[k][l].node.state
          }
        }

      } else {

        this.dec.model.layers[i][j].node.state = this.enc.model.layers[i][j].node.state;

      }
    }
  }
}

Seq2SeqServer.prototype.getNewPair = function () {
  console.log('done!!!')
}

Seq2SeqServer.prototype.loadPairs = function () {
  var calls = fs.openSync('encoder', 'r');
  
}


if(module) {
  exports.Seq2SeqServer = Seq2SeqServer
}
