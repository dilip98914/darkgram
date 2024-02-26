var createError = require('http-errors');
var express = require('express');
const passport = require('passport');
var expressSession = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
var indexRouter = require('./routes/index');
var usersRouter = require('./models/user');

app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: "heyheyehhdd"
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(usersRouter.serializeUser());
passport.deserializeUser(usersRouter.deserializeUser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const cors = require('cors');
app.use(cors())

app.use('/', indexRouter);

// catch 404 and forward to error handler
// error handler
app.use(function (err, req, res, next) {
    console.error(err)
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.listen(8080,()=>{
    console.log('web server running @8080')
})