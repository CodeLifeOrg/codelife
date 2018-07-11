/**
 * contestentries tracks the (currently postponed) entrants to the project contest. One entry project per user.
 */

module.exports = function(sequelize, db) {

  const c = sequelize.define("contestentries",
    {
      // user id
      uid: {
        type: db.STRING,
        primaryKey: true
      },
      // eligibility was originally going to have tiers (1: entered, 2: submitted) but this is deprecated
      eligible: db.INTEGER,
      // the submitted project id, overwritten on subsequent submits
      project_id: db.INTEGER,
      // date of submission
      timestamp: db.DATE,
      // submission statement
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
