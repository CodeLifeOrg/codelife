module.exports = function(sequelize, db) {

  return sequelize.define("slides",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true
      },
      type: db.TEXT,
      title: db.TEXT,
      htmlcontent: db.TEXT,
      imgblob: db.TEXT,
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
