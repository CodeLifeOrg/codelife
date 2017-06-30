module.exports = function(sequelize, db) {

  return sequelize.define("testsnippets",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: db.STRING,
      htmlcontent: db.STRING,
      user_id: db.STRING
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

};
