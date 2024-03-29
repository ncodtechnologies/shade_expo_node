var express = require("express");
var router = express.Router();
var Constants = require("./constant.json");

router.post("/ledgerCreate", function (req, res, next) {
  console.log(req.body);

  let code = req.body.code ? req.body.code : "";
  let name = req.body.name ? req.body.name : "";
  let title = req.body.title ? req.body.title : "";
  let id = req.body.id ? req.body.id : "";
  let op = req.body.op ? req.body.op : "";
  let address = req.body.address ? req.body.address : "";
  let phone = req.body.phone ? req.body.phone : "";

  if (req.body.id_account_head == "0") {
    db.query(
      `select max(id_account_head)+1 as id_account_head FROM account_head where id_account_head>=${Constants.SERVER_LEDGER_LIMIT}`,
      function (err, rows, fields) {
        if (err) throw err;

        var id_account_head =
          rows[0].id_account_head != null
            ? rows[0].id_account_head
            : Constants.SERVER_LEDGER_LIMIT;
        var qry = `insert into account_head (id_account_head, code ,name,title,id_ledger_group,opening_balance,address,phone,modified_by,modified_date) values('${id_account_head}','${code}','${name}','${title}',${id}, '${op}', '${address}', '${phone}','ADMIN',NOW())`;

        db.query(qry, function (err, result) {
          if (err) throw err;

          res.send(result);
        });
      }
    );
  } else {
    var qry =
      `update account_head set code='${code}' ,name='${name}',title='${title}',id_ledger_group = ${id},opening_balance = '${op}',address ='${address}',phone ='${phone}',modified_by ='ADMIN',modified_date=NOW() where id_account_head=` +
      req.body.id_account_head +
      ``;

    db.query(qry, function (err, result) {
      if (err) throw err;

      res.send(result);
    });
  }
});

router.post("/ledgerGroup", function (req, res, next) {
  let ledger = req.body.ledger;

  db.query(
    `select max(id_ledger_group)+1 as id_ledger_group FROM ledger_group where id_ledger_group>=${Constants.SERVER_LEDGER_LIMIT}`,
    function (err, rows, fields) {
      if (err) throw err;

      var id_ledger_group =
        rows[0].id_ledger_group != null
          ? rows[0].id_ledger_group
          : Constants.SERVER_LEDGER_LIMIT;
      db.query(
        `insert into ledger_group (id_ledger_group, name) values('${id_ledger_group}','${ledger}')`
      );
    }
  );
});

