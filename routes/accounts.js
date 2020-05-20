var express = require('express');
var router = express.Router();
var Constants = require('./constant.json')

router.post('/ledgerCreate', function(req, res, next) {

  let code            = (req.body.code ? req.body.code : '')
  let name            = (req.body.name ? req.body.name : '')
  let id              = (req.body.id ? req.body.id : '')
  let op              = (req.body.op ? req.body.op : '')
  let address         = (req.body.address ? req.body.address : '')
  let phone           = (req.body.phone ? req.body.phone : '')
  
  if((req.body.id_account_head) == '0')
  {
    db.query(`select max(id_account_head)+1 as id_account_head FROM account_head where id_account_head>=${Constants.SERVER_LEDGER_LIMIT}`, function (err, rows, fields) {
      if (err) throw err
      
      var id_account_head = rows[0].id_account_head != null ? rows[0].id_account_head : Constants.SERVER_LEDGER_LIMIT;
      var qry=`insert into account_head (id_account_head, code ,name,id_ledger_group,opening_balance,address,phone) values('${id_account_head}','${code}','${name}',${id}, '${op}', '${address}', '${phone}')`;
      
      db.query(qry,function (err, result) {
        if (err) throw err;
        
        res.send(result);
      });
    })
  }
  else
  {
    var qry=`update account_head set code='${code}' ,name='${name}',id_ledger_group = ${id},opening_balance = '${op}',address ='${address}',phone ='${phone}' where id_account_head=`+req.body.id_account_head+``;
  
    db.query(qry,function (err, result) {
      if (err) throw err;
      
      res.send(result);
    })
  }
});

router.post('/ledgerGroup', function(req, res, next) {
  let ledger       = req.body.ledger;
  
  db.query(`select max(id_ledger_group)+1 as id_ledger_group FROM ledger_group where id_ledger_group>=${Constants.SERVER_LEDGER_LIMIT}`, function (err, rows, fields) {
    if (err) throw err
    
    var id_ledger_group = rows[0].id_ledger_group != null ? rows[0].id_ledger_group : Constants.SERVER_LEDGER_LIMIT;
    db.query(`insert into ledger_group (id_ledger_group, name) values('${id_ledger_group}','${ledger}')`);

  })

});


