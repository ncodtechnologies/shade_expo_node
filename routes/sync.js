var express = require('express');
var router = express.Router();

router.get('/syncDb', function(req, res, next) {

  db.query('INSERT INTO account_head (SELECT * FROM z_account_head where id_account_head not in (select id_account_head from account_head))', function (err, rows, fields) {
    if (err) throw err

  })

  db.query('INSERT INTO ledger_group (SELECT * FROM z_ledger_group where id_ledger_group not in (select id_ledger_group from ledger_group))', function (err, rows, fields) {
    if (err) throw err

  })
  
  db.query('DROP TABLE IF EXISTS product', function (err, rows, fields) {
    if (err) throw err

    db.query('RENAME TABLE z_product TO product', function (err, rows, fields) {
      if (err) throw err
  
    })
  });
   
  console.log("Synced!");

  }); 

module.exports = router; 