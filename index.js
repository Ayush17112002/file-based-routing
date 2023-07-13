import express from "express";
import path from "path";
import fs from "fs";
const app = express();
const reg = /\[[a-zA-Z0-9._-]+\]/;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all("/*", async (req, res) => {
  try {
    const paramsObj = {};
    let cp = "./app",
      fileFound = false,
      folderFound = false;
    let fileUrl = req.url.split("/");
    fileUrl.shift();
    if (fileUrl[fileUrl.length - 1].trim() === "") fileUrl.splice(-1, 1);
    for (const name of fileUrl) {
      let found = false,
        params = false;
      let files = fs.readdirSync(cp);
      for (let val of files) {
        let vval = val;
        const file = fs.statSync(cp + `/${vval}`);
        if (file.isFile()) {
          vval = vval.split(".");
          vval.pop();
          vval = vval.join();
        }
        if (!found && name === vval) {
          found = true;
          if (file.isFile()) {
            fileFound = true;
            folderFound = false;
          } else {
            fileFound = false;
            folderFound = true;
          }
          cp += `/${vval}`;
          break;
        }
        if (reg.test(vval)) {
          if (file.isFile()) {
            fileFound = true;
            folderFound = false;
          } else {
            fileFound = false;
            folderFound = true;
          }
          params = vval;
        }
      }
      if (!found) {
        if (params) {
          paramsObj[params.substring(1, params.length - 1)] = name;
          cp += `/${params}`;
        } else {
          throw new Error();
        }
      }
    }

    if (folderFound) {
      const ff = fs.readdirSync(cp);
      if (ff.length > 0 && ff.includes("index.js")) {
        cp += "/index.js";
      } else {
        throw new Error();
      }
    } else {
      cp += ".js";
    }
    const { default: fun } = await import(cp);
    req.params = paramsObj;
    const response = await fun(req, res);

    return res.send(response);
  } catch (err) {
    return res.send("not found");
  }
});

app.listen(3000, (err) => {
  console.log("success");
});
