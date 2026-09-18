import "dotenv/config";
import e from "express";
import { router } from "./routers/router.js";
import { ZodError } from "zod";
import cors from "cors";

const PORT = process.env.PORT || 3337;
const app = e();

const allowedOrigins = ["http://localhost:5173", process.env.FRONTEND_URL].filter(
  Boolean,
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origem não permitida pelo CORS"));
    },
  }),
);

app.use(e.json());
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));
app.use(router);
app.use((error, req, res, next) => {
  if (error instanceof ZodError) {
    return res
      .status(400)
      .json({ message: "Verifique os dados enviados", issues: error.issues });
  }
  console.error(error);
  res.status(500).json({ message: "Não foi possível concluir a operação" });
});
app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
