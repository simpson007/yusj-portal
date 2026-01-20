// import axios from "axios";
import fetchJsonp from "fetch-jsonp";
import { SignJWT, importPKCS8 } from "jose";

/**
 * 音乐播放器
 */

// 获取音乐播放列表
export const getPlayerList = async (server, type, id) => {
  const res = await fetch(
    `${import.meta.env.VITE_SONG_API}?server=${server}&type=${type}&id=${id}`,
  );
  const data = await res.json();

  if (data[0].url.startsWith("@")) {
    // eslint-disable-next-line no-unused-vars
    const [handle, jsonpCallback, jsonpCallbackFunction, url] = data[0].url.split("@").slice(1);
    const jsonpData = await fetchJsonp(url).then((res) => res.json());
    const domain = (
      jsonpData.req_0.data.sip.find((i) => !i.startsWith("http://ws")) ||
      jsonpData.req_0.data.sip[0]
    ).replace("http://", "https://");

    return data.map((v, i) => ({
      name: v.name || v.title,
      artist: v.artist || v.author,
      url: domain + jsonpData.req_0.data.midurlinfo[i].purl,
      cover: v.cover || v.pic,
      lrc: v.lrc,
    }));
  } else {
    return data.map((v) => ({
      name: v.name || v.title,
      artist: v.artist || v.author,
      url: v.url,
      cover: v.cover || v.pic,
      lrc: v.lrc,
    }));
  }
};

/**
 * 一言
 */

// 获取一言数据
export const getHitokoto = async () => {
  const res = await fetch("https://v1.hitokoto.cn");
  return await res.json();
};

/**
 * 天气 - 和风天气 API (JWT 认证)
 * 文档: https://dev.qweather.com/docs/api/
 */

// JWT Token 缓存（避免重复生成）
let cachedJWT = null;
let jwtExpireTime = 0;

// 生成和风天气 JWT Token
const generateQWeatherJWT = async (privateKey, keyId, projectId) => {
  try {
    // 检查缓存的 JWT 是否还有效（提前 60 秒过期以留出余量）
    const now = Math.floor(Date.now() / 1000);
    if (cachedJWT && jwtExpireTime > now + 60) {
      return cachedJWT;
    }

    // 导入私钥
    const key = await importPKCS8(privateKey, "EdDSA");

    // 设置时间（iat 提前 30 秒，exp 设置为 15 分钟后）
    const iat = now - 30;
    const exp = now + 900; // 15 分钟有效期

    // 生成 JWT
    const jwt = await new SignJWT({
      sub: projectId,
      iat: iat,
      exp: exp,
    })
      .setProtectedHeader({
        alg: "EdDSA",
        kid: keyId,
      })
      .sign(key);

    // 缓存 JWT
    cachedJWT = jwt;
    jwtExpireTime = exp;

    return jwt;
  } catch (error) {
    console.error("生成 JWT 失败:", error);
    throw error;
  }
};

// 获取认证头（JWT 或 API Key）
const getAuthHeaders = async () => {
  // 获取私钥并处理换行符（.env 中 \n 是字符串，需要转换为实际换行）
  let privateKey = import.meta.env.VITE_QWEATHER_PRIVATE_KEY;
  console.log("原始私钥:", JSON.stringify(privateKey));
  if (privateKey) {
    // 尝试多种换行符处理方式
    privateKey = privateKey
      .replace(/\\n/g, "\n")  // 处理字面 \n
      .replace(/\\r/g, "\r")  // 处理字面 \r
      .trim();
  }
  console.log("处理后私钥:", JSON.stringify(privateKey));
  const keyId = import.meta.env.VITE_QWEATHER_KEY_ID;
  const projectId = import.meta.env.VITE_QWEATHER_PROJECT_ID;
  const apiKey = import.meta.env.VITE_QWEATHER_API_KEY;

  // 优先使用 JWT 认证
  if (privateKey && keyId && projectId) {
    const jwt = await generateQWeatherJWT(privateKey, keyId, projectId);
    return {
      Authorization: `Bearer ${jwt}`,
    };
  }

  // 降级到 API Key 认证
  if (apiKey) {
    return {
      "X-QW-Api-Key": apiKey,
    };
  }

  throw new Error("未配置和风天气认证信息（JWT 或 API Key）");
};

// 和风天气 - 城市搜索（根据城市名或坐标获取 LocationID）
export const getQWeatherGeo = async (host, location) => {
  const headers = await getAuthHeaders();
  const res = await fetch(
    `https://${host}/geo/v2/city/lookup?location=${encodeURIComponent(location)}&range=cn&number=1`,
    { headers },
  );
  return await res.json();
};

// 和风天气 - 实时天气
export const getQWeatherNow = async (host, locationId) => {
  const headers = await getAuthHeaders();
  const res = await fetch(
    `https://${host}/v7/weather/now?location=${locationId}`,
    { headers },
  );
  return await res.json();
};

/**
 * 天气 - 备用 API
 */

// 获取 wttr.in 天气 API（免费，支持 IP 自动定位，作为备用）
export const getWttrWeather = async () => {
  const res = await fetch("https://wttr.in/?format=j1&lang=zh");
  return await res.json();
};

/**
 * 天气缓存工具
 */

const WEATHER_CACHE_KEY = "weather_cache";

// 获取缓存的天气数据
export const getCachedWeather = () => {
  try {
    const cached = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp, expireMinutes } = JSON.parse(cached);
    const now = Date.now();
    const expireTime = timestamp + expireMinutes * 60 * 1000;

    // 检查缓存是否过期
    if (now > expireTime) {
      localStorage.removeItem(WEATHER_CACHE_KEY);
      return null;
    }

    return data;
  } catch (error) {
    console.error("读取天气缓存失败:", error);
    return null;
  }
};

// 设置天气缓存
export const setCachedWeather = (data, expireMinutes = 30) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
      expireMinutes,
    };
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error("设置天气缓存失败:", error);
  }
};
