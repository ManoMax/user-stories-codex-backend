const mongoose = require('mongoose');
const config = require('@config');

module.exports = async () =>  {
    let DB_URL;
    if (process.env.NODE_ENV.trim() === "prod") {
        DB_URL = config.db.production;
    } else if (process.env.NODE_ENV.trim() === "dev") {
        DB_URL = config.db.develop;
    } else {
        const MongoInMemory = require('mongodb-memory-server');
        mongoServer = new MongoInMemory.MongoMemoryServer();
        DB_URL = await mongoServer.getUri()
    }
    
    mongoose.set('useFindAndModify', false);
    mongoose.connection.on('connected', () => {
        console.log('Conectado com o banco de dados!');
    })

    mongoose.connection.on('error', (err) => {
        console.log("Erro na conexão com o banco de dados: " + err);
    });

    mongoose.connect(DB_URL, {
        useNewUrlParser: true,
        poolSize: 5,
        useUnifiedTopology: true
    });
}