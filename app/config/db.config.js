module.exports = {
    HOST: process.env.DB_HOSTNAME || "localhost",
    REPLICA : process.env.DB_HOSTNAME_REPLICA || "localhost",
    USER: process.env.DB_USERNAME || "root",
    PASSWORD: process.env.DB_PASSWORD || "Cloud!123",
    DB: process.env.DB_NAME || "webapp"
  };