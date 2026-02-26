<template>
  <div class="weather" v-if="weatherData.adCode.city && weatherData.weather.weather">
    <!-- 天气图标 -->
    <div class="weather-icon-wrapper">
      <component :is="weatherIcon" theme="filled" size="24" fill="#efefef" />
    </div>
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
import { getItboyWeather, getCachedWeather, setCachedWeather } from "@/api";
import { 
  Error, 
  Sun, 
  Cloudy, 
  Fog, 
  Lightning, 
  HeavyRain, 
  LightRain, 
  Snowflake,
  CloudyNight
} from "@icon-park/vue-next";

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

// 天气类型到图标的映射
const weatherIconMap = {
  '晴': Sun,
  '多云': Cloudy,
  '阴': CloudyNight,
  '雾': Fog,
  '霾': Fog,
  '雷': Lightning,
  '雷阵雨': Lightning,
  '大雨': HeavyRain,
  '中雨': HeavyRain,
  '小雨': LightRain,
  '阵雨': LightRain,
  '雪': Snowflake,
  '小雪': Snowflake,
  '中雪': Snowflake,
  '大雪': Snowflake,
  '雨夹雪': Snowflake,
};

// 根据天气类型获取对应图标
const weatherIcon = computed(() => {
  const weatherType = weatherData.weather.weather || '';
  console.log("Current weather type:", weatherType); // Debug log
  
  // 精确匹配
  if (weatherIconMap[weatherType]) {
    return weatherIconMap[weatherType];
  }
  
  // 模糊匹配
  for (const [key, icon] of Object.entries(weatherIconMap)) {
    if (weatherType.includes(key)) {
      console.log("Matched icon for:", key);
      return icon;
    }
  }
  
  // 默认返回太阳图标
  return Sun;
});

// 获取默认城市（配置文件中的城市）
const getDefaultCity = () => {
  const defaultCity = import.meta.env.VITE_WEATHER_CITY;
  if (defaultCity) {
    console.log("使用配置的默认城市:", defaultCity);
    return defaultCity;
  }
  return "南京"; // 默认城市
};

// 获取当前地理位置
const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("浏览器不支持地理定位"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      { timeout: 5000, enableHighAccuracy: false }
    );
  });
};

// 通过坐标逆地理编码获取城市名（使用 Nominatim）
const getCityFromCoords = async (lat, lon) => {
  try {
    // 使用 zoom=8 获取城市级别信息（zoom 越小越宏观）
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=8&accept-language=zh`
    );
    const data = await res.json();
    const address = data.address || {};
    
    console.log("Nominatim 返回地址信息:", address);
    
    // 尝试获取城市名，优先级：city > state_district > municipality
    let city = address.city || address.state_district || address.municipality;
    
    // 如果获取到的是"区"结尾的（如"鼓楼区"），说明不是城市级别，需要跳过
    if (city && city.endsWith("区")) {
      console.log(`"${city}" 是区级地名，尝试其他字段...`);
      // 尝试从 display_name 中提取城市名（通常格式：xx区, xx市, xx省, 中国）
      const displayName = data.display_name || "";
      const match = displayName.match(/([^,，]+[市])/);
      if (match) {
        city = match[1].trim().replace(/市$/, "");
        console.log("从 display_name 提取到城市:", city);
      } else {
        // 直辖市处理
        const directCities = ["北京", "上海", "天津", "重庆"];
        const stateName = (address.state || "").replace(/市$/, "");
        if (directCities.includes(stateName)) {
          city = stateName;
        } else {
          city = null; // 无法获取城市名，将回退到 IP 定位
        }
      }
    }
    
    // 最后尝试 town（镇级）
    if (!city) {
      city = address.town;
    }
    
    if (city) {
      // 去除"市"后缀
      const cleanCity = city.replace(/市$/, "");
      // 再次检查是否是区级地名
      if (cleanCity.endsWith("区")) {
        console.warn(`"${cleanCity}" 仍是区级地名，放弃使用`);
        return null;
      }
      console.log("解析到城市名:", cleanCity);
      return cleanCity;
    }
    
    console.warn("无法从地址信息中解析城市名");
    return null;
  } catch (error) {
    console.error("逆地理编码失败:", error);
    return null;
  }
};

// 通过 IP 定位获取城市名（备选方案）
const getCityFromIP = async () => {
  try {
    console.log("尝试 IP 定位...");
    const res = await fetch("http://ip-api.com/json/?lang=zh-CN");
    const data = await res.json();
    
    if (data.status === "success" && data.city) {
      // 去除"市"后缀
      const city = data.city.replace(/市$/, "");
      console.log("IP 定位城市:", city);
      return city;
    }
    return null;
  } catch (error) {
    console.error("IP 定位失败:", error);
    return null;
  }
};

// 获取当前位置的城市名
const getLocationCity = async () => {
  // 1. 首先尝试 GPS 定位
  try {
    console.log("正在获取当前位置 (GPS)...");
    const position = await getCurrentPosition();
    const { latitude, longitude } = position.coords;
    console.log(`GPS 定位成功: ${latitude}, ${longitude}`);
    
    const city = await getCityFromCoords(latitude, longitude);
    if (city) {
      console.log("GPS 定位城市:", city);
      return city;
    }
  } catch (error) {
    console.warn("GPS 定位失败:", error.message);
  }
  
  // 2. GPS 失败，尝试 IP 定位
  try {
    const city = await getCityFromIP();
    if (city) {
      return city;
    }
  } catch (error) {
    console.warn("IP 定位也失败:", error.message);
  }
  
  console.log("所有定位方式都失败，将使用默认城市");
  return null;
};

// 使用 itboy 天气 API 获取天气
const fetchItboyWeather = async (cityName) => {
  try {
    const result = await getItboyWeather(cityName);

    // itboy API 返回格式处理
    // status: 200 表示成功
    // cityInfo: { city, updateTime, ... }
    // data: { wendu, shidu, quality, forecast, ... }
    if (result.status !== 200) {
      throw new Error(result.message || "天气获取失败");
    }

    const forecast = result.data?.forecast?.[0] || {};

    // 组装天气数据
    const data = {
      adCode: {
        city: result.cityInfo?.city?.replace(/市$/, "") || cityName,
        adcode: null,
      },
      weather: {
        weather: forecast.type || "未知",
        temperature: result.data?.wendu || "--",
        winddirection: forecast.fx || "未知",
        windpower: forecast.fl?.replace(/<!\[CDATA\[/, "").replace(/\]\]>/, "").replace(/级/, "") || "--",
      },
    };

    return data;
  } catch (error) {
    console.error("itboy 天气获取失败:", error);
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

    // 2. 尝试获取当前位置城市
    let cityName = await getLocationCity();
    if (!cityName) {
      // 如果获取位置失败，使用默认城市
      cityName = getDefaultCity();
    }

    // 3. 获取天气数据
    console.log(`使用 itboy 天气 API 获取 ${cityName} 的天气数据`);
    const data = await fetchItboyWeather(cityName);

    // 4. 更新数据并缓存
    weatherData.adCode = data.adCode;
    weatherData.weather = data.weather;

    // 5. 缓存天气数据
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

<style lang="scss" scoped>
.weather {
  display: flex;
  align-items: center;
  
  .weather-icon {
    margin-right: 4px;
    display: flex;
    align-items: center;
  }
}
</style>
