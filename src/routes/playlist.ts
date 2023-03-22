import "dotenv/config";
import { Router } from "express";
import { getPlayList } from "../utils/getytplaylist";

const checklist = /^(?:https?:\/?\/?)?(?:m\.|www\.|music\.)?(?:youtu\.be\/|youtube\.com\/(?:playlist\?list=))((\w|-).+)(?:\S+)?$/;
const def = "https://music.youtube.com/playlist?list=";

export default Router().get("/playlist", async (req, res) => {
  const domain = `${req.protocol}://${req.headers.host}`;
  const url: string | undefined = req.query.url ? (req.query.url as string).trim() : undefined;
  let page: number | undefined = req.query.page ? Number((req.query.page as string).trim()) || 1 : 1;
  let count: number | undefined = req.query.count ? Number((req.query.count as string).trim()) || 10 : 10;
  if (!url) return res.status(300).json({ err: "not found url" });
  var check = url.match(checklist);
  if (!check || !check[1]) check = `${def}${url}`.match(checklist);
  if (!check || !check[1]) return res.status(300).json({ err: "not the url of youtube playlist or youtube music playlist" });
  const { name, list, err } = await getPlayList(check[1]);
  if (err || !list || !name) return res.status(300).json({ err: err || "cannot find playlist" });
  if (count < 1) count = 1;
  if (page < 1) page = 1;
  let maxPage = Math.floor(list.length/count) + ((list.length%count) > 0 ? 1 : 0);
  if (page > maxPage) page = maxPage;
  let first = (page-1)*count;
  if (first < 0) first = 0;
  const lists = list.slice(first, page*count).map((v, i) => {
    let num = first+i+1;
    let zero = "";
    if (num.toString().length < list.length.toString().length) for (let i=0; i<list.length.toString().length-1; i++) zero += "0";
    return `<div class="video"><h3>${zero+num}. [${v.duration}] ${v.author} - ${v.title}</h3><div class="embed"><iframe src="https://www.youtube.com/embed/${v.url}" frameborder="0" width="device-width" height="auto" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; controls" allowfullscreen></iframe></div></div>`;
  });
  return res.status(200).render("playlist", {
    title: `playlist - ${name} - ${page}/${maxPage}`,
    name: name,
    lists: lists.join("\n"),
    length: list.length,
    count: count,
    getorigin: domain,
    url: check[1],
    page: page,
    maxPage: maxPage,
    before: page-1 < 1 ? 1 : page-1,
    next: page+1 > maxPage ? maxPage : page+1,
    cantBefore: page-1 < 1,
    cantNext: page+1 > maxPage
  });
});
