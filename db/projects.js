const SequelizeSlugify = require("sequelize-slugify");

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
      status: db.TEXT,
      prompted: db.BOOLEAN,
      featured: db.BOOLEAN,
      slug: {
        type: db.STRING,
        unique: true
      }
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  SequelizeSlugify.slugifyModel(p, {
    source: ["name"]
  });

  p.associate = models => {
    p.belongsTo(models.userprofiles, {foreignKey: "uid", targetKey: "uid", as: "userprofile"});
    p.belongsTo(models.users, {foreignKey: "uid", targetKey: "id", as: "user"});
    p.hasMany(models.reports, {foreignKey: "report_id", sourceKey: "id", as: "reportlist"});
    p.belongsToMany(models.userprofiles, {through: "projects_userprofiles", foreignKey: "pid", otherKey: "uid", as: "collaborators"});
  };

  return p;  

};
