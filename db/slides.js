module.exports = function(sequelize, db) {

  const s = sequelize.define("slides",
    {
      id: {
        type: db.TEXT,
        primaryKey: true
      },
      type: db.TEXT,
      title: db.TEXT,
      htmlcontent1: db.TEXT,
      htmlcontent2: db.TEXT,
      quizjson: db.TEXT,
      rulejson: db.TEXT,
      mlid: db.TEXT,
      ordering: db.INTEGER,
      pt_title: db.TEXT,
      pt_htmlcontent1: db.TEXT,
      pt_htmlcontent2: db.TEXT,
      pt_quizjson: db.TEXT,
      lax: db.BOOLEAN,
      pt_rulejson: db.TEXT
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  s.associate = models => {
    s.belongsTo(models.levels, {foreignKey: "mlid", targetKey: "id", as: "levels", foreignKeyConstraint: true});
    s.hasMany(models.threads, {foreignKey: "subject_id", sourceKey: "id", as: "threadlist"});
  }

  return s;

};
