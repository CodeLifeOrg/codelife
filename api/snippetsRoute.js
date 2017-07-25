module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/snippets", (req, res) => {

    db.snippets.findAll({where: {uid: req.user.id}}).then(u => res.json(u).end());

  });

  app.get("/api/snippets/bylid", (req, res) => {

    db.snippets.findAll({where: {uid: req.user.id, lid: req.query.lid}}).then(u => res.json(u).end());

  });

  app.get("/api/snippets/byid", (req, res) => {

    db.snippets.findAll({where: {uid: req.user.id, id: req.query.id}}).then(u => res.json(u).end());

  });

  app.get("/api/snippets/byuser", (req, res) => {

    db.snippets.findAll({where: {uid: req.query.uid}}).then(u => res.json(u).end());

  });

  // todo: maybe change these into a single "upsert"

  app.post("/api/snippets/update", (req, res) => {

    db.snippets.update({studentcontent: req.body.studentcontent, name: req.body.name}, {where: {uid: req.body.uid, lid: req.body.lid}})
      .then(u => res.json(u).end());

  });

  app.post("/api/snippets/new", (req, res) => {

    db.snippets.create({studentcontent: req.body.studentcontent, name: req.body.name, uid: req.body.uid, lid: req.body.lid})
      .then(u => res.json(u).end());

  });

  app.get("/api/snippets/othersbylid", (req, res) => {

    const q = "SELECT * FROM snippets, users WHERE users.id = snippets.uid AND users.id != '" + req.user.id + "' AND snippets.lid = '" + req.query.lid + "'";
    db.query(q, {type: db.QueryTypes.SELECT}).then(u => res.json(u).end());

    // db.snippets.findAll({where: {uid: {$not: req.user.id}, lid: req.query.lid}}).then(u => res.json(u).end());

  });

  app.get("/api/snippets/allbylid", (req, res) => {

    const q = "SELECT * FROM snippets, users WHERE users.id = snippets.uid AND snippets.lid = '" + req.query.lid + "'";
    db.query(q, {type: db.QueryTypes.SELECT}).then(u => res.json(u).end());

    // db.snippets.findAll({where: {uid: {$not: req.user.id}, lid: req.query.lid}}).then(u => res.json(u).end());

  });

  app.get("/api/snippets/allgeos", (req, res) => {

    const q = "SELECT * FROM geos WHERE sumlevel = 'MUNICIPALITY' AND substring(id, 1, 3) = '4mg' ORDER BY name";
    db.query(q, {type: db.QueryTypes.SELECT}).then(u => res.json(u).end());

  });

  app.get("/api/snippets/allschools", (req, res) => {

    const q = "SELECT DISTINCT name FROM schools ORDER BY name";
    db.query(q, {type: db.QueryTypes.SELECT}).then(u => res.json(u).end());

  });

};
