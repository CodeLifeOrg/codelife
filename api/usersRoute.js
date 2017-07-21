module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/users", (req, res) => {

    db.users.findAll({where: {uid: req.user.id}}).then(u => res.json(u).end());

  });

};
