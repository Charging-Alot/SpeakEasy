var synaptic = require('../synaptic/src/synaptic.js');
var Neuron = require('../synaptic/src/neuron.js')
var Layer = synaptic.Layer;
var Network = synaptic.Network;

  var biases = [
    0,
    0,
    -0.009895327035337687,
    -0.006141480477526787,
    -0.029357955278828743,
    -0.08668609405867755
  ]
  var weights = [
    -0.03437288929708303,
    0.069337324379012,
    -0.006118636578321457,
    0.038851925032213325,
    -0.08829510072246194,
    -0.003387802373617882,
  ]

var layers = [];
layers.push(new Layer(1));
layers.push(new Layer(1));
// layers.push(new Layer(2));

layers[0].list[0].bias = 0;
layers[1].list[0].bias = 0;

layers[0].list[0].project(layers[1].list[0], weights[0]);

var net = new Network({
  input: layers[0],
  output: layers[1]
})

console.log(net.activate([1]));

layers = [];
layers.push(new Layer(2));
layers.push(new Layer(2));
layers.push(new Layer(2));

layers[0].list[0].bias = 0;
layers[0].list[1].bias = 0;

layers[1].list[0].bias = biases[2];
layers[1].list[1].bias = biases[3];

layers[2].list[0].bias = biases[4];
layers[2].list[1].bias = biases[5];

layers[0].list[0].project(layers[1].list[0], weights[0]);
layers[0].list[0].project(layers[1].list[1], weights[1]);
layers[0].list[1].project(layers[1].list[0], weights[2]);
layers[0].list[1].project(layers[1].list[1], weights[3]);
var conn1 = layers[1].list[0].project(layers[2].list[0], weights[4]);
var conn2 = layers[1].list[1].project(layers[2].list[1], weights[5]);

layers[1].list[0].gate(conn1)
layers[1].list[1].gate(conn2)

net = new Network({
  input: layers[0],
  hidden: {
    0: layers[1]
  },
  output: layers[2]
})

console.log(net.layers.input.list[0].activation, net.layers.input.list[1].activation)
console.log(net.layers.hidden[0].list[0].activation, net.layers.hidden[0].list[1].activation)
console.log(net.layers.output.list[0].activation, net.layers.output.list[1].activation)
console.log(net.activate([1,1]))

neurons = []

for(var i = 0; i < 6; ++i) {
  neurons.push(new Neuron)
  neurons[i].bias = biases[i]
}
  neurons[0].project(neurons[2], weights[0])
  neurons[0].project(neurons[3], weights[1])
  neurons[1].project(neurons[2], weights[2])
  neurons[1].project(neurons[3], weights[3])
  var c1 = neurons[2].project(neurons[4], weights[4])
  var c2 = neurons[3].project(neurons[5], weights[5])

  neurons[2].gate(c1);
  neurons[3].gate(c2);

  var activations = [];
  activations[0] = neurons[0].activate(1);
  activations[1] = neurons[1].activate(1);
  activations[2] = neurons[2].activate();
  activations[3] = neurons[3].activate();
  activations[4] = neurons[4].activate();
  activations[5] = neurons[5].activate();

console.log(activations)

var squash = function (x) {
  return 1/(1 + Math.exp(-x))
}

var activations = [1, 1];

var gains = [1, 1, 1, 1, 1, 1];

var states = [0, 0, 0, 0, 0, 0]

activations[2] = squash(biases[2] + activations[0] * weights[0] + gains[0] + activations[1] * weights[2] + gains[2]);
gains[4] = activations[2];
activations[3] = squash(biases[3] + activations[0] * weights[1] + gains[1] + activations[1] * weights[3] + gains[3]);
gains[5] = activations[3];
activations[4] = squash(biases[4] + activations[2] * weights[4] * gains[4])
activations[5] = squash(biases[5] + activations[3] * weights[5] * gains[5])

console.log(activations)

// console.log(squash(1 + 0.3*0.5*0.7 + 0.4*0.6*0.8))

var layers = [];
layers.push(new Layer(1));
layers.push(new Layer(1));
// layers.push(new Layer(2));

layers[0].list[0].bias = 0;
layers[1].list[0].bias = biases[2];

var conn = layers[0].list[0].project(layers[1].list[0], weights[0]);

var net = new Network({
  input: layers[0],
  output: layers[1]
})

// layers[0].list[0].activation = 1;
// layers[1].list[0].activation = 0.4914076236469172;

// net.propagate(0.01, [3]);
layers[0].list[0].activate([1]);
layers[1].list[0].activate();
layers[1].list[0].propagate(0.1, [1])
layers[0].list[0].propagate(0.1)

console.log(conn.weight)
// console.log(layers[0].list[0].bias)
console.log(layers[1].list[0].bias)

// console.log(layers[0].list[0].error.responsibility)
console.log(layers[1].list[0].error.responsibility)
