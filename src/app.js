import express from "express"
import cors from "cors"
import { MongoClient } from "mongodb" 

const app = express();
app.use(cors());
app.use(express.json());

let participantes = []


let db
const mongoClient = new MongoClient("mongodb://localhost:27017/bate-papo-uol")
mongoClient.connect()
    .then(() => db = mongoClient.db())
    .catch((err) => console.log(err.message))

app.get("/", (req,res)=>{
    db.collection("teste").find().toArray()
    .then(teste => res.send(teste))
    .catch(err => res.status(500).send(err.message))
})

app.post("/participants", (req, res)=>{
    const { name } = req.body
    
    if(!name.includes(participantes)){
        res.status(409).send("Esse Usuario ja existe!")
    } else {
        if(name == []){
            res.status(422).send("Necessario informar dados")
        } else {
            participantes = {...participantes, name}
            res.status(201).send("Cadastrar participante no MongoDB ,{ name: 'xxx', lastStatus: Date.now() }")
        }
    }
    console.log(name)
    res.send(name)
})

app.get("/participants", (req, res)=>{
    res.send(participantes)
})

app.post("/messages", (req, res)=>{
    const {to, text, type} = req.body
    const {User} = req.header
    
})

app.get("/messages", (req, res)=>{
    res.send("oi")
})

app.post("/status", (req, res)=>{
    //req.header({user})
    //if(isHeader){
        res.send("")
    //} else {
        // res.sendStatus(404)
    //}
    lastStatus = Date.now()
    
})

app.listen(5000)