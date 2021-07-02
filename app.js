var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var IgApiClient = require('instagram-private-api');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
var ig = new IgApiClient();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.get('/server', function(req, res) {
  // Example: Liking my own posts
  // login, use access token if possible
  const user = ig.account.login();
  const feed = ig.feed.user(user.pk);
  const firstPage = await userFeed.items();
  // All the feeds are auto-paginated, so you just need to call .items() sequentially to get next page
  const secondPage = await userFeed.items();
  await ig.media.like({
    // Like our first post from first page or first post from second page randomly
    mediaId: sample([myPostsFirstPage[0].id, myPostsSecondPage[0].id]),
    moduleInfo: {
      module_name: 'profile',
      user_id: user.pk,
      username: user.username,
    }
  });
});

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
}

module.exports = app;
