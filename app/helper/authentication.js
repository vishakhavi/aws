const bcrypt = require('bcrypt');
const userService = require("../service/user.service");
// Basic Authorization
module.exports = basicAuth;

async function basicAuth(req, res, next) {
    // make authenticate path public


    let authHeader = req.headers.authorization;
    if (!authHeader || authHeader.indexOf('Basic ') === -1) {
        return res.status(401).json({
            message: 'Missing Authorization Header'
        });
    }

    const auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const username = auth[0];
    const password = auth[1];

    // sql.query('select * from user where username = (?)', [username], (err, data) => {
    //     if (data[0] != null) {
    //         console.log(data);
    //         bcrypt.compare(password, data[0].password, (err, result) => {
    //             if (result) {
    //                 console.log(result);
    //                 const { password, ...userWithoutPassword } = data[0];
    //                 res.locals.user = userWithoutPassword;
    //                 req.user = data[0];
    //                 next(); // authorized
    //             } else {

    //                 return res.status(401).json({ msg: 'Unauthorized' });
    //             }
    //         });

    //     } else {

    //         return res.status(401).json({ msg: 'Unauthorized' });
    //     }
    // });
    let user = await userService.get(username);
    if (user != null) {
        //validate user using hash password
        bcrypt.compare(password, user.password, (err, result) => {
                        if (err) {
                            console.log(err)
                            return res.status(401).json({ msg: 'Unauthorized' });
                        } else {
                            console.log(result);
                            if(user.verified){
                                const { password, ...userWithoutPassword } = user;
                            res.locals.user = userWithoutPassword;
                            req.user = user;
                            next(); // authorized
                            }else{
                                return res.status(401).json({ msg: 'User email is not verified' });
                            }
                            
                        }
                    });
    }
}