import express from "express"
import cors from "cors"

const app = express();
app(cors())

let participantes = []

app.post("participants", (req, res)=>{

})

app.get("participants", (req, res)=>{
    res.send(participantes)
})

app.post("messages", (req, res)=>{
    let novaMensagem = {to:req.body.to , text:req.body.text, type:req.body.type}
    res.send(novaMensagem)
})

app.get("messages", (req, res)=>{
    res.send("oi")
})

app.post("status", (req, res)=>{
    //req.header({user})
    //if(isHeader){
        res.send("")
    //} else {
        // res.sendStatus(404)
    //}
    lastStatus = Date.now()
    
})

app.listen(5000)