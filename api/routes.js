const router = require('express').Router();
const schema = require('./schema');

router.post('/api/cryptation', (req, res) => {
  const newMessage = new schema.Message({
    sender: req.body.sender,
    encMessage: req.body.encMessage,
    expiration: req.body.expiration
  });
  newMessage.save((err, data) => {
    if (err) {
      console.log(err);
      res.end();
    } else {
      res.status(201);
      res.send(req.body);
      res.end();
    }
  });
});

router.get('/api/cryptation', (req, res) => {
  schema.Message.find().exec((err, data) => {
    if (err) {
      console.log(err);
      res.end();
    } else {
      res.status(200);
      res.json(data);
      res.end();
    }
  });
});

module.exports = router;
