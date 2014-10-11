var router = require('express').Router();

router.get('/:query', function(req, res, next){
  res.status(200).send(req.params.query);
});

module.exports = router;
