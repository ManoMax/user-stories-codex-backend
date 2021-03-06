const chai = require('chai');
const server = require('../src/server');
const chai_http = require('chai-http');
const should = chai.should();
const User = require('../src/model/User');
// const MongoInMemory = require('mongodb-memory-server');
const databaseConfig = require('../src/config/database');

const HTTP_CODE_OK = 200;
const HTTP_CODE_CREATED = 201;
const HTTP_CODE_BAD_REQUEST = 400;
const HTTP_CODE_UNAUTHORIZED = 401;
const HTTP_CODE_NOT_FOUND = 404;

chai.use(chai_http);
let token_aux;
let token_aux2;

describe('Auth module', async function () {
    before(async () => {
        // mongoServer = new MongoInMemory.MongoMemoryServer();
        databaseConfig() // await mongoServer.getUri()
    });

    it('Teste de Timeout menor que 500ms', function (done) {
        this.timeout(500);
        setTimeout(done, 300);
    });

    it('Rota raiz com Hello World', function (done) {
        chai.request(server)
            .get('/')
            .end(function (err, response) {
                response.should.have.status(HTTP_CODE_OK);
                response.body.should.have.property('confirm');
                done();
            })
    });

    it('Get Users vazio', function (done) {
        chai.request(server)
            .get('/users')
            .end(function (err, response) {
                response.should.have.status(HTTP_CODE_OK);
                response.body.should.have.instanceof(Array);
                response.body.should.have.lengthOf(0);
                done();
            })
    });
    
    it('Cadastrar novo usuario sem nome', function (done) {
        chai.request(server)
        .post('/user/signUp')
        .send({
            "email": "gabrielmax@codexjr.com.br",
            "password": "123456"
        })
        .end(function (err, response) {
            response.should.have.status(HTTP_CODE_BAD_REQUEST);
            done();
        })
    });
    
    it('Cadastrar novo usuario sem email', function (done) {
        chai.request(server)
        .post('/user/signUp')
        .send({
            "name": "Mano Max",
            "password": "123456"
        })
        .end(function (err, response) {
            response.should.have.status(HTTP_CODE_BAD_REQUEST);
            done();
        })
    });
    
    it('Cadastrar novo usuario sem password', function (done) {
        chai.request(server)
        .post('/user/signUp')
        .send({
            "name": "Mano Max",
            "email": "gabrielmax@codexjr.com.br"
        })
        .end(function (err, response) {
            response.should.have.status(HTTP_CODE_BAD_REQUEST);
            done();
        })
    });
    
    it('Cadastrar novo usuario v??lido (manomax)', function (done) {
        chai.request(server)
            .post('/user/signUp')
            .send({
                "name": "Mano Max",
                "email": "gabrielmax@codexjr.com.br",
                "password": "123456",
                "cargoAtual": "squaad"
            })
            .end(function (err, response) {
                response.should.have.status(HTTP_CODE_CREATED);
                response.body.should.have.property('message', "E-mail cadastrado com sucesso.");
                done();
            })
    });

    it('Get Users com um usu??rio cadastrado', function (done) {
        chai.request(server)
            .get('/users')
            .end(function (err, response) {
                response.should.have.status(HTTP_CODE_OK);
                response.body.should.have.instanceof(Array);
                response.body.should.have.lengthOf(1);
                done();
            })
    });

    it('Login sem email', function (done) {
        const incorrect_email = 'email@mail.com';
        chai.request(server)
            .post('/signIn')
            .send({ 'password': 'senha' })
            .end(function (err, response) {
                response.should.have.status(HTTP_CODE_BAD_REQUEST);
                done();
            })
    });

    it('Login sem senha', function (done) {
        const incorrect_email = 'email@mail.com';
        chai.request(server)
            .post('/signIn')
            .send({ 'email': incorrect_email })
            .end(function (err, response) {
                response.should.have.status(HTTP_CODE_BAD_REQUEST);
                done();
            })
    });

    it('Login com email n??o cadastrado', function (done) {
        const incorrect_email = 'email@mail.com';
        chai.request(server)
            .post('/signIn')
            .send({ 'email': incorrect_email, 'password': 'senha' })
            .end(function (err, response) {
                response.should.have.status(HTTP_CODE_UNAUTHORIZED);
                done();
            })
    });

    it('Login com senha incorreta', function (done) {
        const correct_email = "gabrielmax@codexjr.com.br";
        chai.request(server)
            .post('/signIn')
            .send({ "email": correct_email, "password": "senhaerrada" })
            .end(function (err, response) {
                response.should.have.status(HTTP_CODE_UNAUTHORIZED);
                done()
            })
    });

    it('Login com credenciais corretas (manomax)', function (done) {
        const correct_email = "gabrielmax@codexjr.com.br";
        chai.request(server)
            .post('/signIn')
            .send({ "email": correct_email, "password": "123456" })
            .end(function (err, response) {
                response.should.have.status(HTTP_CODE_OK);
                response.body.should.have.property('auth');
                response.body.should.have.property('auth').to.be.a('boolean');
                response.body.should.have.property('token');
                response.body.should.have.property('token').to.be.a('string');
                response.body.should.have.not.property('user');
                response.body.should.have.not.property('password');
                token_aux = response.body.token;
                done();
            });
    });

    it('Get Page de um usu??rio n??o cadastrado', function (done) {
        chai.request(server)
            .get('/user/felipeleao')
            .end(function (err, response) {
                response.should.have.status(HTTP_CODE_NOT_FOUND);
                done();
            })
    });

    it('Get Page de um usu??rio cadastrado (manomax)', function (done) {
        chai.request(server)
            .get('/user/manomax')
            .end(function (err, response) {
                response.should.have.status(HTTP_CODE_OK);
                response.body.should.have.property('name');
                response.body.should.have.property('email');
                response.body.should.have.property('telefone', null);
                response.body.should.property('telefone').equals(null);
                response.body.should.have.property('foto');
                response.body.should.have.property('cargoAtual');
                response.body.should.have.property('especialidades');
                response.body.should.have.property('instagram');
                response.body.should.have.property('linkedin');
                response.body.should.have.property('anivers??rio');
                response.body.should.have.property('cpf');
                response.body.should.have.property('urlUser');
                response.body.should.have.not.property('_id');
                done();
            })
    });

    it('Set perfil com campos vazios', function (done) {
        chai.request(server)
            .post('/user/manomax/setPerfil')
            .send({  })
            .set({ authorization: token_aux })
            .end(function (err, response) {
                response.should.have.status(HTTP_CODE_BAD_REQUEST);
                done();
            })
    });

    it('Set perfil (telefone) de P??gina Inexistente (felipeleao)', function (done) {
        chai.request(server)
            .post('/user/felipeleao/setPerfil')
            .set({ authorization: token_aux })
            .send({ "telefone": "4002-8922" })
            .end(function (err, response) {
                response.should.have.status(HTTP_CODE_BAD_REQUEST);
                done();
            })
    });

    it('Set perfil (telefone) com token invalido', function (done) {
        chai.request(server)
            .post('/user/manomax/setPerfil')
            .set({ authorization: "token invalido" })
            .send({ "telefone": "4002-8922" })
            .end(function (err, response) {
                response.should.have.status(HTTP_CODE_UNAUTHORIZED);
                done();
            })
    });

    it('Set perfil (telefone) com autoriza????o (manomax)', function (done) {
        chai.request(server)
            .post('/user/manomax/setPerfil')
            .set({ authorization: token_aux })
            .send({ "telefone": "4002-8922" })
            .end(function (err, response) {
                response.should.have.status(HTTP_CODE_OK);
                done();
            })
    });

    it('Get Page com telefone atualizado (manomax)', function (done) {
        chai.request(server)
            .get('/user/manomax')
            .end(function (err, response) {
                response.should.have.status(HTTP_CODE_OK);
                response.body.should.have.property('telefone', "4002-8922");
                done();
            })
    });

    it('Cadastrar segundo usuario v??lido (felipeleao)', function (done) {
        chai.request(server)
            .post('/user/signUp')
            .send({
                "name": "Felipe Le??o",
                "email": "felipeleao@codexjr.com.br",
                "password": "reidaselva",
                "cargoAtual": "membro"
            })
            .end(function (err, response) {
                response.should.have.status(HTTP_CODE_CREATED);
                response.body.should.have.property('message', "E-mail cadastrado com sucesso.");
                done();
            })
    });

    it('Get Users com dois usu??rios cadastrados', function (done) {
        chai.request(server)
            .get('/users')
            .end(function (err, response) {
                response.should.have.status(HTTP_CODE_OK);
                response.body.should.have.instanceof(Array);
                response.body.should.have.lengthOf(2);
                done();
            })
    });

    it('Login com credenciais corretas (felipeleao)', function (done) {
        const correct_email = "felipeleao@codexjr.com.br";
        chai.request(server)
            .post('/signIn')
            .send({ "email": correct_email, "password": "reidaselva" })
            .end(function (err, response) {
                response.should.have.status(HTTP_CODE_OK);
                response.body.should.have.property('auth');
                response.body.should.have.property('auth').to.be.a('boolean');
                response.body.should.have.property('token');
                response.body.should.have.property('token').to.be.a('string');
                response.body.should.have.not.property('user');
                response.body.should.have.not.property('password');
                token_aux2 = response.body.token;
                done();
            });
    });

    it('Set perfil de felipeleao (telefone) com token de outro usuario (manomax)', function (done) {
        chai.request(server)
            .post('/user/felipeleao/setPerfil')
            .set({ authorization: token_aux })
            .send({ "telefone": "4002-8922" })
            .end(function (err, response) {
                response.should.have.status(HTTP_CODE_UNAUTHORIZED);
                done();
            })
    });

    it('Logout de manomax', function (done) {
        chai.request(server)
            .get('/signOut')
            .set({ authorization: token_aux })
            .end(function (err, response) {
                response.should.have.status(HTTP_CODE_OK);
                done();
            })
    });
});