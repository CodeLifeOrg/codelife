/**
 * threads are top-level text entires in a Discussion. Similar to likes and reports, they use
 * a "subject_id/type" relation column which could potentially be improved with standalone relational
 * tables. Currently the only type is "slide" but this could be changed to support discussions for
 * projects, codeblocks, etc
 */

module.exports = function(sequelize, db) {

  const t = sequelize.define("threads",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: db.TEXT,
      content: db.TEXT,
      date: db.DATE,
      // the type of entity this discussion refers to. only slide currently, but could be expanded
      subject_type: db.TEXT,
      // the id of the entity this dicussion refers to.
      subject_id: db.TEXT,
      // user id
      uid: db.STRING,
      // threads can be banned by admins, store the status here
      status: db.TEXT
    },
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  t.associate = models => {
    t.belongsTo(models.userprofiles, {foreignKey: "uid", targetKey: "uid", as: "userprofile"});
    t.belongsTo(models.users, {foreignKey: "uid", targetKey: "id", as: "user"});
    t.belongsTo(models.slides, {foreignKey: "subject_id", targetKey: "id", as: "slide"});
    t.hasMany(models.comments, {foreignKey: "thread_id", sourceKey: "id", as: "commentlist"});
    t.hasMany(models.likes, {foreignKey: "likeid", sourceKey: "id", as: "likelist"});
    t.hasMany(models.reports, {foreignKey: "report_id", sourceKey: "id", as: "reportlist"});
  };

  return t;

};
