/**
 * glossarywords moved from the i18n json translations to the database after the beta. 
 * They are translated in glossaryRoute based on the locale before sending to the requester
 */

module.exports = function(sequelize, db) {

  const gw = sequelize.define("glossarywords",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      // english word
      word: db.TEXT,
      // english definition
      definition: db.TEXT,
      // portuguese word
      pt_word: db.TEXT,
      // portuguese definition
      pt_definition: db.TEXT
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return gw;

};
