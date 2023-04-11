import express from "express"
import cors from "cors"

const app = express();
app.use(cors());
app.use(express.json());

let participantes = []

app.post("/participants", (req, res)=>{
    const { name } = req.body
    
    if(name.includes(participantes)){
        res.status(409).send("Esse Usuario ja existe!")
    } else {
        if(name == []){
            res.status(422).send("Necessario informar dados")
        } else {
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