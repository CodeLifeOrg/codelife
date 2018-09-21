/** 
 * islands is the top-level data structure of the content of codelife. Islands have many Levels, and each
 * level has many slides. Several "Island-wide" concepts live here, such as the final codeblock test
 * and the associated cheatsheet. It's important to note that the hierarchy used to be Lessons, Minilessons,
 * and Slides, so the nomenclature of lid/mlid/sid still float around, somewhat confusingly
 */

module.exports = function(sequelize, db) {

  const i = sequelize.define("islands",
    {
      id: {
        type: db.TEXT,
        primaryKey: true
      },
      // island name
      name: db.TEXT,
      // island description (10-15 words)
      description: db.TEXT,
      // final codeblock test prompt
      prompt: db.TEXT,
      // initial codeblock state
      initialcontent: db.TEXT,
      // rules to pass codeblock test. see app/utils/codeValidation for explanation on how rules work
      rulejson: db.TEXT,
      // html formatted block of text of what the student learned this island
      cheatsheet: db.TEXT,
      // text to show after island is beaten
      victory: db.TEXT,
      // pt version of above fields
      pt_name: db.TEXT,
      pt_description: db.TEXT,
      pt_initialcontent: db.TEXT,
      pt_prompt: db.TEXT,
      pt_cheatsheet: db.TEXT,
      pt_victory: db.TEXT,
      // island ordering matters, 0-indexed
      ordering: db.INTEGER,
      // lookup word for Islands.css and style.yml
      theme: db.TEXT,
      // which blueprint icon to use http://blueprintjs.com/docs/v2/#icons
      icon: db.TEXT,
      pt_rulejson: db.TEXT,
      is_latest: db.BOOLEAN
    },
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  i.associate = models => {
    i.hasMany(models.levels, {foreignKey: "lid", sourceKey: "id", as: "levels", foreignKeyConstraint: true});
  };

  return i;

};
