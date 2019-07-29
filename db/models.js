const Sequelize = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "C:\\Users\\magshimim\\Desktop\\project_crypto\\db\\database.sqlite",
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

sequelize.authenticate();

const user = sequelize.define("user", {
  username: {
    type: Sequelize.TEXT,
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  email: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  funds: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  deleted: {
    type: Sequelize.TINYINT,
    defaultValue: 0,
    allowNull: false
  }
});
const loan = sequelize.define("loan", {
  ammount: {
    type: Sequelize.INTEGER,
    defaultValue: 1
  },
  deadline: {
    type: Sequelize.DATE,
    allowNull: false
  },
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  senderId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  recieverId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  rate: {
    type: Sequelize.FLOAT,
    defaultValue: 0.02
  },
  status: {
    type: Sequelize.INTEGER,
    defaultValue: false
  },
  deleted: {
    type: Sequelize.BOOLEAN,
    defaultValue: 0,
    allowNull: false
  }
});

const transaction = sequelize.define("transaction", {
  ammount: {
    type: Sequelize.INTEGER,
    defaultValue: 1
  },
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  senderId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  recieverId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  deleted: {
    type: Sequelize.TINYINT,
    defaultValue: 0,
    allowNull: false
  }
});

transaction.belongsTo(user, {
  foreignKey: "senderId"
});

transaction.belongsTo(user, {
  foreignKey: "recieverId"
});

loan.belongsTo(user, {
  foreignKey: "senderId"
});

loan.belongsTo(user, {
  foreignKey: "recieverId"
});

const init = (force = false) => {
  loan.sync({ force });
  transaction.sync({ force });
  user.sync({ force });
};

module.exports = {
  user,
  loan,
  transaction,
  sequelize,
  Sequelize,
  init
};
