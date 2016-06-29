/*jshint laxcomma: true, node: true*/
/*jshint esversion:6*/

const XXHash = require('xxhash');                                                   // Dependência: módulo para gerar hashs
const fs = require('fs');                                                           // Dependência: módulo para manipular arquivos

var limahash = {};                                                                  // Inicialização de módulo

limahash.printValues = (filesAndHashes) => {                                        // Função para exibir dados salvos
    console.log('\nARQUIVOS ENCONTRADOS E HASHES GERADOS:\n');
    filesAndHashes.forEach(x=>console.log(JSON.stringify(x)));};                    // Exibe em console nome e hash de arquivos

limahash.saveFile = (file,data,filesAndHashes) =>                                   // Função para salvar arquivo em lista:
    filesAndHashes.push( { name : file, hash : XXHash.hash(data, 0xCAFEBABE) } );   // Adiciona nome de arquivo e hash de conteúdo em lista

limahash.proccessFile = (file,index,array,data,filesAndHashes,callback) => {        // Função para processar arquivo:
    limahash.saveFile(file,data,filesAndHashes);                                    // Irá salvar o arquivo em lista
    if(index==array.length-1)callback();                                            // Ao final, chamará callback
};

limahash.readFile = (file, callback) =>                                             // lê cada arquivo e executa callback para cada um
    fs.readFile('./docs/'+file, (err, data) => callback(data) );

limahash.saveState = (filesAndHashes) =>                                            // Função para ler arquivos locais e salvá-los com devidos hashs
    fs.readdir('./docs/',(err,data) =>                                              // Busca arquivos em diretório indicado
        data.forEach((file, index, array) =>                                        // Para cada arquivo encontrado:
            fs.readFile('./docs/'+file, (err, data) =>                              // Lê o arquivo e:
                limahash.proccessFile(file,index,array,data,filesAndHashes,() =>    // Irá processar o arquivo
                    limahash.printValues(filesAndHashes)                            // Irá exibir dados salvos
                )
            )
        )
    );

limahash.isOn = (file,filesAndHashes,callback) => {                                 // Função para checar se arquivo ja existe
    var hashedFile;
    fs.readFile('./temp/'+file, (err, data) =>
        {limahash.isOn2(filesAndHashes, XXHash.hash(data, 0xCAFEBABE), callback);}
    );                                                                              // Gera hash para arquivo
};
    
limahash.isOn2 = (filesAndHashes, hashedFile, callback) => {
    var found=false;                                                                // Variável para verificar se arquivo é repetido
    var time = new Date();
    filesAndHashes.forEach((item, index, array) => {                                // Para cada arquivo na lista:
        if(item.hash===hashedFile){found=true;                                      // Se hashes forem iguais altera variável
        console.log('It\'s HASH is equal ' +item.name+ '\'s HASH: ' +item.hash);}   // Exibidos em console casos de comparacao
        if(index===array.length-1)callback(found, (new Date() - time)/1000);        // Ao final, devolve resultado ao callback
    });};

limahash.isOnB = (file, filesAndHashes, callback) => {
    var found=false;                                                                // Variável para verificar se arquivo é repetido
    var time = new Date();
    filesAndHashes.forEach((item, index, array) => {                                // Para cada arquivo na lista:
        if(fs.readFileSync('./temp/'+file).toString() === fs.readFileSync('./docs/'+item.name).toString())
        {found=true;                                                                // Se conteudos forem iguais altera variável
        console.log('It\'s CONTENT is equal to ' +item.name);}                      // Exibidos em console casos de comparacao
        if(index===array.length-1)callback(found, (new Date() - time)/1000);        // Ao final, devolve resultado ao callback
    });};
    
limahash.compareFiles = (fileA, fileB) =>
    fs.readFileSync(fileA) === fs.readFileSync(fileB);

module.exports = limahash;                                                          // Torna este módulo criado em uma dependência acessível