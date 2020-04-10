var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {

  db.query('select * from product', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});

router.get('/invoiceList', function(req, res, next) {

  db.query('select * from invoice', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});

router.get('/invoice/:id_invoice', function(req, res, next) {

  db.query('select * from invoice where id_invoice='+req.params.id_invoice+'', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});

router.post('/invoice', function(req, res, next) {
  let invoice_no = req.body.invoice_no;
  let order_no = req.body.order_no;
  
  db.query(`insert into invoice (invoice_no, order_no) values (${invoice_no},${order_no})`, 
  function (err, result) {
    if (err) throw err;
    
    res.send(result);
  })
});

router.get('/account_head', function(req, res, next) {

  db.query('select * from account_head', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});



module.exports = router;