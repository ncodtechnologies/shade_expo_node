var express = require('express');
var router = express.Router();
const fs = require('fs');
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

function syncDb() {

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

}

router.post('/upload',  upload.single('myFile'), async (req, res) => {
  if (req.file){
      var file = req.file;
      var oldFile = `uploads/${file.filename}`;
      var newPath = `sync/`;
      if (!fs.existsSync(newPath))
        fs.mkdirSync(`sync/`);

      var source = fs.createReadStream(oldFile);
      var dest = fs.createWriteStream(`${newPath}/sync.sql`);
      fs.stat(oldFile, function (err, stats) {
        console.log(stats);
        console.log(oldFile);
        if (err) return console.error(err);

        source.pipe(dest);

        source.on("end", function () {
          restoreDb();
          fs.unlink(oldFile, function(err, result) {
            if(err) console.log('error', err);
          });
        });
      });
      res.send({result:true});
    }
});


function restoreDb() {
  const { exec } = require("child_process");

  exec(" mysql -u root -pNc0d#Mysql shade_app < sync/sync.sql", (error, stdout, stderr) => {
      if (error) {
          console.log(`error: ${error.message}`);
          return;
      }
      console.log(`stdout: ${stdout}`);
      console.log("db restored!");
      syncDb();
    });


  } 
  
  router.get('/backup', function(req, res, next) {
    const { exec } = require("child_process");
  
    exec("mysqldump -u root -pNc0d#Mysql shade_app account_head ledger_group invoice invoice_items payroll account_voucher > sync/syncDown.sql", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        exec("sed -i sync/syncDown.sql -e 's/utf8mb4_0900_ai_ci/utf8mb4_unicode_ci/g' ", (error, stdout, stderr) => {
          if (error) {
            console.log(`error: ${error.message}`);
            return;
          }

          const file = `./sync/syncDown.sql`;
          res.download(file);
        });
    });
    console.log("backedup!");
  
    }); 
  


module.exports = router; 