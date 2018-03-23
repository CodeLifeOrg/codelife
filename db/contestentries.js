module.exports = function(sequelize, db) {

  const c = sequelize.define("contestentries",
    {
      uid: {
        type: db.STRING,
        primaryKey: true
      },
      eligible: db.INTEGER,
      project_id: db.INTEGER,
      timestamp: db.DATE 
    },
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return c;

};
