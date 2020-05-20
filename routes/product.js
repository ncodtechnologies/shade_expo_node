var express = require('express');
var router = express.Router();

router.get('/product', function(req, res, next) {

  db.query('select * from product', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});

router.get('/stockReport/:type', function(req, res, next) {
 
  let type       = req.params.type;

  db.query(`
  SELECT tbl.id_product,tbl.product,ifnull(round(purchased,2),0) as purchased,ifnull(round(sold,2),0) as sold,ifnull(round(purchased,2),0)-ifnull(round(sold,2),0) as stock, _tbl.rate, tbl.unit FROM  (SELECT id_product,product, sum(sold) as sold, unit from
        ( 
          SELECT id_sales_voucher_item as id,i.id_product,i.name as product,unit,sum(quantity) as sold FROM z_sales_voucher sv, z_sales_voucher_item svi, product i WHERE sv.id_sales_voucher=svi.id_sales_voucher and i.type= ${type}  and svi.id_product=i.id_product GROUP By date,id_product
          UNION          
          SELECT id_stock as id, i.id_product,i.name as product,unit,sum(st.quantity) as sold               FROM z_stock st,                                   product i WHERE st.id_product=i.id_product and st.type=1  and i.type= ${type} GROUP By date,i.id_product          
          UNION          
          SELECT id_invoice_items AS id, i.id_product, i.name AS product, unit, SUM(kg) AS sold FROM invoice inv, invoice_items inv_i, product i WHERE inv.id_invoice=inv_i.id_invoice AND inv_i.id_product=i.id_product and i.type= ${type} GROUP By date,i.id_product      
        ) __tbl1  GROUP By id_product  
    ) tbl  
    left JOIN 
        (      
          SELECT id_product,unit, sum(round(purchased,2)) as purchased, round(avg(rate)) as rate from      
          (    
            SELECT id,id_product, purchased, rate, unit FROM 
            (              
              SELECT  id_purchase_voucher_item as id, unit,date,i.id_product,sum(quantity) as purchased, unit_price as rate FROM z_purchase_voucher pv, z_purchase_voucher_item pvi, product i where pvi.id_product=i.id_product and pv.id_purchase_voucher=pvi.id_purchase_voucher and i.type= ${type} GROUP BY date,id_product             
              UNION              
              SELECT id_stock as id,unit,date, i.id_product,sum(st.quantity) as purchased, rate FROM z_stock st, product i WHERE st.id_product=i.id_product and st.type=0 and i.type= ${type} GROUP By date,i.id_product          
            ) tbl3 ORDER BY DATE DESC LIMIT 18446744073709551615       
          ) __tbl2 GROUP BY id_product  
        ) _tbl  ON   (tbl.id_product=_tbl.id_product)   
    UNION 
    SELECT _tbl.id_product,_tbl.product,ifnull(round(purchased,2),0) as purchased,ifnull(round(sold,2),0) as sold,ifnull(round(purchased,2),0)-ifnull(round(sold,2),0) as stock, _tbl.rate, _tbl.unit FROM  
    (      
      SELECT id_product,product, sum(sold) as sold, unit from      
      (          
        SELECT id_sales_voucher_item as id,unit,i.id_product,i.name as product,sum(quantity) as sold FROM z_sales_voucher sv, z_sales_voucher_item svi,  product i WHERE sv.id_sales_voucher=svi.id_sales_voucher and i.type= ${type} and svi.id_product=i.id_product GROUP By date,id_product          
        UNION          
        SELECT id_stock as id,unit, i.id_product,i.name as product,sum(st.quantity) as sold               FROM z_stock st,                                            product i WHERE st.id_product=i.id_product and st.type=1  and i.type= ${type} GROUP By date,i.id_product          
        UNION          
        SELECT id_invoice_items AS id, unit, i.id_product, i.name AS product, SUM(kg) AS sold FROM invoice inv, invoice_items inv_i, product i WHERE inv.id_invoice=inv_i.id_invoice AND inv_i.id_product=i.id_product and i.type= ${type} GROUP By date,i.id_product      
      ) __tbl1  GROUP By id_product  
    ) tbl  
    right JOIN  
    (      
      SELECT id_product, product, sum(round(purchased,2)) as purchased,  round(avg(rate)) as rate, unit from      
      (    
        SELECT id,id_product, product, purchased, rate, unit FROM 
        (              
          SELECT  id_purchase_voucher_item as id,unit, date, i.id_product,i.name as product,sum(quantity) as purchased, unit_price as rate FROM z_purchase_voucher pv, z_purchase_voucher_item pvi,  product i where pv.id_purchase_voucher=pvi.id_purchase_voucher  and pvi.id_product=i.id_product and i.type= ${type} GROUP BY date,id_product              
          UNION              
          SELECT id_stock as id,unit, date, i.id_product,i.name as product,sum(st.quantity) as purchased, rate FROM z_stock st, product i WHERE st.id_product=i.id_product and st.id_product=i.id_product and st.type=0 and i.type= ${type} GROUP By date,i.id_product    
        ) tbl3 ORDER BY DATE DESC LIMIT 18446744073709551615       
      ) __tbl2 GROUP BY id_product  
    ) _tbl  ON  (tbl.id_product=_tbl.id_product) 
  `, function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});


module.exports = router;