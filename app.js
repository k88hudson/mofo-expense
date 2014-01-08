var Hapi = require('hapi');
var Habitat = require('habitat');
var hyperquest = require('hyperquest');
var request = require('request');

Habitat.load();

var env = new Habitat();
var config = env.get('APP');
var server = new Hapi.Server('localhost', config.port);

function errorHandler(err) {
  if (err) {
    throw err;
  }
}

server.pack.allow({
  ext: true
}).require('yar', {
  cookieOptions: {
    password: config.secret
  }
}, errorHandler);

server.pack.require('crumb', {
  key: 'csrftoken',
  restful: true
}, errorHandler);


// Angular Pages

var pages = [
  '/',
  '/register',
  '/contact'
].map(function(path) {
  server.route({
    method: 'GET',
    path: path,
    handler: function() {
      var response = new Hapi.response.File('./app/index.html');
      this.reply(response);
    }
  });
});

// Static
server.route({
  method: 'GET',
  path: '/{path*}',
  handler: {
    directory: {
      path: './app',
      listing: false
    }
  }
});

//API
server.route({
  method: 'POST',
  path: '/auth/login',
  handler: function(req) {
    var self = this;
    var data = req.payload;
    data.audience = config.audience;
    request({
      method: 'post',
      url: 'https://verifier.login.persona.org/verify',
      json: data
    }, function(err, response, body) {
      var resp;
      if (body && body.status === 'failure') {
        resp = Hapi.error.forbidden('There was a problem authenticating this token.');
      } else if (body && body.status === 'okay') {
        self.session.set('email', body.email);
        resp = body;
      } else {
        resp = Hapi.error.internal('There was a problem reaching the persona verification server.', err);
      }
      req.reply(resp);
    });
  }
});

server.route({
  method: 'POST',
  path: '/auth/logout',
  handler: function(req) {
    this.session.set('email', '');
  }
});

server.route({
  method: 'GET',
  path: '/currencies',
  handler: function(req) {
    var query = {
      app_id: config.openexchange
    };
    request({
      method: 'get',
      url: 'http://openexchangerates.org/api/latest.json',
      qs: query,
      json: {}
    }, function(err, response, body) {
      var resp;
      if (body && body.rates) {
        resp = body.rates;
      } else {
        resp = Hapi.error.internal('There was a problem retrieving the list of currencies.');
      }
      req.reply(resp);
    });
  }
})


// Start the server
server.start(function() {
  console.log('Server running at '+ server.info.uri);
});
