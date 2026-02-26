<template>
  <div id="loader-wrapper" :class="store.imgLoadStatus ? 'loaded' : null">
    <div class="loader">
      <div class="hexagram-container">
        <!-- 外圈光环 -->
        <svg class="outer-ring" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="95" class="ring-bg" />
          <circle cx="100" cy="100" r="95" class="ring-glow" />
        </svg>
        <!-- 六芒星 SVG -->
        <svg class="hexagram" viewBox="0 0 200 200">
          <!-- 正三角形（朝上） -->
          <polygon
            class="triangle triangle-up"
            points="100,20 175,150 25,150"
          />
          <!-- 倒三角形（朝下） -->
          <polygon
            class="triangle triangle-down"
            points="100,180 25,50 175,50"
          />
          <!-- 中心圆点 -->
          <circle cx="100" cy="100" r="8" class="center-dot" />
        </svg>
      </div>
      <div class="loader-text">
        <span class="name">
          {{ siteName }}
        </span>
        <span class="tip"> 加载中 </span>
      </div>
    </div>
    <div class="loader-section section-left" />
    <div class="loader-section section-right" />
  </div>
</template>

<script setup>
import { mainStore } from "@/store";

const store = mainStore();

// 配置
const siteName = import.meta.env.VITE_SITE_NAME;
</script>

<style lang="scss" scoped>
#loader-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  overflow: hidden;
  .loader {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    .hexagram-container {
      position: relative;
      width: 150px;
      height: 150px;
      z-index: 2;
      
      .outer-ring {
        position: absolute;
        width: 100%;
        height: 100%;
        animation: rotate-ring 8s linear infinite;
        
        .ring-bg {
          fill: none;
          stroke: rgba(255, 255, 255, 0.1);
          stroke-width: 1;
        }
        
        .ring-glow {
          fill: none;
          stroke: rgba(255, 255, 255, 0.6);
          stroke-width: 2;
          stroke-dasharray: 60 540;
          stroke-linecap: round;
          filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.8));
        }
      }
      
      .hexagram {
        position: absolute;
        width: 100%;
        height: 100%;
        animation: pulse 2s ease-in-out infinite;
        
        .triangle {
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 500;
          filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.6));
        }
        
        .triangle-up {
          stroke: rgba(255, 255, 255, 0.9);
          stroke-dashoffset: 500;
          animation: draw-triangle 2s ease-out forwards, glow 2s ease-in-out infinite 2s;
        }
        
        .triangle-down {
          stroke: rgba(200, 180, 140, 0.9);
          stroke-dashoffset: 500;
          animation: draw-triangle 2s ease-out 0.5s forwards, glow 2s ease-in-out infinite 2.5s;
        }
        
        .center-dot {
          fill: rgba(255, 255, 255, 0);
          animation: fade-in-dot 0.5s ease-out 1.5s forwards, pulse-dot 1.5s ease-in-out infinite 2s;
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
        }
      }
    }

    .loader-text {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #fff;
      z-index: 2;
      margin-top: 40px;
      font-size: 24px;
      .tip {
        margin-top: 6px;
        font-size: 18px;
        opacity: 0.6;
      }
    }
  }
  .loader-section {
    position: fixed;
    top: 0;
    width: 51%;
    height: 100%;
    background: #333;
    z-index: 1;
    &.section-left {
      left: 0;
    }
    &.section-right {
      right: 0;
    }
  }
  &.loaded {
    visibility: hidden;
    transform: translateY(-100%);
    transition:
      transform 0.3s 1s ease-out,
      visibility 0.3s 1s ease-out;
    .loader {
      .hexagram-container,
      .loader-text {
        opacity: 0;
        transition: opacity 0.3s ease-out;
      }
    }
    .loader-section {
      &.section-left {
        transform: translateX(-100%);
        transition: transform 0.5s 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      }
      &.section-right {
        transform: translateX(100%);
        transition: transform 0.5s 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      }
    }
  }
}

// 绘制三角形动画
@keyframes draw-triangle {
  0% {
    stroke-dashoffset: 500;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

// 外圈旋转
@keyframes rotate-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 六芒星脉冲
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

// 发光效果
@keyframes glow {
  0%, 100% {
    filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.6));
  }
  50% {
    filter: drop-shadow(0 0 12px rgba(255, 255, 255, 1));
  }
}

// 中心点渐入
@keyframes fade-in-dot {
  0% {
    fill: rgba(255, 255, 255, 0);
    r: 0;
  }
  100% {
    fill: rgba(255, 255, 255, 0.9);
    r: 8;
  }
}

// 中心点脉冲
@keyframes pulse-dot {
  0%, 100% {
    fill: rgba(255, 255, 255, 0.9);
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
  }
  50% {
    fill: rgba(200, 180, 140, 0.9);
    filter: drop-shadow(0 0 15px rgba(200, 180, 140, 1));
  }
}
</style>

