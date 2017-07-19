module.exports = function(sequelize, db) {

  return sequelize.define("userprofiles",
    {
      uid: {
        type: db.STRING,
        primaryKey: true
      },
      bio: db.TEXT,
      img: db.STRING,
      gender: db.INTEGER,
      coins: db.INTEGER,
      streak: db.INTEGER,
      dob: db.DATE,
      school: db.STRING,
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
      getInvolved: db.JSONB
    },
    {
      freezeTableName: true,
      timestamps: false
    }
  );

};
