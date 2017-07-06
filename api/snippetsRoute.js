module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/snippets", (req, res) => {

    /*
     db.testsnippets.findAll({where: req.query})
      .then(u => {
        
        db.users.findAll()
          .then(users => {
            // do stuff
            res.json(u).end();
          })
        
      });
    */

    db.testsnippets.findAll({where: req.query}).then(u => res.json(u).end());

  });

  app.post("/api/snippets/save", (req, res) => {

    db.testsnippets.create({name: req.body.name, user_id: req.body.user_id, htmlcontent: req.body.htmlcontent})
      .then(u => res.json(u).end());

  });

  app.delete("/api/snippets/delete", (req, res) => {
    db.testsnippets.destroy({where: {id: req.query.id}}).then(u => res.json(u).end());
  });

};
