module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/reports/byid", (req, res) => {

    db.reports.findAll({where: {reportid: req.query.id}}).then(u => res.json(u).end());

  });

  app.get("/api/reports", (req, res) => {

    db.reports.findAll({where: {uid: req.user.id}}).then(u => res.json(u).end());

  });

  app.post("/api/reports/save", (req, res) => {
    const uid = req.user.id;
    const {reported, reportid} = req.body;

    if (!reported) {
      db.reports.destroy({where: {uid, reportid}}).then(u => res.json(u).end());
    }
    else {
      db.reports.findOrCreate({where: {uid, reportid}}).then(u => res.json(u).end());
    }

  });

};
