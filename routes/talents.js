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
    //gets all talent profile along with their earliest uploaded image
    connection.query('SELECT TalentProfile.TalentId,TalentName, Biography, ImageUrl FROM TalentProfile INNER JOIN TalentPictures ON TalentProfile.TalentId=TalentPictures.TalentId group by TalentProfile.TalentId ORDER BY TalentProfile.TalentId; '
    , function (error, results, fields) {
        if (error){
            return res.status('400').send({ msg: "error"  });
        }else{
            console.log(results);
            return res.status('200').send({ results: results  });
        }
    });
});

router.get('/:id', function(req, res, next) {
    res.sendFile(path.join(__dirname + '/../public/talentDetails.html'));
});

router.get('/getOneTalent/:id', function(req, res, next) {
    console.log('one talent');
    var talentId = req.params.id;
    connection.query('SELECT TalentProfile.TalentId,TalentName, Biography, ImageUrl, ImageId, Description FROM TalentProfile INNER JOIN TalentPictures ON TalentProfile.TalentId=TalentPictures.TalentId where TalentPictures.TalentId=' + talentId + ' ORDER BY TalentProfile.TalentId; '
    , function (error, results, fields) {
        if (error){
            return res.status('400').send({ msg: "error"  });
        }else{
            console.log(results);
            return res.status('200').send({ results: results  });
        }
    });
});

module.exports = router;
