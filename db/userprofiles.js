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
      getinvolved: db.JSONB
    },
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  // up.hasOne(db.user, {foreignKey: "uid"});


  return up;

};
