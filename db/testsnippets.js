module.exports = function(sequelize, db) {

  return sequelize.define("testsnippets",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true
      },
      name: db.STRING,
      htmlcontent: db.STRING
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

};
