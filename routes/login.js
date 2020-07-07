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
  let id_user          = req.params.id_user;
  
  if((req.body.id_user) == '0')
  {

  db.query(`insert into users (username,password,access) values( '${username}','${password}','${access}')`,function (err, result) {
    if (err) throw err;
    
    res.send(result);
  });
  }
  else
  {
    var qry=`update users set username='${username}' ,password='${password}',access = ${access} where id_user=${req.body.id_user}`;
  
    db.query(qry,function (err, result) {
      if (err) throw err;
      
      res.send(result);
    })
  }
});

router.get('/userList', function(req, res, next) {

  db.query('select * from users', function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});
router.get('/userEdit/:id_user', function(req, res, next) {

  db.query(`select * from users where id_user=${req.params.id_user}`, function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});
router.get('/userDel/:id_user', function(req, res, next) {

  db.query(`delete from users where id_user=${req.params.id_user}`, function (err, rows, fields) {
    if (err) throw err

     res.send(rows); 
  })

});

module.exports = router;