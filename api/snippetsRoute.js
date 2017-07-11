module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/snippets", (req, res) => {

    db.snippets.findAll({where: {lid: req.query.lid, uid: req.query.uid}}).then(u => res.json(u).end());

  });

  app.post("/api/snippets/save", (req, res) => {

    db.snippets.update({studentcontent: req.body.studentcontent}, {where: {uid: req.body.uid, lid: req.body.lid}})
      .then(u => res.json(u).end());

  });

};
