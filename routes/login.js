var express = require('express');
var router = express.Router();

router.get('/login', function(req, res, next) {

  db.query('select * from login', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});

router.post('/users', function(req, res, next) {

  let username        = req.body.username;
  let password        = req.body.password;
  let access          = req.body.access;
  
  db.query(`insert into users (username,password,access) values( '${username}','${password}','${access}')`,function (err, result) {
    if (err) throw err;
    
    res.send(result);
  })
});

router.get('/userList', function(req, res, next) {

  db.query('select * from users', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});

module.exports = router;