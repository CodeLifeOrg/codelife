const {isRole, isAuthenticated} = require("../tools/api.js");
const Op = require("sequelize").Op;

module.exports = function(app) {

  const {db} = app.settings;

  // Used by Stats page to retrieve new user and site activity data
  app.get("/api/stats", isRole(2), (req, res) => {
    
    const launch = new Date(1511499600 * 1000);

    const params = {
      include: [
        {association: "user", where: {createdAt: {[Op.gt]: launch}}, attributes: ["id", "name", "email", "username", "createdAt"]}, 
        {association: "school", attributes: [["name", "schoolname"]], include: [{association: "geo", attributes: [["name", "geoname"]]}]},
        {association: "userprogress"}
      ],
      order: [[{model: db.users, as: "user"}, "createdAt", "DESC"]]
    };
    
    return db.userprofiles.findAll(params)
      .then(users => {
        if (!users.length) {
          return res.json({error: "No users matched that location."});
        } 
        else {
          const flatusers = users.map(u => {
            const user = u.toJSON();
            user.geoname = user.school && user.school.geo ? user.school.geo.geoname : null;
            user.schoolname = user.school ? user.school.schoolname : null;
            user.id = user.user ? user.user.id : "";
            user.name = user.user ? user.user.name : "";
            user.email = user.user ? user.user.email : "";
            user.username = user.user ? user.user.username : "";
            user.createdAt = user.user ? user.user.createdAt : "";
            return user;
          });        
          return res.json(flatusers).end();  
        }
        
      });
  });

  // Used by public leaderboard page page to retrieve new user and site activity data
  app.get("/api/stats/public", isAuthenticated, (req, res) => {
    
    const launch = new Date(1511499600 * 1000);

    const params = {
      include: [
        {association: "user", where: {createdAt: {[Op.gt]: launch}}, attributes: ["id", "name", "username", "createdAt"]}, 
        {association: "school", attributes: [["name", "schoolname"]], include: [{association: "geo", attributes: [["name", "geoname"]]}]},
        {association: "userprogress"}
      ],
      order: [[{model: db.users, as: "user"}, "createdAt", "DESC"]]
    };
    
    return db.userprofiles.findAll(params)
      .then(users => {
        if (!users.length) {
          return res.json({error: "No users matched that location."});
        } 
        else {
          const flatusers = users.map(u => {
            const user = u.toJSON();
            user.geoname = user.school && user.school.geo ? user.school.geo.geoname : null;
            user.schoolname = user.school ? user.school.schoolname : null;
            user.id = user.user ? user.user.id : "";
            user.name = user.user ? user.user.name : "";
            user.email = user.user ? user.user.email : "";
            user.username = user.user ? user.user.username : "";
            user.createdAt = user.user ? user.user.createdAt : "";
            return user;
          });        
          return res.json(flatusers).end();  
        }
        
      });
  });

};
