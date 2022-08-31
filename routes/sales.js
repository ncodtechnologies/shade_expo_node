var express = require('express');
var router = express.Router();

router.get('/salesReport/:from/:to/:id_account_head/:id_product', function(req, res, next) {
console.log(req.params);

  let supplier="";
  let product="";
  if(req.params.id_account_head != 0) {
    supplier = ` and pv.id_account_head='` + req.params.id_account_head + `' `;
  }
  if(req.params.id_product != 0){
    product = ` and pvi.id_product='` + req.params.id_product + `' `;
  }
  db.query(`SELECT * FROM (
    select pv.voucher_no,ah.name,DATE_FORMAT(pv.date ,'%d/%m/%Y') as date,i.name as product,pvi.quantity,round(pvi.unit_price,2) as unit_price,round((pvi.total),2) as total from z_sales_voucher pv,z_sales_voucher_item pvi,account_head ah,product i where pvi.id_sales_voucher=pv.id_sales_voucher and ah.id_account_head=pv.id_account_head and pvi.id_product=i.id_product and date between `+req.params.from+` and `+req.params.to+` ${supplier} ${product} ) tbl`, function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })
 
  });
  router.get('/supplier', function(req, res, next) {

    db.query('select * from account_head where id_ledger_group=2', function (err, rows, fields) {
      if (err) throw err
  
       res.send(rows); 
    })
  
  });





module.exports = router;