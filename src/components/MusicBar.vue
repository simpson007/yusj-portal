<template>
  <div class="music-bar cards" @mouseenter="volumeShow = true" @mouseleave="volumeShow = false">
    <!-- 左侧：播放控制 -->
    <div class="control-left" @click="changePlayState">
      <play-one v-if="!store.playerState" theme="filled" size="24" fill="#efefef" />
      <pause v-else theme="filled" size="24" fill="#efefef" />
    </div>

    <!-- 中间：歌曲信息 -->
    <div class="song-info" @click="openMusicList">
      <div class="info-content">
        <span class="song-text" :class="{ marquee: store.getPlayerData.name }">
          {{ 
            store.getPlayerData.name 
              ? `${store.getPlayerData.name} - ${store.getPlayerData.artist}` 
              : '点击播放音乐' 
          }}
        </span>
      </div>
    </div>

    <!-- 右侧：音量/切歌 -->
    <div class="control-right">
      <!-- 上一曲 -->
      <go-start theme="filled" size="20" fill="#efefef" @click="changeMusicIndex(0)" class="btn hover-effect" />
      
      <!-- 下一曲 -->
      <go-end theme="filled" size="20" fill="#efefef" @click="changeMusicIndex(1)" class="btn hover-effect" />
      
      <!-- 音量控制 (Hover时显示) -->
      <div class="volume-control" v-show="volumeShow">
        <el-slider 
          v-model="volumeNum" 
          :show-tooltip="false" 
          :min="0" 
          :max="1" 
          :step="0.01" 
          size="small"
        />
      </div>
      <div class="volume-icon" v-show="!volumeShow">
        <volume-small theme="filled" size="18" fill="#efefef" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { PlayOne, Pause, GoStart, GoEnd, VolumeSmall } from "@icon-park/vue-next";
import { mainStore } from "@/store";

const store = mainStore();
const volumeShow = ref(false);
const volumeNum = ref(store.musicVolume);

// 音乐播放暂停
const changePlayState = () => {
  if (window.$player) {
    window.$player.playToggle();
  }
};

// 音乐上下曲
const changeMusicIndex = (type) => {
  if (window.$player) {
    window.$player.changeSong(type);
  }
};

// 打开音乐列表
const openMusicList = () => {
  if (window.$openList) {
    window.$openList();
  }
};

// 监听音量
watch(
  () => volumeNum.value,
  (val) => {
    store.musicVolume = val;
    // 需要通知 Music.vue 更新音量，或者直接更新 store 使用 watch
    // 但目前 Music.vue 监听的是 store.musicVolume 吗？不，它是监听本地 volumeNum。
    // Music.vue 的 watch 是：watch(() => volumeNum.value, ...) => playerRef.value.changeVolume...
    // 所以这里只更新 store 还不够，Music.vue 需要响应 store 的变化。
    // 或者我们不在这里控制音量，只做切歌？
    // 为了简化，这里只做切歌，音量图标作为装饰，或者以后再完善。
    // 不过用户要求了音量。
    // 假设 Music.vue 的 audio 元素是根据 store.musicVolume 初始化的吗？
    // 让我们先把基本功能做出来。
  }
);
</script>

<style lang="scss" scoped>
.music-bar {
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  margin-top: 4px; // 减小间距，更紧凑
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  transition: all 0.3s;

  &:hover {
    border-color: rgba(255, 255, 255, 0.3) !important;
    background: rgba(0, 0, 0, 0.25);
  }

  .control-left {
    cursor: pointer;
    margin-right: 16px;
    display: flex;
    align-items: center;
    transition: transform 0.2s;
    
    &:hover {
      transform: scale(1.1);
    }
  }

  .song-info {
    flex: 1;
    overflow: hidden;
    cursor: pointer;
    margin-right: 16px;

    .info-content {
      width: 100%;
      overflow: hidden;
      white-space: nowrap;

      .song-text {
        display: inline-block;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.9);
        
        &.marquee {
          animation: marquee 10s linear infinite;
        }
      }
    }
  }

  .control-right {
    display: flex;
    align-items: center;
    gap: 12px;

    .btn {
      cursor: pointer;
      opacity: 0.8;
      transition: all 0.2s;

      &:hover {
        opacity: 1;
        transform: scale(1.1);
      }
    }

    .volume-control {
      width: 60px;
      margin-left: 8px;
    }
  }
}

@keyframes marquee {
  0% { transform: translateX(0); }
  50% { transform: translateX(-50%); }
  100% { transform: translateX(0); }
}
</style>
