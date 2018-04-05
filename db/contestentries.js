module.exports = function(sequelize, db) {

  const c = sequelize.define("contestentries",
    {
      uid: {
        type: db.STRING,
        primaryKey: true
      },
      eligible: db.INTEGER,
      project_id: db.INTEGER,
      timestamp: db.DATE,
      description: db.TEXT
    },
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  c.associate = models => {
    c.belongsTo(models.userprofiles, {foreignKey: "uid", targetKey: "uid", as: "userprofile"});
    c.belongsTo(models.users, {foreignKey: "uid", targetKey: "id", as: "user"});
    c.belongsTo(models.projects, {foreignKey: "project_id", targetKey: "id", as: "project"});
  };

  return c;

};
