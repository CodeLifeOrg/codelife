module.exports = function(sequelize, db) {

  const l = sequelize.define("levels",
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

  l.associate = models => {
    l.belongsTo(models.islands, {foreignKey: "lid", targetKey: "id", as: "island", foreignKeyConstraint: true});
    l.hasMany(models.slides, {foreignKey: "mlid", sourceKey: "id", as: "slides", foreignKeyConstraint: true});
  };

  return l;

};
