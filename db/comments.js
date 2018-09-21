/**
 * comments are blocks of text added to threads. Many comments to one thread
 */ 

module.exports = function(sequelize, db) {

  const c = sequelize.define("comments",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      // user id
      uid: db.STRING,
      // date of entry
      date: db.DATE,
      // comment title
      title: db.TEXT,
      // submitted text
      content: db.TEXT,
      // thread to which this comment belongs
      thread_id: db.INTEGER,
      // comments can be banned by admins, track the status here
      status: db.TEXT     
    },
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  c.associate = models => {
    c.belongsTo(models.userprofiles, {foreignKey: "uid", targetKey: "uid", as: "userprofile"});
    c.belongsTo(models.users, {foreignKey: "uid", targetKey: "id", as: "user"});
    c.hasMany(models.likes, {foreignKey: "likeid", sourceKey: "id", as: "likelist"});
    c.hasMany(models.reports, {foreignKey: "report_id", sourceKey: "id", as: "reportlist"});
  };

  return c;

};
