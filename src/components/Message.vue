<template>
  <!-- 个人名片卡片 - 整合头像、域名、格言、社交图标 -->
  <div class="profile-card cards">
    <!-- 顶部：头像 + 域名 -->
    <div class="header">
      <img class="avatar" :src="siteLogo" alt="avatar" />
      <div class="site-info">
        <div class="site-title">
          <span class="main">{{ siteUrl[0] }}</span>
          <span class="suffix">.{{ siteUrl[1] }}</span>
        </div>
      </div>
    </div>

    <!-- 分隔线 -->
    <div class="divider"></div>

    <!-- 中间：格言区域 -->
    <div class="motto" @click="changeBox">
      <div class="quote-mark left">「</div>
      <Transition name="fade" mode="out-in">
        <div :key="descriptionText.hello + descriptionText.text" class="text">
          <p class="line1">{{ descriptionText.hello }}</p>
          <p class="line2">{{ descriptionText.text }}</p>
        </div>
      </Transition>
      <div class="quote-mark right">」</div>
    </div>

    <!-- 分隔线 -->
    <div class="divider"></div>

    <!-- 底部：社交图标 -->
    <div class="social-section">
      <div class="social-icons">
        <div
          v-for="item in socialLinks"
          :key="item.name"
          class="social-item"
          @mouseenter="handleSocialEnter(item)"
          @mouseleave="handleSocialLeave"
        >
          <a :href="item.url" :target="item.url === '#' ? '' : '_blank'" :title="item.tip">
            <img class="icon" :src="item.icon" height="22" />
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
    </div>
  </div>
</template>

<script setup>
import { Error } from "@icon-park/vue-next";
import { mainStore } from "@/store";
import socialLinks from "@/assets/socialLinks.json";

const store = mainStore();

// 主页站点logo
const siteLogo = import.meta.env.VITE_SITE_MAIN_LOGO;

// 站点链接
const siteUrl = computed(() => {
  const url = import.meta.env.VITE_SITE_URL;
  if (!url) return "yushenjian.com".split(".");
  if (url.startsWith("http://") || url.startsWith("https://")) {
    const urlFormat = url.replace(/^(https?:\/\/)/, "");
    return urlFormat.split(".");
  }
  return url.split(".");
});

// 简介区域文字
const descriptionText = reactive({
  hello: import.meta.env.VITE_DESC_HELLO,
  text: import.meta.env.VITE_DESC_TEXT,
});

// 社交链接相关
// 社交链接相关
const activeItem = ref(null);

const handleSocialEnter = (item) => {
  if (item.qrcode) {
    activeItem.value = item.name;
  }
};

const handleSocialLeave = () => {
  activeItem.value = null;
};

// 切换右侧功能区
const changeBox = () => {
  if (store.getInnerWidth >= 721) {
    store.boxOpenState = !store.boxOpenState;
  } else {
    ElMessage({
      message: "当前页面宽度不足以开启盒子",
      grouping: true,
      icon: h(Error, {
        theme: "filled",
        fill: "#efefef",
      }),
    });
  }
};

// 监听状态变化
watch(
  () => store.boxOpenState,
  (value) => {
    if (value) {
      descriptionText.hello = import.meta.env.VITE_DESC_HELLO_OTHER;
      descriptionText.text = import.meta.env.VITE_DESC_TEXT_OTHER;
    } else {
      descriptionText.hello = import.meta.env.VITE_DESC_HELLO;
      descriptionText.text = import.meta.env.VITE_DESC_TEXT;
    }
  },
);
</script>

<style lang="scss" scoped>
.profile-card {
  display: flex;
  flex-direction: column;
  padding: 24px;
  animation: fade 0.5s;
  max-width: 460px;

  // 顶部头像区域
  .header {
    display: flex;
    align-items: center;
    gap: 16px;

    .avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      transition: transform 0.5s;

      &:hover {
        transform: rotate(360deg);
      }
    }

    .site-info {
      .site-title {
        display: flex;
        align-items: baseline;
        font-family: 'Noto Serif SC', serif;
        font-weight: 600;

        .main {
          font-size: 2rem;
          background: linear-gradient(135deg, #ffffff, #e0e0e0);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .suffix {
          margin-left: 4px;
          font-size: 1.2rem;
          color: var(--accent-color-wuxia);
          font-style: italic;
          opacity: 0.9;
        }
      }
    }
  }

  // 分隔线
  .divider {
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(255, 255, 255, 0.1) 20%, 
      rgba(255, 255, 255, 0.4) 50%, 
      rgba(255, 255, 255, 0.1) 80%, 
      transparent 100%
    );
    margin: 16px 0;
    opacity: 0.8;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 4px;
      height: 4px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 50%;
      box-shadow: 0 0 4px rgba(255, 255, 255, 0.4);
    }
  }

  // 格言区域
  .motto {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 6px 8px; // 减少上下留白
    cursor: pointer;
    transition: background 0.3s;
    border-radius: 8px;
    margin: 4px 0; // 微调外边距

    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .quote-mark {
      font-family: 'LXGW WenKai', serif;
      font-size: 1.5rem;
      color: var(--accent-color-wuxia);
      opacity: 0.6;

      &.left {
        margin-right: 8px;
      }

      &.right {
        margin-left: 8px;
        align-self: flex-end;
      }
    }

    .text {
      text-align: center;
      line-height: 1.8;

      .line1 {
        font-family: 'Noto Serif SC', serif; // 切换为思源宋体，更静谧
        font-size: 1.35rem; // 略微放大
        font-weight: 600;
        letter-spacing: 4px; // 增加字间距
        color: var(--accent-color-wuxia);
        text-shadow: 0 0 10px rgba(242, 230, 216, 0.3);
      }

      .line2 {
        font-family: 'Noto Serif SC', serif;
        font-size: 1.15rem;
        font-weight: 400;
        letter-spacing: 4px; // 增加字间距
        margin-top: 8px;
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }

  // 社交区域
  .social-section {
    display: flex;
    align-items: center;
    justify-content: center; // 整体居中
    width: 100%;

    .social-icons {
      display: flex;
      align-items: center;
      justify-content: space-between; // 图标之间均匀分布
      width: 100%;
      max-width: 280px; // 限制最大宽度，避免太散
      gap: 16px; // 增加间距

      .social-item {
        position: relative;

        a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          transition: all 0.3s;

          &:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
          }

          .icon {
            transition: transform 0.3s;
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
          background: rgba(30, 35, 40, 0.9);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
          z-index: 100;

          &::after {
            content: "";
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            border-width: 8px 8px 0;
            border-style: solid;
            border-color: rgba(30, 35, 40, 0.9) transparent transparent;
          }

          img {
            width: 120px;
            height: 120px;
            border-radius: 8px;
            display: block;
          }

          .qr-tip {
            display: block;
            text-align: center;
            margin-top: 8px;
            font-size: 11px;
            color: rgba(255, 255, 255, 0.7);
          }
        }
      }
    }

    .social-tip {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.6);
      animation: fade 0.3s;
    }
  }

  @media (max-width: 720px) {
    max-width: 100%;
    pointer-events: auto;

    .header {
      .avatar {
        width: 56px;
        height: 56px;
      }

      .site-info .site-title {
        .main {
          font-size: 1.5rem;
        }
        .suffix {
          font-size: 1rem;
        }
      }
    }

    .motto {
      pointer-events: none;
    }

    .social-section {
      .social-tip {
        display: none;
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
