const SequelizeSlugify = require("sequelize-slugify");

/** projects is a table that stores the project files of users. Users may have many projects.
 * Users may also collaborate on projects, which is accomplished through the projects_userprofiles table.
 * Collaboration projects are no different than normal projects other than entries in that table.
 */

module.exports = function(sequelize, db) {

  const p = sequelize.define("projects",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      // project title
      name: db.TEXT,
      // entire text of html file
      studentcontent: db.TEXT,
      // user id
      uid: db.TEXT,
      // modify time used to open most recent file on load
      datemodified: db.DATE,
      // projects can be banned by admins
      status: db.TEXT,
      // has this user been prompted to share this file on facebook in the past? (projects.jsx)
      prompted: db.BOOLEAN,
      // admins can feature projects for the front page
      featured: db.BOOLEAN,
      // sequelize-slugify generates unique slugs for friendly urls
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
    source: ["name"],
    suffixSource: ["id"],
    overwrite: true
  });

  p.associate = models => {
    p.belongsTo(models.userprofiles, {foreignKey: "uid", targetKey: "uid", as: "userprofile"});
    p.belongsTo(models.users, {foreignKey: "uid", targetKey: "id", as: "user"});
    p.hasMany(models.reports, {foreignKey: "report_id", sourceKey: "id", as: "reportlist"});
    p.belongsToMany(models.userprofiles, {through: "projects_userprofiles", foreignKey: "pid", otherKey: "uid", as: "collaborators"});
  };

  return p;  

};
