import "dotenv/config";
import { Router } from "express";

export default Router().get("/", async (req, res) => {
  const domain = `${req.protocol}://${req.headers.host}`;
  return res.status(200).render("main", {
    domain: domain
  });
});