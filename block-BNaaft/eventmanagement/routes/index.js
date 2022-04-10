var express = require('express');
var router = express.Router();
var Event = require('../models/event');
var Category = require('../models/category');
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/search', (req, res, next) => {
  var query = req.query;
  if (query.fcategory !== '' && query.flocation != '') {
    var filter = {
      $and: [
        { eventCategory: { $in: [query.fcategory] } },
        { location: query.flocation },
      ],
    };
  } else if (query.fcategory === '' && query.flocation != '') {
    var filter = { location: { $in: [query.flocation] } };
  } else if (query.fcategory != '' && query.flocation === '') {
    var filter = { eventCategory: { $in: [query.fcategory] } };
  } else {
    var filter = {};
  }
  if (query.fdate === 'latest') {
    var sortEvent = { start_date: -1 };
  } else {
    var sortEvent = { start_date: 1 };
  }

  Event.find(filter)
    .sort(sortEvent)
    .exec((err, event) => {
      console.log(event);
      if (err) return next(err);
      Event.distinct('location', (err, location) => {
        console.log(location);
        Event.distinct('eventCategory', (err, category) => {
          console.log(category);
          res.render('event', { event, location, category });
        });
      });
    });
});

module.exports = router;
