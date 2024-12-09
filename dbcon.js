const mysql = require('mysql');

const con = mysql.createConnection({
  host: "localhost",
  user: "govin",
  password: "root",
  database: 'grocery_store'
});

con.connect(function(err) {
  if (err){
    console.log('error connecting to sql' ,err);
     return  
} 
    
  console.log("Connected!");
});
con.query('SELECT * FROM cart', (err, results) => {
    if (err) {
      console.error('Error fetching data from cart:', err);
      return;
    }
    console.log('Cart data:', results);
  });
  
module.exports  = con;