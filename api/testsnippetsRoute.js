module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/testsnippets", (req, res) => {

    db.testsnippets.findAll({where: req.query}).then(u => res.json(u).end());

  });

  app.post("/api/testsnippets/save", (req, res) => {

    db.testsnippets.create({name: req.body.name, user_id: req.body.user_id, htmlcontent: req.body.htmlcontent})
      .then(u => res.json(u).end());

  });

  app.delete("/api/testsnippets/delete", (req, res) => {
    db.testsnippets.destroy({where: {id: req.query.id}}).then(u => res.json(u).end());
  });

};
