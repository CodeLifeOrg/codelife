module.exports = function(sequelize, db) {

  return sequelize.define("snippets",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: db.STRING,
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

};
