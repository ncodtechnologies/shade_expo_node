var express = require('express');
var router = express.Router();

router.post('/ledgerCreate', function(req, res, next) {
  console.log(req.body)

  let code            = (req.body.code ? req.body.code : '')
  let name            = (req.body.name ? req.body.name : '')
  let id              = (req.body.id ? req.body.id : '')
  let op              = (req.body.op ? req.body.op : '')
  let address         = (req.body.address ? req.body.address : '')
  let phone           = (req.body.phone ? req.body.phone : '')
  
  if((req.body.id_account_head) == '0')
  var qry=`insert into account_head (code ,account_head,id_ledger_group,opening_balance,address,phone) values('${code}','${name}',${id}, '${op}', '${address}', '${phone}')`;
  else
  var qry=`update account_head set code='${code}' ,account_head='${name}',id_ledger_group = ${id},opening_balance = '${op}',address ='${address}',phone ='${phone}' where id_account_head=`+req.body.id_account_head+``;
  
  db.query(``+qry+``,function (err, result) {
    if (err) throw err;
    
    res.send(result);
  })
});



router.post('/ledgerGroup', function(req, res, next) {
  let ledger       = req.body.ledger;
  
  db.query(`insert into ledger_group (name) values('${ledger}')`,function (err, result) {
    if (err) throw err;    
    res.send(result);
  })
});


router.get('/ledgerGroup', function(req, res, next) {

  db.query('select * from ledger_group', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});


router.get('/ledger', function(req, res, next) {

  db.query('select * from account_head a, ledger_group l where a.id_ledger_group=l.id_ledger_group', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});

router.get('/ledger/:id_ledger_group', function(req, res, next) {
  
  let qry;
  if(req.params.id_ledger_group != "")
  qry=' and l.id_ledger_group='+req.params.id_ledger_group+'';
  else
  qry='';

  db.query('select * from account_head a, ledger_group l where a.id_ledger_group=l.id_ledger_group '+ qry +'', function (err, rows, fields) {

    if (err) throw err

     res.send(rows); 
  })

});

router.get('/ledgerEdit/:id_ledger', function(req, res, next) {
  
  db.query('select * from account_head a, ledger_group l where a.id_ledger_group=l.id_ledger_group and a.id_account_head='+req.params.id_ledger+'', function (err, rows, fields) {

    if (err) throw err

     res.send(rows); 
  })

});

router.get('/voucher/:date/:type', function(req, res, next) {

  db.query('select tbl.type,tbl.acc_from,h.account_head as acc_to,tbl.date,concat(tbl.description, " x ", tbl.rate) as description,tbl.amount,tbl.id_account_voucher from(select a.account_head as acc_from,e.id_ledger_to,e.date,e.description,e.rate,e.amount,e.id_invoice,e.type,e.id_account_voucher from account_voucher e, account_head a where e.id_ledger_from=a.id_account_head  and e.date='+req.params.date+' and e.type='+req.params.type+')tbl ,account_head h where tbl.id_ledger_to=h.id_account_head and tbl.date='+req.params.date+' and tbl.type='+req.params.type+'', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});

router.get('/voucherDel/:id_account_voucher', function(req, res, next) {

  db.query('delete from account_voucher where id_account_voucher='+req.params.id_account_voucher+'', function (err, rows, fields) {
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