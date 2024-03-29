var express = require("express");
var router = express.Router();
const fs = require("fs");
var multer = require("multer");
const { isNullOrUndefined } = require("util");
var upload = multer({ dest: "uploads/" });

router.post("/roughInvoice", function (req, res, next) {
  console.log(req.body);
  let date = req.body.date;
  let invoice_no = req.body.invoice_no;
  let consignee = req.body.consignee;
  let consigner = req.body.consigner;
  let consignee_address = req.body.consignee_address;
  let consigner_address = req.body.consigner_address;
  let port_load = req.body.port_load;
  let items = req.body.items;
  let airwayItems = req.body.airwayItems;
  let id_rough_invoice = req.body.id_rough_invoice;

  if (req.body.id_rough_invoice == "0") {
    var qry = `insert into rough_invoice(date, port_load, consigner, consignee, consigner_address, consignee_address,invoice_no) values('${date}', '${port_load}', '${consigner}', '${consignee}', '${consigner_address}', '${consignee_address}', '${invoice_no}')`;

    db.query(qry, function (err, result) {
      if (err) throw err;
      items.forEach((item) => {
        var _qry = `insert into rough_invoice_items(id_rough_invoice, id_product, kg, box, total) values ('${
          result.insertId
        }','${item.id_product}', '${item.kg}', '${item.box}', '${
          item.kg * item.box
        }')`;

        db.query(_qry);
      });

      airwayItems.forEach((item) => {
        var _qry = `insert into airway_items(id_rough_invoice, id_product, kg, box, total) values ('${
          result.insertId
        }','${item.id_product}', '${item.kg}', '${item.box}', '${
          item.kg * item.box
        }')`;

        db.query(_qry);
      });

      res.send({
        id_rough_invoice: result.insertId,
        isUpdate: false,
      });
    });
  } else {
    var qry =
      `update rough_invoice set  date='${date}', port_load='${port_load}', consigner='${consigner}', consignee='${consignee}', consigner_address='${consigner_address}', consignee_address='${consignee_address}', invoice_no='${invoice_no}' where id_rough_invoice=` +
      req.body.id_rough_invoice +
      ``;

    db.query(qry, function (err, result) {
      if (err) throw err;
      qryDel = `delete from rough_invoice_items where id_rough_invoice=${req.body.id_rough_invoice}`;
      qryDelAir = `delete from airway_items where id_rough_invoice=${req.body.id_rough_invoice}`;

      db.query(qryDel, function (err, result) {
        items.forEach((item) => {
          var _qry = `insert into rough_invoice_items (id_rough_invoice, id_product, kg, box, total) values ('${
            req.body.id_rough_invoice
          }','${item.id_product}', '${item.kg}', '${item.box}', '${
            item.kg * item.box
          }')`;
          db.query(_qry);
        });
      });

      db.query(qryDelAir, function (err, result) {
        airwayItems.forEach((item) => {
          var _qry = `insert into airway_items (id_rough_invoice, id_product, kg, box, total) values (${
            req.body.id_rough_invoice
          },'${item.id_product}', '${item.kg}', '${item.box}', '${
            item.kg * item.box
          }')`;
          db.query(_qry);
        });
      });

      res.send({
        id_rough_invoice: req.body.id_rough_invoice,
        isUpdate: true,
      });
    });
  }
});

router.get("/roughInvoice/:id_rough_invoice", function (req, res, next) {
  db.query(
    "select * from rough_invoice where id_rough_invoice=" +
      req.params.id_rough_invoice +
      "",
    function (err, rows, fields) {
      if (err) throw err;

      db.query(
        "select * from rough_invoice_items where id_rough_invoice=" +
          req.params.id_rough_invoice +
          "",
        function (err, _rows, fields) {
          if (err) throw err;

          mainRows = [];
          rowItems = [];
          _rows.forEach((_row) => {
            rowItems.push({
              id_product: _row.id_product,
              kg: _row.kg,
              box: _row.box,
            });
          });

          mainRows = [
            {
              date: rows[0].date,
              consignee: rows[0].consignee,
              consigner: rows[0].consigner,
              consignee_address: rows[0].consignee_address,
              consigner_address: rows[0].consigner_address,
              port_load: rows[0].port_load,
              items: rowItems,
            },
          ];
          console.log(mainRows);
          res.send(mainRows);
        }
      );
    }
  );
});

