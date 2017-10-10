module.exports = function(sequelize, db) {

  return sequelize.define("reports",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      uid: db.TEXT,
      reason: db.TEXT,
      comment: db.TEXT,
      report_id: db.INTEGER,
      type: db.TEXT, 
      status: db.TEXT
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

};
