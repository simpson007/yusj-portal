<template>
  <div :class="store.backgroundShow ? 'cover show' : 'cover'">
    <img
      v-show="store.imgLoadStatus"
      :src="bgUrl"
      class="bg"
      alt="cover"
      @load="imgLoadComplete"
      @error.once="imgLoadError"
      @animationend="imgAnimationEnd"
    />
    <div :class="store.backgroundShow ? 'gray hidden' : 'gray'" />
    
    <!-- 切换壁纸按钮 -->
    <Transition name="fade">
      <div 
        class="switch-bg-btn" 
        v-show="store.imgLoadStatus && !store.backgroundShow"
        @click="switchBackground"
        title="切换壁纸"
      >
        <refresh-one theme="outline" size="18" fill="#ffffff80" />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { mainStore } from "@/store";
import { Error, RefreshOne } from "@icon-park/vue-next";

const store = mainStore();
const bgUrl = ref(null);
const currentIndex = ref(0);
const imgTimeout = ref(null);
const emit = defineEmits(["loadComplete"]);

// 自定义背景列表
const bgList = [
  "/images/bg1.png",
  "/images/bg2.png",
  "/images/bg3.png",
  "/images/bg4.png",
  "/images/bg5.png",
  "/images/bg6.png"
];

// 随机选择背景
const changeRandomBg = () => {
  const randomIndex = Math.floor(Math.random() * bgList.length);
  currentIndex.value = randomIndex;
  bgUrl.value = bgList[randomIndex];
};

// 切换到下一张背景
const switchBackground = () => {
  currentIndex.value = (currentIndex.value + 1) % bgList.length;
  bgUrl.value = bgList[currentIndex.value];
  ElMessage({
    message: `壁纸已切换 (${currentIndex.value + 1}/${bgList.length})`,
    grouping: true,
    duration: 1500,
  });
};

// 图片加载完成
const imgLoadComplete = () => {
  imgTimeout.value = setTimeout(
    () => {
      store.setImgLoadStatus(true);
    },
    Math.floor(Math.random() * (600 - 300 + 1)) + 300,
  );
};

// 图片动画完成
const imgAnimationEnd = () => {
  console.log("壁纸加载且动画完成");
  // 加载完成事件
  emit("loadComplete");
};

// 图片显示失败
const imgLoadError = () => {
  console.error("壁纸加载失败");
  ElMessage({
    message: "壁纸加载失败",
    icon: h(Error, {
      theme: "filled",
      fill: "#efefef",
    }),
  });
};

onMounted(() => {
  // 随机加载壁纸
  changeRandomBg();
});

onBeforeUnmount(() => {
  clearTimeout(imgTimeout.value);
});
</script>

<style lang="scss" scoped>
.cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: 0.25s;
  z-index: -1;

  &.show {
    z-index: 1;
  }

  .bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    background-position: center center;
    background-attachment: fixed;
    background-repeat: no-repeat;
    background-color: #1a1a1a;
    backface-visibility: hidden;
    filter: blur(20px) brightness(0.3);
    transition:
      filter 0.3s,
      transform 0.3s;
    animation: 
      fade-blur-in 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards,
      breathe 24s infinite ease-in-out alternate; // 呼吸动画，24s周期
    animation-delay: 0.45s, 1.5s; // 呼吸动画稍微延迟开始
  }

  // 遮罩层 - 已禁用 (或者设为完全透明)
  .gray {
    opacity: 0 !important; // 强制隐藏
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 0.5) 100%),
      radial-gradient(rgba(0, 0, 0, 0) 33%, rgba(0, 0, 0, 0.3) 166%);
    pointer-events: none;
    transition: 1.5s;
  }

  // 切换壁纸按钮
  .switch-bg-btn {
    position: fixed;
    right: 20px;
    bottom: 60px;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    cursor: pointer;
    z-index: 10;
    transition: all 0.3s;

    &:hover {
      background: rgba(0, 0, 0, 0.5);
      border-color: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);

      :deep(.i-icon) {
        fill: #fff !important;
      }
    }

    &:active {
      transform: scale(0.95);
    }
  }
}

@keyframes breathe {
  0% { transform: scale(1); filter: brightness(0.8); } // 提高亮度至 0.8
  50% { transform: scale(1.05); filter: brightness(0.9); } // 呼吸时略微变亮
  100% { transform: scale(1); filter: brightness(0.8); }
}

// 淡入淡出动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
