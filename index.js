const bodyParser = require('body-parser')
const express = require('express') 
const app = express()

const path = require("path");
const port = 8080// react의 기본값은 3000이니까 3000이 아닌 아무 수
const cors = require('cors')
const UserAdsModel = require("./models/UserAds.model")
const UserAssetsModel = require("./models/UserAssets.model")
const multer = require("multer")
const fs = require('fs')
const pinataSDK = require('@pinata/sdk');
require("dotenv").config();
app.use('/adsList',require('./adsList'));

let db=[];
const PINATA_API_JWT=process.env.PINATA_JWT;
const pinata = new pinataSDK({ pinataJWTKey: PINATA_API_JWT});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const mongoose = require('mongoose');
const { chownSync } = require('fs');
const { default: axios } = require('axios');
// import 
app.use(cors());
app.use((req, res, next) => {
    // 모든 도메인의 요청을 허용하도록 설정
    res.header('Access-Control-Allow-Origin', '*');
    // 요청 헤더에서 허용할 항목을 설정
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    // 요청 메서드를 설정
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
  });

mongoose.connect(
    process.env.MONGODB,
    {}
).then(()=> console.log("MongoDB conected"))
.catch((err)=> {
    console.log(err);
});

app.get('/', function(req,res) {
    res.send("YourD");
})

//광고 세부 데이터
app.post("/upload", (req,res) => {
    console.log(req.body.Data);
    db.push(req.body.Data);
    UserAdsModel({
        User: req.body.Data.User,
        Title : req.body.Data.Title,
        Description: req.body.Data.Description,
        Category:req.body.Data.Category,
        DepositToken:req.body.Data.DepositToken,
        RpP:req.body.Data.RpP,
        Position:req.body.Data.Position,
        AdsCid: req.body.Data.AdsCid,
    }).save().then(() => {
        return res.status(200).send("업로드 완료");
    }).catch((err)=> {
        console.err(err.masaage);
            return res.status(400).send("업로드 에러");
    })
})

//광고 파일 업로드
const storage = multer.diskStorage({
    destination: "./public/img/",
    filename: function(req, file, cb) {
      cb(null, file.originalname );
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 90000000 }
});

app.post("/adsfile", upload.single("file"), async function(req,res) {
    try {
        const IpfsHash = await storeFileToIPFS(req.file.originalname,req.body.metadata.toString().split('"',)[3]);
        res.status(200).send(IpfsHash);
    }catch (err){
        console.log(err);
    }
})

const storeFileToIPFS = async (name,account) => {
    const src = path.join(__dirname,"./public/img/",name);
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
  const account = req.body[0];
  console.log(account);
  if (!account) {
    const userAssets = await UserAssetsModel.findOne({ User: account });
    if (!userAssets) {
      // 일치하는 document가 없으면 에러 응답
      UserAssetsModel({
        User: account,
        Asset: [],
      })
        .save()
        .then(() => {
          console.log("Stard get Asset but not exist account");
          // res.redirect('/');
          return res.send([]);
        })
        .catch((err) => {
          console.err(err.masaage);
          return res.status(400).send("업로드 에러");
        });
    } else res.send(userAssets.Asset);
  }
});

app.post('/ConeUpdate',async function(req,res ){
    const Cone = req.body.Asset;
    UserAssetsModel.updateOne({User:req.body.Account},{Asset:Cone}, function(err,docs){
        if (err){
            console.log(err)
        }
        else{
            console.log("Updated Docs : ", docs);
        }}
        );
    res.status(200).send("seceess");
})

app.post('/loadAdsInfo', async function(req,res) {
    const account = JSON.stringify(req.body).toString().split("\"")[1];
    console.log(account);
    const UserAds = await UserAdsModel.findOne({User: account})
    console.log(UserAds);
    if (!UserAds) {
        // 일치하는 document가 없으면 에러 응답
        return res.send([]);
    }
    else return res.status(200).send(UserAds.Position);
})


app.get('/wasmFile',async function(req,res) {
    res.sendFile(__dirname + '/public/wasmFile.wasm');
})

app.get('/zkeyFile', async function(req,res) {
    res.sendFile(__dirname + '/public/zkey.zkey');
})



app.listen(8080, ()=>{
    console.log(`Connect at http://localhost:${port}`); // '가 아닌 좌측상단의 esc버튼 밑의 `다.
})

