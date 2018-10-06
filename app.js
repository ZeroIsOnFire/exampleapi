// Instanciando dependencias
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var app = express();

// Configurando para usar o body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Conexão ao banco de dados
mongoose.connect('mongodb://localhost/bandas');
mongoose.Promise = global.Promise;

// Criando modelo de tabela do banco
var Banda = mongoose.model('Banda', {
  nome: { type: String, required: true },
  qtdMembros: { type: Number, required: true },
  genero: { type: String, required: true },
  adicionadoEm: { type: Date, default: Date.now }
});

// Nosso primeiro endpoint!
app.get('/', function (req, res) {
  res.send({
    mensagem: 'Funcionou!',
    descricao: 'Este foi um teste de API!'
  });
});

// Apenas para popular a base!
app.get('/bandas/popular', function (req, res) {
  Banda.insertMany([
    { nome: "Marcos e Maria", qtdMembros: 2, genero: "MPB" },
    { nome: "Capivaras do Zerão", qtdMembros: 3, genero: "Pagode" },
    { nome: "Father Jaime's Speed Bump", qtdMembros: 5, genero: "Metal" },
    { nome: "Great Snake River", qtdMembros: 3, genero: 'Rock' },
    { nome: "João das Neves", qtdMembros: 5, genero: 'Sertanejo Universitário' },
    { nome: "Garoto da Estiva", qtdMembros: 1, genero: 'Folk' }
  ]);

  res.send({
    mensagem: 'Funcionou!'
  });
});

// Enviado dados para o servidor!
app.get('/soma', function (req, res) {
  // Converte os valores para número
  var primeiro = parseInt(req.query.primeiro);
  var segundo = parseInt(req.query.segundo);

  if (primeiro && segundo) {
    // Realiza nossa operação de soma
    var resultado = primeiro + segundo;

    // Envia os dados para o servidor
    res.send({ resultado: resultado });
  } else {
    // Retorna mensagem de erro
    res.status(400).send({ erro: 'Parametros incorretos' });
  }
});

// Busca!
app.get('/bandas', function (req, res) {
  Banda.find()
    .then( function(resultado) {
      res.send(resultado);
    })
    .catch( function(erro) {
      res.status(500).send({ erro: erro.message });
    })
});

// Criando uma banda!
app.post('/bandas', function (req, res) {
  var parrametrosBanda = req.body.banda
  if(!parrametrosBanda) {
    res.status(400).send({ erro: 'Parametros incorretos' });
  } else {
    var banda = new Banda({
      nome: parrametrosBanda.nome,
      qtdMembros: parrametrosBanda.qtdMembros,
      genero: parrametrosBanda.genero
    });

    banda.save()
      .then(banda => {
          res.send(banda);
      }).catch(erro => {
        var status = 500;

        if (erro.name == "ValidationError") {
          status = 422;
        }

        res.status(status).send({ erro: erro.message });
      });
  }
});


app.listen(3000, function() {
  console.log('Iniciado!');
});
