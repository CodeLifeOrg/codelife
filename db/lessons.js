module.exports = function(sequelize, db) {

  return sequelize.define("lessons",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true
      },
      name: db.TEXT,
      description: db.TEXT
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

};
