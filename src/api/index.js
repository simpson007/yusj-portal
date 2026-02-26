// import axios from "axios";
import fetchJsonp from "fetch-jsonp";

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
 * 天气 - itboy 天气 API
 * 文档: https://www.tianqiapi.com/
 * 使用 itboy 免费天气接口
 */

// 常用城市代码映射表
const CITY_CODE_MAP = {
  "北京": "101010100",
  "上海": "101020100",
  "广州": "101280101",
  "深圳": "101280601",
  "杭州": "101210101",
  "南京": "101190101",
  "成都": "101270101",
  "武汉": "101200101",
  "西安": "101110101",
  "重庆": "101040100",
  "天津": "101030100",
  "苏州": "101190401",
  "郑州": "101180101",
  "长沙": "101250101",
  "青岛": "101120201",
  "大连": "101070201",
  "厦门": "101230201",
  "福州": "101230101",
  "济南": "101120101",
  "沈阳": "101070101",
  "合肥": "101220101",
  "昆明": "101290101",
  "南昌": "101240101",
  "太原": "101100101",
  "南宁": "101300101",
  "贵阳": "101260101",
  "兰州": "101160101",
  "石家庄": "101090101",
  "长春": "101060101",
  "哈尔滨": "101050101",
  "呼和浩特": "101080101",
  "乌鲁木齐": "101130101",
  "拉萨": "101140101",
  "西宁": "101150101",
  "银川": "101170101",
  "海口": "101310101",
  "香港": "101320101",
  "澳门": "101330101",
  "台北": "101340101",
};

// 获取城市代码
const getCityCode = (cityName) => {
  // 尝试精确匹配
  if (CITY_CODE_MAP[cityName]) {
    return CITY_CODE_MAP[cityName];
  }
  // 尝试移除 "市" 后缀匹配
  const cleanName = cityName.replace(/市$/, "");
  if (CITY_CODE_MAP[cleanName]) {
    return CITY_CODE_MAP[cleanName];
  }
  // 默认返回北京
  console.warn(`未找到城市 "${cityName}" 的代码，使用北京作为默认值`);
  return "101010100";
};

// 获取 itboy 天气数据（通过城市代码）
export const getItboyWeather = async (city) => {
  const cityCode = getCityCode(city);
  // 使用 Vite 代理解决 CORS 问题
  const res = await fetch(`/api/weather/city/${cityCode}`);
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
