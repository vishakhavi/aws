const User = require("../models/user.model.js");
const userService = require("../service/user.service");
const emailValidator = require('email-validator');
//const createDynamoDB = require('./dynamodb');
const validator = require('../helper/validator.js');
const snsService = require("../service/aws.sns.service");
const moment = require('moment');
const bcrypt = require('bcrypt');
const AWS = require('aws-sdk');
AWS.config.update({
     region: 'us-east-1'
});
const ddb = new AWS.DynamoDB.DocumentClient();
const saltRounds = 10;
const {
     v4: uuid4
} = require('uuid')
const sql = require("../models/db.js");
const {
     parseHrtimeToSeconds
} = require("../service/timer.service");
const metricsService = require("../service/statsd.service");
const loggerService = require("../service/logger.service");

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
               let status = false;
               let timeElapsed = (parseHrtimeToSeconds(process.hrtime(timerStart)) * 1000);
               metricsService.timer("Timer.API.POST.users", timeElapsed);
               loggerService.info("User created");
               snsService.sendMessage(`${req.body.username}`);

               let newUser = await userService.create(req.body);
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
exports.verifyUser = async (req, res) => {
     loggerService.info(req.protocol + "://" + req.get('host'));
     loggerService.info('query email==>' + req.query.email);
     loggerService.info('query token==>' + req.query.token);
     if ((req.protocol + "://" + req.get('host')) == ("http://prod.vishakhavinayak.me")) {
          loggerService.info("Domain is matched. Information is from Authentic email");
          if (req.query.email.length != 0) {
               loggerService.info("email is verified");
               // var result = await ddb.query({
               //      TableName: 'Verify_Email_table',
               //      FilterExpression: 'TimeToExist >= :currentEpoch',
               //      ExpressionAttributeValues: {
               //        ':currentEpoch': Date.now() / 1000
               //      }
               //    }).promise()

               var params = {
                    Key: {
                         "username": req.query.email
                     },
                     ExpressionAttributeValues: {
                         ':u': req.query.email,
                       },
                    FilterExpression: 'username = :u',
                    TableName: 'Verify_Email_table'
                  };
               loggerService.info("params==>" + params);
               ddb.scan(params, async (error, record) =>{
                    if (error) {
                         loggerService.info({
                              msg: "Error in DynamoDB get method ",
                              error: error
                         });
                         console.log("Error in DynamoDB get method ", error);
                         return res.status(400).json({
                              status: 400,
                              error: error
                         });
                    } else {
                         let isTokenValid = false;
                         console.log("Checking if record already present in DB!!");
                         if (record.Items[0] == null || record.Items[0] == undefined) {
                              loggerService.info({
                                   msg: "No record in Dynamo ",
                                   record: record
                              });
                              isTokenValid = false;
                         } else {
                              if (record.Items[0].ttl.N < Math.floor(Date.now() / 1000)) {
                                   loggerService.info({
                                        msg: "ttl expired ",
                                        record: record
                                   });
                                   isTokenValid = false;
                              } else {
                                   loggerService.info({
                                        msg: "ttl found ",
                                        record: record
                                   });
                                   isTokenValid = true;
                              }
                         }
                         if (isTokenValid) {
                              try{
                              let verifiedUser = await userService.updateVerifiedUser(true, req.query.email);
                              loggerService.info("User update successful");
                              res.status(204).send();
                         } catch (ex) {
                              loggerService.error("Exception at user.controller.js update user", ex);
                              res.status(500).json(ex);
                         }
                         } else {
                              logger.info('User cannot be verified as token expired');
                              return res.status(204).json({
                                   status: 400,
                                   description: 'Token Expired'
                              });
                         }
                    }
               })
          }
     }
};


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
exports.getUpdatedDetails = (async (req, res, next) => {
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