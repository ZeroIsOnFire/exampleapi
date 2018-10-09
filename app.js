// Instanciando dependencias e instanciando uma aplicação do Express
var express = require('express');
var app = express();

// Configurando para nossa aplicação receber parametros em JSON
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Nosso primeiro endpoint!
app.get('/', function (request, response) {
  // Envia uma resposta em JSON para o cliente
  response.send({
    mensagem: 'Funcionou!',
    descricao: 'Este foi um teste de API!'
  });
});

// Enviado dados para o servidor!
// Enviaremos usando query strings, parametros enviados na URL
app.get('/soma', function (request, response) {
  // Captura os valores da URL e converte em Integer
  var primeiro = parseInt(request.query.primeiro);
  var segundo = parseInt(request.query.segundo);

  // Verifica se ambos valores são validos
  if (primeiro && segundo) {
    // Realiza nossa operação de soma
    var resultado = primeiro + segundo;

    // Envia o resultado para o cliente
    response.send({ resultado: resultado });
  } else {
    // Retorna mensagem de erro para o cliente com codigo 400(Bad Request)
    response.status(400).send({ erro: 'Parametros incorretos' });
  }
});

// Iniciando nossa API REST!
// Nosso resource serão as bandas para um Festival de Música!

// Configurando conexão ao banco de dados
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/bandas');
mongoose.Promise = global.Promise;

// Criando modelo de tabela do banco com regras de negócio
var Banda = mongoose.model('Banda', {
  nome: { type: String, required: true },
  qtdMembros: { type: Number, required: true },
  genero: { type: String, required: true },
  adicionadoEm: { type: Date, default: Date.now }
});

// Exibindo lista das bandas cadastradas!
app.get('/bandas', function (request, response) {
  /// Busca todos os registros da tabela de Banda do banco
  Banda.find()
    .then( function(resultado) {
      // Em caso de sucesso, envia os dados para o cliente
      response.send(resultado);
    }).catch( function(erro) {
      // Mensagem enviada em caso de erros na consulta
      response.status(500).send({ erro: erro.message });
    })
});

// Apenas para popular a base!
// Banda.insertMany([
//   { nome: "Marcos e Maria", qtdMembros: 2, genero: "MPB" },
//   { nome: "Capivaras do Zerão", qtdMembros: 3, genero: "Pagode" },
//   { nome: "Father Jaime's Speed Bump", qtdMembros: 5, genero: "Metal" },
//   { nome: "Great Snake River", qtdMembros: 3, genero: 'Rock' },
//   { nome: "João das Neves", qtdMembros: 5, genero: 'Sertanejo Universitário' },
//   { nome: "Garoto da Estiva", qtdMembros: 1, genero: 'Folk' }
// ]);

// Exibindo uma das bandas cadastradas!
// Partes da rota do endpoint com dois pontos no começo representam
// parametros embutidos na URL
app.get('/bandas/:id', function (request, response) {
  // Recupera o ID que mandamos como parametro na URL
  var id = request.params.id;

  // Busca um registro com o id no banco
  Banda.findById(id)
    .then( function(resultado) {
      if (resultado) {
        // Em caso de sucesso, envia os dados para o cliente
        response.send(resultado);
      } else {
        // Caso não encontre, envia resposta com código 404 (Not Found)
        response.status(404).send({ erro: 'Registro não encontrado' });
      }
    }).catch( function(erro) {
      // Mensagem enviada em caso de erros na consulta
      response.status(500).send({ erro: erro.message });
    })
});

