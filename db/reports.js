module.exports = function(sequelize, db) {

  return sequelize.define("reports",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      uid: db.TEXT,
      reportid: db.TEXT,
      reason: db.TEXT
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

};
