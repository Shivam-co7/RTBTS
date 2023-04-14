//Including Necessary Modules
const express       = require('express');
const ejs           = require('ejs');
const expressLayout = require('express-ejs-layouts');
const bodyParser    = require('body-parser');
const sql           = require('mysql');
const app = express();

//Setting up port, View engine, custom delimiter (i.e. changing '%' to '?' here!) & using the layout engine
const port = process.env.PORT || 8080;
app.use(expressLayout);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
ejs.delimiter = '?';

// creating connection with database
const conn = sql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'RTBTS'
});

// calling of pages based on the url
app.get('/', (req, res) => {
    res.render('index', {title: 'BusMe'});
});

// app.get('/map', (req, res) => {
//     res.render('map', {title: 'maps'});
//     // res.render('home', {title: 'Home-Page'});  
// });

app.post('/login', (req, res) => {
    const email    = req.body.email;
    const password = req.body.password;
    
    // console.log("email= " + email + " password= " + password);      //for debugging

    conn.query("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, result) => {
        if(err){console.log("err!"); throw err;}

        if(result.length > 0){
            res.redirect('/?workin_logged_in!');
        }
        else{
            res.redirect('/?failed_attempt!');
        }
    });
});



//listening to the port and running the server on it
app.listen(port, () => {
    console.log(`app is successfully running on PORT: '${port}'`);
});
