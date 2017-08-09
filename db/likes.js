module.exports = function(sequelize, db) {

  return sequelize.define("likes",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      uid: db.STRING,
      likeid: db.INTEGER,
      type: db.STRING
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

};
