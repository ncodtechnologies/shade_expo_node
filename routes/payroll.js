var express = require('express');
var router = express.Router();



router.post('/payroll', function(req, res, next) {
  let date            = req.body.date;
  let id_ledger       = req.body.id_ledger;
  let amount          = req.body.amount;
  let type            = req.body.type;
  
  db.query(`insert into payroll (date, id_ledger, type, amount) values('${date}', ${id_ledger}, '${type}', '${amount}')`,function (err, result) {
    if (err) throw err;
    
    res.send(result);
  })
});


router.get('/payroll/:date', function(req, res, next) {

  db.query('select a.account_head as name,p.date,p.type,p.amount from payroll p, z_account_head a where p.id_ledger=a.id_account_head and date='+req.params.date+'', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});

module.exports = router;