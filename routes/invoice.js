var express = require('express');
var router = express.Router();
const fs = require('fs');
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

router.post('/roughInvoice', function(req, res, next) {
 
  let date            = req.body.date;
  let consignee       = req.body.consignee;
  let consigner       = req.body.consigner;
  let port_load       = req.body.port_load;
  let items           = req.body.items;
  let id_rough_invoice=req.body.id_rough_invoice;
  if((req.body.id_rough_invoice) == '0')  
  {
  var qry=`insert into rough_invoice(date, port_load, consigner, consignee) values('${date}', '${port_load}', '${consigner}', '${consignee}')`;
        
    db.query(qry, function (err, result) {
      if (err) throw err;
      items.forEach(item => {
        var _qry=`insert into rough_invoice_items(id_rough_invoice, id_product, kg, box, total) values ('${result.insertId}','${item.id_product}', '${item.kg}', '${item.box}', '${item.kg*item.box}')`;
    
        db.query(_qry);
      });

      res.send({
        id_rough_invoice: result.insertId,
        isUpdate : false
      });
    })
  }
  else
  {
    var qry=`update rough_invoice set  date='${date}', port_load='${port_load}', consigner='${consigner}', consignee='${consignee}' where id_rough_invoice=`+req.body.id_rough_invoice+``;
    
    db.query(qry, function (err, result) {
      if (err) throw err;
      qryDel = `delete from rough_invoice_items where id_rough_invoice=${req.body.id_rough_invoice}`;

      db.query(qryDel, function (err, result) {
        items.forEach(item => {
          var _qry=`insert into rough_invoice_items (id_rough_invoice, id_product, kg, box, total) values ('${req.body.id_rough_invoice}','${item.id_product}', '${item.kg}', '${item.box}', '${item.kg*item.box}')`;
          db.query(_qry);
        });
      });

      res.send({
        id_rough_invoice: req.body.id_rough_invoice,   
        isUpdate : true
      });
    })
  }
});


router.get('/roughInvoice/:id_rough_invoice', function(req, res, next) {

  db.query('select * from rough_invoice where id_rough_invoice='+req.params.id_rough_invoice+'', function (err, rows, fields) {
    if (err) throw err
    
    db.query('select * from rough_invoice_items where id_rough_invoice='+req.params.id_rough_invoice+'', function (err, _rows, fields) {
      if (err) throw err

      mainRows = [];
      rowItems = [];
      _rows.forEach(_row => {
        rowItems.push({
          id_product : _row.id_product,
          kg : _row.kg,
          box : _row.box
        })
      });

      mainRows = [{
        date             : rows[0].date,
        consignee        : rows[0].consignee,
        consigner        : rows[0].consigner,
        port_load        : rows[0].port_load,        
        items            : rowItems
      }]
      console.log(mainRows);
      res.send(mainRows); 
    })
  })
});

