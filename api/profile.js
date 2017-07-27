module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/profile/:username", (req, res) => {
    const {username} = req.params;
    let dbFields = ["users.id", "users.name", "users.email", "users.username"];

    if (req.user.username === username || true === true) {
      dbFields = dbFields.concat(["userprofiles.*, geos.name as geoname, schools.name as schoolname"]);
    }

    const q = `SELECT ${dbFields}
      FROM users
      FULL JOIN userprofiles on userprofiles.uid = users.id
      FULL JOIN geos on userprofiles.gid = geos.id
      FULL JOIN schools on userprofiles.sid = schools.id
      WHERE users.username = '${username}' LIMIT 1;`;

    db.query(q, {type: db.QueryTypes.SELECT}).then(users => {
      if (!users.length) {
        return res.json({error: "No user matched that username."});
      }
      return res.json(users[0]).end();
    });
  });

  app.post("/api/profile/", (req, res) => {
    const {name, bio, gender, gid, sid} = req.body;
    db.users.update(
      {name},
      {where: {id: req.user.id}}
    ).then(() => {
      db.userprofiles.update(
        {bio, gender, gid, sid},
        {where: {uid: req.user.id}}
      ).then(() => res.json({worked: true}));
    });
  });

  app.get("/api/schools", (req, res) => {
    db.schools.findAll(
      {where: {gid: {$ilike: "4mg%"}}}
    ).then(schools => {
      return res.json(schools)
    });
  });

  app.get("/api/schoolsBySid", (req, res) => {
    const {sid} = req.query;
    const q = `SELECT schools.* FROM schools as s, schools WHERE s.id = '${sid}' AND s.gid = schools.gid;`;

    db.query(q, {type: db.QueryTypes.SELECT}).then(schools => {
      return res.json(schools);
    });
  });

  app.get("/api/schoolsByGid", (req, res) => {
    const {gid} = req.query;
    db.schools.findAll(
      {where: {gid}}
    ).then(schools => {
      return res.json(schools)
    });
  });

  app.get("/api/geos", (req, res) => {
    const {state} = req.query;
    db.geos.findAll(
      {where: {id: {$ilike: `${state}%`}, sumlevel: "MUNICIPALITY"}}
    ).then(geos => {
      return res.json(geos)
    });
  });

};
