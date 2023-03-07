import "dotenv/config";
import { Router } from "express";
import ytsr from "ytsr";
import { HttpsProxyAgent } from "https-proxy-agent";
import { getytmusic } from "../utils/getytmusic";

export const agent = new HttpsProxyAgent(process.env.PROXY || "");

export default Router().get("/ytsr", async (req, res) => {
  try {
    const checkhtml: string | undefined = req.query.html && typeof(req.query.html) == "string" ? req.query.html.trim() : undefined;
    const text: string | undefined = req.query.text ? (req.query.text as string).trim() : undefined;
    if (!text || text.length == 0) return res.status(300).json({ vid: null, err: "not found text" });
    let getvid = await getytmusic(text);
    // console.log(getvid);
    if (getvid[0]) {
      if (checkhtml == "true") return res.status(200).render("index", {
        title: "TEXT로 노래검색",
        list: undefined,
        text: text,
        vid: getvid[0]
      });
      return res.status(200).json({ vid: getvid[0], err: null });
    }
    let list = await ytsr(text, {
      gl: 'KO',
      requestOptions: { agent },
      limit: 1
    });
    if (list && list.items && list.items.length > 0) {
      list.items = list.items.filter((item) => item.type === "video");
      if (list.items.length > 0 && list.items[0].type === "video" && list.items[0].id) {
        if (checkhtml == "true") return res.status(200).render("index", {
          title: "TEXT로 노래검색",
          list: undefined,
          text: text,
          vid: getvid[0]
        });
        return res.status(200).json({ vid: list.items[0].id, err: null });
      }
      return res.status(300).json({ vid: null, err: "검색한 영상을 찾을수 없습니다." });
    }
  } catch {
    return res.status(300).json({ vid: null, err: "text type String" });
  }
});