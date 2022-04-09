var express = require('express');
var router = express.Router();
var Remark = require('../models/remark');
var Event = require('../models/event');

router.get('/:id/edit', (req, res) => {
  var id = req.params.id;
  Remark.findById(id, (err, remark) => {
    if (err) return next(err);
    res.render('updateRemark', { remark });
  });
});

router.post('/:id/update', (req, res) => {
  var id = req.params.id;
  Remark.findByIdAndUpdate(id, req.body, (err, updatedRemark) => {
    if (err) return next(err);
    res.redirect('/event/' + updatedRemark.eventId);
  });
});

router.post('/:id', (req, res, next) => {
  console.log('This route is working now');
  var id = req.params.id;
  req.body.eventId = id;
  Remark.create(req.body, (err, remarks) => {
    Event.findByIdAndUpdate(
      id,
      { $push: { remarks: remarks._id } },
      { new: true },
      (err, updatedRemark) => {
        if (err) return next(err);
        res.redirect('/event/' + id);
      }
    );
  });
});

// Delete Route

router.get('/:id/delete', (req, res, next) => {
  var remarkId = req.params.id;
  Remark.findByIdAndDelete(remarkId, (err, remark) => {
    if (err) return next(err);
    res.redirect('/event/' + remark.eventId);
  });
});

// // Like Dislike ROute

router.get('/:id/likes', (req, res, next) => {
  var id = req.params.id;
  console.log(id);
  var like = req.body.likes;
  var counter = like === 'likes' ? 1 : +1;
  Remark.findByIdAndUpdate(id, { $inc: { likes: counter } }, (err, event) => {
    if (err) return next(err);
    res.redirect('/event/' + event.eventId);
  });
});

// Dislike Route

router.get('/:id/dislike', (req, res, next) => {
  var id = req.params.id;
  var dislike = req.body.likes;
  // var counter = dislike === 'likes' ? 1 : -1;
  Remark.findById(id, (err, event) => {
    if (err) return next(err);
    if (event.likes === 0) {
      Remark.findByIdAndUpdate(id, { likes: 0 }, (err, event) => {
        if (err) return next(err);
        res.redirect('/event/' + event.eventId);
      });
    } else {
      Remark.findByIdAndUpdate(id, { $inc: { likes: -1 } }, (err, event) => {
        if (err) return next(err);
        res.redirect('/event/' + event.eventId);
      });
    }
  });
});

module.exports = router;
