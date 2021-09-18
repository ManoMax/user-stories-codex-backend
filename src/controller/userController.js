const User = require('../model/User');
const jwt = require('jsonwebtoken');

const HTTP_CODE_OK = 200;
const HTTP_CODE_CREATED = 201;
const HTTP_CODE_BAD_REQUEST = 400;
const HTTP_CODE_UNAUTHORIZED = 401;
const HTTP_CODE_NOT_FOUND = 404;

const UserController = {
  home(req, res) {
    let user = req.user;

    let userDTO = {
      name: user.name,
      foto: user.foto,
      urlUser: user.urlUser,
      cargo: user.cargo
    }

    res.status(HTTP_CODE_OK).send( userDTO );
  },

  async store(req, res) {
    const { name, email, password, cargo } = req.body;

    if (name === undefined ||
      email === undefined ||
      password === undefined ||
      cargo === undefined) return res.status(HTTP_CODE_BAD_REQUEST).json({ message: 'Preencha todos os campos.' });

    if (cargo !== 'squad' && cargo !== 'membro') {
      return res.status(HTTP_CODE_BAD_REQUEST).json({ message: "O campo de Cargo deve ser 'membro' ou 'squad'." });
    }

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
        cargo
      });

      return res.status(HTTP_CODE_CREATED).json({ message: 'E-mail cadastrado com sucesso.' });
    } else {
      return res.status(HTTP_CODE_BAD_REQUEST).json({ message: 'E-mail já cadastrado.' });
    }
  },

  async index(req, res) {
    const users = await User.find();

    return res.status(HTTP_CODE_OK).json(users);
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
        cargo: user.cargo,
        especialidades: user.especialidades,
        instagram: user.instagram,
        linkedin: user.linkedin,
        aniversario: user.aniversario,
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

        let response = {
          auth: true,
          token: `Bearer ` + token,

          name: user.name,
          foto: user.foto,
          urlUser: user.urlUser,
          cargo: user.cargo
        }
  
        return res.status(HTTP_CODE_OK).json( response );
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
      especialidades,
      instagram,
      linkedin,
      aniversario,
      cpf,
      } = req.body;
      
    const urlUser = req.params.urlUser;

    let user = await User.findOne({ urlUser });

    if (!user) {
      return res.status(HTTP_CODE_BAD_REQUEST).json({ message: 'Perfil não encontrado.' });
    }

    if (user._id.equals(req.userId)) {

      user = await User.findByIdAndUpdate(user._id, {
        telefone: (newUserData.telefone !== undefined) ? newUserData.telefone : user.telefone,
        name: (newUserData.name !== undefined) ? newUserData.name : user.name,
        foto: (newUserData.foto !== undefined) ? newUserData.foto : user.foto,
        especialidades: (newUserData.especialidades !== undefined) ? newUserData.especialidades.split(' ') : undefined,
        instagram: (newUserData.instagram !== undefined) ? newUserData.instagram : user.instagram,
        linkedin: (newUserData.linkedin !== undefined) ? newUserData.linkedin : user.linkedin,
        aniversario: (newUserData.aniversario !== undefined) ? newUserData.aniversario : user.aniversario,
        cpf: (newUserData.cpf !== undefined) ? newUserData.cpf : user.cpf,
      })

      user = await User.findOne({ urlUser });
      let response = {
        foto: user.foto,
        cargo: user.cargo,

        message: 'Perfil alterado com sucesso.'
      }
      return res.status(HTTP_CODE_OK).json( response );
    }
    return res.status(HTTP_CODE_UNAUTHORIZED).json({ message: 'Usuário não tem permissão.' });
  }
};

module.exports = UserController;