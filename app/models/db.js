const Sequelize = require("sequelize");
const dbConfig = require("../config/db.config.js");
//initialize sequelize
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  dialect: 'mysql',
  alter :true,
  force: false,
  operatorsAliases: 0,
  replication: {
    read: [
      { host:  process.env.REPLICA }
    ],
    write: { host: process.env.HOST }
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