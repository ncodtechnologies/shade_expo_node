var express = require('express');
var router = express.Router();

router.get('/purchaseReport/:from/:to', function(req, res, next) {

  db.query('select pv.id_purchase_voucher,pv.voucher_no,s.name as account_head,DATE_FORMAT(pv.date, "%d/%m/%Y") as date,sum(pvi.kg) as kg,sum(pvi.quantity) as quantity,sum(pvi.total) as amount from z_purchase_voucher pv,z_purchase_voucher_item pvi, account_head s where pvi.id_purchase_voucher=pv.id_purchase_voucher and s.id_account_head=pv.id_account_head and date between '+req.params.from+' and '+req.params.to+' group by pv.voucher_no', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

  });

router.get('/purchaseVoucher/:voucher_no', function(req, res, next) {

  db.query('select pv._old_balance,pv.voucher_no,DATE_FORMAT(pv.date, "%d/%m/%Y") as date,a.name as account_head,p.name,pvi.kg,pvi.unit_price,pvi.total from z_purchase_voucher_item pvi,z_purchase_voucher pv,account_head a,product p where p.id_product=pvi.id_product and pv.id_account_head=a.id_account_head and pvi.id_purchase_voucher=pv.id_purchase_voucher and voucher_no='+req.params.voucher_no+' ', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

  });

router.get('/purchaseVoucherItems/:voucher_no', function(req, res, next) {

    db.query('select p.name,pvi.quantity,pvi.kg,pvi.unit_price,pvi.total from z_purchase_voucher_item pvi,z_purchase_voucher pv,product p where p.id_product=pvi.id_product and pvi.id_purchase_voucher=pv.id_purchase_voucher and voucher_no='+req.params.voucher_no+' ', function (err, rows, fields) {
      if (err) throw err
  
       res.send(rows); 
    })

  });

router.get('/purchaseVoucherExpense/:voucher_no', function(req, res, next) {

    db.query('select e.expense,e.amount from z_purchase_expenses e,z_purchase_voucher p where e.id_purchase_voucher=p.id_purchase_voucher and p.voucher_no='+req.params.voucher_no+' and e.amount>0 ', function (err, rows, fields) {
      if (err) throw err
  
       res.send(rows); 
    })

  });


module.exports = router;