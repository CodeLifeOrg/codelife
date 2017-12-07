const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const {isRole} = require("../tools/api.js");

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/builder/islands", isRole(1), (req, res) => {
    db.islands.findAll({where: req.query}).then(u => {
      res.json(u).end();
    });
  });

  app.post("/api/builder/islands/save", isRole(1), (req, res) => {
    db.islands.update(req.body, {where: {id: req.body.id}}).then(u => {
      res.json(u).end();
    });
  });  

  app.post("/api/builder/islands/new", isRole(1), (req, res) => {  
    db.islands.create(req.body).then(u => {
      res.json(u).end();
    });
  });

  app.delete("/api/builder/islands/delete", isRole(1), (req, res) => {
    db.islands.destroy({where: {id: req.query.id}}).then(u => {
      res.json(u).end();
    });    
  });

  app.get("/api/builder/levels", isRole(1), (req, res) => {
    db.levels.findAll({where: {lid: req.query.lid}}).then(u => {
      res.json(u).end();
    });
  });

  app.post("/api/builder/levels/save", isRole(1), (req, res) => {
    db.levels.update(req.body, {where: {id: req.body.id}}).then(u => {
      res.json(u).end();
    });
  });

  app.post("/api/builder/levels/new", isRole(1), (req, res) => {
    db.levels.create(req.body).then(u => {
      res.json(u).end();
    });
  });

  app.get("/api/builder/levels/all", isRole(1), (req, res) => {
    db.levels.findAll({where: req.query}).then(u => {
      res.json(u).end();
    });
  });

  app.delete("/api/builder/levels/delete", isRole(1), (req, res) => {
    db.levels.destroy({where: {id: req.query.id}}).then(u => {
      res.json(u).end();
    });    
  });

  app.get("/api/builder/slides", isRole(1), (req, res) => {
    db.slides.findAll({where: {mlid: req.query.mlid}}).then(u => {
      res.json(u).end();
    });
  });

  app.get("/api/builder/slides/all", isRole(1), (req, res) => {
    db.slides.findAll({where: req.query}).then(u => {
      res.json(u).end();
    });
  });  

  app.post("/api/builder/slides/save", isRole(1), (req, res) => {
    db.slides.update(req.body, {where: {id: req.body.id}}).then(u => {
      res.json(u).end();
    });
  });

  app.post("/api/builder/slides/new", isRole(1), (req, res) => {
    db.slides.create(req.body).then(u => {
      res.json(u).end();
    });
  });

  app.delete("/api/builder/slides/delete", isRole(1), (req, res) => {
    db.slides.destroy({where: {id: req.query.id}}).then(u => {
      res.json(u).end();
    });    
  });

  // Multer is required to process file uploads and make them available via
  // req.files.
  const upload = multer({
    // storage: multer.memoryStorage(),
    /*
    limits: {
      fileSize: 5 * 1024 * 1024 // no larger than 5mb
    },
    */
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error("Only image files are allowed!"));
      }
      return callback(null, true);
    }
  });

  const imgUpload = upload.single("file");

  app.post("/api/slideImgUpload/", isRole(1), (req, res) => {
    imgUpload(req, res, err => {
      if (err) return res.json({error: err});

      if (!req.file) {
        return res.json({error: "No file."});
      }

      const sampleFile = req.file;
      const title = req.body.title;
      const newFileName = `${title}.jpg`;
      const imgPath = path.join(process.cwd(), "/static/slide_images", newFileName);

      sharp(sampleFile.buffer)
        .toFormat(sharp.format.jpeg)
        // .resize(350, 350)
        .toFile(imgPath, (uploadErr, info) => {
          if (uploadErr) {
            return res.status(500).send(uploadErr);
          }
          else {
            return res.json(info);
          }
        });
    });
  });

};
