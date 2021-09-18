const User = require('../model/User');
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
    const { name, email, password, cargoAtual } = req.body;

    if (name === undefined ||
      email === undefined ||
      password === undefined ||
      cargoAtual === undefined) return res.status(HTTP_CODE_BAD_REQUEST).json({ message: 'Preencha todos os campos.' });

    let user = await User.findOne({ email });

    if (!user) {
      var temporalUrl = name.replace(/\s/g, '').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, "");

      let urlUser = temporalUrl;
      let urlUnavailable = true;

      while (urlUnavailable) {
        let userWithThisURL = await User.findOne({ urlUser });

        if (!userWithThisURL) {
          urlUnavailable = false;
        } else {
          urlUser = temporalUrl;
          let randonNum = Math.floor(Math.random() * 1001);
          urlUser = temporalUrl + randonNum.toString();
        }
      }

      user = await User.create({
        name,
        email,
        password,
        urlUser,
        cargoAtual
      });

      return res.status(HTTP_CODE_CREATED).json({ message: 'E-mail cadastrado com sucesso.' });
    } else {
      return res.status(HTTP_CODE_BAD_REQUEST).json({ message: 'E-mail já cadastrado.' });
    }
  },

  async userPage(req, res) {
    const urlUser = req.params.urlUser;

    let user = await User.findOne({ urlUser });

    if (!user) {
      return res.status(HTTP_CODE_NOT_FOUND).json({ message: 'Perfil não encontrado.' });
    } else {
      dataPage = {
        name: user.name,
        email: user.email,
        telefone: user.telefone,
        foto: user.foto,
        cargoAtual: user.cargoAtual,
        especialidades: user.especialidades,
        instagram: user.instagram,
        linkedin: user.linkedin,
        aniversário: user.aniversário,
        cpf: user.cpf,
        urlUser: user.urlUser
      }

      return res.status(HTTP_CODE_OK).json(dataPage);
    }
  },

  async login(req, res) {
    const { email, password } = req.body;

    if (email === undefined ||
      password === undefined) return res.status(HTTP_CODE_BAD_REQUEST).json({ message: 'Preencha todos os campos.' });

    let user = await User.findOne({ email });

    if (!user) {
      return res.status(HTTP_CODE_UNAUTHORIZED).json({ message: 'Email não cadastrado' });
    } else {
      if (user.password === password) {
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
      } else {
        return res.status(HTTP_CODE_UNAUTHORIZED).json({ message: 'Senha inválida' });
      }
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
    const newUserData = { 
      name,
      telefone,
      foto,
      instagram,
      linkedin,
      aniversário,
      cpf,
      } = req.body;
      
    const urlUser = req.params.urlUser;

    if (newUserData.telefone === undefined) return res.status(HTTP_CODE_BAD_REQUEST).json({ message: 'Preencha algum dos campos.' });

    let user = await User.findOne({ urlUser });

    if (!user) {
      return res.status(HTTP_CODE_BAD_REQUEST).json({ message: 'Perfil não encontrado.' });
    }

    if (user._id.equals(req.userId)) {

      user = await User.findByIdAndUpdate(user._id, {
        telefone: (telefone !== undefined) ? telefone : user.telefone,
        name: (name !== undefined) ? name : user.name,
        foto: (foto !== undefined) ? foto : user.foto,
        instagram: (instagram !== undefined) ? instagram : user.instagram,
        linkedin: (linkedin !== undefined) ? linkedin : user.linkedin,
        aniversário: (aniversário !== undefined) ? aniversário : user.aniversário,
        cpf: (cpf !== undefined) ? cpf : user.cpf,
      })
      return res.status(HTTP_CODE_OK).json({ message: 'Perfil alterado com sucesso.' });
    }
    return res.status(HTTP_CODE_UNAUTHORIZED).json({ message: 'Usuário não tem permissão.' });
  }
};

module.exports = TestController;