const Project = require('../model/Project');
const { findById } = require('../model/User');
const User = require('../model/User');

const HTTP_CODE_OK = 200;
const HTTP_CODE_CREATED = 201;
const HTTP_CODE_BAD_REQUEST = 400;
const HTTP_CODE_UNAUTHORIZED = 401;
const HTTP_CODE_NOT_FOUND = 404;

const ProjectController = {

  async store(req, res) {
    if (req.user.cargo !== 'squad') {
      return res.status(HTTP_CODE_UNAUTHORIZED).json({ message: 'Usuário não tem permissão para criar um Projeto.' });
    }

    let { name, inicio, termino, ativo, integrantes } = req.body;

    if (name === undefined ||
      inicio === undefined ||
      termino === undefined ||
      ativo === undefined) return res.status(HTTP_CODE_BAD_REQUEST).json({ message: 'Preencha todos os campos.' });

    if (integrantes.length === 0) {
      return res.status(HTTP_CODE_BAD_REQUEST).json({ message: 'O projeto deve conter ao menos 1 integrante.' });
    }

    let project = await Project.findOne({ name });

    if (!project) {
      let user;
      let usuariosCadastrados = [];
      let usuariosCadastrados2 = [];
      let usuariosNaoEncontrados = [];

      for (var i = 0; i < integrantes.length; i++) {
        let name = integrantes[i];
        user = await User.findOne({ name });

        if (user === null) {
          usuariosNaoEncontrados.push(name);
        } else {
          usuariosCadastrados.push(user._id);
          usuariosCadastrados2.push(user.name);
        }
      }

      if (usuariosCadastrados.length === 0) {
        return res.status(HTTP_CODE_BAD_REQUEST).json({ message: 'O sistema não encontrou nenhum usuário com o(s) nome(s) indicado(s).' });
      }

      integrantes = usuariosCadastrados;
      usuariosCadastrados = usuariosCadastrados2;

      let idProj = await Project.countDocuments();
      project = await Project.create({
        name,
        inicio,
        termino,
        ativo,
        idProj,
        integrantes
      });

      let projId = project._id;
      integrantes.forEach(async userID => {
        let _id = userID;
        

        if (project.ativo) {
          user = await User.findByIdAndUpdate(_id, {
            $push: { projAtivos: projId }
          })
        } else {
          user = await User.findByIdAndUpdate(_id, {
            $push: { projFinalizados: projId }
          })
        }
      })

      response = {
        usuariosCadastrados,
        usuariosNaoEncontrados,
        message: 'Projeto cadastrado com sucesso.'
      }

      return res.status(HTTP_CODE_CREATED).json( response );
    } else {
      return res.status(HTTP_CODE_BAD_REQUEST).json({ message: 'Nome de Projeto já cadastrado.' });
    }
  },

  async index(req, res) {
    let projects = await Project.find();
    let projectsDTO = [];

    projects.forEach(project => {
      projectsDTO.push({
        name: project.name,
        idProj: project.idProj,
        inicio: project.inicio,
        termino: project.termino,
        ativo: project.ativo,
      })
    })

    return res.status(HTTP_CODE_OK).json(projectsDTO);
  },

  async setProject(req, res) {
    if (req.user.cargo !== 'squad') {
      return res.status(HTTP_CODE_UNAUTHORIZED).json({ message: 'Usuário não tem permissão para editar um Projeto.' });
    }

    const newProjectData = {
      idProj,
      name,
      inicio,
      termino,
      ativo
    } = req.body;

    let project = await Project.findOne({ idProj });

    if (!project) {
      return res.status(HTTP_CODE_NOT_FOUND).json({ message: 'Projeto não encontrado.' });
    } else {
      project = await Project.findOneAndUpdate(project.idProj, {
        name: (newProjectData.name !== undefined) ? newProjectData.name : project.name,
        inicio: (newProjectData.inicio !== undefined) ? newProjectData.inicio : project.inicio,
        termino: (newProjectData.termino !== undefined) ? newProjectData.termino : project.termino,
        ativo: (newProjectData.ativo !== undefined) ? newProjectData.ativo : project.ativo,
      })

      project = await Project.findOne({ idProj });

      if (project.ativo === false) {
        for (var i = 0 ; i < project.integrantes.length ; i++) {
          await User.findOneAndUpdate({ _id: project.integrantes[i]}, {
            $pull: { projAtivos: project._id },
            $push: { projFinalizados: project._id }
          })
        }
      } else {
        for (var i = 0 ; i < project.integrantes.length ; i++) {
          await User.findOneAndUpdate({ _id: project.integrantes[i]}, {
            $push: { projAtivos: project._id },
            $pull: { projFinalizados: project._id }
          })
        }
      }

      let response = {
        name,
        inicio,
        termino,
        ativo,

        message: 'Perfil alterado com sucesso.'
      }
      return res.status(HTTP_CODE_OK).json(response);
    }
  },
};

module.exports = ProjectController;