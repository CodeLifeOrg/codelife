/**
 * reports tracks flagging of inappropriate content. Similarly to threads, an entity_id/type pairing 
 * is used to relate to multiple tables, requiring additional filtering and querying. For true SQL
 * correctness, this could probably be split out into individual tables per entity. 
 */

module.exports = function(sequelize, db) {

  const r = sequelize.define("reports",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      // user id
      uid: db.TEXT,
      // dropdown reason 
      reason: db.TEXT,
      // user description of issue
      comment: db.TEXT,
      // id of reported entity
      report_id: db.INTEGER,
      // type of reported entity
      type: db.TEXT,
      // reports get addressed by admins (new, approved, banned)
      status: db.TEXT,
      // link to offending content (DEPRECATED / UNUSED)
      permalink: db.TEXT
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
    r.belongsTo(models.threads, {foreignKey: "report_id", targetKey: "id", as: "thread"}); 
    r.belongsTo(models.comments, {foreignKey: "report_id", targetKey: "id", as: "commentref"}); 
  };

  return r;

};
