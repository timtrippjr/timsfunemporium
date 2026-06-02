const express = require('express');
const app = express();

app.use(express.static('public'));
app.set('view engine', 'pug');

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/tictactoe', (req, res) => {
    res.render('tictactoe');
});

const port = 3000;
app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}/`);
});