module.exports = function(sequelize, db) {

  return sequelize.define("minilessons",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true
      },
      name: db.TEXT,
      description: db.TEXT,
      ordering: db.INTEGER,
      lid: {
        type: db.INTEGER,
        foreignKey: true
      }
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

};
