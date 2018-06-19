const {isAuthenticated, isRole} = require("../tools/api.js");
const Op = require("sequelize").Op;
const fs = require("fs");
const mkdirp = require("mkdirp");
const path = require("path");
const Xvfb = require("xvfb");
const screenshot = require("electron-screenshot-service");
const FLAG_COUNT_HIDE = process.env.FLAG_COUNT_HIDE;
const FLAG_COUNT_BAN = process.env.FLAG_COUNT_BAN;


/**
 * Given the logged-in user and a project, this function "flattens" the object by reaching
 * into the associated tables queries (such as reports and likes) and bubbling them up to a top-level prop
 * This type of function is really only used here and in codeblocksroute.  As codelife development progressed,
 * the pattern shifted more to expect the nested nature of sequelize queries, meaning flattening wasn't necessary.
 * @param {string} user The currently logged in user, as specified by datawheel-canon
 * @param {Object} p The project to flatten
 * @returns {Object} The "flattened" project, ready to be returned to the requester
 */
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

// Associations for sequelize queries
const pInclude = [
  {association: "userprofile", attributes: ["bio", "sharing", "uid", "img", "prompted"]},
  {association: "user", attributes: ["username", "id", "name"]},
  {association: "reportlist"},
  {association: "collaborators", attributes: ["uid", "sid", "gid", "img", "bio"], include: [{association: "user", attributes: ["username", "email", "name"]}]}
];

