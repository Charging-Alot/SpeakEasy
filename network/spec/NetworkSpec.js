var debugMode = false;
describe('Neuron Constructor', function () {
  it('when not provided input should create a neuron with the correct fields', function () {
    var n = new Neuron;
    expect(n.node).to.eql({});
    expect(n.gatedNodes).to.eql({});
    expect(n.connections.inputs).to.eql([]);
    expect(n.connections.outputs).to.eql([]);
    expect(n.connections.gated).to.eql([]);
  });
  it('when provided input, should initialize all inputs provided', function () {
    var n = new Neuron({
      node: {
        id: 1
      },
      connections: {
        inputs: [
          {
            id: 2
          },
          {
            id:3
          }
        ],
        outputs: [
          {
            id: 4
          }
        ]
      },
    })
    expect(n.node.id).to.eql(1);
    expect(n.connections.inputs[0].id).to.eql(2);
    expect(n.connections.inputs[1].id).to.eql(3);
    expect(n.connections.inputs[2]).to.eql(undefined);
    expect(n.connections.outputs[0].id).to.eql(4);
    expect(n.connections.outputs[1]).to.eql(undefined);
    expect(n.connections.gated).to.eql([]);
    expect(n.gatedNodes).to.eql({})
    n = new Neuron({
      gatedNodes: {
        3: {
          id:1
        }
      }
    })
    expect(n.gatedNodes[3].id).to.eql(1);
    expect(n.node).to.eql({})
  });
  it('when update is called, replaces all properties in the input, and no others', function () {
    var n = new Neuron()
    n.node.id = 5;
    n.node.layerId = 0;
    n.connections.inputs.push({id:7}, {id:12})
    n.connections.outputs.push({id:3})
    n.update({
      node: {
        id: 4
      },
      connections: {
        inputs: [
          {weight: 0.3},
          {weight: 0.5}
        ]
      }
    })
    expect(n.node.id).to.eql(4)
    expect(n.node.layerId).to.eql(0)
    expect(n.connections.inputs[0].id).to.eql(7)
    expect(n.connections.inputs[1].id).to.eql(12)
    expect(n.connections.inputs[0].weight).to.eql(0.3)
    expect(n.connections.inputs[1].weight).to.eql(0.5)
    expect(n.connections.outputs[0].id).to.eql(3)
    expect(n.connections.outputs[0].weight).to.eql(undefined)
  });
})

describe('Pleb Constructor', function () {
  it('on update, should initialize a completely new neuron without any old values.', function () {
    var neurons = {
      activationStep: {
        node: {
          state: 1
        },
        connections: {
          inputs: [
            {
              id:0,
              weight: 0.3,
              gain: 0.5,
              activation: 0.7
            },
            {
              id:1,
              weight: 0.4,
              gain:0.6,
              activation: 0.8
            }
          ]
        }
      },
      influenceStep: {
        node: {
          id: 1,
          layerId: 2
        },
        connections: {
          gated: [
            {
              toNodeId: 1,
              toLayerId: 3,
              weight: 0.78,
              activation: 0.7
            },
            {
              toNodeId: 1,
              toLayerId: 3,
              weight: 0.2,
              activation:0.5
            }
          ]
        },
        gatedNodes: {
          1: {
            id: 1,
            layerId: 3,
            prevState: 0.8,
            selfConnection: {
              gateId: 1,
              gateLayer: 2,
              wieght: 0.67,
              gain: 0.4,
            }
          }
        }
      },
      ElegibilityStep: {
        node: {
          elegibilities: [
            0.3,
            0.4
          ],
          selfConnection: {
            weight: 0.5,
            gain: 0.1
          }
        },
        connections : {
          inputs: [
            {
              id:5,
              activation: 0.8,
              gain: 0.3 
            },
            {
              id:9,
              activation: 0.43,
              gain: 0.44
            }
          ]
        }
      },
      extendedElegibilityStep: {
        node:{
          derivative:0.9,
          elegibilities: [
            0.3,
            0.6
          ],
          extendedElegibilities: {
            1: [.3, .4]
          }
        },
        gatedNodes: {
          1: {
            selfConnection: {
              weight: 0.2,
              gain: 0.5
            },
            influence: 3
          }
        }
      }
    }
    var n = new Pleb(undefined, function (toLevel, obj) {
      console.log('sent: ', obj, ' to: ', toLevel)
    });
    var freshNeuron;
    for(var i in neurons) {
      n.update('derp', null, neurons.activationStep);
      freshNeuron = new Neuron(neurons.activationStep);
      expect(n.node).to.eql(freshNeuron.node);
      expect(n.connections).to.eql(freshNeuron.connections);
      expect(n.gatedNodes).to.eql(freshNeuron.gatedNodes);
    }
  });
  it('on activationStep, should send an object containing the correct state, activation and derivative', function () {
    var n = new Pleb({
      node: {
        state: 1
      },
      connections: {
        inputs: [
          {
            id:0,
            weight: 0.3,
            gateNode : {
              activation: 0.7,
            },
            fromNode : {
              activation: 0.5,
            }
          },
          {
            id:1,
            weight: 0.4,
            gateNode : {
              activation: 0.8,
            },
            fromNode : {
              activation: 0.6,
            }
          }
        ]
      },
    }, function (toLevel, taskObj) {
      expect(taskObj.value.node.state).to.eql(1.297);
      expect(taskObj.value.node.activation).to.eql(0.785329655012861);
      expect(taskObj.value.node.derivative).to.eql(0.16858698797024174);
    });
    n.activationStep();
  });
  it('on influenceStep, should send an object containing the correct influence for each gated node', function () {
    var n = new Pleb({
        node: {
          id: 1,
          layerId: 2
        },
        connections: {
          gated: [
            {
              toNodeId: 1,
              toLayerId: 3,
              weight: 0.78,
              fromNode: {
                activation: 0.7
              },
              toNode: {
                id: 1,
                layerId: 3,
                prevState: 0.8,
                selfConnection: {
                  gateId: 1,
                  gateLayer: 2,
                  wieght: 0.67,
                  gain: 0.4,
                }
              }
            },
            {
              toNodeId: 1,
              toLayerId: 3,
              weight: 0.2,
              fromNode: {
                activation:0.5
              },
              toNode: {
                id: 1,
                layerId: 3,
                prevState: 0.8,
                selfConnection: {
                  gateId: 1,
                  gateLayer: 2,
                  wieght: 0.67,
                  gain: 0.4,
                }
              }
            }
          ]
        },
        gatedNodes: {
          1: {
            id: 1,
            layerId: 3,
            prevState: 0.8,
            selfConnection: {
              gateId: 1,
              gateLayer: 2,
              wieght: 0.67,
              gain: 0.4,
            }
          }
        }
    }, function (toLevel, taskObj) {
      expect(taskObj.value.node.influences[1]).to.eql(0.8 + 0.78*0.7 + 0.2*0.5)
    })
    n.influenceStep();
  });
  it('on elegibilityStep, should send an object containing the correct elegibility for each input connection', function () {
    var n = new Pleb({
      node: {
        elegibilities: [
          0.3,
          0.4
        ],
        selfConnection: {
          weight: 0.5,
          gateNode: {
            activation: 0.1
          }
        }
      },
      connections : {
        inputs: [
          {
            id:5,
            fromNode: {
              activation: 0.8,
            },
            gateNode: {
              activation: 0.3 
            }
          },
          {
            id:9,
            fromNode: {
              activation: 0.43,
            },
            gateNode: {
              activation: 0.44
            }
          }
        ]
      },
    }, function (toLevel, taskObj) {
      var el0 = 0.3*0.5*0.1 + 0.8*0.3;
      var el1 = 0.4*0.5*0.1 + 0.43*0.44;
      expect(taskObj.value.node.elegibilities).to.eql([el0, el1])
    })
    n.elegibilityStep();
  });
  it('on extendedElegibilityStep, should send an object containing, the correct elegibilities for every input connection for every gated Node', function () {
    var n = new Pleb({
      node:{
        derivative:0.9,
        elegibilities: [
          0.3,
          0.6
        ],
        influences: {
          1: 3
        },
        extendedElegibilities: {
          1: [0.3, 0.4]
        }
      },
      gatedNodes: {
        1: {
          selfConnection: {
            weight: 0.2,
            gateNode: {
              activation: 0.5
            }
          },
        }
      }
    }, function (toLayerId, taskObj) {
      var exEl0 = 0.3 * 0.2 * 0.5 + 0.9 * 0.3 * 3;
      var exEl1 = 0.4 * 0.2 * 0.5 + 0.9 * 0.6 * 3;
      expect(taskObj.value.node.extendedElegibilities[1]).to.eql([exEl0, exEl1])
    });
    n.extendedElegibilityStep(1)
  });
  it('on projectedErrorStep, should send an object containing the correct projected Error', function () {
    var sentSomething = false;
    var n = new Pleb({
      node: {
        derivative: 37
      },
      connections: {
        outputs: [
          {
            toNode: {
              errorResponsibility: 4,
            },
            gateNode: {
              activation: 90,
            },
            weight: 1000
          },
          {
            toNode: {
              errorResponsibility: 20,
            },
            gateNode: {
              activation: 21,
            },
            weight: 23
          }
        ]
      }
    }, function (toLevel, taskObj) {
      sentSomething = true;
      if(taskObj.command === 'projectedErrorStep') {
        expect(taskObj.value.node.errorProjected).to.eql((4*90*1000 + 20*21*23) * 37)
      } else {
        expect('YOUR KUNGFU IS WEAK').to.eql(true)
      }
    })
    n.run('projectedErrorStep', 4317982489724);
    expect(sentSomething).to.eql(true)
  })
  it('on gatedErrorStep, should send an object containing the correct gated error', function () {
    var sentSomething = false;
    var n = new Pleb({
      node: {
        id: 1,
        layerId: 1,
        derivative: 42
      },
      connections: {
        gated: [
          {
            toNodeId: 3,
            weight: 76,
            fromNode: {
              activation: 67
            }
          },
          {
            toNodeId: 4,
            weight: 83,
            fromNode: {
              activation: 32
            }
          }
        ]
      },
      gatedNodes: {
        3: {
          id: 3,
          prevState: 65,
          selfConnection: {
            gateId: 1,
            gateLayerId: 1
          },
          errorResponsibility: 34
        },
        4: {
          id: 4,
          prevState: 2,
          selfConnection: {
            gateId: 3,
            gateLayerId: 6
          },
          errorResponsibility: 23
        }
      }
    }, function (toLevel, taskObj) {
      sentSomething = true
      expect(taskObj.command).to.eql('gatedErrorStep')
      expect(taskObj.value.node.errorGated).to.eql(((65+76*67)*34 + 83*32*23)*42 )
    })
    n.run('gatedErrorStep', null);
    expect(sentSomething).to.eql(true)
  })
  it('on learningStep, should send an object containing the correct weights for each input connection', function () {
    var sentSomething = false;
    var n = new Pleb({
      rate: 62,
      maxGradient: 1000000000,
      node: {
        errorProjected: 76,
        errorResponsibility: 82,
        elegibilities: [
          3,
          94
        ],
        extendedElegibilities: {
          1: [56, 43]
        }
      },
      connections: {
        inputs: [
          {
            trainable: true,
            weight: 5,
          },
          {
            trainable: true,
            weight: 7,
          }
        ]
      },
      gatedNodes: {
        1: {
          errorResponsibility: 9
        }
      }
    }, function (toLevel, taskObj) {
      sentSomething = true;
      expect(taskObj.command).to.eql('learningStep')
      var gradient = Math.min(n.maxGradient, 76  * 3 + 9 * 56);
      expect(taskObj.value.connections.inputs[0].weight).to.eql(5 + gradient*62)
      gradient = Math.min(n.maxGradient, 76 * 94 + 9 * 43);
      expect(taskObj.value.connections.inputs[1].weight).to.eql(7 + gradient*62)
    })
    n.run('learningStep');
    expect(sentSomething).to.eql(true);
  })
  it('as above on learning step, but includes correct behavior with stricter gradient clipping', function () {
    var sentSomething = false;
    var n = new Pleb({
      rate: 62,
      maxGradient: 5,
      node: {
        errorProjected: 76,
        errorResponsibility: 82,
        elegibilities: [
          3,
          94
        ],
        extendedElegibilities: {
          1: [56, 43]
        }
      },
      connections: {
        inputs: [
          {
            trainable: true,
            weight: 5,
          },
          {
            trainable: true,
            weight: 7,
          }
        ]
      },
      gatedNodes: {
        1: {
          errorResponsibility: 9
        }
      }
    }, function (toLevel, taskObj) {
      sentSomething = true;
      expect(taskObj.command).to.eql('learningStep')
      var gradient = Math.min(n.maxGradient, 76  * 3 + 9 * 56);
      expect(taskObj.value.connections.inputs[0].weight).to.eql(5 + gradient*62)
      gradient = Math.min(n.maxGradient, 76 * 94 + 9 * 43);
      expect(taskObj.value.connections.inputs[1].weight).to.eql(7 + gradient*62)
    })
    n.run('learningStep');
    expect(sentSomething).to.eql(true);
  })
  it('should run the right command when a well formed taskObj is recieved by the io handler', function () {
    n = new Pleb({
      node:{
        derivative:0.9,
        elegibilities: [
          0.3,
          0.6
        ],
        extendedElegibilities: {
          1: [0.3, 0.4]
        }
      },
      gatedNodes: {
        1: {
          selfConnection: {
            weight: 0.2,
            gain: 0.5
          },
          influence: 3
        }
      }
    }, function (toLayerId, taskObj) {
    });
    var activated = false;
    n.activationStep = function () {
      activated = true;
    }
    n.toManager.addToIn({command: 'activationStep', section: 1, value: 3});
    expect(activated).to.eql(true)
  })
})

