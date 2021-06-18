const { client } = require('./../db');

module.exports.adminPageHandler = (req, res) => {
    if(!req.session.user || !req.session.password || req.session.role !=2)
        res.redirect("/")
    else {
          var tousLesUtilisateurs = 'SELECT * FROM utilisateur';
          client.query (tousLesUtilisateurs, (err, resp) => {
              utilResult = err ? err.stack : resp.rows;
              res.render("admin/admin.html.twig", {login: req.session.user,utilisateurs: utilResult, isAdmin: (req.session.role ==2)});
          });
    }
};

module.exports.changeRights = (req, res) => {
    if(!req.session.user || !req.session.password || req.session.role !=2)
        res.redirect("/");
    else {
        let newRights = 'UPDATE utilisateur SET statut=$1 WHERE identifiant=$2';
        let values = [req.body.role, req.body.utilisateurid];
        client.query (newRights, values, (err, resp) => {
            let result = err ? err.stack : resp.rows;
            res.redirect('/admin');
        });
    }
};

module.exports.ban = (req, res) => {
    if(!req.session.user || !req.session.password || req.session.role !=2)
        res.redirect("/");
    else {
        let banReq = 'DELETE FROM utilisateur WHERE identifiant=$1';
        let values = [req.body.utilisateurid];
        client.query (banReq, values, (err, resp) => {
            let result = err ? err.stack : resp.rows;
             res.redirect("/admin");
        });
    }
};
