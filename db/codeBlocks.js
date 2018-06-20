const SequelizeSlugify = require("sequelize-slugify");

/**
 * codeBlocks are the final test of each island. There is only ever ONE per student per island. 
 */

module.exports = function(sequelize, db) {

  const cb = sequelize.define("codeblocks",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      // codeblocks used to be called snippets, so there is some naming cruft here
      snippetname: db.STRING,
      // actual student code
      studentcontent: db.TEXT,
      // previewblob is deprecated, screenshots are used now (see codeblocksroute)
      previewblob: db.BLOB,
      // islands used to be called lessons, so "lid" is the island this codeblock belongs to
      lid: db.TEXT,
      // user id
      uid: db.TEXT,
      // codeblocks can be banned, track their status here
      status: db.TEXT,
      // codeblocks can be featured by admins
      featured: db.BOOLEAN, 
      // use sequelize-slugify for url-friendly names
      slug: {
        type: db.STRING,
        unique: true
      }
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  SequelizeSlugify.slugifyModel(cb, {
    source: ["snippetname"],
    suffixSource: ["id"],
    overwrite: true
  });

  cb.associate = models => {
    cb.belongsTo(models.userprofiles, {foreignKey: "uid", targetKey: "uid", as: "userprofile"});
    cb.belongsTo(models.users, {foreignKey: "uid", targetKey: "id", as: "user"});
    cb.hasMany(models.likes, {foreignKey: "likeid", sourceKey: "id", as: "likelist"});
    cb.hasMany(models.reports, {foreignKey: "report_id", sourceKey: "id", as: "reportlist"});
  };

  return cb;

};
