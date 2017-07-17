module.exports = function(sequelize, db) {

  return sequelize.define("userprogress",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      uid: db.STRING,
      level: db.TEXT
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

};
