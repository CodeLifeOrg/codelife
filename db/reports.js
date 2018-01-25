module.exports = function(sequelize, db) {

  const r = sequelize.define("reports",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      uid: db.TEXT,
      reason: db.TEXT,
      comment: db.TEXT,
      report_id: db.INTEGER,
      type: db.TEXT,
      status: db.TEXT
    },
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  r.associate = models => {
    // r.belongsTo(models.users, {foreignKey: "uid", targetKey: "id", as: "user"});
    r.belongsTo(models.codeblocks, {foreignKey: "report_id", targetKey: "id", as: "codeblock"});
    r.belongsTo(models.projects, {foreignKey: "report_id", targetKey: "id", as: "project"});
  };

  return r;

};
