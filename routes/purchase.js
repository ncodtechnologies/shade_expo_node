var express = require('express');
var router = express.Router();

router.get('/purchaseReport/:from/:to', function(req, res, next) {

  db.query('select pv.id_purchase_voucher,pv.voucher_no,s.account_head,pv.date,sum(pvi.kg) as kg,sum(pvi.quantity) as quantity,sum(pvi.total) as amount from z_purchase_Voucher pv,z_purchase_voucher_item pvi, z_account_head s where pvi.id_purchase_voucher=pv.id_purchase_voucher and s.id_account_head=pv.id_account_head and date between '+req.params.from+' and '+req.params.to+' group by pv.voucher_no', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

  });

router.get('/purchaseVoucher/:voucher_no', function(req, res, next) {

  db.query('select pv.voucher_no,pv.date,a.account_head,p.name,pvi.kg,pvi.unit_price,pvi.total from z_purchase_voucher_item pvi,z_purchase_voucher pv,z_account_head a,z_product p where p.id_product=pvi.id_product and pv.id_account_head=a.id_account_head and pvi.id_purchase_voucher=pv.id_purchase_voucher and voucher_no='+req.params.voucher_no+' ', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

  });

router.get('/purchaseVoucherItems/:voucher_no', function(req, res, next) {

    db.query('select p.name,pvi.quantity,pvi.kg,pvi.unit_price,pvi.total from z_purchase_voucher_item pvi,z_purchase_voucher pv,z_product p where p.id_product=pvi.id_product and pvi.id_purchase_voucher=pv.id_purchase_voucher and voucher_no='+req.params.voucher_no+' ', function (err, rows, fields) {
      if (err) throw err
  
       res.send(rows); 
    })

  });

router.get('/purchaseVoucherExpense/:voucher_no', function(req, res, next) {

    db.query('select e.expense,e.amount from z_purchase_expenses e,z_purchase_voucher p where e.id_purchase_voucher=p.id_purchase_voucher and p.voucher_no='+req.params.voucher_no+' ', function (err, rows, fields) {
      if (err) throw err
  
       res.send(rows); 
    })

  });


module.exports = router;