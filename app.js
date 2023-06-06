//Including Necessary Modules
const express = require('express');
const ejs = require('ejs');
const expressLayout = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const sql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();
const saltRounds = 10; // Determines the complexity of bcrypt hashing

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
    saveUninitialized: true,
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

//for nav-bar links START

// for home-page
app.get('/', (req, res) => {
    res.render('index', { title: 'BusMe', apiKey: "SVEFjR5fzjf840paBjrKqGRMYDazDeNF" });
});

// for about-us page
app.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});

// for services page
app.get('/services', (req, res) => {
    res.render('services', { title: 'Services' });
});

// for pricing page
app.get('/pricing', (req, res) => {
    res.render('pricing', { title: 'Pricing' });
});

// for contact-us page
app.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact' });
});

// for service-details page
app.get('/service-details', (req, res) => {
    res.render('service-details', { title: 'Service Details' });
});

// for driver's page
app.get('/driver', (req, res) => {
    res.render('driver-page', { title: 'Driver' });
});

//for nav-bar links END

//for footer links START

// for Terms & Conditions page
app.get('/TandC', (req, res) => {
    res.render('TnC-Page', { title: 'T&C' });
});

// for Privacy-Policy page
app.get('/privacyPolicy', (req, res) => {
    res.render('privacyPolicy-page', { title: 'Privacy-Policy' });
});
//for footer links END


// for searching any bus location details with bus number
app.get('/search', (req, res) => {
    let number = req.body.number;
    res.render('map', { title: 'maps' });
    // res.render('home', {title: 'Home-Page'});  
});


// for registering user
app.post('/register', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    conn.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
        if (err) { console.log("err!"); throw err; }

        if(result.length > 0){
            res.redirect('/?User_Registered_Already!');
        }
    });

    // to store ENCRYPED Password in database
    bcrypt.hash(password, saltRounds, (err, hashedPass) => {
        // if any error occurs while Hashing
        if (err) {
            console.error(err);
            return;
        }

        let sql = "INSERT INTO users (name, email, password) VALUES (?)";
        let values = [[name, email, hashedPass]];
        // console.log("name= " + name + "email= " + email + " password= " + password);      //for debugging

        conn.query(sql, values, (err, result) => {
            if (err) { console.log("err!"); throw err; }

            if (result) {
                res.redirect('/?Registered_Successfully!');
            }
            else {
                res.redirect('/?failed_attempt_try_again!');
            }
        });

    });

});


// for logging in user
app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // console.log("email= " + email + " password= " + password);      //for debugging

    // To get the stored-Hashed-Password with the email user-provided
    conn.query("SELECT password FROM users WHERE email = ?", [email], (err, result) => {
        if (err) { console.log("err!"); throw err; }
      
        if (result.length > 0) {
          const storedHashedPass = result[0].password;

          // To compare the stored-Hashed-Password with the password user-provided
          bcrypt.compare(password, storedHashedPass, (err, result) => {
            if (err) { console.error(err); return; }
         
            if(result){     // To get the user details if the passwords matches
                conn.query("SELECT * FROM users WHERE email = ? AND password = ?", [email, storedHashedPass], (err, result) => {
                    if (err) { console.log("err!"); throw err; }
            
                    if (result.length > 0) {
                        const userName = result[0].name;
                        req.session.username = userName;
                        // for redirecting to home as dashboard
                        res.redirect('/');
                    }
                    else {
                        res.redirect('/?failed_attempt!');
                    }
                });
            } else {
                res.redirect('/?failed_attempt!');
              }

        });

        } else {
          res.redirect('/?failed_attempt!');
        }
      });
      
});

// for logging out user
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) console.log(err);
        else res.redirect('/');
    });
});


//listening to the port and running the server on it
app.listen(port, () => {
    console.log(`app is successfully running on PORT: '${port}'`);
});
