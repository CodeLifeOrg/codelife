module.exports = function(sequelize, db) {

  const l = sequelize.define("lessons",
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
      pt_rulejson: db.TEXT,
      ordering: db.INTEGER,
      theme: db.TEXT
    },
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  l.associate = models => {
    l.hasMany(models.minilessons, {foreignKey: "id", targetKey: "lid", as: "minilessons", foreignKeyConstraint: true});
  };

  return l;

};
