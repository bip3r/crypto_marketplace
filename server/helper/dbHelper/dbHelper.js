const Sequelize = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "../db/database.sqlite",
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});
const open = () => {
  return new Promise((resolve, reject) => {
    sequelize
      .authenticate()
      .then(() => {
        console.log("Connection has been established successfully.");
        resolve(sequelize);
      })
      .catch(err => {
        console.error("Unable to connect to the database:", err);
        reject(err);
      });
  });
};

const close = () => {
  return sequelize.close();
};

const checkConnection = () => {
  return sequelize.authenticate();
};
module.exports = {
  open,
  close,
  checkConnection
};
