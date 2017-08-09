module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/likes/byid", (req, res) => {

    db.likes.findAll({where: {likeid: req.query.id}}).then(u => res.json(u).end());

  });

  app.get("/api/likes", (req, res) => {

    db.likes.findAll({where: {uid: req.user.id}}).then(u => res.json(u).end());

  });

  app.post("/api/likes/save", (req, res) => {
    const uid = req.user.id;
    const {liked, likeid} = req.body;

    if (!liked) {
      db.likes.destroy({where: {uid, likeid}}).then(u => res.json(u).end());
    }
    else {
      db.likes.findOrCreate({where: {uid, likeid}}).then(u => res.json(u).end());
    }

  });

};
