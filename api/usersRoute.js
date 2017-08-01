module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/users", (req, res) => {

    db.users.findAll({where: {uid: req.user.id}}).then(u => res.json(u).end());

  });

  // sample working URLs
  //  - /api/usersBySid/31001074
  // - /api/usersByGid/4mg030000
  app.get(["/api/usersByGid/:gid", "/api/usersBySid/:sid"], (req, res) => {
    const {gid, sid} = req.params;
    const dbFields = ["users.id", "users.name", "users.email", "users.username",
                      "userprofiles.*, geos.name as geoname, schools.name as schoolname"];
    const whereClause = gid ? "userprofiles.gid = :gid" : "userprofiles.sid = :sid";

    const q = `SELECT ${dbFields}
      FROM users
      FULL JOIN userprofiles on userprofiles.uid = users.id
      FULL JOIN geos on userprofiles.gid = geos.id
      FULL JOIN schools on userprofiles.sid = schools.id
      WHERE ${whereClause};`;

    db.query(q, {type: db.QueryTypes.SELECT, replacements: {gid, sid}}).then(users => {
      if (!users.length) {
        return res.json({error: "No users matched that location."});
      }
      return res.json(users).end();
    });
  });

};
