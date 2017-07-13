module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/snippets", (req, res) => {

    db.snippets.findAll({where: {lid: req.query.lid, uid: req.query.uid}}).then(u => res.json(u).end());

  });

  app.get("/api/snippets/byid", (req, res) => {

    db.snippets.findAll({where: {id: req.query.id}}).then(u => res.json(u).end());    

  });

  // todo: maybe change these into a single "upsert"

  app.post("/api/snippets/update", (req, res) => {

    db.snippets.update({studentcontent: req.body.studentcontent}, {where: {uid: req.body.uid, lid: req.body.lid}})
      .then(u => res.json(u).end());

  });

  app.post("/api/snippets/new", (req, res) => {

    db.snippets.create({studentcontent: req.body.studentcontent, uid: req.body.uid, lid: req.body.lid})
      .then(u => res.json(u).end());

  });

};
