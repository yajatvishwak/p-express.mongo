//importing dependencies 
const express = require('express');
const app = express();
const morgan = require('morgan'); // displaying what knf of request is placed status code in terminal
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


//init functions and dependencies
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//CORS: handling the cors error should always be done before the routes generation
// the client and the servers are on different urls(ports), thus
// this causes trust issues while providing data back and forth
// CORS is the error. To solve this we provide a header in the 
// response saying it is a damn api and ask the server/client not to 
// freak out.
app.use((req, res, next) => {
    res.header('Access-Comtrol-Allow-Origin', '*');  // replace star with a list of sites to limit api use only to those sites
    res.header('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT,PATCH,DELETE,GET,POST');
        return res.status(200).json({});
    }
    next();
});
// database connection

mongoose.Promise = global.Promise; //overriding the mongoose promise to global promise
mongoose.connect('mongodb+srv://yajat:yajat123@learning-hqqeb.mongodb.net/test?retryWrites=true&w=majority',
    {
        reconnectTries: 100,
        reconnectInterval: 500,
        autoReconnect: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: 'test'
    })
    .then(res => console.log("Connected to DB"))
    .catch(err => console.log(err))


// Route generation
const productRoutes = require('./api/routes/products')
const orderRoutes = require('./api/routes/order');
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

//Handling errors (not found urls) 
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

//exporting, syntax
module.exports = app;