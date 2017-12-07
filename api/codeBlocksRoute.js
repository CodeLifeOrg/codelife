const {isAuthenticated, isRole} = require("../tools/api.js");
const Op = require("sequelize").Op;

module.exports = function(app) {

  const {db} = app.settings;

  // Used by Island.jsx to get each codeblock by island
  app.get("/api/codeBlocks/mine", isAuthenticated, (req, res) => {
    db.codeblocks.findAll({where: {uid: req.user.id}}).then(u => res.json(u).end());
  });

  // Used by Home.jsx to get hand-picked featured blocks
  app.get("/api/codeBlocks/featured", (req, res)  => {
    db.codeblocks.findAll({
      where: {
        [Op.or]: [{id: 863}, {id: 834}, {id: 921}, {id: 30}]
      },
      include: [
        {association: "userprofile", attributes: ["sharing"]}, 
        {association: "user", attributes: ["username"]}, 
        {association: "likelist"}, 
        {association: "reportlist"}
      ]
    })
      .then(cbRows => {
        const resp = cbRows.map(cb => {
          const cbj = cb.toJSON();
          cbj.username = cbj.user ? cbj.user.username : "";
          cbj.sharing = cbj.userprofile ? cbj.userprofile.sharing : "FALSE";
          cbj.likes = cbj.likelist.length;
          cbj.reports = cbj.reportlist.filter(r => r.status === "new" && r.type === "codeblock").length;
          return cbj;
        });
        res.json(resp).end();
      });
  });

  // Used by UserCodeBlocks.jsx to get codeblock list for profile page
  app.get("/api/codeBlocks/byuser", isAuthenticated, (req, res) => {
    db.codeblocks.findAll({
      include: [
        {association: "userprofile", attributes: ["sharing"]}, 
        {association: "user", where: {id: req.query.uid}, attributes: ["username"]}, 
        {association: "likelist"}, 
        {association: "reportlist"}
      ]
    })
      .then(cbRows => {
        const resp = cbRows.map(cb => {
          const cbj = cb.toJSON();
          cbj.username = cbj.user ? cbj.user.username : "";
          cbj.sharing = cbj.userprofile ? cbj.userprofile.sharing : "FALSE";
          cbj.likes = cbj.likelist.length;
          cbj.reports = cbj.reportlist.filter(r => r.status === "new" && r.type === "codeblock").length;
          return cbj;
        });
        res.json(resp).end();
      });
  });

  // Used by Share.jsx to publicly share code
  app.get("/api/codeBlocks/byUsernameAndFilename", (req, res) => {
    db.codeblocks.findAll({
      where: {
        snippetname: req.query.filename
      },
      include: [
        {association: "userprofile", attributes: ["sharing"]}, 
        {association: "user", where: {username: req.query.username}, attributes: ["username"]}, 
        {association: "likelist"}, 
        {association: "reportlist"}
      ]
    })
      .then(cbRows => {
        const resp = cbRows.map(cb => {
          const cbj = cb.toJSON();
          cbj.username = cbj.user ? cbj.user.username : "";
          cbj.sharing = cbj.userprofile ? cbj.userprofile.sharing : "FALSE";
          cbj.likes = cbj.likelist.length;
          cbj.reports = cbj.reportlist.filter(r => r.status === "new" && r.type === "codeblock").length;
          return cbj;
        });
        res.json(resp).end();
      });
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

  // Used by CodeBlockList.jsx and Level.jsx to get codeblocks 
  app.get("/api/codeBlocks/all", isAuthenticated, (req, res) => {
    db.codeblocks.findAll({
      where: req.query,
      include: [
        {association: "userprofile", attributes: ["sharing"]}, 
        {association: "user", attributes: ["username"]}, 
        {association: "likelist"}, 
        {association: "reportlist"}
      ]
    })
      .then(cbRows => {
        const resp = cbRows.map(cb => {
          const cbj = cb.toJSON();
          cbj.username = cbj.user ? cbj.user.username : "";
          cbj.sharing = cbj.userprofile ? cbj.userprofile.sharing : "FALSE";
          cbj.likes = cbj.likelist.length;
          cbj.reports = cbj.reportlist.filter(r => r.status === "new" && r.type === "codeblock").length;
          return cbj;
        });
        res.json(resp).end();
      });
  });

};
