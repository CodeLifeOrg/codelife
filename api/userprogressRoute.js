const {isAuthenticated} = require("../tools/api.js");
const translate = require("../tools/translate.js");

/**
 * userProgressRoute fetches and sets user progress through the codelife content. It maintains a single list of 
 * "beaten" entities, with levels and islands mixed together. The list is not ordered - when an entity is beaten,
 * its id is written to the list. In the future, implicit ordering may helpful for things like tallying progress.
 */ 

module.exports = function(app) {

  const {db} = app.settings;

  /** 
   * Used in CodeBlock, CodeblockList, Home, Island, Level, and Slide to determine this user's list of beaten items
   * Note: "current" is used only for Home.jsx to fill in a "continue your journey" link
   * @returns {Object} The entirety of the parent thread for client-side updating
   */
  app.get("/api/userprogress/mine", isAuthenticated, (req, res) => {
    db.userprogress.findAll({where: {uid: req.user.id}})
      .then(progress => {
        const returnObj = {progress};
        db.islands.findAll()
          .then(islands => {
            islands = translate(req.headers.host, "pt", islands);
            let latestUserIslandIndex = -1;
            for (const up of progress) {
              const i = islands.find(i => i.id === up.level);
              if (i && i.ordering > latestUserIslandIndex) {
                latestUserIslandIndex = i.ordering;
              }
            }
            const latestReleasedIsland = islands.find(i => i.is_latest === true);

            // Do not set the currentIsland to an unreleased island.
            if (latestUserIslandIndex >= latestReleasedIsland.ordering) latestUserIslandIndex = latestReleasedIsland.ordering;
            if (latestUserIslandIndex <= 0) latestUserIslandIndex = 0;

            const currentIsland = islands.find(i => i.ordering === latestUserIslandIndex);
            returnObj.current = currentIsland;
            res.json(returnObj).end();
          });
      });

  });

  /** 
   * Used in CodeBlock and Slide to report when a user beats an Island or a Level, respectively
   * @param {Object} req.body body object containing the beaten level and its status
   * @returns {Object[]} The newly updated userprogress list
   */
  app.post("/api/userprogress/save", isAuthenticated, (req, res) => {
    const {id: uid} = req.user;
    const {level, status} = req.body;
    db.userprogress.findOrCreate({where: {uid, level}})
      .then(userprogressRows => {
        if (userprogressRows.length) {
          const userprogressRow = userprogressRows[0];
          userprogressRow.datecompleted = db.fn("NOW");
          // Don't allow a completed level to become incomplete later.
          if (userprogressRow.status !== "completed") userprogressRow.status = status;
          return userprogressRow.save().then(() => res.json(userprogressRows).end());
        }
        else {
          return res.json({error: "Unable to update user progress."}).end();
        }
      });
  });
};
