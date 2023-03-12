const express =require('express');
var router = express.Router();
const cors = require('cors');
const bodyParser = require('body-parser');
router.use(cors());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
const UserAdsModel = require("../models/UserAds.model");

router.post('/',cors(), async function(req,res) {
    //zkp true값만 보내도록 해야 됨.
    UserAdsModel.find({}).then((ads) => {
        console.log(ads)
        res.status(200).send(ads);
    })
    
    //mongodb
    
    
})


module.exports = router;