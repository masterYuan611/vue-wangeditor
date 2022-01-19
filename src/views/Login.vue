<template>
  <div class="login">
    <Spin fix>
      <Icon type="ios-loading" size="18" class="demo-spin-icon-load"></Icon>
      <div>登录中</div>
    </Spin>
  </div>
</template>

<script>
import { qyAuth } from '../api';

export default {
  mounted() {
    this.isMobile();
  },
  methods: {
    getQueryString(name) {
      let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
      let r = window.location.search.substr(1).match(reg);
      if (r != null) return decodeURIComponent(r[2]);
      return null;
    },
    isMobile() {
      let sUserAgent = navigator.userAgent.toLowerCase();
      let bIsIpad = sUserAgent.match(/ipad/i) == 'ipad';
      let bIsIphoneOs = sUserAgent.match(/iphone os/i) == 'iphone os';
      let bIsMidp = sUserAgent.match(/midp/i) == 'midp';
      let bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == 'rv:1.2.3.4';
      let bIsUc = sUserAgent.match(/ucweb/i) == 'ucweb';
      let bIsAndroid = sUserAgent.match(/android/i) == 'android';
      let bIsCE = sUserAgent.match(/windows ce/i) == 'windows ce';
      let bIsWM = sUserAgent.match(/windows mobile/i) == 'windows mobile';
      if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
        return this.$Message.error({ content: '请在PC端查看！', duration: 0 });
      }
      let code = this.getQueryString('code');
      if (code) {
        qyAuth({ code }).then(({ data }) => {
          if (data.authorization) {
            this.$Message.success('登录成功');
            localStorage.setItem('Authorization', data.authorization);
            this.$router.replace('/index');
          } else {
            this.$Message.error({ content: '暂无相关权限！', duration: 0 });
          }
        });
      } else {
        this.$Message.error({ content: '未取到身份信息，请重新进入！', duration: 0 });
      }
    }
  }
};
</script>

<style lang="less" scoped>
.login {
  color: #fff;
  background-color: rgba(0, 0, 0, 0.5);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  .demo-spin-icon-load {
    animation: ani-demo-spin 1s linear infinite;
  }
}
</style>
