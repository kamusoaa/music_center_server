var express = require('express');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var soap = require('soap');
import {myService, wsdl} from "./application/service/service";


var mongoose = require('mongoose');
var dbConfig = require('./application/database/databaseConfig');
mongoose.connect(dbConfig.url);
var app = express();





app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');




app.use(logger('dev'));
app.use(bodyParser.json())
    .use(bodyParser.urlencoded({extended: true}))
    //.use(bodyParser.raw({type:   => true, limit: '15mb'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
    res.header('Access-Control-Allow-Headers', '*');
    next()
})


var passport = require('passport');
var expressSession = require('express-session');
app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());
var flash = require('connect-flash');
app.use(flash());
var initPassport = require('./application/passport/init');
initPassport(passport);
var index = require('./routes/index')(passport);
var users = require('./routes/users');
app.use('/', index);
app.use('/', users);
//app.use('/wsdl',bodyParser.raw({type: () => true, limit: '15mb'}), soap.listen(app, '/wsdl', myService, wsdl));

app.use('/wsdl', bodyParser.raw({type: () => true, limit: '15mb'}));
soap.listen(app, '/wsdl', myService, wsdl);







app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
