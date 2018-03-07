const sequelize = require("sequelize");
const {isAuthenticated} = require("../tools/api.js");

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/search", isAuthenticated, (req, res) => {
    const query = req.query.query;
    
    /*
    const q = `SELECT * FROM searches WHERE document @@ to_tsquery('${query}')`;
    db.query(q, {type: db.QueryTypes.SELECT}).then(u => res.json(u).end());
    */

    
    db.users.findAll({
      where: {
        [sequelize.Op.or]: [
          {username: {[sequelize.Op.iLike]: `%${query}%`}}, 
          {name: {[sequelize.Op.iLike]: `%${query}%`}}
        ]}
      //where: { document: { $ts: sequelize.fn('to_tsquery', query) } }
    }).then(u => {
      res.json(u).end();
    });
  });

};
