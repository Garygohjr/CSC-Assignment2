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
    console.log(req.body);
    res.sendFile(path.join(__dirname + '/../public/allTalents.html'));
});

router.get('/getAllTalents', function(req, res, next) {
    var profiles;
    //gets all talent profiles
    connection.query('SELECT * FROM TalentProfile;'
    , function (error, results, fields) {
        if (error){
            return res.status('400').send({ msg: "error"  });
        }else{
            console.log(results);
            profiles = results;
        }
    });
    //get the latest talent image for each user(provided they have one)
    connection.query('select MAX(ImageId) as ImageId, ImageUrl, TalentId from TalentPictures group by TalentId;'
    , function (error, results, fields) {
        if (error){
            return res.status('400').send({ msg: "error"  });
        }else{
            console.log(results);
            var latestImages = results;
            return res.status('200').send({ profiles: profiles, latestImages: latestImages  });
        }
    });
});

router.get('/:id', function(req, res, next) {
    res.sendFile(path.join(__dirname + '/../public/talentDetails.html'));
});

router.get('/getOneTalent/:id', function(req, res, next) {
    console.log('one talent');
    var talentId = req.params.id;
    var profile;
    //gets all talent profiles
    connection.query('SELECT * FROM TalentProfile where TalentId = ' + talentId + ';'
    , function (error, results, fields) {
        if (error){
            return res.status('400').send({ msg: "error"  });
        }else{
            console.log(results);
            profile = results;
        }
    });
    //get the latest talent image for each user(provided they have one)
    connection.query('select ImageId, Description, ImageUrl, TalentId from TalentPictures where TalentId = ' + talentId + ';'
    , function (error, results, fields) {
        if (error){
            return res.status('400').send({ msg: "error"  });
        }else{
            console.log(results);
            var images = results;
            return res.status('200').send({ profile: profile, images: images  });
        }
    });
});

module.exports = router;
