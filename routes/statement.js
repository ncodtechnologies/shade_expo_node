var express = require('express');
var router = express.Router();


router.get('/totalPurchase/:from/:to', function(req, res, next) {
    db.query(`select sum(pvi.total) as totalPurchase from z_purchase_voucher pv,z_purchase_voucher_item pvi where pvi.id_purchase_voucher=pv.id_purchase_voucher and date between ${req.params.from} and ${req.params.to}`, function (err, rows, fields) {
      if (err) throw err
  
       res.send(rows); 
    })
});

router.get('/totalSales/:from/:to', function(req, res, next) {
    db.query(`SELECT ROUND(sum(ii.total)*i.conversion_rate,2) as totalSales from invoice i, invoice_items ii where i.id_invoice = ii.id_invoice and date between ${req.params.from} and ${req.params.to}`, function (err, rows, fields) {
      if (err) throw err
  
       res.send(rows); 
    })
});

router.get('/expenses/:from/:to', function(req, res, next) {
    db.query(`SELECT id_ledger_group, name, sum(amount) as amount from (
        SELECT lg.id_ledger_group, lg.name, sum(amount) as amount from account_voucher av, account_head ah, ledger_group lg where ah.id_ledger_group = lg.id_ledger_group and id_ledger_to = ah.id_account_head and lg.id_ledger_group  in (10,11) and date between ${req.params.from} and ${req.params.to} group by lg.id_ledger_group 
        UNION 
        SELECT lg.id_ledger_group, lg.name, sum(amount) as amount from z_account_voucher av, account_head ah, ledger_group lg where ah.id_ledger_group = lg.id_ledger_group and  av.id_ledger = ah.id_account_head and lg.id_ledger_group  in (10,11) and date between ${req.params.from} and ${req.params.to}  group by lg.id_ledger_group 
        ) tbl GROUP by id_ledger_group `, function (err, rows, fields) {
      if (err) throw err
  
       res.send(rows); 
    })
});


router.get('/income/:from/:to', function(req, res, next) {
    db.query(`SELECT id_ledger_group, name, sum(amount) as amount from (
        SELECT lg.id_ledger_group, lg.name, sum(amount) as amount from account_voucher av, account_head ah, ledger_group lg where ah.id_ledger_group = lg.id_ledger_group and id_ledger_from = ah.id_account_head and lg.id_ledger_group  in (10,001) and date between ${req.params.from} and ${req.params.to} group by lg.id_ledger_group 
        UNION 
        SELECT lg.id_ledger_group, lg.name, sum(amount) as amount from z_account_voucher av, account_head ah, ledger_group lg where ah.id_ledger_group = lg.id_ledger_group and  av.id_ledger = ah.id_account_head and lg.id_ledger_group  in (10,001) and date between ${req.params.from} and ${req.params.to}  group by lg.id_ledger_group 
        ) tbl GROUP by id_ledger_group `, function (err, rows, fields) {
      if (err) throw err
  
       res.send(rows); 
    })
});


router.get('/payroll/:from/:to', function(req, res, next) {
    db.query(`SELECT SUM(amount) as amount from ( 
                    SELECT SUM(amount) as amount from payroll p where id_invoice=0 and date between ${req.params.from} and ${req.params.to}
                    union
                    SELECT SUM(amount) as amount from z_payroll where date between ${req.params.from} and ${req.params.to}
                )tbl`, function (err, rows, fields) {
      if (err) throw err
  
       res.send(rows); 
    })
});


router.get('/invoicePackingExp/:from/:to', function(req, res, next) {
    db.query(`select sum(amount) as amount from 
    (select sum(amount) as amount, i.id_invoice from  payroll p, account_head a, invoice i where p.id_account_head=a.id_account_head and i.id_invoice=p.id_invoice and i.date between ${req.params.from} and ${req.params.to}
    union
    select sum(ipi.qty*p.selling_price) as amount, i.id_invoice from  invoice_packing_item ipi, product p, invoice i where p.id_product=ipi.id_product and i.id_invoice=ipi.id_invoice and i.date between ${req.params.from} and ${req.params.to} ) tbl`, function (err, rows, fields) {
      if (err) throw err
  
       res.send(rows); 
    })
});


router.get('/invoiceFreightExp/:from/:to', function(req, res, next) {
    db.query(`select sum(amount) as amount from  invoice_freight_expense ife , invoice i where ife.id_invoice = i.id_invoice and i.date between ${req.params.from} and ${req.params.to}`, function (err, rows, fields) {
      if (err) throw err
  
       res.send(rows); 
    })
});


router.get('/invoiceOtherExp/:from/:to', function(req, res, next) {
    db.query(`select sum(amount) as amount from account_voucher av , invoice i where av.id_invoice = i.id_invoice and i.date between ${req.params.from} and ${req.params.to}`, function (err, rows, fields) {
      if (err) throw err
  
       res.send(rows); 
    })
});


module.exports = router;