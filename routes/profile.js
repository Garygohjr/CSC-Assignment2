const { ok } = require('assert');
var express = require('express');
var router = express.Router();
var path = require('path');
var mysql = require('mysql');
const e = require('express');
var AWS = require('aws-sdk');
const {ClarifaiStub, grpc} = require("clarifai-nodejs-grpc");
AWS.config.update({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY,
    sessionToken: process.env.SESSIONTOKEN
});
var s3BucketName = 'talentsphotosbucket';
AWS.config.region = 'us-east-1';

var connection = mysql.createConnection({
    host     : process.env.HOST,
    user     : process.env.SQL_USER,
    password : process.env.SQL_PASS,
    database : process.env.DATABASE
  });

const stub = ClarifaiStub.grpc();
  
const metadata = new grpc.Metadata();
metadata.set("authorization", "Key " + process.env.CLARIFAI_AUTH_KEY);

router.get('/', function(req, res, next) {
    console.log('profile');
    res.sendFile(path.join(__dirname + '/../public/userProfile.html'));
});

router.post('/uploadImage', function(req, res, next) {
  var imageDataUrl = req.body.ImageDataUrl;
  var buf = Buffer.from(imageDataUrl.replace(/^data:image\/\w+;base64,/, ""),'base64');
  stub.PostModelOutputs(
    {
        // model id of face detector
        model_id: process.env.CLARIFAI_MODEL_ID,
        inputs: [{data: {image: {base64: buf}}}]
    },
    metadata,
    (err, response) => {
        if (err) {
            console.log("Error: " + err);
        }

        if (response.status.code !== 10000) {
            console.log("Received failed status: " + response.status.description + "\n" + response.status.details);
        }
        console.log(response);
        console.log(response.outputs[0].data);
        var detectedRegions = response.outputs[0].data.regions;
        if (detectedRegions.length == 0) {
            return res.status('400').send({ msg: "Please upload an image that is of human being" });
          } else {
              for (var i = 0; i < detectedRegions.length; i++) {
                  //if the predicted value is above 0.5, we will consider the image has a human being and upload to S3
                  if (detectedRegions[i].value > 0.5) {
                      var s3 = new AWS.S3({
                          params: { Bucket: s3BucketName }
                      });
                      s3.putObject({
                          Key: req.body.FileName,
                          ContentType: req.body.FileType,
                          Body: buf,
                          ACL: "public-read"
                      }, function (data, error) {
                        
                          //after image is uploaded, make changes to database
                          var imageUrl = "https://talentsphotosbucket.s3.amazonaws.com/" + req.body.FileName;
                          connection.query("insert into TalentPictures (ImageUrl, Description, TalentId) Values('" + imageUrl + "','" + req.body.Description + "','" + req.body.TalentId + "');"
                              , function (error, results, fields) {
                                  if (error) {
                                      return res.status('400').send({ msg: "error updating database" });
                                  } else {
                                      console.log(results);
                                      var id = results.insertId;
                                      return res.status('200').send({ results: req.body, imageUrl: imageUrl, id: id });
                                  }
                              });
                      });
                  } else {
                      //if no image is detected to be human
                      if (i == detectedRegions.length - 1) {
                          return res.status('400').send({ msg: "Please upload an image that is of human being" });
                      }
                  }
              }
          }
      }
  );
});

router.put('/updateImage', function(req, res, next) {
  //check for the no of images references the image about to be updated/deleted
  //if it is 1, remove it from S3
  var imgReferences;
  var data;
  var imageDataUrl = req.body.ImageDataUrl;
  var buf = Buffer.from(imageDataUrl.replace(/^data:image\/\w+;base64,/, ""),'base64');
    stub.PostModelOutputs(
        {
            // model id of face detector
            model_id: "d02b4508df58432fbb84e800597b8959",
            inputs: [{data: {image: {base64: buf}}}]
        },
        metadata,
        (err, response) => {
            if (err) {
                console.log("Error: " + err);
            }
    
            if (response.status.code !== 10000) {
                console.log("Received failed status: " + response.status.description + "\n" + response.status.details);
            }
            console.log(response);
            console.log(response.outputs[0].data);
            var detectedRegions = response.outputs[0].data.regions;
            if (detectedRegions.length == 0) {
                return res.status('400').send({ msg: "Please upload an image that is of human being" });
              } else {
                  for (var i = 0; i < detectedRegions.length; i++) {
                      //if the predicted value is above 0.5, we will consider the image has a human being and upload to S3
                      if (detectedRegions[i].value > 0.5) {
                          var s3 = new AWS.S3({
                              params: { Bucket: s3BucketName }
                          });
                          s3.putObject({
                              Key: req.body.FileName,
                              ContentType: req.body.FileType,
                              Body: buf,
                              ACL: "public-read"
                          }, function (data, error) {
                            var imageUrl = "https://talentsphotosbucket.s3.amazonaws.com/" + req.body.FileName;
                            connection.query("Update TalentPictures set ImageUrl='" + imageUrl + "',Description='" + req.body.Description + "' where ImageId=" + req.body.ImageId + ";"
                              , function (error, results, fields) {
                                  if (error){
                                      return res.status('400').send({ msg: "error updating database"  });
                                  }else{
                                      console.log(results);
                                      data = req.body;
                                      //check to see if the original image is referenced in the database
                                      connection.query("select * from TalentPictures where ImageUrl = '" + req.body.OriginalImageUrl + "';"
                                          , function (error, results, fields) {
                                              if (error) {
                                                  return res.status('400').send({ msg: "error querying database" });
                                              } else {
                                                  //if it is not referenced, delete that object from S3
                                                  console.log(results);
                                                  imgReferences = results.length;
                                                  if (imgReferences == 0) {
                                                      s3.deleteObject({
                                                          Key: req.body.ImageKey
                                                      }, function (err, data) {
                          
                                                      });
                                                  }
                                                  return res.status('200').send({ results: data, imageUrl:imageUrl });
                                              }
                                          });
                                  }
                              });
                          });
                      } else {
                          //if no image is detected to be human
                          if (i == detectedRegions.length - 1) {
                              return res.status('400').send({ msg: "Please upload an image that is of human being" });
                          }
                      }
                  }
              }
          }
      );
})

router.delete('/deleteImage', function(req, res, next) {
    var s3 = new AWS.S3({
        params: { Bucket: s3BucketName }
        });
  var imgReferences;
  var data;
  //delete selected image from database
  connection.query("delete from TalentPictures where ImageId =" + req.body.ImageId +";"
    , function (error, results, fields) {
        if (error){
            return res.status('400').send({ msg: "error deleteing from database"  });
        }else{
            console.log(results);
            data = req.body;
        }
    });
    //check to see if the original image is referenced in the database
    connection.query("select * from TalentPictures where ImageUrl = '" + req.body.OriginalImageUrl+"';"
    , function (error, results, fields) {
        if (error){
            return res.status('400').send({ msg: "error querying database"  });
        }else{
            console.log(results);
            imgReferences = results.length;
            //if it is not referenced, delete that object from S3
            if (imgReferences == 0) {
                s3.deleteObject({
                    Key: req.body.ImageKey
                }, function (err, data) {

                });
            }
            return res.status('200').send({ results: "deleted!"});
        }
    });
})

module.exports = router;
