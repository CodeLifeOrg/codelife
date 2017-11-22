const {isAuthenticated, isRole} = require("../tools/api.js");

module.exports = function(app) {

  const {db} = app.settings;

  // Used by Projects to get a list of projects by the logged-in user
  app.get("/api/projects", isAuthenticated, (req, res) => {
    const q = "select projects.id, projects.name, projects.studentcontent, projects.uid, projects.datemodified, projects.status, (select count(*) from reports where reports.status = 'new' AND reports.report_id = projects.id AND reports.type = 'project') as reports from projects where projects.uid = '" + req.user.id + "'";
    db.query(q, {type: db.QueryTypes.SELECT}).then(u => res.json(u).end());
  });

  // Used by home for feature list.  No Authentication required.
  app.get("/api/projects/featured", (req, res) => {
    const q = "select projects.id, projects.name, projects.studentcontent, projects.uid, projects.datemodified, projects.status, users.username, userprofiles.sharing, (select count(*) from reports where reports.status = 'new' AND reports.report_id = projects.id AND reports.type = 'project') as reports from projects, userprofiles, users where users.id = projects.uid AND projects.uid = userprofiles.uid AND (projects.id = 1026 OR projects.id = 982 OR projects.id = 1020 OR projects.id = 1009)";
    db.query(q, {type: db.QueryTypes.SELECT}).then(u => res.json(u).end());
  });

  // Used by Studio to open a project by ID
  app.get("/api/projects/byid", isAuthenticated, (req, res) => {
    db.projects.findAll({where: {id: req.query.id, uid: req.user.id}}).then(u => res.json(u).end());
  });

  // Used by UserProjects to get a project list for their profile
  app.get("/api/projects/byuser", isAuthenticated, (req, res) => {
    const q = "select projects.id, projects.name, projects.studentcontent, projects.uid, projects.datemodified, projects.status, users.username, userprofiles.sharing, (select count(*) from reports where reports.status = 'new' AND reports.report_id = projects.id AND reports.type = 'project') as reports from projects, userprofiles, users where users.id = projects.uid AND projects.uid = userprofiles.uid AND projects.uid = '" + req.query.uid + "'";
    db.query(q, {type: db.QueryTypes.SELECT}).then(u => res.json(u).end());
  });

  // Used by Share to fetch a project.  Public.
  app.get("/api/projects/byUsernameAndFilename", (req, res) => {
    const q = "select projects.id, projects.name, projects.studentcontent, projects.uid, projects.datemodified, projects.status, userprofiles.sharing, (select count(*) from reports where reports.status = 'new' AND reports.report_id = projects.id AND reports.type = 'project') as reports from projects, users, userprofiles where projects.uid = users.id AND users.id = userprofiles.uid AND projects.name = '" + req.query.filename + "' AND users.username = '" + req.query.username + "'";
    db.query(q, {type: db.QueryTypes.SELECT}).then(u => res.json(u).end());
  });

  // Used by Studio to update a project
  app.post("/api/projects/update", isAuthenticated, (req, res) => {
    db.projects.update({studentcontent: req.body.studentcontent, name: req.body.name, datemodified: db.fn("NOW")}, {where: {uid: req.user.id, id: req.body.id}})
      .then(u => res.json(u).end());
  });

  // Used by Admins in ReportBox and ReportViewer to Ban pages
  app.post("/api/projects/setstatus", isRole(2), (req, res) => {
    const {status, id} = req.body;
    db.projects.update({status}, {where: {id}}).then(u => {
      db.reports.update({status}, {where: {type: "project", report_id: id}}).then(() => res.json(u).end());
    });

  });

  // Used by Projects to create a new project
  app.post("/api/projects/new", isAuthenticated, (req, res) => {
    db.projects.create({studentcontent: req.body.studentcontent, name: req.body.name, uid: req.user.id, datemodified: db.fn("NOW")}).then(currentProject => {
      const q = "select projects.id, projects.name, projects.studentcontent, projects.uid, projects.datemodified, projects.status, (select count(*) from reports where reports.status = 'new' AND reports.report_id = projects.id AND reports.type = 'project') as reports from projects where projects.uid = '" + req.user.id + "'";
      db.query(q, {type: db.QueryTypes.SELECT}).then(projects => res.json({currentProject, projects}).end());
      //db.projects.findAll({where: {uid: req.user.id}}).then(projects => res.json({currentProject, projects}).end());
    });
  });

  // Used by Projects to delete a project
  app.delete("/api/projects/delete", isAuthenticated, (req, res) => {
    db.projects.destroy({where: {id: req.query.id, uid: req.user.id}}).then(() => {
      const q = "select projects.id, projects.name, projects.studentcontent, projects.uid, projects.datemodified, projects.status, (select count(*) from reports where reports.status = 'new' AND reports.report_id = projects.id AND reports.type = 'project') as reports from projects where projects.uid = '" + req.user.id + "'";
      db.query(q, {type: db.QueryTypes.SELECT}).then(u => res.json(u).end());
      //db.projects.findAll({where: {uid: req.user.id}}).then(projects => res.json(projects).end());
    });
  });

};
