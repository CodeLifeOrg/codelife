module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/survey/", (req, res) => {
    const {id: uid} = req.user;
    db.userprofiles.findOne(
      {where: {uid}}
    ).then(userprofile => res.json(userprofile.survey2));
  });

  app.post("/api/survey/", (req, res) => {
    const {id: uid} = req.user;
    const {survey} = req.body;
    db.userprofiles.findOrCreate({where: {uid}})
      .then(userprofiles => {
        if (userprofiles.length) {
          const userprofile = userprofiles[0];
          userprofile.survey2 = survey;
          return userprofile.save().then(() => res.json(userprofile).end());
        }
        else {
          return res.json({error: "Unable to update user profile."}).end();
        }
      });
  });

};
