const cookieParser = require('cookie-parser');
const express = require('express');
const morgan = require('morgan');

const {
  loadUsersData,
  loadDiscussionsData,
  saveUsersData,
  saveDiscussionsData,
} = require('./data-operations');
const protect = require('./middleware/auth');

let discussions = loadDiscussionsData();
const users = loadUsersData();
const sessions = {};

const app = express();
app.use(morgan('dev'));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/static/templates/');

app.use(express.static('./static/css/'));
app.use(express.static('./static/js/'));
app.use(express.static('./static/imgs/'));

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  if (req.cookies.sessionId == undefined && req.cookies.email == undefined) {
    res.redirect('/login');
  } else {
    try {
      res.render('home', {
        name: users[req.cookies.email].name,
        email: sessions[req.cookies.sessionId].email,
      });
    } catch (TypeError) {
      res.clearCookie('sessionId');
      res.clearCookie('email');
      res.redirect('/login');
    }
  }
});

app.get('/login', (req, res) => {
  if (req.cookies.sessionId == undefined) {
    res.render('login', { error: null, success: null });
  } else {
    res.redirect('/');
  }
});

app.get('/signup', (req, res) => {
  if (req.cookies.sessionId == undefined) {
    res.render('signup', { error: null });
  } else {
    res.redirect('/');
  }
});

app.post('/login', (req, res) => {
  const user = req.body;
  if (
    user.email &&
    user.email.trim().length &&
    user.password &&
    user.password.trim().length
  ) {
    if (users[user.email]) {
      if (users[user.email].password == user.password) {
        let sessionId = Date.now();
        sessions[sessionId] = { email: user.email };
        // console.log(sessions);
        // users[user.email].sessionId = sessionId;
        res.cookie('sessionId', sessionId);
        res.cookie('email', user.email);
        res.status(200).redirect('/');
      } else {
        res.status(401).render('login', {
          error: 'Invalid Username or Password',
          success: null,
        });
      }
    } else {
      res
        .status(404)
        .render('login', { error: 'User not found', success: null });
    }
  } else {
    res.status(400).render('login', {
      error: 'Incomplete Email or Password Field',
      success: null,
    });
  }
});

app.post('/signup', async (req, res) => {
  const user = req.body;
  if (
    user.name &&
    user.name.trim().length &&
    user.email &&
    user.email.trim().length &&
    user.password &&
    user.password.trim().length
  ) {
    if (!users[user.email]) {
      users[user.email] = {
        name: user.name.toLowerCase(),
        password: user.password,
        starred: '',
      };
      await saveUsersData(users, () => {
        res.status(201).render('login', {
          error: null,
          success: 'User created successfully, please login...',
        });
      });
    } else {
      res.render('login', {
        error: null,
        success: 'User already exists, please login...',
      });
    }
  } else {
    res.status(400).render('signup', {
      error: 'Incomplete Email or Password Field',
    });
  }
});

app.get('/logout', (req, res) => {
  try {
    delete sessions[req.cookies.sessionId];
  } catch (err) {
    console.log(err);
  } finally {
    res.clearCookie('sessionId');
    res.clearCookie('email');
    res.redirect('/login');
  }
});

app.get(
  '/discussions',
  (req, res, next) => {
    protect(sessions, req, res, next);
  },
  (req, res) => {
    res.json({
      discussions: discussions,
      stars: users[sessions[req.cookies.sessionId].email].starred,
    });
  }
);

app.post(
  '/discussion',
  (req, res, next) => {
    protect(sessions, req, res, next);
  },
  async (req, res) => {
    const discussion = req.body;
    discussions[discussion.id] = discussion.data;
    await saveDiscussionsData(discussions, () => {
      res.status(200).end();
    });
  }
);

app.delete(
  '/discussion',
  (req, res, next) => {
    protect(sessions, req, res, next);
  },
  async (req, res) => {
    const discussion = req.body;
    delete discussions[discussion.id];
    await saveDiscussionsData(discussions, () => {
      res.status(204).end();
    });
  }
);

app.post(
  '/starred',
  (req, res, next) => {
    protect(sessions, req, res, next);
  },
  async (req, res) => {
    console.log(req.cookies.sessionId);
    console.log(req.body);
    const obj = req.body;
    if (obj.query == 'add') {
      users[sessions[req.cookies.sessionId].email].starred += obj.id + ';';
      saveUsersData(users, () => res.status(200).end());
    } else if (obj.query == 'remove') {
      users[sessions[req.cookies.sessionId].email].starred = users[
        sessions[req.cookies.sessionId].email
      ].starred.replace(obj.id + ';', '');
      saveUsersData(users, () => res.status(200).end());
    } else {
      res.status(400).end();
    }
  }
);

module.exports = app;

// resolvebtn.addeventisener('click',delquestion)

// function delquestion() {
//   updatedata(get,id,(res)=>{
//     // DOM
//   })
// }

// function updatedata(parma1, callback) {
//   if ('get', id) {

//   }
// .then() {
//   callback(response)
// }

// }
