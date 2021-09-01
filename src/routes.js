const router = require('express').Router();
const TestController = require('@controller/test');

router.get('/', TestController.helloWorld);

router.post('/users', TestController.store);

router.get('/users', TestController.index);

router.get('/user/:urlUser', TestController.userPage);

module.exports = router;
