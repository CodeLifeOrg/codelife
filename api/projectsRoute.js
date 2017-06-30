module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/projects", (req, res) => {

    db.testprojects.findAll({where: req.query}).then(u => res.json(u).end());

  });

  app.post("/api/projects/save", (req, res) => {

    db.testprojects.update({htmlcontent: req.body.htmlcontent}, {where: {user_id: req.body.user_id}})
      .then(u => res.json(u).end());

  });

};
