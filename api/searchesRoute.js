const Op = require("sequelize").Op;
const {isAuthenticated} = require("../tools/api.js");

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/search", isAuthenticated, (req, res) => {
    const query = req.query.query;
    db.searches.findAll({
      where: {name: {[Op.iLike]: `${query}%`}}
    }).then(u => {
      res.json(u).end();
    });
  });

};
