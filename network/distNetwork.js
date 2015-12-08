var LSTM = require('./synaptic/src/synaptic.js').Architect.LSTM;
var trainingData = require('./flashyParsing.js');

//i, h, 0 => # input nodes, # hidden nodes, # output nodes
var BigNetwork = function (arrayOfWords, numHidden) {
  this.size = arrayOfWords.length;
  this.pieces = numHidden;
  var allZeros = initZeros();
  this.dictionary = makeDictionaryFromArray(arrayOfWords);
  this.pieces = [];
  var NetworkPiece = function () {
    this = LSTM(size, 1, size);
  }
  var forPieces = function (fn) {
    for(var i = 0; i < this.pieces; i++) {
      fn.apply(Array.prototype.slice().call(args, 1));
    }
  }
  forPieces(function () {
    pieces.push(new NetworkPiece());
  });


  //Conversion functions from text to vector
  var initZeros = function () {
    var allZeros = []
    for (var i = 0; i < size; ++i) {
      allZeros.push(0);
    }
  }

  this.makeDictionaryFromArray = function () {
    var this.dictionary = {};
    for(var i = 0; i < size; ++i) {
      this.dictionary[arrayOfWords[i]] = allZeros.slice();
      this.dictionary[arrayOfWords[i]][i] = 1;
    }
    return this.dictionary;
  }

  function vectorList(sentence, isRes) {
    if (isRes) {
      sentence = '<start> ' + sentence + ' <end>';
    }
    var result = [];
    var sequenceOfWords = sentence.split(" ");
    for (var i = 0; i < sequenceOfWords.length; ++i) {
      result.push(this.dictionary[sequenceOfWords[i]]);
    }
    // result.push(dictionary['<start>']);
    return result;
  };
}
