import express from "express"
import cors from "cors"
import { MongoClient, ObjectId } from "mongodb"
import dotenv from "dotenv"
import dayjs from "dayjs"

const app = express()   //variaveis
const data = dayjs()
const hour = data.format('HH:mm:ss')

app.use(cors())
app.use(express.json())
dotenv.config()
let userName

const mongoClient = new MongoClient(process.env.DATABASE_URL)   //conexão com o banco de dados
try {
    await mongoClient.connect()
} catch (err) {
    console.log(err.message)
}

const db = mongoClient.db()     //coleções do banco
const participants = db.collection("participants")
const messages = db.collection("messages")


app.post("/participants", async (req, res) => {    //Rotas da API

    const { name } = req.body
    if (!name || !isNaN(name)) return res.sendStatus(422)

    try {

        const username = await participants.findOne({ name: name })
        if (username) return res.sendStatus(409)
        userName = name

        await participants.insertOne({
            name: name,
            lastStatus: Date.now()
        })

        await messages.insertOne({
            from: name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: hour
        })
        res.sendStatus(201)
    } catch (err) {
        res.status(500).send(err.message)
    }

})
app.get("/participants", async (req, res) => {
  try {
    const consultar = await db.collection("participants").find().toArray();
    if (consultar) res.send(consultar);
  } catch (err) {
    res.sendStatus(500);
  }
});

app.post("/messages", async (req, res) => {
  try {
    const { user } = req.headers;

    const usuario = await db.collection("participants").find({"name":`${user}`}).toArray()

    if(usuario.length === 0) return res.sendStatus(422)

    const messages = req.body;
  
    const messagesSchema = joi.object({
      to: joi.string().required(),
      text: joi.string().required(),
      type: joi.string().required().valid('message', 'private_message'),
    });
  
    const validation = messagesSchema.validate(messages);
    if (validation.error) {
      return res.sendStatus(422);
    }
  
    const resposta = await db.collection("messages").insertOne(messages);
    if(resposta) return res.sendStatus(201)
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/messages", async (req, res) => {
  try{
    const {user } = req.headers

    const consultar = await db.collection("messages").find().toArray();
    res.send(consultar);
  }
  catch(err){
    res.sendStatus(500)
  }
});

app.post("/status", (req, res) => {
  req.header({ user });
  //if(isHeader){
  res.send("");
  //} else {
  // res.sendStatus(404)
  //}
  lastStatus = Date.now();
});

app.listen(5000);
