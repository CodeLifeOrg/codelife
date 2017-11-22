module.exports = function(sequelize, db) {

  const r = sequelize.define("rules",
    {
      id: {
        type: db.TEXT,
        primaryKey: true
      },
      type: db.TEXT,
      error_msg: db.TEXT,
      pt_error_msg: db.TEXT,
      error_msg_2: db.TEXT,
      pt_error_msg_2: db.TEXT,
      error_msg_3: db.TEXT,
      pt_error_msg_3: db.TEXT
    },
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return r;

};
