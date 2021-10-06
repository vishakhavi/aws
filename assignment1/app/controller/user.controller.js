const User = require("../models/user.model.js");

const emailValidator = require('email-validator');
const validator = require('../helper/validator.js');
const moment = require('moment');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const {v4 : uuid4} = require('uuid')
const sql = require("../models/db.js");

// Create and Save a new Customer

exports.create = async (req, res) => {
    // Validate request
    if (!req.body) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
    }else if (emailValidator.validate(req.body.username) == false) {
          
     return res.status(400).json({ msg: `${req.body.username} is not a valid email!` });
    }
else if(validator.schema.validate(req.body.password) == false){
    
     return res.status(400).json({
          msg: 'Password must be: atleast 8 letters & should contain an uppercase, a lowercase, a digit & a symbol! No spaces allowed'
     });
}
    const password = req.body.password;    
    const encryptedPassword = await bcrypt.hash(password, saltRounds)
    // Create a Customer
    const user = new User({
      username: req.body.username,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      password:encryptedPassword,
      id:uuid4()
      
    });
  
    // Save user data in the database
    User.create(user, (err, data) => {
      if (err){
        res.status(500).send({
            message:
              err.message || "Some error occurred while creating the User."
          });
          res.status(400).json({ 
            message: ` Email: ${req.body.username} already exists!`
          });
      }
        else {
            
            return res.status(201).json({
                 id: data.id,
                 first_name: data.first_name,
                 last_name: data.last_name,
                 username: data.username,
                 account_created: data.account_created,
                 account_updated: data.account_updated
            });
       }
    });
  };

// get all user data from the database.

exports.getUserDetails= (req,res) => {
     if (res.locals.user) {
          res.statusCode = 200;
          res.locals.user.account_created = res.locals.user.account_created;
          res.locals.user.account_updated = res.locals.user.account_updated;
          res.setHeader('Content-Type', 'application/json');
          res.json(res.locals.user);
     }
};

// Update user details
exports.getUpdatedDetails = ((req, res, next) => {
    
     if (res.locals.user) {
         if (Object.keys(req.body).length > 0) {
              let contentType = req.headers['content-type'];
              if (contentType == 'application/json') {
                   let id = req.body.id;
                   let password = req.body.password;
                   let username = req.body.username;
                   
                   if (password != "") {
                     if (validator.schema.validate(password) === true){
                       let hashedPassword = bcrypt.hashSync(password, 10);
                       req.body.password = hashedPassword;
                     }else{
                       return res.status(400).json({
                            msg: 'Password must be: atleast 8 letters & should contain an uppercase, a lowercase, a digit & a symbol! No spaces allowed'
                       });
                     }
                   } else {
                     return res.status(400).json({
                       msg: 'Password cannot be null'
                    });                      
                   }

                   if ( username == null ) {       
                        return res.status(400).json({ msg: 'Invalid request body' });
                   } else {
                        let update_set = Object.keys(req.body).map(value => {
                             return ` ${value}  = "${req.body[value]}"`;
                        });
                        
                        sql.query(`UPDATE user SET ${update_set.join(" ,")}, account_updated="${moment().format('YYYY-MM-DD HH:mm:ss')}" WHERE username = "${res.locals.user.username}"`, function (error, results) {
                             if (error) {
                                 return res.status(400).json({ msg: "Update query execution failed" });
                             } else {
                                 return res.status(200).json({ msg: "Data updated successfully" });
                             }
                        });
                   }
              } else {
                  
                   return res.status(400).json({ msg: 'Request type must be JSON!' });
              }
         } else {
             
              return res.status(400).json({ msg: 'Invalid Request Body' });
         }
    } else {
        
         return res.status(401).json({ msg: 'Unauthorized' });
    }
    
   });

