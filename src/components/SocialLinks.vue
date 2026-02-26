<template>
  <!-- 社交链接 -->
  <div class="social">
    <div class="link">
      <div
        v-for="item in socialLinks"
        :key="item.name"
        class="social-item"
        @mouseenter="handleMouseEnter(item)"
        @mouseleave="handleMouseLeave"
      >
        <a :href="item.url" :target="item.url === '#' ? '' : '_blank'">
          <img class="icon" :src="item.icon" height="24" />
        </a>
        <!-- 二维码悬浮卡片 -->
        <Transition name="qr-popup">
          <div v-if="item.qrcode && activeItem === item.name" class="qr-popup">
            <img :src="item.qrcode" alt="扫码添加" />
            <span class="qr-tip">扫一扫添加好友</span>
          </div>
        </Transition>
      </div>
    </div>
    <span class="tip">{{ socialTip }}</span>
  </div>
</template>

<script setup>
import socialLinks from "@/assets/socialLinks.json";

// 社交链接提示
const socialTip = ref("通过这里联系我吧");

// 当前激活的社交项（用于显示二维码）
const activeItem = ref(null);

// 鼠标进入
const handleMouseEnter = (item) => {
  socialTip.value = item.tip;
  if (item.qrcode) {
    activeItem.value = item.name;
  }
};

// 鼠标离开
const handleMouseLeave = () => {
  socialTip.value = "通过这里联系我吧";
  activeItem.value = null;
};
</script>

<style lang="scss" scoped>
.social {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 460px;
  width: 100%;
  height: 42px;
  background-color: transparent;
  border-radius: 6px;
  backdrop-filter: blur(0);
  animation: fade 0.5s;
  transition:
    background-color 0.3s,
    backdrop-filter 0.3s;
  @media (max-width: 840px) {
    max-width: 100%;
    justify-content: center;
    .link {
      justify-content: space-evenly !important;
      width: 90%;
    }
    .tip {
      display: none !important;
    }
  }

  .link {
    display: flex;
    align-items: center;
    justify-content: center;

    .social-item {
      position: relative;
      display: flex;
      align-items: center;

      a {
        display: inherit;
        .icon {
          margin: 0 12px;
          transition: transform 0.3s;
          &:hover {
            transform: scale(1.1);
          }
          &:active {
            transform: scale(1);
          }
        }
      }

      // 二维码悬浮卡片
      .qr-popup {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        margin-bottom: 12px;
        padding: 12px;
        background: rgba(30, 35, 40, 0.85);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        box-shadow:
          0 12px 40px rgba(0, 0, 0, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
        z-index: 100;

        // 小箭头
        &::after {
          content: "";
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 8px 8px 0;
          border-style: solid;
          border-color: rgba(30, 35, 40, 0.85) transparent transparent;
        }

        img {
          width: 140px;
          height: 140px;
          border-radius: 8px;
          display: block;
        }

        .qr-tip {
          display: block;
          text-align: center;
          margin-top: 8px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
        }
      }
    }
  }

  .tip {
    display: none;
    margin-right: 12px;
    animation: fade 0.5s;
  }

  @media (min-width: 768px) {
    &:hover {
      background-color: #00000040;
      backdrop-filter: blur(5px);
      .tip {
        display: block;
      }
    }
  }
}

// 二维码弹出动画
.qr-popup-enter-active,
.qr-popup-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.qr-popup-enter-from,
.qr-popup-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px) scale(0.95);
}

.qr-popup-enter-to,
.qr-popup-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
}
</style>
