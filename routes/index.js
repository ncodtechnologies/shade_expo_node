var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/:year', function(req, res, next) {
  res.render('index', { title: req.params.year });
});

module.exports = router;
