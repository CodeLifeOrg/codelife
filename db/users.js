module.exports = function(sequelize, db) {

  return sequelize.define("users",
    {
      id: {
        type: db.STRING,
        primaryKey: true
      },
      username: {
        type: db.STRING,
        allowNull: false,
        unique: true
      },
      email: db.STRING,
      name: db.STRING,
      password: db.STRING,
      salt: db.STRING,
      twitter: db.STRING,
      facebook: db.STRING,
      instagram: db.STRING,
      createdAt: db.DATE,
      updatedAt: db.DATE
    }
  );  

};
