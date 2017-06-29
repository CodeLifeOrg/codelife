module.exports = function(sequelize, db) {

  return sequelize.define("testprojects",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true
      },
      user_id: {
        type: db.CHAR,
        foreignKey: true
      },
      htmlcontent: db.STRING
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

};
