var synaptic = require('./synaptic/src/synaptic.js');
var trainingData = require('./flashyParsing.js');
// var words = ["What", "dog", "cat", "not", "are", "machine", "?", "you", "am", "i", ".", "know", "<end>", "<start>"]
// var dictionary = {
//   "what": 0,
//   "dog": 1,
//   "cat": 2,
//   "not": 3,
//   "are": 4,
//   "machine": 5,
//   "?": 6,
//   "you": 7,
//   "am": 8,
//   "i": 9,
//   ".": 10,
//   "know": 11,
//   "<end>": 12,
//   "<start>": 13
// };

// var trainingData = [
//   'you am machine .',
//   'i am machine .',
//   'i am cat .',
//   'you am cat .',
//   'he am machine .',
//   'he am machine .',
//   'i am dog .',
//   'you am dog .',
//   'she am machine .',
//   'she am machine .',
// ];

// var trainingData2 = ["I am cat .",
//   "you are cat .",
//   "i am dog .",
//   "you are dog .",
//   "what am I ?",
//   "i not know .",
//   "what are you ?",
//   "i am machine .",
//   "i am cat. What am I ?",
//   "you are cat .",
//   "i am dog. What am I ?",
//   "you are dog .",
//   "what am I ?",
//   "you are dog .",
//   "i am not cat .",
//   "you are dog .",
//   "i am not dog .",
//   "you are cat .",
//   "what am I ?",
//   "you are cat ."
// ];

// trainingData = trainingData.concat(trainingData2);

// var trainingData = ['I am tall',
//                       'I am short',
//                       'the sky is blue',
//                       'the moon is round']


console.log(trainingData.length, 'length');

var shuf = function(trainingData) {
  var collection = [];
  for (var j = 0; j < trainingData.length; j++) {
    if (j % 2 === 0) {
      collection.push([trainingData[j], trainingData[j + 1]]);
    }
  }

  for (var i = 0; i < collection.length; i += 1) {
    var temp = collection[i];
    var next = Math.floor(Math.random() * collection.length)
    collection[i] = collection[next];
    collection[next] = temp;
  }

  var res = [];
  for (var k = 0; k < collection.length; k++) {
    res = res.concat(collection[k]);
  }

  return res;
}

var words = [];
var dictionary = {};


for (var i = 0; i < trainingData.length; i++) {
  var sentence = trainingData[i].split(' ');
  for (var j = 0; j < sentence.length; j++) {
    if (!dictionary[sentence[j]]) {
      words.push(sentence[j]);
      dictionary[sentence[j]] = words.length - 1;
    }
  }
}
words.push('<start>');
dictionary['<start>'] = words.length - 1;
words.push('<end>');
dictionary['<end>'] = words.length - 1;

var puncs = ["!", ",", "?", "."];

var network = new synaptic.Architect.LSTM(words.length, words.length, words.length);
console.log('Built network!! HURRAY FOR US')

var allZeros = []
for (var i = 0; i < words.length; i++) {
  allZeros.push(0);
}

function vectorBuilder(sentence, isRes) {
  // puncs.forEach(function(puncy) {
  //   var idx = sentence.indexOf(puncy);
  //   if (idx !== -1) {
  //     sentence = sentence.slice(0, idx) + ' ' + sentence.slice(idx);
  //   }
  // });
  if (isRes) {
    sentence = '<start> ' + sentence + ' <end>';
  }
  var result = [];
  var newSentence = sentence.split(" ");
  for (var i = 0; i < newSentence.length; i++) {
    var vector = allZeros.slice();
    vector[dictionary[newSentence[i]]] = 1;
    result.push(vector);
  }
  // result.push(dictionary['<start>']);
  return result;
};

var averageOfArr = function(array) {
  var result = 0;
  for (var i = 0; i < array.length; i++) {
    result += array[i];
  }
  return result / array.length;
}

var trainCollection = function(trainingRate, trainingData) {
  trainingData = shuf(trainingData);
  for (var i = 0; i < trainingData.length; i += 2) {
    var call = trainingData[i];
    var response = trainingData[i + 1];
    counter = 0;
    // do {
    trainCalRes(call, response, trainingRate);
    // } while(++counter < 10)//averageOfArr(network.layers.output.getErrors()) >= 0.1);
    // console.log(averageOfArr(network.layers.output.getErrors()))
  }
}

var indexToInputVector = function(sentenceVector) {
  var resArr = []
  for (var i = 0; i < sentenceVector.length; i++) {
    var inputVector = allZeros.slice();
    inputVector[sentenceVector[i]] = 1;
    resArr.push(inputVector);
  }
  return resArr;
}

var matSub = function(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    console.log('I CAN"T MATH');
    return null;
  } else {
    var resVec = [];
    for (var i = 0; i < vec1.length; i++) {
      resVec.push(vec1[i] - vec2[i]);
    }
    return resVec;
  }
}

var activateSequence = function(vectorArr) {
  var outputs = []
  for (var i = 0; i < vectorArr.length; i++) {
    var output = network.activate(vectorArr[i])
    outputs.push(output);
  }
  return outputs
}

var trainCalRes = function(call, response, rate) {
  var callVects = vectorBuilder(call, false);
  var resVects = vectorBuilder(response, true);
  for (var i = 0; i < resVects.length - 1; i++) {
    activateSequence(callVects);

    var outputs = activateSequence(resVects.slice(0, i));

    var output = network.activate(resVects[i]);
    network.propagate(rate, resVects[i + 1]);

    for (var x = i - 1; x >= 0; x--) {
      var guess = matSub(outputs[x], network.getErrors());
      network.propagate(rate / 2, guess);
    }
  }
}

function translate(vector) {
  var val = Math.max.apply(null, vector);
  var index = vector.indexOf(val);
  if (index !== -1) {
    return words[index];
  } else {
    return 'holy fuck what did we do?';
  }
}

function translateArr(vecArr) {
  resArr = [];
  for (var i = 0; i < vecArr.length; i++) {
    resArr.push(translate(vecArr[i]))
  }
  console.log(resArr);
  return resArr;
}

var respond = function(call) {
  callVects = vectorBuilder(call, false);

  var resArr = [];

  activateSequence(callVects);

  var output = network.activate(vectorBuilder('<start>', false)[0])

  resArr.push(translate(output));

  var counter = 0;

  while (translate(output) !== '<end>' && counter <= 20) {
    var input = output;
    output = network.activate(input);
    resArr.push(translate(output));
    counter++;
  }

  return resArr.join(' ');

}

var testResponse = function(trainingData) {
  for (var i = 0; i < trainingData.length; i += 2) {
    console.log(trainingData[i])
    console.log(respond(trainingData[i]))
  }
}

var rate = 0.0001
for (var y = 0; y < 2000; y++) {
  trainCollection(rate, trainingData);
  if (y > 5) {
    rate *= .99
  }
  if (y % 10 === 0 || y === 0) {
    fs.writeFile('./Dec3_' + y / 10 + '.txt', network.toJSON(), function(err, callback) {
      console.log('YAY!');
      console.log(y);
    });
  }
}
console.log('WE ARE FINISHED NOW.')

// testResponse(trainingData);
