module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/projects", (req, res) => {

    db.projects.findAll({where: {uid: req.user.id}}).then(u => res.json(u).end());

  });

  app.get("/api/projects/byid", (req, res) => {

    db.projects.findAll({where: {id: req.query.id}}).then(u => res.json(u).end());

  });

  app.get("/api/projects/byuser", (req, res) => {

    db.projects.findAll({where: {uid: req.query.uid}}).then(u => res.json(u).end());

  });

  app.get("/api/projects/byUsernameAndFilename", (req, res) => {

    const q = "select projects.id, projects.name, projects.studentcontent, projects.uid, projects.datemodified, (select count(*) from reports where reports.report_id = projects.id AND reports.type = 'project') as reports from projects, users where projects.uid = users.id AND projects.name = '" + req.query.filename + "' AND users.username = '" + req.query.username + "'";
    db.query(q, {type: db.QueryTypes.SELECT}).then(u => res.json(u).end());

  });

  app.post("/api/projects/update", (req, res) => {

    db.projects.update({studentcontent: req.body.studentcontent, name: req.body.name, datemodified: db.fn("NOW")}, {where: {uid: req.body.uid, id: req.body.id}})
      .then(u => res.json(u).end());

  });

  app.post("/api/projects/new", (req, res) => {

    db.projects.create({studentcontent: req.body.studentcontent, name: req.body.name, uid: req.user.id, datemodified: db.fn("NOW")}).then(currentProject => {
      db.projects.findAll({where: {uid: req.user.id}}).then(projects => res.json({currentProject, projects}).end());
    });

  });

  app.delete("/api/projects/delete", (req, res) => {

    db.projects.destroy({where: {id: req.query.id}}).then(() => {
      db.projects.findAll({where: {uid: req.user.id}}).then(projects => res.json(projects).end());
    });

  });

};
