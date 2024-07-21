import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();

const upload = multer({ dest: process.env.FUNCTIONS_DIR || "./uploads" });

app.use(express.json());

app.post("/upload", upload.single("function"), async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: "uploaded",
    });
  } catch (err) {
    next(err);
  }
});

app.post("/execute", async (req, res, next) => {
  try {
    // function id
    const { id } = req.body;

    // spin up focker to run the function with the given id
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error("internal server error:", err);
  res.status(500).json({
    success: false,
    message: "internal server error",
  });
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`server running on port ${PORT}`));
