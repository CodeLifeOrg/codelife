/**
 * likes is a relational table that stores user likes of codeblocks, threads and comments. 
 * Note: similar to threads, this database design opts for storing multiple relational types 
 * in a single many to many table. Ideally, each of these relational entities should have have 
 * their own table - consider a refactor in the future.
 */

module.exports = function(sequelize, db) {

  const l = sequelize.define("likes",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      // user id
      uid: db.STRING,
      // id of the liked entity
      likeid: db.INTEGER,
      // type of the liked entity
      type: db.STRING
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  // Note that as a limitation of the non-normalized type column, these associations will result in some
  // "false positives" - requiring filtering as part of (or after) querying 
  l.associate = models => {
    l.belongsTo(models.codeblocks, {foreignKey: "likeid", targetKey: "id", as: "codeblock"});
    l.belongsTo(models.threads, {foreignKey: "likeid", targetKey: "id", as: "thread"});
    l.belongsTo(models.comments, {foreignKey: "likeid", targetKey: "id", as: "comment"});
  };

  return l;

};
