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
const mongoClient = new MongoClient("mongodb://127.0.0.1:27017/batePapoUol?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.8.0");
mongoClient
  .connect()
  .then(() => {
    db = mongoClient.db();
  })
  .catch((err) => console.log(err.message));

app.post("/participants", async (req, res) => {
  try {
    const { nome } = req.body;

    const customerSchema = joi.object({
        nome:joi.string().required()
    });

    const validate = customerSchema.validate(req.body);
    if (validate.error) return res.sendStatus(422);

    const resposta = await db.collection("participants").findOne({nome:nome}).toArray()
    console.log(resposta)
    if (resposta) return res.sendStatus(409)
    await db.collection("participants").insertOne({nome:nome, lastStatus:Date.now()});
    return res.sendStatus(201);
  
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
  
  const messages = req.body

  const messagesSchema = joi.object({
    to: joi.string().required(),
    text: joi.string().required(),
    type: joi.string().required()
  })
  
  const { to, text, type } = req.body;

  try {
    await db.collection("messages").insertOne({});
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/messages", (req, res) => {
  res.send("oi");
});

app.delete("/messages/:id"),
  async (req, res) => {
    const { id } = req.params;

    try {
      const result = await db
        .colletion("messages")
        .deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0)
        return res.status(404).send("Item não existe");
      res.status(204).send("deletado");
    } catch (err) {
      res.status(500).send(err);
    }
  };

app.delete("/messages/:id"),
  async (req, res) => {
    const { id } = req.params;

    try {
      const result = await db
        .colletion("messages")
        .deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0)
        return res.status(404).send("Item não existe");
      res.status(204).send("deletado");
    } catch (err) {
      res.status(500).send(err);
    }
  };

app.post("/status", (req, res) => {
  req.header({user})
  //if(isHeader){
  res.send("");
  //} else {
  // res.sendStatus(404)
  //}
  lastStatus = Date.now();
});

app.listen(5000);