describe('manager Constructor', function () {
  it('on update, with a command of "activate" or "backPropagate", should create a completely new neuron', function () {
    var testUpdate = function (command) {
      var n = new Manager({
        node: {
          id:0
        },
        connections: {
          inputs: [
            {id: 1},
            {id: 2}
          ],
          outputs:[
            {id: 3}
          ],
          gated: [
            {id: 4}
          ]
        },
        gatedNodes: {
          5: {id: 5}
        }
      }, function () {});
      n.update(command, 3, {
        node: {
          id: 6
        },
        connections: {
          inputs: [
            {id: 7}
          ],
          outputs: [
            {id: 8},
            {id: 9}
          ],
          gated: [

          ]
        },
        gatedNodes:{
          10: {id: 10}
        }
      })
      expect(n.model.node.id).to.eql(6)
      expect(n.model.connections.inputs[0].id).to.eql(7)
      expect(n.model.connections.inputs[1]).to.eql(undefined)
      expect(n.model.connections.outputs[0].id).to.eql(8)
      expect(n.model.connections.outputs[1].id).to.eql(9)
      expect(n.model.connections.gated[5]).to.eql(undefined)
      expect(n.model.gatedNodes[10].id).to.eql(10)
      expect(n.model.gatedNodes[5]).to.eql(undefined)
    }
    testUpdate('activate')
    testUpdate('backPropagate')
  })

  it('on update, with any other command, should only change the values associated with that command', function () {
    var testUpdate = function (command) {
      var n = new Manager({
        node: {
          id:0
        },
        connections: {
          inputs: [
            {id: 1},
            {id: 2}
          ],
          outputs:[
            {id: 3}
          ],
          gated: [
            {id: 4}
          ]
        },
        gatedNodes: {
          5: {id: 5}
        }
      }, function () {});
      n.update(command, 3, {
        node: {
          id: 6,
          layerId:11
        },
        connections: {
          inputs: [
            {id: 7}
          ],
          outputs: [
            {id: 8},
            {id: 9}
          ],
          gated: [

          ]
        },
        gatedNodes:{
          10: {id: 10}
        }
      })
      expect(n.model.node.id).to.eql(6)
      expect(n.model.node.layerId).to.eql(11)
      expect(n.model.connections.inputs[0].id).to.eql(7)
      expect(n.model.connections.inputs[1].id).to.eql(2)
      expect(n.model.connections.outputs[0].id).to.eql(8)
      expect(n.model.connections.outputs[1].id).to.eql(9)
      expect(n.model.connections.gated[0].id).to.eql(4)
      expect(n.model.gatedNodes[10].id).to.eql(10)
      expect(n.model.gatedNodes[5].id).to.eql(5)
    }
    testUpdate('sfeyvbevbe')
  })

  it('on activate, should queue and send correct information to plebs, after should send updated model to mother', function () {
    var n = new Manager({
      node: {
        id: 0,
        layerId: 1,
        state: 2,
        bias: 2.5,
        prevState: 3,
        activation: 4,
        selfConnection: {weight: 5, gain: 6, gateId: 0, gateLayer: 0},
        elegibilities: [7, 8],
        extendedElegibilities: {
          9: [10, 11],
          12: [13, 14]
        },
        influences: {
          9: 100,
          12: 1000,
        }
      },
      connections: {
        inputs: [
          {
            id: 15,
            toNodeId: 16,
            toLayerId: 17,
            fromNodeId: 18,
            fromLayerId: 19,
            gatNodeId: 20,
            gateLayerId: 21,
            activation: 22,
            gain: 23,
            weight: 24
          }
        ],
        outputs: [
          {
            id: 25,
            toNodeId: 26,
            toLayerId: 27,
            fromNodeId: 28,
            fromLayerId: 29,
            gatNodeId: 30,
            gateLayerId: 31,
            activation: 32,
            gain: 33,
            weight: 34
          }
        ],
        gated: [
          {
            id: 45,
            toNodeId: 9,
            toLayerId: 47,
            fromNodeId: 48,
            fromLayerId: 49,
            gatNodeId: 50,
            gateLayerId: 51,
            activation: 52,
            gain: 53,
            weight: 54
          },
          {
            id: 55,
            toNodeId: 12,
            toLayerId: 57,
            fromNodeId: 58,
            fromLayerId: 59,
            gatNodeId: 60,
            gateLayerId: 61,
            activation: 62,
            gain: 63,
            weight: 64
          }
        ]
      },
      gatedNodes: {
        9: {
          id: 9,
          layerId: 47,
          state: 65,
          prevState: 66,
          activation: 67,
          selfConnection: {weight: 68, gain: 69, gateId: 0, gateLayer: 1},
          elegibilities: [70, 71],
          extendedElegibilities: {
          }
        },
        12: {
          id: 9,
          layerId: 57,
          state: 72,
          prevState: 73,
          activation: 74,
          selfConnection: {weight: 75, gain: 76, gateId: 0, gateLayer: 1},
          elegibilities: [75, 76],
          extendedElegibilities: {
          }
        }
      }
    }, function (toLevel, taskObj) {
      counter++;
      if(taskObj.command === 'activationStep') {
        expect(taskObj.value.node.state).to.eql(n.model.node.state);
        expect(taskObj.value.connections.inputs).to.eql(n.model.connections.inputs);
        n.toPleb.addToIn(taskObj) //just to trigger callback
      } else if (taskObj.command === 'influenceStep') {
        expect(taskObj.value.node.id).to.eql(n.model.node.id);
        expect(taskObj.value.node.layerId).to.eql(n.model.node.layerId);
        expect(taskObj.value.gatedNodes).to.eql(n.model.gatedNodes);
        expect(taskObj.value.connections.gated).to.eql(n.model.connections.gated);
        n.toPleb.addToIn(taskObj) //just to trigger callback
      } else if (taskObj.command === 'elegibilityStep') {
        expect(taskObj.value.node.elegibilities).to.eql(n.model.node.elegibilities);
        expect(taskObj.value.node.selfConnection).to.eql(n.model.node.selfConnection);
        expect(taskObj.value.connections.inputs).to.eql(n.model.connections.inputs);
        n.toPleb.addToIn(taskObj) //just to trigger callback
      } else if (taskObj.command === 'extendedElegibilityStep') {
        expect(taskObj.value.node.extendedElegibilities[taskObj.section]).to.eql(n.model.node.extendedElegibilities[taskObj.section])
        expect(taskObj.value.gatedNodes[taskObj.section]).to.eql(n.model.gatedNodes[taskObj.section])
        expect(taskObj.value.node.derivative).to.eql(n.model.node.derivative);
        expect(taskObj.value.node.elegibilities).to.eql(n.model.node.elegibilities);
        n.toPleb.addToIn(taskObj) //just to trigger callback
      } else if (taskObj.command === 'activate'){
        expect(taskObj.value.node.state).to.eql(n.model.node.state);
        expect(taskObj.value.node.activation).to.eql(n.model.node.activation);
        expect(taskObj.value.node.derivative).to.eql(n.model.node.derivative);
      } else {
        expect('YOUR KUNGFU IS WEAK').to.eql(true);
      }
    })
    var counter = 0;
    n.activate();
    expect(counter).to.eql(6);
  })

  it('the same but for backPropagation', function () {
    var n = new Manager({
      rate: 500,
      maxGradient: 20,
      node: {
        id: 0,
        layerId: 1,
        state: 2,
        bias: 2.5,
        prevState: 3,
        activation: 4,
        selfConnection: {weight: 5, gain: 6, gateId: 0, gateLayer: 0},
        elegibilities: [7, 8],
        extendedElegibilities: {
          9: [10, 11],
          12: [13, 14]
        },
        influences: {
          9: 100,
          12: 1000,
        }
      },
      connections: {
        inputs: [
          {
            id: 15,
            toNodeId: 16,
            toLayerId: 17,
            fromNodeId: 18,
            fromLayerId: 19,
            gatNodeId: 20,
            gateLayerId: 21,
            activation: 22,
            gain: 23,
            weight: 24
          }
        ],
        outputs: [
          {
            id: 25,
            toNodeId: 26,
            toLayerId: 27,
            fromNodeId: 28,
            fromLayerId: 29,
            gatNodeId: 30,
            gateLayerId: 31,
            activation: 32,
            gain: 33,
            weight: 34
          }
        ],
        gated: [
          {
            id: 45,
            toNodeId: 9,
            toLayerId: 47,
            fromNodeId: 48,
            fromLayerId: 49,
            gatNodeId: 50,
            gateLayerId: 51,
            activation: 52,
            gain: 53,
            weight: 54
          },
          {
            id: 55,
            toNodeId: 12,
            toLayerId: 57,
            fromNodeId: 58,
            fromLayerId: 59,
            gatNodeId: 60,
            gateLayerId: 61,
            activation: 62,
            gain: 63,
            weight: 64
          }
        ]
      },
      gatedNodes: {
        9: {
          id: 9,
          layerId: 47,
          state: 65,
          prevState: 66,
          activation: 67,
          selfConnection: {weight: 68, gain: 69, gateNodeId: 0, gateLayerId: 1},
          elegibilities: [70, 71],
          extendedElegibilities: {
          }
        },
        12: {
          id: 9,
          layerId: 57,
          state: 72,
          prevState: 73,
          activation: 74,
          selfConnection: {weight: 75, gain: 76, gateNodeId: 0, gateLayerId: 1},
          elegibilities: [75, 76],
          extendedElegibilities: {
          }
        }
      }
    }, function (toLevel, taskObj) {
      counter++;
      if(taskObj.command === 'projectedErrorStep') {
        // console.log('projectedErrorStep')
        expect(taskObj.value.node.derivative).to.eql(n.model.node.derivative);
        expect(taskObj.value.connections.outputs).to.eql(n.model.connections.outputs);
        n.toPleb.addToIn(taskObj) //just to trigger callback
      } else if (taskObj.command === 'gatedErrorStep') {
        // console.log('gatedErrorStep')
        expect(taskObj.value.node.id).to.eql(n.model.node.id);
        expect(taskObj.value.node.layerId).to.eql(n.model.node.layerId);
        expect(taskObj.value.node.derivative).to.eql(n.model.node.derivative);
        expect(taskObj.value.gatedNodes).to.eql(n.model.gatedNodes);
        expect(taskObj.value.connections.gated).to.eql(n.model.connections.gated);
        n.toPleb.addToIn(taskObj) //just to trigger callback
      } else if (taskObj.command === 'learningStep') {
        // console.log('learningStep')
        expect(taskObj.value.node.elegibilities).to.eql(n.model.node.elegibilities);
        expect(taskObj.value.node.extendedElegibilities).to.eql(n.model.node.extendedElegibilities);
        expect(taskObj.value.node.errorProjected).to.eql(n.model.node.errorProjected);
        expect(taskObj.value.rate).to.eql(n.model.rate);
        expect(taskObj.value.maxGradient).to.eql(n.model.maxGradient);
        expect(taskObj.value.gatedNodes).to.eql(n.model.gatedNodes);
        expect(taskObj.value.connections.inputs).to.eql(n.model.connections.inputs);
        n.toPleb.addToIn(taskObj) //just to trigger callback
      }  else if (taskObj.command === 'backPropagate'){
        // console.log('backPropagate')
        var i = 0
        // console.log(i++)
        expect(taskObj.value.node.id).to.eql(n.model.node.id)
        // console.log(i++)
        expect(taskObj.value.node.layerId).to.eql(n.model.node.layerId);
        // console.log(i++)
        expect(taskObj.value.node.errorProjected).to.eql(n.model.node.errorProjected);
        // console.log(i++)
        expect(taskObj.value.node.errorResponsibility).to.eql(n.model.node.errorResponsibility);
        // console.log(i++)
        expect(taskObj.value.node.errorGated).to.eql(n.model.node.errorGated);
        // console.log(i++)
        expect(taskObj.value.connections.inputs).to.eql(n.model.connections.inputs);
        // console.log(i++)
        // expect(taskObj.value.connections.outputs).to.eql(n.model.connections.outputs)
        // console.log(i++)
      } else {
        expect('YOUR KUNGFU IS WEAK').to.eql(true);
      }
    })
    var counter = 0;
    n.backPropagate();
    expect(counter).to.eql(4);
  })
})

