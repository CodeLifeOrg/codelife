/**
 * geos stores all the states/locations in brazil
 */

module.exports = function(sequelize, db) {

  return sequelize.define("geos",
    {
      id: {
        type: db.STRING,
        primaryKey: true
      },
      // id
      id_ibge: db.INTEGER,
      // state v municipality
      sumlevel: db.STRING,
      name: db.STRING
    },
    {
      freezeTableName: true,
      timestamps: false
    }
  );

};
