/**
 * levels belong to a single island, and have many slides. They don't have much metadata, as they are essentially
 * just containers for slides. As mentioned in islands.js, the hierarchy used to be lessons/minilessons/slides
 * so there is some lid/mlid/sid naming throughout these structures
 */

module.exports = function(sequelize, db) {

  const l = sequelize.define("levels",
    {
      id: {
        type: db.TEXT,
        primaryKey: true
      },
      // level name
      name: db.TEXT,
      // level description (currently unused)
      description: db.TEXT,
      // 0-index
      ordering: db.INTEGER,
      // the ISLAND id this level belongs to
      lid: db.TEXT,
      // pt versions of above fields
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
