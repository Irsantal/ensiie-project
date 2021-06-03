const express = require('express');
const session = require('express-session');
const app = express();
const Twig = require('twig');
const { Client } = require('pg');
const path = require('path');
const dotenv = require('dotenv');
const passwordHash = require('password-hash');

const port = 3000;
var twig = Twig.twig;

dotenv.config();

const dbPort = process.env.DB_PORT_EXTERNAL;
const dbuser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

const client = new Client({
  user:dbuser,
  password:dbPassword,
  port:dbPort
});
client.connect();

app.use(express.static('static'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'sessioninit',
  resave: false,
  saveUninitialized: true,
}));


app.get('/', (req, res) => {
  res.render("home/home_index.html.twig", {});
});

app.get('/login', (req, res) => {
  var sqlReq = "SELECT * FROM User;"
  client.query(sqlReq, (err, resp) => {
    const result = err ? err.stack : resp.rows[0];
    res.render("connection/connection_login.html.twig", {});
  });
});

app.get('/register', (req, res) => {
    res.render("connection/connection_register.twig", {});
});

app.get('/ingredient', (req, res) => {
  var sqlReq = "SELECT * FROM Ingredient;"
  var sqlReqUnites = "SELECT DISTINCT unite FROM Ingredient;"
  client.query(sqlReq, (err, resp) => {
    client.query(sqlReqUnites, (erru, respu) => {
      var result = err ? err.stack : resp.rows;
      var resultU = erru ? erru.stack : respu.rows;

      res.render('ingredient/ingredient_index.html.twig', {data:result, unites:resultU});
    });
  });
});

app.get('/recettes', (req, res) => {
  var sqlReq = "SELECT * FROM Ingredient;"
  client.query(sqlReq, (err, resp) => {
    var result = err ? err.stack : resp.rows;
    res.render('recipe/recipe_index.html.twig', {data:result});
  })
});

app.get('/admin', (req, res) => {
  let sqlReq = 'SELECT * FROM utilisateur ORDER BY identifiant ASC';
  client.query(sqlReq, (err, resp) => {
    var result = err ? err.stack : resp.rows;

    res.render('admin/admin.html.twig', {utilisateurs: resp});
  });
});

// Handle 404 - Keep this as a last route
app.use(function(req, res, next) {
  res.status(404);
  res.render('erreur/erreur_404.html.twig');
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
