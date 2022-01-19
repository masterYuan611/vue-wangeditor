<template>
  <div class="view-list">
    <div class="tab">
      <a @click="onChangeTab(index)" v-for="(item, index) in tabArr" :key="index" :class="[activeINdex === index ? 'active' : '']">
        {{ item }}
      </a>
    </div>
    <div class="content">
      <ViewLIst v-if="activeINdex === 0" />
      <DraftList v-if="activeINdex === 1" />
    </div>
  </div>
</template>
<script>
import DraftList from '../components/draft-list.vue';
import ViewLIst from '../components/view-list.vue';

export default {
  name: 't1',
  components: { ViewLIst, DraftList },
  data() {
    return {
      activeINdex: 0,
      tabArr: ['我的观点', '草稿']
    };
  },
  methods: {
    onChangeTab(e) {
      this.activeINdex = e;
    }
  }
};
</script>

<style lang="less" scoped>
.view-list {
  height: (100%-54px);
  .tab {
    border-bottom: 1px solid #ebebeb;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #666666;
    line-height: 20px;
    padding-left: 6px;
    background: #fff;
    a {
      color: #666666;
      display: inline-block;
      padding: 23px 26px 17px;
    }
    .active {
      color: #007bf6;
      position: relative;
      font-weight: 600;
      &::after {
        position: absolute;
        bottom: -1px;
        left: 50%;
        transform: translateX(-50%);
        content: '';
        display: inline-block;
        width: 24px;
        height: 3px;
        background: #2e6dec;
      }
    }
  }
}
</style>
<style>
/* 定义滚动条样式 */
  ::-webkit-scrollbar {
    width: 5px;
    border-radius: 10px;
    /* height: 300px; */
    background: #ebebeb;
  }

  /*定义滚动条轨道 内阴影+圆角*/
  ::-webkit-scrollbar-track {
    /* height: 300px; */
    background: #ebebeb;
    border-radius: 3px;
    padding: 15px 0;
    width: 5px;
  }

  /*定义滑块 内阴影+圆角*/
  ::-webkit-scrollbar-thumb {
    /* height: 300px; */
    border-radius: 3px;
    background: #cccccc;
    width: 5px;
  }
</style>
