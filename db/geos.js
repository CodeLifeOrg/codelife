module.exports = function(sequelize, db) {

  return sequelize.define("geos",
    {
      id: {
        type: db.STRING,
        primaryKey: true
      },
      id_ibge: db.INTEGER,
      sumlevel: db.STRING,
      name: db.STRING
    },
    {
      freezeTableName: true,
      timestamps: false
    }
  );

};
