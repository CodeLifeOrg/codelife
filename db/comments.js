module.exports = function(sequelize, db) {

  return sequelize.define("comments",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      uid: db.STRING,
      date: db.DATE,
      title: db.TEXT,
      content: db.TEXT,
      thread_id: db.INTEGER      
    },
    {
      freezeTableName: true,
      timestamps: false
    }
  );

};