module.exports = function(app) {

  const {db} = app.settings;

  /**
   * Used by Projects to get a list of users to collaborate with
   * @returns {Object[]} List of all users
   */
  app.get("/api/projects/users", isAuthenticated, (req, res) => {
    db.userprofiles.findAll({
      include: [{association: "user"}]
    }).then(u => res.json(u).end());
  });

  /**
   * Used by Featured.jsx to get a list of all projects
   * @returns {Object[]} List of all projects
   */
  app.get("/api/projects/all", isRole(2), (req, res) => {
    db.projects.findAll({include: pInclude}).then(pRows => 
      res.json(pRows
        .map(p => flattenProject(req.user, p.toJSON())))
        .end()
    );
  });

  /**
   * Used by Projects to get a list of projects by the logged-in user
   * @returns {Object[]} List of all projects of the currently logged-in user
   */
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

  /**
   * For the logged-in user, fetch all of the projects on which that user is a collaborator.
   * @returns {Object[]} List of all projects this user is a collaborator on
   */
  app.get("/api/projects/collabs", isAuthenticated, (req, res) => {
    db.projects_userprofiles.findAll({
      where: {
        uid: req.user.id
      },
      // Notice that the projects fetched use pInclude. This ensures that the returned projects
      // will have all the necessary metadata (owner, reportlist, other collaborators, etc)
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

  /**
   * Used by home for feature list.  No Authentication required.
   * @returns {Object[]} returns featured projects
   */
  app.get("/api/projects/featured", (req, res) => {
    db.projects.findAll({
      
      /*
      where: {
        [Op.or]: [{id: 1026}, {id: 1020}, {id: 1009}]
      },
      */

      where: {featured: true},
      include: pInclude
    })
      .then(pRows =>
        res.json(pRows
          .map(p => flattenProject(req.user, p.toJSON()))).end()
      );
  });

  /**
   * Used by Studio to open a project by ID
   * @returns {Object} the requested project
   */
  app.get("/api/projects/byid", isAuthenticated, (req, res) => {

    db.projects.findOne({
      where: {
        id: req.query.id
      },
      include: pInclude
    }).then(project => {
      const plainProject = project.toJSON();
      db.projects_userprofiles.findAll({where: {pid: plainProject.id}}).then(collabs => {
        // confirm that the person trying to open this project is either its owner or a collaborator
        if (plainProject.uid === req.user.id || collabs.map(c => c.toJSON().uid).includes(req.user.id)) {
          res.json(flattenProject(req.user, project.toJSON())).end();
        }
        else {
          res.json({}).end();
        }
      });
    });

  });

  /**
   * Used by UserProjects to get a project list for their profile
   * @param {Object} req.query query string containing the uid to look up
   * @returns {Object[]} the projects the provided user created
   */
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

  /**
   * Used by Share to fetch a project.  Public.
   * @param {Object} req.query query string containing query constraints
   * @returns {Object} The requested project
   */
  app.get("/api/projects/byUsernameAndFilename", (req, res) => {
    db.projects.findAll({
      where: {
        // Slugs were not added until later in codelife. Lookup by either one
        [Op.or]: [{slug: req.query.filename}, {name: req.query.filename}]
      },
      include: pInclude.map(i => i.association === "user" ? Object.assign({}, i, {where: {username: req.query.username}}) : i)
    })
      .then(pRows =>
        res.json(pRows
          .map(p => flattenProject(req.user, p.toJSON()))).end()
      );
  });

  // Generate a screenshot, admin only. See codeblocksroute for an explanation of screenshotting.
  app.post("/api/projects/generateScreenshot", isRole(2), (req, res) => {
    const id = req.body.id;
    db.projects.findOne({where: {id}}).then(project => {
      const plainProject = project.toJSON();
      db.users.findOne({where: {id: plainProject.uid}}).then(user => {
        user = user.toJSON();
        const url = `${req.headers.origin}/projects/${user.username}/${plainProject.slug ? plainProject.slug : plainProject.name}?screenshot=true`;
        console.log(url);
        const width = 600;
        const height = 315;
        const page = true;
        const delay = 5000;
        const xvfb = new Xvfb({timeout: 5000});
        const isLocal = ["localhost:3300", "en.localhost:3300", "pt.localhost:3300"].includes(req.headers.host);
        if (!isLocal) xvfb.startSync();
        screenshot({url, width, height, page, delay}).then(img => {
          const folder = `/static/pj_images/${user.username}`;
          const folderPath = path.join(process.cwd(), folder);
          const imgPath = path.join(process.cwd(), folder, `${plainProject.id}.png`);
          mkdirp(folderPath, err => {
            console.log("mkdir err", err);
            fs.writeFile(imgPath, img.data, err => {
              console.log("fs err", err);
              if (!isLocal) xvfb.stopSync();
            });  
          });
        });
      });
      res.json(project).end();
    });
  });


  /**
   * Used by Studio to update a project
   * @param {Object} req.body body object containing new project fields
   * @returns {Object} The updated project
   */
  app.post("/api/projects/update", isAuthenticated, (req, res) => {
    
    db.projects.findOne({
      where: {
        id: req.body.id
      },
      include: pInclude
    }).then(project => {
      const originalProject = project.toJSON();
      db.projects_userprofiles.findAll({where: {pid: originalProject.id}}).then(collabs => {
        // confirm that the person trying to update this project is either its owner or a collaborator
        if (originalProject.uid === req.user.id || collabs.map(c => c.toJSON().uid).includes(req.user.id)) {
          db.projects.update({studentcontent: req.body.studentcontent, prompted: req.body.prompted, name: req.body.name, datemodified: db.fn("NOW")}, {where: {id: req.body.id}, returning: true, individualHooks: true})
            .then(project => {
              const modifiedProject = project[1][0].toJSON();
              db.users.findOne({where: {id: modifiedProject.uid}}).then(user => {
                user = user.toJSON();
                const url = `${req.headers.origin}/projects/${user.username}/${modifiedProject.slug ? modifiedProject.slug : req.body.name}?screenshot=true`;
                const width = 600;
                const height = 315;
                const page = true;
                const delay = 5000;
                const xvfb = new Xvfb({timeout: 5000});
                const isLocal = ["localhost:3300", "en.localhost:3300", "pt.localhost:3300"].includes(req.headers.host);
                if (!isLocal) xvfb.startSync();
                screenshot({url, width, height, page, delay}).then(img => {
                  const folder = `/static/pj_images/${user.username}`;
                  const folderPath = path.join(process.cwd(), folder);
                  const imgPath = path.join(process.cwd(), folder, `${modifiedProject.id}.png`);
                  mkdirp(folderPath, err => {
                    console.log("mkdir err", err);
                    fs.writeFile(imgPath, img.data, err => {
                      console.log("fs err", err);
                      if (!isLocal) xvfb.stopSync();
                    });  
                  });
                });
                res.json(modifiedProject).end();
              });
            });
        }
        else {
          res.json(originalProject).end();
        }
      });
    });
  });

  /**
   * Used by Admins in ReportBox and ReportViewer to Ban pages
   * @param {Object} req.body body object containing query restraints
   * @returns {number} affected rows
   */
  app.post("/api/projects/setstatus", isRole(2), (req, res) => {
    const {status, id} = req.body;
    db.projects.update({status}, {where: {id}}).then(u => {
      db.reports.update({status}, {where: {type: "project", report_id: id}}).then(() => res.json(u).end());
    });
  });

  /**
   * Used by Admins to Feature Pages via Project Cards
   * @param {Object} req.body body object containing query restraints
   * @returns {number} affected rows
   */
  app.post("/api/projects/setfeatured", isRole(2), (req, res) => {
    const {featured, id} = req.body;
    db.projects.update({featured}, {where: {id}}).then(u => res.json(u).end());
  });

  /**
   * Used by Projects to create a new project
   * @param {Object} req.body body object with new project fields
   * @returns {Object} The new list of projects, as well as the one just updated
   */
  app.post("/api/projects/new", isAuthenticated, (req, res) => {
    db.projects.create({studentcontent: req.body.studentcontent, name: req.body.name, uid: req.user.id, datemodified: db.fn("NOW")}).then(currentProject => {
      db.projects.findAll({
        where: {
          uid: req.user.id
        },
        include: pInclude
      })
        .then(pRows => {
          // return the list of projects so that the projects list on the front end can
          // be updated with the "real" list of projects direct from the database 
          const resp = pRows
            .map(p => flattenProject(req.user, p.toJSON()))
            .filter(p => !p.hidden)
            .sort((a, b) => a.name < b.name ? -1 : 1);
          res.json({id: currentProject.id, projects: resp}).end();
        });
    });
  });

  /**
   * Used by Projects to add or remove collaborators from a project
   * @param {Object} req.body body object with new uid/pid fields
   * @returns {number} affected rows
   */
  app.post("/api/projects/addcollab", isAuthenticated, (req, res) => {
    const {uid, pid} = req.body;
    // projects_userprofiles is an associative many to many table 
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

  // Add/remove (above) are for project owners to add/remove collaborators
  // This leave function is so a collaborator can leave a project they were invited to
  app.post("/api/projects/leavecollab", isAuthenticated, (req, res) => {
    const {pid} = req.body;
    const uid = req.user.id;
    db.projects_userprofiles.destroy({where: {uid, pid}}).then(u => {
      res.json(u).end();
    });
  });

  /**
   * Used by Projects to delete a project
   * @param {Object} req.query query object with id of project to delete
   * @returns {Object[]} new list of projects now that one is deleted
   */
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
