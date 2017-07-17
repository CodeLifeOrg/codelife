module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/userprogress/", (req, res) => {

    db.userprogress.findAll({where: req.query}).then(u => res.json(u).end());

  });

  app.post("/api/userprogress/save", (req, res) => {

    db.userprogress.create({uid: req.body.uid, level: req.body.level})
      .then(u => res.json(u).end());

  });

};
