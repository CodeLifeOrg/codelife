module.exports = function(sequelize, db) {

  const s = sequelize.define("searches",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: db.TEXT,
      type: db.TEXT,
      document: db.TEXT,
      result_id: db.TEXT
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;  

};
