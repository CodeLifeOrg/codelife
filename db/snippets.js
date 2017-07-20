module.exports = function(sequelize, db) {

  var s = sequelize.define("snippets",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      snippetname: db.STRING,
      studentcontent: db.TEXT,
      likes: db.INTEGER,
      previewblob: db.BLOB,
      lid: db.TEXT,
      uid: db.TEXT
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
