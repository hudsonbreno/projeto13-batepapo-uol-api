import express from "express"
import cors from "cors"
import { MongoClient, ObjectId } from "mongodb"
import dotenv from "dotenv"
import dayjs from "dayjs"
import joi from "joi"

const app = express()   //variaveis
const data = dayjs()
const horario = data.format('HH:mm:ss')

app.use(cors())
app.use(express.json())
dotenv.config()

const mongoClient = new MongoClient(process.env.MONGO_URL)
try {
    await mongoClient.connect()
} catch (err) {
    console.log(err.message)
}

const db = mongoClient.db()


app.post("/participants", async (req, res) => {
  try {
     const participante = req.body;

     const customerSchema = joi.object({
       name: joi.string().required(),
     });

    const validate = customerSchema.validate(participante);
    if (validate.error) return res.sendStatus(422);

    const resposta = await db
       .collection("participants")
       .find({name:req.body.name})
       .toArray();
     if(resposta.length ===0){
        participante['lastStatus'] = Date.now()
        await db
        .collection("participants")
        .insertOne(participante);
        await db
        .collection("messages")
        .insertOne(
            { 
            from: `${req.body.name}`,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: horario
            })
       res.sendStatus(201);
     } else{
        return res.sendStatus(409)
     }

  } catch (err) {
    console.log("aqui");
    res.sendStatus(500);
  }
});

app.get("/participants", async (req, res) => {
  try {
    const consultar = await db.collection("participants").find().toArray();
    if (consultar) res.send(consultar);
  } catch (err) {
    res.sendStatus(500);
  }
});


app.listen(5000);
