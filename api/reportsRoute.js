const {isAuthenticated, isRole} = require("../tools/api.js");
const Op = require("sequelize").Op;
const BuildMail = require("buildmail"),
      Mailgun = require("mailgun-js"),
      fs = require("fs"),
      path = require("path");

const mgApiKey = process.env.CANON_MAILGUN_API,
      mgDomain = process.env.CANON_MAILGUN_DOMAIN,
      mgEmail = process.env.CANON_MAILGUN_EMAIL;

/** 
  * reportsRoute is responsible for handling user flagging and inappropriate reports
  * Flagging is currently supported for projects, codeblocks, threads, and comments.
  * Users get 5 reports per month to prevent abuse (hard-coded in profile.js)
  */ 

module.exports = function(app) {

  const {db} = app.settings;

  /**
    * These four functions are used in ReportBox to find if the logged in 
    * user has reported this entity before. TODO: collapse these into one endpoint
    * @param {Object} req.query query object with 
    * @returns {Object} new list of projects now that one is deleted
    */
  app.get("/api/reports/byCodeBlockid", isAuthenticated, (req, res) => {
    db.reports.findAll({where: {type: "codeblock", report_id: req.query.id, uid: req.user.id}}).then(u => res.json(u).end());
  });

  // Used in ReportBox to find if the logged in user has reported this project before
  app.get("/api/reports/byProjectid", isAuthenticated, (req, res) => {
    db.reports.findAll({where: {type: "project", report_id: req.query.id, uid: req.user.id}}).then(u => res.json(u).end());
  });

  // Used in ReportBox to find if the logged in user has reported this thread before
  app.get("/api/reports/byThreadid", isAuthenticated, (req, res) => {
    db.reports.findAll({where: {type: "thread", report_id: req.query.id, uid: req.user.id}}).then(u => res.json(u).end());
  });

  // Used in ReportBox to find if the logged in user has reported this comment before
  app.get("/api/reports/byCommentid", isAuthenticated, (req, res) => {
    db.reports.findAll({where: {type: "comment", report_id: req.query.id, uid: req.user.id}}).then(u => res.json(u).end());
  });

  /**
    * The following two functions Get the reports for all threads and comments for the Admin panel
    * These have giant includes because *entire thread/comment itself* gets embedded in the 
    * Admin page for review by the admin.
    * @returns {Object[]} List of all threads/comments that have been reported
    */
  app.get("/api/reports/threads/all", isRole(2), (req, res) => {
    db.reports.findAll({
      where: {
        type: "thread",
        status: "new"
      },
      include: [
        {
          association: "thread",
          include: [
            { 
              association: "commentlist", 
              include: [
                {
                  association: "user", 
                  attributes: ["name", "username", "id", "role"]
                },
                {
                  association: "reportlist"
                },
                {
                  association: "userprofile", 
                  attributes: ["img"]
                }
              ]
            },
            {
              association: "user",
              attributes: ["username", "email", "name"]
            }
          ]
        }
      ]
    }).then(u => res.json(u).end());
  });

  app.get("/api/reports/comments/all", isRole(2), (req, res) => {
    db.reports.findAll({
      where: {
        type: "comment",
        status: "new"
      },
      include: [
        {
          association: "commentref",
          include: [
            {
              association: "user",
              attributes: ["username", "email", "name"]
            }
          ]
        }
      ]
    }).then(u => res.json(u).end());
  });

  /**
    * The following two functions are used in ReportViewer to get
    * All codeblocks and projects that have been reported for the admins to review
    * @returns {Object[]} list of reported codeblocks/projects
    */  
  app.get("/api/reports/codeblocks/all", isRole(2), (req, res) => {
    db.reports.findAll({
      where: {
        type: "codeblock",
        status: "new"
      },
      include: [
        {
          association: "codeblock",
          attributes: ["snippetname"],
          include: [
            {
              association: "user",
              attributes: ["username", "email", "name"]
            }
          ]
        }
      ]
    })
      .then(rRows => {
        const resp = rRows.filter(c => c.codeblock).map(r => {
          const rj = r.toJSON();
          rj.username = rj.codeblock.user ? rj.codeblock.user.username : "";
          rj.email = rj.codeblock.user ? rj.codeblock.user.email : "";
          rj.name = rj.codeblock.user ? rj.codeblock.user.name : "";
          rj.filename = rj.codeblock ? rj.codeblock.snippetname : "";
          return rj;
        });
        res.json(resp).end();
      });
  });

  // Used in ReportViewer to get ALL project reports for admins
  app.get("/api/reports/projects/all", isRole(2), (req, res) => {
    db.reports.findAll({
      where: {
        type: "project",
        status: "new"
      },
      include: [
        {
          association: "project",
          attributes: ["name"],
          include: [
            {
              association: "user",
              attributes: ["username", "email", "name"]
            }
          ]
        }
      ]
    })
      .then(rRows => {
        // This filter catches reports whose target project has been deleted.
        // TODO: The deletion of a project should not "wipe clean" a report - return a special "deleted"
        // case that maintains the fact that this user was reported, but also shows their project was deleted.
        const resp = rRows.filter(p => p.project).map(r => {
          const rj = r.toJSON();
          console.log(rj);
          rj.username = rj.project.user ? rj.project.user.username : "";
          rj.email = rj.project.user ? rj.project.user.email : "";
          rj.name = rj.project.user ? rj.project.user.name : "";
          rj.filename = rj.project ? rj.project.name : "";
          return rj;
        });
        res.json(resp).end();
      });
  });

  /**
    * Gets a list of all the reports that the logged in user has submitted. At the client
    * level, this list is searched by the id of the current entity they are viewing, and the
    * report box is populated if they have reported it in the past.
    * Ideally, this kind of filtering should happen at the API level, perhaps getting this list
    * on login, or perhaps returning it with the project itself (in a hasUserReportedThis type field)
    * @returns {Object[]} list of reports submitted by the logged-in user
    */  
  app.get("/api/reports", (req, res) => {
    if (req.user) {
      db.reports.findAll({where: {[Op.or]: [{uid: req.user.id, type: "project"}, {uid: req.user.id, type: "codeblock"}]}}).then(u => res.json(u).end());  
    }
    else {
      res.json([]).end();
    }
  });

  // Used in Share to determine if this user has reported this content before, same as above
  app.get("/api/reports/discussions", (req, res) => {
    if (req.user) {
      db.reports.findAll({where: {[Op.or]: [{uid: req.user.id, type: "thread"}, {uid: req.user.id, type: "comment"}]}}).then(u => res.json(u).end());  
    }
    else {
      res.json([]).end();
    }
  });

  /**
    * The following four functions are unused, but would retrieve all the reports 
    * for a given type specfied in the url request
    * @returns {Object[]} A list of reports for this entity by the logged in user
    */  

  // Used by UserProjects to get all reports submitted by this user, to determine which projects have already been reported
  app.get("/api/reports/projects", isAuthenticated, (req, res) => {
    db.reports.findAll({where: {uid: req.user.id, type: "project"}}).then(u => res.json(u).end());
  });

  // Used by CodeBlockList, UserCodeBlocks and Level to get all reports submitted by this user (same reason as above)
  app.get("/api/reports/codeblocks", isAuthenticated, (req, res) => {
    db.reports.findAll({where: {uid: req.user.id, type: "codeblock"}}).then(u => res.json(u).end());
  });

  // Used by TBD
  app.get("/api/reports/threads", isAuthenticated, (req, res) => {
    db.reports.findAll({where: {uid: req.user.id, type: "thread"}}).then(u => res.json(u).end());
  });

  // Used by TBD
  app.get("/api/reports/comments", isAuthenticated, (req, res) => {
    db.reports.findAll({where: {uid: req.user.id, type: "comment"}}).then(u => res.json(u).end());
  });
 
  /**
    * Used by ReportBox to process/save a report, as well as email the admins
    * @param {Object} req.body body object containing report details to be inserted
    * @returns {number} Affected rows.  
    */  
  app.post("/api/reports/save", isAuthenticated, (req, res) => {
    const uid = req.user.id;
    const {reason, comment, type, permalink} = req.body;
    const reportId = req.body.report_id;
    db.reports.create({uid, reason, comment, permalink, report_id: reportId, type, status: "new"})
      .then(u => {

        const mailgun = new Mailgun({apiKey: mgApiKey, domain: mgDomain});
        const confirmEmailFilepath = path.join(__dirname, "../tools/report.html");

        fs.readFile(confirmEmailFilepath, "utf8", (error, template) => {

          // Find all admins in the user table and add them to the to: field
          db.users.findAll({where: {role: 2}}).then(admins => {
            const emails = admins.map(a => a.email).join(", ");

            return new BuildMail("text/html")
              .addHeader({from: mgEmail, subject: "New Flagged Content", to: emails})
              .setContent(template).build((error, mail) =>
                mailgun.messages().sendMime({to: emails, message: mail.toString("ascii")}, () => res.json(u).end())
              );
          });

        });

      });
  });

  // Used by ReportViewer to actually ban a project.  Admin only.
  app.post("/api/reports/update", isRole(2), (req, res) => {
    const {id, status} = req.body;
    db.reports.update({status}, {where: {id}}).then(u => res.json(u).end());
  });

};
