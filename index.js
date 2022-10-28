import express from "express";
import path from "path";

const PORT = 7777;
const app = express();
const __dirname = path.resolve();

app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, '/src')));
app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (req, res) => {
    res.send('index.html');
});

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});
