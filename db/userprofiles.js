/**
 * userprofiles is a sister table to the canon-provided table users. In order to avoid changing the db
 * structure of the underlying canon users table, this 1:1 table stores all "codelife-specific" user
 * profile details and matches on uid
 */

module.exports = function(sequelize, db) {

  const up = sequelize.define("userprofiles",
    {
      uid: {
        type: db.STRING,
        primaryKey: true,
        references: {model: "users", key: "id"}
      },
      bio: db.TEXT,
      img: db.STRING,
      gender: db.INTEGER,
      // coins is unused/deprecated - was intended to track xp
      coins: db.INTEGER,
      // streak is unused - intent is to track successive logins (your 15th day in a row!)
      streak: db.INTEGER,
      dob: db.DATE,
      // school id (schools table)
      sid: {
        type: db.INTEGER,
        references: {model: "schools", key: "id"}
      },
      // location id (geos table)
      gid: {
        type: db.STRING,
        references: {model: "geos", key: "id"}
      },
      // Cadastro de Pessoas Físicas - id number for taxes
      cpf: db.STRING,
      // survey answers from beta
      survey: db.JSONB,
      survey2: db.JSONB,
      getinvolved: db.JSONB,
      // sharing can be turned off by an admin in case of abuse
      sharing: db.TEXT,
      // users get 5 reports a month, decrement and refresh those here
      reports: db.INTEGER,
      // calculation of "per month" is stored here
      last_upped: db.DATE,
      // in Projects, has this user clicked "Never Show this Again" when prompted to share on fb?
      prompted: db.BOOLEAN
    },
    {
      freezeTableName: true,
      timestamps: false
    }
  );
  
  up.associate = models => {
    up.belongsTo(models.users, {foreignKey: "uid", targetKey: "id", as: "user"});
    up.belongsTo(models.geos, {foreignKey: "gid", targetKey: "id", as: "geo"});
    up.belongsTo(models.schools, {foreignKey: "sid", targetKey: "id", as: "school"});
    up.hasMany(models.userprogress, {foreignKey: "uid", sourceKey: "uid", as: "userprogress"});
    up.hasMany(models.threads, {foreignKey: "uid", sourceKey: "uid", as: "threads"});
    up.hasMany(models.comments, {foreignKey: "uid", sourceKey: "uid", as: "comments"});
  };


  return up;

};
