import "dotenv/config";
import axios from "axios";
import { writeFileSync } from "fs";

const isNum = (n: any) => !isNaN(n);

const key = process.env.B_YOUTUBE_MUSIC_KEY;
const visitorData = process.env.B_YOUTUBE_MUSIC_VISITORDATA;
const authorization = process.env.B_YOUTUBE_MUSIC_AUTHORIZATION;
const cookie = process.env.B_YOUTUBE_MUSIC_COOKIE;
const max = process.env.YOUTUBE_MUSIC_MAX && isNum(process.env.YOUTUBE_MUSIC_MAX) ? Number(process.env.YOUTUBE_MUSIC_MAX) : 2;
const min = 1;

export const recommand = async (recomlist: string[], vid: string, getmax: number | undefined): Promise<[ string, undefined ] | [ undefined, string ]> => {
  if (!key) return [ undefined, "key를 찾을수 없음" ];
  if (!visitorData) return [ undefined, "visitorData를 찾을수 없음" ];
  if (!authorization) return [ undefined, "authorization을 찾을수 없음" ];

  const getplid = await first(vid);
  if (!getplid[0]) return [ undefined, getplid[2] ];
  const getvid = await second(vid, getplid[0], getplid[1], recomlist, getmax);
  if (!getvid[0]) return [ undefined, getvid[1] ];
  // console.log(getvid);
  return [ getvid[0], undefined ];
}

async function first(vid: string) {
  return new Promise<[string | undefined, string, string]>((res, rej) => {
    axios.post(`https://music.youtube.com/youtubei/v1/next?key=${key}&prettyPrint=false`, {
      "enablePersistentPlaylistPanel": true,
      "tunerSettingValue": "AUTOMIX_SETTING_NORMAL",
      // "playlistId": "",
      "videoId": vid,
      // "params": "wAEB8gECeAE%3D",
      "isAudioOnly": true,
      "context": {
        "client": {
          "hl": "ko",
          "gl": "KR",
          "visitorData": `${visitorData}`,
          "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36,gzip(gfe)", "clientName": "WEB_REMIX", "clientVersion": "1.20221019.01.00", "osName": "Windows", "osVersion": "10.0", "originalUrl": `https://music.youtube.com/watch?v=${vid}`, "platform": "DESKTOP", "clientFormFactor": "UNKNOWN_FORM_FACTOR", "configInfo": { "appInstallData": "CO2B5ZoGELiLrgUQntCuBRDpjf4SEP24_RIQ4rmuBRDbyq4FEKjUrgUQmcauBRDp1a4FELKI_hIQ1IOuBRDqyq4FENi-rQU%3D" }, "timeZone": "Asia/Seoul", "browserName": "Chrome", "browserVersion": "106.0.0.0", "acceptHeader": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9", "deviceExperimentId": "CgsxYVFIRmhlc3YxURDtgeWaBg%3D%3D", "screenWidthPoints": 979, "screenHeightPoints": 937, "screenPixelDensity": 1, "screenDensityFloat": 1, "utcOffsetMinutes": 540, "userInterfaceTheme": "USER_INTERFACE_THEME_LIGHT", "musicAppInfo": { "pwaInstallabilityStatus": "PWA_INSTALLABILITY_STATUS_UNKNOWN", "webDisplayMode": "WEB_DISPLAY_MODE_BROWSER", "storeDigitalGoodsApiSupportStatus": { "playStoreDigitalGoodsApiSupportStatus": "DIGITAL_GOODS_API_SUPPORT_STATUS_UNSUPPORTED" } } }, "user": { "lockedSafetyMode": false }, "request": { "useSsl": true, "internalExperimentFlags": [], "consistencyTokenJars": [] }, "clickTracking": { "clickTrackingParams": "CBQQ_20iEwj3ism4iv76AhX2sVYBHV1hAAU=" }, "adSignalsInfo": { "params": [{ "key": "dt", "value": "1666793711229" }, { "key": "flash", "value": "0" }, { "key": "frm", "value": "0" }, { "key": "u_tz", "value": "540" }, { "key": "u_his", "value": "7" }, { "key": "u_h", "value": "1080" }, { "key": "u_w", "value": "1920" }, { "key": "u_ah", "value": "1040" }, { "key": "u_aw", "value": "1920" }, { "key": "u_cd", "value": "24" }, { "key": "bc", "value": "31" }, { "key": "bih", "value": "937" }, { "key": "biw", "value": "979" }, { "key": "brdim", "value": "0,0,0,0,1920,0,1920,1040,979,937" }, { "key": "vis", "value": "1" }, { "key": "wgl", "value": "true" }, { "key": "ca_type", "value": "image" }], "bid": "ANyPxKqW4-6eVI5hNN7XIC2Vt8irIph6tHvmnmm95OX00lU2BsYw-Zba8v3YTqipyQt6ARwvzslBRwDlF44QkDadmHNCBATwtg"
        }
      }
    }, {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
        "authorization": `${authorization}`,
        "origin": "https://music.youtube.com",
        "x-origin": "https://music.youtube.com",
        "referer": `https://music.youtube.com/watch?v=${vid}`,
        "cookie": `${cookie}`,
        'Accept-Encoding': '*'
      },
      responseType: "json"
    }).then(async (res2) => {
      try {
        let d1 = res2.data?.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer?.watchNextTabbedResultsRenderer?.tabs[0]?.tabRenderer?.content?.musicQueueRenderer?.content?.playlistPanelRenderer?.contents;
        if (d1 && d1[0]) {
          let d2 = d1[0].playlistPanelVideoRenderer?.menu?.menuRenderer?.items;
          if (!d2) d2 = d1[0].playlistPanelVideoWrapperRenderer?.primaryRenderer?.playlistPanelVideoRenderer?.menu?.menuRenderer?.items;
          if (d2 && d2[0]) {
            let d3 = d2[0].menuNavigationItemRenderer?.navigationEndpoint?.watchEndpoint?.playlistId;
            let d4 = d2[0].menuNavigationItemRenderer?.navigationEndpoint?.watchEndpoint?.params;
            if (d3) return res([ d3, d4 ? d4 : "wAEB", "" ]);
          }
        }
        return res([ undefined, "", "추천영상을 찾을수없음1" ]);
      } catch {
        return res([ undefined, "", "추천영상을 찾을수없음15" ]);
      }
    }).catch((err) => {
      return res([ undefined, "", "키를 찾을수없음1" ]);
    });
  });
}

