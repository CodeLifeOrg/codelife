const {isAuthenticated} = require("../tools/api.js");

/** 
 * likesRoute updates the likes table
 */

module.exports = function(app) {

  const {db} = app.settings;

  /**
   * Endpoint to update likes table for the logged in user
   * @param {Object} req.body contains the likeid and type to create or destroy
   * @returns {number} modified rows (1)
   */
  app.post("/api/likes/save", isAuthenticated, (req, res) => {
    const uid = req.user.id;
    const {liked, likeid, type} = req.body;

    if (!liked) {
      db.likes.destroy({where: {uid, likeid, type}}).then(u => res.json(u).end());
    }
    else {
      db.likes.findOrCreate({where: {uid, likeid, type}}).then(u => res.json(u).end());
    }

  });

};
