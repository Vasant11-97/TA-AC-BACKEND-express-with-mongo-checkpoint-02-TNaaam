var express = require('express');
var router = express.Router();

var Event = require('../models/event');
var Category = require('../models/category');
var Remark = require('../models/remark');

var allCategoriesAndData = (req, res, next) => {
  Event.distinct('eventCategory', (err, category) => {
    Event.distinct('location', (err, location) => {
      res.locals.category = category;
      res.locals.location = location;
      next();
    });
  });
};

// Route for adding the new user

router.get('/new', (req, res, next) => {
  res.render('addEvent');
});

// Adding Data from form to Database

router.post('/new', (req, res, next) => {
  req.body.eventCategory = req.body.eventCategory.trim().split(' ');
  Event.create(req.body, (err, event) => {
    if (err) return next(err);
    event.eventCategory.map((e) => {
      Category.create({ name: e }, (err, category) => {
        var categoryId = category._id;
        if (err) return next(err);
        Event.findByIdAndUpdate(
          event._id,
          { $push: { eventCategory_Id: categoryId } },
          { new: true },
          (err, updatedEvent) => {
            if (err) return next(err);
          }
        );
      });
    });
  });
  res.redirect('/event');
});

// Showing Data from database to events

router.get('/', allCategoriesAndData, (req, res, next) => {
  Event.find({}, (err, event) => {
    if (err) return next(err);
    res.render('event', { event: event });
  });
});

// Showing individual event

router.get('/:id', (req, res, next) => {
  var id = req.params.id;
  Event.findById(id)
    .populate('eventCategory')
    .populate('remarks')
    .exec((err, event) => {
      console.log(event.title, 'Vasant');
      event.eventCategory.forEach((c) => {
        console.log(c);
      });
      res.render('eventDetail', { event });
    });
});

// Updating individual event route

router.get('/:id/edit', (req, res, next) => {
  var id = req.params.id;
  Event.findById(id, (err, event) => {
    if (err) return next(err);
    res.render('updateEvent', { event: event });
  });
});

router.post('/:id', (req, res, next) => {
  var id = req.params.id;
  Event.findByIdAndUpdate(id, req.body, (err, updatedEvent) => {
    console.log(updatedEvent);
    if (err) return next(err);
    res.redirect('/event/' + id);
  });
});

// Deleting Event Route

router.get('/:id/delete', (req, res) => {
  var id = req.params.id;
  Event.findByIdAndDelete(id, (err, deletedEvent) => {
    if (err) next(err);
    res.redirect('/event');
  });
});

// Like Dislike Router

router.get('/:id/likes', (req, res, next) => {
  var id = req.params.id;
  var like = req.body.likes;
  var counter = like === 'likes' ? 1 : +1;
  Event.findByIdAndUpdate(id, { $inc: { likes: counter } }, (err, event) => {
    if (err) return next(err);
    res.redirect('/event/' + id);
  });
});

// Dislike Route

router.get('/:id/dislike', (req, res, next) => {
  var id = req.params.id;
  var dislike = req.body.likes;
  Event.findById(id, (err, event) => {
    if (err) return next(err);
    if (event.likes === 0) {
      Event.findByIdAndUpdate(id, { likes: 0 }, (err, event) => {
        if (err) return next(err);
        res.redirect('/event/' + id);
      });
    } else {
      Event.findByIdAndUpdate(id, { $inc: { likes: -1 } }, (err, event) => {
        if (err) return next(err);
        res.redirect('/event/' + id);
      });
    }
  });
});

// Handling Category Routes

router.get('/search', (req, res, next) => {
  var query = req.query;
  console.log(query.categoryname.split(','));
  if (query.fcategory !== '' && query.flocation != '') {
    var filter = {
      $and: [
        { eventCategory: { $in: [query.fcategory] } },
        { location: query.flocation },
      ],
    };
  } else if (query.fcategory === '' && query.flocation != '') {
    var filter = { location: query.location };
  } else if (query.fcategory !== '' && query.flocation === '') {
    var filter = { eventCategory: { $in: [query.fcategory] } };
  } else {
    var filter = {};
  }
  if (query.fdate === 'latest') {
    var sortEvent = { start_date: 1 };
  } else {
    var sortEvent = { start_date: -1 };
  }

  Event.find(filter)
    .sort(sortEvent)
    .exec((err, event) => {
      console.log(event);
      if (err) return next(err);
      Event.distinct('location', (err, location) => {
        console.log(location);
        Event.distinct('category', (err, category) => {
          console.log(category);
          res.render('event', { event, location, category });
        });
      });
    });
});

/* GET users listing. */

module.exports = router;
