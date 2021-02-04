const { ok } = require('assert');
var express = require('express');
var router = express.Router();
var path = require('path');
var mysql = require('mysql');
const e = require('express');

// Get env file for keys and Ids
const dotenv = require('dotenv');
dotenv.config();

var connection = mysql.createConnection({
    host     : process.env.HOST,
    user     : process.env.SQL_USER,
    password : process.env.SQL_PASS,
    database : process.env.DATABASE
  });

router.get('/getAllTalents', function(req, res, next) {
    var profiles;
    //gets all talent profiles
    connection.query('SELECT * FROM TalentProfile;'
    , function (error, results, fields) {
        if (error){
            return res.status('400').send({ msg: "error"  });
        }else{
            profiles = results;
        }
    });
    //get the latest talent image for each user(provided they have one)
    connection.query('select MAX(ImageId) as ImageId, ImageUrl, TalentId from TalentPictures group by TalentId;'
    , function (error, results, fields) {
        if (error){
            return res.status('400').send({ msg: "error"  });
        }else{
            var latestImages = results;
            return res.status('200').send({ profiles: profiles, latestImages: latestImages  });
        }
    });
});

router.get('/getOneTalent/:id', function(req, res, next) {
    console.log('one talent');
    var talentId = req.params.id;
    var profile;
    if(talentId.substring(0,4) == "cus_"){
        //gets all talent profiles
        connection.query("SELECT * FROM TalentProfile where TalentId = '" + talentId + "';"
        , function (error, results, fields) {
            if (error){
                return res.status('400').send({ msg: "error"  });
            }else{
                console.log(results);
                profile = results;
            }
        });
        //get the latest talent image for each user(provided they have one)
        connection.query("select ImageId, Description, ImageUrl, TalentId from TalentPictures where TalentId = '" + talentId + "';"
        , function (error, results, fields) {
            if (error){
                console.log(error);
                return res.status('400').send({ msg: "error"  });
            }else{
                console.log(results);
                var images = results;
                return res.status('200').send({ profile: profile, images: images  });
            }
        });
    }
    else{
        return res.status('400').send({ msg: "Invalid customer ID"  });
    }
    
});


router.post('/createTalent', function(req, res) {
    var custId = req.body.custId;
    var name = req.body.name;
    var bio = req.body.bio;
    var error_msg = "";
    if(!custId){
        error_msg += "Missing customer id<br/>"
      }
      if(!name){
        error_msg += "Missing name<br/>"
      }
      if(!bio){
        error_msg += "Missiong bio<br/>"
      }

      if (error_msg != "") {
        return res.status('400').send({ error_msg: error_msg });
      }
      else{
        connection.query("insert into TalentProfile (TalentId, TalentName, Biography) Values('" + custId + "','" + name + "','" + bio + "');"
        , function (error, results, fields) {
            if (error) {
                console.log(error);
                return res.status('500').send({ msg: "Error updating database", custId: custId }); 
                //custId contained inside response, as although createTalent has failed, createCustomer did succeed which means the stripe customer does exist
            } else {
                console.log(results);
                var id = results.insertId;
                return res.status('200').send({ msg: "Customer added as talent" });
            }
        });
      }

    
});

module.exports = router;
