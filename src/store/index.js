import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    isShowLoading: false, // 全局 loading
    // 左侧菜单栏数据
    menuItems: [
      {
        text: '观点管理',
        type: 'md-chatbubbles',
        children: [
          {
            name: 'msg',
            text: '创建观点'
          },
          {
            name: 't1',
            text: '观点列表'
          }
        ]
      }
    ]
  },
  mutations: {
    setMenus(state, items) {
      state.menuItems = [...items];
    },
    setLoading(state, isShowLoading) {
      state.isShowLoading = isShowLoading;
    }
  }
});

export default store;
