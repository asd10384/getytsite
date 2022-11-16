import { Router } from "express";
import { recommand } from "../utils/recommand";

export default Router().get("/recommand", async (req, res) => {
  try {
    const checkhtml: string | undefined = req.query.html && typeof(req.query.html) == "string" ? req.query.html.trim() : undefined;
    const list: string[] | undefined = req.query.list ? req.query.list as string[] : undefined;
    const vid: string | undefined = req.query.vid ? (req.query.vid as string).trim() : undefined;
    if (!list) return res.status(300).json({ vid: null, err: "리스트 없음" });
    if (!vid || vid.length == 0) return res.status(300).json({ vid: null, err: "not found vid" });
    let getvid = await recommand(list, vid);
    if (getvid[0]) {
      if (checkhtml == "true") return res.status(200).render("index", {
        title: "받은 노래 아이디로 노래추천",
        list: list,
        sendvid: vid,
        vid: getvid[0]
      });
      return res.status(200).json({ vid: getvid[0], err: null });
    }
    return res.status(300).json({ vid: null, err: getvid[1] });
  } catch {
    return res.status(300).json({ vid: null, err: "list type String[], vid type String" });
  }
});