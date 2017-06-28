module.exports = function(sequelize, db) {

  return sequelize.define("testrules",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true
      },
      type: db.STRING,
      needle: db.STRING,
      error_msg: db.STRING
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

};
