/**
 * projects_userprofiles is a relational table for project collaboration. When the owner of
 * a project adds collaborators, that relationship is stored here 
 */

module.exports = function(sequelize, db) {

  const p = sequelize.define("projects_userprofiles",
    {
      // project id 
      pid: db.INTEGER,
      // user id
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