async function second(vid: string, plid: string, params: string, recomlist: string[], getmax: number | undefined) {
  return new Promise<[string | undefined, string]>((res, rej) => {
    if (!key) return res([ undefined, "키를 찾을수 없음" ]);
    axios.post(`https://music.youtube.com/youtubei/v1/next?key=${key}&prettyPrint=false`, {
      "enablePersistentPlaylistPanel": true,
      "tunerSettingValue": "AUTOMIX_SETTING_NORMAL",
      "playlistId": plid,
      "videoId": vid,
      "params": params,
      "isAudioOnly": true,
      "context": {
        "client": {
          "hl": "ko",
          "gl": "KR",
          "visitorData": `${visitorData}`,
          "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36,gzip(gfe)", "clientName": "WEB_REMIX", "clientVersion": "1.20221019.01.00", "osName": "Windows", "osVersion": "10.0", "originalUrl": `https://music.youtube.com/watch?v=${vid}`, "platform": "DESKTOP", "clientFormFactor": "UNKNOWN_FORM_FACTOR", "configInfo": { "appInstallData": "CO2B5ZoGELiLrgUQntCuBRDpjf4SEP24_RIQ4rmuBRDbyq4FEKjUrgUQmcauBRDp1a4FELKI_hIQ1IOuBRDqyq4FENi-rQU%3D" }, "timeZone": "Asia/Seoul", "browserName": "Chrome", "browserVersion": "106.0.0.0", "acceptHeader": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9", "deviceExperimentId": "CgsxYVFIRmhlc3YxURDtgeWaBg%3D%3D", "screenWidthPoints": 979, "screenHeightPoints": 937, "screenPixelDensity": 1, "screenDensityFloat": 1, "utcOffsetMinutes": 540, "userInterfaceTheme": "USER_INTERFACE_THEME_LIGHT", "musicAppInfo": { "pwaInstallabilityStatus": "PWA_INSTALLABILITY_STATUS_UNKNOWN", "webDisplayMode": "WEB_DISPLAY_MODE_BROWSER", "storeDigitalGoodsApiSupportStatus": { "playStoreDigitalGoodsApiSupportStatus": "DIGITAL_GOODS_API_SUPPORT_STATUS_UNSUPPORTED" } } }, "user": { "lockedSafetyMode": false }, "request": { "useSsl": true, "internalExperimentFlags": [], "consistencyTokenJars": [] }, "clickTracking": { "clickTrackingParams": "CBQQ_20iEwj3ism4iv76AhX2sVYBHV1hAAU=" }, "adSignalsInfo": { "params": [{ "key": "dt", "value": "1666793711229" }, { "key": "flash", "value": "0" }, { "key": "frm", "value": "0" }, { "key": "u_tz", "value": "540" }, { "key": "u_his", "value": "7" }, { "key": "u_h", "value": "1080" }, { "key": "u_w", "value": "1920" }, { "key": "u_ah", "value": "1040" }, { "key": "u_aw", "value": "1920" }, { "key": "u_cd", "value": "24" }, { "key": "bc", "value": "31" }, { "key": "bih", "value": "937" }, { "key": "biw", "value": "979" }, { "key": "brdim", "value": "0,0,0,0,1920,0,1920,1040,979,937" }, { "key": "vis", "value": "1" }, { "key": "wgl", "value": "true" }, { "key": "ca_type", "value": "image" }], "bid": "ANyPxKqW4-6eVI5hNN7XIC2Vt8irIph6tHvmnmm95OX00lU2BsYw-Zba8v3YTqipyQt6ARwvzslBRwDlF44QkDadmHNCBATwtg"
        }
      }
    }, {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
        "authorization": `${authorization}`,
        "origin": "https://music.youtube.com",
        "x-origin": "https://music.youtube.com",
        "referer": `https://music.youtube.com/watch?v=${vid}`,
        "cookie": `${cookie}`,
        'Accept-Encoding': '*'
      },
      responseType: "json"
    }).then(async (res2) => {
      writeFileSync("test123.ts", "let t = "+JSON.stringify(res2.data, undefined, 2),"utf8");
      try {
        let d1 = res2.data?.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer?.watchNextTabbedResultsRenderer?.tabs[0]?.tabRenderer?.content?.musicQueueRenderer?.content?.playlistPanelRenderer?.contents;
        let getvid: string | undefined = undefined;
        let alr: number[] = [];
        const setmax = getmax ? getmax : max;
        for (let i=1; i<d1.length; i++) {
          let r = i;
          if (r<=setmax) r = Math.floor((Math.random()*(setmax-min))+min);
          if (alr.includes(r)) {
            continue;
          } else {
            alr.push(r);
            if (d1 && d1[r]) {
              let d3 = d1[r].playlistPanelVideoWrapperRenderer?.primaryRenderer?.playlistPanelVideoRenderer?.videoId;
              if (!d3) d3 = d1[r].playlistPanelVideoRenderer?.videoId;
              if (!d3 || recomlist.includes(d3)) continue;
              getvid = d3;
              break;
            }
          }
        }
        if (getvid) return res([ getvid, getvid ? "" : "추천영상을 찾을수없음25" ]);
        return res([ undefined, "추천영상을 찾을수없음2" ]);
      } catch (err) {
        console.log(err);
        return res([ undefined, "추천영상을 찾을수없음21" ]);
      }
    }).catch((err) => {
      // console.log(err);
      return res([ undefined, "키를 찾을수없음2" ]);
    })
  });
}