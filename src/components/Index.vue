<template>
  <div class="index-vue">
    <aside class="aside-big">
      <div class="logo-c">
        <img src="../assets/imgs/logo.png" alt="logo" class="logo" />
        <div class="splitLine"></div>
        <span>智能资产配置平台</span>
      </div>
      <!-- 菜单栏 -->
      <Menu
        class="menu"
        ref="asideMenu"
        theme="dark"
        width="100%"
        @on-select="selectMenuCallback"
        accordion
        :open-names="openMenus"
        :active-name="currentPage"
        @on-open-change="menuChange"
      >
        <!-- 动态菜单 -->
        <div v-for="(item, index) in menuItems" :key="index">
          <Submenu class="isShowAsideTitle" :name="index">
            <template slot="title">
              <div class="firstMenu">
                <img src="../assets/imgs/icon.png" class="icon" />
                <span>{{ item.text }}</span>
              </div>
            </template>
            <div v-for="(subItem, i) in item.children" :key="index + i">
              <template>
                <MenuItem class="isShowAsideTitle" :name="subItem.name">
                  <span>{{ subItem.text }}</span>
                </MenuItem>
              </template>
            </div>
          </Submenu>
        </div>
      </Menu>
    </aside>

    <!-- 右侧部分 -->
    <section class="sec-right">
      <!-- 标签栏 -->
      <div class="div-tags">
        <ul class="ul-c">
          <li v-for="(item, index) in tagsArry" :key="index" @click="activeTag(index)">
            <a class="li-a">
              {{ item.text }}
            </a>
            <Icon size="16" @click="closeTag(index)" type="md-close" />
          </li>
        </ul>
      </div>
      <!-- 页面主体 -->
      <div class="main-content">
        <div class="view-c">
          <router-view />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'index',
  data() {
    return {
      paths: {}, // 用于储存页面路径
      currentPage: '', // 当前显示页面
      openMenus: [], // 要打开的菜单名字 name属性
      menuCache: [], // 缓存已经打开的菜单
      isShowRouter: true,
      tagsArry: [],
      main: null, // 页面主要内容区域
      asideArrowIcons: [], // 缓存侧边栏箭头图标 收缩时用
      // 主页路由名称
      home: 't1'
    };
  },
  mounted() {
    this.gotoPage(this.home);
    this.expandAside();
    this.menuChange();
    const name = this.$route.name;
    // 根据路由打开对应的菜单栏
    this.openMenus = this.getMenus(name);
    this.$nextTick(() => {
      this.$refs.asideMenu.updateOpened();
    });
    this.main = document.querySelector('.sec-right');
    this.asideArrowIcons = document.querySelectorAll('aside .ivu-icon-ios-arrow-down');
    this.$EventBus.$on('edit', viewid => {
      this.gotoPage('edit', { viewid });
    });
  },
  watch: {
    $route(to) {
      const name = to.name;
      this.currentPage = name;
      if (!this.keepAliveData.includes(name)) {
        if (this.tagsArry.length == 1) {
          this.tagsArry.shift();
        }
        if (name === 'edit') {
          this.tagsArry.push({ name, text: '编辑观点' });
        } else {
          this.tagsArry.push({ name, text: this.nameToTitle[name] });
        }
      }
    }
  },
  computed: {
    // 菜单栏
    menuItems() {
      return this.$store.state.menuItems;
    },
    // 需要缓存的路由
    keepAliveData() {
      return this.tagsArry.map(item => item.name);
    },
    nameToTitle() {
      const obj = {};
      this.menuItems.forEach(e => {
        this.processNameToTitle(obj, e);
      });

      return obj;
    }
  },
  methods: {
    getQueryString(name) {
      let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
      let r = window.location.search.substr(1).match(reg);
      if (r != null) return decodeURIComponent(r[2]);
      return null;
    },
    getMenus(name) {
      let menus;
      const tagTitle = this.nameToTitle[name];
      for (let i = 0, l = this.menuItems.length; i < l; i++) {
        const item = this.menuItems[i];
        menus = [];
        menus[0] = i;
        if (item.text == tagTitle) {
          return menus;
        }

        if (item.children) {
          for (let j = 0, ll = item.children.length; j < ll; j++) {
            const child = item.children[j];
            menus[1] = i + '-' + j;
            menus.length = 2;
            if (child.text == tagTitle) {
              return menus;
            }

            if (child.children) {
              for (let k = 0, lll = child.children.length; k < lll; k++) {
                const grandson = child.children[k];
                menus[2] = i + '-' + j + '-' + k;
                if (grandson.text == tagTitle) {
                  return menus;
                }
              }
            }
          }
        }
      }
    },

    // 判断当前标签页是否激活状态
    isActive(name) {
      return this.$route.name === name;
    },
    // 跳转页面 路由名称和参数
    gotoPage(name, query) {
      this.currentPage = name;
      this.$router.push({ name, query });
      if (!this.keepAliveData.includes(name)) {
        if (this.tagsArry.length == 1) {
          this.tagsArry.shift();
        }
        if (name === 'edit') {
          this.tagsArry.push({ name, text: '编辑观点' });
        } else {
          this.tagsArry.push({ name, text: this.nameToTitle[name] });
        }
      }
    },
    // 选择菜单回调函数
    selectMenuCallback(name) {
      this.gotoPage(name);
    },
    // 展开
    expandAside() {
      setTimeout(() => {
        for (let i = 0, len = this.asideArrowIcons.length; i < len; i++) {
          this.asideArrowIcons[i].style.display = 'block';
        }
        this.openMenus = this.menuCache;
        if (this.$refs.asideMenu) {
          this.$refs.asideMenu.updateOpened();
        }
      }, 200);
    },
    // 刷新当前标签页
    reloadPage() {
      let name = this.$route.name;
      let index = this.keepAliveData.indexOf(name);
      this.$nextTick(() => {
        if (this.tagsArry.length) {
          this.isShowRouter = false;
          this.tagsArry.splice(index, 1);
          this.$nextTick(() => {
            this.tagsArry.splice(index, 0, { name, text: this.nameToTitle[name] });
            this.gotoPage(name);
            this.isShowRouter = true;
          });
        } else {
          this.isShowRouter = false;
          this.$nextTick(() => {
            this.tagsArry.push({ name, text: this.nameToTitle[name] });
            this.gotoPage(name);
            this.isShowRouter = true;
          });
        }
      });
    },
    // 关闭单个标签
    closeTag(i) {
      let name = this.tagsArry[i].name;
      this.tagsArry.splice(i, 1);
      window.event.stopPropagation();
      // 如果关闭的是当前标签 则激活前一个标签
      // 如果关闭的是第一个标签 则激活后一个标签
      if (this.tagsArry.length) {
        if (this.isActive(name)) {
          if (i != 0) {
            this.gotoPage(this.tagsArry[i - 1].name);
          } else {
            this.gotoPage(this.tagsArry[i].name);
          }
        }
      } else if (name != this.home) {
        // 如果没有标签则跳往首页
        this.gotoPage(this.home);
      } else {
        this.reloadPage();
      }
    },
    // 根据路由名称关闭页面
    closeName(name) {
      for (let i = 0, len = this.tagsArry.length; i < len; i++) {
        if (this.tagsArry[i].name == name) {
          this.closeTag(i);
          break;
        }
      }
    },
    // 激活标签
    activeTag(i) {
      this.gotoPage(this.tagsArry[i].name);
    },
    // 菜单栏改变事件
    menuChange(data) {
      this.menuCache = data;
    },
    processNameToTitle(obj, data, text) {
      if (data.name) {
        obj[data.name] = data.text;
        this.paths[data.name] = text ? `${text} / ${data.text}` : data.text;
      }
      if (data.children) {
        data.children.forEach(e => {
          this.processNameToTitle(obj, e, text ? `${text} / ${data.text}` : data.text);
        });
      }
    }
  }
};
</script>

