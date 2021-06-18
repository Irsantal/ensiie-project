const { client } = require('./../db');
const passwordHash = require('password-hash');


module.exports.loginHandler = (req, res) => {
  res.render("connection/connection_login.html.twig", {});
}
module.exports.postLoginHandler = (req, res) => {
  let errorMsg = "";
  let id = req.body.id;
  let password = req.body.password;

  if(id !== "" && password !== "") {
    let sqlReq = "SELECT * FROM Utilisateur WHERE identifiant=$1;";
    let values = [id];

    client.query(sqlReq, values, (err, resp) => {
      const result = err ? err.stack : resp.rows;

      if(result === undefined || result[0] == undefined || !passwordHash.verify(password, result[0].mdp))
        res.render("connection/connection_login.html.twig", {error:"Identifiant ou mot de passe incorrect"});
      else{
        req.session.user = result[0].identifiant;
        req.session.password = result[0].mdp;
        req.session.role = result[0].statut;
        res.redirect("/");
      }
    });
  } else
    res.render("connection/connection_login.html.twig", {error:"L'identifiant et le mot de passe doivent être définis"});
}

module.exports.logoutHandler = (req, res) => {
  if(!req.session.user || !req.session.password)
    res.redirect("/login")

  req.session.destroy(function(err) {});
  res.redirect("/")
}
