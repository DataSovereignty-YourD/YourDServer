const express = require("express");
const cors = require('cors');
    
const bodyParser = require('body-parser');
const UserAssetsModel = require("../models/UserAssets.model");
var router =  express.Router();
router.use(cors());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.get('/', cors(), (req,res)=> {
    res.send("cors!")
})

router.post("/check", async function(req,res){
//     console.log(JSON.stringify(req.body.Account));
   const account = JSON.stringify(req.body.Account).split("\"")[1];
   const exist = await UserAssetsModel.findOne({ User: account });
   console.log("exist", exist);
   if( exist === null) res.send("Not Exist");
    else res.send("Checked");
})

router.post("/create", async function(req,res) {
    const account = JSON.stringify(req.body.Account).split("\"")[1];
    console.log(account, "create");
    UserAssetsModel({
        User: account,
        Asset: []
    }).save().then((result)=> console.log(result));
    res.send("create Account");
})


module.exports = router;