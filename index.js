const express = require('express') 
const app = express()
const cors = require('cors')

const path = require("path");
const port = 8000// react의 기본값은 3000이니까 3000이 아닌 아무 수
    
const bodyParser = require('body-parser')
const UserAdsModel = require("./models/UserAds.model")
const UserAssetsModel = require("./models/UserAssets.model")
const multer = require("multer")
const fs = require('fs')
const pinataSDK = require('@pinata/sdk');
require("dotenv").config();
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({ limit: "10mb",extended: true }))

app.use(
  cors({
    origin: "*",
    methods: "OPTIONS, GET, POST, PUT, DELETE",
    credentials: true,
  })
);
app.use('/adslist',require('./src/adsList'));
app.use('/proof', require('./src/proof'));
app.use('/account', require('./src/account'));

// app.use(function(req, res, next) {
//     res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    // res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    // res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    // res.header("Access-Control-Max-Age","86400");
//     next();
//   });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PINATA_API_JWT=process.env.PINATA_JWT;
const pinata = new pinataSDK({ pinataJWTKey: PINATA_API_JWT});
const mongoose = require('mongoose');

mongoose
  .connect(process.env.MONGODB, {})
  .then(() => console.log("MongoDB conected"))
  .catch((err) => {
    console.log(err);
  });

app.get('/', function(req,res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.set({'access-control-allow-origin': '*'});
    res.send("YourD");
})

//광고 세부 데이터
app.post("/upload", (req,res) => {
    console.log(req.body.Data);
    UserAdsModel({
        User: req.body.Data.User,
        Title : req.body.Data.Title,
        Description: req.body.Data.Description,
        Category:req.body.Data.Category,
        DepositToken:req.body.Data.DepositToken,
        RpP:req.body.Data.RpP,
        Position:req.body.Data.Position,
        AdsCid: req.body.Data.AdsCid,
        StoreLocation: req.body.Data.StoreLocation
    }).save().then(() => {
        return res.status(200).send("업로드 완료");
    }).catch((err)=> {
        console.err(err.masaage);
            return res.status(400).send("업로드 에러");
    })
})

//광고 파일 업로드
const storage = multer.diskStorage({
    destination: "./public/ads/",
    filename: function(req, file, cb) {
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
      cb(null, file.originalname );
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 90000000 }
});

app.post("/adsfile", upload.single("file"), async function(req,res) {
    console.log(req.file);
    try {
        const IpfsHash = await storeFileToIPFS(req.file.originalname,req.body.metadata.toString().split('"',)[3]);
        res.status(200).send(IpfsHash);
    }catch (err) {
        console.log(err);
    }
})

const storeFileToIPFS = async (name,account) => {
    const src = path.join(__dirname,"./public/ads/",name);
    const readableStreamForFile = fs.createReadStream(src);
    const options = {
        pinataMetadata: {
            name: name,
            keyvalues: {
                Account: account,
            }
        },
        pinataOptions: {
            cidVersion: 0
        }
    };
    let IpfsHash;
    await pinata.pinFileToIPFS(readableStreamForFile, options).then((result) => {
        //handle results here
        IpfsHash = result.IpfsHash;
    }).catch((err) => {
        //handle error here
        console.log(err);
        return;
    });
    return IpfsHash;
}

app.post("/getasset", async function (req, res) {
    console.log(req.body);
  let account = JSON.stringify(req.body.Account).split("\"")[1];
  console.log(account, "getasset");
  if (account !==undefined && account !== null && account !=="") {
    const userAssets = await UserAssetsModel.findOne({ User: account });
    if(userAssets === null) res.send([]);
    else res.send(userAssets.Asset);
  }
  else res.send("account error");
});

app.post('/ConeUpdate',async function(req,res ){
    const Cone = req.body.Asset;
    console.log(Cone, "ConeUpdate");
    UserAssetsModel.updateOne(
      { User: req.body.Account },
      { Asset: Cone }).then(
        (err,docs)=> {
            if (err) {
          console.log(err);
        } else console.log("Updated Docs : ", docs);
        }
      );
    res.status(200).send("seceess");
})

app.post('/loadadsinfo', async function(req,res) {
    console.log(req.body, "loadadsinfo");
    const account = JSON.stringify(req.body.Account).toString().split("\"")[1];
    if(!account) res.send(200).send("ConnectWallet");
    else {
        const UserAds = await UserAdsModel.findOne({User: account})
        console.log(UserAds);
        if (!UserAds) {
            // 일치하는 document가 없으면 에러 응답
            return res.send("None");
        }
        else return res.status(200).send(UserAds.Position);
    }
})


app.get('/wasmFile',async function(req,res) {
    res.sendFile(__dirname + '/public/wasmFile.wasm');
})  

app.get('/zkeyFile', async function(req,res) {
    res.sendFile(__dirname + '/public/zkey.zkey');
})

app.post('/proofResult', async function(req,res) {
    try {
        if(req.body !== null)
        res.status(200).send("success!");
    } catch (err) {
        console.log(err);
    }
})


app.listen(port, ()=>{
    console.log(`Connect at http://localhost:${port}`); // '가 아닌 좌측상단의 esc버튼 밑의 `다.
})

