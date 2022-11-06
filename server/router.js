const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/getVideos', mid.requiresLogin, controllers.Video.getVideos);
  app.get('/getAllVideos', controllers.Video.getAllVideos);
  app.get('/getData', controllers.Character.getData);
  app.get('/search', controllers.Video.searchVideos);
  app.post('/sendReport', controllers.Account.sendReport);
  app.post('/passChange', mid.requiresLogin, controllers.Account.passChange);
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/main', mid.requiresLogin, controllers.Video.mainPage);
  app.post('/main', mid.requiresLogin, controllers.Video.make);
  app.get('/main*', mid.requiresLogin, controllers.Video.mainPage);
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);

  app.get('/*', controllers.Account.loginPage);
};

module.exports = router;
