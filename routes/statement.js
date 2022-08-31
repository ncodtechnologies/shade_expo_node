var express = require("express");
var router = express.Router();
var Constants = require("./constant.json");

router.get("/totalPurchase/:from/:to", function (req, res, next) {
  db.query(
    `select sum(pvi.total) as totalPurchase from z_purchase_voucher pv,z_purchase_voucher_item pvi where pvi.id_purchase_voucher=pv.id_purchase_voucher and date between ${req.params.from} and ${req.params.to}`,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/totalLocalSales/:from/:to", function (req, res, next) {
  db.query(
    `select sum(pvi.total) as totalLocalSales from z_sales_voucher pv,z_sales_voucher_item pvi where pvi.id_sales_voucher=pv.id_sales_voucher and date between ${req.params.from} and ${req.params.to}`,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/totalSales/:from/:to", function (req, res, next) {
  db.query(
    `SELECT sum(sales) as totalSales from (
      SELECT i.invoice_no , ROUND((sum(ii.total))*i.conversion_rate-i.discount,2) as sales from invoice i, invoice_items ii where i.id_invoice = ii.id_invoice and date between ${req.params.from} and ${req.params.to} group by i.id_invoice 
      ) tbl`,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/totalInvoiceDiscount/:from/:to", function (req, res, next) {
  db.query(
    `
      SELECT sum(ROUND(i.discount,2)) as discount from invoice i where date between ${req.params.from} and ${req.params.to} 
     `,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/totalDiscountIncome/:from/:to", function (req, res, next) {
  db.query(
    `
    SELECT sum(discount) as discount from account_voucher av where  type='Payment' and date between ${req.params.from} and ${req.params.to}
     `,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/otherIncome/:from/:to", function (req, res, next) {
  db.query(
    `
    SELECT sum(amount) as other_income from account_voucher av, account_head ah WHERE av.id_ledger_from=ah.id_account_head and ah.id_ledger_group=${Constants.OTHER_INCOME} and type='Receipt' and date between ${req.params.from} and ${req.params.to}
     `,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/totalDiscountExpense/:from/:to", function (req, res, next) {
  db.query(
    `
    SELECT sum(discount) as discount from account_voucher av where  type='Receipt' and date between ${req.params.from} and ${req.params.to}
     `,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/expenses/:from/:to", function (req, res, next) {
  db.query(
    `SELECT id_ledger_group, name, sum(amount) as amount from (
        SELECT lg.id_ledger_group, lg.name, sum(amount) as amount from account_voucher av, account_head ah, ledger_group lg where ah.id_ledger_group = lg.id_ledger_group and id_ledger_to = ah.id_account_head and lg.id_ledger_group  in (10,11) and date between ${req.params.from} and ${req.params.to} group by lg.id_ledger_group 
        UNION 
        SELECT lg.id_ledger_group, lg.name, sum(amount) as amount from z_account_voucher av, account_head ah, ledger_group lg where ah.id_ledger_group = lg.id_ledger_group and  av.id_ledger = ah.id_account_head and lg.id_ledger_group  in (10,11) and date between ${req.params.from} and ${req.params.to}  group by lg.id_ledger_group 
        ) tbl GROUP by id_ledger_group `,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/income/:from/:to", function (req, res, next) {
  db.query(
    `SELECT id_ledger_group, name, sum(amount) as amount from (
        SELECT lg.id_ledger_group, lg.name, sum(amount) as amount from account_voucher av, account_head ah, ledger_group lg where ah.id_ledger_group = lg.id_ledger_group and id_ledger_from = ah.id_account_head and lg.id_ledger_group  in (10,001) and date between ${req.params.from} and ${req.params.to} group by lg.id_ledger_group 
        UNION 
        SELECT lg.id_ledger_group, lg.name, sum(amount) as amount from z_account_voucher av, account_head ah, ledger_group lg where ah.id_ledger_group = lg.id_ledger_group and  av.id_ledger = ah.id_account_head and lg.id_ledger_group  in (10,001) and date between ${req.params.from} and ${req.params.to}  group by lg.id_ledger_group 
        ) tbl GROUP by id_ledger_group `,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/payroll/:from/:to", function (req, res, next) {
  db.query(
    `SELECT SUM(amount) as amount from ( 
                    SELECT SUM(amount) as amount from payroll p where id_invoice=0 and date between ${req.params.from} and ${req.params.to}
                    union
                    SELECT SUM(amount) as amount from z_payroll where date between ${req.params.from} and ${req.params.to}
                )tbl`,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/invoicePackingExp/:from/:to", function (req, res, next) {
  db.query(
    `select sum(amount) as amount from 
    (select sum(amount) as amount, i.id_invoice from  payroll p, account_head a, invoice i where p.id_account_head=a.id_account_head and i.id_invoice=p.id_invoice and i.date between ${req.params.from} and ${req.params.to}
    union
    select sum(ipi.qty*p.selling_price) as amount, i.id_invoice from  invoice_packing_item ipi, product p, invoice i where p.id_product=ipi.id_product and i.id_invoice=ipi.id_invoice and i.date between ${req.params.from} and ${req.params.to} ) tbl`,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/invoiceFreightExp/:from/:to", function (req, res, next) {
  db.query(
    `select sum(amount) as amount from  invoice_freight_expense ife , invoice i where ife.id_invoice = i.id_invoice and i.date between ${req.params.from} and ${req.params.to}`,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/invoiceOtherExp/:from/:to", function (req, res, next) {
  db.query(
    `select sum(amount) as amount from account_voucher av , invoice i where av.id_invoice = i.id_invoice and i.date between ${req.params.from} and ${req.params.to}`,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

//Detailed

router.get("/totalPurchaseDt/:from/:to", function (req, res, next) {
  db.query(
    `select DATE_FORMAT(date ,'%d/%m/%Y') as date, sum(pvi.total) as purchase from z_purchase_voucher pv,z_purchase_voucher_item pvi where pvi.id_purchase_voucher=pv.id_purchase_voucher and date between ${req.params.from} and ${req.params.to} group by date`,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/totalLocalSalesDt/:from/:to", function (req, res, next) {
  db.query(
    `select DATE_FORMAT(date ,'%d/%m/%Y') as date, sum(pvi.total) as sales from z_sales_voucher pv,z_sales_voucher_item pvi where pvi.id_sales_voucher=pv.id_sales_voucher and date between ${req.params.from} and ${req.params.to} group by date`,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/totalSalesDt/:from/:to", function (req, res, next) {
  db.query(
    `SELECT DATE_FORMAT(date ,'%d/%m/%Y') as date, ROUND((sum(ii.total))*i.conversion_rate-i.discount,2) as sales from invoice i, invoice_items ii where i.id_invoice = ii.id_invoice and date between ${req.params.from} and ${req.params.to} group by date`,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/expensesDt/:from/:to", function (req, res, next) {
  db.query(
    `SELECT DATE_FORMAT(date ,'%d/%m/%Y') as date, name, sum(amount) as amount, date as _date from (
        SELECT date, lg.id_ledger_group, lg.name, sum(amount) as amount from account_voucher av, account_head ah, ledger_group lg where ah.id_ledger_group = lg.id_ledger_group and id_ledger_to = ah.id_account_head and lg.id_ledger_group  in (10,11) and date between ${req.params.from} and ${req.params.to} group by lg.id_ledger_group, date 
        UNION 
        SELECT date, lg.id_ledger_group, lg.name, sum(amount) as amount from z_account_voucher av, account_head ah, ledger_group lg where ah.id_ledger_group = lg.id_ledger_group and  av.id_ledger = ah.id_account_head and lg.id_ledger_group  in (10,11) and date between ${req.params.from} and ${req.params.to}  group by lg.id_ledger_group, date 
        ) tbl GROUP by id_ledger_group, _date order by id_ledger_group, _date `,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/incomeDt/:from/:to", function (req, res, next) {
  db.query(
    `SELECT DATE_FORMAT(date ,'%d/%m/%Y') as date, name, sum(amount) as amount from (
        SELECT date, lg.id_ledger_group, lg.name, sum(amount) as amount from account_voucher av, account_head ah, ledger_group lg where ah.id_ledger_group = lg.id_ledger_group and id_ledger_from = ah.id_account_head and lg.id_ledger_group  in (10,001) and date between ${req.params.from} and ${req.params.to} group by lg.id_ledger_group , date 
        UNION 
        SELECT date, lg.id_ledger_group, lg.name, sum(amount) as amount from z_account_voucher av, account_head ah, ledger_group lg where ah.id_ledger_group = lg.id_ledger_group and  av.id_ledger = ah.id_account_head and lg.id_ledger_group  in (10,001) and date between ${req.params.from} and ${req.params.to}  group by lg.id_ledger_group , date 
        ) tbl GROUP by id_ledger_group, date order by id_ledger_group, date  `,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/payrollDt/:from/:to", function (req, res, next) {
  db.query(
    `SELECT DATE_FORMAT(date ,'%d/%m/%Y') as date, SUM(amount) as amount from ( 
                    SELECT date, SUM(amount) as amount from payroll p where id_invoice=0 and date between ${req.params.from} and ${req.params.to}  group by date
                    union
                    SELECT date, SUM(amount) as amount from z_payroll where date between ${req.params.from} and ${req.params.to} group by date
                )tbl group by date order by date`,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/invoicePackingExpDt/:from/:to", function (req, res, next) {
  db.query(
    `select invoice_no, sum(amount) as amount from 
    (select sum(amount) as amount, i.id_invoice, invoice_no from  payroll p, account_head a, invoice i where p.id_account_head=a.id_account_head and i.id_invoice=p.id_invoice and i.date between ${req.params.from} and ${req.params.to} GROUP by i.id_invoice 
    union
    select sum(ipi.qty*p.selling_price) as amount, i.id_invoice, invoice_no from  invoice_packing_item ipi, product p, invoice i where p.id_product=ipi.id_product and i.id_invoice=ipi.id_invoice and i.date between ${req.params.from} and ${req.params.to}  GROUP by i.id_invoice 
    ) tbl GROUP by id_invoice `,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/invoiceFreightExpDt/:from/:to", function (req, res, next) {
  db.query(
    `select invoice_no, sum(amount) as amount from  invoice_freight_expense ife , invoice i where ife.id_invoice = i.id_invoice and i.date between ${req.params.from} and ${req.params.to} GROUP by i.id_invoice `,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/invoiceOtherExpDt/:from/:to", function (req, res, next) {
  db.query(
    `select invoice_no, sum(amount) as amount from account_voucher av , invoice i where av.id_invoice = i.id_invoice and i.date between ${req.params.from} and ${req.params.to} GROUP by i.id_invoice `,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

////////////////////////////////////////////
///BALANCE SHEET////////////////////////////
////////////////////////////////////////////

router.get("/sundryCreditor/:id_ledger_group/:date", function (req, res, next) {
  const date = req.params.date;
  var condition = ` and _lg.id_ledger_group=${req.params.id_ledger_group}`;
  if (req.params.id_ledger_group == "0") condition = "";

  var qry =
    `    
  
    select ledger_group as account_head, ledger_group, sum(closing_balance) as closing_balance from (
    SELECT tbl.paid,account_head, tbl.received,_tbl.ledger_group,opening_balance, ((_tbl.opening_balance+IFNULL(received,0)-IFNULL(paid,0))) AS closing_balance  FROM 
    (
        SELECT tbl_paid.id_ledger, (tbl_paid.paid) AS paid, (tbl_received.received) AS received, tbl_paid.id_ledger AS id_account_head FROM
        (
      SELECT id_ledger, SUM(paid) AS paid FROM (
          SELECT id_ledger_to AS id_ledger, SUM(amount) AS paid FROM account_voucher av WHERE amount>0 and date<=${date} GROUP BY id_ledger_to
          UNION
          SELECT id_ledger, SUM(amount) AS paid FROM z_account_voucher av WHERE TYPE='Payment' AND amount>0 and date<=${date} GROUP BY id_ledger
          UNION
          SELECT id_account_head AS id_ledger, SUM(gross) AS paid FROM z_sales_voucher where date<=${date} GROUP BY id_ledger
          UNION
          SELECT id_account_head AS id_ledger, SUM(payable+discount) AS paid FROM z_purchase_voucher where date<=${date} GROUP BY id_ledger
          UNION
          SELECT i.consignee AS id_ledger, sum(total) AS paid FROM  invoice i, invoice_items ii WHERE i.id_invoice = ii.id_invoice and date<=${date} GROUP BY i.consignee
     ) tbl1 GROUP BY id_ledger
  ) tbl_paid
        LEFT JOIN 
        (
  SELECT id_ledger, SUM(received) AS received FROM (
      SELECT id_ledger_from AS id_ledger, SUM(amount) AS received FROM account_voucher av WHERE amount>0 and date<=${date} GROUP BY id_ledger_from
      UNION
      SELECT id_ledger, SUM(amount) AS received FROM z_account_voucher av WHERE TYPE='Receipt' AND amount>0 and date<=${date} GROUP BY id_ledger
      UNION
      SELECT id_account_head AS id_ledger, SUM(gross) AS received FROM z_purchase_voucher where date<=${date} GROUP BY id_ledger
      UNION
      SELECT id_account_head AS id_ledger, SUM(amount) AS received FROM z_payroll where date<=${date} GROUP BY id_ledger 
      UNION 
      SELECT id_account_head as id_ledger, SUM(amount) as received from payroll where date<=${date} group by id_ledger
      UNION
      SELECT i.consignee AS id_ledger, SUM(discount) AS received FROM  invoice i WHERE discount>0 and date<=${date} GROUP BY i.consignee
      ) tbl2 GROUP BY id_ledger
  ) tbl_received 
        ON tbl_paid.id_ledger=tbl_received.id_ledger
  
        UNION
  
        SELECT tbl_received.id_ledger, (tbl_paid.paid) AS paid, (tbl_received.received) AS received, tbl_paid.id_ledger AS id_account_head FROM
        (
      SELECT id_ledger, SUM(paid) AS paid FROM (
          SELECT id_ledger_to AS id_ledger, SUM(amount) AS paid FROM account_voucher av WHERE amount>0 and date<=${date} GROUP BY id_ledger_to
          UNION
          SELECT id_ledger, SUM(amount) AS paid FROM z_account_voucher av WHERE TYPE='Payment' AND amount>0 and date<=${date} GROUP BY id_ledger
          UNION
          SELECT id_account_head AS id_ledger, SUM(gross) AS paid FROM z_sales_voucher where date<=${date} GROUP BY id_ledger
          UNION
          SELECT id_account_head AS id_ledger, SUM(payable+discount) AS paid FROM z_purchase_voucher where date<=${date} GROUP BY id_ledger
          UNION
          SELECT i.consignee AS id_ledger, sum(total) AS paid FROM  invoice i, invoice_items ii WHERE i.id_invoice = ii.id_invoice and date<=${date} GROUP BY i.consignee
     ) tbl1 GROUP BY id_ledger
  ) tbl_paid
        RIGHT JOIN 
        (
  SELECT id_ledger, SUM(received) AS received FROM (
      SELECT id_ledger_from AS id_ledger, SUM(amount) AS received FROM account_voucher av WHERE amount>0 and date<=${date} GROUP BY id_ledger_from
      UNION
      SELECT id_ledger, SUM(amount) AS received FROM z_account_voucher av WHERE TYPE='Receipt' AND amount>0 and date<=${date} GROUP BY id_ledger
      UNION
      SELECT id_account_head AS id_ledger, SUM(gross) AS received FROM z_purchase_voucher where date<=${date} GROUP BY id_ledger
      UNION
      SELECT id_account_head AS id_ledger, SUM(amount) AS received FROM z_payroll where date<=${date} GROUP BY id_ledger 
      UNION 
      SELECT id_account_head as id_ledger, SUM(amount) as received from payroll where date<=${date} group by id_ledger
      UNION
      SELECT i.consignee AS id_ledger, SUM(discount) AS received FROM  invoice i WHERE discount>0 and date<=${date} GROUP BY i.consignee
      ) tbl2 GROUP BY id_ledger
  ) tbl_received 
        ON tbl_received.id_ledger=tbl_paid.id_ledger
    ) tbl
  
    
    RIGHT JOIN
    (
     SELECT _ah.name AS account_head,_ah.id_ledger_group, _lg.name AS ledger_group, id_account_head,opening_balance FROM z_account_head _ah, ledger_group _lg WHERE _lg.id_ledger_group=_ah.id_ledger_group and _lg.id_ledger_group not in ` +
    Constants.NONBALANCE +
    condition +
    `
  ) _tbl
  ON tbl.id_ledger=_tbl.id_account_head where  (_tbl.opening_balance+IFNULL(received,0)-IFNULL(paid,0))>0 
  ) tblMain group by ledger_group
  `;
  db.query(qry, function (err, rows, fields) {
    if (err) throw err;

    res.send(rows);
  });
});

router.get("/sundryDebtor/:id_ledger_group/:date", function (req, res, next) {
  const date = req.params.date;
  var condition = ` and _lg.id_ledger_group=${req.params.id_ledger_group}`;
  if (req.params.id_ledger_group == "0") condition = "";

  var qry =
    `  
    select ledger_group as account_head, ledger_group, sum(closing_balance) as closing_balance from (
    SELECT tbl.paid,account_head, tbl.received,_tbl.ledger_group,opening_balance, ((_tbl.opening_balance+IFNULL(received,0)-IFNULL(paid,0))) AS closing_balance  FROM 
    (
        SELECT tbl_paid.id_ledger, (tbl_paid.paid) AS paid, (tbl_received.received) AS received, tbl_paid.id_ledger AS id_account_head FROM
        (
      SELECT id_ledger, SUM(paid) AS paid FROM (
          SELECT id_ledger_to AS id_ledger, SUM(amount) AS paid FROM account_voucher av WHERE amount>0 and date<=${date} GROUP BY id_ledger_to
          UNION
          SELECT id_ledger, SUM(amount) AS paid FROM z_account_voucher av WHERE TYPE='Payment' AND amount>0 and date<=${date} GROUP BY id_ledger
          UNION
          SELECT id_account_head AS id_ledger, SUM(gross) AS paid FROM z_sales_voucher where date<=${date} GROUP BY id_ledger
          UNION
          SELECT id_account_head AS id_ledger, SUM(payable+discount) AS paid FROM z_purchase_voucher where date<=${date} GROUP BY id_ledger
          UNION
          SELECT i.consignee AS id_ledger, sum(total) AS paid FROM  invoice i, invoice_items ii WHERE i.id_invoice = ii.id_invoice and date<=${date} GROUP BY i.consignee
     ) tbl1 GROUP BY id_ledger
  ) tbl_paid
        LEFT JOIN 
        (
  SELECT id_ledger, SUM(received) AS received FROM (
      SELECT id_ledger_from AS id_ledger, SUM(amount) AS received FROM account_voucher av WHERE amount>0 and date<=${date} GROUP BY id_ledger_from
      UNION
      SELECT id_ledger, SUM(amount) AS received FROM z_account_voucher av WHERE TYPE='Receipt' AND amount>0 and date<=${date} GROUP BY id_ledger
      UNION
      SELECT id_account_head AS id_ledger, SUM(gross) AS received FROM z_purchase_voucher where date<=${date} GROUP BY id_ledger
      UNION
      SELECT id_account_head AS id_ledger, SUM(amount) AS received FROM z_payroll where date<=${date} GROUP BY id_ledger 
      UNION 
      SELECT id_account_head as id_ledger, SUM(amount) as received from payroll where date<=${date} group by id_ledger
      UNION
      SELECT i.consignee AS id_ledger, SUM(discount) AS received FROM  invoice i WHERE discount>0 and date<=${date} GROUP BY i.consignee
      ) tbl2 GROUP BY id_ledger
  ) tbl_received 
        ON tbl_paid.id_ledger=tbl_received.id_ledger
  
        UNION
  
        SELECT tbl_received.id_ledger, (tbl_paid.paid) AS paid, (tbl_received.received) AS received, tbl_paid.id_ledger AS id_account_head FROM
        (
      SELECT id_ledger, SUM(paid) AS paid FROM (
          SELECT id_ledger_to AS id_ledger, SUM(amount) AS paid FROM account_voucher av WHERE amount>0 and date<=${date} GROUP BY id_ledger_to
          UNION
          SELECT id_ledger, SUM(amount) AS paid FROM z_account_voucher av WHERE TYPE='Payment' AND amount>0 and date<=${date} GROUP BY id_ledger
          UNION
          SELECT id_account_head AS id_ledger, SUM(gross) AS paid FROM z_sales_voucher where date<=${date} GROUP BY id_ledger
          UNION
          SELECT id_account_head AS id_ledger, SUM(payable+discount) AS paid FROM z_purchase_voucher where date<=${date} GROUP BY id_ledger
          UNION
          SELECT i.consignee AS id_ledger, sum(total) AS paid FROM  invoice i, invoice_items ii WHERE i.id_invoice = ii.id_invoice and date<=${date} GROUP BY i.consignee
     ) tbl1 GROUP BY id_ledger
  ) tbl_paid
        RIGHT JOIN 
        (
  SELECT id_ledger, SUM(received) AS received FROM (
      SELECT id_ledger_from AS id_ledger, SUM(amount) AS received FROM account_voucher av WHERE amount>0 and date<=${date} GROUP BY id_ledger_from
      UNION
      SELECT id_ledger, SUM(amount) AS received FROM z_account_voucher av WHERE TYPE='Receipt' AND amount>0 and date<=${date} GROUP BY id_ledger
      UNION
      SELECT id_account_head AS id_ledger, SUM(gross) AS received FROM z_purchase_voucher where date<=${date} GROUP BY id_ledger
      UNION
      SELECT id_account_head AS id_ledger, SUM(amount) AS received FROM z_payroll where date<=${date} GROUP BY id_ledger 
      UNION 
      SELECT id_account_head as id_ledger, SUM(amount) as received from payroll where date<=${date} group by id_ledger
      UNION
      SELECT i.consignee AS id_ledger, SUM(discount) AS received FROM  invoice i WHERE discount>0 and date<=${date} GROUP BY i.consignee
      ) tbl2 GROUP BY id_ledger
  ) tbl_received 
        ON tbl_received.id_ledger=tbl_paid.id_ledger
    ) tbl
  
  
            RIGHT JOIN
            (
             SELECT _ah.name AS account_head,_ah.id_ledger_group, _lg.name AS ledger_group, id_account_head,opening_balance FROM z_account_head _ah, ledger_group _lg WHERE _lg.id_ledger_group=_ah.id_ledger_group and _lg.id_ledger_group not in ` +
    Constants.NONBALANCE +
    condition +
    `
  ) _tbl
  ON tbl.id_ledger=_tbl.id_account_head where  (_tbl.opening_balance+IFNULL(received,0)-IFNULL(paid,0))<0 
  ) tblMain group by ledger_group
  `;
  db.query(qry, function (err, rows, fields) {
    if (err) throw err;

    res.send(rows);
  });
});

router.get("/cashBal/:to_date/:id_ledger", function (req, res, next) {
  console.log(req.params);

  var id_account_head = req.params.id_ledger;
  var from_date = req.params.to_date;

  db.query(
    `SELECT ROUND(SUM(debit)-SUM(credit)) AS balance FROM ( 
        SELECT '3' AS slno, '0' as id, -1*opening_balance as debit, '0' AS credit from account_head where id_account_head=${id_account_head}
        UNION
        SELECT '1' AS slno, id_account_voucher AS id, CAST(amount AS CHAR) AS debit, '0' AS credit 			FROM account_voucher av, account_head ah WHERE av.id_ledger_to=ah.id_account_head AND amount>0 AND date<${from_date} and id_ledger_to=${id_account_head} 
        UNION 
        SELECT '2' AS slno, id_account_voucher AS id, '0' AS debit,			 CAST(amount AS CHAR) AS credit FROM account_voucher av, account_head ah WHERE av.id_ledger_from=ah.id_account_head AND amount>0 AND date<${from_date} and id_ledger_from=${id_account_head} 
    )tbl`,
    function (err, rows, fields) {
      if (err) throw err;
      res.send(rows);
    }
  );
});

router.get("/stockReport/:type", function (req, res, next) {
  let type = req.params.type;
  db.query(
    ` 
    SELECT ROUND(SUM(stock*rate),2) as stock FROM 
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
  
  
    `,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

module.exports = router;
