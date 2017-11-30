module.exports = function(sequelize, db) {

  const i = sequelize.define("islands",
    {
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
      victory: db.TEXT,
      pt_name: db.TEXT,
      pt_description: db.TEXT,
      pt_initialcontent: db.TEXT,
      pt_prompt: db.TEXT,
      pt_cheatsheet: db.TEXT,
      pt_victory: db.TEXT,
      ordering: db.INTEGER,
      theme: db.TEXT,
      icon: db.TEXT,
      pt_rulejson: db.TEXT
    },
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  i.associate = models => {
    i.hasMany(models.levels, {foreignKey: "id", targetKey: "lid", as: "levels", foreignKeyConstraint: true});
  };

  return i;

};
