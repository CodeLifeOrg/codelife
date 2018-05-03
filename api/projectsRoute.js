const {isAuthenticated, isRole} = require("../tools/api.js");
const Op = require("sequelize").Op;
const fs = require("fs");
const path = require("path");
const Xvfb = require("xvfb");
const screenshot = require("electron-screenshot-service");
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
  {association: "userprofile", attributes: ["bio", "sharing", "uid", "img"]},
  {association: "user", attributes: ["username", "id", "name"]},
  {association: "reportlist"},
  {association: "collaborators", attributes: ["uid", "sid", "gid", "img", "bio"], include: [{association: "user", attributes: ["username", "email", "name"]}]}
];

module.exports = function(app) {

  const {db} = app.settings;

  // Used by Projects to get a list of users to collaborate with
  app.get("/api/projects/users", isAuthenticated, (req, res) => {
    db.userprofiles.findAll({
      include: [{association: "user"}]
    }).then(u => res.json(u).end());
  });

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

  app.get("/api/projects/collabs", isAuthenticated, (req, res) => {
    db.projects_userprofiles.findAll({
      where: {
        uid: req.user.id
      },
      include: [
        {association: "collabproj", include: pInclude}
      ]
    })
      .then(pRows =>
        res.json(pRows
          .map(p => flattenProject(req.user, p.collabproj[0].toJSON()))
          .filter(p => !p.hidden)
          .sort((a, b) => a.name < b.name ? -1 : 1))
          .end()
      );
  });

  // Used by home for feature list.  No Authentication required.
  app.get("/api/projects/featured", (req, res) => {
    db.projects.findAll({
      where: {
        [Op.or]: [{id: 1026}, {id: 1020}, {id: 1009}]
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

    /*
    TODO: work constraint back in so that users can only read their own projects OR THEIR COLLABS
    db.projects.findAll({where: {id: req.query.id, uid: req.user.id}}).then(u => res.json(u).end());
    */

    db.projects.findOne({
      where: {
        id: req.query.id
      },
      include: pInclude
    }).then(p =>
      res.json(flattenProject(req.user, p.toJSON())).end()
    );

    // db.projects.findAll({where: {id: req.query.id}}).then(u => res.json(u).end());

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
      include: pInclude.map(i => i.association === "user" ? Object.assign({}, i, {where: {username: req.query.username}}) : i)
    })
      .then(pRows =>
        res.json(pRows
          .map(p => flattenProject(req.user, p.toJSON()))).end()
      );
  });

  // Used by Studio to update a project
  app.post("/api/projects/update", isAuthenticated, (req, res) => {
    db.projects.update({studentcontent: req.body.studentcontent, name: req.body.name, datemodified: db.fn("NOW")}, {where: {id: req.body.id}, returning: true, plain: true})
      .then(u => {
        console.log(req.headers);
        const url = `http://localhost:3300/projects/${req.body.username}/${req.body.name}`;
        const width = 400;
        const height = 300;
        const page = true;
        const delay = 3000;
        const xvfb = new Xvfb({timeout: 3000});
        if (req.headers.host !== "localhost:3300") xvfb.startSync();
        screenshot({url, width, height, page, delay}).then(img => {
          const imgPath = path.join(process.cwd(), "/static/pj_images", `${u[1].id}.png`);
          fs.writeFile(imgPath, img.data, err => {
            console.log("fs err", err);
            if (req.headers.host !== "localhost:3300") xvfb.stopSync();
          });
        });
        res.json(u).end();
      });
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
          res.json({id: currentProject.id, projects: resp}).end();
        });
    });
  });

  app.post("/api/projects/addcollab", isAuthenticated, (req, res) => {
    const {uid, pid} = req.body;
    db.projects_userprofiles.create({uid, pid}).then(u => {
      res.json(u).end();
    });
  });

  app.post("/api/projects/removecollab", isAuthenticated, (req, res) => {
    const {uid, pid} = req.body;
    db.projects_userprofiles.destroy({where: {uid, pid}}).then(u => {
      res.json(u).end();
    });
  });

  app.post("/api/projects/leavecollab", isAuthenticated, (req, res) => {
    const {pid} = req.body;
    const uid = req.user.id;
    db.projects_userprofiles.destroy({where: {uid, pid}}).then(u => {
      res.json(u).end();
    });
  });

  // Used by Projects to delete a project
  app.delete("/api/projects/delete", isAuthenticated, (req, res) => {
    db.projects.destroy({where: {id: req.query.id, uid: req.user.id}}).then(() =>
      db.projects_userprofiles.destroy({where: {pid: req.query.id}}).then(() => {
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
      }));
  });

};
