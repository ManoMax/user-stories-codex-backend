const router = require('express').Router();
const TestController = require('@controller/test');
const auth = require('./middlewares/Auth')

router.get('/', TestController.helloWorld);

router.post('/user/signUp', TestController.store);

router.get('/users', TestController.index);

router.get('/user/:urlUser', TestController.userPage);

router.post('/signIn', TestController.login);

router.get('/signOut', auth.authorizeUser, TestController.logout);

router.post('/user/:urlUser/setPerfil', auth.authorizeUser, TestController.setPerfil);

module.exports = router;
