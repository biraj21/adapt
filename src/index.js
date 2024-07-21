import path from "node:path";

import dotenv from "dotenv";
import express from "express";
import multer from "multer";

dotenv.config();

const app = express();

const functionUploadsDir = process.env.FUNCTIONS_DIR || "./function-uploads";

const upload = multer({ dest: functionUploadsDir });

app.use(express.json());

app.post("/upload", upload.single("function"), async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: "uploaded",
      id: req.file.filename,
    });
  } catch (err) {
    next(err);
  }
});

app.post("/execute", async (req, res, next) => {
  try {
    // function id
    const { id } = req.body;

    const functionFilePath = path.resolve(functionUploadsDir, id);

    // spin up docker container to run the function with the given id

    res.json({
      success: true,
      functionFilePath, // for testing
    });
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
