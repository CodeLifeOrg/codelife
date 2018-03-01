module.exports = function(sequelize, db) {

  return sequelize.define("userprogress",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      uid: db.STRING,
      level: db.TEXT,
      gems: db.INTEGER,
      datecompleted: db.DATE,
      status: db.STRING
    },
    {
      freezeTableName: true,
      timestamps: false
    }
  );

};