describe('Mother Constructor', function () {
  it('Node Factory creates a valid node', function () {
    var n = Node(1,2);
    expect(n.id).to.eql(2)
    expect(n.layerId).to.eql(1)
    expect(n.state).to.eql(0)
    expect(n.prevState).to.eql(0)
    expect(n.activation).to.eql(0)

    expect(n.selfConnection.gateNodeId).to.eql(-1)
    expect(n.selfConnection.gateLayerId).to.eql(-1)
    expect(n.selfConnection.weight).to.eql(0)
    expect(n.selfConnection.gain).to.eql(1)

    expect(typeof n.bias).to.eql('number')
  })

  it('Connection Factory creates a valid connection', function () {
    var m = new Mother(function () {})
    m.nodes = [{}, {id: 1, nodes: [{id: 0, layerId: 1}]}, {id: 2, nodes: [{}, {}, {}, {}, {id: 4, layerId: 2}]}]
    m.connections = [[], [[], [], [{}, {}, {}]]]
    var c = Connection(3, m.nodes[1].nodes[0], m.nodes[2].nodes[4]);
    expect(c.id).to.eql(3);
    expect(c.toLayerId).to.eql(1);
    expect(c.toNodeId).to.eql(0);
    expect(c.fromLayerId).to.eql(2);
    expect(c.fromNodeId).to.eql(4);
    expect(c.gateNodeId).to.eql(-1);
    expect(c.gateLayerId).to.eql(-1);
    expect(c.toNode).to.eql(m.nodes[1].nodes[0])
    expect(c.fromNode).to.eql(m.nodes[2].nodes[4])
    expect(c.gateNode).to.eql(null)
    expect(typeof c.weight).to.eql('number')
  })

  it('createAllNodesInLayer should create a layer object with an id and an array of nodes', function () {
    var l = Network.prototype.createAllNodesInLayer(3, 2) 
    expect(l.id).to.eql(3);
    expect(l.nodes.length).to.eql(2);
    expect(typeof l.nodes[0].bias).to.eql('number');
    expect(typeof l.nodes[1].bias).to.eql('number');
  })

  it('joinNodes should add a connection to the correct layer that points at the correct nodes', function () {
    var m = new Mother(null, function () {});
    m.model.appendNodeLayer(1);
    m.model.appendNodeLayer(1);
    m.model.appendNodeLayer(2);
    m.model.joinNodes(m.model.nodes[1].nodes[0], m.model.nodes[2].nodes[1])
    var c = m.model.connections.internal[2][1][0];
    expect(c.id).to.eql(0)
    expect(c.toNodeId).to.eql(1)
    expect(c.toLayerId).to.eql(2)
    expect(c.fromNodeId).to.eql(0)
    expect(c.fromLayerId).to.eql(1)
  })

  it('joinNodes should update the nodes selfConnection when a node is joined to itself', function () {
    var m = new Mother(null, function () {})
    m.model.appendNodeLayer(1);
    var n = m.model.nodes[0].nodes[0];
    m.model.joinNodes(n, n);
    expect(n.selfConnection.id !== undefined).to.eql(true);
    expect(n.selfConnection.weight).to.eql(1);
  })

  it('joinLayers, when allToAll is set to true, should create valid connections from all nodes in the first layer to all nodes in the second layer', function () {
    var m = new Mother(null, function () {})
    m.model.appendNodeLayer(2);
    m.model.appendNodeLayer(2);
    m.model.joinLayers(m.model.nodes[0], m.model.nodes[1], true);
    var connections = m.model.connections.internal[1][0];
    expect(connections.length).to.eql(4);
    var expected = {
      0: {
        0: false,
        1: false
      },
      1: {
        0: false,
        1: false
      }
    }
    for(var i = 0; i < connections.length; ++i) {
      var conn = connections[i]
      expect(conn.toLayerId).to.eql(1)
      expect(conn.fromLayerId).to.eql(0)
      expect(expected[conn.toNodeId][conn.fromNodeId]).to.eql(false)
      expected[conn.toNodeId][conn.fromNodeId] = true;
    }
    expect(expected[0][0] && expected[0][1] && expected[1][0] && expected[1][1]).to.eql(true)
  })

  it('joinLayers, when allToAll is set to false, should create valid connections between all nodes with the same index in each layer', function () {
    var m = new Mother(null, function () {});
    m.model.appendNodeLayer(2);
    m.model.appendNodeLayer(2);
    m.model.joinLayers(m.model.nodes[0], m.model.nodes[1], false);
    var connections = m.model.connections.internal[1][0];
    expect(connections.length).to.eql(2);
    for(var i = 0; i < connections.length; ++i) {
      var conn = connections[i]
      expect(conn.toLayerId).to.eql(1)
      expect(conn.fromLayerId).to.eql(0)
      expect(connections[0].toNodeId === connections[0].fromNodeId).to.eql(true)
    }
  })

  it("gateConnection should update connection with the gating node's infromation", function () {
    var m = new Mother(null, function () {});
    m.model.appendNodeLayer(1)
    m.model.appendNodeLayer(1)
    m.model.appendNodeLayer(1)
    m.model.joinLayers(m.model.nodes[0], m.model.nodes[2], false);

    var connection = m.model.connections.internal[2][0][0];
    var node = m.model.nodes[1].nodes[0];
    m.model.gateConnection(connection, node);
    expect(connection.gateLayerId).to.eql(node.layerId);
    expect(connection.gateNodeId).to.eql(node.id);
    expect(connection.gateNode).to.eql(node)
  });

  it('gateLayerOneToOne should gate connections going from fromLayer to toLayer with the node at the same index as the connection', function () {
    var m = new Mother(null, function () {})
    m.model.appendNodeLayer(2);
    m.model.appendNodeLayer(2);
    m.model.appendNodeLayer(2);
    m.model.joinLayers(m.model.nodes[0], m.model.nodes[2], false);
    m.model.gateLayerOneToOne(m.model.nodes[1], m.model.nodes[0].id, m.model.nodes[2].id);
    var connections = m.model.connections.internal[2][0];
    for(var i = 0; i < connections.length; ++i) {
      expect(connections[i].gateNodeId).to.eql(m.model.nodes[1].nodes[i].id)
      expect(connections[i].gateLayerId).to.eql(m.model.nodes[1].nodes[i].layerId)
    }
  })

  it('initNeurons should create a complete neuron object for every node in mother', function () {
    var m = new Mother(null, function () {})
    m.model.appendNodeLayer(2);
    m.model.appendNodeLayer(2);
    m.model.appendNodeLayer(2);
    m.model.joinLayers(m.model.nodes[0], m.model.nodes[1], true);
    m.model.joinLayers(m.model.nodes[0], m.model.nodes[2], false);
    m.model.gateLayerOneToOne(m.model.nodes[1], m.model.nodes[0].id, m.model.nodes[2].id);
    m.model.initNeurons();
    neurons2 = m.model.layers[2];
    neurons1 = m.model.layers[1];
    neurons0 = m.model.layers[0];

    // debugger;

    expect(neurons0[0].connections.outputs.length).to.eql(3)
    expect(neurons0[0].connections.outputs[0]).to.equal(neurons1[0].connections.inputs[0])
    expect(neurons0[0].connections.outputs[1]).to.equal(neurons1[1].connections.inputs[0])
    expect(neurons0[0].connections.outputs[2]).to.equal(neurons2[0].connections.inputs[0])

    expect(neurons0[1].connections.outputs.length).to.eql(3)
    expect(neurons0[1].connections.outputs[0]).to.equal(neurons1[0].connections.inputs[1])
    expect(neurons0[1].connections.outputs[1]).to.equal(neurons1[1].connections.inputs[1])
    expect(neurons0[1].connections.outputs[2]).to.equal(neurons2[1].connections.inputs[0])

    expect(neurons1[0].connections.gated[0]).to.equal(neurons2[0].connections.inputs[0])
    expect(neurons1[1].connections.gated[0]).to.equal(neurons2[1].connections.inputs[0])
  })

  it('on update, if initNeurons has been called, updates the specified neuron and no others. connections are updated across all neurons associated with them', function () {
    var m = new Mother(null, function () {});
    m.model.appendNodeLayer(2);
    m.model.appendNodeLayer(2)
    m.model.appendNodeLayer(2);
    m.model.joinLayers(m.model.nodes[0], m.model.nodes[1], true);
    m.model.joinLayers(m.model.nodes[0], m.model.nodes[2], false);
    m.model.gateLayerOneToOne(m.model.nodes[1], 0, 2);
    m.model.initNeurons();

    m.update('activate', 0, {
      node: {
        id: 0,
        layerId: 2,
        state: 1,
        subNetworkId: -1, 
        subNetworkLayerId: -1
      },
      connections: {
        inputs: [
          {
            id: 0,
            toLayerId: 2,
            toNodeId: 0,
            toSubNetworkId: -1, 
            toSubNetworkLayerId: -1,
            fromLayerId: 0,
            fromNodeId: 0,
            fromSubNetworkId: -1, 
            fromSubNetworkLayerId: -1,
            activation: 2,
          },
          {
            id:1,
            toLayerId: 2,
            toNodeId: 0,
            toSubNetworkId: -1, 
            toSubNetworkLayerId: -1,
            fromLayerId: 0,
            fromNodeId: 1,
            fromSubNetworkId: -1, 
            fromSubNetworkLayerId: -1,
            activation: 0.5
          }
        ]
      }
    })
    expect(m.model.layers[2][0].node.state).to.eql(1);
    expect(m.model.layers[2][1].node.state).to.eql(0);
    expect(m.model.layers[2][0].connections.inputs[0].activation).to.eql(2);
    expect(m.model.layers[2][0].connections.inputs[1].activation).to.eql(0.5);
    expect(m.model.layers[2][0].connections.inputs[0]).to.eql(m.model.layers[0][0].connections.outputs[2])
    expect(m.model.layers[2][1].connections.inputs[0]).to.eql(m.model.layers[0][1].connections.outputs[2])
    expect(m.model.layers[2][0].connections.inputs[0]).to.eql(m.model.layers[1][0].connections.gated[0])
    expect(m.model.layers[2][1].connections.inputs[0]).to.eql(m.model.layers[1][1].connections.gated[0])
  })

  it('on activation, queues and sends each neuron not in the input layer', function (done) {
    // console.log('mother commands start')
    var sentSomething = false
    var counter = 0;
    var m = new Mother(null, function (toLevel, taskObj) {
      if(taskObj.command === 'activate') {
        counter++;
        var layer = 1;
        if(counter >= 3) {
          layer = 2;
        }
        expect(taskObj.value.node).to.eql(m.model.layers[layer][taskObj.section].node)
        expect(taskObj.value.gatedNodes).to.eql(m.model.layers[layer][taskObj.section].gatedNodes)
        expect(taskObj.value.connections).to.eql(m.model.layers[layer][taskObj.section].connections)
        setTimeout(function () {
          m.toManager.addToIn(taskObj);
        }, 0);
      } else {
        expect('YOUR KUNGFU IS WEAK!').to.eql(true);
      }
    });
    m.model.appendNodeLayer(2);
    m.model.appendNodeLayer(2);
    m.model.appendNodeLayer(2);
    m.model.joinLayers(m.model.nodes[0], m.model.nodes[1], true);
    m.model.joinLayers(m.model.nodes[1], m.model.nodes[2], true);
    m.model.initNeurons();
    m.activate([1,1], function () {
      sentSomething = true;
      expect(counter).to.eql(4);
      done()
    });
  });
  it('on backPropagation, queues and sends each neuron not in the output layer', function (done) {
    var counter = 0;
    var sentSomething = false;
    var m = new Mother(null, function (toLevel, taskObj) {
      // console.log(taskObj.command)
      if(taskObj.command === 'backPropagate') {
        counter++;
        var layer = 2;
        if(counter >= 3) {
          layer = 1;
        }
        if(counter >= 5) {
          layer = 0;
        }
        // debugger
        expect(taskObj.value.node).to.eql(m.model.layers[layer][taskObj.section].node)
        expect(taskObj.value.gatedNodes).to.eql(m.model.layers[layer][taskObj.section].gatedNodes)
        expect(taskObj.value.connections).to.eql(m.model.layers[layer][taskObj.section].connections)
        setTimeout(function () {
          m.toManager.addToIn(taskObj);
        }, 0);
      } else {
        expect('YOUR KUNGFU IS WEAK!').to.eql(true);
      }
    });
    m.model.appendNodeLayer(2);
    m.model.appendNodeLayer(2);
    m.model.appendNodeLayer(2);
    m.model.joinLayers(m.model.nodes[0], m.model.nodes[1], true);
    m.model.joinLayers(m.model.nodes[1], m.model.nodes[2], true);
    m.model.initNeurons();
    m.backPropagate([1,1], function () {
      sentSomething = true;
      expect(counter).to.eql(6);
      done();
    });
    // expect(sentSomething).to.eql(true);
    // setTimeout(function () {expect(sentSomething).to.eql(false)}, 0);
  });
})

