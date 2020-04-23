const path = require('path')
const fs = require('fs');

// const https = require('https'); 

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const MONGODB_URI = 
`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-xvxzk.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`
const store = new MongoDBStore({ uri:MONGODB_URI, collection:'sessions' });

// const privateKey = fs.readFileSync('server.key');
// const certificate = fs.readFileSync('server.cert');

const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todo');

mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {
    flags:'a'
})

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(helmet());
app.use(morgan('combined', { stream:accessLogStream }))

/* app.use((req,res,next) => {
    console.log(req.session);
    next();
}) */
app.use(session({
    secret: 'my todo secret',
    resave:false,
    saveUninitialized:false,
    store:store
}));
/* app.use((req,res,next) => {
    console.log(req.session);
    next();
}) */

/* app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
}); */
app.use(authRoutes);
app.use('/user', todoRoutes);

app.use((err, req, res, next) => {
    // console.log('app.js errorHandling',err)
    res.status(422).json({error: err.message})
});

mongoose
  .connect(MONGODB_URI,{ useNewUrlParser: true, useUnifiedTopology: true })
  .then( _ => {
    console.log('connected')  
    // https.createServer({ key:privateKey, cert:certificate }, app).listen( process.env.PORT || 4002)})
    // change front fetch http => https
    app.listen( process.env.PORT || 4002)})
  .catch(err => console.log(err));

