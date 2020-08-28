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
  SELECT p.name AS product, purchased, sold, stock, rate, tbl_main.unit FROM 
  (
    SELECT ifnull(round(purchased,2),0) as purchased,ifnull(round(sold,2),0) as sold,ifnull(round(purchased,2),0)-ifnull(round(sold,2),0) as stock, _tbl.rate, tbl.unit, tbl.id_category FROM
    (
        SELECT sum(sold) as sold, unit, id_category from
        (
            SELECT id_sales_voucher_item as id,unit,sum(quantity) as sold, id_category FROM z_sales_voucher sv, z_sales_voucher_item svi,  product i WHERE sv.id_sales_voucher=svi.id_sales_voucher and i.type=${type} and svi.id_product=i.id_product  GROUP By date,id_category
            UNION
            SELECT id_packing_item as id, unit,sum(ipi.qty) as sold, id_category FROM invoice_packing_item ipi, product i WHERE ipi.id_product=i.id_product  GROUP By date,i.id_category
            UNION
            SELECT id_stock as id, unit,sum(st.quantity) as sold, id_category               FROM z_stock st,                                            product i WHERE st.id_product=i.id_product and i.type=${type}  and st.type=1 GROUP By date,i.id_category
            UNION
            SELECT id_invoice_items AS id, unit, SUM(kg) AS sold, id_category FROM invoice inv, invoice_items inv_i, product i WHERE inv.id_invoice=inv_i.id_invoice AND inv_i.id_product=i.id_product and i.type=${type}  GROUP By date,i.id_category
        ) __tbl1  GROUP By id_category
    ) tbl
    left JOIN
    (
        SELECT unit, sum(round(purchased,2)) as purchased, round(avg(rate)) as rate, id_category from
        (
      SELECT id, purchased, rate, unit, id_category FROM (
                SELECT  id_purchase_voucher_item as id, unit,date,sum(quantity) as purchased, unit_price as rate, id_category FROM z_purchase_voucher pv, z_purchase_voucher_item pvi, product i where pvi.id_product=i.id_product and pv.id_purchase_voucher=pvi.id_purchase_voucher and i.type=${type}  GROUP BY date,id_category
                UNION
                SELECT id_stock as id,unit,date, sum(st.quantity) as purchased, rate, id_category FROM z_stock st, product i WHERE st.id_product=i.id_product and st.type=0 and i.type=${type}  GROUP By date,i.id_category
            ) tbl3 ORDER BY DATE DESC LIMIT 18446744073709551615
        ) __tbl2 GROUP BY id_category
    ) _tbl
    ON 
    (tbl.id_category=_tbl.id_category) 
    
    UNION

  SELECT ifnull(round(purchased,2),0) as purchased,ifnull(round(sold,2),0) as sold,ifnull(round(purchased,2),0)-ifnull(round(sold,2),0) as stock, _tbl.rate, _tbl.unit, _tbl.id_category FROM
    (
      SELECT sum(sold) as sold, unit, id_category from
      (
          SELECT id_sales_voucher_item as id,unit, sum(quantity) as sold, id_category FROM z_sales_voucher sv, z_sales_voucher_item svi,  product i WHERE sv.id_sales_voucher=svi.id_sales_voucher  and svi.id_product=i.id_product and i.type=${type}  GROUP By date,id_category
          UNION
          SELECT id_packing_item as id, unit,sum(ipi.qty) as sold, id_category FROM invoice_packing_item ipi, product i WHERE ipi.id_product=i.id_product  GROUP By date,i.id_category
          UNION
          SELECT id_stock as id,unit, sum(st.quantity) as sold, id_category               FROM z_stock st,                                            product i WHERE st.id_product=i.id_product and st.type=1 and i.type=${type}   GROUP By date,i.id_category
          UNION
          SELECT id_invoice_items AS id, unit, SUM(kg) AS sold, id_category FROM invoice inv, invoice_items inv_i, product i WHERE inv.id_invoice=inv_i.id_invoice AND inv_i.id_product=i.id_product and i.type=${type}   GROUP By date,i.id_category
      ) __tbl1  GROUP By id_category
  ) tbl
  right JOIN
  (
      SELECT sum(round(purchased,2)) as purchased,  round(avg(rate)) as rate, unit, id_category from
      (
    SELECT id, purchased, rate, unit, id_category FROM (
              SELECT  id_purchase_voucher_item as id,unit, date, sum(quantity) as purchased, unit_price as rate, id_category FROM z_purchase_voucher pv, z_purchase_voucher_item pvi,  product i where pv.id_purchase_voucher=pvi.id_purchase_voucher  and pvi.id_product=i.id_product  and i.type=${type}  GROUP BY date,id_category
              UNION
              SELECT id_stock as id,unit, date, sum(st.quantity) as purchased, rate, id_category FROM z_stock st, product i WHERE st.id_product=i.id_category and st.id_product=i.id_product and st.type=0  and i.type=${type}  GROUP By date,i.id_category
          ) tbl3 ORDER BY DATE DESC LIMIT 18446744073709551615
       ) __tbl2 GROUP BY id_category
  ) _tbl
  ON 
  (tbl.id_category=_tbl.id_category) 
) tbl_main , product p WHERE tbl_main.id_category=p.id_product and tbl_main.stock>0


  `, function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});


module.exports = router;