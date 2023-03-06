const express =require('express');
var router = express.Router();

router.post('/',function(req,res) {
    res.send("adslist");
})

module.exports = router;