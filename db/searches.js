/**
 * searches is an UNUSED table, originally intended to use pg_search for search codelife.
 * However, because the current search is users/projects only, which uses trigrams, a more 
 * feature-rich full text search was not required
 */

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
