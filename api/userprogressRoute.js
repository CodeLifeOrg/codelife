module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/userprogress/", (req, res) => {

    db.userprogress.findAll({where: {uid: req.user.id}}).then(u => res.json(u).end());

  });

  app.post("/api/userprogress/save", (req, res) => {

    db.userprogress.findOrCreate({where: {uid: req.user.id, level: req.body.level}})
      .then(u => res.json(u).end());

  });

};
