var router = require('express').Router();

router.get('/:query', function(req, res, next){
  res.render('feed', {hash: req.params.query});
});

module.exports = router;