describe('MONSTER END TO END TEST!!!', function () {
  var mother;
  var weights = [ 
    -0.0733711616601795,
    0.03829572834074496,
    0.05767388842068613,
    -0.008777539199218157,
    0.019310780474916106,
    0.09771623467095197,
    0.07201561317779123,
    -0.006101550720632079 
  ]
  var biases = [ 
    0.05782533055171371,
    -0.019654044089838868,
    0.06503446158021689,
    0.010771379200741643,
    0.05458700209856035,
    -0.024711737316101795,
    -0.04195384504273534,
    0.08664298541843893 
  ]

  beforeEach(function() {
    mother = new Mother(null, function (toLevel, taskObj) {
      var manager
      if(toLevel === 1) {
        setTimeout(function () {
          manager = new Manager(null, function (toLevel, taskObj) {
            var pleb;
            if(toLevel === 2) {
              setTimeout(function () {
                mother.toManager.addToIn(taskObj);
              }, 0)
            } else if (toLevel === 0) {
              setTimeout(function () {
                pleb = new Pleb(null, function (toLevel, taskObj) {
                  if(toLevel === 1) {
                    setTimeout(function () {
                      manager.toPleb.addToIn(taskObj);
                    }, 0)
                  } else {
                    expect('YOUR KUNGFU IS WEAK').to.eql(true);
                    done()
                  }
                })
                pleb.toManager.addToIn(taskObj);
              }, 0)
            } else {
              expect('YOUR KUNGFU IS WEAK').to.eql(true);
              done()
            }     
          })
          manager.toMother.addToIn(taskObj)
        }, 0)
      } else {
        expect('YOUR KUNGFU IS WEAK').to.eql(true);
        done()
      }
    })
  });

  it('should have correct activation and elegibilities after activation (smallest test case)', function (done) {
    //numbers compared to an identical network in synaptic but with gradient clipping added
    //the code for this can be found in synapticTest.js.
    var gotToCallback = false;
    mother.model.appendNodeLayer(1);
    mother.model.appendNodeLayer(1);
    mother.model.joinLayers(mother.model.nodes[0], mother.model.nodes[1], true);
    mother.model.initNeurons();
    mother.model.layers[0][0].node.bias = biases[0]
    mother.model.layers[1][0].node.bias = biases[2]
    mother.model.layers[0][0].connections.outputs[0].weight = weights[0]
    // debugger;
    mother.activate([1], function () {
      gotToCallback = true;
      expect(mother.model.layers[0][0].node.activation).to.eql(1);
      expect(mother.model.layers[1][0].node.activation).to.eql(0.4979158370508711);
      expect(mother.model.layers[0][0].node.elegibilities).to.eql([]);
      expect(mother.model.layers[1][0].node.elegibilities).to.eql([1]);
      done();
    })
  });

  it('should have correct activation and elegibilities after activation (slightly larger case with gates)', function (done) {
    var gotToCallback = false
    mother.model.appendNodeLayer(2);
    mother.model.appendNodeLayer(2);
    mother.model.appendNodeLayer(2);
    mother.model.appendNodeLayer(2);
    mother.model.joinLayers(mother.model.nodes[0], mother.model.nodes[1], true);
    mother.model.joinLayers(mother.model.nodes[1], mother.model.nodes[2], false);
    mother.model.joinLayers(mother.model.nodes[2], mother.model.nodes[3], false)
    mother.model.gateLayerOneToOne(mother.model.nodes[1], 2, 3);
    mother.model.nodes[0].nodes[0].bias = biases[0];
    mother.model.nodes[0].nodes[1].bias = biases[1];
    mother.model.nodes[1].nodes[0].bias = biases[2];
    mother.model.nodes[1].nodes[1].bias = biases[3];
    mother.model.nodes[2].nodes[0].bias = biases[4];
    mother.model.nodes[2].nodes[1].bias = biases[5];
    mother.model.nodes[3].nodes[0].bias = biases[6];
    mother.model.nodes[3].nodes[1].bias = biases[7];
    mother.model.connections.internal[1][0][0].weight = weights[0];
    mother.model.connections.internal[1][0][1].weight = weights[1];
    mother.model.connections.internal[1][0][2].weight = weights[2];
    mother.model.connections.internal[1][0][3].weight = weights[3];
    mother.model.connections.internal[2][1][0].weight = weights[4];
    mother.model.connections.internal[2][1][1].weight = weights[5];
    mother.model.connections.internal[3][2][0].weight = weights[6];
    mother.model.connections.internal[3][2][1].weight = weights[7];
    mother.model.initNeurons();
    mother.activate([1,1], function () {
      gotToCallback = true
      var activations = [ 1,
        1,
        0.5123317957248984,
        0.5100710298064006,
        0.5161145492805806,
        0.5062822901592291,
        0.49427241549080003,
        0.521254014927215 ]
      var elegibility =  [ [],
        [],
        [ 1, 1 ],
        [ 1, 1 ],
        [ 0.5123317957248984 ],
        [ 0.5100710298064006 ],
        [ 0.26442189383266645 ],
        [ 0.2582399291142609 ] ]
      var extendedElegibility = [ {},
        {},
        { 0: [ 0, 0 ] }, //still need to set up separating gatedNodes by layers
        { 1: [ 0, 0 ] },
        {},
        {},
        {},
        {} ]
      var i = 0
      // debugger
      expect(mother.model.layers[0][0].node.activation).to.eql(activations[0]);
      // console.log(i++) //0
      expect(mother.model.layers[0][1].node.activation).to.eql(activations[1]);
      // console.log(i++)
      expect(mother.model.layers[1][0].node.activation).to.eql(activations[2]);
      // console.log(i++) //2
      expect(mother.model.layers[1][1].node.activation).to.eql(activations[3]);
      // console.log(i++)
      expect(mother.model.layers[2][0].node.activation).to.eql(activations[4]);
      // console.log(i++) //4
      expect(mother.model.layers[2][1].node.activation).to.eql(activations[5]);
      // console.log(i++)
      expect(mother.model.layers[3][0].node.activation).to.eql(activations[6]);
      // console.log(i++) //6
      expect(mother.model.layers[3][1].node.activation).to.eql(activations[7]);
      // console.log(i++)
      expect(mother.model.layers[0][0].node.elegibilities).to.eql(elegibility[0]);
      // console.log(i++) //8
      expect(mother.model.layers[0][1].node.elegibilities).to.eql(elegibility[1]);
      // console.log(i++)
      expect(mother.model.layers[1][0].node.elegibilities).to.eql(elegibility[2]);
      // console.log(i++) //10
      expect(mother.model.layers[1][1].node.elegibilities).to.eql(elegibility[3]);
      // console.log(i++)
      expect(mother.model.layers[2][0].node.elegibilities).to.eql(elegibility[4]);
      // console.log(i++) //12
      expect(mother.model.layers[2][1].node.elegibilities).to.eql(elegibility[5]);
      // console.log(i++)
      expect(mother.model.layers[3][0].node.elegibilities).to.eql(elegibility[6]);
      // console.log(i++) //14
      expect(mother.model.layers[3][1].node.elegibilities).to.eql(elegibility[7]);
      // console.log(i++)
      expect(mother.model.layers[0][0].node.extendedElegibilities).to.eql(extendedElegibility[0]);
      // console.log(i++) //16
      expect(mother.model.layers[0][1].node.extendedElegibilities).to.eql(extendedElegibility[1]);
      // console.log(i++) //
      expect(mother.model.layers[1][0].node.extendedElegibilities).to.eql(extendedElegibility[2]);
      // console.log(i++) //18
      expect(mother.model.layers[1][1].node.extendedElegibilities).to.eql(extendedElegibility[3]);
      // console.log(i++)
      expect(mother.model.layers[2][0].node.extendedElegibilities).to.eql(extendedElegibility[4]);
      // console.log(i++) //20
      expect(mother.model.layers[2][1].node.extendedElegibilities).to.eql(extendedElegibility[5]);
      // console.log(i++)
      expect(mother.model.layers[2][0].node.extendedElegibilities).to.eql(extendedElegibility[6]);
      // console.log(i++) //22
      expect(mother.model.layers[3][1].node.extendedElegibilities).to.eql(extendedElegibility[7]);
      // console.log(i++)
      done();
    })
    // setTimeout(function () {
    //   expect(gotToCallback).to.eql(true)
    //   done()
    // }, 1000)
  })

  it('should have correct errors, weights and biases after backPropagation (smallest test case)', function (done) {
    var gotToCallback = false;
    mother.model.appendNodeLayer(1);
    mother.model.appendNodeLayer(1);
    mother.model.joinLayers(mother.model.nodes[0], mother.model.nodes[1], true);
    mother.model.initNeurons();
    mother.model.layers[0][0].node.bias = biases[0]
    mother.model.layers[1][0].node.bias = biases[2]
    mother.model.layers[0][0].connections.outputs[0].weight = weights[0]
    expect(mother.model.layers[1][0].connections.inputs[0].weight).to.eql(weights[0])
    // mother.model.layers[0][0].node.activation = 0;
    // mother.model.layers[1][0].node.activation = 0;
    mother.model.rate = 0.1;
    mother.model.maxGradient = 5;
    // debugger;
    mother.activate([1], function () {
      expect(mother.model.layers[0][0].node.activation).to.eql(1)
      expect(mother.model.layers[1][0].node.activation).to.eql(0.4979158370508711)
      mother.backPropagate([1], function () {
        gotToCallback = true;
        var i = 0;
        // console.log(i)
        expect(mother.model.layers[0][0].node.errorProjected).to.eql(0);
        // console.log(++i)
        expect(mother.model.layers[1][0].node.errorProjected).to.eql(0.5020841629491288);
        // console.log(++i)
        expect(mother.model.layers[0][0].node.errorResponsibility).to.eql(0);
        // console.log(++i) //3
        expect(mother.model.layers[1][0].node.errorResponsibility).to.eql(0.5020841629491288);
        // console.log(++i)
        expect(mother.model.layers[0][0].node.bias).to.eql(0);
        // console.log(++i) //5
        expect(mother.model.layers[1][0].node.bias).to.eql(0.11524287787512977);
        // console.log(++i)
        expect(mother.model.layers[0][0].connections.outputs[0].weight).to.eql(-0.023162745365266614);
        // console.log(++i)
        done();
      });
    });
  });

  it('should have correct errors, weights and biases after backPropagation (slightly larger case with gates)', function (done) {
    var gotToCallback = false
    mother.model.appendNodeLayer(2);
    mother.model.appendNodeLayer(2);
    mother.model.appendNodeLayer(2);
    mother.model.appendNodeLayer(2);
    mother.model.joinLayers(mother.model.nodes[0], mother.model.nodes[1], true);
    mother.model.joinLayers(mother.model.nodes[1], mother.model.nodes[2], false);
    mother.model.joinLayers(mother.model.nodes[2], mother.model.nodes[3], false)
    mother.model.gateLayerOneToOne(mother.model.nodes[1], 2, 3);
    mother.model.nodes[0].nodes[0].bias = biases[0];
    mother.model.nodes[0].nodes[1].bias = biases[1];
    mother.model.nodes[1].nodes[0].bias = biases[2];
    mother.model.nodes[1].nodes[1].bias = biases[3];
    mother.model.nodes[2].nodes[0].bias = biases[4];
    mother.model.nodes[2].nodes[1].bias = biases[5];
    mother.model.nodes[3].nodes[0].bias = biases[6];
    mother.model.nodes[3].nodes[1].bias = biases[7];
    mother.model.connections.internal[1][0][0].weight = weights[0];
    mother.model.connections.internal[1][0][1].weight = weights[1];
    mother.model.connections.internal[1][0][2].weight = weights[2];
    mother.model.connections.internal[1][0][3].weight = weights[3];
    mother.model.connections.internal[2][1][0].weight = weights[4];
    mother.model.connections.internal[2][1][1].weight = weights[5];
    mother.model.connections.internal[3][2][0].weight = weights[6];
    mother.model.connections.internal[3][2][1].weight = weights[7];
    mother.model.initNeurons();
    mother.activate([1,1], function () {
      gotToCallback = true
      var i = 0
      // debugger
      var activations = [ 1,
        1,
        0.5123317957248984,
        0.5100710298064006,
        0.5161145492805806,
        0.5062822901592291,
        0.49427241549080003,
        0.521254014927215 ]
      var errors = [ 0,
        0,
        0.0055955221808239655,
        0.000388602476288614,
        0.005525279624066444,
        0.00038220057052997387,
        0.5057275845092,
        0.478745985072785 ]
      var newBiases = [ 0,
        0,
        0.06559401379829928,
        0.010810239448370505,
        0.055139530060966994,
        -0.0246735172590488,
        0.008618913408184659,
        0.13451758392571744 ]
      var newWeights = [ -0.07336845676792189,
        0.03829666182816351,
        0.057676593312943746,
        -0.008776605711799609,
        0.01959385811808412,
        0.09773572961481225,
        0.08538815774372549,
        0.006261582204261222 ]
      // debugger
      // console.log('activation tests for backpropagation')
      expect(mother.model.layers[0][0].node.activation).to.eql(activations[0]);
      expect(mother.model.layers[0][1].node.activation).to.eql(activations[1]);
      expect(mother.model.layers[1][0].node.activation).to.eql(activations[2]);
      expect(mother.model.layers[1][1].node.activation).to.eql(activations[3]);
      expect(mother.model.layers[2][0].node.activation).to.eql(activations[4]);
      expect(mother.model.layers[2][1].node.activation).to.eql(activations[5]);
      expect(mother.model.layers[3][0].node.activation).to.eql(activations[6]);
      expect(mother.model.layers[3][1].node.activation).to.eql(activations[7]);
      //technically, if the activation test passes, all of these ^ should pass.  If they don't then the test is broken.
      // console.log('end activation tests')
      // debugger
      mother.backPropagate([1,1], function () {
        // console.log('error tests')
        expect(Math.abs(mother.model.layers[0][0].node.errorResponsibility - errors[0]) < 0.00000000000000001).to.eql(true)
        expect(Math.abs(mother.model.layers[0][1].node.errorResponsibility - errors[1]) < 0.00000000000000001).to.eql(true)
        expect(Math.abs(mother.model.layers[1][0].node.errorResponsibility - errors[2]) < 0.00000000000000001).to.eql(true)
        expect(Math.abs(mother.model.layers[1][1].node.errorResponsibility - errors[3]) < 0.00000000000000001).to.eql(true)
        expect(Math.abs(mother.model.layers[2][0].node.errorResponsibility - errors[4]) < 0.00000000000000001).to.eql(true)
        expect(Math.abs(mother.model.layers[2][1].node.errorResponsibility - errors[5]) < 0.00000000000000001).to.eql(true)
        expect(Math.abs(mother.model.layers[3][0].node.errorResponsibility - errors[6]) < 0.00000000000000001).to.eql(true)
        expect(Math.abs(mother.model.layers[3][1].node.errorResponsibility - errors[7]) < 0.00000000000000001).to.eql(true)


        // console.log('bias tests')
        expect(mother.model.layers[0][0].node.bias).to.eql(newBiases[0])
        expect(mother.model.layers[0][1].node.bias).to.eql(newBiases[1])
        expect(mother.model.layers[1][0].node.bias).to.eql(newBiases[2])
        expect(mother.model.layers[1][1].node.bias).to.eql(newBiases[3])
        expect(mother.model.layers[2][0].node.bias).to.eql(newBiases[4])
        expect(mother.model.layers[2][1].node.bias).to.eql(newBiases[5])
        expect(mother.model.layers[3][0].node.bias).to.eql(newBiases[6])
        expect(mother.model.layers[3][1].node.bias).to.eql(newBiases[7])

        // console.log('weight tests')
        expect(mother.model.connections.internal[1][0][0].weight).to.eql(newWeights[0]);
        expect(mother.model.connections.internal[1][0][1].weight).to.eql(newWeights[1]);
        expect(mother.model.connections.internal[1][0][2].weight).to.eql(newWeights[2]);
        expect(mother.model.connections.internal[1][0][3].weight).to.eql(newWeights[3]);
        expect(mother.model.connections.internal[2][1][0].weight).to.eql(newWeights[4]);
        expect(mother.model.connections.internal[2][1][1].weight).to.eql(newWeights[5]);
        expect(mother.model.connections.internal[3][2][0].weight).to.eql(newWeights[6]);
        expect(mother.model.connections.internal[3][2][1].weight).to.eql(newWeights[7]);
        done();
      });
    })
  });

  it('should have correct activation and elegibilities after activation (synchronous selfConnection test)', function () {
    var activations = [ 1, 0.4767604551285103, 0.525809587209915, 0.5084123796515109 ]
    var elegibility =  [ [],
      [ 1 ],
      [ 1 ],
      [ 0.4767604551285103, 0.525809587209915 ] ]
    var extendedElegibility = [ {}, { '1': [ 0 ] }, {}, {} ]

    mother.model.appendNodeLayer(1);
    mother.model.appendNodeLayer(2);
    mother.model.appendNodeLayer(1);
    mother.model.nodes[0].nodes[0].bias = biases[0]
    mother.model.nodes[1].nodes[0].bias = biases[1]
    mother.model.nodes[1].nodes[1].bias = biases[2]
    mother.model.nodes[2].nodes[0].bias = biases[3]
    mother.model.joinLayers(mother.model.nodes[0], mother.model.nodes[1], true)
    mother.model.joinLayers(mother.model.nodes[1], mother.model.nodes[2], true)
    mother.model.joinNodes(mother.model.nodes[1].nodes[1], mother.model.nodes[1].nodes[1]);
    mother.model.connections.internal[1][0][0].weight = weights[0];
    mother.model.connections.internal[1][0][1].weight = weights[1];
    mother.model.connections.internal[2][1][0].weight = weights[2];
    mother.model.connections.internal[2][1][1].weight = weights[3];
    mother.model.gateConnection(mother.model.nodes[1].nodes[1].selfConnection, mother.model.nodes[1].nodes[0]);
    mother.model.initNeurons();
    mother.model.activateFirstLayer([1]);
    expect(mother.model.layers[0][0].node.activation).to.eql(activations[0]);
    expect(mother.model.layers[0][0].node.elegibilities).to.eql(elegibility[0])
    expect(mother.model.layers[0][0].node.extendedElegibilities).to.eql(extendedElegibility[0])
    mother.model.layers[1][0].activateSync();
    expect(mother.model.layers[1][0].node.activation).to.eql(activations[1]);
    expect(mother.model.layers[1][0].node.elegibilities).to.eql(elegibility[1])
    expect(mother.model.layers[1][0].node.extendedElegibilities).to.eql(extendedElegibility[1])
    mother.model.layers[1][1].activateSync();
    expect(mother.model.layers[1][1].node.activation).to.eql(activations[2]);
    expect(mother.model.layers[1][1].node.elegibilities).to.eql(elegibility[2])
    expect(mother.model.layers[1][1].node.extendedElegibilities).to.eql(extendedElegibility[2])
    mother.model.layers[2][0].activateSync();
    expect(mother.model.layers[2][0].node.activation).to.eql(activations[3]);
    expect(mother.model.layers[2][0].node.elegibilities).to.eql(elegibility[3])
    expect(mother.model.layers[2][0].node.extendedElegibilities).to.eql(extendedElegibility[3])

  })

  it('should have correct activation and elegibilities after activation (selfConnection test)', function (done) {
    var activations = [ 1, 0.4767604551285103, 0.525809587209915, 0.5084123796515109 ]
    var elegibility =  [ [],
      [ 1 ],
      [ 1 ],
      [ 0.4767604551285103, 0.525809587209915 ] ]
    var extendedElegibility = [ {}, { '1': [ 0 ] }, {}, {} ]
    mother.model.appendNodeLayer(1);
    mother.model.appendNodeLayer(2);
    mother.model.appendNodeLayer(1);
    mother.model.nodes[0].nodes[0].bias = biases[0]
    mother.model.nodes[1].nodes[0].bias = biases[1]
    mother.model.nodes[1].nodes[1].bias = biases[2]
    mother.model.nodes[2].nodes[0].bias = biases[3]
    mother.model.joinLayers(mother.model.nodes[0], mother.model.nodes[1], true)
    mother.model.joinLayers(mother.model.nodes[1], mother.model.nodes[2], true)
    mother.model.joinNodes(mother.model.nodes[1].nodes[1], mother.model.nodes[1].nodes[1]);
    mother.model.connections.internal[1][0][0].weight = weights[0];
    mother.model.connections.internal[1][0][1].weight = weights[1];
    mother.model.connections.internal[2][1][0].weight = weights[2];
    mother.model.connections.internal[2][1][1].weight = weights[3];
    mother.model.gateConnection(mother.model.nodes[1].nodes[1].selfConnection, mother.model.nodes[1].nodes[0]);
    mother.model.initNeurons();
    mother.activate([1], function () {
      gotToCallback = true
      
      var i = 0
      // debugger
      // console.log(-1)
      expect(mother.model.layers[0][0].node.activation).to.eql(activations[0]);
      // console.log(i++) //0
      expect(mother.model.layers[1][0].node.activation).to.eql(activations[1]);
      // console.log(i++)
      expect(mother.model.layers[1][1].node.activation).to.eql(activations[2]);
      // console.log(i++) //2
      expect(mother.model.layers[2][0].node.activation).to.eql(activations[3]);
      // console.log(i++)
      expect(mother.model.layers[0][0].node.elegibilities).to.eql(elegibility[0]);
      // console.log(i++)
      expect(mother.model.layers[1][0].node.elegibilities).to.eql(elegibility[1]);
      // console.log(i++)
      expect(mother.model.layers[1][1].node.elegibilities).to.eql(elegibility[2]);
      // console.log(i++)
      expect(mother.model.layers[2][0].node.elegibilities).to.eql(elegibility[3]);
      // console.log(i++)
      expect(mother.model.layers[0][0].node.extendedElegibilities).to.eql(extendedElegibility[0]);
      // console.log(i++)
      expect(mother.model.layers[1][0].node.extendedElegibilities).to.eql(extendedElegibility[1]);
      // console.log(i++)
      expect(mother.model.layers[1][1].node.extendedElegibilities).to.eql(extendedElegibility[2]);
      // console.log(i++)
      expect(mother.model.layers[2][0].node.extendedElegibilities).to.eql(extendedElegibility[3]);
      // console.log(i++)
      done();
    })
  });

  it('should have correct errors, weights and biases after backPropagation (selfConnection test)', function (done) {
    var activations = [ 1, 0.4767604551285103, 0.525809587209915, 0.5084123796515109 ]
    var elegibility =  [ [],
      [ 1 ],
      [ 1 ],
      [ 0.4767604551285103, 0.525809587209915 ] ]
    var extendedElegibility = [ {}, { '1': [ 0 ] }, {}, {} ]
    var errors = [ 0,
      0.009946736958661355,
      0.002092335032017779,
      0.49158762034848913 ]
    var newBiases = [ 0,
      -0.01865937039397273,
      0.06524369508341867,
      0.05993014123559056 ]
    var newWeights = [ -0.07237648796431337,
      0.038504961843946736,
      0.08111084218197484,
      0.017070609174076195,
      1 ]
    mother.model.appendNodeLayer(1);
    mother.model.appendNodeLayer(2);
    mother.model.appendNodeLayer(1);
    mother.model.nodes[0].nodes[0].bias = biases[0]
    mother.model.nodes[1].nodes[0].bias = biases[1]
    mother.model.nodes[1].nodes[1].bias = biases[2]
    mother.model.nodes[2].nodes[0].bias = biases[3]
    mother.model.joinLayers(mother.model.nodes[0], mother.model.nodes[1], true)
    mother.model.joinLayers(mother.model.nodes[1], mother.model.nodes[2], true)
    mother.model.joinNodes(mother.model.nodes[1].nodes[1], mother.model.nodes[1].nodes[1]);
    mother.model.connections.internal[1][0][0].weight = weights[0];
    mother.model.connections.internal[1][0][1].weight = weights[1];
    mother.model.connections.internal[2][1][0].weight = weights[2];
    mother.model.connections.internal[2][1][1].weight = weights[3];
    mother.model.gateConnection(mother.model.nodes[1].nodes[1].selfConnection, mother.model.nodes[1].nodes[0]);
    mother.model.initNeurons();
    mother.activate([1], function () {
      gotToCallback = true
      
      var i = 0
      // debugger
      expect(mother.model.layers[0][0].node.activation).to.eql(activations[0]);
      expect(mother.model.layers[1][0].node.activation).to.eql(activations[1]);
      expect(mother.model.layers[1][1].node.activation).to.eql(activations[2]);
      expect(mother.model.layers[2][0].node.activation).to.eql(activations[3]);
      mother.backPropagate([1], function () {
        expect(mother.model.layers[0][0].node.errorResponsibility).to.eql(errors[0]);
        expect(mother.model.layers[1][0].node.errorResponsibility).to.eql(errors[1]);
        expect(mother.model.layers[1][1].node.errorResponsibility).to.eql(errors[2]);
        expect(mother.model.layers[2][0].node.errorResponsibility).to.eql(errors[3]);
        expect(mother.model.layers[0][0].node.bias).to.eql(newBiases[0])
        expect(mother.model.layers[1][0].node.bias).to.eql(newBiases[1])
        expect(mother.model.layers[1][1].node.bias).to.eql(newBiases[2])
        expect(mother.model.layers[2][0].node.bias).to.eql(newBiases[3])
        expect(mother.model.connections.internal[1][0][0].weight).to.eql(newWeights[0])
        expect(mother.model.connections.internal[1][0][1].weight).to.eql(newWeights[1])
        expect(mother.model.connections.internal[2][1][0].weight).to.eql(newWeights[2])
        expect(mother.model.connections.internal[2][1][1].weight).to.eql(newWeights[3])
        done()
      })
    })
  })
})

