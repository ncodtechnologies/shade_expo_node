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
  let items             = req.body.items;

  db.query(`insert into invoice (invoice_no, order_no, date, buyer_date, exporter, consignee, other,buyer,country_origin, country_final, pre_carriage, receipt_place, vessel_no,port_load,port_discharge, final_destination, marks, container_no, awb_no, terms) values (${invoice_no},${order_no}, '${date}', '${buyer_date}', '${exporter}', '${consignee}', '${other}', '${buyer}', '${country_origin}', '${country_final}', '${pre_carriage}', '${receipt_place}','${vessel_no}', '${port_load}','${port_discharge}', '${final_destination}', '${marks}', '${container_no}', '${awb_no}', '${terms}')`,function (err, result) {
    if (err) throw err;

    if(result.insertId)
      items.forEach(item => { 
        let qry = `insert into invoice_sales (col1, col2, col3, col4) values ('${result.insertId}','${item.id_product}','${item.kg}','${item.box}')`;
        console.log(qry); 
        //db.query(qry, function (err, result) {  })
      }); 
    
    res.send(result);
  })
});


router.get('/account_head', function(req, res, next) {

  db.query('select * from account_head', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});

router.get('/invoice/invLabour/:id_invoice', function(req, res, next) {

  db.query('select * from  invoice_labour l, account_head a where l.id_account_head=a.id_account_head and id_invoice='+req.params.id_invoice+'', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});


router.get('/invoice/invPacking/:id_invoice', function(req, res, next) {

  db.query('select * from  invoice_packing_list l, product p where l.id_product=p.id_product  where id_invoice='+req.params.id_invoice+'', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});


router.get('/invoice/invPackingExp/:id_invoice', function(req, res, next) {

  db.query('select * from  invoice_packing_expense e, account_head a where e.id_account_head=a.id_account_head and id_invoice='+req.params.id_invoice+'', function (err, rows, fields) {
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
  
 
 console.log(req.body)
});


router.get('/invoice/expense/:id_invoice', function(req, res, next) {

  db.query('select tbl.acc_from,h.account_head as acc_to,tbl.date,concat(tbl.description, " x ", tbl.rate) as description,tbl.amount from(select a.account_head as acc_from,e.id_ledger_to,e.date,e.description,e.rate,e.amount,e.id_invoice from account_voucher e, account_head a where e.id_ledger_from=a.id_account_head  and id_invoice='+req.params.id_invoice+')tbl ,account_head h where tbl.id_ledger_to=h.id_account_head and id_invoice='+req.params.id_invoice+'', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});

router.get('/accounts/:date/:type', function(req, res, next) {

  db.query('select tbl.type,tbl.acc_from,h.account_head as acc_to,tbl.date,concat(tbl.description, " x ", tbl.rate) as description,tbl.amount from(select a.account_head as acc_from,e.id_ledger_to,e.date,e.description,e.rate,e.amount,e.id_invoice,e.type from account_voucher e, account_head a where e.id_ledger_from=a.id_account_head  and e.date='+req.params.date+' and e.type='+req.params.type+')tbl ,account_head h where tbl.id_ledger_to=h.id_account_head and tbl.date='+req.params.date+' and tbl.type='+req.params.type+'', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});

router.post('/payroll', function(req, res, next) {
  let date            = req.body.date;
  let id_ledger       = req.body.id_ledger;
  let amount          = req.body.amount;
  let type            = req.body.type;
  
  db.query(`insert into payroll (date, id_ledger, type, amount) values('${date}', ${id_ledger}, '${type}', '${amount}')`,function (err, result) {
    if (err) throw err;
    
    res.send(result);
  })
});


router.get('/payroll/:date', function(req, res, next) {

  db.query('select a.account_head as name,p.date,p.type,p.amount from payroll p, account_head a where p.id_ledger=a.id_account_head and date='+req.params.date+'', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});

module.exports = router;