module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/reports/byCodeBlockid", (req, res) => {

    db.reports.findAll({where: {type: "codeblock", report_id: req.query.id, uid: req.user.id}}).then(u => res.json(u).end());

  });

  app.get("/api/reports/byProjectid", (req, res) => {

    db.reports.findAll({where: {type: "project", report_id: req.query.id, uid: req.user.id}}).then(u => res.json(u).end());

  });

  app.get("/api/reports/codeblocks/all", (req, res) => {

    const q = "select reports.id, reports.uid, reports.reason, reports.comment, reports.report_id, reports.type, users.username, users.email, users.name, codeblocks.snippetname as filename from reports, users, codeblocks where reports.status = 'new' AND reports.report_id = codeblocks.id AND codeblocks.uid = users.id AND reports.type = 'codeblock'";
    db.query(q, {type: db.QueryTypes.SELECT}).then(u => res.json(u).end());

  });

  app.get("/api/reports/projects/all", (req, res) => {

    const q = "select reports.id, reports.uid, reports.reason, reports.comment, reports.report_id, reports.type, users.username, users.email, users.name, projects.name as filename from reports, users, projects where reports.status = 'new' AND reports.report_id = projects.id AND projects.uid = users.id AND reports.type = 'project'";
    db.query(q, {type: db.QueryTypes.SELECT}).then(u => res.json(u).end());

  });

  app.get("/api/reports", (req, res) => {

    if (req.user) {
      db.reports.findAll({where: {uid: req.user.id}}).then(u => res.json(u).end());  
    }
    else {
      res.json([]).end();
    }
    

  });

  app.get("/api/reports/projects", (req, res) => {

    db.reports.findAll({where: {uid: req.user.id, type: "project"}}).then(u => res.json(u).end());

  });

  app.get("/api/reports/codeblocks", (req, res) => {

    db.reports.findAll({where: {uid: req.user.id, type: "codeblock"}}).then(u => res.json(u).end());

  });

  app.post("/api/reports/save", (req, res) => {
    const uid = req.user.id;
    const {reason, comment, report_id, type} = req.body;
      
    db.reports.create({uid, reason, comment, report_id, type, status: "new"}).then(u => res.json(u).end());

  });

  app.post("/api/reports/update", (req, res) => {
    const {id, status} = req.body;

    db.reports.update({status}, {where: {id}}).then(u => res.json(u).end());

  });

};
