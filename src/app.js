import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

let db;
let participants;
const mongoClient = new MongoClient(
  "mongodb://127.0.0.1:27017/batePapoUol?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.8.0"
);
mongoClient
  .connect()
  .then(() => {
    db = mongoClient.db();
  })
  .catch((err) => console.log(err.message));

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

app.post("/messages", async (req, res) => {
  const { user } = req.header;

  const messages = req.body;

  const messagesSchema = joi.object({
    to: joi.string().required(),
    text: joi.string().required(),
    type: joi.string().required(),
  });

  const validation = messagesSchema.validate(messages);
  if (validation.error) {
    return res.sendStatus(422);
  }

  try {
    await db.collection("messages").insertOne(messages);
    res.send(201)
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/messages", async (req, res) => {
  try{
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
