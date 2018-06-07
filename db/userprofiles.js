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
      coins: db.INTEGER,
      streak: db.INTEGER,
      dob: db.DATE,
      sid: {
        type: db.INTEGER,
        references: {model: "schools", key: "id"}
      },
      gid: {
        type: db.STRING,
        references: {model: "geos", key: "id"}
      },
      cpf: db.STRING,
      survey: db.JSONB,
      survey2: db.JSONB,
      getinvolved: db.JSONB,
      sharing: db.TEXT,
      reports: db.INTEGER,
      last_upped: db.DATE,
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
