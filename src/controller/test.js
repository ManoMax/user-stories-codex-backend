const User = require('../model/User');
const Page = require('../model/Page');
const jwt = require('jsonwebtoken');

const TestController = {
  helloWorld(req, res) {
    res.send('Hello World')
  },

  async index(req, res) {
    const users = await User.find();

    return res.json(users);
  },

  async store(req, res) {
    const { name, email, password } = req.body;

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
    
    let user = await User.findOne({ email, password });

    if (!(!user)) {
      let idUser = user._id;
      const token = jwt.sign({ idUser }, process.env.SECRET, {
        expiresIn: 60 * 60 // expires in 60min
      });
      return res.json({ auth: true, token: token });
    }

    res.status(500).json({message: 'Login inválido!'});
  },

  async setTelefone(req, res) {
    const { telefone } = req.body;
    const urlUser = req.params.urlUser;

    let page = await Page.findOne({ urlUser });

    if (page.userID === req.userId) {
      page = await Page.updateOne({
        telefone: telefone
      })
      return res.status(200).json({message: 'Telefone alterado com sucesso.' });
      }
    return res.status(401).json({message: 'Usuário não tem permissão.' });
  }
};

module.exports = TestController;