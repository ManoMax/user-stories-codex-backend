const jwt = require('jsonwebtoken');

const blackList = []

module.exports = {
    verifyJWT(req, res, next) {
        const token = req.headers['x-access-token'];
        const index = blackList.findIndex(item => item === token);
        
        if (index !== -1) return res.status(401).end();
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.SECRET, (err, decoded) => {
            if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });

            // se tudo estiver ok, salva no request para uso posterior
            req.userId = decoded.idUser;
            next();
        });
    },

    logout(req, res) {
        const token = req.headers['x-access-token'];
        const index = blackList.findIndex(item => item === token);
        
        if (index === -1) {
            blackList.push(token);
            return res.status(200).json({message: 'User has logout.' });
        }
        return res.status(401).json({message: 'User was already logged out.' });
    }
}