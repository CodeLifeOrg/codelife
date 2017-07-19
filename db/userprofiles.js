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
      location: db.STRING,
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