router.get("/roughInvoice/airway/:id_rough_invoice", function (req, res, next) {
  db.query(
    "select * from airway_items where id_rough_invoice=" +
      req.params.id_rough_invoice +
      "",
    function (err, _rows, fields) {
      if (err) throw err;

      mainRows = [];
      rowItems = [];
      _rows.forEach((_row) => {
        rowItems.push({
          id_product: _row.id_product,
          kg: _row.kg,
          box: _row.box,
        });
      });

      mainRows = [
        {
          airwayItems: rowItems,
        },
      ];
      console.log(mainRows);
      res.send(mainRows);
    }
  );
});

router.get("/invoiceList/:activePage", function (req, res, next) {
  let numOfItems = (req.params.activePage - 1) * 20;

  db.query(
    `select count(*) as totalCount from invoice  `,
    function (err, rows, fields) {
      if (err) throw err;

      db.query(
        `select id_invoice,invoice_no,(select title from account_head where id_account_head = consignee) as consignee,(select name from account_head where id_account_head = consigner) as consigner,DATE_FORMAT(date, "%d/%m/%Y") as date, port_load, awb_no, status, date as _date from invoice order by _date DESC limit ${numOfItems},20 `,
        function (err, rows_, fields) {
          if (err) throw err;

          var data = {};
          data.totalCount = rows[0].totalCount;
          data.items = rows_;

          res.send(data);
        }
      );
    }
  );
});
router.get(
  "/invoiceList/:from/:to/:activePage/:invoice_no",
  function (req, res, next) {
    console.log(req.params);

    let numOfItems = (req.params.activePage - 1) * 10;
    let from = req.params.from;
    let to = req.params.to;
    let invoice_no = req.params.invoice_no;
    var condition = "";
    invoice_no = invoice_no.replace("_", "/");

    if (invoice_no != "null") {
      condition = `and invoice_no like '%${req.params.invoice_no}%'`;
    }

    console.log(condition);
    console.log(invoice_no);
    db.query(
      `select count(*) as totalCount from invoice where date between '${from}' and  '${to}'  ${condition} `,
      function (err, rows, fields) {
        if (err) throw err;

        db.query(
          `select id_invoice,invoice_no,(select name from account_head where id_account_head = consignee) as consignee,DATE_FORMAT(date, "%d/%m/%Y") as date from invoice where date between '${from}' and '${to}'  ${condition} order by id_invoice DESC limit ${numOfItems},10 `,
          function (err, rows_, fields) {
            if (err) throw err;

            var data = {};
            data.totalCount = rows[0].totalCount;
            data.items = rows_;

            res.send(data);
            console.log(data);
          }
        );
      }
    );
  }
);

router.get("/roughInvoiceList/:activePage", function (req, res, next) {
  let numOfItems = (req.params.activePage - 1) * 10;

  db.query(
    `select count(*) as totalCount from rough_invoice  `,
    function (err, rows, fields) {
      if (err) throw err;

      db.query(
        `select id_rough_invoice,(select name from account_head where id_account_head = i.consigner) as consigner,(select name from account_head where id_account_head = i.consignee) as consignee,DATE_FORMAT(date, "%d/%m/%Y") as date from rough_invoice i  order by i.id_rough_invoice DESC limit ${numOfItems},10`,
        function (err, rows_, fields) {
          if (err) throw err;
          data = {};
          const items = [];
          data.items = rows_;
          data.totalCount = rows[0].totalCount;
          res.send(data);
        }
      );
    }
  );
});

