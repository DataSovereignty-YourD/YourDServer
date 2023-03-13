const express =require('express');
var router = express.Router();
const cors = require('cors');
const path = require("path");
const bodyParser = require('body-parser');
router.use(cors());
const fs = require('fs')
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
const snarkjs = require("snarkjs");
const UserAdsModel = require("../models/UserAds.model");


router.post('/',cors(), async function(req,res) {
    if(req.body !== null) {
        const src = path.join(__dirname,"../public/verification_key.json");
        let verificationkey; 
        fs.readFile(src,async (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            verificationkey = JSON.parse(data);
            const publicSignals= JSON.parse(req.body.publicSignals);
            const proof = JSON.parse(req.body.proof);
            const result = await snarkjs.groth16.verify(verificationkey, publicSignals, proof);
            console.log(result);
            console.log(req.body.AdsCid);
            if( result.toString() === "true" ) {
                UserAdsModel.find({AdsCid: req.body.AdsCid }).then((ads) => {
                    console.log(ads)
                    res.status(200).send(ads);
                })
            }
        })
    }else {

    }
    //verify true값만 보내도록 해야 됨.
    
    //mongodb
    
    
})


module.exports = router;