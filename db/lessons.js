module.exports = function(sequelize, db) {

  return sequelize.define("lessons",
    {
      index: db.BIGINT,
      id: {
        type: db.TEXT,
        primaryKey: true
      },
      name: db.TEXT,
      description: db.TEXT,
      prompt: db.TEXT,
      initialcontent: db.TEXT,
      rulejson: db.TEXT,
      cheatsheet: db.TEXT,
      pt_name: db.TEXT,
      pt_description: db.TEXT,
      pt_initialcontent: db.TEXT,
      pt_prompt: db.TEXT
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

};
