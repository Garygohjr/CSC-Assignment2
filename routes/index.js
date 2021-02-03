var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/profile', function(req, res, next) {
  console.log('profile');
  res.sendFile(path.join(__dirname + '/../public/userProfile.html'));
});

router.get('/talents', function(req, res, next) {
  console.log(req.body);
  res.sendFile(path.join(__dirname + '/../public/allTalents.html'));
});

router.get('/talents/:id', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/../public/talentDetails.html'));
});


module.exports = router;
