//Including Necessary Modules
const express       = require('express');
const ejs           = require('ejs');
const expressLayout = require('express-ejs-layouts');
const bodyParser    = require('body-parser');
const sql           = require('mysql');
const session      = require('express-session');
const cookieParser  = require('cookie-parser');
const app = express();

//Setting up port, View engine, custom delimiter (i.e. changing '%' to '?' here!) & using the layout engine
const port = process.env.PORT || 8080;
app.use(expressLayout);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
ejs.delimiter = '?';

//saving session & cookie details 
let oneDay = 24 * 60 * 60 * 1000;

app.use(cookieParser());
app.use(session({
    secret: "SomeSecretKey1212",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
  });

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

// for searching any bus location details with bus number
app.get('/search', (req, res) => {
    let number = req.body.number;
    res.render('map', {title: 'maps'});
    // res.render('home', {title: 'Home-Page'});  
});


// for registering user
app.post('/register', (req, res) => {
    const name     = req.body.name;
    const email    = req.body.email;
    const password = req.body.password;
    let sql        = "INSERT INTO users (name, email, password) VALUES (?)";
    let values     = [[name, email, password]];
    // console.log("name= " + name + "email= " + email + " password= " + password);      //for debugging

    conn.query(sql, values, (err, result) => {
        if(err){console.log("err!"); throw err;}

        if(result){
            res.redirect('/?Registered_Successfully!');
        }
        else{
            res.redirect('/?failed_attempt_try_again!');
        }
    });
});


// for logging in user
app.post('/login', (req, res) => {
    const email    = req.body.email;
    const password = req.body.password;
    
    // console.log("email= " + email + " password= " + password);      //for debugging

    conn.query("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, result) => {
        if(err){console.log("err!"); throw err;}

        if(result.length > 0){
            const userName = result[0].name;
            req.session.username = userName;
            res.redirect('/');
        }
        else{
            res.redirect('/?failed_attempt!');
        }
    });
});

// for logging out user
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err) console.log(err);
        else res.redirect('/');
    });
});


//listening to the port and running the server on it
app.listen(port, () => {
    console.log(`app is successfully running on PORT: '${port}'`);
});