describe('SECOND ORDER MONSTER END TO END TEST!!!', function () {
  var mother;
  var weights = [ 
    -0.0733711616601795,
    0.03829572834074496,
    0.05767388842068613,
    -0.008777539199218157,
    0.019310780474916106,
    0.09771623467095197,
    0.07201561317779123,
    -0.006101550720632079 
  ]
  var biases = [ 
    0.05782533055171371,
    -0.019654044089838868,
    0.06503446158021689,
    0.010771379200741643,
    0.05458700209856035,
    -0.024711737316101795,
    -0.04195384504273534,
    0.08664298541843893 
  ]

  beforeEach(function() {
    mother = new Mother(null, function (toLevel, taskObj) {
      var manager
      if(toLevel === 1) {
        setTimeout(function () {
          manager = new Manager(null, function (toLevel, taskObj) {
            var pleb;
            if(toLevel === 2) {
              setTimeout(function () {
                mother.toManager.addToIn(taskObj);
              }, 0)
            } else if (toLevel === 0) {
              setTimeout(function () {
                pleb = new Pleb(null, function (toLevel, taskObj) {
                  if(toLevel === 1) {
                    setTimeout(function () {
                      manager.toPleb.addToIn(taskObj);
                    }, 0)
                  } else {
                    expect('YOUR KUNGFU IS WEAK').to.eql(true);
                    done()
                  }
                })
                pleb.toManager.addToIn(taskObj);
              }, 0)
            } else {
              expect('YOUR KUNGFU IS WEAK').to.eql(true);
              done()
            }     
          })
          manager.toMother.addToIn(taskObj)
        }, 0)
      } else {
        expect('YOUR KUNGFU IS WEAK').to.eql(true);
        done()
      }
    })
  });

  it('should have correct activation and elegibilities after activation with second Order networks (synchronous smallest test case)', function () {
    var activations = [ 1,
      0.4767604551285103,
      0.5208110574111814,
      0.5102007289026343,
      0.5125245532710294 ]
    var elegibility =  [ [],
      [ 1 ],
      [ 0.4767604551285103 ],
      [ 0.5208110574111814 ],
      [ 0.5102007289026343 ] ]
    var extendedElegibility = [ 
      {}, 
      {}, 
      {}, 
      {}, 
      {} ]
    var SimpleNetwork = function (network, rate, maxGradient) {
      Network.call(this, network, rate, maxGradient);
      this.appendNodeLayer(1);
      this.appendNodeLayer(1);
      this.appendNodeLayer(1);
      this.joinLayers(this.nodes[0], this.nodes[1], true)
      this.joinLayers(this.nodes[1], this.nodes[2], true)
    }
    SimpleNetwork.prototype = Object.create(Network.prototype);
    SimpleNetwork.prototype.Constructor = SimpleNetwork;
    mother.model.appendNodeLayer(1);
    mother.model.appendNetworkLayer(SimpleNetwork, 1);
    mother.model.appendNodeLayer(1);
    mother.model.joinLayers(mother.model.nodes[0], mother.model.nodes[1]);
    mother.model.joinLayers(mother.model.nodes[1], mother.model.nodes[2]);

    mother.model.nodes[0].nodes[0].bias = biases[0];
    mother.model.nodes[1].nodes[0].nodes[0].nodes[0].bias = biases[1];
    mother.model.nodes[1].nodes[0].nodes[1].nodes[0].bias = biases[2];
    mother.model.nodes[1].nodes[0].nodes[2].nodes[0].bias = biases[3];
    mother.model.nodes[2].nodes[0].bias = biases[4];
    
    mother.model.connections.internal[1][0][0].weight = weights[0];
    mother.model.nodes[1].nodes[0].connections.internal[1][0][0].weight = weights[1];
    mother.model.nodes[1].nodes[0].connections.internal[2][1][0].weight = weights[2];
    mother.model.connections.internal[2][1][0].weight = weights[3];

    mother.model.initNeurons();

    mother.model.activateFirstLayer([1]);
    mother.model.layers[1][0].layers[0][0].activateSync();
    mother.model.layers[1][0].layers[1][0].activateSync();
    mother.model.layers[1][0].layers[2][0].activateSync();
    mother.model.layers[2][0].activateSync();

    var i = 0;
    // console.log(i++)
    expect(mother.model.layers[0][0].node.activation).to.eql(activations[0]);
    // console.log(i++)
    expect(mother.model.layers[1][0].layers[0][0].node.activation).to.eql(activations[1]);
    // console.log(i++)
    expect(mother.model.layers[1][0].layers[1][0].node.activation).to.eql(activations[2]);
    // console.log(i++)
    expect(mother.model.layers[1][0].layers[2][0].node.activation).to.eql(activations[3]);
    // console.log(i++)
    expect(mother.model.layers[2][0].node.activation).to.eql(activations[4]);
    // console.log(i++)
    expect(mother.model.layers[0][0].node.elegibilities).to.eql(elegibility[0]);
    // console.log(i++)
    expect(mother.model.layers[1][0].layers[0][0].node.elegibilities).to.eql(elegibility[1]);
    // console.log(i++)
    expect(mother.model.layers[1][0].layers[1][0].node.elegibilities).to.eql(elegibility[2]);
    // console.log(i++)
    expect(mother.model.layers[1][0].layers[2][0].node.elegibilities).to.eql(elegibility[3]);
    // console.log(i++)
    expect(mother.model.layers[2][0].node.elegibilities).to.eql(elegibility[4]);
    // console.log(i++)

  })

  it('should have correct activation and elegibilities after activation with second Order networks (smallest test case)', function (done) {
    // debugMode = true;
    var activations = [ 1,
      0.4767604551285103,
      0.5208110574111814,
      0.5102007289026343,
      0.5125245532710294 ]
    var elegibility =  [ [],
      [ 1 ],
      [ 0.4767604551285103 ],
      [ 0.5208110574111814 ],
      [ 0.5102007289026343 ] ]
    var extendedElegibility = [ 
      {}, 
      {}, 
      {}, 
      {}, 
      {} ]
    var SimpleNetwork = function (network, rate, maxGradient) {
      Network.call(this, network, rate, maxGradient);
      this.appendNodeLayer(1);
      this.appendNodeLayer(1);
      this.appendNodeLayer(1);
      this.joinLayers(this.nodes[0], this.nodes[1], true)
      this.joinLayers(this.nodes[1], this.nodes[2], true)
    }
    SimpleNetwork.prototype = Object.create(Network.prototype);
    SimpleNetwork.prototype.Constructor = SimpleNetwork;
    mother.model.appendNodeLayer(1);
    mother.model.appendNetworkLayer(SimpleNetwork, 1);
    mother.model.appendNodeLayer(1);
    mother.model.joinLayers(mother.model.nodes[0], mother.model.nodes[1]);
    mother.model.joinLayers(mother.model.nodes[1], mother.model.nodes[2]);

    mother.model.nodes[0].nodes[0].bias = biases[0];
    mother.model.nodes[1].nodes[0].nodes[0].nodes[0].bias = biases[1];
    mother.model.nodes[1].nodes[0].nodes[1].nodes[0].bias = biases[2];
    mother.model.nodes[1].nodes[0].nodes[2].nodes[0].bias = biases[3];
    mother.model.nodes[2].nodes[0].bias = biases[4];
    
    mother.model.connections.internal[1][0][0].weight = weights[0];
    mother.model.nodes[1].nodes[0].connections.internal[1][0][0].weight = weights[1];
    mother.model.nodes[1].nodes[0].connections.internal[2][1][0].weight = weights[2];
    mother.model.connections.internal[2][1][0].weight = weights[3];

    mother.model.initNeurons();
    mother.activate([1], function () {
      var i = 0;
      // console.log(i++)
      expect(mother.model.layers[0][0].node.activation).to.eql(activations[0]);
      // console.log(i++)
      expect(mother.model.layers[1][0].layers[0][0].node.activation).to.eql(activations[1]);
      // console.log(i++)
      expect(mother.model.layers[1][0].layers[1][0].node.activation).to.eql(activations[2]);
      // console.log(i++)
      expect(mother.model.layers[1][0].layers[2][0].node.activation).to.eql(activations[3]);
      // console.log(i++)
      expect(mother.model.layers[2][0].node.activation).to.eql(activations[4]);
      // console.log(i++)
      expect(mother.model.layers[0][0].node.elegibilities).to.eql(elegibility[0]);
      // console.log(i++)
      expect(mother.model.layers[1][0].layers[0][0].node.elegibilities).to.eql(elegibility[1]);
      // console.log(i++)
      expect(mother.model.layers[1][0].layers[1][0].node.elegibilities).to.eql(elegibility[2]);
      // console.log(i++)
      expect(mother.model.layers[1][0].layers[2][0].node.elegibilities).to.eql(elegibility[3]);
      // console.log(i++)
      expect(mother.model.layers[2][0].node.elegibilities).to.eql(elegibility[4]);
      // console.log(i++)
      done()
    })
    // done();
  })

  it('should have correct errors, weights and biases after backPropagation (syncronous smallest test case)', function () {
    // debugMode = true;
    var activations = [ 1,
      0.4767604551285103,
      0.5208110574111814,
      0.5102007289026343,
      0.5125245532710294 ]
    var elegibility =  [ [],
      [ 1 ],
      [ 0.4767604551285103 ],
      [ 0.5208110574111814 ],
      [ 0.5102007289026343 ] ]
    var extendedElegibility = [ 
      {}, 
      {}, 
      {}, 
      {}, 
      {} ]
    var errors = [ 0,
      2.70061756197467*Math.pow(10,-7),
      0.000028268104320871143,
      0.00196047941908456,
      0.4874754467289706 ]
    var newBiases = [ 0,
      -0.01965401708366325,
      0.06503728839064898,
      0.010967427142650098,
      0.10333454677145741 ]
    var newWeights = [ -0.07337113465400388,
      0.038297076052173126,
      0.05777599235661476,
      0.016093493625107654 ]
    var SimpleNetwork = function (network, rate, maxGradient) {
      Network.call(this, network, rate, maxGradient);
      this.appendNodeLayer(1);
      this.appendNodeLayer(1);
      this.appendNodeLayer(1);
      this.joinLayers(this.nodes[0], this.nodes[1], true)
      this.joinLayers(this.nodes[1], this.nodes[2], true)
    }
    SimpleNetwork.prototype = Object.create(Network.prototype);
    SimpleNetwork.prototype.Constructor = SimpleNetwork;
    mother.model.appendNodeLayer(1);
    mother.model.appendNetworkLayer(SimpleNetwork, 1);
    mother.model.appendNodeLayer(1);
    mother.model.joinLayers(mother.model.nodes[0], mother.model.nodes[1]);
    mother.model.joinLayers(mother.model.nodes[1], mother.model.nodes[2]);

    mother.model.nodes[0].nodes[0].bias = biases[0];
    mother.model.nodes[1].nodes[0].nodes[0].nodes[0].bias = biases[1];
    mother.model.nodes[1].nodes[0].nodes[1].nodes[0].bias = biases[2];
    mother.model.nodes[1].nodes[0].nodes[2].nodes[0].bias = biases[3];
    mother.model.nodes[2].nodes[0].bias = biases[4];
    
    mother.model.connections.internal[1][0][0].weight = weights[0];
    mother.model.nodes[1].nodes[0].connections.internal[1][0][0].weight = weights[1];
    mother.model.nodes[1].nodes[0].connections.internal[2][1][0].weight = weights[2];
    mother.model.connections.internal[2][1][0].weight = weights[3];

    mother.model.initNeurons();

    mother.model.layers[0][0].rate = 0.1
    mother.model.layers[1][0].layers[0][0].rate = 0.1
    mother.model.layers[1][0].layers[1][0].rate = 0.1
    mother.model.layers[1][0].layers[2][0].rate = 0.1
    mother.model.layers[2][0].rate = 0.1

    mother.model.layers[0][0].maxGradient = 5
    mother.model.layers[1][0].layers[0][0].maxGradient = 5
    mother.model.layers[1][0].layers[1][0].maxGradient = 5
    mother.model.layers[1][0].layers[2][0].maxGradient = 5
    mother.model.layers[2][0].maxGradient = 5

    mother.model.activateFirstLayer([1]);
    mother.model.layers[1][0].layers[0][0].activateSync();
    mother.model.layers[1][0].layers[1][0].activateSync();
    mother.model.layers[1][0].layers[2][0].activateSync();
    mother.model.layers[2][0].activateSync();

    mother.model.setLastLayerError([1]);
    mother.model.layers[2][0].backPropagateSync();
    mother.model.layers[1][0].layers[2][0].backPropagateSync();
    mother.model.layers[1][0].layers[1][0].backPropagateSync();
    mother.model.layers[1][0].layers[0][0].backPropagateSync();
    mother.model.layers[0][0].backPropagateSync();

    expect(mother.model.layers[0][0].node.activation).to.eql(activations[0]);
    expect(mother.model.layers[1][0].layers[0][0].node.activation).to.eql(activations[1]);
    expect(mother.model.layers[1][0].layers[1][0].node.activation).to.eql(activations[2]);
    expect(mother.model.layers[1][0].layers[2][0].node.activation).to.eql(activations[3]);
    expect(mother.model.layers[2][0].node.activation).to.eql(activations[4]);
    expect(mother.model.layers[0][0].node.elegibilities).to.eql(elegibility[0]);
    expect(mother.model.layers[1][0].layers[0][0].node.elegibilities).to.eql(elegibility[1]);
    expect(mother.model.layers[1][0].layers[1][0].node.elegibilities).to.eql(elegibility[2]);
    expect(mother.model.layers[1][0].layers[2][0].node.elegibilities).to.eql(elegibility[3]);
    expect(mother.model.layers[2][0].node.elegibilities).to.eql(elegibility[4]);
    var i = 0
    // console.log(i++);//0
    expect(mother.model.layers[0][0].node.errorResponsibility).to.eql(errors[0]);
    // console.log(i++);
    expect(mother.model.layers[1][0].layers[0][0].node.errorResponsibility - errors[1] < Math.pow(10, -17)).to.eql(true);
    // console.log(i++);//2
    expect(mother.model.layers[1][0].layers[1][0].node.errorResponsibility - errors[2] < Math.pow(1, -17)).to.eql(true);
    // console.log(i++);
    expect(mother.model.layers[1][0].layers[2][0].node.errorResponsibility - errors[3] < Math.pow(1, -17)).to.eql(true);
    // console.log(i++);//4
    expect(mother.model.layers[2][0].node.errorResponsibility).to.eql(errors[4]);
    // console.log(i++);

    expect(mother.model.layers[0][0].node.bias).to.eql(newBiases[0]);
    // console.log(i++);//6
    expect(mother.model.layers[1][0].layers[0][0].node.bias).to.eql(newBiases[1]);
    // console.log(i++);
    expect(mother.model.layers[1][0].layers[1][0].node.bias).to.eql(newBiases[2]);
    // console.log(i++);//8
    expect(mother.model.layers[1][0].layers[2][0].node.bias).to.eql(newBiases[3]);
    // console.log(i++);
    expect(mother.model.layers[2][0].node.bias).to.eql(newBiases[4]);
    // console.log(i++);//10

    expect(mother.model.layers[1][0].layers[0][0].connections.inputs[0].weight).to.eql(newWeights[0]);
    // console.log(i++);
    expect(mother.model.layers[1][0].layers[1][0].connections.inputs[0].weight).to.eql(newWeights[1]);
    // console.log(i++);//12
    expect(mother.model.layers[1][0].layers[2][0].connections.inputs[0].weight).to.eql(newWeights[2]);
    // console.log(i++);
    expect(mother.model.layers[2][0].connections.inputs[0].weight).to.eql(newWeights[3]);
    // console.log(i++);//14
  })

  it('should have correct errors, weights and biases after backPropagation (smallest test case)', function (done) {
    // debugMode = true;
    var activations = [ 1,
      0.4767604551285103,
      0.5208110574111814,
      0.5102007289026343,
      0.5125245532710294 ]
    var elegibility =  [ [],
      [ 1 ],
      [ 0.4767604551285103 ],
      [ 0.5208110574111814 ],
      [ 0.5102007289026343 ] ]
    var extendedElegibility = [ 
      {}, 
      {}, 
      {}, 
      {}, 
      {} ]
    var errors = [ 0,
      2.70061756197467*Math.pow(10,-7),
      0.000028268104320871143,
      0.00196047941908456,
      0.4874754467289706 ]
    var newBiases = [ 0,
      -0.01965401708366325,
      0.06503728839064898,
      0.010967427142650098,
      0.10333454677145741 ]
    var newWeights = [ -0.07337113465400388,
      0.038297076052173126,
      0.05777599235661476,
      0.016093493625107654 ]
    var SimpleNetwork = function (network, rate, maxGradient) {
      Network.call(this, network, rate, maxGradient);
      this.appendNodeLayer(1);
      this.appendNodeLayer(1);
      this.appendNodeLayer(1);
      this.joinLayers(this.nodes[0], this.nodes[1], true)
      this.joinLayers(this.nodes[1], this.nodes[2], true)
    }
    SimpleNetwork.prototype = Object.create(Network.prototype);
    SimpleNetwork.prototype.Constructor = SimpleNetwork;
    mother.model.appendNodeLayer(1);
    mother.model.appendNetworkLayer(SimpleNetwork, 1);
    mother.model.appendNodeLayer(1);
    mother.model.joinLayers(mother.model.nodes[0], mother.model.nodes[1]);
    mother.model.joinLayers(mother.model.nodes[1], mother.model.nodes[2]);

    mother.model.nodes[0].nodes[0].bias = biases[0];
    mother.model.nodes[1].nodes[0].nodes[0].nodes[0].bias = biases[1];
    mother.model.nodes[1].nodes[0].nodes[1].nodes[0].bias = biases[2];
    mother.model.nodes[1].nodes[0].nodes[2].nodes[0].bias = biases[3];
    mother.model.nodes[2].nodes[0].bias = biases[4];
    
    mother.model.connections.internal[1][0][0].weight = weights[0];
    mother.model.nodes[1].nodes[0].connections.internal[1][0][0].weight = weights[1];
    mother.model.nodes[1].nodes[0].connections.internal[2][1][0].weight = weights[2];
    mother.model.connections.internal[2][1][0].weight = weights[3];

    mother.model.initNeurons();

    mother.activate([1], function () {
      var i = 0;
      expect(mother.model.layers[0][0].node.activation).to.eql(activations[0]);
      expect(mother.model.layers[1][0].layers[0][0].node.activation).to.eql(activations[1]);
      expect(mother.model.layers[1][0].layers[1][0].node.activation).to.eql(activations[2]);
      expect(mother.model.layers[1][0].layers[2][0].node.activation).to.eql(activations[3]);
      expect(mother.model.layers[2][0].node.activation).to.eql(activations[4]);
      expect(mother.model.layers[0][0].node.elegibilities).to.eql(elegibility[0]);
      expect(mother.model.layers[1][0].layers[0][0].node.elegibilities).to.eql(elegibility[1]);
      expect(mother.model.layers[1][0].layers[1][0].node.elegibilities).to.eql(elegibility[2]);
      expect(mother.model.layers[1][0].layers[2][0].node.elegibilities).to.eql(elegibility[3]);
      expect(mother.model.layers[2][0].node.elegibilities).to.eql(elegibility[4]);
      mother.backPropagate([1], function () {
        // console.log('derp');
        // console.log(i++);//0
        expect(mother.model.layers[0][0].node.errorResponsibility).to.eql(errors[0]);
        // console.log(i++);
        expect(mother.model.layers[1][0].layers[0][0].node.errorResponsibility- errors[1] < Math.pow(1, -17)).to.eql(true);
        // console.log(i++);//2
        expect(mother.model.layers[1][0].layers[1][0].node.errorResponsibility - errors[2] < Math.pow(1, -17)).to.eql(true);
        // console.log(i++);
        expect(mother.model.layers[1][0].layers[2][0].node.errorResponsibility - errors[3] < Math.pow(1, -17)).to.eql(true);
        // console.log(i++);//4
        expect(mother.model.layers[2][0].node.errorResponsibility).to.eql(errors[4]);
        // console.log(i++);

        expect(mother.model.layers[0][0].node.bias).to.eql(newBiases[0]);
        // console.log(i++);//6
        expect(mother.model.layers[1][0].layers[0][0].node.bias).to.eql(newBiases[1]);
        // console.log(i++);
        expect(mother.model.layers[1][0].layers[1][0].node.bias).to.eql(newBiases[2]);
        // console.log(i++);//8
        expect(mother.model.layers[1][0].layers[2][0].node.bias).to.eql(newBiases[3]);
        // console.log(i++);
        expect(mother.model.layers[2][0].node.bias).to.eql(newBiases[4]);
        // console.log(i++);//10

        expect(mother.model.layers[1][0].layers[0][0].connections.inputs[0].weight).to.eql(newWeights[0]);
        // console.log(i++);
        expect(mother.model.layers[1][0].layers[1][0].connections.inputs[0].weight).to.eql(newWeights[1]);
        // console.log(i++);//12
        expect(mother.model.layers[1][0].layers[2][0].connections.inputs[0].weight).to.eql(newWeights[2]);
        // console.log(i++);
        expect(mother.model.layers[2][0].connections.inputs[0].weight).to.eql(newWeights[3]);
        // console.log(i++);//14
        done()
      })
    })
  })
})

