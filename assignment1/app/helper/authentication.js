const bcrypt = require('bcrypt');
const sql = require("../models/db.js");
// Basic Authorization
module.exports = basicAuth;

function basicAuth(req, res, next) {
    // make authenticate path public
   
    
    let authHeader = req.headers.authorization;
    if (!authHeader || authHeader.indexOf('Basic ') === -1) {
        return res.status(401).json({ message: 'Missing Authorization Header' });
    }

    const auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const username = auth[0];
    const password = auth[1];
   
    sql.query('select * from user where username = (?)', [username], (err, data) => {
        if (data[0] != null) {
            bcrypt.compare(password, data[0].password, (err, result) => {
                if (result) {
                    const { password, ...userWithoutPassword } = data[0];
                    res.locals.user = userWithoutPassword;
                    next(); // authorized
                } else {
                    
                    return res.status(401).json({ msg: 'Unauthorized' });
                }
            });

        } else {
          
            return res.status(401).json({ msg: 'Unauthorized' });
        }
    });
   

}