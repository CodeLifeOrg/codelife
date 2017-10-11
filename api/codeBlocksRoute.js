module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/codeBlocks", (req, res) => {

    db.codeblocks.findAll({where: {uid: req.user.id}}).then(u => res.json(u).end());

  });

  app.get("/api/codeBlocks/bylid", (req, res) => {

    db.codeblocks.findAll({where: {uid: req.user.id, lid: req.query.lid}}).then(u => res.json(u).end());

  });

  app.get("/api/codeBlocks/byid", (req, res) => {

    db.codeblocks.findAll({where: {uid: req.user.id, id: req.query.id}}).then(u => res.json(u).end());

  });

  app.get("/api/codeBlocks/byuser", (req, res) => {

    const id = req.query.uid;
    const q = "SELECT codeblocks.id, codeblocks.snippetname, codeblocks.studentcontent, codeblocks.status, (select count(*) FROM likes where likes.likeid = codeblocks.id) AS likes, (select count(*) from reports where reports.status = 'new' AND reports.report_id = codeblocks.id AND reports.type = 'codeblock') as reports, codeblocks.previewblob, codeblocks.lid, codeblocks.uid, users.username FROM codeblocks, users WHERE users.id = codeblocks.uid AND users.id = '" + id + "'";
    db.query(q, {type: db.QueryTypes.SELECT}).then(u => res.json(u).end());

  });

  app.get("/api/codeBlocks/byUsernameAndFilename", (req, res) => {

    const q = "select codeblocks.id, codeblocks.snippetname, codeblocks.studentcontent, codeblocks.status, (select count(*) from reports where reports.status = 'new' AND reports.report_id = codeblocks.id AND reports.type = 'codeblock') as reports, codeblocks.likes, codeblocks.previewblob, codeblocks.lid, codeblocks.uid from codeblocks, users where codeblocks.uid = users.id AND codeblocks.snippetname = '" + req.query.filename + "' AND users.username = '" + req.query.username + "'";
    db.query(q, {type: db.QueryTypes.SELECT}).then(u => res.json(u).end());

  });

  // todo: maybe change these into a single "upsert"

  app.post("/api/codeBlocks/update", (req, res) => {

    db.codeblocks.update({studentcontent: req.body.studentcontent, snippetname: req.body.name}, {where: {uid: req.body.uid, lid: req.body.iid}})
      .then(u => res.json(u).end());

  });

  app.post("/api/codeBlocks/setstatus", (req, res) => {
    const {status, id} = req.body;

    db.codeblocks.update({status}, {where: {id}}).then(u => res.json(u).end());

  });

  app.post("/api/codeBlocks/new", (req, res) => {

    db.codeblocks.create({studentcontent: req.body.studentcontent, snippetname: req.body.name, uid: req.body.uid, lid: req.body.iid})
      .then(u => res.json(u).end());

  });

  app.get("/api/codeBlocks/allbylid", (req, res) => {

    const q = "SELECT codeblocks.id, codeblocks.snippetname, codeblocks.studentcontent, codeblocks.status, (select count(*) FROM likes where likes.likeid = codeblocks.id) AS likes, (select count(*) from reports where reports.status = 'new' AND reports.report_id = codeblocks.id AND reports.type = 'codeblock') as reports, codeblocks.previewblob, codeblocks.lid, codeblocks.uid, users.username FROM codeblocks, users WHERE users.id = codeblocks.uid AND codeblocks.lid = '" + req.query.lid + "'";
    db.query(q, {type: db.QueryTypes.SELECT}).then(u => res.json(u).end());

    // db.codeblocks.findAll({where: {uid: {$not: req.user.id}, lid: req.query.lid}}).then(u => res.json(u).end());

  });

  app.get("/api/codeBlocks/all", (req, res) => {

    const q = "SELECT codeblocks.id, codeblocks.snippetname, codeblocks.studentcontent, codeblocks.status, (select count(*) FROM likes where likes.likeid = codeblocks.id) AS likes, (select count(*) from reports where reports.status = 'new' AND reports.report_id = codeblocks.id AND reports.type = 'codeblock') as reports, codeblocks.previewblob, codeblocks.lid, codeblocks.uid, users.username FROM codeblocks, users WHERE users.id = codeblocks.uid";
    db.query(q, {type: db.QueryTypes.SELECT}).then(u => res.json(u).end());

  });

  app.get("/api/codeBlocks/allgeos", (req, res) => {

    const q = "SELECT * FROM geos WHERE sumlevel = 'MUNICIPALITY' AND substring(id, 1, 3) = '4mg' ORDER BY name";
    db.query(q, {type: db.QueryTypes.SELECT}).then(u => res.json(u).end());

  });

  app.get("/api/codeBlocks/allschools", (req, res) => {

    const q = "SELECT DISTINCT name FROM schools ORDER BY name";
    db.query(q, {type: db.QueryTypes.SELECT}).then(u => res.json(u).end());

  });

};