router.get("/invoice/:id_invoice", function (req, res, next) {
  //console.log(req.params)
  db.query(
    "select * from invoice where id_invoice=" + req.params.id_invoice + "",
    function (err, rows, fields) {
      if (err) throw err;

      db.query(
        "select * from invoice_items where id_invoice=" +
          req.params.id_invoice +
          "",
        function (err, _rows, fields) {
          if (err) throw err;

          mainRows = [];
          rowItems = [];
          _rows.forEach((_row) => {
            rowItems.push({
              id_product: _row.id_product,
              kg: _row.kg,
              box: _row.amount,
            });
          });

          mainRows = [
            {
              invoice_no: rows[0].invoice_no,
              date: rows[0].date,
              order_no: rows[0].order_no,
              buyer_date: rows[0].buyer_date,
              consigner: rows[0].consigner,
              consignee: rows[0].consignee,
              consigner_address: rows[0].consigner_address,
              consignee_address: rows[0].consignee_address,
              other: rows[0].other,
              buyer: rows[0].buyer,
              country_origin: rows[0].country_origin,
              country_final: rows[0].country_final,
              pre_carriage: rows[0].pre_carriage,
              receipt_place: rows[0].receipt_place,
              vessel_no: rows[0].vessel_no,
              port_load: rows[0].port_load,
              port_discharge: rows[0].port_discharge,
              final_destination: rows[0].final_destination,
              marks: rows[0].marks,
              container_no: rows[0].container_no,
              awb_no: rows[0].awb_no,
              terms: rows[0].terms,
              discount: rows[0].discount,
              narration: rows[0].narration,
              conversion_rate: rows[0].conversion_rate,
              purchase: rows[0].purchase,
              status: rows[0].status,
              freight_code: rows[0].freight_password,
              currency: rows[0].currency,
              items: rowItems,
            },
          ];

          console.log(mainRows);
          res.send(mainRows);
        }
      );
    }
  );
});

router.post("/invoice", function (req, res, next) {
  console.log(req.body);
  let invoice_no = req.body.invoice_no;
  let order_no = req.body.order_no;
  let date = req.body.date;
  let buyer_date = req.body.buyer_date;
  let consigner = req.body.consigner;
  let consignee = req.body.consignee;
  let consigner_address = req.body.consigner_address;
  let consignee_address = req.body.consignee_address;
  let other = req.body.other;
  let buyer = req.body.buyer;
  let country_origin = req.body.country_origin;
  let country_final = req.body.country_final;
  let pre_carriage = req.body.pre_carriage;
  let receipt_place = req.body.receipt_place;
  let vessel_no = req.body.vessel_no;
  let port_load = req.body.port_load;
  let port_discharge = req.body.port_discharge;
  let final_destination = req.body.final_destination;
  let marks = req.body.marks;
  let container_no = req.body.container_no;
  let awb_no = req.body.awb_no;
  let terms = req.body.terms;
  let items = req.body.items;
  let discount = req.body.discount;
  let narration = req.body.narration;
  let conversion_rate = req.body.conversion_rate;
  let status = req.body.status;
  let freight_password = req.body.freight_code;
  let currency = req.body.currency;

  if (req.body.id_invoice == "0") {
    var qry = `insert into invoice (invoice_no, order_no, date, buyer_date, consigner, consignee, consigner_address, consignee_address, other,buyer,country_origin, country_final, pre_carriage, receipt_place, vessel_no,port_load,port_discharge, final_destination, marks, container_no, awb_no, terms, discount,narration,conversion_rate, status, freight_password, currency) values ('${invoice_no}','${order_no}', '${date}', '${buyer_date}', '${consigner}', '${consignee}', '${consigner_address}', '${consignee_address}', '${other}', '${buyer}', '${country_origin}', '${country_final}', '${pre_carriage}', '${receipt_place}','${vessel_no}', '${port_load}','${port_discharge}', '${final_destination}', '${marks}', '${container_no}', '${awb_no}', '${terms}', '${discount}', '${narration}', '${conversion_rate}', '${status}', '${freight_password}', '${currency}')`;

    db.query(qry, function (err, result) {
      if (err) throw err;
      items.forEach((item) => {
        var _qry = `insert into invoice_items (id_invoice, id_product, kg, amount, total) values ('${
          result.insertId
        }','${item.id_product}', '${item.kg}', '${item.amount}', '${
          item.kg * item.amount
        }')`;

        db.query(_qry);
      });

      res.send({
        id_invoice: result.insertId,
        isUpdate: false,
      });
    });
  } else {
    var qry =
      `update invoice set invoice_no='${invoice_no}',order_no='${order_no}', date='${date}', buyer_date='${buyer_date}', consigner='${consigner}', consignee='${consignee}', consigner_address='${consigner_address}', consignee_address='${consignee_address}', other='${other}', buyer='${buyer}', country_origin='${country_origin}', country_final='${country_final}', pre_carriage='${pre_carriage}', receipt_place='${receipt_place}',vessel_no='${vessel_no}', port_load='${port_load}',port_discharge='${port_discharge}', final_destination='${final_destination}', marks='${marks}', container_no='${container_no}', awb_no='${awb_no}', terms='${terms}', discount='${discount}', narration='${narration}', conversion_rate='${conversion_rate}', status='${status}', freight_password='${freight_password}', currency='${currency}' where id_invoice=` +
      req.body.id_invoice +
      ``;

    db.query(qry, function (err, result) {
      if (err) throw err;
      qryDel = `delete from invoice_items where id_invoice=${req.body.id_invoice}`;

      db.query(qryDel, function (err, result) {
        items.forEach((item) => {
          var _qry = `insert into invoice_items (id_invoice, id_product, kg, amount, total) values ('${
            req.body.id_invoice
          }','${item.id_product}', '${item.kg}', '${item.box}', '${
            item.kg * item.box
          }')`;

          db.query(_qry);
        });
      });

      res.send({
        id_invoice: req.body.id_invoice,
        isUpdate: true,
      });
    });
  }
});

