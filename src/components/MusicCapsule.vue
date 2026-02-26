<template>
  <!-- 音乐胶囊播放条 -->
  <Transition name="capsule">
    <div 
      class="music-capsule" 
      v-if="store.musicIsOk && !store.musicOpenState"
      v-show="store.imgLoadStatus && !store.backgroundShow"
    >
      <!-- 播放/暂停按钮 -->
      <div class="play-btn" @click="changePlayState">
        <play-one v-if="!store.playerState" theme="filled" size="16" fill="#fff" />
        <pause v-else theme="filled" size="16" fill="#fff" />
      </div>

      <!-- 歌曲信息（滚动） -->
      <div class="song-info" @click="store.musicOpenState = true">
        <div class="song-name">
          <span class="marquee">
            {{ store.getPlayerData.name 
              ? `${store.getPlayerData.name} - ${store.getPlayerData.artist}` 
              : '点击播放音乐' 
            }}
          </span>
        </div>
      </div>

      <!-- 上一曲/下一曲 -->
      <div class="controls">
        <go-start theme="filled" size="14" fill="#ffffff80" @click="changeMusicIndex(0)" />
        <go-end theme="filled" size="14" fill="#ffffff80" @click="changeMusicIndex(1)" />
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { PlayOne, Pause, GoStart, GoEnd } from "@icon-park/vue-next";
import { mainStore } from "@/store";

const store = mainStore();

// 获取 playerRef（从父组件或全局 window）
const playerRef = ref(null);

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
</script>

<style lang="scss" scoped>
.music-capsule {
  position: fixed;
  right: 20px;
  bottom: 110px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 6px 6px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  z-index: 10;
  max-width: 200px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: rgba(0, 0, 0, 0.5);
    border-color: rgba(255, 255, 255, 0.2);
  }

  // 播放按钮
  .play-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    flex-shrink: 0;
    transition: all 0.3s;

    &:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: scale(1.1);
    }
  }

  // 歌曲信息
  .song-info {
    flex: 1;
    overflow: hidden;
    min-width: 0;

    .song-name {
      overflow: hidden;
      white-space: nowrap;

      .marquee {
        display: inline-block;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.9);
        animation: marquee 10s linear infinite;

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      }
    }
  }

  // 控制按钮
  .controls {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;

    .i-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.3s;
      cursor: pointer;

      &:hover {
        background: rgba(255, 255, 255, 0.15);

        :deep(svg) {
          fill: #fff !important;
        }
      }
    }
  }

  @media (max-width: 720px) {
    right: 12px;
    bottom: 100px;
    max-width: 160px;

    .controls {
      display: none;
    }
  }
}

// 胶囊出现动画
.capsule-enter-active,
.capsule-leave-active {
  transition: all 0.3s ease;
}

.capsule-enter-from,
.capsule-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