router.get("/ledgerGroup", function (req, res, next) {
  db.query("select * from ledger_group ", function (err, rows, fields) {
    if (err) throw err;

    res.send(rows);
  });
});
router.get("/ledger", function (req, res, next) {
  db.query(
    "select *, a.name as account_head from account_head a, ledger_group l where a.id_ledger_group=l.id_ledger_group order by a.name",
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/ledger/:id_ledger_group/:activePage", function (req, res, next) {
  let numOfItems = (req.params.activePage - 1) * 10;
  let qry = "";
  if (req.params.id_ledger_group != "0") {
    var ids = req.params.id_ledger_group.split(",");
    qry = ` and l.id_ledger_group in (${ids.join(",")})`;
    if (ids[0] < 0)
      qry = ` and l.id_ledger_group!=${-1 * req.params.id_ledger_group}`;

    console.log(qry);
  }
  qry1 =
    `select count(*) as totalCount from account_head a, ledger_group l where a.id_ledger_group=l.id_ledger_group ` +
    qry +
    ``;
  qry2 =
    `select *, a.name as account_head from account_head a, ledger_group l where a.id_ledger_group=l.id_ledger_group ` +
    qry +
    `  order by a.name limit ${numOfItems},10 `;
  db.query(qry1, function (err, rows, fields) {
    if (err) throw err;

    db.query(qry2, function (err, rows_, fields) {
      if (err) throw err;

      data = {};
      const items = [];
      data.totalCount = rows[0].totalCount;
      data.items = rows_;

      res.send(data);
      console.log(data);
    });
  });
});

router.get("/ledger/:id_ledger_group", function (req, res, next) {
  let qry = "";
  if (req.params.id_ledger_group != "") {
    var ids = req.params.id_ledger_group.split(",");
    qry = ` and l.id_ledger_group in (${ids.join(",")})`;
    if (ids[0] < 0)
      qry = ` and l.id_ledger_group!=${-1 * req.params.id_ledger_group}`;

    console.log(qry);
  }

  db.query(
    `select *, a.name as account_head from account_head a, ledger_group l where a.id_ledger_group=l.id_ledger_group ` +
      qry +
      `  order by a.name `,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/ledgerEdit/:id_ledger", function (req, res, next) {
  //TODO: Check all tables for id_ledger

  db.query(
    "select *, a.name as account_head  from account_head a, ledger_group l where a.id_ledger_group=l.id_ledger_group and a.id_account_head=" +
      req.params.id_ledger +
      "",
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/ledgerDelete/:id_ledger", function (req, res, next) {
  db.query(
    `insert into deleted_accounts (id_account_head) values (${req.params.id_ledger})`,
    function (err, rows, fields) {
      db.query(
        `delete from account_head where id_account_head=${req.params.id_ledger}`,
        function (err, rows, fields) {
          if (err) throw err;

          res.send(rows);
        }
      );
    }
  );
});

router.get("/voucher/:date/:type", function (req, res, next) {
  db.query(
    'select tbl.type,tbl.acc_from,h.name as acc_to,tbl.date,if(tbl.rate>0, concat(tbl.description, " x ", tbl.rate),tbl.description) as description,tbl.amount-tbl.discount as amount,tbl.discount,tbl.id_account_voucher from(select a.name as acc_from,e.id_ledger_to,e.date,e.description,e.rate,e.amount,e.discount,e.id_invoice,e.type,e.id_account_voucher from account_voucher e, account_head a where e.id_ledger_from=a.id_account_head  and e.date=' +
      req.params.date +
      " and e.type=" +
      req.params.type +
      ")tbl ,account_head h where tbl.id_ledger_to=h.id_account_head and tbl.date=" +
      req.params.date +
      " and tbl.type=" +
      req.params.type +
      "",
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/voucherDel/:id_account_voucher", function (req, res, next) {
  db.query(
    "delete from account_voucher where id_account_voucher=" +
      req.params.id_account_voucher +
      "",
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.post("/accounts/voucher", function (req, res, next) {
  let date = req.body.date ? req.body.date : "";
  let id_ledger_from = req.body.id_ledger_from;
  let id_ledger_to = req.body.id_ledger_to;
  let description = req.body.description;
  let rate = req.body.rate;
  let amount = req.body.amount;
  let discount = req.body.discount;
  let type = req.body.type;
  let voucher_no = req.body.voucher_no;
  let id_invoice = req.body.id_invoice;

  db.query(
    `insert into account_voucher (id_ledger_from ,id_ledger_to,date, description, rate, amount, discount, type,voucher_no,id_invoice) values(${id_ledger_from},${id_ledger_to},'${date}', '${description}', '${rate}', '${amount}', '${discount}', '${type}',${voucher_no}, ${id_invoice})`,
    function (err, result) {
      if (err) throw err;

      res.send(result);
    }
  );
});

router.get(
  "/cashBookOp/:from_date/:id_account_head",
  function (req, res, next) {
    let from_date = req.params.from_date;
    let id_account_head = req.params.id_account_head;

    db.query(
      `SELECT ROUND(SUM(debit)-SUM(credit)) AS balance FROM ( 
              SELECT '3' AS slno, '0' as id, -1*opening_balance as debit, '0' AS credit from account_head where id_account_head=${id_account_head}
              UNION
              SELECT '1' AS slno, id_account_voucher AS id, CAST((amount-discount) AS CHAR) AS debit, '0' AS credit 			FROM account_voucher av, account_head ah WHERE av.id_ledger_to=ah.id_account_head AND amount>0 AND date<${from_date} and id_ledger_to=${id_account_head} 
              UNION 
              SELECT '2' AS slno, id_account_voucher AS id, '0' AS debit,			 CAST((amount-discount) AS CHAR) AS credit FROM account_voucher av, account_head ah WHERE av.id_ledger_from=ah.id_account_head AND amount>0 AND date<${from_date} and id_ledger_from=${id_account_head} 
          )tbl`,
      function (err, rows, fields) {
        if (err) throw err;
        res.send(rows);
      }
    );
  }
);

router.get(
  "/cashBookDebit/:from_date/:to_date/:id_account_head/:activePage/:all?",
  function (req, res, next) {
    let to_date = req.params.to_date;
    let from_date = req.params.from_date;
    let id_account_head = req.params.id_account_head;
    let numOfItems = (req.params.activePage - 1) * 10;

    var strLimit = req.params.all ? "" : ` limit ${numOfItems},10`;

    db.query(
      `SELECT count(*) as totalCount, round(sum(debit)) as totalDebit from (SELECT name,narration,ROUND(debit) AS debit FROM ( SELECT '1' AS slno, date, id_account_voucher AS id, (SELECT name FROM account_head WHERE id_account_head=av.id_ledger_from) AS name ,description AS narration,CAST((amount-discount) AS CHAR) AS debit FROM account_voucher av, account_head ah WHERE av.id_ledger_to=ah.id_account_head AND amount>0 AND date between ${from_date} and ${to_date} and id_ledger_to=${id_account_head})tbl)tbl`,
      function (err, rows, fields) {
        if (err) throw err;

        db.query(
          `SELECT DATE_FORMAT(date ,'%d/%m/%Y') as date, name,narration,ROUND(debit) AS debit FROM (
                 SELECT '1' AS slno, date, id_account_voucher AS id, (SELECT name FROM account_head WHERE id_account_head=av.id_ledger_from) AS name ,description AS narration,CAST((amount-discount) AS CHAR) AS debit FROM account_voucher av, account_head ah WHERE av.id_ledger_to=ah.id_account_head AND amount>0 AND date between ${from_date} and ${to_date} and id_ledger_to=${id_account_head} order by date desc)tbl  ${strLimit}`,
          function (err, rows_, fields) {
            if (err) throw err;

            data = {};
            data.items = rows_;
            data.totalCountDebit = rows[0].totalCount;
            data.totalDebit = rows[0].totalDebit;
            res.send(data);
            console.log(data);
          }
        );
      }
    );
  }
);

router.get(
  "/cashBookCredit/:from_date/:to_date/:id_account_head/:activePage/:all?",
  function (req, res, next) {
    let to_date = req.params.to_date;
    let from_date = req.params.from_date;
    let id_account_head = req.params.id_account_head;
    let numOfItems = (req.params.activePage - 1) * 10;

    var strLimit = req.params.all ? "" : ` limit ${numOfItems},10`;

    db.query(
      `SELECT count(*) as totalCount, round(sum(credit)) as totalCredit from (SELECT name,narration,ROUND(credit) AS credit FROM ( SELECT '1' AS slno, date, id_account_voucher AS id, (SELECT name FROM account_head WHERE id_account_head=av.id_ledger_from) AS name ,description AS narration,CAST((amount-discount) AS CHAR) AS credit FROM account_voucher av, account_head ah WHERE av.id_ledger_from=ah.id_account_head AND amount>0 AND date between ${from_date} and ${to_date} and id_ledger_from=${id_account_head})tbl)tbl`,
      function (err, rows, fields) {
        if (err) throw err;

        db.query(
          `SELECT DATE_FORMAT(date ,'%d/%m/%Y') as date, name,narration,ROUND(credit) AS credit FROM ( SELECT '1' AS slno, date, id_account_voucher AS id, (SELECT name FROM account_head WHERE id_account_head=av.id_ledger_from) AS name ,description AS narration,CAST((amount-discount) AS CHAR) AS credit FROM account_voucher av, account_head ah WHERE av.id_ledger_from=ah.id_account_head AND amount>0 AND date between ${from_date} and ${to_date} and id_ledger_from=${id_account_head} order by date desc)tbl  ${strLimit}`,
          function (err, rows_, fields) {
            if (err) throw err;

            data = {};
            data.items = rows_;
            data.totalCountCredit = rows[0].totalCount;
            data.totalCredit = rows[0].totalCredit;
            res.send(data);
            console.log(data);
          }
        );
      }
    );
  }
);

router.get(
  "/ledgerReport/:from_date/:to_date/:id_ledger/:activePage/:all?",
  function (req, res, next) {
    // console.log(req.params)
    var id_account_head = req.params.id_ledger;
    var from_date = req.params.from_date;
    var to_date = req.params.to_date;

    let numOfItems = (req.params.activePage - 1) * 10;
    var strLimit = req.params.all ? "" : ` limit ${numOfItems},10`;

    db.query(
      `select id_ledger_group from account_head where id_account_head=${id_account_head}`,
      function (err, rows, fields) {
        if (err) throw err;

        var ledger_type = rows[0].id_ledger_group;

        var qryPurchase =
          ledger_type == Constants.SUPPLIER
            ? ` union select '3' as slno, '2' as vchr_type, id_purchase_voucher as id_voucher,DATE_FORMAT(date ,'%d/%m/%Y') as date ,date as _date,narration,'Purchase' as type,cast(gross as char) as receipt,cast(payable+discount as char) as payment from z_purchase_voucher  where date between ${from_date} and ${to_date} and id_account_head=${id_account_head}`
            : ``;
        var qrySales =
          ledger_type == Constants.SUPPLIER ||
          ledger_type == Constants.CONSIGNER
            ? ` union select '4' as slno, '3' as vchr_type, id_sales_voucher as id_voucher,DATE_FORMAT(date ,'%d/%m/%Y') as date ,date as _date,narration,'Sales' as type,cast(received as char) as receipt,cast(gross as char) as payment from z_sales_voucher  where date between ${from_date} and ${to_date}  and id_account_head=${id_account_head}`
            : ``;
        var qryPayroll =
          ledger_type == Constants.STAFF
            ? ` union select '3' as slno, '4' as vchr_type, id_payroll as id_voucher,DATE_FORMAT(date ,'%d/%m/%Y') as date ,date as _date,type as narration,'Payroll' as type,cast(amount as char) as receipt,'0' as payment from z_payroll  where date between ${from_date} and ${to_date}  and id_account_head=${id_account_head}`
            : ``;
        qryPayroll +=
          ledger_type == Constants.STAFF
            ? ` union select '9' as slno, '4' as vchr_type, id_payroll as id_voucher,DATE_FORMAT(p.date ,'%d/%m/%Y') as date ,p.date as _date,concat(p.type,' ',i.invoice_no) as narration,'Payroll' as type,cast(p.amount as char) as receipt,'0' as payment from payroll p, invoice i  where p.id_invoice=i.id_invoice and p.date between ${from_date} and ${to_date}  and p.id_account_head=${id_account_head} and p.id_invoice!=0 `
            : ``;
        qryPayroll +=
          ledger_type == Constants.STAFF
            ? ` union select '10' as slno, '4' as vchr_type, id_payroll as id_voucher,DATE_FORMAT(p.date ,'%d/%m/%Y') as date ,p.date as _date, p.type as narration,'Payroll' as type,cast(p.amount as char) as receipt,'0' as payment from payroll p where p.date between ${from_date} and ${to_date}  and p.id_account_head=${id_account_head} and p.id_invoice=0 `
            : ``;

        var qryInvoice =
          ledger_type == Constants.CONSIGNEE
            ? `union select  '7' as slno, '7' as vchr_type, ii.id_invoice as id_voucher,DATE_FORMAT(date ,'%d/%m/%Y') as date ,date as _date, concat('Invoice No: ',i.invoice_no) as narration,'Invoice' as type,'0' as receipt,cast(sum(total) as char) as payment  FROM  invoice i, invoice_items ii,account_head ah where i.consignee = ah.id_account_head  AND  i.id_invoice = ii.id_invoice and date between ${from_date} and ${to_date} and id_account_head=${id_account_head} and amount>0 group by i.id_invoice `
            : "";
        var qryInvDiscount =
          ledger_type == Constants.CONSIGNEE
            ? `union select  '8' as slno, '8' as vchr_type, i.id_invoice as id_voucher,DATE_FORMAT(date ,'%d/%m/%Y') as date ,date as _date, concat('Invoice No: ',i.invoice_no) as narration,'Discount' as type,cast(discount as char) as receipt,'0' as payment  FROM  invoice i, account_head ah where i.consignee = ah.id_account_head  and date between ${from_date} and ${to_date} and id_account_head=${id_account_head} and discount>0 group by i.id_invoice  `
            : "";
        var qryFrieght =
          ledger_type == Constants.FREIGHT_EXPENSES
            ? ` union select '10' as slno, '10' as vchr_type, id_freight_expense as id_voucher,DATE_FORMAT(f.date ,'%d/%m/%Y') as date ,f.date as _date, concat('Invoice No: ',i.invoice_no, ' : ', f.expense) as narration,'Freight' as type,cast(amount as char) as receipt,'0' as payment from invoice_freight_expense f, invoice i  where f.id_invoice=i.id_invoice and f.date between ${from_date} and ${to_date} `
            : ``;

        var qry = `select '1' as slno, '0' as vchr_type, id_account_voucher as id_voucher,DATE_FORMAT(date ,'%d/%m/%Y') as date ,date as _date,remarks as narration,type as type,'0' as receipt,cast(amount as char) as payment from z_account_voucher  where type='Payment' and date between ${from_date} and ${to_date}  and id_ledger=${id_account_head}
             union
             select '2' as slno, '0' as vchr_type, id_account_voucher as id_voucher,DATE_FORMAT(date ,'%d/%m/%Y') as date ,date as _date,remarks as narration,type as type,cast(amount as char) as receipt,'0' as payment from z_account_voucher  where type='Receipt' and date between ${from_date} and ${to_date}  and id_ledger=${id_account_head} `;

        var qry_server = ` union 
             select '5' as slno, '1' as vchr_type, id_account_voucher as id_voucher,DATE_FORMAT(date ,'%d/%m/%Y') as date ,date as _date,description as narration,'Payment' as type,'0' as receipt,cast(amount as char) as payment from account_voucher  where date between ${from_date} and ${to_date}  and id_ledger_to=${id_account_head}
             union
             select '6' as slno, '1' as vchr_type, id_account_voucher as id_voucher,DATE_FORMAT(date ,'%d/%m/%Y') as date ,date as _date,description as narration,'Receipt' as type,cast(amount as char) as receipt,'0' as payment from account_voucher  where  date between ${from_date} and ${to_date}  and id_ledger_from=${id_account_head} `;

        qry1 = `select count(*) as totalCount, sum(receipt) as receipt, sum(payment) as payment from ( ${qry} ${qry_server} ${qryPurchase} ${qrySales} ${qryPayroll} ${qryInvoice} ${qryInvDiscount} ${qryFrieght} ) __tbl order by _date, slno `;
        qry2 = `select * from ( ${qry} ${qry_server} ${qryPurchase} ${qrySales} ${qryPayroll} ${qryInvoice} ${qryInvDiscount} ${qryFrieght} ) __tbl order by _date, slno ${strLimit}`;

        //  console.log(qryFrieght);

        db.query(qry1, function (err, rows, fields) {
          if (err) throw err;
          db.query(qry2, function (err, rows_, fields) {
            if (err) throw err;
            data = {};
            const items = [];
            data.items = rows_;
            data.totalCount = rows[0].totalCount;
            data.receipt = rows[0].receipt;
            data.payment = rows[0].payment;
            res.send(data);
          });
        });
      }
    );
  }
);

router.get(
  "/ledgerReportOp/:from_date/:to_date/:id_ledger",
  function (req, res, next) {
    console.log(req.params);

    var id_account_head = req.params.id_ledger;
    var from_date = req.params.from_date;
    var to_date = req.params.to_date;
    // var from_date =req.params.from_date;
    // var to_date = req.params.to_date;

    db.query(
      `select id_ledger_group from account_head where id_account_head=${id_account_head}`,
      function (err, rows, fields) {
        if (err) throw err;

        var ledger_type = rows[0].id_ledger_group;

        var qryPurchase =
          ledger_type == Constants.SUPPLIER
            ? ` union select '3' as slno, '2' as vchr_type, id_purchase_voucher as id_voucher,DATE_FORMAT(date ,'%d/%m/%Y') as date ,date as _date,narration,'Purchase' as type,cast(gross as char) as receipt,cast(payable+discount as char) as payment from z_purchase_voucher  where date < ${from_date} and id_account_head=${id_account_head}`
            : ``;
        var qrySales =
          ledger_type == Constants.SUPPLIER ||
          ledger_type == Constants.CONSIGNER
            ? ` union select '4' as slno, '3' as vchr_type, id_sales_voucher as id_voucher,DATE_FORMAT(date ,'%d/%m/%Y') as date ,date as _date,narration,'Sales' as type,cast(received as char) as receipt,cast(gross as char) as payment from z_sales_voucher  where date < ${from_date} and id_account_head=${id_account_head}`
            : ``;
        var qryPayroll =
          ledger_type == Constants.STAFF
            ? ` union select '3' as slno, '4' as vchr_type, id_payroll as id_voucher,DATE_FORMAT(date ,'%d/%m/%Y') as date ,date as _date,type as narration,'Payroll' as type,cast(amount as char) as receipt,'0' as payment from z_payroll  where date < ${from_date} and id_account_head=${id_account_head}`
            : ``;
        qryPayroll +=
          ledger_type == Constants.STAFF
            ? ` union select '9' as slno, '4' as vchr_type, id_payroll as id_voucher,DATE_FORMAT(p.date ,'%d/%m/%Y') as date ,p.date as _date,concat('Packing ',i.invoice_no) as narration,'Payroll' as type,cast(p.amount as char) as receipt,'0' as payment from payroll p, invoice i  where p.id_invoice=i.id_invoice and p.date < ${from_date} and p.id_account_head=${id_account_head}`
            : ``;
        qryPayroll +=
          ledger_type == Constants.STAFF
            ? ` union select '10' as slno, '4' as vchr_type, id_payroll as id_voucher,DATE_FORMAT(p.date ,'%d/%m/%Y') as date ,p.date as _date, p.type as narration,'Payroll' as type,cast(p.amount as char) as receipt,'0' as payment from payroll p where p.date < ${from_date} and p.id_account_head=${id_account_head} and p.id_invoice=0 `
            : ``;

        var qryInvoice =
          ledger_type == Constants.CONSIGNEE
            ? `union select  '7' as slno, '7' as vchr_type, ii.id_invoice as id_voucher,DATE_FORMAT(date ,'%d/%m/%Y') as date ,date as _date, concat('Invoice No: ',i.invoice_no) as narration,'Invoice' as type,'0' as receipt,cast(sum(total) as char) as payment  FROM  invoice i, invoice_items ii,account_head ah where i.consignee = ah.id_account_head  AND  i.id_invoice = ii.id_invoice and date < ${from_date} and id_account_head=${id_account_head} and amount>0 group by i.id_invoice `
            : "";
        var qryInvDiscount =
          ledger_type == Constants.CONSIGNEE
            ? `union select  '8' as slno, '8' as vchr_type, i.id_invoice as id_voucher,DATE_FORMAT(date ,'%d/%m/%Y') as date ,date as _date, concat('Invoice No: ',i.invoice_no) as narration,'Invoice' as type,cast(discount as char) as receipt,'0' as payment  FROM  invoice i, account_head ah where i.consignee = ah.id_account_head  and date < ${from_date}  and id_account_head=${id_account_head} and discount>0 group by i.id_invoice  `
            : "";
        var qryFrieght =
          ledger_type == Constants.FREIGHT_EXPENSES
            ? ` union select '10' as slno, '10' as vchr_type, id_freight_expense as id_voucher,DATE_FORMAT(f.date ,'%d/%m/%Y') as date ,f.date as _date, concat('Invoice No: ',i.invoice_no, ' : ', f.expense) as narration,'Freight' as type,cast(amount as char) as receipt,'0' as payment from invoice_freight_expense f, invoice i  where f.id_invoice=i.id_invoice and f.date < ${from_date} `
            : ``;
        var qryOpening = `union select  '9' as slno, '9' as vchr_type, '0' as id_voucher,'' as date ,'' as _date, '' as narration,'' as type,opening_balance as receipt,'0' as payment  FROM  account_head ah where  id_account_head=${id_account_head}  `;

        var qry = `select '1' as slno, '1' as vchr_type, id_account_voucher as id_voucher,DATE_FORMAT(date ,'%d/%m/%Y') as date ,date as _date,remarks as narration,type as type,'0' as receipt,cast(amount as char) as payment from z_account_voucher  where  type='Payment' and date < ${from_date} and id_ledger=${id_account_head}
               union
               select '2' as slno, '1' as vchr_type, id_account_voucher as id_voucher,DATE_FORMAT(date ,'%d/%m/%Y') as date ,date as _date,remarks as narration,type as type,cast(amount as char) as receipt,'0' as payment from z_account_voucher  where type='Receipt' and date < ${from_date}  and id_ledger=${id_account_head} `;

        var qry_server = ` union 
               select '5' as slno, '1' as vchr_type, id_account_voucher as id_voucher,DATE_FORMAT(date ,'%d/%m/%Y') as date ,date as _date,description as narration,type as type,'0' as receipt,cast(amount as char) as payment from account_voucher  where date < ${from_date}  and id_ledger_to=${id_account_head}
               union
               select '6' as slno, '1' as vchr_type, id_account_voucher as id_voucher,DATE_FORMAT(date ,'%d/%m/%Y') as date ,date as _date,description as narration,type as type,cast(amount as char) as receipt,'0' as payment from account_voucher  where date < ${from_date} and id_ledger_from=${id_account_head} `;

        qry = `select (ifnull(sum(receipt),0) - ifnull(sum(payment),0)) as opening_bal, sum(payment) as payment, sum(receipt) as receipt from ( ${qry} ${qry_server} ${qryPurchase} ${qrySales} ${qryPayroll} ${qryInvoice} ${qryInvDiscount} ${qryOpening} ${qryFrieght} ) __tbl order by _date, slno`;
        console.log(qry);
        db.query(qry, function (err, rows, fields) {
          if (err) throw err;

          res.send(rows);
        });
      }
    );
  }
);

router.get("/sundryCreditor/:id_ledger_group/:date", function (req, res, next) {
  const date = req.params.date;
  var condition = ` and _lg.id_ledger_group=${req.params.id_ledger_group}`;
  if (req.params.id_ledger_group == "0") condition = "";

  var qry =
    `    

  SELECT id_ledger,tbl.paid,account_head, tbl.received,_tbl.ledger_group,opening_balance, ((_tbl.opening_balance+IFNULL(received,0)-IFNULL(paid,0))) AS closing_balance  FROM 
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
   SELECT _ah.name AS account_head,_ah.id_ledger_group, _lg.name AS ledger_group, id_account_head,opening_balance FROM account_head _ah, ledger_group _lg WHERE _lg.id_ledger_group=_ah.id_ledger_group and _lg.id_ledger_group not in ` +
    Constants.NONBALANCE +
    condition +
    `
) _tbl
ON tbl.id_ledger=_tbl.id_account_head where  (_tbl.opening_balance+IFNULL(received,0)-IFNULL(paid,0))>0 
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
  
  SELECT id_ledger,tbl.paid,account_head, tbl.received,_tbl.ledger_group,opening_balance, ((_tbl.opening_balance+IFNULL(received,0)-IFNULL(paid,0))) AS closing_balance  FROM 
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
           SELECT _ah.name AS account_head,_ah.id_ledger_group, _lg.name AS ledger_group, id_account_head,opening_balance FROM account_head _ah, ledger_group _lg WHERE _lg.id_ledger_group=_ah.id_ledger_group and _lg.id_ledger_group not in ` +
    Constants.NONBALANCE +
    condition +
    `
) _tbl
ON tbl.id_ledger=_tbl.id_account_head where  (_tbl.opening_balance+IFNULL(received,0)-IFNULL(paid,0))<0 
`;
  db.query(qry, function (err, rows, fields) {
    if (err) throw err;

    res.send(rows);
  });
});

module.exports = router;
