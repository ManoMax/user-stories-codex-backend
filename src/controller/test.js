const User = require('../model/User');
const Page = require('../model/Page');
const jwt = require('jsonwebtoken');

const TestController = {
  helloWorld(req, res) {
    res.status(200).send( { confirm: 'Hello World' })
  },

  async index(req, res) {
    const users = await User.find();

    return res.json(users);
  },

  async store(req, res) {
    const { name, email, password } = req.body;

    if (name === undefined ||
      email === undefined ||
      password === undefined) return res.status(401).json({ message: 'Preencha todos os campos.' });

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
    }

    return res.json(user);
  },

  async userPage(req, res) {
    const urlUser = req.params.urlUser;

    let page = await Page.findOne({ urlUser });

    return res.json(page);
  },

  async login(req, res) {
    const { email, password } = req.body;

    if (email === undefined ||
      password === undefined) return res.status(401).json({ message: 'Preencha todos os campos.' });

    let user = await User.findOne({ email, password });

    if (!(!user)) {
      let idUser = user._id;
      const token = jwt.sign({ idUser }, process.env.JWT_SECRET, {
        expiresIn: 60 * 60 // expires in 60min
      });

      let new_token_list = user.token_list;
      new_token_list.push(token);
      user = await User.updateOne({
        token_list: new_token_list
      });

      return res.json({ auth: true, token: `Bearer ` + token });
    }

    res.status(404).json({ message: 'Login inválido!' });
  },

  async logout(req, res) {
    let user = req.user;
    new_token_list = user.token_list.remove(req.token);

    user = await User.updateOne({
      token_list: new_token_list
    });

    return res.status(200).json({message: 'User has logout.' });
  },

  async setPerfil(req, res) {
    // adicionar os demais campos
    const { telefone } = req.body;
    const urlUser = req.params.urlUser;

    if (telefone === undefined) return res.status(401).json({ message: 'Preencha algum dos campos.' });

    let page = await Page.findOne({ urlUser });

    if (page.userID === req.userId) {
      page = await Page.updateOne({
        telefone: telefone
      })
      return res.status(200).json({ message: 'Perfil alterado com sucesso.' });
    }
    return res.status(401).json({ message: 'Usuário não tem permissão.' });
  }
};

module.exports = TestController;