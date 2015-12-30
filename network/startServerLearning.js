var Mother = require('MotherConstructor.js');

var makeLSTMServer = function (send) {
  var mother = new Mother(null, send)

  mother.model = LSTMNetwork([768, 768, 768, 768, 768]);

  return mother;
}


