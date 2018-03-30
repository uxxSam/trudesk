/*
      .                              .o8                     oooo
   .o8                             "888                     `888
 .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
   888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
   888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
   888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
   "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 ========================================================================
 Created:    02/10/2015
 Author:     Chris Brame

 */

var express = require('express'),
    WebServer = express(),
    winston = require('winston'),
    middleware = require('./middleware'),
    routes = require('./routes'),
    fs = require('fs'),
    port = process.env.PORT || 8118;

var options = {
  key: fs.readFileSync('privateKey.key'),
  cert: fs.readFileSync('certificate.crt')
};

var server = require('https').createServer(options, WebServer);

(function (app) {
    "use strict";

    // Load Events
    require('./emitter/events');

    module.exports.server = server;
    module.exports.init = function(db, callback, p) {
        if (p !== undefined) port = p;
        middleware(app, db, function(middleware, store) {
            module.exports.sessionStore = store;

            routes(app, middleware);

            server.on('error', function(err) {
                if (err.code === 'EADDRINUSE') {
                    winston.error('Address in use, exiting...');
                    server.close();
                } else {
                    winston.error(err.message);
                    throw err;
                }
            });

            server.listen(port, '0.0.0.0', function() {
                winston.info('TruDesk is now listening on port: ' + port);

                callback();
            });
        });
    };

    module.exports.installServer = function(callback) {
        var router          = express.Router(),
            controllers     = require('./controllers/index.js'),
            path            = require('path'),
            hbs             = require('express-hbs'),
            hbsHelpers      = require('./helpers/hbs/helpers'),
            bodyParser      = require('body-parser'),
            favicon         = require('serve-favicon');

        require('./middleware/middleware')(app);

        app.set('views', path.join(__dirname, './views/'));
        app.engine('hbs', hbs.express3({
            defaultLayout: path.join(__dirname, './views/layout/main.hbs'),
            partialsDir: [path.join(__dirname + '/views/partials/')]
        }));
        app.set('view engine', 'hbs');
        hbsHelpers.register(hbs.handlebars);

        app.use(express.static(path.join(__dirname, '../', 'public')));
        app.use(favicon(path.join(__dirname, '../', 'public/img/favicon.ico')));
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());

        router.get('/healthz', function (req, res) { res.status(200).send('OK'); });
        router.get('/install', controllers.install.index);
        router.post('/install', controllers.install.install);
        router.post('/install/mongotest', controllers.install.mongotest);
        router.post('/install/existingdb', controllers.install.existingdb);
        router.post('/install/restart', controllers.install.restart);

        app.use('/', router);

        app.use(function(req, res) {
            return res.redirect('/install');
        });

        require('socket.io')(server);

        if (!server.listening) {
            server.listen(port, '0.0.0.0', function() {
                return callback();
            });
        } else {
            return callback();
        }
    };

})(WebServer);
