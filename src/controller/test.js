const User = require('../model/User');
const Page = require('../model/Page');

const TestController = {
  helloWorld(req, res) {
    res.send('Hello World')
  },

  async index(request, response) {
    const users = await User.find();

    return response.json(users);
  },

  async store(request, response) {
    const { name, email, password } = request.body;

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
        urlUser
      })
    }

    return response.json(user);
  },

  async userPage(request, response) {
    const urlUser = request.params.urlUser;

    let page = await Page.findOne({ urlUser });

    return response.json(page);
  },
};

module.exports = TestController;