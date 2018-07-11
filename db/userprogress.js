/**
 * userprogress stores the content beaten for a given user. Note that it is a single array
 * of ids (mix of levels and islands) with no strict ordering.
 */

module.exports = function(sequelize, db) {

  return sequelize.define("userprogress",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      // user id
      uid: db.STRING,
      // level or island id beaten
      level: db.TEXT,
      // deprecated/unused - was originally an XP system
      gems: db.INTEGER,
      datecompleted: db.DATE,
      // if the user views discussions/answers, they only get partial credit until they beat it alone
      status: db.STRING
    },
    {
      freezeTableName: true,
      timestamps: false
    }
  );

};