router.get('/ledgerGroup', function(req, res, next) {

  db.query('select * from ledger_group', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});


router.get('/ledger', function(req, res, next) {

  db.query('select *, a.name as account_head from account_head a, ledger_group l where a.id_ledger_group=l.id_ledger_group', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});

router.get('/ledger/:id_ledger_group', function(req, res, next) {
  
  let qry = '';
  if(req.params.id_ledger_group != "")
  {
    qry=' and l.id_ledger_group='+req.params.id_ledger_group+'';
    if(req.params.id_ledger_group < 0)
      qry=` and l.id_ledger_group!=${-1*req.params.id_ledger_group}`;
  }

  db.query('select *, a.name as account_head from account_head a, ledger_group l where a.id_ledger_group=l.id_ledger_group '+ qry +'', function (err, rows, fields) {

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

  db.query('select tbl.type,tbl.acc_from,h.name as acc_to,tbl.date,concat(tbl.description, " x ", tbl.rate) as description,tbl.amount,tbl.id_account_voucher from(select a.name as acc_from,e.id_ledger_to,e.date,e.description,e.rate,e.amount,e.id_invoice,e.type,e.id_account_voucher from account_voucher e, account_head a where e.id_ledger_from=a.id_account_head  and e.date='+req.params.date+' and e.type='+req.params.type+')tbl ,account_head h where tbl.id_ledger_to=h.id_account_head and tbl.date='+req.params.date+' and tbl.type='+req.params.type+'', function (err, rows, fields) {
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

router.get('/cashBookOp/:from_date/:id_account_head', function(req, res, next) {
  
  let from_date = req.params.from_date;
  let id_account_head = req.params.id_account_head;

  db.query(`SELECT ROUND(SUM(debit)-SUM(credit)) AS balance FROM ( SELECT '1' AS slno, id_account_voucher AS id, CAST(amount AS CHAR) AS debit, '0' AS credit 			FROM account_voucher av, account_head ah WHERE av.id_ledger_to=ah.id_account_head AND amount>0 AND date<${from_date} and id_ledger_to=${id_account_head} UNION SELECT '2' AS slno, id_account_voucher AS id, '0' AS debit,			 CAST(amount AS CHAR) AS credit FROM account_voucher av, account_head ah WHERE av.id_ledger_from=ah.id_account_head AND amount>0 AND date<${from_date} and id_ledger_to=${id_account_head} )tbl`, function (err, rows, fields) {

    if (err) throw err

     res.send(rows); 
  })

});

router.get('/cashBookDebit/:from_date/:to_date/:id_account_head', function(req, res, next) {
  let to_date = req.params.to_date;
  let from_date = req.params.from_date;
  let id_account_head = req.params.id_account_head;

  db.query(`SELECT NAME,narration,ROUND(SUM(debit)) AS debit FROM ( SELECT '1' AS slno, id_account_voucher AS id, (SELECT NAME FROM account_head WHERE id_account_head=av.id_ledger_from) AS NAME ,description AS narration,CAST(amount AS CHAR) AS debit FROM account_voucher av, account_head ah WHERE av.id_ledger_to=ah.id_account_head AND amount>0 AND date between ${from_date} and ${to_date} and id_ledger_to=${id_account_head})tbl GROUP BY NAME`, function (err, rows, fields) {

    if (err) throw err

     res.send(rows); 
  })

});

router.get('/cashBookCredit/:from_date/:to_date/:id_account_head', function(req, res, next) {
 
  let to_date = req.params.to_date;
  let from_date = req.params.from_date;
  let id_account_head = req.params.id_account_head;
  db.query(`SELECT NAME,narration,ROUND(SUM(credit)) AS credit FROM (SELECT '2' AS slno, id_account_voucher AS id, (SELECT NAME FROM account_head WHERE id_account_head=av.id_ledger_to) AS NAME ,description AS narration,CAST(amount AS CHAR) AS credit FROM account_voucher av, account_head ah WHERE av.id_ledger_from=ah.id_account_head AND amount>0 AND date between ${from_date} and ${to_date} and id_ledger_to=${id_account_head})tbl GROUP BY NAME`, function (err, rows, fields) {

    if (err) throw err

     res.send(rows); 
  })

});

router.get('/ledgerReport/:id_account_voucher', function(req, res, next) {

  var id_account_head = req.params.id_account_head;
  var from_date = req.params.from_date;
  var to_date = req.params.to_date;
  var from_date =req.params.from_date;
  var to_date = req.params.to_date;

  db.query('select id_ledger_group where id_account_head='+id_account_head+'', function (err, rows, fields) {
    if (err) throw err
    
    var ledger_type = rows[0].id_ledger_group;

    var qryPurchase = (ledger_type == Constants.SUPPLIER) ? ` union select '3' as slno, '2' as vchr_type, id_purchase_voucher as id_voucher,DATE_FORMAT(date ,'%d/%m/%Y') as date ,date as _date,narration,'Purchase' as type,cast(gross as char) as receipt,cast(payable as char) as payment from z_purchase_voucher  where date between ${from_date} and ${to_date} and id_account_head=${id_account_head}` : ``;
    var qrySales = (ledger_type == Constants.SUPPLIER) ? ` union select '4' as slno, '3' as vchr_type, id_sales_voucher as id_voucher,DATE_FORMAT(date ,'%d/%m/%Y') as date ,date as _date,narration,'Sales' as type,cast(received as char) as receipt,cast(gross as char) as payment from z_sales_voucher  where date between ${from_date} and ${to_date}  and id_account_head=${id_account_head}` : ``;
    var qryPayroll = (ledger_type == Constants.STAFF) ? ` union select '3' as slno, '4' as vchr_type, id_payroll as id_voucher,DATE_FORMAT(date ,'%d/%m/%Y') as date ,date as _date,type as narration,'Payroll' as type,cast(amount as char) as receipt,'0' as payment from z_payroll  where date between ${from_date} and ${to_date}  and id_account_head=${id_account_head}` : ``;
    
    var qry = `select '1' as slno, '1' as vchr_type, id_account_voucher as id_voucher,DATE_FORMAT(date ,'%d/%m/%Y') as date ,date as _date,remarks as narration,type as type,'0' as receipt,cast(amount as char) as payment from z_account_voucher  where type='Payment' and date between ${from_date} and ${to_date}  and id_ledger=${id_account_head}
             union
             select '2' as slno, '1' as vchr_type, id_account_voucher as id_voucher,DATE_FORMAT(date ,'%d/%m/%Y') as date ,date as _date,remarks as narration,type as type,cast(amount as char) as receipt,'0' as payment from z_account_voucher  where type='Receipt' and date between ${from_date} and ${to_date}  and id_ledger=${id_account_head} `;
    
    var qry_server = ` union 
             select '5' as slno, '1' as vchr_type, id_account_voucher as id_voucher,DATE_FORMAT(date ,'%d/%m/%Y') as date ,date as _date,description as narration,type as type,'0' as receipt,cast(amount as char) as payment from account_voucher  where type='Payment' and date between ${from_date} and ${to_date}  and id_ledger=${id_account_head}
             union
             select '6' as slno, '1' as vchr_type, id_account_voucher as id_voucher,DATE_FORMAT(date ,'%d/%m/%Y') as date ,date as _date,description as narration,type as type,cast(amount as char) as receipt,'0' as payment from account_voucher  where type='Receipt' and date between ${from_date} and ${to_date}  and id_ledger=${id_account_head} `;
    
    
    qry = `select * from ( ${qry} ${qry_server} ${qryPurchase} ${qrySales} ${qryPayroll} ) __tbl order by _date, slno`;
                  
    db.query(qry, function (err, rows, fields) {
      if (err) throw err
        
      res.send(rows);
    })
  })

});

module.exports = router;
