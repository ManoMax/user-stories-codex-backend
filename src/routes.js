const router = require('express').Router();
const UserController = require('@controller/userController');
const ProjectController = require('@controller/projectController');
const auth = require('./middlewares/Auth')

router.get('/', auth.authorizeUser, UserController.home);

router.post('/signUp', UserController.store);

// router.get('/users', UserController.index);

router.post('/signIn', UserController.login);

router.get('/signOut', auth.authorizeUser, UserController.logout);

router.get('/user/:urlUser', auth.authorizeUser, UserController.userPage);

router.post('/user/:urlUser/setPerfil', auth.authorizeUser, UserController.setPerfil);

router.get('/projects', auth.authorizeUser, ProjectController.index);

router.post('/signUpProject', auth.authorizeUser, ProjectController.store);

router.post('/setProject', auth.authorizeUser, ProjectController.setProject);

module.exports = router;
