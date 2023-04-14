//Including Necessary Modules
const express = require('express');
const ejs     = require('ejs');
const expressLayout = require('express-ejs-layouts');
const app = express();

//Setting up port, View engine, custom delimiter (i.e. changing '%' to '?' here!) & using the layout engine
const port = process.env.PORT || 8080;
app.use(expressLayout);
app.use(express.static('public'));
app.set('view engine', 'ejs');
ejs.delimiter = '?';

// calling of pages based on the url
app.get('/', (req, res) => {
    res.render('index', {title: 'BusMe'});
});

app.get('/map', (req, res) => {
    res.render('map', {title: 'maps'});
    // res.render('home', {title: 'Home-Page'});  
});

app.get('/login', (req, res) => {
    res.render('login', {title: 'RTBTS login form'});
});



//listening to the port and running the server on it
app.listen(port, () => {
    console.log(`app is successfully running on PORT: '${port}'`);
});
