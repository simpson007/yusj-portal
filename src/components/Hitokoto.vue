<template>
  <div
    class="hitokoto cards"
    v-show="!store.musicOpenState"
    @mouseenter="openMusicShow = true"
    @mouseleave="openMusicShow = false"
    @click.stop
  >
    <!-- 打开音乐面板 -->
    <Transition name="el-fade-in-linear">
      <div
        class="open-music"
        v-show="openMusicShow && store.musicIsOk"
        @click="store.musicOpenState = true"
      >
        <music-menu theme="filled" size="18" fill="#efefef" />
        <span>打开音乐播放器</span>
      </div>
    </Transition>
    <!-- 一言内容 -->
    <Transition name="el-fade-in-linear" mode="out-in">
      <div :key="hitokotoData.text" class="content">
        <span class="text" @click="copyHitokoto" title="点击复制">{{ hitokotoData.text }}</span>
        <div class="bottom-row">
          <span class="from">-「&nbsp;{{ hitokotoData.from }}&nbsp;」</span>
          <refresh theme="outline" size="16" fill="#ffffff80" class="refresh-btn" @click="updateHitokoto" title="换一句" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { MusicMenu, Error, Refresh, CheckOne } from "@icon-park/vue-next";
import { getHitokoto } from "@/api";
import { mainStore } from "@/store";
import debounce from "@/utils/debounce.js";

const store = mainStore();

// 开启音乐面板按钮显隐
const openMusicShow = ref(false);

// 一言数据
const hitokotoData = reactive({
  text: "这里应该显示一句话",
  from: "無名",
});

// 获取一言数据
const getHitokotoData = async () => {
  try {
    const result = await getHitokoto();
    hitokotoData.text = result.hitokoto;
    hitokotoData.from = result.from;
  } catch (error) {
    ElMessage({
      message: "一言获取失败",
      icon: h(Error, {
        theme: "filled",
        fill: "#efefef",
      }),
    });
    hitokotoData.text = "这里应该显示一句话";
    hitokotoData.from = "無名";
  }
};

// 更新一言数据
const updateHitokoto = () => {
  // 防抖
  debounce(() => {
    getHitokotoData();
  }, 500);
};

// 复制格言到剪贴板
const copyHitokoto = async () => {
  try {
    const textToCopy = `${hitokotoData.text} —— ${hitokotoData.from}`;
    await navigator.clipboard.writeText(textToCopy);
    ElMessage({
      message: "格言已复制到剪贴板",
      icon: h(CheckOne, {
        theme: "filled",
        fill: "#efefef",
      }),
    });
  } catch (error) {
    ElMessage({
      message: "复制失败，请手动复制",
      icon: h(Error, {
        theme: "filled",
        fill: "#efefef",
      }),
    });
  }
};

onMounted(() => {
  getHitokotoData();
});
</script>

<style lang="scss" scoped>
.hitokoto {
  width: 100%;
  height: 100%;
  padding: 20px;
  animation: fade 0.5s;
  .open-music {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #00000026;
    padding: 4px 0;
    border-radius: 8px 8px 0 0;
    .i-icon {
      width: 18px;
      height: 18px;
      display: block;
      margin-right: 8px;
    }
    span {
      font-size: 0.95rem;
    }
  }
  .content {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    .text {
      font-family: 'Noto Serif SC', 'STSong', 'SimSun', serif;
      font-size: 1.15rem;
      line-height: 1.6;
      word-break: break-all;
      text-overflow: ellipsis;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      cursor: pointer;
      transition: text-shadow 0.3s;
      &:hover {
        text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
      }
      &:active {
        opacity: 0.8;
      }
    }
    .bottom-row {
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .from {
      font-family: 'Noto Serif SC', 'STSong', 'SimSun', serif;
      font-weight: bold;
      font-size: 1.1rem;
    }
    .refresh-btn {
      cursor: pointer;
      opacity: 0.5;
      transition: all 0.3s;
      &:hover {
        opacity: 1;
        transform: rotate(180deg);
      }
    }
  }
}
</style>
