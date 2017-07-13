module.exports = function(sequelize, db) {

  return sequelize.define("sitecontents",
    {
      id: {
        type: db.TEXT,
        primaryKey: true
      },
      name: db.TEXT,
      htmlcontent: db.TEXT
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

};
