const {isAuthenticated, isRole} = require("../tools/api.js");
const Op = require("sequelize").Op;
const BuildMail = require("buildmail"),
      Mailgun = require("mailgun-js"),
      fs = require("fs"),
      path = require("path");

const mgApiKey = process.env.CANON_MAILGUN_API,
      mgDomain = process.env.CANON_MAILGUN_DOMAIN,
      mgEmail = process.env.CANON_MAILGUN_EMAIL;

module.exports = function(app) {

  const {db} = app.settings;

  // TODO: Collapse these four into one get with params

  // Used in ReportBox to find if the logged in user has reported this codeblock before
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
                  association: "reportlist",
                  attributes: ["id"]
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

  // Used in ReportViewer to get ALL codeblock reports for admins
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
        const resp = rRows.map(r => {
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
        const resp = rRows.map(r => {
          const rj = r.toJSON();
          rj.username = rj.project.user ? rj.project.user.username : "";
          rj.email = rj.project.user ? rj.project.user.email : "";
          rj.name = rj.project.user ? rj.project.user.name : "";
          rj.filename = rj.project ? rj.project.name : "";
          return rj;
        });
        res.json(resp).end();
      });
  });

  // Used in Share to determine if this user has reported this content before
  app.get("/api/reports", (req, res) => {
    if (req.user) {
      db.reports.findAll({where: {[Op.or]: [{uid: req.user.id, type: "project"}, {uid: req.user.id, type: "codeblock"}]}}).then(u => res.json(u).end());  
    }
    else {
      res.json([]).end();
    }
  });

  // Used in Share to determine if this user has reported this content before
  app.get("/api/reports/discussions", (req, res) => {
    if (req.user) {
      db.reports.findAll({where: {[Op.or]: [{uid: req.user.id, type: "thread"}, {uid: req.user.id, type: "comment"}]}}).then(u => res.json(u).end());  
    }
    else {
      res.json([]).end();
    }
  });

  // TODO: collapse these four into one get with param

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

  // Used by ReportBox to process/save a report
  app.post("/api/reports/save", isAuthenticated, (req, res) => {
    const uid = req.user.id;
    const {reason, comment, type, permalink} = req.body;
    const reportId = req.body.report_id;
    db.reports.create({uid, reason, comment, permalink, report_id: reportId, type, status: "new"})
      .then(u => {

        // disabling email server while testing occurs
        res.json(u).end();

        /*

        const mailgun = new Mailgun({apiKey: mgApiKey, domain: mgDomain});
        const confirmEmailFilepath = path.join(__dirname, "../tools/report.html");

        fs.readFile(confirmEmailFilepath, "utf8", (error, template) => {

          db.users.findAll({where: {role: 2}}).then(admins => {
            const emails = admins.map(a => a.email).join(", ");

            return new BuildMail("text/html")
              .addHeader({from: mgEmail, subject: "New Flagged Content", to: emails})
              .setContent(template).build((error, mail) =>
                mailgun.messages().sendMime({to: emails, message: mail.toString("ascii")}, () => res.json(u).end())
              );
          });

        });

        */
    
      });
  });

  // Used by ReportViewer to actually ban a project.  Admin only.
  app.post("/api/reports/update", isRole(2), (req, res) => {
    const {id, status} = req.body;
    db.reports.update({status}, {where: {id}}).then(u => res.json(u).end());
  });

};
