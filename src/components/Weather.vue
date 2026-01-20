<template>
  <div class="weather" v-if="weatherData.adCode.city && weatherData.weather.weather">
    <span>{{ weatherData.adCode.city }}&nbsp;</span>
    <span>{{ weatherData.weather.weather }}&nbsp;</span>
    <span>{{ weatherData.weather.temperature }}℃</span>
    <span class="sm-hidden">
      &nbsp;{{
        weatherData.weather.winddirection?.endsWith("风")
          ? weatherData.weather.winddirection
          : weatherData.weather.winddirection + "风"
      }}&nbsp;
    </span>
    <span class="sm-hidden">{{ weatherData.weather.windpower }}&nbsp;级</span>
  </div>
  <div class="weather" v-else>
    <span>天气数据获取中...</span>
  </div>
</template>

<script setup>
import {
  getQWeatherGeo,
  getQWeatherNow,
  getWttrWeather,
  getCachedWeather,
  setCachedWeather,
} from "@/api";
import { Error } from "@icon-park/vue-next";

// 和风天气配置
const qweatherHost = import.meta.env.VITE_QWEATHER_HOST;
// 检查是否配置了认证信息（JWT 或 API Key）
const hasJWTConfig =
  import.meta.env.VITE_QWEATHER_PRIVATE_KEY &&
  import.meta.env.VITE_QWEATHER_KEY_ID &&
  import.meta.env.VITE_QWEATHER_PROJECT_ID;
const hasAPIKeyConfig = import.meta.env.VITE_QWEATHER_API_KEY;
const hasQWeatherConfig = qweatherHost && (hasJWTConfig || hasAPIKeyConfig);

// 调试日志：显示配置状态
console.log("=== 和风天气配置检测 ===");
console.log("VITE_QWEATHER_HOST:", qweatherHost ? "✅ 已配置" : "❌ 未配置");
console.log("VITE_QWEATHER_PRIVATE_KEY:", import.meta.env.VITE_QWEATHER_PRIVATE_KEY ? "✅ 已配置" : "❌ 未配置");
console.log("VITE_QWEATHER_KEY_ID:", import.meta.env.VITE_QWEATHER_KEY_ID ? "✅ 已配置" : "❌ 未配置");
console.log("VITE_QWEATHER_PROJECT_ID:", import.meta.env.VITE_QWEATHER_PROJECT_ID ? "✅ 已配置" : "❌ 未配置");
console.log("VITE_QWEATHER_API_KEY:", import.meta.env.VITE_QWEATHER_API_KEY ? "✅ 已配置" : "❌ 未配置");
console.log("JWT认证可用:", hasJWTConfig ? "✅" : "❌");
console.log("API Key认证可用:", hasAPIKeyConfig ? "✅" : "❌");
console.log("和风天气总体可用:", hasQWeatherConfig ? "✅" : "❌");
console.log("========================");

// 缓存时间（分钟）
const cacheMinutes = parseInt(import.meta.env.VITE_WEATHER_CACHE_MINUTES) || 30;

// 天气数据
const weatherData = reactive({
  adCode: {
    city: null, // 城市
    adcode: null, // 城市编码
  },
  weather: {
    weather: null, // 天气现象
    temperature: null, // 实时气温
    winddirection: null, // 风向描述
    windpower: null, // 风力级别
  },
});

// 获取用户大致位置（通过 IP 定位服务）
const getUserLocation = async () => {
  // 优先使用配置的默认城市
  const defaultCity = import.meta.env.VITE_WEATHER_CITY;
  if (defaultCity) {
    console.log("使用配置的默认城市:", defaultCity);
    return defaultCity;
  }

  try {
    // 使用一个简单的 IP 定位服务获取城市名
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    console.log("IP定位结果:", data.city);
    return data.city || "北京";
  } catch (error) {
    console.warn("IP 定位失败，使用默认城市北京:", error);
    return "北京"; // 默认城市
  }
};

// 使用和风天气 API 获取天气
const fetchQWeather = async () => {
  try {
    // 1. 获取用户位置
    const cityName = await getUserLocation();

    // 2. 通过城市名获取 LocationID
    const geoResult = await getQWeatherGeo(qweatherHost, cityName);
    if (geoResult.code !== "200" || !geoResult.location?.length) {
      throw new Error(`城市搜索失败: ${geoResult.code}`);
    }

    const location = geoResult.location[0];
    const locationId = location.id;

    // 3. 获取实时天气
    const weatherResult = await getQWeatherNow(qweatherHost, locationId);
    if (weatherResult.code !== "200") {
      throw new Error(`天气获取失败: ${weatherResult.code}`);
    }

    const now = weatherResult.now;

    // 4. 组装天气数据
    const data = {
      adCode: {
        city: location.name,
        adcode: locationId,
      },
      weather: {
        weather: now.text,
        temperature: now.temp,
        winddirection: now.windDir,
        windpower: now.windScale,
      },
    };

    return data;
  } catch (error) {
    console.error("和风天气获取失败:", error);
    throw error;
  }
};

// 使用 wttr.in 备用 API 获取天气
const fetchWttrWeather = async () => {
  try {
    const result = await getWttrWeather();
    const current = result.current_condition[0];
    const area = result.nearest_area[0];

    return {
      adCode: {
        city: area.areaName[0].value || "未知地区",
      },
      weather: {
        weather: current.lang_zh[0]?.value || current.weatherDesc[0]?.value,
        temperature: current.temp_C,
        winddirection: current.winddir16Point,
        windpower: Math.round(current.windspeedKmph / 12) || 1, // 转换为风力等级
      },
    };
  } catch (error) {
    console.error("wttr.in 天气获取失败:", error);
    throw error;
  }
};

// 获取天气数据（带缓存）
const getWeatherData = async () => {
  try {
    // 1. 首先检查缓存
    const cached = getCachedWeather();
    if (cached) {
      console.log("使用缓存的天气数据，节省 API 调用");
      weatherData.adCode = cached.adCode;
      weatherData.weather = cached.weather;
      return;
    }

    // 2. 尝试获取新数据
    let data;

    if (hasQWeatherConfig) {
      // 使用和风天气 API
      console.log("使用和风天气 API 获取天气数据", hasJWTConfig ? "(JWT认证)" : "(API Key认证)");
      data = await fetchQWeather();
    } else {
      // 使用备用 API
      console.log("未配置和风天气，使用 wttr.in 备用接口");
      data = await fetchWttrWeather();
    }

    // 3. 更新数据并缓存
    weatherData.adCode = data.adCode;
    weatherData.weather = data.weather;

    // 4. 缓存天气数据
    setCachedWeather(data, cacheMinutes);
    console.log(`天气数据已缓存 ${cacheMinutes} 分钟`);
  } catch (error) {
    console.error("天气信息获取失败:", error);
    onError("天气信息获取失败");
  }
};

// 报错信息
const onError = (message) => {
  ElMessage({
    message,
    icon: h(Error, {
      theme: "filled",
      fill: "#efefef",
    }),
  });
  console.error(message);
};

onMounted(() => {
  // 调用获取天气
  getWeatherData();
});
</script>
