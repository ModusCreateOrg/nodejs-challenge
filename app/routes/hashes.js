var router = require('express').Router();

router.get('/:query', function(req, res, next){
  res.render('feed', {feedSrc: {type: 'hashes', value: req.params.query}});
});

module.exports = router;
