module.exports = function(sequelize, db) {

  const m = sequelize.define("minilessons",
    {
      id: {
        type: db.TEXT,
        primaryKey: true
      },
      name: db.TEXT,
      description: db.TEXT,
      ordering: db.INTEGER,
      lid: db.TEXT,
      pt_name: db.TEXT,
      pt_description: db.TEXT
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  m.associate = models => {
    m.belongsTo(models.lessons, {foreignKey: "lid", targetKey: "id", as: "lesson", foreignKeyConstraint: true});
    m.hasMany(models.slides, {foreignKey: "id", targetKey: "mlid", as: "slides", foreignKeyConstraint: true});
  };

  return m;

};
