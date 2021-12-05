const Sequelize = require("sequelize");
const dbConfig = require("../config/db.config.js");
const fs = require('fs');
const tls = require('tls');
//initialize sequelize
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  dialect: 'mysql',
  alter :true,
  force: false,
  operatorsAliases: 0,
  replication: {
    read: { host:  dbConfig.REPLICA },
    write: { host: dbConfig.HOST }
  },
  dialectOptions: {
    ssl: {
    require: true,
    rejectUnauthorized: false,
    checkServerIdentity: (host, cert) => {
      const error = tls.checkServerIdentity(host, cert);            
      if (error && !cert.subject.CN.endsWith('.rds.amazonaws.com')) {
              return error;
          }
      },
    ca: fs
      .readFileSync("./app/config/certs/global-bundle.pem")
      .toString()
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.User = require("./user.model")(sequelize, Sequelize);
db.Image = require("./image.model")(sequelize, Sequelize);
module.exports = db;