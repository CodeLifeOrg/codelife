module.exports = function(sequelize, db) {

  const p = sequelize.define("projects_userprofiles",
    {
      pid: db.INTEGER,
      uid: db.TEXT
    },
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  p.associate = models => {
    p.hasMany(models.projects, {foreignKey: "id", sourceKey: "pid", as: "collabproj"});
  };

  return p;

};
