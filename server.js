/*jshint laxcomma: true, node: true*/
/*jshint esversion:6*/

const fs = require('fs');                                               // Dependência: módulo para manipular arquivos
const express = require('express');                                     // Dependência: módulo para rotas
const busboy = require('connect-busboy');                               // Dependencia: módulo para parsear dados de http requests
const limahash = require('./limahash.js');                              // Dependência: módulo para gerenciamento hash
const app = express();                                                  // Preparando servidor
const server = require('http').Server(app);                             // Inicializando servidor
server.listen(80);                                                      // Definindo porta para servidor

var filesAndHashes = [];                                                // Lista de arquivos e hashes
limahash.saveState(filesAndHashes);                                     // Preenche uma lista com nomes de arquivos e respectivos hashes

app.use(busboy());                                                      // Utilizando parser no servidor

app.use('/', express.static('public'));                                 // Servidor de arquivos estáticos

// ref: http://stackoverflow.com/questions/23114374/file-uploading-with-express-4-0-req-files-undefined
app.post('/postFile', function(req, res) {                              // Ao receber HTTP POST em /postFile
    var txt='';
    var fstream;                                                        // Declaracao de variável para buffer
    req.pipe(req.busboy);                                               // requisicao http é parseada pela dependência
    req.busboy.on('file', function (fieldname, file, filename) {        // Lendo arquivo:
        console.log("Uploading: " + filename);                          // Exibe em console upload de arquivo
        fstream = fs.createWriteStream(__dirname + '/temp/' + filename);// É criado arquivo em diretório temporário
        file.pipe(fstream);                                             // Arquivo enviado é salvo no local
        fstream.on('close', () => {                                     // Ao final:
            limahash.isOn(filename, filesAndHashes, (bool, secs) => {   // Irá comparar conteúdo dos hashes
                txt+=bool?'Método hash: arquivo ja existe! '+secs+' segundos!<br />\n'       // Se houver hash igual, exibirá mensagem positiva
                :'Método hash: arquivo nao existe! '+secs+' segundos!<br />\n';          // Caso contrário , exibirá mensagem negativa
            limahash.isOnB(filename, filesAndHashes, (bool, secs) =>{    // Irá comparar conteúdo dos hashes
                txt+=bool?'Método conteúdo: arquivo ja existe! '+secs+' segundos!<br />\n'       // Se houver hash igual, exibirá mensagem positiva
                :'Método conteúdo: arquivo nao existe! '+secs+' segundos!<br />\n';          // Caso contrário , exibirá mensagem negativa
                res.send(txt);});
            });
        });
    });
});