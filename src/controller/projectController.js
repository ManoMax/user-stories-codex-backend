const Project = require('../model/Project');

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

    let { name, inicio, termino, ativo } = req.body;

    if (name === undefined ||
      inicio === undefined ||
      termino === undefined ||
      ativo === undefined) return res.status(HTTP_CODE_BAD_REQUEST).json({ message: 'Preencha todos os campos.' });

    let project = await Project.findOne({ name });

    if (!project) {

      let idProj = await Project.countDocuments();
      project = await Project.create({
        name,
        inicio,
        termino,
        ativo,
        idProj
      });

      return res.status(HTTP_CODE_CREATED).json({ message: 'Projeto cadastrado com sucesso.' });
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