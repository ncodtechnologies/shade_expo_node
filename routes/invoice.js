var express = require('express');
var router = express.Router();


router.get('/invoiceList', function(req, res, next) {

  db.query('select * from invoice', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});

router.get('/invoice/?:id_invoice', function(req, res, next) {

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
  
  db.query(`insert into invoice (invoice_no, order_no, date, buyer_date, exporter, consignee, other,buyer,country_origin, country_final, pre_carriage, receipt_place, vessel_no,port_load,port_discharge, final_destination, marks, container_no, awb_no, terms) values ('${invoice_no}','${order_no}', '${date}', '${buyer_date}', '${exporter}', '${consignee}', '${other}', '${buyer}', '${country_origin}', '${country_final}', '${pre_carriage}', '${receipt_place}','${vessel_no}', '${port_load}','${port_discharge}', '${final_destination}', '${marks}', '${container_no}', '${awb_no}', '${terms}')`,function (err, result) {
    if (err) throw err;
    
    res.send(result);
  })
});



router.get('/invoice/invLabour/:id_invoice', function(req, res, next) {

  db.query('select * from  invoice_labour l, z_account_head a where l.id_account_head=a.id_account_head and id_invoice='+req.params.id_invoice+'', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});


router.get('/invoice/invPacking/:id_invoice', function(req, res, next) {

  db.query('select * from  invoice_packing_list l, z_product p where l.id_product=p.id_product' , function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});


router.get('/invoice/invPackingExp/:id_invoice', function(req, res, next) {

  db.query('select * from  invoice_packing_expense e, z_account_head a where e.id_account_head=a.id_account_head and id_invoice='+req.params.id_invoice+'', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});


router.post('/invoice/expense', function(req, res, next) {
  let date            = req.body.date;
  let id_ledger_from  = req.body.id_ledger_from;
  let id_ledger_to    = req.body.id_ledger_to;
  let description     = req.body.description;
  let rate            = req.body.rate;
  let amount          = req.body.amount;
  let type            = req.body.type;
  let voucher_no      = req.body.voucher_no;
  let id_invoice      = req.body.id_invoice;
  
  db.query(`insert into account_voucher (id_ledger_from ,id_ledger_to,date, description, rate, amount, type,voucher_no,id_invoice) values(${id_ledger_from},${id_ledger_to},'${date}', '${description}', '${rate}', '${amount}', '${type}',${voucher_no}, ${id_invoice})`,function (err, result) {
    if (err) throw err;
    
    res.send(result);
  })
});


router.get('/invoice/expense/:id_invoice', function(req, res, next) {

  db.query('select tbl.acc_from,h.account_head as acc_to,tbl.date,concat(tbl.description, " x ", tbl.rate) as description,tbl.amount from(select a.account_head as acc_from,e.id_ledger_to,e.date,e.description,e.rate,e.amount,e.id_invoice from account_voucher e, z_account_head a where e.id_ledger_from=a.id_account_head  and id_invoice='+req.params.id_invoice+')tbl ,z_account_head h where tbl.id_ledger_to=h.id_account_head and id_invoice='+req.params.id_invoice+'', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});


module.exports = router;