const User = require('../model/User');
const Page = require('../model/Page');
const jwt = require('jsonwebtoken');

const HTTP_CODE_OK = 200;
const HTTP_CODE_CREATED = 201;
const HTTP_CODE_BAD_REQUEST = 400;
const HTTP_CODE_UNAUTHORIZED = 401;
const HTTP_CODE_NOT_FOUND = 404;

const TestController = {
  helloWorld(req, res) {
    res.status(HTTP_CODE_OK).send( { confirm: 'Hello World' })
  },

  async index(req, res) {
    const users = await User.find();

    return res.status(HTTP_CODE_OK).json(users);
  },

  async store(req, res) {
    const { name, email, password } = req.body;

    if (name === undefined ||
      email === undefined ||
      password === undefined) return res.status(HTTP_CODE_BAD_REQUEST).json({ message: 'Preencha todos os campos.' });

    let user = await User.findOne({ email });

    if (!user) {
      var urlUser = name.replace(/\s/g, '').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, "");

      user = await User.create({
        name,
        email,
        password,
        urlUser
      });

      page = await Page.create({
        urlUser,
        userID: user._id
      })

      return res.status(HTTP_CODE_CREATED).json(user);
    } else {
      return res.status(HTTP_CODE_BAD_REQUEST).json({ message: 'E-mail já cadastrado.' });
    }
  },

  async userPage(req, res) {
    const urlUser = req.params.urlUser;

    let page = await Page.findOne({ urlUser });

    if (!page) {
      return res.status(HTTP_CODE_NOT_FOUND).json({ message: 'Perfil não encontrado.' });
    } else {
      return res.status(HTTP_CODE_OK).json(page);
    }
  },

  async login(req, res) {
    const { email, password } = req.body;

    if (email === undefined ||
      password === undefined) return res.status(HTTP_CODE_BAD_REQUEST).json({ message: 'Preencha todos os campos.' });

    let user = await User.findOne({ email, password });

    if (!user) {
      return res.status(HTTP_CODE_UNAUTHORIZED).json({ message: 'Login inválido!' });
    } else {
      let idUser = user._id;
      const token = jwt.sign({ idUser }, process.env.JWT_SECRET, {
        expiresIn: 60 * 60 // expires in 60min
      });

      let new_token_list = user.token_list;
      new_token_list.push(token);
      user = await User.findByIdAndUpdate(user._id, {
        token_list: new_token_list
      });

      return res.status(HTTP_CODE_OK).json({ auth: true, token: `Bearer ` + token });
    }
  },

  async logout(req, res) {
    let user = req.user;
    new_token_list = user.token_list.remove(req.token);

    user = await User.findByIdAndUpdate(user._id, {
      token_list: new_token_list
    });

    return res.status(HTTP_CODE_OK).json({message: 'User has logout.' });
  },

  async setPerfil(req, res) {
    // adicionar os demais campos
    const { telefone } = req.body;
    const urlUser = req.params.urlUser;

    if (telefone === undefined) return res.status(HTTP_CODE_BAD_REQUEST).json({ message: 'Preencha algum dos campos.' });

    let page = await Page.findOne({ urlUser });

    if (!page) {
      return res.status(HTTP_CODE_BAD_REQUEST).json({ message: 'Perfil não encontrado.' });
    }

    if (page.userID === req.userId) {
      page = await Page.findByIdAndUpdate(page._id, {
        telefone: telefone
      })
      return res.status(HTTP_CODE_OK).json({ message: 'Perfil alterado com sucesso.' });
    }
    return res.status(HTTP_CODE_UNAUTHORIZED).json({ message: 'Usuário não tem permissão.' });
  }
};

module.exports = TestController;