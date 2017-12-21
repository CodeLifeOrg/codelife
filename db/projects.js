module.exports = function(sequelize, db) {

  const p = sequelize.define("projects",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: db.TEXT,
      studentcontent: db.TEXT,
      uid: db.TEXT,
      datemodified: db.DATE,
      status: db.TEXT
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  p.associate = models => {
    p.belongsTo(models.userprofiles, {foreignKey: "uid", targetKey: "uid", as: "userprofile"});
    p.belongsTo(models.users, {foreignKey: "uid", targetKey: "id", as: "user"});
    p.hasMany(models.reports, {foreignKey: "report_id", sourceKey: "id", as: "reportlist"});
  };

  return p;  

};
