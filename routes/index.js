var express = require('express');
var router = express.Router();
var sso = require('./disqusSSO');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/useDisqusSSO', function(req, res, next) {
  console.log('sso');
  console.log(req.body);
  var user = req.body;
  var data = sso.disqusSignon(user);
  console.log(data);
  res.send({credentials:data});
  
});

module.exports = router;
