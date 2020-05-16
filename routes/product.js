var express = require('express');
var router = express.Router();

router.get('/product', function(req, res, next) {

  db.query('select * from product', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});

router.get('/stockReport/:id_product/:type', function(req, res, next) {
 
  let type       = req.params.type;
  let id_product = req.params.id_product;

  db.query(`select * from z_stock s, product p where s.id_product=p.id_product  and s.type=${type} and s.id_product=${id_product}`, function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});


module.exports = router;