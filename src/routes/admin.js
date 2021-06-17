const { client } = require('./../db');

module.exports.adminPageHandler = (req, res) => {
    if(!req.session.user || !req.session.password)
        res.redirect("/login")
    else {
        let isAdmin = 'SELECT statut FROM utilisateur WHERE identifiant=$1 AND mdp=$2'
        let values = [req.session.user,req.session.password];
        client.query(isAdmin, values, (err, resp) => {
            result = err ? err.stack : resp.rows;
            if (result[0].statut !== 2) {
                console.log(result);
                //res.redirect('/');
            }
            else {
                var tousLesUtilisateurs = 'SELECT * FROM utilisateur';
                client.query (tousLesUtilisateurs, (err, resp) => {
                    utilResult = err ? err.stack : resp.rows;

                    res.render("admin/admin.html.twig", {utilisateurs: utilResult});
                })
            }
        });
    }
};

module.exports.changeRights = (res, req) => {
    if(!req.session.user || !req.session.password)
        res.redirect("/login")
    else {

    }
};
