const express = require('express');
const session = require('express-session');
const app = express();
const port = 3000;
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
const publicDir = `${__dirname}/..`;
const path = require('path')
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const passwordHash = require('password-hash');
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'history_tests'
});

app.use('/css', express.static(path.resolve(publicDir + '/css')));
app.use('/photo', express.static(path.resolve(publicDir + '/photo')));
app.use('/js', express.static(path.resolve(publicDir + '/js')));

let allPages = ["/login", "/register", "/home", "/test", "/ranking"];
let authPages = ["/home", "/test", "/ranking"];

app.get('/rankings', (req, res) => {
    Query('SELECT * FROM `users` ORDER BY best_score DESC, best_time').then((rows) => {
        let users = [];
        let scores = [];
        let times = [];
        for (i in rows) {
            if (rows[i].best_score == 0 || rows[i].best_time == 0)
                continue;
            users.push(rows[i].username);
            scores.push(rows[i].best_score);
            times.push(rows[i].best_time);
        }
        return res.status(200).send({
            user: users,
            score: scores,
            time: times
        });
    }).catch(() => {
        return res.status(400).send({
            message: "Грешка в базата данни"
        });
    });
})

app.get('/questions', (req, res) => {
    if (!req.session.logged) {
        res.sendFile(path.resolve(publicDir + "/login.html"));
    }
    Query('SELECT * FROM `questions` ORDER BY RAND() LIMIT 10').then((rows) => {
        let q_text = [];
        let q_ans = [];
        let q_expl = [];
        let pos = [];
        for (i in rows) {
            q_text[i] = rows[i].q_text;
            pos[i] = Math.floor(Math.random() * 4);
            q_expl[i] = rows[i].q_expl;
            q_ans[i] = [];
            q_ans[i] = rows[i].q_wans.split(", ");
            q_ans[i].splice(pos[i], 0, rows[i].q_ans);
        }
        let now = new Date();
        req.session.quiz = {};
        req.session.quiz = {
            active: true,
            pos: pos,
            q_expl: q_expl,
            q_text: q_text,
            start: now
        }
        return res.status(200).send({
            q_text: q_text,
            q_ans: q_ans
        });
    }).catch(() => {
        return res.status(400).send({
            message: "Грешка в базата данни"
        });
    });
})

app.get('/favicon.ico', (req, res) => res.status(204));

app.get('*', (req, res) => {
    let page = req.url.split('?')[0];
    if (allPages.includes(page)) {
        if (authPages.includes(page) && !req.session.logged) {
            res.sendFile(path.resolve(publicDir + "/login.html"));
        }
        else {
            res.sendFile(path.resolve(publicDir + page + ".html"));
        }
    } else {
        res.sendFile(path.resolve(publicDir + "/404.html"));
    }
});

app.post('/grade', (req, res) => {
    if (!req.session.logged || !req.session.quiz.active) {
        res.sendFile(path.resolve(publicDir + "/login.html"));
    }
    let score = 0;
    let q_text = [];
    let q_expl = [];
    let start = Date.parse(req.session.quiz.start)
    let end = new Date();
    let time = Math.abs(end - start);
    for (i in req.session.quiz.q_text) {
        if (req.session.quiz.pos[i] == req.body.q_ans[i] && req.body.q_ans[i] != '') {
            score++;
        } else {
            q_text.push(req.session.quiz.q_text[i])
            q_expl.push(req.session.quiz.q_expl[i])
        }
    }
    req.session.quiz.active = false;
    if (score > req.session.score || (score == req.session.score && req.session.time > time)) {
        Query('Update `users` SET `best_score` = ?, `best_time` = ? WHERE `username` = ?', score, time, req.session.username).then(() => {
            req.session.score = score;
            req.session.time = time;
            return res.status(200).send({
                score: score,
                q_text: q_text,
                q_expl: q_expl
            });
        }).catch(() => {
            return res.status(400).send({
                message: "Грешка в базата данни"
            });
        });
    }
    return res.status(200).send({
        score: score,
        q_text: q_text,
        q_expl: q_expl
    });
})

app.post('/login', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    Query('SELECT * FROM users WHERE username = ?', username).then((rows) => {
        let obj = rows[0];
        if (!obj)
            return res.status(400).send({
                message: `${username} не е регистриран потребител!`
            });
        if (passwordHash.verify(password, obj.password)) {
            req.session.logged = true;
            req.session.username = obj.username;
            req.session.score = obj.best_score ? obj.best_score : "";
            req.session.time = obj.best_time ? obj.best_time : "";
            return res.status(200).send({
                message: "Успех!"
            });
        } else
            return res.status(400).send({
                message: "Грешна парола!"
            });
    }).catch(() => {
        return res.status(400).send({
            message: "Грешка в базата данни"
        });
    });
})

app.post('/register', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let password2 = req.body.password2;
    if (username.length < 6 || username.length > 32)
        return res.status(400).send({
            message: 'Потребителското име трябва да е между 6 и 32 символа!'
        });
    if (password.length < 6 || password.length > 32)
        return res.status(400).send({
            message: 'Паролата трябва да е между 6 и 32 символа!'
        });
    if (password !== password2)
        return res.status(400).send({
            message: 'Паролите не са еднакви!'
        });
    Query('SELECT * FROM users WHERE username = ?', username).then((rows) => {
        if (rows && rows.length)
            return res.status(400).send({
                message: 'Потребителското име е заето!'
            });
    }).catch(() => {
        return res.status(400).send({
            message: "Грешка в базата данни"
        });
    });
    password = passwordHash.generate(password);
    Query('INSERT INTO `users` (`username`, `password`) VALUES (?, ?);', username, password).then(() => {

        return res.status(200).send({
            message: 'Успех!'
        });
    }).catch(() => {
        return res.status(400).send({
            message: "Грешка в базата данни"
        });
    });
})

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(400).send({
                message: err
            });
        }
        return res.status(200).send({
            message: "Logout"
        });
    });
})



function Query(query, ...args) {
    return new Promise((resolve, reject) => {
        connection.query(query, args, function (err, rows) {
            if (err) reject(err);

            resolve(rows);
        });
    });
}

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});