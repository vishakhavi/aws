const User = require("../models/user.model.js");
const userService = require("../service/user.service");
const emailValidator = require('email-validator');
//const createDynamoDB = require('./dynamodb');
const validator = require('../helper/validator.js');
const snsService = require("../service/aws.sns.service");
const moment = require('moment');
const bcrypt = require('bcrypt');
const AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
const ddb = new AWS.DynamoDB.DocumentClient();
const saltRounds = 10;
const {
     v4: uuid4
} = require('uuid')
const sql = require("../models/db.js");
const {parseHrtimeToSeconds} = require("../service/timer.service");
const metricsService = require("../service/statsd.service");
const loggerService = require("../service/logger.service");
const { propfind } = require("superagent");

// Create and Save a new Customer

exports.create = async (req, res) => {
     // Validate request
     metricsService.counter("POST.users");
     let timerStart = process.hrtime();
     let createUser = Object.assign({}, req.body);
     if (!req.body) {
          res.status(400).send({
               message: "Content can not be empty!"
          });
     } else if (emailValidator.validate(req.body.username) == false) {

          return res.status(400).json({
               msg: `${req.body.username} is not a valid email!`
          });
     } else if (validator.schema.validate(req.body.password) == false) {

          return res.status(400).json({
               msg: 'Password must be: atleast 8 letters & should contain an uppercase, a lowercase, a digit & a symbol! No spaces allowed'
          });
     } else {
          //valid request body
          try {
               //let verifyUser = await createDynamoDB.handler(req.body);
              // console.log(verifyUser.message)
               let newUser = await userService.create(req.body);
               let timeElapsed = (parseHrtimeToSeconds(process.hrtime(timerStart)) * 1000);
               metricsService.timer("Timer.API.POST.users", timeElapsed);
               loggerService.info("User created");
               snsService.sendMessage(`${req.body.username}`);
               res.status(201).json(newUser);
          } catch (ex) {
               let timeElapsed = (parseHrtimeToSeconds(process.hrtime(timerStart)) * 1000);
               metricsService.timer("Timer.API.POST.users", timeElapsed);
               if (ex.name == "SequelizeUniqueConstraintError") {
                //user with same email exists
                    res.status(400).json({
                    "message": "Username already exists."
                    })
               }
               loggerService.error("Exception at user.controller.js create user", ex);
               res.status(500).json(ex);
          }
     }
};

// get all user data from the database.
exports.verifyUser = async (req,res) => {
     loggerService.info(req.protocol+"://"+req.get('host'));
     loggerService.info('query'+req.query.email);
     if((req.protocol+"://"+req.get('host'))==("http://prod.vishakhavinayak.me"))
     {
          loggerService.info("Domain is matched. Information is from Authentic email");
         if(req.query.email.length != 0)
         {
             loggerService.info("email is verified");
          // var result = await ddb.query({
          //      TableName: 'Verify_Email_table',
          //      FilterExpression: 'TimeToExist >= :currentEpoch',
          //      ExpressionAttributeValues: {
          //        ':currentEpoch': Date.now() / 1000
          //      }
          //    }).promise()
          
               var params = {
                    TableName: "Verify_Email_table",
                    FilterExpression: '#username = :username',
                    ExpressionAttributeNames: {
                        '#username': 'username',
                    },
                    ExpressionAttributeValues: {
                        ':username': req.query.email,
                    },
                  };
          var result = await ddb.scan(params).promise()

        
          loggerService.info("result==>"+JSON.stringify(result))
        
           loggerService.info("email from dynamodb"+ result.Items[0].username);
           let email = result.Items[0].username;
           let token = result.Items[0].token;
           let ttl = result.Items[0].ttl;
           let currentTime = Date.now()/1000;
           loggerService.info("dynamodb"+email +"   "+token);
           loggerService.info("query email"+req.query.email +" query token  "+req.query.token);
           if(ttl < currentTime){
               loggerService.info("token has expired");
               res.end("<h1>Token has expired!</h>");
           }else{
               if(email == req.query.email && token == req.query.token){
                    res.end("<h1>Email "+req.query.email+" is been Successfully verified</h1>");
                }else{
                    res.end("<h1>Email "+req.query.email+" or token is invalid/h1>");
                }
           }
           
         }
         else
         {
             loggerService.info("email is not verified");
             res.end("<h1>Bad Request</h1>");
         }
     }
     else
     {
         res.end("<h1>Request is from unknown source");
     }
}

exports.getUserDetails = (req, res) => {
     
     if (res.locals.user) {
          res.statusCode = 200;
          res.locals.user.account_created = res.locals.user.account_created;
          res.locals.user.account_updated = res.locals.user.account_updated;
          metricsService.counter("GET.users.id");
          let timerStart = process.hrtime();
          const {
               password,
               ...rest
          } = res.locals.user.dataValues;
          let timeElapsed = (parseHrtimeToSeconds(process.hrtime(timerStart)) * 1000);
          metricsService.timer("Timer.API.GET.users.username", timeElapsed);
          loggerService.info("User found & returned");
          res.setHeader('Content-Type', 'application/json');
          res.json(rest);
     }
};

// Update user details
exports.getUpdatedDetails = (async(req, res, next) => {
     metricsService.counter("PUT.users.id");
     let timerStart = process.hrtime();
     if (res.locals.user) {
          if (Object.keys(req.body).length > 0) {
               let contentType = req.headers['content-type'];
               if (contentType == 'application/json') {
                    let id = req.body.id;
                    let password = req.body.password;
                    let username = req.body.username;
                    let updateUser = Object.assign({}, req.body);
                    if (password != "") {
                         if (validator.schema.validate(password) === true) {
                              let hashedPassword = bcrypt.hashSync(password, 10);
                              req.body.password = hashedPassword;
                         } else {
                              return res.status(400).json({
                                   msg: 'Password must be: atleast 8 letters & should contain an uppercase, a lowercase, a digit & a symbol! No spaces allowed'
                              });
                              
                         }
                    } else {
                         return res.status(400).json({
                              msg: 'Password cannot be null'
                         });
                    }

                    if (username == null) {
                         return res.status(400).json({
                              msg: 'Invalid request body'
                         });
                    } else {
                         // let update_set = Object.keys(req.body).map(value => {
                         //      return ` ${value}  = "${req.body[value]}"`;
                         // });
                         try {
                              let updatedUser = await userService.update(req.body, req.user.id);
                              let timeElapsed = (parseHrtimeToSeconds(process.hrtime(timerStart)) * 1000);
                              metricsService.timer("Timer.API.GET.users.id", timeElapsed);
                              loggerService.info("User update successful");
                              res.status(204).send();
                         } catch (ex) {
                              let timeElapsed = (parseHrtimeToSeconds(process.hrtime(timerStart)) * 1000);
                              metricsService.timer("Timer.API.GET.users.id", timeElapsed);
                              loggerService.error("Exception at user.controller.js update user", ex);
                              res.status(500).json(ex);
                         }
                    }
               } else {

                    return res.status(400).json({
                         msg: 'Request type must be JSON!'
                    });
               }
          } else {

               return res.status(400).json({
                    msg: 'Invalid Request Body'
               });
          }
     } else {

          return res.status(401).json({
               msg: 'Unauthorized'
          });
     }

});