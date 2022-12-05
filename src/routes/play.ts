import "dotenv/config";
import { Router } from "express";

const checkvideo = /^(?:https?:\/\/)?(?:m\.|www\.|music\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
const def = "https://music.youtube.com/watch?v=";

export default Router().get("/play", async (req, res) => {
  const url: string | undefined = req.query.url ? (req.query.url as string).trim() : undefined;
  if (!url) return res.status(300).json({ err: "not found url" });
  var check = url.match(checkvideo);
  if (!check || !check[1]) check = `${def}${url}`.match(checkvideo);
  if (!check || !check[1]) return res.status(300).json({ err: "not the url of youtube or youtube music" });
  return res.status(200).render("play", {
    title: `play - ${check[1]}`,
    vid: check[1]
  });
});