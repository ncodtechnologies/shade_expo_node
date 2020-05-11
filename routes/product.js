var express = require('express');
var router = express.Router();

router.get('/product', function(req, res, next) {

  db.query('select * from product', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});


module.exports = router;