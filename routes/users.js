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
  let invoice_no        = req.body.invoice_no;
  let order_no          = req.body.order_no;
  let date              = req.body.date;
  let buyer_date        = req.body.buyer_date;
  let exporter          = req.body.exporter;
  let consignee         = req.body.consignee;
  let other             = req.body.other;
  let buyer             = req.body.buyer;
  let country_origin    = req.body.country_origin;
  let country_final     = req.body.country_final;
  let pre_carriage      = req.body.pre_carriage;
  let receipt_place     = req.body.receipt_place;
  let vessel_no         = req.body.vessel_no;
  let port_load         = req.body.port_load;
  let port_discharge    = req.body.port_discharge;
  let final_destination = req.body.final_destination;
  let marks             = req.body.marks;
  let container_no      = req.body.container_no;
  let awb_no            = req.body.awb_no;
  let terms             = req.body.terms;
  
  db.query(`insert into invoice (invoice_no, order_no, date, buyer_date, exporter, consignee, other,buyer,country_origin, country_final, pre_carriage, receipt_place, vessel_no,port_load,port_discharge, final_destination, marks, container_no, awb_no, terms) values (${invoice_no},${order_no}, '${date}', '${buyer_date}', '${exporter}', '${consignee}', '${other}', '${buyer}', '${country_origin}', '${country_final}', '${pre_carriage}', '${receipt_place}','${vessel_no}', '${port_load}','${port_discharge}', '${final_destination}', '${marks}', '${container_no}', '${awb_no}', '${terms}')`,function (err, result) {
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