module.exports = function(app) {

  // DEPRECATED / UNUSED - FROM BETA

  const {db} = app.settings;

  app.get("/api/survey/", (req, res) => {
    const {id: uid} = req.user;
    db.userprofiles.findOrCreate({where: {uid}})
      .then(userprofiles => {
        if (userprofiles.length) {
          return res.json(userprofiles[0].survey2 || {});
        }
        else {
          return res.json({error: "Unable to find a survey associated to that user."}).end();
        }
      });
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
