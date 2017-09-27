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
      codeblock_id: db.INTEGER,
      project_id: db.INTEGER
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

};
