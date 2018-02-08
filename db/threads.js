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
      subject_type: db.TEXT,
      subject_id: db.TEXT,
      uid: db.STRING,
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
    t.hasMany(models.reports, {foreignKey: "report_id", sourceKey: "id", as: "reportlist"});
    //t.hasMany(models.upvotes, {})
  };

  return t;

};
