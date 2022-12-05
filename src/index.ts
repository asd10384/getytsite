import express from "express";
import cors from "cors";
import { readdirSync } from "fs";
import path, { join } from "path";
import favicon from "serve-favicon";

const app = express();

app.use(cors({
  origin: "*"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname + "/ejs"));
app.use(favicon(path.join(__dirname, "image/favicon.ico")));
app.use('/favicon.ico', express.static('/image/favicon.ico'));
app.use('/file', express.static(__dirname + "/"));

const route = readdirSync(join(__dirname, 'routes')).filter(file => file.endsWith('.js') || file.endsWith('.ts'));
route.forEach((file) => {
  app.use(require(join(__dirname, "routes", file.replace(/\.js|\.ts/, ''))).default);
});

app.use((req, res) => {
  return res.status(404).json({ err: "Page Not Found" });
});

const PORT = process.env.PORT || 7777;
app.listen(PORT, () => {
  console.log("사이트: OPEN\nhttp://localhost:"+PORT);
})