/** 
 * slides stores the html content and rulejson for all the slides in codelife. Many slides
 * belong to a single Level.
 */

module.exports = function(sequelize, db) {

  const s = sequelize.define("slides",
    {
      id: {
        type: db.TEXT,
        primaryKey: true
      },
      // slide type as defined by /app/components/slidetypes (todo: consider ENUM for this list)
      type: db.TEXT,
      // slide title
      title: db.TEXT,
      // htmlcontent1 is a string that will (generally) be rendered as innerHTML on the left side of the slide
      htmlcontent1: db.TEXT,
      // htmlcontent2 is a string that will (generally) be rendered as innerHTML on the right side of the slide
      htmlcontent2: db.TEXT,
      // if this slide is a quiz, store json content here
      quizjson: db.TEXT,
      // if this slide is a test, store json rules for what constitutes passing
      rulejson: db.TEXT,
      // LEVEL id. levels used to be called minilessons.
      mlid: db.TEXT,
      ordering: db.INTEGER,
      // pt versions of above
      pt_title: db.TEXT,
      pt_htmlcontent1: db.TEXT,
      pt_htmlcontent2: db.TEXT,
      pt_quizjson: db.TEXT,
      // lax is a way for a slide to turn off boilerplate html checking for early slides
      lax: db.BOOLEAN,
      // pt requires its own rules becuase variables may be different in pt
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
  };

  return s;

};
