const { compare } = require('semver');
const { client } = require('./../db');

module.exports.ingredientHandler = (req, res) => {
  if(!req.session.user || !req.session.password)
    res.redirect("/login")
  else {
    var userId = req.session.user;
    var sqlReq = "SELECT DISTINCT Ingredient.nom, Ingredient.unite, Stocker.quantite FROM Ingredient, Stocker WHERE Ingredient.id IN (SELECT id_ingredient FROM Stocker WHERE identifiant_utilisateur=$1) AND Stocker.quantite = (SELECT DISTINCT quantite from Stocker where id_ingredient = Ingredient.id AND identifiant_utilisateur=$1);"
    var sqlReqUnites = "SELECT DISTINCT unite FROM Ingredient;"
    var sqlIngredients = "SELECT nom FROM Ingredient;"

    var sqlIngParam = [req.session.user];
    client.query(sqlReq, sqlIngParam, (err, resp) => {
      client.query(sqlReqUnites, (erru, respu) => {
        client.query(sqlIngredients, (erri, respi) => {  
          var result = err ? err.stack : resp.rows;
          var resultU = erru ? erru.stack : respu.rows;
          var resultI = erri ? erri.stack : respi.rows;

          res.render('ingredient/ingredient_index.html.twig', {login:req.session.user, data:result, unites:resultU, ingredients:JSON.stringify(resultI)});
        });
      });
    });
  }
}

module.exports.postIngredientHandler = (req, res) => {
  if(!req.session.user || !req.session.password)
    res.redirect("/login")

  else {
    var ingredient = req.body.name;
    var sqlExists = "SELECT * FROM Ingredient WHERE nom = $1";
    var value = [ingredient];

    client.query(sqlExists, value, (err, resp) => {
      var result = err ? err.stack : resp.rows;

      var quantity = req.body.quantity;

      if(result.length === 1){ // si l'ingrédient est déjà dans la table Ingredient
        var sqlExistsStocker = "SELECT * FROM Stocker WHERE id_ingredient = (SELECT id FROM Ingredient WHERE nom = $1) AND identifiant_utilisateur = $2";
        value = [ingredient, req.session.user];

        client.query(sqlExistsStocker, value, (err, respStock) => {
        var resultStock = err ? err.stack : respStock.rows;

        if(resultStock.length === 0){ // si l'ingrédient n'existe pas encore dans le frigo
          add_stock(req.session.user, ingredient, quantity);
        }

        else{ // si l'ingrédient existe déjà dans le frigo
          var sqlReq = "UPDATE Stocker SET quantite = (SELECT quantite FROM Stocker WHERE identifiant_utilisateur = $1 AND id_ingredient = (SELECT id FROM Ingredient WHERE nom = $3)) + $2 WHERE identifiant_utilisateur = $1 AND id_ingredient = (SELECT id FROM Ingredient WHERE nom = $3)";
          
          var values = [req.session.user, quantity, ingredient];

          client.query(sqlReq, values, (err, resp) => {
            const result = err ? err.stack : resp.rows[0];
          });
        }
        });
      }

      else{ // si l'ingrédient n'existe pas dans la table Ingrédient
        // ajout dans la table Ingrédient
        var unit = req.body.unite;
        var sqlReq = "INSERT INTO Ingredient(nom, unite) VALUES($1, $2)";
        var value = [ingredient, unit];

        client.query(sqlReq, value, (err, resp) => {
          const result = err ? err.stack : resp.rows[0];
          // ajout dans la table Stocker
          add_stock(req.session.user, ingredient, quantity);
        });
      }

      res.redirect('/ingredient');
    });
  }
}

/*
* La fonction permet d'ajouter un ingrédient au frigo de l'utilisateur.
* @param l'identifiant de l'utilisateur
* @param le nom de l'ingrédient
* @param la quantité que l'utilisateur a
*/
function add_stock(user, ingredient, quantity){
  var sqlReq = "INSERT INTO Stocker(identifiant_utilisateur, id_ingredient, quantite, date_stock) VALUES($1, (SELECT id FROM Ingredient WHERE nom = $2), $3, (SELECT DATE(NOW())))";
  var values = [user, ingredient, quantity];

  client.query(sqlReq, values, (err, resp) => {
    const result = err ? err.stack : resp.rows[0];
  });
}