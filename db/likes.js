module.exports = function(sequelize, db) {

  const l = sequelize.define("likes",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      uid: db.STRING,
      likeid: db.INTEGER,
      type: db.STRING
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  l.associate = models => {
    l.belongsTo(models.codeblocks, {foreignKey: "likeid", targetKey: "id", as: "codeblock"});
    l.belongsTo(models.threads, {foreignKey: "likeid", targetKey: "id", as: "thread"});
    l.belongsTo(models.comments, {foreignKey: "likeid", targetKey: "id", as: "comment"});
  };

  return l;

};
