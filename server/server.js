const express = require('express');
const cors = require('cors');

const app = express()

app.use(cors());
app.use(express.json());

app.get("/player", (req, res) => {
    username = req.query.username;
    region = req.query.region;
    
    res.json({"data": [{username}, {region}, "userThree", "userFour"]})
})

app.listen(3001,() => {
    console.log("Server started at port 3001")
})