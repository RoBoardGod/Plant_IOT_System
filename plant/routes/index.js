
/*
 * GET home page.
 */

exports.index = function (req, res) {
    res.render('index', { title: '86Duino Planter', year: new Date().getFullYear() });
};

exports.about = function (req, res) {
    res.render('about', { title: 'About', year: new Date().getFullYear() });
};

exports.settings = function (req, res) {
    res.render('settings', { title: 'Settings', year: new Date().getFullYear() });
};



