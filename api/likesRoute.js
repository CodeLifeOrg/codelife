module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/likesbyid", (req, res) => {

    db.likes.findAll({where: {likeid: req.query.id}}).then(u => res.json(u).end());

  });

};
