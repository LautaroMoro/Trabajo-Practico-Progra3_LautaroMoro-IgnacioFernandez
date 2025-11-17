// ver que partes sirven(como modelo a seguir para completar server.js) y cuales no

import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import products from "./routes/products.js";
import tickets from "./routes/tickets.js";
import { errorHandler } from "./middlewares/error.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({ ok: true, name: "Productos & Tickets API" });
});

app.use("/products", products);
app.use("/tickets", tickets);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});

export default app;