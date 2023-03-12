const express =require('express');
var proof = express.Router();
const cors = require('cors')
proof.get('/', cors(), (req,res)=> {
    res.send("cors!")
})

proof.post('/',function(req,res) {
    //mongodb
    console.log("proof");
    res.send("proof");
})


module.exports = proof;