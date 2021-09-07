const chai = require('chai');
const server = require('../server');
const chai_http = require('chai-http');
const should = chai.should();
const User = require('../model/User');
const MongoInMemory = require('mongodb-memory-server');
const databaseConfig = require('../config/database');

const HTTP_CODE_OK = 200;
const HTTP_CODE_NOT_FOUND = 404;

chai.use(chai_http);

describe('Auth module', async function () {
    before(async function () {
        mongoServer = new MongoInMemory.MongoMemoryServer();
        databaseConfig(await mongoServer.getUri())
    });

    it('should take less than 500ms', function (done) {
        this.timeout(500);
        setTimeout(done, 300);
    });

    it('Hello World', function (done) {
        chai.request(server)
            .get('/')
            .end(function (err, response) {
                response.should.have.status(HTTP_CODE_OK);
                response.body.should.have.property('confirm');
                done();
            })
    });

    it('Get Users', function (done) {
        chai.request(server)
            .get('/users')
            .end(function (err, response) {
                response.should.have.status(HTTP_CODE_OK);
                done();
            })
    });

    it('Cadastrar novo usuario', function (done) {
        chai.request(server)
            .post('/user/signUp')
            .send({
                "name": "Mano Max",
                "email": "gabrielmax@codexjr.com.br",
                "password": "123456"
            })
            .end(function (err, response) {
                response.should.have.status(HTTP_CODE_OK);
                response.body.should.have.property('_id');
                response.body.should.have.property('urlUser');
                response.body.should.have.property('email');
                response.body.should.have.property('password');
                done();
            })
    });

    it('Login com email não cadastrado', function (done) {
        const incorrect_email = 'email@mail.com';
        chai.request(server)
            .post('/user/signIn')
            .send({ 'email': incorrect_email, 'password': 'senha' })
            .end(function (err, response) {
                response.should.have.status(HTTP_CODE_NOT_FOUND);
                done();
            })
    });

    it('Login com credenciais corretas', function (done) {
        const correct_email = "gabrielmax@codexjr.com.br";
        chai.request(server)
            .post('/user/signIn')
            .send({ "email": correct_email, "password": "123456" })
            .end(function (err, response) {
                response.should.have.status(HTTP_CODE_OK);
                response.body.should.have.not.property('user');
                response.body.should.have.property('token');
                response.body.user.should.have.not.property('password');
                done()
            })
    });
});