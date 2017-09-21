const multer = require("multer");
const path = require("path");
const sharp = require("sharp");

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/builder/lessons", (req, res) => {

    db.lessons.findAll({where: req.query}).then(u => {
      res.json(u).end();
    });

  });

  app.post("/api/builder/lessons/save", (req, res) => {
    
    db.lessons.update(req.body, {where: {id: req.body.id}}).then(u => {
      res.json(u).end();
    });

  });  

  app.post("/api/builder/lessons/new", (req, res) => {
    
    db.lessons.create(req.body).then(u => {
      res.json(u).end();
    });

  });

  app.delete("/api/builder/lessons/delete", (req, res) => {

    /*const q = "delete from lessons where lessons.id = '" + req.query.id + "'";
    db.query(q, {type: db.QueryTypes.DELETE}).then(u => res.json(u).end());*/

    db.lessons.destroy({where: {id: req.query.id}}).then(u => {
      res.json(u).end();
    });    

  });

  app.get("/api/builder/minilessons", (req, res) => {

    db.minilessons.findAll({where: {lid: req.query.lid}}).then(u => {
      res.json(u).end();
    });

  });

  app.post("/api/builder/minilessons/save", (req, res) => {
    
    db.minilessons.update(req.body, {where: {id: req.body.id}}).then(u => {
      res.json(u).end();
    });

  });

  app.post("/api/builder/minilessons/new", (req, res) => {
    
    db.minilessons.create(req.body).then(u => {
      res.json(u).end();
    });

  });

  app.get("/api/builder/minilessons/all", (req, res) => {

    db.minilessons.findAll({where: req.query}).then(u => {
      res.json(u).end();
    });

  });

  app.delete("/api/builder/minilessons/delete", (req, res) => {

    /*const q = "delete from minilessons where minilessons.id = '" + req.query.id + "'";
    db.query(q, {type: db.QueryTypes.DELETE}).then(u => res.json(u).end());*/

    db.minilessons.destroy({where: {id: req.query.id}}).then(u => {
      res.json(u).end();
    });    

  });

  app.get("/api/builder/slides", (req, res) => {

    db.slides.findAll({where: {mlid: req.query.mlid}}).then(u => {
      res.json(u).end();
    });

  });

  app.get("/api/builder/slides/all", (req, res) => {

    db.slides.findAll({where: req.query}).then(u => {
      res.json(u).end();
    });

  });  

  app.post("/api/builder/slides/save", (req, res) => {
    
    db.slides.update(req.body, {where: {id: req.body.id}}).then(u => {
      res.json(u).end();
    });

  });

  app.post("/api/builder/slides/new", (req, res) => {
    
    db.slides.create(req.body).then(u => {
      res.json(u).end();
    });

  });

  app.delete("/api/builder/slides/delete", (req, res) => {

    /*const q = "delete from slides where slides.id = '" + req.query.id + "'";
    db.query(q, {type: db.QueryTypes.DELETE}).then(u => res.json(u).end());*/

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

  app.post("/api/slideImgUpload/", (req, res) => {
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
