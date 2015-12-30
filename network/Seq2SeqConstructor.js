var Mother = require('./MotherConstructor.js');
var LSTMNetwork = require('./LSTMNetworkConstructor')

var Seq2SeqServer = function (arrayOfLayerSizes, send) {
  this.enc = motherEnc = new Mother(null, send);
  this.enc.model = LSTMNetwork(arrayOfLayerSizes)
  this.dec = motherDec = new Mother(null, send);
  this.dec.model = LSTMNetwork(arrayOfLayerSizes)
  this.saveTo = 'enc'
}

Seq2SeqServer.prototype.save = function (object) {
  this[this.saveTo].save(object)
}

Seq2SeqServer.prototype.trainCallResponse = function (call, response) {
  var i = 0;
  this.call = call;
  this.response = response;
  this.trainCall(0, trainResponse.bind(this, 0, this.getNewPair.bind(this))
}

Seq2SeqServer.prototype.trainCall = function (index, callback) {
  this.saveTo = 'enc'
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
  this.saveTo = 'dec'
  if(index === 0) {
    this.setDecoderState()
  }
  if(index < this.response.length - 1) {
    this.dec.activate(this.response[index], 
      this.dec.backPropagate.bind(this.response[index + 1], 
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
  for(var i = 0; i < this.enc.layers.length; ++i) {
    for(var j = 0; j < this.enc.layers[i].length; ++j) {

      if(this.enc.layers[i][j].type === 'network') {

        for(var k = 0; k < this.enc.layers[i][j].layers.length; ++k) {
          for(var l = 0; l < this.enc.layers[i][j].layers[k].length; ++l) {
            this.enc.layers[i][j].layers[k][l].node.state = this.dec.layers[i][j].layers[k][l].node.state
          }
        }

      } else {

        this.dec.layers[i][j].node.state = this.enc.layers[i][j].node.state;

      }
    }
  }
}

Seq2SeqServer.prototype.getNewPair = function () {
  console.log('done!!!')
}

if(module) {
  module.exports = Seq2SeqServer
}
