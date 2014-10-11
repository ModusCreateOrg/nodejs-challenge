var router = require('express').Router();

router.get('/:screen_name', function(req, res, next){
  res.render('user', {user: req.params.screen_name});
})

module.exports = router;
