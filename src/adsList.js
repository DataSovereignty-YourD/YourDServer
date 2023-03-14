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
const ClientAdsListModel = require("../models/ClientAds.model");
const base58 = require("bs58");
const solanaWeb3 = require("@solana/web3.js");
const splToken = require("@solana/spl-token");
const { send } = require('process');
router.post('/',cors(), async function(req,res) {
    console.log(req.body);
    if(req.body !== null) {
        const src = path.join(__dirname,"../public/verification_key.json");
        let verificationkey; 
        fs.readFile(src,async (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            verificationkey = JSON.parse(data);
            let publicSignals= JSON.parse(req.body.publicSignals);
            publicSignals[0] = 1;
            console.log(publicSignals);
            const proof = JSON.parse(req.body.proof);

            snarkjs.groth16.verify(verificationkey, publicSignals, proof).then((result)=> {
                console.log(result);
                if( result === true ) {
                    UserAdsModel.find({AdsCid: req.body.AdsCid }).then((ads) => {
                        console.log(ads)
                        ClientAdsListModel({
                          AdsCid: ads[0].AdsCid[0],
                          User: req.body.Account,
                          Watched: false,
                        })
                          .save()
                          .then((result) => console.log(result));
                    })
                } else console.log("false");
            })
        })
    }
})

router.post('/getads',cors(), function(req,res) {
    console.log("getads");
    if(req.body.Account !== null) {
        ClientAdsListModel.find({User: req.body.Account}).then((List) => {
            UserAdsModel.find({AdsCid: List[0].AdsCid}).then((result) => {
                console.log(result[0]);
                res.status(200).send(result);
            })
        })
    }
})

router.post('/reward',cors(), function(req,res) {
    console.log(req.body.Account);
    console.log(req.body.Reward);
    //transfer

// 발신계정: 2JkjeCG2mKjiCLwah25Dg78yxwQj5XCQEoUAMTTN3mmk
const fromWalletSecretkey = 'Jo6mgLM9qhKPnwK5L46qKuKNt49r6wCwkR2iRSSZfpidFiuLhfx5SCLSxM5ZYduY7gYaVBVMuN7WRNYokgoVT8N';

// 수신계정: 2CFRPpRoxA7bX5udXPdh8denNHeiSUhoy9Qcm6yyLkND
const toWalletSecretkey = '2v2bCmzap4Yo8HAzgujMNL5sGuhmRZmvfh1z1TNzJZE6kb2ysphBCXB9WWfcZooxuo7e4hUKF1w2brC1Spa6tcx9';
const LAMPORTS_PER_SOL = solanaWeb3.LAMPORTS_PER_SOL;
const createConnection = () => {
	return new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("devnet"));
};
const publicKeyFromString = (publicKeyString) => {
	return new solanaWeb3.PublicKey(publicKeyString);
};
const getKeypairFromsecretKeyString = (secretKeyString) => {
    const secretKey = base58.decode(secretKeyString);
	const keypair = solanaWeb3.Keypair.fromSecretKey(secretKey);
    
	// console.log(keypair.publicKey.toString());
	return keypair;
}
const fromWallet = getKeypairFromsecretKeyString(fromWalletSecretkey);
const toWallet = getKeypairFromsecretKeyString(toWalletSecretkey);

const transferCAT = async (tokenAddress, fromWallet, toWallet, amount) => {
	const connection = createConnection();

	const _publicKey = publicKeyFromString(tokenAddress)

	const fromTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
		connection,
		fromWallet,
		_publicKey,
		fromWallet.publicKey
	);

	const toTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
		connection,
		fromWallet,
		_publicKey,
		toWallet.publicKey
	);

	console.log(fromTokenAccount.address, "fromTokenAccount")
	console.log(toTokenAccount.address, "toTokenAccount")

	console.log("before transfer")
	const signature = await splToken.transfer(
		connection,
		fromWallet,
		fromTokenAccount.address,
		toTokenAccount.address,
		fromWallet.publicKey,
		amount * LAMPORTS_PER_SOL
	);

	console.log(signature);
	return signature;
}

transferCAT("GzioiHQv2A6Wx2q9XRt5FwsRTUoTjRmgdSugVXF75qiu", fromWallet, toWallet, req.body.Reward);

})


module.exports = router;