router.get("/invoice/totPackingExp/:id_invoice", function (req, res, next) {
  db.query(
    `select sum(amount) as amount from 
            (select sum(amount) as amount from  payroll p, account_head a where p.id_account_head=a.id_account_head and id_invoice='${req.params.id_invoice}'
            union
            select sum(i.qty*p.selling_price) as amount from  invoice_packing_item i, product p where p.id_product=i.id_product and id_invoice='${req.params.id_invoice}') tbl
            `,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/invoice/invLabour/:id_invoice", function (req, res, next) {
  db.query(
    "select * from  payroll p, account_head a where p.id_account_head=a.id_account_head and id_invoice=" +
      req.params.id_invoice +
      "",
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.post("/invoice/updPurchase", function (req, res, next) {
  let purchase = req.body.purchase;
  let id_invoice = req.body.id_invoice;

  db.query(
    `update invoice set purchase=${purchase} where id_invoice=${id_invoice}`,
    function (err, result) {
      if (err) throw err;

      res.send(result);
    }
  );
});

router.get("/invoice/invPacking/:id_invoice", function (req, res, next) {
  db.query(
    "select * from  invoice_packing_list l, product p where l.id_product=p.id_product and id_invoice=" +
      req.params.id_invoice +
      " order by pack_no",
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/invoice/invPackingLabour/:id_invoice", function (req, res, next) {
  db.query(
    "select * from payroll p, account_head ah where p.id_account_head = ah.id_account_head and id_invoice=" +
      req.params.id_invoice,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/invoice/invPackingGrpBy/:id_invoice", function (req, res, next) {
  db.query(
    "select name, sum(kg) as kg from  invoice_packing_list l, product p where l.id_product=p.id_product and id_invoice=" +
      req.params.id_invoice +
      " group by p.id_product",
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.post("/invoice/packing", function (req, res, next) {
  console.log(req.body);
  let date = req.body.date;
  let isAdmin = req.body.is_admin;

  db.query(
    "select * from  invoice_packing_list l where id_invoice=" +
      req.body.id_invoice,
    function (err, mainRows, fields) {
      if (err) throw err;

      if (mainRows.length > 0 && !isAdmin) {
        res.send({
          result: false,
        });
      } else {
        if (req.body.packing_list) {
          db.query(
            `delete from invoice_packing_list where id_invoice=${req.body.id_invoice} `,
            function (err, rows, fields) {
              if (err) throw err;
            }
          );
          if (req.body.packing_list.length > 0)
            req.body.packing_list.forEach((e) => {
              db.query(
                `INSERT into invoice_packing_list (id_product , kg, id_invoice, pack_no ) values ('${e.id_product}','${e.kg}','${e.id_invoice}','${e.pack_no}')`,
                function (err, rows, fields) {
                  if (err) throw err;
                }
              );
            });
        }
        if (req.body.packing_items) {
          db.query(
            `delete from invoice_packing_item where id_invoice=${req.body.id_invoice} `,
            function (err, rows, fields) {
              if (err) throw err;
            }
          );
          if (req.body.packing_items.length > 0)
            req.body.packing_items.forEach((e) => {
              db.query(
                `INSERT into invoice_packing_item (id_product, qty, id_invoice, date ) values ('${e.id_product}','${e.qty}','${e.id_invoice}', '${date}')`,
                function (err, rows, fields) {
                  if (err) throw err;
                }
              );
            });
        }
        if (req.body.labours) {
          db.query(
            `delete from payroll where id_invoice=${req.body.id_invoice} `,
            function (err, rows, fields) {
              if (err) throw err;
            }
          );
          if (req.body.labours.length > 0)
            req.body.labours.forEach((e) => {
              db.query(
                `INSERT into payroll (date, id_account_head, amount, id_invoice, type) values ('${date}','${e.id_account_head}','${e.amount}','${e.id_invoice}','${e.type}')`,
                function (err, rows, fields) {
                  if (err) throw err;
                }
              );
            });
        }
        res.send({
          result: true,
        });
      }
    }
  );
});

router.get("/invoice/invPackingExp/:id_invoice", function (req, res, next) {
  db.query(
    "select *, i.qty*p.selling_price as amount from  invoice_packing_item i, product p where p.id_product=i.id_product and id_invoice=" +
      req.params.id_invoice +
      "",
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.post("/invoice/expense", function (req, res, next) {
  let date = req.body.date;
  let id_ledger_from = req.body.id_ledger_to;
  let id_ledger_to = 0;
  let description = req.body.description;
  let rate = req.body.rate;
  let amount = req.body.amount;
  let type = req.body.type;
  let voucher_no = req.body.voucher_no;
  let id_invoice = req.body.id_invoice;

  db.query(
    `insert into account_voucher (id_ledger_from ,id_ledger_to,date, description, rate, amount, type,voucher_no,id_invoice) values(${id_ledger_from},${id_ledger_to},'${date}', '${description}', '${rate}', '${amount}', '${type}',${voucher_no}, ${id_invoice})`,
    function (err, result) {
      if (err) throw err;

      res.send(result);
    }
  );
});

router.post("/invoice/freight", function (req, res, next) {
  console.log(req.body);
  let isAdmin = req.body.is_admin;
  if (req.body.freight) {
    if (!req.body.code) {
      res.send({
        result: -2,
      });
      return;
    }
    let code = req.body.code;
    //Check Password
    db.query(
      "select freight_password from invoice where id_invoice=" +
        req.body.id_invoice +
        "",
      function (err, passRows, fields) {
        if (err) throw err;
        console.log(passRows[0].freight_password);
        console.log(code);
        if (code != passRows[0].freight_password) {
          res.send({
            result: -2,
          });
          return;
        }

        db.query(
          "select * from  invoice_freight_expense l where id_invoice=" +
            req.body.id_invoice,
          function (err, mainRows, fields) {
            if (err) throw err;

            if (mainRows.length > 0 && !isAdmin) {
              res.send({
                result: -1,
              });
              return;
            }
            db.query(
              `delete from invoice_freight_expense where id_invoice=${req.body.id_invoice} `,
              function (err, rows, fields) {
                if (err) throw err;

                if (req.body.freight.length > 0)
                  req.body.freight.forEach((e) => {
                    db.query(
                      `INSERT into invoice_freight_expense (id_invoice, expense, amount, date ) values ('${e.id_invoice}','${e.expense}','${e.amount}', '${req.body.date}')`,
                      function (err, rows, fields) {
                        if (err) throw err;
                      }
                    );
                  });

                res.send({
                  result: 1,
                });
              }
            );
          }
        );
      }
    );
  }
});

router.get("/invoice/frightExp/:id_invoice", function (req, res, next) {
  db.query(
    "select * from  invoice_freight_expense where id_invoice=" +
      req.params.id_invoice +
      "",
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/invoice/frightExpTot/:id_invoice", function (req, res, next) {
  db.query(
    "select sum(amount) as amount from  invoice_freight_expense where id_invoice=" +
      req.params.id_invoice +
      "",
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/invoice/expense/:id_invoice", function (req, res, next) {
  var id_invoice = req.params.id_invoice;

  db.query(
    `select e.id_account_voucher,a.name as ledger,DATE_FORMAT(e.date ,'%d/%m/%Y') as date,e.description,e.rate,e.amount,e.id_invoice from account_voucher e, account_head a where e.id_ledger_from=a.id_account_head  and id_invoice=${id_invoice}`,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get(
  "/invoice/expenseDel/:id_account_voucher",
  function (req, res, next) {
    db.query(
      "delete from account_voucher where id_account_voucher=" +
        req.params.id_account_voucher +
        "",
      function (err, rows, fields) {
        if (err) throw err;

        res.send(rows);
      }
    );
  }
);

router.get("/invoice/netSalesTotal/:id_invoice", function (req, res, next) {
  db.query(
    "select sum(ifnull(total,0))-IFNULL(i.discount,0) as tot from invoice_items items, invoice i where items.id_invoice =i.id_invoice and i.id_invoice=" +
      req.params.id_invoice +
      "",
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/invoice/netOtherExp/:id_invoice", function (req, res, next) {
  db.query(
    "select sum(amount) as tot from account_voucher where id_invoice=" +
      req.params.id_invoice +
      "",
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/invoice/documentsList/:id_invoice", function (req, res, next) {
  db.query(
    "select * from documents where id_invoice=" + req.params.id_invoice + "",
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

router.get("/invoice/documentsDel/:id_document", function (req, res, next) {
  db.query(
    "select id_invoice,file from documents where id_document=" +
      req.params.id_document +
      "",
    function (err, rows, fields) {
      if (err) throw err;

      if (rows.length > 0) {
        db.query(
          "delete from documents where id_document=" +
            req.params.id_document +
            "",
          function (err, rows, fields) {}
        );
        var filename = `uploads/invoice_docs/${rows[0].id_invoice}/${rows[0].file}`;
        fs.stat(filename, function (err, stats) {
          console.log(stats);
          if (err) return console.error(err);

          fs.unlink(filename, function (err, result) {
            if (err) console.log("error", err);
          });
        });
      }

      res.send(rows);
    }
  );
});

router.post(
  "/invoice/documents",
  upload.array("files", 12),
  async (req, res) => {
    let id_invoice = req.body.id_invoice;
    let name = req.body.name;
    let remark = req.body.remark;
    var filename = req.files ? req.files[0].originalname : "";

    if (req.files)
      req.files.forEach((file) => {
        var oldFile = `uploads/${file.filename}`;
        var newPath = `uploads/invoice_docs/${id_invoice}`;
        if (!fs.existsSync(newPath))
          fs.promises.mkdir(newPath, { recursive: true });

        var source = fs.createReadStream(oldFile);
        var dest = fs.createWriteStream(`${newPath}/${file.originalname}`);
        fs.stat(oldFile, function (err, stats) {
          console.log(stats);
          console.log(oldFile);
          if (err) return console.error(err);

          source.pipe(dest);
          source.on("end", function () {
            fs.unlink(oldFile, function (err, result) {
              if (err) console.log("error", err);
            });
          });
        });
      });

    db.query(
      `insert into documents (id_invoice,name,remarks,file) values( ${id_invoice}, '${name}','${remark}','${filename}')`,
      function (err, result) {
        if (err) throw err;

        res.send(result);
      }
    );
  }
);

router.get("/invoice/getDoc/:id_document", function (req, res) {
  db.query(
    `select id_invoice,file from documents where id_document=${req.params.id_document}`,
    function (err, rows, fields) {
      if (err) throw err;

      if (rows.length > 0) {
        var filename = `uploads/invoice_docs/${rows[0].id_invoice}/${rows[0].file}`;
        fs.stat(filename, function (err, stats) {
          console.log(stats);
          if (err) return console.error(err);

          res.download(filename);
        });
      }
    }
  );
});

module.exports = router;
