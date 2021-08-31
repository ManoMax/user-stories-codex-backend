const User = require('../model/User');

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
      user = await User.create({
        name,
        email,
        password
      });
    }

    return response.json(user);
  }
};

module.exports = TestController;