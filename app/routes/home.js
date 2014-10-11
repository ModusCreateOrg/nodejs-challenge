var router = require('express').Router();

router.get('/', function(req, res, next){
  res.render('index');
});

/* Redirect to '/u/' or '/h/' based on whether search string
 * starts with '@' or '#'.
 */
router.get('/search', function(req, res, next){
  var query = req.query.q;
  if(query.match(/^@/))
    res.redirect('/u/' + query.slice(1));
  else if(query.match(/^#/))
    res.redirect('/h/' + query.slice(1));
  else
    res.redirect('/h/' + query);
});

module.exports = router;
