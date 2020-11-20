const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();

const rawdata = fs.readFileSync(__dirname + "/js/json/data.json");
const games = JSON.parse(rawdata);
const games_ids = games.map(d => d.id);

app.use('/static', express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded( {
    extended: true
}));

app.use(cookieParser());

const another = require('./public/main');
const AGE = 1000 * 60 * 2;

const {
    NODE_ENV = "development",
    SESS_NAME = 'sid',
    SESS_SECRET = 'ssh!quiet,it\'asecret!',
    SESS_LIFETIME = 1000 * 60 * 60 * 2
} = process.env;

const IN_PROD = NODE_ENV === 'production';

const users = [
    { id: 1, name: 'Motanu', email: 'motanu@gmail.com', password: 'cine'},
    { id: 2, name: 'Rares', email: 'rares@gmail.com', password: 'cristea'},
    { id: 3, name: 'Paun', email: 'compilator@gmail.com', password: 'colocviumisto'}
]

app.use(session({
    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie: {
        maxAge: SESS_LIFETIME,
        sameSite: true,
        secure: IN_PROD
    }
}));

const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/login');
    } else {
        next();
    }
}

const redirectHome = (req, res, next) => {
    if (req.session.userId) {
        res.redirect('/');
    } else {
        next();
    }
}

app.get('/', (req, res) => {

    const { userId } = req.session;

    let gamearray = [];
    let indexarray = [];
    //console.log(games_ids);
    for (var i = 0; i < 15; i++) {

        let random_index = Math.floor(Math.random() * games_ids.length);
        
        if (indexarray.find(e => e == random_index)) { i = i - 1; } else {
            let game = games.find(c => c.id === games_ids[random_index]);
            indexarray.push(random_index);
            gamearray.push(game);
        }

    }

    res.render("index", {gamearray: gamearray});
});

app.get('/login', (req, res) => {
    if (!req.cookies.loginattempts) {
        res.cookie("loginattempts", 3, { maxAge: AGE });
        res.cookie("logindatecreated", Date.now(), { maxAge: AGE });
        res.render("login", {attempts: 3});
    } else {
        res.render("login", {attempts: req.cookies.loginattempts, date: Math.ceil((req.cookies.logindatecreated - Date.now() + AGE) / 1000)});
    }
});

app.post('/login', redirectHome, (req, res) => {
    
    const { username, password } = req.body;
    
    if (username && password) {

        numberOfAttempts = req.cookies.loginattempts;
        if (numberOfAttempts && numberOfAttempts > 0) {
            const user = users.find(
                user => user.name === username && user.password === password
            );
            
            if (user) {
                req.session.userId = user.id;
                res.cookie("loginattempts", 1, { maxAge: 1 });
                return res.redirect('/');
            }
            res.cookie("loginattempts", numberOfAttempts - 1, { maxAge: AGE - (Date.now() - req.cookies.logindatecreated)});
        }
    }

    res.redirect('/login');
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname + '/register.html'));
});

app.post('/register', redirectHome, (req, res) => {
    const { username, email, password } = req.body;

    if (username && email && password) {
        const exists = users.some(
            user => user.email === email
        );

        if (!exists) {
            const user = {
                id: users.length + 1,
                username,
                email,
                password
            }

            users.push(user);
            req.session.userId = user.id;
            return res.redirect('/');
        }
    }

    res.redirect('/register');

});

app.get('/logout', (req, res) => {
    res.sendFile(path.join(__dirname + '/logout.html'));
});

app.post('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');
        }

        res.clearCookie(SESS_NAME);
        res.redirect('/login');
    });
});


app.get('/games/', (req, res) => {
    res.redirect('/');
});

app.get('/games/:id', (req, res) => {
    const game = games.find(c => c.id === req.params.id);

    if (!game) {
        res.status(404);
        fs.readFile(__dirname + "/pagenotfound.html", "UTF-8", function(err, data) {
            if (err)
                return console.log(err);
    
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(data);
        });
    } else {

        let recgames = [];
        let recindexarray = [];

        for (var i = 0; i < 4; i++) {
            let random_index = Math.floor(Math.random() * games_ids.length);     
            if (recindexarray.find(e => e == random_index)) { i = i - 1; } else {
                let game = games.find(c => c.id === games_ids[random_index]);
                recindexarray.push(random_index);
                recgames.push(game);
            }
        }

        res.render('product', {
            id: game['id'],
            name: game['name'],
            dev: game['dev'],
            desc: game['desc'],
            price: game['price'],
            recommended: recgames
        });
    }
})

app.get('/account', (req, res) => {
    if (!req.session.userId){
        res.redirect("/login");
    } else {
        res.redirect("/logout");
    }
    
})

app.get('/faq', (req, res) => {
    res.sendFile(path.join(__dirname + '/faq.html'));
})

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname + '/cart.html'));
})

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname + '/contact.html'));
})

app.use((req, res, next) => {
    fs.readFile(__dirname + "/pagenotfound.html", "UTF-8", function(err, data) {
        if (err)
            return console.log(err);

        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data);
    });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Listening on port ${port}`));