<style lang="less" scoped>
.firstMenu {
  display: flex;
  align-items: center;
}
.icon {
  width: 20px;
  height: 20px;
  margin-right: 12px;
}
.index-vue {
  color: #666;
  // overflow-x: hidden;
}
/* 侧边栏 */
aside {
  position: fixed;
  top: 0;
  left: 0;
  width: 90px;
  background: #1e2442;
  height: 100%;
  transition: width 0.3s;
  overflow: auto;
}
.logo-c {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  font-weight: 500;
  margin: 23px 0;
  padding: 0 15px;
  .splitLine {
    margin: 0 8px;
    width: 1px;
    height: 10px;
    background: #ffffff;
    opacity: 0.3;
  }
}
.logo {
  width: 64px;
  height: 14px;
}
.aside-big {
  width: 220px;
  z-index: 999;
}
/* 主体页面 */
.sec-right {
  height: 100%;
  margin-left: 220px;
  background: #f2f3f5;
  padding-left: 24px;
  padding-top: 24px;
  box-sizing: border-box;
}
/* 主体页面头部 */
.ivu-icon {
  font-size: 24px;
}
.refresh-c {
  margin: 0 30px;
  cursor: pointer;
}
.user-img-c img {
  width: 100%;
}
.tag-options {
  cursor: pointer;
  position: relative;
}
.div-tags {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
/* 标签栏 */
.ul-c {
  height: 30px;
}
.ul-c li {
  height: 30px;
  background: #ffffff;
  border: 1px solid #f0f0f0;
  border-bottom: none;
  cursor: pointer;
  font-size: 14px;
  color: #2e2f33;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
a {
  color: #666;
  transition: none;
}
.li-a {
  max-width: 80px;
  font-weight: 600 !important;
  margin-right: 44px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.ul-c .ivu-icon {
  margin-left: 6px;
}
.active a {
  color: #fff;
}
.active .ivu-icon {
  color: #fff;
}
/* 主要内容区域 */
.main-content {
  height: calc(100%-54px);
}
.view-c {
  position: relative;
  height: 100%;
}
.menu-level-3 .ivu-icon {
  font-size: 18px;
}
.shrink {
  text-align: center;
}
.external {
  color: rgba(255, 255, 255, 0.7);
}
.external > i {
  margin-right: 6px;
}
</style>
