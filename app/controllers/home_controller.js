/**
 * Route /
 * --------------------
 */

// Home or index page.
exports.getIndex = function(req, res) {
  res.render('index', {
    title: 'Home'
  });
};