router.get('/invoiceList', function(req, res, next) {

  db.query('select id_invoice,invoice_no,consignee,DATE_FORMAT(date, "%d/%m/%Y") as date from invoice', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});
router.get('/roughInvoiceList', function(req, res, next) {

  db.query('select id_rough_invoice,consigner,consignee,DATE_FORMAT(date, "%d/%m/%Y") as date from rough_invoice', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});

router.get('/invoice/:id_invoice', function(req, res, next) {

  db.query('select * from invoice where id_invoice='+req.params.id_invoice+'', function (err, rows, fields) {
    if (err) throw err
    
    db.query('select * from invoice_items where id_invoice='+req.params.id_invoice+'', function (err, _rows, fields) {
      if (err) throw err

      mainRows = [];
      rowItems = [];
      _rows.forEach(_row => {
        rowItems.push({
          id_product : _row.id_product,
          kg : _row.kg,
          box : _row.amount
        })
      });

      mainRows = [{
        invoice_no       : rows[0].invoice_no,
        date             : rows[0].date,
        order_no         : rows[0].order_no , 
        buyer_date       : rows[0].buyer_date ,
        exporter         : rows[0].exporter ,
        consignee        : rows[0].consignee ,
        other            : rows[0].other ,
        buyer            : rows[0].buyer ,
        country_origin   : rows[0].country_origin ,
        country_final    : rows[0].country_final ,
        pre_carriage     : rows[0].pre_carriage ,
        receipt_place    : rows[0].receipt_place ,
        vessel_no        : rows[0].vessel_no ,
        port_load        : rows[0].port_load ,
        port_discharge   : rows[0].port_discharge ,
        final_destination: rows[0].final_destination ,
        marks            : rows[0].marks ,
        container_no     : rows[0].container_no ,
        awb_no           : rows[0].awb_no , 
        terms            : rows[0].terms ,
        items : rowItems
      }]

      console.log(mainRows);
      res.send(mainRows); 
    })

  })

});


router.post('/invoice', function(req, res, next) {
  let invoice_no        = req.body.invoice_no;
  let order_no          = req.body.order_no;
  let date              = req.body.date;
  let buyer_date        = req.body.buyer_date;
  let exporter          = req.body.exporter;
  let consignee         = req.body.consignee;
  let other             = req.body.other;
  let buyer             = req.body.buyer;
  let country_origin    = req.body.country_origin;
  let country_final     = req.body.country_final;
  let pre_carriage      = req.body.pre_carriage;
  let receipt_place     = req.body.receipt_place;
  let vessel_no         = req.body.vessel_no;
  let port_load         = req.body.port_load;
  let port_discharge    = req.body.port_discharge;
  let final_destination = req.body.final_destination;
  let marks             = req.body.marks;
  let container_no      = req.body.container_no;
  let awb_no            = req.body.awb_no;
  let terms             = req.body.terms;
  let items             = req.body.items;

  if((req.body.id_invoice) == '0')  
  {
    var qry=`insert into invoice (invoice_no, order_no, date, buyer_date, exporter, consignee, other,buyer,country_origin, country_final, pre_carriage, receipt_place, vessel_no,port_load,port_discharge, final_destination, marks, container_no, awb_no, terms) values ('${invoice_no}','${order_no}', '${date}', '${buyer_date}', '${exporter}', '${consignee}', '${other}', '${buyer}', '${country_origin}', '${country_final}', '${pre_carriage}', '${receipt_place}','${vessel_no}', '${port_load}','${port_discharge}', '${final_destination}', '${marks}', '${container_no}', '${awb_no}', '${terms}')`;
        
    db.query(qry, function (err, result) {
      if (err) throw err;
      items.forEach(item => {
        var _qry=`insert into invoice_items (id_invoice, id_product, kg, amount, total) values ('${result.insertId}','${item.id_product}', '${item.kg}', '${item.amount}', '${item.kg*item.amount}')`;
    
        db.query(_qry);
      });

      res.send({
        id_invoice: result.insertId,
        isUpdate : false
      });
    })
  }
  else
  {
    var qry=`update invoice set invoice_no='${invoice_no}',order_no='${order_no}', date='${date}', buyer_date='${buyer_date}', exporter='${exporter}', consignee='${consignee}', other='${other}', buyer='${buyer}', country_origin='${country_origin}', country_final='${country_final}', pre_carriage='${pre_carriage}', receipt_place='${receipt_place}',vessel_no='${vessel_no}', port_load='${port_load}',port_discharge='${port_discharge}', final_destination='${final_destination}', marks='${marks}', container_no='${container_no}', awb_no='${awb_no}', terms='${terms}' where id_invoice=`+req.body.id_invoice+``;
    
    db.query(qry, function (err, result) {
      if (err) throw err;
      qryDel = `delete from invoice_items where id_invoice=${req.body.id_invoice}`;

      db.query(qryDel, function (err, result) {
        items.forEach(item => {
          var _qry=`insert into invoice_items (id_invoice, id_product, kg, amount, total) values ('${req.body.id_invoice}','${item.id_product}', '${item.kg}', '${item.box}', '${item.kg*item.box}')`;
      
          db.query(_qry);
        });
      });

      res.send({
        id_invoice: req.body.id_invoice,   
        isUpdate : true
      });
    })
  } 
});



router.get('/invoice/invLabour/:id_invoice', function(req, res, next) {

  db.query('select * from  invoice_labour l, account_head a where l.id_account_head=a.id_account_head and id_invoice='+req.params.id_invoice+'', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});


router.get('/invoice/invPacking/:id_invoice', function(req, res, next) {

  db.query('select * from  invoice_packing_list l, product p where l.id_product=p.id_product and id_invoice='+req.params.id_invoice+'' , function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});


router.get('/invoice/invPackingExp/:id_invoice', function(req, res, next) {

  db.query('select * from  invoice_packing_expense e, account_head a where e.id_account_head=a.id_account_head and id_invoice='+req.params.id_invoice+'', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});


router.post('/invoice/expense', function(req, res, next) {
  let date            = req.body.date;
  let id_ledger_from  = 0;
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


router.get('/invoice/expense/:id_invoice', function(req, res, next) {
var id_invoice=req.params.id_invoice;

  db.query(`select e.id_account_voucher,a.name as ledger,DATE_FORMAT(e.date ,'%d/%m/%Y') as date,e.description,e.rate,e.amount,e.id_invoice from account_voucher e, account_head a where e.id_ledger_to=a.id_account_head  and id_invoice=${id_invoice}`, function (err, rows, fields) {
    if (err) throw err

     res.send(rows);  
  })

}); 


router.get('/invoice/expenseDel/:id_account_voucher', function(req, res, next) {

  db.query('delete from account_voucher where id_account_voucher='+req.params.id_account_voucher+'', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});

router.get('/invoice/netSalesTotal/:id_invoice', function(req, res, next) {

  db.query('select sum(total) as tot from invoice_items where id_invoice='+req.params.id_invoice+'', function (err, rows, fields) {
    if (err) throw err
    
     res.send(rows); 
  }) 

});

router.get('/invoice/netOtherExp/:id_invoice', function(req, res, next) {

  db.query('select sum(amount) as tot from account_voucher where id_invoice='+req.params.id_invoice+'', function (err, rows, fields) {
    if (err) throw err
    
     res.send(rows); 
  }) 

});

router.get('/invoice/documentsList/:id_invoice', function(req, res, next) {

  db.query('select * from documents where id_invoice='+req.params.id_invoice+'', function (err, rows, fields) {
    if (err) throw err
    
     res.send(rows); 
  }) 

}); 
 
router.get('/invoice/documentsDel/:id_document', function(req, res, next) {

  db.query('select id_invoice,file from documents where id_document='+req.params.id_document+'', function (err, rows, fields) {
    if (err) throw err
    
    if(rows.length>0){
      
      db.query('delete from documents where id_document='+req.params.id_document+'', function (err, rows, fields) { })
      var filename = `uploads/invoice_docs/${rows[0].id_invoice}/${rows[0].file}`;
      fs.stat(filename, function (err, stats) {
        console.log(stats);
        if (err) 
            return console.error(err);
        
        fs.unlink(filename, function(err, result) {
          if(err) console.log('error', err);
        }); 
     });
    }
    
    res.send(rows); 
  })

});

router.post('/invoice/documents', upload.array('files', 12), async (req, res) => {

  let id_invoice      = req.body.id_invoice;
  let name            = req.body.name;
  let remark          = req.body.remark;
  var filename        = req.files ? req.files[0].originalname : "";
  
  if (req.files)
    req.files.forEach((file) => {
      var oldFile = `uploads/${file.filename}`;
      var newPath = `uploads/invoice_docs/${id_invoice}`;
      if (!fs.existsSync(newPath))
        fs.mkdirSync(`uploads/invoice_docs/${id_invoice}`);

      var source = fs.createReadStream(oldFile);
      var dest = fs.createWriteStream(`${newPath}/${file.originalname}`);
      fs.stat(oldFile, function (err, stats) {
        console.log(stats);
        console.log(oldFile);
        if (err) return console.error(err);

        source.pipe(dest);
        source.on("end", function () {
          fs.unlink(oldFile, function(err, result) {
            if(err) console.log('error', err);
          });
        });
      });
   });

  db.query(`insert into documents (id_invoice,name,remarks,file) values( ${id_invoice}, '${name}','${remark}','${filename}')`,function (err, result) {
    if (err) throw err;
    
    res.send(result);
  })
});

router.get('/invoice/getDoc/:id_document', function(req, res){ 
  
  db.query(`select id_invoice,file from documents where id_document=${req.params.id_document}`, function (err, rows, fields) {
    if (err) throw err
    
    if(rows.length>0){
      
      var filename = `uploads/invoice_docs/${rows[0].id_invoice}/${rows[0].file}`;
      fs.stat(filename, function (err, stats) {
        console.log(stats);
        if (err) 
            return console.error(err);
        
        res.download(filename);
     });
    }
    
  })

});

module.exports = router;