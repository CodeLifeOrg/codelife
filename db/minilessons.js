module.exports = function(sequelize, db) {

  return sequelize.define("minilessons",
    {
      index: db.BIGINT,
      id: {
        type: db.TEXT,
        primaryKey: true
      },
      name: db.TEXT,
      description: db.TEXT,
      ordering: db.BIGINT,
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
