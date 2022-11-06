// import libraries
const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const session = require('express-session');
const csrf = require('csurf');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

//const devURL = process.env.MONGODB_URI || 'mongodb://localhost/DFCDatabase';
const prodURL = 'mongodb+srv://heroku_lh6d56zl:root@ignite-boost-cluster.o0f86.mongodb.net/heroku_lh6d56zl?retryWrites=true&w=majority'

// Setup mongoose options to use newer functionality
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: true,
};

mongoose.connect(prodURL, mongooseOptions, (err) => {
  if (err) {
    console.log('Could not connect to database');
    throw err;
  }
});

/* Redis section
let redisURL = {
  hostname: 'redis-14035.c16.us-east-1-2.ec2.cloud.redislabs.com',
  port: '14035',
};

let redisPASS = 'rFxkMbynOR27vXdO5GXs9JX5kd6EzbMF';
if (process.env.REDISCLOUD_URL) {
  redisURL = url.parse(process.env.REDISCLOUD_URL);
  [, redisPASS] = redisURL.auth.split(':');
}
const redisClient = redis.createClient({
  host: redisURL.hostname,
  port: redisURL.port,
  password: redisPASS,
});*/

// Pull in our routes
const router = require('./router');

const app = express();

app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));
app.use(favicon(`${__dirname}/../hosted/img/logo.png`));
app.disable('x-powered-by');
app.use(compression());
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(session({
  key: 'sessionid',
 /* store: new RedisStore({
    client: redisClient,
  }),*/
  secret: 'Stop It Skieup',
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
  },
}));
app.engine('handlebars', expressHandlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/../views`);
app.use(cookieParser());

// csrf must come AFTER app.use(cookieParser());
// should come before router
app.use(csrf());
app.use((err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);

  console.log('Missing CSRF token');
  console.log(err.code)
  return false;
});


router(app);

app.listen(port, (err) => {
  if (err) {
    throw err;
  }
  console.log(`Listening on port ${port}`);
});