// Criando uma banda usando POST!
// No verbo POST, nossos parametros vem encapsulados no corpo da mensagem.
// Geralmente usado para representar a criação do nosso resource.
app.post('/bandas', function (request, response) {
  // Recuperamos os parametros no corpo da requisição
  var parametrosBanda = request.body.banda;

  // Verifica se o parametro recuperado existe
  if(!parametrosBanda) {
    // Podemos retornar o mesmo erro de Bad Request do nosso endpoint de soma
    response.status(400).send({ erro: 'Parametros incorretos' });
  } else {
    // Caso exista, criaremos um novo objeto de Banda com os parametros
    var banda = new Banda(parametrosBanda)

    // Tentaremos salvar nosso objeto no banco
    banda.save({ strict: true })
      .then(function(banda) {
        // Em caso de sucesso, retornaremos a banda criada ao cliente
        response.send(banda);
      }).catch(function(erro) {
        // Verificaremos qual o erro que o banco retornou
        // Podemos assim verificar qual o código de erro é melhor para nós

        // Para um erro padrão, adotaremos o código 500 (Internal Server Error)
        var status = 500;

        // Em caso de erro de registro inválido no banco de dados, enviaremos
        // um erro 422 (Unprocessable Entity)
        if (erro.name == "ValidationError") {
          status = 422;
        }

        // Enviaremos a mensagem do erro ao cliente com o código adequado
        response.status(status).send({ erro: erro.message });
      });
  }
});

// Removendo uma das bandas cadastradas com DELETE!
// Verbo HTTP que indica que nosso endpoint irá remover nosso resource

// Nosso endpoint funcionará semelhante a busca de uma unica banda, com a
// diferença que irá remove-la e terá um retorno diferenciado
app.delete('/bandas/:id', function (request, response) {
  // Recupera o ID que mandamos como parametro na URL
  var id = request.params.id;

  // Busca um registro com o id no banco e remove ele
  Banda.findByIdAndRemove(id)
    .then( function(resultado) {
      if (resultado) {
        // Em caso de sucesso, envia os dados para o cliente
        // Por convenção, como removemos o registro, não temos os dados dele,
        // então retornamos uma resposta com corpo vazio e com código
        // 204 (No Content) para o cliente para indicar sucesso
        response.status(204).send();
      } else {
        // Caso não encontre, envia resposta com código 404 (Not Found)
        response.status(404).send({ erro: 'Registro não encontrado' });
      }
    }).catch( function(erro) {
      // Mensagem enviada em caso de erros na consulta
      response.status(500).send({ erro: erro.message });
    })
});

// Atualizando uma banda com PUT!
// Verbo HTTP que indica que nosso endpoint irá atualizar nosso resource

// Nosso endpoint serã uma mustura da busca de uma unica banda com a
// criação de uma nova
app.put('/bandas/:id', function (request, response) {
  // Recupera o ID que mandamos como parametro na URL
  var id = request.params.id;

  // Recuperamos os parametros no corpo da requisição
  var parametros= request.body.banda;

  // Verifica se o parametro recuperado existe
  if(!parametros) {
    // Novamente podemos retornar o mesmo erro de Bad Request
    response.status(400).send({ erro: 'Parametros incorretos' });
  } else {
    // Configuração para atualização do banco
    var configuracao = { new: true, runValidators: true, strict: true }

    // Busca o registro no banco e atualiza o mesmo com os parametros recebidos
    Banda.findByIdAndUpdate(id, parametros, configuracao)
      .then(function(banda) {
        if (banda) {
          // Em caso de sucesso, envia os dados para o cliente
          response.send(banda);
        } else {
          // Caso não encontre, envia resposta com código 404 (Not Found)
          response.status(404).send({ erro: 'Registro não encontrado' });
        }
      }).catch(function(erro) {
        // Verificaremos qual o erro que o banco retornou
        // Podemos assim verificar qual o código de erro é melhor para nós

        // Para um erro padrão, adotaremos o código 500 (Internal Server Error)
        var status = 500;

        // Em caso de erro de registro inválido no banco de dados, enviaremos
        // um erro 422 (Unprocessable Entity)
        if (erro.name == "ValidationError") {
          status = 422;
        }

        // Enviaremos a mensagem do erro ao cliente com o código adequado
        response.status(status).send({ erro: erro.message });
      });
  }
});

app.listen(3000, function() {
  console.log('Iniciado!');
});
