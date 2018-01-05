module.exports = function(sequelize, db) {

  const gw = sequelize.define("glossarywords",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      word: db.TEXT,
      definition: db.TEXT,
      pt_word: db.TEXT,
      pt_definition: db.TEXT
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return gw;

};
