module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/reports/byCodeBlockid", (req, res) => {

    db.reports.findAll({where: {codeblock_id: req.query.id}}).then(u => res.json(u).end());

  });

  app.get("/api/reports/byProjectid", (req, res) => {

    db.reports.findAll({where: {project_id: req.query.id}}).then(u => res.json(u).end());

  });

  app.get("/api/reports", (req, res) => {

    db.reports.findAll({where: {uid: req.user.id}}).then(u => res.json(u).end());

  });

  app.post("/api/reports/save", (req, res) => {
    const uid = req.user.id;
    const {reason, comment, codeblock_id, project_id} = req.body;
      
    db.reports.create({uid, reason, comment, codeblock_id, project_id}).then(u => res.json(u).end());

  });

};
