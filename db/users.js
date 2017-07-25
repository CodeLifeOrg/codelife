module.exports = function(sequelize, db) {

  const u = sequelize.define("users",
    {
      id: {
        type: db.STRING,
        primaryKey: true
      },
      username: {
        type: db.STRING,
        allowNull: false,
        unique: true
      },
      email: db.STRING,
      name: db.STRING,
      password: db.STRING,
      salt: db.STRING,
      twitter: db.STRING,
      facebook: db.STRING,
      instagram: db.STRING,
      createdAt: db.DATE,
      updatedAt: db.DATE
    },
    {
      classMethods: {
        associate: models => {
          u.hasOne(models.userprofiles, {foreignKey: "id", targetKey: "uid"});
        }
      }
    }
  );

  // u.hasOne(db.userProfiles);
  // u.hasOne(db.userProfiles, {foreignKey: "id", targetKey: "uid"});
  return u;

};
