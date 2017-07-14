module.exports = function(sequelize, db) {

  return sequelize.define("testprojects",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: db.TEXT,
      studentcontent: db.TEXT,
      uid: db.TEXT
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

};
