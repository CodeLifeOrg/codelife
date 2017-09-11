module.exports = function(sequelize, db) {

  return sequelize.define("minilessons",
    {
      id: {
        type: db.TEXT,
        primaryKey: true
      },
      name: db.TEXT,
      description: db.TEXT,
      ordering: db.INTEGER,
      lid: db.TEXT,
      pt_name: db.TEXT,
      pt_description: db.TEXT
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

};
