module.exports = function(sequelize, db) {

  return sequelize.define("jimmytable",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true
      },
      name: db.STRING
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

};
