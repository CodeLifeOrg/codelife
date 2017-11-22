module.exports = function(sequelize, db) {

  const cb = sequelize.define("codeblocks",
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
      uid: db.TEXT,
      status: db.TEXT
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return cb;

};
