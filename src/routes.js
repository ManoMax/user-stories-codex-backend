const router = require('express').Router();
const TestController = require('@controller/test');
const jwtAuth = require('./jwtAuth');

router.get('/', TestController.helloWorld);

router.post('/registerUser', TestController.store);

router.get('/users', TestController.index);

router.get('/user/:urlUser', TestController.userPage);

router.post('/login', TestController.login);

router.post('/logout', jwtAuth.logout, (req, res) => res.end());

router.post('/user/:urlUser/setTelefone', jwtAuth.verifyJWT, TestController.setTelefone);

module.exports = router;
