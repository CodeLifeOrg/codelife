module.exports = function(sequelize, db) {

  return sequelize.define("siteconfigs",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true
      },
      config_key: db.TEXT,
      config_value: db.TEXT
    },
    {
      freezeTableName: true,
      timestamps: false
    }
  );

};
