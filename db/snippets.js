module.exports = function(sequelize, db) {

  return sequelize.define("snippets",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true
      },
      name: db.STRING,
      studentcontent: db.TEXT,
      likes: db.INTEGER,
      previewblob: db.BLOB,
      lid: {
        type: db.INTEGER,
        foreignKey: true
      },
      uid: {
        type: db.INTEGER,
        foreignKey:true
      }
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

};
