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
      previewblob: db.BLOB,
      lid: db.TEXT,
      uid: db.TEXT,
      status: db.TEXT,
      featured: db.BOOLEAN
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  cb.associate = models => {
    cb.belongsTo(models.userprofiles, {foreignKey: "uid", targetKey: "uid", as: "userprofile"});
    cb.belongsTo(models.users, {foreignKey: "uid", targetKey: "id", as: "user"});
    cb.hasMany(models.likes, {foreignKey: "likeid", sourceKey: "id", as: "likelist"});
    cb.hasMany(models.reports, {foreignKey: "report_id", sourceKey: "id", as: "reportlist"});
  };

  return cb;

};
