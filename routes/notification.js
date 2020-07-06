var express = require('express');
var router = express.Router();



router.post('/notification', function(req, res, next) {
  let date            = '2010-10-10';
  let description     = req.body.description;
  let isread          = 0;
  
  db.query(`insert into notification (date, description, isread) values('${date}', '${description}', ${isread})`,function (err, result) {
    if (err) throw err;
    
    res.send(result);
  })
});


router.get('/notification/', function(req, res, next) {

  db.query('select id_notification,DATE_FORMAT(date, "%d/%m/%Y") as date,description,isread from notification order by id_notification DESC ', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});


router.get('/notificationDel/:id_notification', function(req, res, next) {

  db.query('delete from notification where id_notification='+req.params.id_notification+'', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })
});

module.exports = router;