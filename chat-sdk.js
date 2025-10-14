class FloatingChatSDK {
  constructor(options = {}) {
    // 必传参数校验
    const required = ['appId', 'workflowId', 'token'];
    const missing = required.filter(key => !options[key]);
    if (missing.length > 0) {
      console.error('ChatSDK配置错误：缺少', missing.join('、'));
      return;
    }

    // 配置整合（默认主色为#7B61FF，支持页面自定义）
    this.config = {
      appId: String(options.appId),
      workflowId: String(options.workflowId),
      token: options.token,
      userId: options.userId || `user_${Date.now()}`,
      btnSize: 56,
      chatWidth: 380,
      title: "学习助手",
      iconUrl: options.iconUrl || "https://picsum.photos/60/60?math=1",
      timeout: 10000,
      primaryColor: options.primaryColor || "#7B61FF", // 主色（页面可自定义）
      retryBtn: document.getElementById('chat-retry-btn')
    };

    // 初始化主色样式（只作用于ChatSDK相关元素）
    this.initIsolatedColorStyle();

    // 状态管理
    this.sdkLoaded = false;
    this.chatInstance = null;
    this.loadTimer = null;

    // 启动SDK
    this.init();
  }

  /**
   * 核心改进：严格隔离样式，只控制ChatSDK相关元素
   * 不影响页面原有.text-primary等类名的样式
   */
  initIsolatedColorStyle() {
    // 生成主色的深色变体（用于按钮渐变）
    const primaryDark = this.darkenColor(this.config.primaryColor, 10);
    // 生成主色的浅色阴影（用于悬浮球）
    const primaryShadow = `${this.config.primaryColor}26`; // 末尾加透明度

    // 动态创建样式标签（添加唯一ID，方便后续管理）
    const style = document.createElement('style');
    style.id = 'chat-sdk-isolated-style';
    style.textContent = `
      /* 1. 仅控制ChatSDK相关的提示图标（弹窗里的感叹号） */
      #tip-modal .chat-sdk-icon {
        color: ${this.config.primaryColor} !important;
      }

      /* 2. 聊天悬浮球颜色（仅作用于聊天按钮） */
      .coze-asst-btn .btn {
        background-color: ${this.config.primaryColor} !important;
        box-shadow: 0 4px 12px ${primaryShadow} !important;
      }

      /* 3. 聊天窗口头部颜色 */
      .coze-chat-header {
        background-color: ${this.config.primaryColor} !important;
      }

      /* 4. 聊天重试按钮颜色 */
      #chat-retry-btn {
        background-color: ${this.config.primaryColor} !important;
      }

      /* 5. 仅控制ChatSDK相关的加载动画 */
      .chat-sdk-loading .border-primary {
        border-color: ${this.config.primaryColor} !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 辅助工具：十六进制颜色转RGB
   */
  hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }

  /**
   * 辅助工具：颜色变暗（百分比0-100）
   */
  darkenColor(color, percent) {
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);

    r = Math.floor(r * (1 - percent / 100));
    g = Math.floor(g * (1 - percent / 100));
    b = Math.floor(b * (1 - percent / 100));

    r = r < 0 ? 0 : r;
    g = g < 0 ? 0 : g;
    b = b < 0 ? 0 : b;

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * 加载ChatSDK脚本
   */
  loadSDK() {
    this.loadTimer = setTimeout(() => {
      if (!this.sdkLoaded) {
        console.error('ChatSDK加载超时');
        this.showRetryBtn();
      }
    }, this.config.timeout);

    if (window.CozeWebSDK) {
      this.sdkLoaded = true;
      clearTimeout(this.loadTimer);
      this.setupChat();
      return;
    }

    const script = document.createElement('script');
    script.src = "https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.10/libs/cn/index.js";
    script.crossOrigin = 'anonymous';

    script.onload = () => {
      if (window.CozeWebSDK) {
        this.sdkLoaded = true;
        clearTimeout(this.loadTimer);
        this.setupChat();
      } else {
        console.error('ChatSDK加载后未定义');
        this.showRetryBtn();
      }
    };

    script.onerror = () => {
      console.error('ChatSDK脚本加载失败');
      clearTimeout(this.loadTimer);
      this.showRetryBtn();
    };

    document.head.appendChild(script);
  }

  /**
   * 初始化聊天实例
   */
  setupChat() {
    try {
      this.hideRetryBtn();
      this.chatInstance = new CozeWebSDK.WebChatClient({
        config: {
          type: 'app',
          appInfo: {
            appId: this.config.appId,
            workflowId: this.config.workflowId
          }
        },
        auth: {
          type: 'token',
          token: this.config.token,
          onRefreshToken: () => this.config.token
        },
        ui: {
          asstBtn: {
            visible: true,
            position: 'bottomRight',
            icon: this.config.iconUrl,
            size: this.config.btnSize
          },
          chatBot: {
            title: this.config.title,
            width: this.config.chatWidth,
            theme: 'light'
          },
          base: {
            zIndex: 99998,
            layout: 'pc'
          }
        },
        userInfo: {
          id: this.config.userId,
          nickname: "学生",
          url: "https://picsum.photos/40/40?user=1"
        }
      });
      console.log('ChatSDK初始化成功');
    } catch (error) {
      console.error('创建聊天实例失败：', error);
      this.showRetryBtn();
    }
  }

  /**
   * 显示重试按钮
   */
  showRetryBtn() {
    if (this.config.retryBtn) this.config.retryBtn.style.display = 'flex';
    this.config.retryBtn?.addEventListener('click', () => {
      this.config.retryBtn.style.display = 'none';
      this.init();
    }, { once: true });
  }

  /**
   * 隐藏重试按钮
   */
  hideRetryBtn() {
    if (this.config.retryBtn) this.config.retryBtn.style.display = 'none';
  }

  /**
   * 重新初始化
   */
  init() {
    if (this.loadTimer) clearTimeout(this.loadTimer);
    this.loadSDK();
  }
}

// 暴露到全局
window.FloatingChatSDK = FloatingChatSDK;