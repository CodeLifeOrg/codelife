const {isAuthenticated, isRole} = require("../tools/api.js");

module.exports = function(app) {

  const {db} = app.settings;

  // Used by Island.jsx to get each codeblock by island
  app.get("/api/codeBlocks", isAuthenticated, (req, res) => {
    db.codeblocks.findAll({where: {uid: req.user.id}}).then(u => res.json(u).end());
  });

  // Used by Home.jsx to get hand-picked featured blocks
  app.get("/api/codeBlocks/featured", (req, res) => {
    const q = "SELECT codeblocks.id, codeblocks.snippetname, codeblocks.studentcontent, codeblocks.status, userprofiles.sharing, (select count(*) FROM likes where likes.likeid = codeblocks.id) AS likes, (select count(*) from reports where reports.status = 'new' AND reports.report_id = codeblocks.id AND reports.type = 'codeblock') as reports, codeblocks.previewblob, codeblocks.lid, codeblocks.uid, users.username FROM codeblocks, users, userprofiles WHERE userprofiles.uid = codeblocks.uid AND users.id = codeblocks.uid AND (codeblocks.id = 863 OR codeblocks.id = 834 OR codeblocks.id = 921 OR codeblocks.id = 30)";
    db.query(q, {type: db.QueryTypes.SELECT}).then(u => res.json(u).end());   
  });

  // Used by UserCodeBlocks.jsx to get codeblock list for profile page
  app.get("/api/codeBlocks/byuser", isAuthenticated, (req, res) => {
    const id = req.query.uid;
    const q = "SELECT codeblocks.id, codeblocks.snippetname, codeblocks.studentcontent, codeblocks.status, userprofiles.sharing, (select count(*) FROM likes where likes.likeid = codeblocks.id) AS likes, (select count(*) from reports where reports.status = 'new' AND reports.report_id = codeblocks.id AND reports.type = 'codeblock') as reports, codeblocks.previewblob, codeblocks.lid, codeblocks.uid, users.username FROM codeblocks, users, userprofiles WHERE codeblocks.uid = userprofiles.uid AND users.id = codeblocks.uid AND users.id = '" + id + "'";
    db.query(q, {type: db.QueryTypes.SELECT}).then(u => res.json(u).end());
  });

  // Used by Share.jsx to publicly share code
  app.get("/api/codeBlocks/byUsernameAndFilename", (req, res) => {
    const q = "select codeblocks.id, codeblocks.snippetname, codeblocks.studentcontent, codeblocks.status, userprofiles.sharing, (select count(*) from reports where reports.status = 'new' AND reports.report_id = codeblocks.id AND reports.type = 'codeblock') as reports, codeblocks.likes, codeblocks.previewblob, codeblocks.lid, codeblocks.uid from codeblocks, users, userprofiles where codeblocks.uid = users.id AND users.id = userprofiles.uid AND codeblocks.snippetname = '" + req.query.filename + "' AND users.username = '" + req.query.username + "'";
    db.query(q, {type: db.QueryTypes.SELECT}).then(u => res.json(u).end());
  });

  // Used by Codeblock.jsx to save new Codeblocks
  app.post("/api/codeBlocks/new", isAuthenticated, (req, res) => {
    db.codeblocks.create({studentcontent: req.body.studentcontent, snippetname: req.body.name, uid: req.body.uid, lid: req.body.iid})
      .then(u => res.json(u).end());
  });

  // Used by CodeBlock.jsx to update the CodeBlock Test
  app.post("/api/codeBlocks/update", isAuthenticated, (req, res) => {
    db.codeblocks.update({studentcontent: req.body.studentcontent, snippetname: req.body.name}, {where: {uid: req.body.uid, lid: req.body.iid}})
      .then(u => res.json(u).end());
  });

  // Used by ReportBox and ReportViewer to ban codeblocks, Admin Only
  app.post("/api/codeBlocks/setstatus", isRole(2), (req, res) => {
    const {status, id} = req.body;
    db.codeblocks.update({status}, {where: {id}}).then(u => {
      db.reports.update({status}, {where: {type: "codeblock", report_id: id}}).then(() => res.json(u).end());
    });
  });

  // Used by Level.jsx to fetch ALL codeblocks for this level (so students can browse)
  app.get("/api/codeBlocks/allbylid", isAuthenticated, (req, res) => {
    const q = "SELECT codeblocks.id, codeblocks.snippetname, codeblocks.studentcontent, codeblocks.status, userprofiles.sharing, (select count(*) FROM likes where likes.likeid = codeblocks.id) AS likes, (select count(*) from reports where reports.status = 'new' AND reports.report_id = codeblocks.id AND reports.type = 'codeblock') as reports, codeblocks.previewblob, codeblocks.lid, codeblocks.uid, users.username FROM codeblocks, users, userprofiles WHERE userprofiles.uid = codeblocks.uid AND users.id = codeblocks.uid AND codeblocks.lid = '" + req.query.lid + "'";
    db.query(q, {type: db.QueryTypes.SELECT}).then(u => res.json(u).end());
  });

  // Used by CodeBlockList.jsx to get ALL codeblocks (for the sidebar in Studio)
  app.get("/api/codeBlocks/all", isAuthenticated, (req, res) => {
    const q = "SELECT codeblocks.id, codeblocks.snippetname, codeblocks.studentcontent, codeblocks.status, userprofiles.sharing, (select count(*) FROM likes where likes.likeid = codeblocks.id) AS likes, (select count(*) from reports where reports.status = 'new' AND reports.report_id = codeblocks.id AND reports.type = 'codeblock') as reports, codeblocks.previewblob, codeblocks.lid, codeblocks.uid, users.username FROM codeblocks, users, userprofiles WHERE userprofiles.uid = codeblocks.uid AND users.id = codeblocks.uid";
    db.query(q, {type: db.QueryTypes.SELECT}).then(u => res.json(u).end());
  });

  // Not currently used
  app.get("/api/codeBlocks/allgeos", isAuthenticated, (req, res) => {
    const q = "SELECT * FROM geos WHERE sumlevel = 'MUNICIPALITY' AND substring(id, 1, 3) = '4mg' ORDER BY name";
    db.query(q, {type: db.QueryTypes.SELECT}).then(u => res.json(u).end());
  });

  // Not currently used
  app.get("/api/codeBlocks/allschools", isAuthenticated, (req, res) => {
    const q = "SELECT DISTINCT name FROM schools ORDER BY name";
    db.query(q, {type: db.QueryTypes.SELECT}).then(u => res.json(u).end());
  });

};
