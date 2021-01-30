const { ok } = require('assert');
var express = require('express');
var router = express.Router();
var path = require('path');
var mysql = require('mysql');
const e = require('express');
var connection = mysql.createConnection({
    host     : 'talents-database.cacr8kwxr9r3.us-east-1.rds.amazonaws.com',
    user     : 'admin123',
    password : 'admin123',
    database : 'TalentsDB'
  });

router.get('/', function(req, res, next) {
    console.log('profile');
    res.sendFile(path.join(__dirname + '/../public/userProfile.html'));
});

router.post('/uploadImage', function(req, res, next) {
  console.log(req.body);
  connection.query("insert into TalentPictures (ImageUrl, Description, TalentId) Values('" + req.body.ImageUrl + "','" + req.body.Description + "'," + req.body.TalentId + ");"
    , function (error, results, fields) {
        if (error){
            return res.status('400').send({ msg: "error"  });
        }else{
            console.log(results);
            var id = results.insertId;
            return res.status('200').send({ results: req.body, id: id});
        }
    });
})

router.put('/updateImage', function(req, res, next) {
  console.log(req.body);
  //check for the no of images references the image about to be updated/deleted
  //if it is 1, remove it from S3
  var imgReferences;
  var data;
  connection.query("Update TalentPictures set ImageUrl='" + req.body.ImageUrl + "',Description='" + req.body.Description + "' where ImageId=" + req.body.ImageId + ";"
    , function (error, results, fields) {
        if (error){
            return res.status('400').send({ msg: "error"  });
        }else{
            console.log(results);
            data = req.body;
        }
    });
    connection.query("select * from TalentPictures where ImageUrl = '" + req.body.OriginalImageUrl+"';"
    , function (error, results, fields) {
        if (error){
            return res.status('400').send({ msg: "error"  });
        }else{
            console.log(results);
            imgReferences = results.length;
            return res.status('200').send({ results: data, imgReferences: imgReferences});
        }
    });
})

router.delete('/deleteImage', function(req, res, next) {
  //check for the no of images references the image about to be updated/deleted
  //if it is 1, remove it from S3
  var imgReferences;
  var data;
  connection.query("delete from TalentPictures where ImageId =" + req.body.ImageId +";"
    , function (error, results, fields) {
        if (error){
            return res.status('400').send({ msg: "error"  });
        }else{
            console.log(results);
            data = req.body;
        }
    });
    connection.query("select * from TalentPictures where ImageUrl = '" + req.body.OriginalImageUrl+"';"
    , function (error, results, fields) {
        if (error){
            return res.status('400').send({ msg: "error"  });
        }else{
            console.log(results);
            imgReferences = results.length;
            return res.status('200').send({ results: "deleted!", imgReferences: imgReferences});
        }
    });
})

module.exports = router;
