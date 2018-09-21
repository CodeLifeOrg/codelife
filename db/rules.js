/**
 * rules stores the set of json objects that define Template Strings for error feedback
 * Uses {{p1}}, {{p2}}, and {{p3}} as replacement macros. Stored in multiple languages.
 */ 

module.exports = function(sequelize, db) {

  const r = sequelize.define("rules",
    {
      id: {
        type: db.TEXT,
        primaryKey: true
      },
      // type of Rule (CONTAINS, CSS_CONTAINS, etc)
      type: db.TEXT,
      // english error message, using p1-p3 as replacements in template string
      error_msg: db.TEXT,
      // pt error message, and so on.
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
