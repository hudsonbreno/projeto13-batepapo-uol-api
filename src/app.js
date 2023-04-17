import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import dayjs from "dayjs";
import joi from "joi";

const app = express(); //variaveis
const data = dayjs();
const horario = data.format("HH:mm:ss");

app.use(cors());
app.use(express.json());
dotenv.config();

const mongoClient = new MongoClient(process.env.DATABASE_URL);
try {
  await mongoClient.connect();
} catch (err) {
  console.log(err.message);
}

const db = mongoClient.db();

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
      .find({ name: req.body.name })
      .toArray();
    if (resposta.length === 0) {
      participante["lastStatus"] = Date.now();
      await db.collection("participants").insertOne(participante);
      await db.collection("messages").insertOne({
        from: `${req.body.name}`,
        to: "Todos",
        text: "entra na sala...",
        type: "status",
        time: horario,
      });
      res.sendStatus(201);
    } else {
      return res.sendStatus(409);
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
  try {
    const { user } = req.headers;

    const usuario = await db
      .collection("participants")
      .find({ name: `${user}` })
      .toArray();
    if (usuario.length === 0) {
      return res.status(422).send("Não encontrado participante");
    }
    const messages = req.body;

    const messagesSchema = joi.object({
      to: joi.string().required(),
      text: joi.string().required(),
      type: joi.string().required().valid("message", "private_message"),
    });

    const validation = messagesSchema.validate(messages);
    if (validation.error) {
      return res.status(422).send(err.message);
    }
    messages["from"] = user;
    messages["time"] = horario;

    console.log();
    const resposta = await db.collection("messages").insertOne(messages);
    if (resposta) return res.sendStatus(201);
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/messages", async (req, res) => {
  try {
    const { limit } = req.params;
    const { user } = req.headers;

    let messagesExclusiva = [];

    const usuario = await db
      .collection("participants")
      .find({ name: `${user}` })
      .toArray();
    if (usuario.length === 0) {
      return res.status(422).send("Não encontrado o participante");
    }
    const filtro = await db.collection("messages").find().toArray();
    filtro.forEach((element) => {
      if (
        element.to === "Todos" ||
        element.from === user ||
        element.to === user
      ) {
        messagesExclusiva.push(element);
      }
    });
    if (!limit) {
      res.send(messagesExclusiva);
    } else {
      res.send(messagesExclusiva.slice(-limit));
    }
  } catch (err) {
    res.sendStatus(500);
  }
});

app.post("/status", async (req, res) => {
  try {
    const { user } = req.headers;
    const usuario = await db.collection("participants").findOne({ name: user });
    if (!usuario) return res.sendStatus(404);
    const atualizar = await db
      .collection("participants")
      .updateOne(
        { _id: new ObjectId(usuario._id) },
        { $set: { lastStatus: Date.now() } }
      );
    console.log(atualizar);

    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

setInterval(async () => {
  try {
    const participants = await db.collection("participants").find().toArray();

    for (const participant of participants) {
      if (Date.now() - participant.lastStatus > 10000) {
        await db.collection("participants").deleteOne({ _id: new ObjectId(participant._id) });
        await db.collection("messages").insertOne({
          from: participant.name,
          to: "Todos",
          text: "sai da sala...",
          type: "status",
          time: dayjs().format("HH:mm:ss"),
        });
      }
    }
  } catch (error) {
    console.error(error);
  }
}, 15000);

app.listen(5000);
