module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/projects", (req, res) => {

    db.testprojects.findAll({where: {uid: req.user.id}}).then(u => res.json(u).end());

  });

  app.post("/api/projects/update", (req, res) => {

    db.testprojects.update({studentcontent: req.body.studentcontent, name: req.body.name}, {where: {uid: req.body.uid, id: req.body.id}})
      .then(u => res.json(u).end());

  });

  app.post("/api/projects/new", (req, res) => {

    db.testprojects.create({studentcontent: req.body.studentcontent, name: req.body.name, uid: req.user.uid})
      .then(u => res.json(u).end());

  });

  app.delete("/api/projects/delete", (req, res) => {
    db.testprojects.destroy({where: {id: req.query.id}}).then(() => {
      db.testprojects.findAll({where: {uid: req.user.id}}).then(projects => res.json(projects).end());
    });
  });

};
