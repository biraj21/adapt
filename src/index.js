import { exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

import dotenv from "dotenv";
import express from "express";
import multer from "multer";

dotenv.config();

const execPromisified = promisify(exec);

const dockerfilesDir = process.env.DOCKERFILES || "./dockerfiles";
if (!fs.existsSync(dockerfilesDir)) {
  fs.mkdirSync(dockerfilesDir);
}

const baseDockerfilePath = "./Dockerfile";

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
    if (!fs.existsSync(functionFilePath)) {
      res.status(404).json({
        success: false,
        message: "function not found: did you upload?",
      });
    }

    const newDockerfilePath = path.resolve(dockerfilesDir, id);
    if (!fs.existsSync(newDockerfilePath)) {
      // read the base dockerfile
      const d = await fs.promises.readFile(baseDockerfilePath, "utf-8");

      // then replace "<function file>" in Dockerfile with the function id
      const newDockerfile = d.replace("<function-file-full>", functionFilePath).replace("<function-filename>", id);

      // copy the modified dockerfile
      await fs.promises.writeFile(newDockerfilePath, newDockerfile);

      // now build the docker image for the given function which can the be run
      console.log("building docker image for function", id);
      const { stdout, stderr } = await execPromisified(`sudo docker build -f ${newDockerfilePath} -t ${id} /`);
      console.log("stdout:", stdout);
      console.log("stderr:", stderr);
    }

    // run the docker image in a new container
    console.log("spinning up a new container for docker image for function", id);

    // const executionId = `${id}-${Date.now()}`;
    const { stdout, stderr } = await execPromisified(`sudo docker run ${id}`);
    console.log("stdout:", stdout);
    console.log("stderr:", stderr);

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
