module.exports = function(sequelize, db) {

  return sequelize.define("slides",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true
      },
      type: db.TEXT,
      title: db.TEXT,
      htmlcontent1: db.TEXT,
      htmlcontent2: db.TEXT,
      quizjson: db.JSON,
      rulejson: db.JSON,
      mlid: {
        type: db.INTEGER,
        foreignKey: true
      },
      ordering: db.INTEGER
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

};