describe('TINY LSTM TEST', function () {
  var mother;

  var weights = [ 0.0720500576775521,
    -0.0836279911454767,
    0.08654574961401523,
    -0.05911036999896169,
    0.03508460135199129,
    -0.0350149180740118,
    0.037777353543788195,
    -0.09014635630883278 ]
  var biases = [ -0.0033765589352697106,
    0.049169979896396404,
    0.07471619490534068,
    0.08511151797138156,
    -0.07658589631319046,
    -0.03844784270040691,
    0.07349119186401368,
    -0.04294455344788731 ]
  var activations = [ 1,
    0.5302679546066033,
    0.4977720656851792,
    0.5428092495960707,
    -0.13486947540440547,
    -0.06703358064322722,
    -0.036386447606687855,
    0.48894651184502513 ]
  var elegibility =  [ [],
    [ 1 ],
    [ 1 ],
    [  1 ],
    [  1 ],
    [  -0.06713425736992738 ],
    [  -0.036386447606687855 ],
    [  -0.036386447606687855 ] ]
  var extendedElegibility = [ {},
    { '0': [ 0 ] },
    { '0': [ 0 ] },
    { '0': [ 0 ] },
    {},
    {},
    {},
    {} ]

  var errors = [ 0,
    0.000005574438230104302,
    0.000011256624313371007,
    0.000010278006116762628,
    -0.00016316281494465221,
    -0.00033385902278297363,
    -0.0006178339636300587,
    0.5110534881549749 ]
  var projError = [ 0,
    0,
    0,
    0,
    -0.00016316281494465221,
    -0.00033385902278297363,
    -0.0006178339636300587,
    0.5110534881549749 ]
  var gateError = [ 0,
    0.000005574438230104302,
    0.000011256624313371007,
    0.000010278006116762628,
    0,
    0,
    -0,
    0 ]
  var newBiases = [ 0,
    0.049170537340219415,
    0.07471732056777201,
    0.08511254577199323,
    -0.07660221259468493,
    0,
    0,
    0.008160795367610184 ]
  var newWeights = [ 0.0720500576775521,
    -0.0836279911454767,
    0.08654574961401523,
    -0.05912668628045615,
    1,
    1,
    1,
    0.03322505925489468 ]

  beforeEach(function() {
    mother = new Mother(null, function (toLevel, taskObj) {
      var manager
      if(toLevel === 1) {
        setTimeout(function () {
          manager = new Manager(null, function (toLevel, taskObj) {
            var pleb;
            if(toLevel === 2) {
              setTimeout(function () {
                mother.toManager.addToIn(taskObj);
              }, 0)
            } else if (toLevel === 0) {
              setTimeout(function () {
                pleb = new Pleb(null, function (toLevel, taskObj) {
                  if(toLevel === 1) {
                    setTimeout(function () {
                      manager.toPleb.addToIn(taskObj);
                    }, 0)
                  } else {
                    expect('YOUR KUNGFU IS WEAK').to.eql(true);
                    done()
                  }
                })
                pleb.toManager.addToIn(taskObj);
              }, 0)
            } else {
              expect('YOUR KUNGFU IS WEAK').to.eql(true);
              done()
            }     
          })
          manager.toMother.addToIn(taskObj)
        }, 0)
      } else {
        expect('YOUR KUNGFU IS WEAK').to.eql(true);
        done()
      }
    })
  });

  it('LSTM should activate correctly (synchronous)', function () {
    // debugMode = true
    mother.model.appendNodeLayer(1);
    mother.model.appendNetworkLayer(LSTM, 1);
    mother.model.appendNodeLayer(1);

    mother.model.joinLayers(mother.model.nodes[0], mother.model.nodes[1], true);
    mother.model.joinLayers(mother.model.nodes[1], mother.model.nodes[2], true);


    mother.model.nodes[0].nodes[0].bias = biases[0];
    mother.model.nodes[1].nodes[0].nodes[0].nodes[0].bias = biases[1]
    mother.model.nodes[1].nodes[0].nodes[0].nodes[1].bias = biases[2]
    mother.model.nodes[1].nodes[0].nodes[0].nodes[2].bias = biases[3]
    mother.model.nodes[1].nodes[0].nodes[0].nodes[3].bias = biases[4]
    mother.model.nodes[2].nodes[0].bias = biases[7];
    mother.model.connections.internal[1][0][0].weight = weights[0];
    mother.model.connections.internal[1][0][1].weight = weights[1];
    mother.model.connections.internal[1][0][2].weight = weights[2];
    mother.model.connections.internal[1][0][3].weight = weights[3];

    mother.model.connections.internal[2][1][0].weight = weights[4];

    mother.model.initNeurons();

    mother.model.activateFirstLayer([1]);
    mother.model.layers[1][0].layers[0][0].activateSync();
    mother.model.layers[1][0].layers[0][1].activateSync();
    mother.model.layers[1][0].layers[0][2].activateSync();
    mother.model.layers[1][0].layers[0][3].activateSync();
    mother.model.layers[1][0].layers[1][0].activateSync();
    mother.model.layers[1][0].layers[2][0].activateSync();
    mother.model.layers[2][0].activateSync();
    var i = 0;
    // console.log(i++) //0
    expect(mother.model.layers[0][0].node.activation).to.eql(activations[0])
    // console.log(i++)
    expect(mother.model.layers[1][0].layers[0][0].node.activation).to.eql(activations[1])
    // console.log(i++) //2
    expect(mother.model.layers[1][0].layers[0][1].node.activation).to.eql(activations[2])
    // console.log(i++)
    expect(mother.model.layers[1][0].layers[0][2].node.activation).to.eql(activations[3])
    // console.log(i++) //4
    expect(mother.model.layers[1][0].layers[0][3].node.activation).to.eql(activations[4])
    // console.log(i++)
    expect(mother.model.layers[1][0].layers[1][0].node.activation - activations[5] < Math.pow(10, -16)).to.eql(true)
    // console.log(i++) //6
    expect(mother.model.layers[1][0].layers[2][0].node.activation - activations[6] < Math.pow(10, -16)).to.eql(true)
    // console.log(i++)
    expect(mother.model.layers[2][0].node.activation).to.eql(activations[7])
    // console.log(i++) //8

    expect(mother.model.layers[0][0].node.elegibilities).to.eql(elegibility[0])
    // console.log(i++)
    expect(mother.model.layers[1][0].layers[0][0].node.elegibilities).to.eql(elegibility[1])
    // console.log(i++) //10
    expect(mother.model.layers[1][0].layers[0][1].node.elegibilities).to.eql(elegibility[2])
    // console.log(i++)
    expect(mother.model.layers[1][0].layers[0][2].node.elegibilities).to.eql(elegibility[3])
    // console.log(i++) //12
    expect(mother.model.layers[1][0].layers[0][3].node.elegibilities).to.eql(elegibility[4])
    // console.log(i++)
    expect(mother.model.layers[1][0].layers[1][0].node.elegibilities).to.eql(elegibility[5])
    // console.log(i++) //14
    expect(mother.model.layers[1][0].layers[2][0].node.elegibilities.length).to.eql(1);
    expect(mother.model.layers[1][0].layers[2][0].node.elegibilities[0] - elegibility[6][0] < Math.pow(10, -16)).to.eql(true)
    // console.log(i++)
    expect(mother.model.layers[2][0].node.elegibilities.length).to.eql(1);
    expect(mother.model.layers[2][0].node.elegibilities[0] - elegibility[7][0] < Math.pow(10, -16)).to.eql(true)
    // console.log(i++) //16

    expect(mother.model.layers[0][0].node.extendedElegibilities).to.eql(extendedElegibility[0])
    // console.log(i++)
    expect(mother.model.layers[1][0].layers[0][0].node.extendedElegibilities).to.eql(extendedElegibility[1])
    // console.log(i++) //18
    expect(mother.model.layers[1][0].layers[0][1].node.extendedElegibilities).to.eql(extendedElegibility[2])
    // console.log(i++)
    expect(mother.model.layers[1][0].layers[0][2].node.extendedElegibilities).to.eql(extendedElegibility[3])
    // console.log(i++) //20
    expect(mother.model.layers[1][0].layers[0][3].node.extendedElegibilities).to.eql(extendedElegibility[4])
    // console.log(i++)
    expect(mother.model.layers[1][0].layers[1][0].node.extendedElegibilities).to.eql(extendedElegibility[5])
    // console.log(i++) //22
    expect(mother.model.layers[1][0].layers[2][0].node.extendedElegibilities).to.eql(extendedElegibility[6])
    // console.log(i++)
    expect(mother.model.layers[2][0].node.extendedElegibilities).to.eql(extendedElegibility[7])
    // console.log(i++) //24
  });

  it('LSTM should activate correctly', function (done) {
    // debugMode = true
    mother.model.appendNodeLayer(1);
    mother.model.appendNetworkLayer(LSTM, 1);
    mother.model.appendNodeLayer(1);

    mother.model.joinLayers(mother.model.nodes[0], mother.model.nodes[1], true);
    mother.model.joinLayers(mother.model.nodes[1], mother.model.nodes[2], true);


    mother.model.nodes[0].nodes[0].bias = biases[0];
    mother.model.nodes[1].nodes[0].nodes[0].nodes[0].bias = biases[1]
    mother.model.nodes[1].nodes[0].nodes[0].nodes[1].bias = biases[2]
    mother.model.nodes[1].nodes[0].nodes[0].nodes[2].bias = biases[3]
    mother.model.nodes[1].nodes[0].nodes[0].nodes[3].bias = biases[4]
    mother.model.nodes[2].nodes[0].bias = biases[7];

    mother.model.connections.internal[1][0][0].weight = weights[0];
    mother.model.connections.internal[1][0][1].weight = weights[1];
    mother.model.connections.internal[1][0][2].weight = weights[2];
    mother.model.connections.internal[1][0][3].weight = weights[3];

    mother.model.connections.internal[2][1][0].weight = weights[4];

    mother.model.initNeurons();

    mother.activate([1], function () {
      var i = 0;
      // console.log(i++) //0
      expect(mother.model.layers[0][0].node.activation).to.eql(activations[0])
      // console.log(i++)
      expect(mother.model.layers[1][0].layers[0][0].node.activation).to.eql(activations[1])
      // console.log(i++) //2
      expect(mother.model.layers[1][0].layers[0][1].node.activation).to.eql(activations[2])
      // console.log(i++)
      expect(mother.model.layers[1][0].layers[0][2].node.activation).to.eql(activations[3])
      // console.log(i++) //4
      expect(mother.model.layers[1][0].layers[0][3].node.activation).to.eql(activations[4])
      // console.log(i++)
      expect(mother.model.layers[1][0].layers[1][0].node.activation - activations[5] < Math.pow(10, -16)).to.eql(true)
      // console.log(i++) //6
      expect(mother.model.layers[1][0].layers[2][0].node.activation - activations[6] < Math.pow(10, -16)).to.eql(true)
      // console.log(i++)
      expect(mother.model.layers[2][0].node.activation).to.eql(activations[7])
      // console.log(i++) //8

      expect(mother.model.layers[0][0].node.elegibilities).to.eql(elegibility[0])
      // console.log(i++)
      expect(mother.model.layers[1][0].layers[0][0].node.elegibilities).to.eql(elegibility[1])
      // console.log(i++) //10
      expect(mother.model.layers[1][0].layers[0][1].node.elegibilities).to.eql(elegibility[2])
      // console.log(i++)
      expect(mother.model.layers[1][0].layers[0][2].node.elegibilities).to.eql(elegibility[3])
      // console.log(i++) //12
      expect(mother.model.layers[1][0].layers[0][3].node.elegibilities).to.eql(elegibility[4])
      // console.log(i++)
      expect(mother.model.layers[1][0].layers[1][0].node.elegibilities).to.eql(elegibility[5])
      // console.log(i++) //14
      expect(mother.model.layers[1][0].layers[2][0].node.elegibilities.length).to.eql(1);
      expect(mother.model.layers[1][0].layers[2][0].node.elegibilities[0] - elegibility[6][0] < Math.pow(10, -16)).to.eql(true)
      // console.log(i++)
      expect(mother.model.layers[2][0].node.elegibilities.length).to.eql(1);
      expect(mother.model.layers[2][0].node.elegibilities[0] - elegibility[7][0] < Math.pow(10, -16)).to.eql(true)
      // console.log(i++) //16

      expect(mother.model.layers[0][0].node.extendedElegibilities).to.eql(extendedElegibility[0])
      // console.log(i++)
      expect(mother.model.layers[1][0].layers[0][0].node.extendedElegibilities).to.eql(extendedElegibility[1])
      // console.log(i++) //18
      expect(mother.model.layers[1][0].layers[0][1].node.extendedElegibilities).to.eql(extendedElegibility[2])
      // console.log(i++)
      expect(mother.model.layers[1][0].layers[0][2].node.extendedElegibilities).to.eql(extendedElegibility[3])
      // console.log(i++) //20
      expect(mother.model.layers[1][0].layers[0][3].node.extendedElegibilities).to.eql(extendedElegibility[4])
      // console.log(i++)
      expect(mother.model.layers[1][0].layers[1][0].node.extendedElegibilities).to.eql(extendedElegibility[5])
      // console.log(i++) //22
      expect(mother.model.layers[1][0].layers[2][0].node.extendedElegibilities).to.eql(extendedElegibility[6])
      // console.log(i++)
      expect(mother.model.layers[2][0].node.extendedElegibilities).to.eql(extendedElegibility[7])
      // console.log(i++) //24
      done();
    })
  });

  it('LSTM should backPropagate correctly (synchronous)', function () {
    debugMode = true;
    mother.model.appendNodeLayer(1);
    mother.model.appendNetworkLayer(LSTM, 1);
    mother.model.appendNodeLayer(1);

    mother.model.joinLayers(mother.model.nodes[0], mother.model.nodes[1], true);
    mother.model.joinLayers(mother.model.nodes[1], mother.model.nodes[2], true);


    mother.model.nodes[0].nodes[0].bias = biases[0];
    mother.model.nodes[1].nodes[0].nodes[0].nodes[0].bias = biases[1]
    mother.model.nodes[1].nodes[0].nodes[0].nodes[1].bias = biases[2]
    mother.model.nodes[1].nodes[0].nodes[0].nodes[2].bias = biases[3]
    mother.model.nodes[1].nodes[0].nodes[0].nodes[3].bias = biases[4]
    mother.model.nodes[2].nodes[0].bias = biases[7];
    // debugger
    mother.model.connections.internal[1][0][0].weight = weights[0];
    mother.model.connections.internal[1][0][1].weight = weights[1];
    mother.model.connections.internal[1][0][2].weight = weights[2];
    mother.model.connections.internal[1][0][3].weight = weights[3];

    mother.model.connections.internal[2][1][0].weight = weights[4];

    mother.model.initNeurons();

    mother.model.rate = 0.1;
    mother.model.maxGradient = 5;

    mother.model.layers[0][0].rate = mother.model.rate
    mother.model.layers[1][0].layers[0][0].rate = mother.model.rate
    mother.model.layers[1][0].layers[0][1].rate = mother.model.rate
    mother.model.layers[1][0].layers[0][2].rate = mother.model.rate
    mother.model.layers[1][0].layers[0][3].rate = mother.model.rate
    mother.model.layers[1][0].layers[1][0].rate = mother.model.rate
    mother.model.layers[1][0].layers[2][0].rate = mother.model.rate
    mother.model.layers[2][0].rate = mother.model.rate

    mother.model.layers[2][0].maxGradient = mother.model.maxGradient
    mother.model.layers[1][0].layers[0][0].maxGradient = mother.model.maxGradient
    mother.model.layers[1][0].layers[0][1].maxGradient = mother.model.maxGradient
    mother.model.layers[1][0].layers[0][2].maxGradient = mother.model.maxGradient
    mother.model.layers[1][0].layers[0][3].maxGradient = mother.model.maxGradient
    mother.model.layers[1][0].layers[1][0].maxGradient = mother.model.maxGradient
    mother.model.layers[1][0].layers[2][0].maxGradient = mother.model.maxGradient
    mother.model.layers[2][0].maxGradient = mother.model.maxGradient

    console.log(mother.model.rate)
    console.log(mother.model.maxGradient)

    mother.model.activateFirstLayer([1]);
    mother.model.layers[1][0].layers[0][0].activateSync();
    mother.model.layers[1][0].layers[0][1].activateSync();
    mother.model.layers[1][0].layers[0][2].activateSync();
    mother.model.layers[1][0].layers[0][3].activateSync();
    mother.model.layers[1][0].layers[1][0].activateSync();
    mother.model.layers[1][0].layers[2][0].activateSync();
    mother.model.layers[2][0].activateSync();
    var i = 0;
    expect(mother.model.layers[0][0].node.activation).to.eql(activations[0])
    expect(mother.model.layers[1][0].layers[0][0].node.activation).to.eql(activations[1])
    expect(mother.model.layers[1][0].layers[0][1].node.activation).to.eql(activations[2])
    expect(mother.model.layers[1][0].layers[0][2].node.activation).to.eql(activations[3])
    expect(mother.model.layers[1][0].layers[0][3].node.activation).to.eql(activations[4])
    expect(mother.model.layers[1][0].layers[1][0].node.activation - activations[5] < Math.pow(10, -16)).to.eql(true)
    expect(mother.model.layers[1][0].layers[2][0].node.activation - activations[6] < Math.pow(10, -16)).to.eql(true)
    expect(mother.model.layers[2][0].node.activation).to.eql(activations[7])

    expect(mother.model.layers[0][0].node.elegibilities).to.eql(elegibility[0])
    expect(mother.model.layers[1][0].layers[0][0].node.elegibilities).to.eql(elegibility[1])
    expect(mother.model.layers[1][0].layers[0][1].node.elegibilities).to.eql(elegibility[2])
    expect(mother.model.layers[1][0].layers[0][2].node.elegibilities).to.eql(elegibility[3])
    expect(mother.model.layers[1][0].layers[0][3].node.elegibilities).to.eql(elegibility[4])
    expect(mother.model.layers[1][0].layers[1][0].node.elegibilities).to.eql(elegibility[5])
    expect(mother.model.layers[1][0].layers[2][0].node.elegibilities.length).to.eql(1);
    expect(mother.model.layers[1][0].layers[2][0].node.elegibilities[0] - elegibility[6][0] < Math.pow(10, -16)).to.eql(true)
    expect(mother.model.layers[2][0].node.elegibilities.length).to.eql(1);
    expect(mother.model.layers[2][0].node.elegibilities[0] - elegibility[7][0] < Math.pow(10, -16)).to.eql(true)

    expect(mother.model.layers[0][0].node.extendedElegibilities).to.eql(extendedElegibility[0])
    expect(mother.model.layers[1][0].layers[0][0].node.extendedElegibilities).to.eql(extendedElegibility[1])
    expect(mother.model.layers[1][0].layers[0][1].node.extendedElegibilities).to.eql(extendedElegibility[2])
    expect(mother.model.layers[1][0].layers[0][2].node.extendedElegibilities).to.eql(extendedElegibility[3])
    expect(mother.model.layers[1][0].layers[0][3].node.extendedElegibilities).to.eql(extendedElegibility[4])
    expect(mother.model.layers[1][0].layers[1][0].node.extendedElegibilities).to.eql(extendedElegibility[5])
    expect(mother.model.layers[1][0].layers[2][0].node.extendedElegibilities).to.eql(extendedElegibility[6])
    expect(mother.model.layers[2][0].node.extendedElegibilities).to.eql(extendedElegibility[7])

    mother.model.setLastLayerError([1]);
    mother.model.layers[2][0].backPropagateSync();
    mother.model.layers[1][0].layers[2][0].backPropagateSync();
    mother.model.layers[1][0].layers[1][0].backPropagateSync();
    mother.model.layers[1][0].layers[0][0].backPropagateSync();
    mother.model.layers[1][0].layers[0][1].backPropagateSync();
    mother.model.layers[1][0].layers[0][2].backPropagateSync();
    mother.model.layers[1][0].layers[0][3].backPropagateSync();
    mother.model.layers[0][0].backPropagateSync();
    // console.log(i++) //0
    expect(mother.model.layers[2][0].node.errorProjected - projError[7] < Math.pow(10, -16)).to.eql(true)
    // console.log(i++)
    expect(mother.model.layers[1][0].layers[2][0].node.errorProjected - projError[6] < Math.pow(10, -16)).to.eql(true)
    // console.log(i++) //2
    expect(mother.model.layers[1][0].layers[1][0].node.errorProjected - projError[5] < Math.pow(10, -5)).to.eql(true)
    // console.log(i++)
    expect(mother.model.layers[1][0].layers[0][0].node.errorProjected - projError[1] < Math.pow(10, -5)).to.eql(true)
    // console.log(i++) //4
    expect(mother.model.layers[1][0].layers[0][1].node.errorProjected - projError[2] < Math.pow(10, -5)).to.eql(true)
    // console.log(i++)
    expect(mother.model.layers[1][0].layers[0][2].node.errorProjected - projError[3] < Math.pow(10, -5)).to.eql(true)
    // console.log(i++) //6
    expect(mother.model.layers[1][0].layers[0][3].node.errorProjected - projError[4] < Math.pow(10, -5)).to.eql(true)
    // console.log(i++)
    expect(mother.model.layers[0][0].node.errorProjected - projError[0] < Math.pow(10, -5)).to.eql(true)
    // console.log(i++) //8

    expect(mother.model.layers[2][0].node.errorGated - gateError[7] < Math.pow(10, -16)).to.eql(true)
    // console.log(i++)
    expect(mother.model.layers[1][0].layers[2][0].node.errorGated - gateError[6] < Math.pow(10, -16)).to.eql(true)
    // console.log(i++) //10
    expect(mother.model.layers[1][0].layers[1][0].node.errorGated - gateError[5] < Math.pow(10, -5)).to.eql(true)
    // console.log(i++)
    expect(mother.model.layers[1][0].layers[0][0].node.errorGated - gateError[1] < Math.pow(10, -5)).to.eql(true)
    // console.log(i++) //12
    expect(mother.model.layers[1][0].layers[0][1].node.errorGated - gateError[2] < Math.pow(10, -5)).to.eql(true)
    // console.log(i++)
    expect(mother.model.layers[1][0].layers[0][2].node.errorGated - gateError[3] < Math.pow(10, -5)).to.eql(true)
    // console.log(i++) //14
    expect(mother.model.layers[1][0].layers[0][3].node.errorGated - gateError[4] < Math.pow(10, -5)).to.eql(true)
    // console.log(i++)
    expect(mother.model.layers[0][0].node.errorGated - gateError[0] < Math.pow(10, -5)).to.eql(true)
    // console.log(i++) //16

    expect(mother.model.layers[2][0].node.errorResponsibility - errors[7] < Math.pow(10, -16)).to.eql(true)
    // console.log(i++)
    expect(mother.model.layers[1][0].layers[2][0].node.errorResponsibility - errors[6] < Math.pow(10, -16)).to.eql(true)
    // console.log(i++) //18
    expect(mother.model.layers[1][0].layers[1][0].node.errorResponsibility - errors[5] < Math.pow(10, -5)).to.eql(true)
    // console.log(i++)
    expect(mother.model.layers[1][0].layers[0][0].node.errorResponsibility - errors[1] < Math.pow(10, -5)).to.eql(true)
    // console.log(i++) //20
    expect(mother.model.layers[1][0].layers[0][1].node.errorResponsibility - errors[2] < Math.pow(10, -5)).to.eql(true)
    // console.log(i++)
    expect(mother.model.layers[1][0].layers[0][2].node.errorResponsibility - errors[3] < Math.pow(10, -5)).to.eql(true)
    // console.log(i++) //22
    expect(mother.model.layers[1][0].layers[0][3].node.errorResponsibility - errors[4] < Math.pow(10, -5)).to.eql(true)
    // console.log(i++)
    expect(mother.model.layers[0][0].node.errorResponsibility - errors[0] < Math.pow(10, -5)).to.eql(true)
    // console.log(i++) //24

    expect(mother.model.layers[2][0].node.bias - newBiases[7] < Math.pow(10, -16)).to.eql(true)
    // console.log(i++)
    expect(mother.model.layers[1][0].layers[2][0].node.bias - newBiases[6] < Math.pow(10, -16)).to.eql(true)
    // console.log(i++) //26
    expect(mother.model.layers[1][0].layers[1][0].node.bias - newBiases[5] < Math.pow(10, -16)).to.eql(true)
    // console.log(i++)
    expect(mother.model.layers[1][0].layers[0][0].node.bias - newBiases[1] < Math.pow(10, -5)).to.eql(true)
    // console.log(i++) //28
    expect(mother.model.layers[1][0].layers[0][1].node.bias - newBiases[2] < Math.pow(10, -5)).to.eql(true)
    // console.log(i++)
    expect(mother.model.layers[1][0].layers[0][2].node.bias - newBiases[3] < Math.pow(10, -16)).to.eql(true)
    // console.log(i++) //30
    expect(mother.model.layers[1][0].layers[0][3].node.bias - newBiases[4] < Math.pow(10, -16)).to.eql(true)
    // console.log(i++)
    expect(mother.model.layers[0][0].node.bias - newBiases[0] < Math.pow(10, -5)).to.eql(true)
    // console.log(i++) //32

    expect(mother.model.connections.internal[1][0][0].weight).to.eql(newWeights[0])
    // console.log(i++)    
    expect(mother.model.connections.internal[1][0][1].weight).to.eql(newWeights[1])
    // console.log(i++) //34    
    expect(mother.model.connections.internal[1][0][2].weight).to.eql(newWeights[2])
    // console.log(i++)    
    expect(mother.model.connections.internal[1][0][3].weight - newWeights[3] < Math.pow(10, -16)).to.eql(true)
    // console.log(i++) //36

    expect(mother.model.layers[1][0].connections.internal[1][0][0].weight).to.eql(newWeights[4])
    // console.log(i++)    
    expect(mother.model.layers[1][0].connections.internal[2][1][0].weight).to.eql(newWeights[6])
    // console.log(i++) //38
    expect(mother.model.layers[1][0].layers[1][0].node.selfConnection.weight).to.eql(newWeights[5])
    // console.log(i++)    

    expect(mother.model.connections.internal[2][1][0].weight).to.eql(newWeights[7])
    // console.log(i++) //40
  })

  it('LSTM should backPropagate correctly', function (done) {
    debugMode = true;
    mother.model.appendNodeLayer(1);
    mother.model.appendNetworkLayer(LSTM, 1);
    mother.model.appendNodeLayer(1);

    mother.model.joinLayers(mother.model.nodes[0], mother.model.nodes[1], true);
    mother.model.joinLayers(mother.model.nodes[1], mother.model.nodes[2], true);


    mother.model.nodes[0].nodes[0].bias = biases[0];
    mother.model.nodes[1].nodes[0].nodes[0].nodes[0].bias = biases[1]
    mother.model.nodes[1].nodes[0].nodes[0].nodes[1].bias = biases[2]
    mother.model.nodes[1].nodes[0].nodes[0].nodes[2].bias = biases[3]
    mother.model.nodes[1].nodes[0].nodes[0].nodes[3].bias = biases[4]
    mother.model.nodes[2].nodes[0].bias = biases[7];
    // debugger
    mother.model.connections.internal[1][0][0].weight = weights[0];
    mother.model.connections.internal[1][0][1].weight = weights[1];
    mother.model.connections.internal[1][0][2].weight = weights[2];
    mother.model.connections.internal[1][0][3].weight = weights[3];

    mother.model.connections.internal[2][1][0].weight = weights[4];

    mother.model.initNeurons();

    mother.activate([1], function () {
      expect(mother.model.layers[0][0].node.activation).to.eql(activations[0])
      expect(mother.model.layers[1][0].layers[0][0].node.activation).to.eql(activations[1])
      expect(mother.model.layers[1][0].layers[0][1].node.activation).to.eql(activations[2])
      expect(mother.model.layers[1][0].layers[0][2].node.activation).to.eql(activations[3])
      expect(mother.model.layers[1][0].layers[0][3].node.activation).to.eql(activations[4])
      expect(mother.model.layers[1][0].layers[1][0].node.activation - activations[5] < Math.pow(10, -16)).to.eql(true)
      expect(mother.model.layers[1][0].layers[2][0].node.activation - activations[6] < Math.pow(10, -16)).to.eql(true)
      expect(mother.model.layers[2][0].node.activation).to.eql(activations[7])

      expect(mother.model.layers[0][0].node.elegibilities).to.eql(elegibility[0])
      expect(mother.model.layers[1][0].layers[0][0].node.elegibilities).to.eql(elegibility[1])
      expect(mother.model.layers[1][0].layers[0][1].node.elegibilities).to.eql(elegibility[2])
      expect(mother.model.layers[1][0].layers[0][2].node.elegibilities).to.eql(elegibility[3])
      expect(mother.model.layers[1][0].layers[0][3].node.elegibilities).to.eql(elegibility[4])
      expect(mother.model.layers[1][0].layers[1][0].node.elegibilities).to.eql(elegibility[5])
      expect(mother.model.layers[1][0].layers[2][0].node.elegibilities.length).to.eql(1);
      expect(mother.model.layers[1][0].layers[2][0].node.elegibilities[0] - elegibility[6][0] < Math.pow(10, -16)).to.eql(true)
      expect(mother.model.layers[2][0].node.elegibilities.length).to.eql(1);
      expect(mother.model.layers[2][0].node.elegibilities[0] - elegibility[7][0] < Math.pow(10, -16)).to.eql(true)

      expect(mother.model.layers[0][0].node.extendedElegibilities).to.eql(extendedElegibility[0])
      expect(mother.model.layers[1][0].layers[0][0].node.extendedElegibilities).to.eql(extendedElegibility[1])
      expect(mother.model.layers[1][0].layers[0][1].node.extendedElegibilities).to.eql(extendedElegibility[2])
      expect(mother.model.layers[1][0].layers[0][2].node.extendedElegibilities).to.eql(extendedElegibility[3])
      expect(mother.model.layers[1][0].layers[0][3].node.extendedElegibilities).to.eql(extendedElegibility[4])
      expect(mother.model.layers[1][0].layers[1][0].node.extendedElegibilities).to.eql(extendedElegibility[5])
      expect(mother.model.layers[1][0].layers[2][0].node.extendedElegibilities).to.eql(extendedElegibility[6])
      expect(mother.model.layers[2][0].node.extendedElegibilities).to.eql(extendedElegibility[7])

      mother.backPropagate([1], function () {
        expect(mother.model.layers[2][0].node.errorProjected - projError[7] < Math.pow(10, -16)).to.eql(true)
        expect(mother.model.layers[1][0].layers[2][0].node.errorProjected - projError[6] < Math.pow(10, -16)).to.eql(true)
        expect(mother.model.layers[1][0].layers[1][0].node.errorProjected - projError[5] < Math.pow(10, -5)).to.eql(true)
        expect(mother.model.layers[1][0].layers[0][0].node.errorProjected - projError[1] < Math.pow(10, -5)).to.eql(true)
        expect(mother.model.layers[1][0].layers[0][1].node.errorProjected - projError[2] < Math.pow(10, -5)).to.eql(true)
        expect(mother.model.layers[1][0].layers[0][2].node.errorProjected - projError[3] < Math.pow(10, -5)).to.eql(true)
        expect(mother.model.layers[1][0].layers[0][3].node.errorProjected - projError[4] < Math.pow(10, -5)).to.eql(true)
        expect(mother.model.layers[0][0].node.errorProjected - projError[0] < Math.pow(10, -5)).to.eql(true)
        expect(mother.model.layers[2][0].node.errorGated - gateError[7] < Math.pow(10, -16)).to.eql(true)
        expect(mother.model.layers[1][0].layers[2][0].node.errorGated - gateError[6] < Math.pow(10, -16)).to.eql(true)
        expect(mother.model.layers[1][0].layers[1][0].node.errorGated - gateError[5] < Math.pow(10, -5)).to.eql(true)
        expect(mother.model.layers[1][0].layers[0][0].node.errorGated - gateError[1] < Math.pow(10, -5)).to.eql(true)
        expect(mother.model.layers[1][0].layers[0][1].node.errorGated - gateError[2] < Math.pow(10, -5)).to.eql(true)
        expect(mother.model.layers[1][0].layers[0][2].node.errorGated - gateError[3] < Math.pow(10, -5)).to.eql(true)
        expect(mother.model.layers[1][0].layers[0][3].node.errorGated - gateError[4] < Math.pow(10, -5)).to.eql(true)
        expect(mother.model.layers[0][0].node.errorGated - gateError[0] < Math.pow(10, -5)).to.eql(true)
        expect(mother.model.layers[2][0].node.errorResponsibility - errors[7] < Math.pow(10, -16)).to.eql(true)
        expect(mother.model.layers[1][0].layers[2][0].node.errorResponsibility - errors[6] < Math.pow(10, -16)).to.eql(true)
        expect(mother.model.layers[1][0].layers[1][0].node.errorResponsibility - errors[5] < Math.pow(10, -5)).to.eql(true)
        expect(mother.model.layers[1][0].layers[0][0].node.errorResponsibility - errors[1] < Math.pow(10, -5)).to.eql(true)
        expect(mother.model.layers[1][0].layers[0][1].node.errorResponsibility - errors[2] < Math.pow(10, -5)).to.eql(true)
        expect(mother.model.layers[1][0].layers[0][2].node.errorResponsibility - errors[3] < Math.pow(10, -5)).to.eql(true)
        expect(mother.model.layers[1][0].layers[0][3].node.errorResponsibility - errors[4] < Math.pow(10, -5)).to.eql(true)
        expect(mother.model.layers[0][0].node.errorResponsibility - errors[0] < Math.pow(10, -5)).to.eql(true)
        expect(mother.model.layers[2][0].node.bias - newBiases[7] < Math.pow(10, -16)).to.eql(true)
        expect(mother.model.layers[1][0].layers[2][0].node.bias - newBiases[6] < Math.pow(10, -16)).to.eql(true)
        expect(mother.model.layers[1][0].layers[1][0].node.bias - newBiases[5] < Math.pow(10, -16)).to.eql(true)
        expect(mother.model.layers[1][0].layers[0][0].node.bias - newBiases[1] < Math.pow(10, -5)).to.eql(true)
        expect(mother.model.layers[1][0].layers[0][1].node.bias - newBiases[2] < Math.pow(10, -5)).to.eql(true)
        expect(mother.model.layers[1][0].layers[0][2].node.bias - newBiases[3] < Math.pow(10, -16)).to.eql(true)
        expect(mother.model.layers[1][0].layers[0][3].node.bias - newBiases[4] < Math.pow(10, -16)).to.eql(true)
        expect(mother.model.layers[0][0].node.bias - newBiases[0] < Math.pow(10, -5)).to.eql(true)
        expect(mother.model.connections.internal[1][0][0].weight).to.eql(newWeights[0])
        expect(mother.model.connections.internal[1][0][1].weight).to.eql(newWeights[1])
        expect(mother.model.connections.internal[1][0][2].weight).to.eql(newWeights[2])
        expect(mother.model.connections.internal[1][0][3].weight - newWeights[3] < Math.pow(10, -16)).to.eql(true)
        expect(mother.model.layers[1][0].connections.internal[1][0][0].weight).to.eql(newWeights[4])
        expect(mother.model.layers[1][0].connections.internal[2][1][0].weight).to.eql(newWeights[6])
        expect(mother.model.layers[1][0].layers[1][0].node.selfConnection.weight).to.eql(newWeights[5])
        expect(mother.model.connections.internal[2][1][0].weight).to.eql(newWeights[7])
        done()
      })
    })

  });
  
})

describe('MONSTER LSTM NETWORK TEST', function () {
  it('', function () {
    mother.model = new LSTMNetwork([4, 2, 2, 4])

  })
})

