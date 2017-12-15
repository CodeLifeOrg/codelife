const {isAuthenticated, isRole} = require("../tools/api.js");
const Op = require("sequelize").Op;
const FLAG_COUNT_HIDE = process.env.FLAG_COUNT_HIDE;
const FLAG_COUNT_BAN = process.env.FLAG_COUNT_BAN;

function flattenProject(user, p) {
  p.username = p.user ? p.user.username : "";
  p.sharing = p.userprofile ? p.userprofile.sharing : "false";
  p.reports = p.reportlist.filter(r => r.status === "new" && r.type === "project").length;
  p.hidden = p.reports >= FLAG_COUNT_HIDE || p.status === "banned" || p.sharing === "false";
  if (p.reports >= FLAG_COUNT_BAN || p.status === "banned" || p.sharing === "false") p.studentcontent = "This content has been disabled";
  if (user) {
    p.reported = Boolean(p.reportlist.find(r => r.uid === user.id));
  }
  return p;
}

const pInclude = [
  {association: "userprofile", attributes: ["bio", "sharing"]}, 
  {association: "user", attributes: ["username"]}, 
  {association: "reportlist"}
];

module.exports = function(app) {

  const {db} = app.settings;

  // Used by Projects to get a list of projects by the logged-in user
  app.get("/api/projects/mine", isAuthenticated, (req, res) => {
    db.projects.findAll({
      where: {
        uid: req.user.id
      },
      include: pInclude
    })
      .then(pRows => 
        res.json(pRows
          .map(p => flattenProject(req.user, p.toJSON()))
          .filter(p => !p.hidden)
          .sort((a, b) => a.name < b.name ? -1 : 1))
          .end()
      );
  });

  // Used by home for feature list.  No Authentication required.
  app.get("/api/projects/featured", (req, res) => {
    db.projects.findAll({
      where: {
        [Op.or]: [{id: 1026}, {id: 982}, {id: 1020}, {id: 1009}]
      },
      include: pInclude
    })
      .then(pRows => 
        res.json(pRows
          .map(p => flattenProject(req.user, p.toJSON()))).end()
      );
  });

  // Used by Studio to open a project by ID
  app.get("/api/projects/byid", isAuthenticated, (req, res) => {
    db.projects.findAll({where: {id: req.query.id, uid: req.user.id}}).then(u => res.json(u).end());
  });

  // Used by UserProjects to get a project list for their profile
  app.get("/api/projects/byuser", isAuthenticated, (req, res) => {
    db.projects.findAll({
      where: {
        uid: req.query.uid
      },
      include: pInclude
    })
      .then(pRows => 
        res.json(pRows
          .map(p => flattenProject(req.user, p.toJSON()))
          .filter(p => !p.hidden)
          .sort((a, b) => a.name < b.name ? -1 : 1))
          .end()
      );
  });

  // Used by Share to fetch a project.  Public.
  app.get("/api/projects/byUsernameAndFilename", (req, res) => {
    db.projects.findAll({
      where: {
        name: req.query.filename
      },
      include: pInclude.map(i => i.association === "user" ? Object.assign(i, {where: {username: req.query.username}}) : i)
    })
      .then(pRows => 
        res.json(pRows
          .map(p => flattenProject(req.user, p.toJSON()))).end()
      );
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
      db.projects.findAll({
        where: {
          uid: req.user.id
        },
        include: pInclude
      })
        .then(pRows => {
          const resp = pRows
            .map(p => flattenProject(req.user, p.toJSON()))
            .filter(p => !p.hidden)
            .sort((a, b) => a.name < b.name ? -1 : 1);
          res.json({currentProject, projects: resp}).end();
        });
    });
  });

  // Used by Projects to delete a project
  app.delete("/api/projects/delete", isAuthenticated, (req, res) => {
    db.projects.destroy({where: {id: req.query.id, uid: req.user.id}}).then(() => {
      db.projects.findAll({
        where: {
          uid: req.user.id
        },
        include: pInclude
      })
        .then(pRows => 
          res.json(pRows
            .map(p => flattenProject(req.user, p.toJSON()))
            .filter(p => !p.hidden)
            .sort((a, b) => a.name < b.name ? -1 : 1))
            .end()
        );
    });
  });

};
