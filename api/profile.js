const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const {isAuthenticated, isRole} = require("../tools/api.js");
const sequelize = require("sequelize");

/**
 * Profile Route used for all user profile operations
 */

/**
 * Similar to codeblocksroute, earlier in the project a lot of work was done to keep 
 * the payloads returned by APIs as flat objects. Later routes trended more towards trusting
 * sequelize to form the hierarchy via associations. This helper function bubbles up associations
 * into top-level properties.
 * @param {Object} user The logged in user
 * @param {Object} p the profile to flatten
 */
function flattenProfile(user, p) {
  p.geoname = p.geo ? p.geo.geoname : null;
  p.schoolname = p.school ? p.school.schoolname : null;
  p.id = p.user ? p.user.id : "";
  p.name = p.user ? p.user.name : "";
  p.email = p.user ? p.user.email : "";
  p.username = p.user ? p.user.username : "";
  return p;
}

// Sequelize associations for use in queries below
const pInclude = [        
  {association: "user", attributes: ["id", "name", "email", "username"]}, 
  {association: "geo", attributes: [["name", "geoname"]]}, 
  {association: "school", attributes: [["name", "schoolname"]]}
];

module.exports = function(app) {

  const {db} = app.settings;

  /**
   * Update a user profile
   * @param {Object} req.body An object with updated fields 
   * @returns {number} Affected rows (1)
   */
  app.post("/api/profile/update", isAuthenticated, (req, res) => {
    // Do not allow users to change administrative portions of their profile
    delete req.body.sharing;
    delete req.body.reports;
    delete req.body.last_upped;
    db.userprofiles.update(req.body, {where: {uid: req.user.id}}).then(u => res.json(u).end());  
  });

  /**
   * When a user submits a report/flag, deduct this from their monthly allocation 
   * to prevent flagging abuse (default 5, set as default in postgres DB)
   * @returns {number} Affected rows (1)
   */
  app.post("/api/profile/decrement", isAuthenticated, (req, res) => {
    db.userprofiles.update({reports: sequelize.literal("reports -1")}, {where: {uid: req.user.id}}).then(u => res.json(u).end());
  });

  /**
   * Admin-only route to enable or disable sharing for a given user 
   * @param {Object} req.body body object that contains the uid of the user to toggle
   * @returns {number} Affected rows (1)
   */
  app.post("/api/profile/setsharing", isRole(2), (req, res) => {
    const {uid} = req.body;
    db.userprofiles.update(req.body, {where: {uid}}).then(u => res.json(u).end());  
  });

  /**
   * Get a profile by username, only if logged in
   * @param {Object} req.params username to look up
   * @returns {Object} user profile
   */
  app.get("/api/profile/:username", isAuthenticated, (req, res) => {
    const {username} = req.params;
  
    db.userprofiles.findAll({
      // add constraint to include by provided username
      include: pInclude.map(i => i.association === "user" ? Object.assign({}, i, {where: {username}}) : i)
    })
      .then(users => {
        if (!users.length) {
          return res.json({error: "No user matched that username."});
        }
        const user = flattenProfile(req.user, users[0].toJSON());
  
        // This code gives the user 5 reports a month, and resets after 30 days.
        // TODO: move this hard-coded number 5 to a canon environment variable
        const oldDate = new Date(user.last_upped);
        const now = new Date();
        if (now - oldDate > 1000 * 60 * 60 * 24 * 30) {
          user.last_upped = now.toLocaleDateString().replace("/", "-");
          user.reports = 5;
          const payload = {last_upped: user.last_upped, reports: user.reports};
          return db.userprofiles.update(payload, {where: {uid: user.id}}).then(() => res.json(user).end());  
        }
        else {
          return res.json(user).end();
        }
      });
  });

  /**
   * Used by Share to fetch the profile credentials for the public share embed
   * @param {Object} req.params params that contain the user to look up 
   * @returns {Object} the username and name of the requested user
   */  
  app.get("/api/profile/share/:username", (req, res) => {
    const {username} = req.params;
  
    db.users.findOne({
      where: {username},
      attributes: ["id", "username", "name"]
    })
      .then(user => 
        res.json(user).end()
      );
  });

  /**
   * Update the logged in user's contact email, currently used only by ContestSignup
   * @param {Object} req.body post body containing new email
   * @returns {number} affected rows
   */  
  app.post("/api/user/email", isAuthenticated, (req, res) => {
    const {email} = req.body;
    db.users.update(
      {email},
      {where: {id: req.user.id}}
    ).then(u => res.json(u).end());

  });

  /**
   * There are a number of codelife operations where, in addition to the canon user,
   * the correlating userprofile entry is required. However, a userprofile is not technically
   * created until the user logs in and creates on themselves. This ping endpoint, run 
   * only once after a user signs up for the first time, creates a userprofile stub for them
   * so that all sequelize queries that require userprofile will not error out. Used in App.jsx
   * TODO: This shouldn't be a GET.
   * @returns {number} affected rows
   */  
  app.get("/api/profileping", isAuthenticated, (req, res) => {
    db.userprofiles.findOrCreate({where: {uid: req.user.id}}).then(u => {
      res.json(u).end();
    });
  });

  /**
   * Update the logged in user's profile
   * @param {Object} req.body post body containing updated stats
   * @returns {Object} the updated profile
   */  
  app.post("/api/profile/", isAuthenticated, (req, res) => {
    const {bio, cpf, dob, gender, gid, name, sid} = req.body;
    db.users.update(
      {name},
      {where: {id: req.user.id}}
    ).then(() => {
      db.userprofiles.findOrCreate({where: {uid: req.user.id}})
        .then(userprofiles => {
          if (userprofiles.length) {
            const userprofile = userprofiles[0];
            userprofile.bio = bio;
            userprofile.cpf = cpf;
            userprofile.dob = dob;
            userprofile.gender = gender;
            userprofile.gid = gid;
            userprofile.sid = sid;
            return userprofile.save().then(() => res.json(userprofile).end());
          }
          else {
            return res.json({error: "Unable to update user profile."}).end();
          }
        });
    });
  });

  /**
   * Used to get all other users by a school or location
   * @param {Object} req.query query string containing gid/sid for lookup
   * @returns {Object[]} A list of profiles matching the query
   */ 
  app.get("/api/profile/byid/all", (req, res) => {
    const {gid, sid} = req.query;
    if (!gid && !sid) return res.json({error: "Only gid and sid searches allowed"});

    const params = {
      include: [
        {association: "user", attributes: ["id", "name", "email", "username"]}, 
        {association: "geo", attributes: [["name", "geoname"]]}, 
        {association: "school", attributes: [["name", "schoolname"]]}
      ]
    };

    if (gid) params.include[1].where = {id: gid};
    if (sid) params.include[2].where = {id: sid};
    
    return db.userprofiles.findAll(params)
      .then(users => {
        if (!users.length) {
          return res.json({error: "No users matched that location."});
        } 
        else {
          const flatusers = users.map(u => {
            const user = u.toJSON();
            user.geoname = user.geo ? user.geo.geoname : null;
            user.schoolname = user.school ? user.school.schoolname : null;
            user.id = user.user ? user.user.id : "";
            user.name = user.user ? user.user.name : "";
            user.email = user.user ? user.user.email : "";
            user.username = user.user ? user.user.username : "";
            return user;
          });        
          return res.json(flatusers).end();  
        }
        
      });
  });

  // Multer is required to process file uploads and make them available via
  // req.files.
  const upload = multer({
    // storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024 // no larger than 5mb
    },
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error("Only image files are allowed!"));
      }
      return callback(null, true);
    }
  });

  // Image uploader for profile pictures
  const imgUpload = upload.single("file");
  app.post("/api/profileImgUpload/", isAuthenticated, (req, res) => {
    imgUpload(req, res, err => {
      if (err) return res.json({error: err});

      if (!req.file) {
        return res.json({error: "No file."});
      }

      const sampleFile = req.file;
      const {id: uid} = req.user;
      // const userId = "test-123";
      const newFileName = `user${uid.replace(/-/g, "")}.jpg`;
      const imgPath = path.join(process.cwd(), "/static/uploads", newFileName);
      // return res.json({f: newFileName, f2: imgPath});

      return sharp(sampleFile.buffer)
        .toFormat(sharp.format.jpeg)
        .resize(350, 350)
        .toFile(imgPath, (uploadErr, info) => {
          if (uploadErr) {
            return res.status(500).send(uploadErr);
          }
          else {
            return db.userprofiles.update(
              {img: newFileName},
              {where: {uid}}
            ).then(() => res.json(info));
          }
        });
    });
  });

  // Find all schools by gid (forced Minas Gerais "4mg" version)
  app.get("/api/schools", isAuthenticated, (req, res) => {
    db.schools.findAll(
      {where: {gid: {$ilike: "4mg%"}}}
    ).then(schools => res.json(schools));
  });

  // Find all schools by sid
  app.get("/api/schoolsBySid", isAuthenticated, (req, res) => {
    const {sid} = req.query;
    const q = `SELECT schools.* FROM schools as s, schools WHERE s.id = '${sid}' AND s.gid = schools.gid;`;

    db.query(q, {type: db.QueryTypes.SELECT}).then(schools => res.json(schools));
  });

  // Find all schools by gid
  app.get("/api/schoolsByGid", isAuthenticated, (req, res) => {
    const {gid} = req.query;
    db.schools.findAll(
      {where: {gid}}
    ).then(schools => res.json(schools));
  });

  // Fetch geos, used in drop down selector for profiles
  app.get("/api/geos", isAuthenticated, (req, res) => {
    const {state} = req.query;
    db.geos.findAll(
      {where: {id: {$ilike: `${state}%`}, sumlevel: "MUNICIPALITY"}}
    ).then(geos => res.json(geos));
  });

};
