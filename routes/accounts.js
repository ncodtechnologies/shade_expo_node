var express = require('express');
var router = express.Router();

router.post('/ledgerCreate', function(req, res, next) {
  let code            = (req.body.code ? req.body.code : '')
  let name            = (req.body.name ? req.body.name : '')
  let id              = (req.body.id ? req.body.id : '')
  let op              = (req.body.op ? req.body.op : '')
  let address         = (req.body.address ? req.body.address : '')
  let phone           = (req.body.phone ? req.body.phone : '')
  
  db.query(`insert into z_account_head (code ,account_head,id_ledger_group,opening_balance,address,phone) values('${code}','${name}',${id}, '${op}', '${address}', '${phone}')`,function (err, result) {
    if (err) throw err;
    
    res.send(result);
  })
});

router.post('/ledgerGroup', function(req, res, next) {
  let ledger       = req.body.ledger;
  
  db.query(`insert into z_ledger_group (name) values('${ledger}')`,function (err, result) {
    if (err) throw err;    
    res.send(result);
  })
});


router.get('/ledgerGroup', function(req, res, next) {

  db.query('select * from z_ledger_group', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});


router.get('/ledger', function(req, res, next) {

  db.query('select * from z_account_head a, z_ledger_group l where a.id_ledger_group=l.id_ledger_group', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});

router.get('/voucher/:date/:type', function(req, res, next) {

  db.query('select tbl.type,tbl.acc_from,h.account_head as acc_to,tbl.date,concat(tbl.description, " x ", tbl.rate) as description,tbl.amount from(select a.account_head as acc_from,e.id_ledger_to,e.date,e.description,e.rate,e.amount,e.id_invoice,e.type from account_voucher e, z_account_head a where e.id_ledger_from=a.id_account_head  and e.date='+req.params.date+' and e.type='+req.params.type+')tbl ,z_account_head h where tbl.id_ledger_to=h.id_account_head and tbl.date='+req.params.date+' and tbl.type='+req.params.type+'', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});

router.post('/accounts/voucher', function(req, res, next) {
  let date            = (req.body.date ? req.body.date : '' );
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

module.exports = router;