<template>
  <transition name="confirm-fade">
    <div v-if="isShowConfirm" class="my-confirm" @click.stop="clickFun()">
      <div class="confirm-content-wrap" @click.stop>
        <div class="header-content">
          <span>{{ isButs ? '观点详情' : '观点预览' }}</span>
          <img src="../assets/imgs/close.png" alt="关闭" class="close" @click="clickFun()" />
        </div>
        <div class="operationArea" v-if="['0', '2', '3', '4', '5'].includes(status)">
          <Button v-if="['0', '3', '4', '5'].includes(status)" @click="edit">编辑</Button>
          <Button v-if="status === '2' && !updateShowFlag" @click="changeUpdate">查看待审核内容</Button>
          <Button v-if="status === '2' && updateShowFlag" @click="changeUpdate">查看已上架内容</Button>
        </div>
        <div class="content">
          <p class="title" v-if="status === '2'">{{ updateShowFlag ? updateTitle : title }}</p>
          <p class="title" v-else>{{ title }}</p>
          <div v-if="status === '2'" v-html="updateShowFlag ? updateContent : content"></div>
          <div v-else v-html="content"></div>
        </div>
        <div v-if="!isButs" class="my-operation">
          <Button @click="submit" class="mainButton">提交审核</Button>
          <Button @click="save">保存草稿</Button>
          <Button @click="reset">重 置</Button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  data() {
    return {
      isShowConfirm: false, // 用于控制整个窗口的显示/隐藏
      title: '', // 标题
      content: '', // 内容
      isButs: false, // 按钮显示/隐藏
      updateTitle: '',
      updateContent: '',
      status: '',
      updateShowFlag: false,
      viewId: ''
    };
  },
  methods: {
    edit() {
      this.clickFun();
      this.$router.push({ name: 'edit', query: { viewid: this.viewId } });
    },
    changeUpdate() {
      this.updateShowFlag = !this.updateShowFlag;
    },
    show(view) {
      this.isButs = view.isButs; // true 按钮隐藏
      this.isShowConfirm = true;
      this.title = view.title;
      this.content = view.content;
      this.updateTitle = view.updateTitle;
      this.updateContent = view.updateContent;
      this.status = view.status;
      this.viewId = view.viewId;
      document.querySelector('body').setAttribute('style', 'overflow:hidden;');
    },
    clickFun() {
      this.isShowConfirm = false;
      document.body.removeAttribute('style');
    },
    submit() {
      this.clickFun();
      if (this.$route.path === '/edit') {
        this.$EventBus.$emit('editSubmit');
      } else {
        this.$EventBus.$emit('submit');
      }
    },
    save() {
      this.clickFun();
      if (this.$route.path === '/edit') {
        this.$EventBus.$emit('editSave');
      } else {
        this.$EventBus.$emit('save');
      }
    },
    reset() {
      this.clickFun();
      if (this.$route.path === '/edit') {
        this.$EventBus.$emit('editReset');
      } else {
        this.$EventBus.$emit('reset');
      }
    }
  }
};
</script>

<style lang="less" scoped>
.mainButton {
  background: #007bf6;
  color: #fff;
}
.mainButton:hover {
  background: #007bf6;
  color: #fff;
}
.my-confirm {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10008;
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  display: flex;
  overflow: hidden;
}

/* 进入和出去的动画 */
.confirm-fade-enter-active {
  animation: opacity 0.3s;
}
.confirm-fade-enter-active .confirm-content-wrap {
  animation: scale 0.3s;
}
.confirm-fade-leave-active {
  animation: outOpacity 0.2s;
}

/* 包裹层容器样式 */
.confirm-content-wrap {
  width: 760px;
  max-height: 680px;
  box-sizing: border-box;
  margin: auto;
  background-color: #fff;
  z-index: 999;
  user-select: none;
  border-radius: 2px;
  .operationArea {
    padding: 10px 20px;
    display: flex;
    flex-direction: row-reverse;
  }
}
.header-content {
  height: 54px;
  border-radius: 2px 2px 0 0;
  border-bottom: 1px solid #ebebeb;
  padding: 16px 24px;
  font-size: 16px;
  color: #000;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  .close {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
}
.content {
  overflow-y: auto;
  height: 564px;
  padding: 32px 32px 0 32px;
  color: #000;
  .title {
    font-size: 24px;
    font-weight: 500;
    margin-bottom: 35px;
    color: #000;
  }
  h1 {
    font-size: 20px;
    font-weight: 500;
    color: #2e2f33;
    line-height: 28px;
    margin-bottom: 20px;
  }
  h2 {
    font-size: 16px;
    font-weight: 500;
    color: #2e2f33;
    line-height: 22px;
  }
  h3 {
    font-size: 14px;
    font-weight: 500;
    color: #2e2f33;
    line-height: 20px;
    margin-top: 16px;
    margin-bottom: 8px;
  }
  p {
    font-size: 14px;
    font-weight: 400;
    color: #5c5e66;
    line-height: 24px;
  }
}

/* 底部按钮样式 */
.my-operation {
  display: flex;
  flex-direction: row-reverse;
  border-top: 0.01rem solid #ebebeb;
  padding-right: 12px;
  padding-top: 15px;
  padding-bottom: 16px;
  height: 64px;
}

/* 进来的动画 */
@keyframes opacity {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
@keyframes scale {
  0% {
    transform: scale(0);
  }
  60% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* 出去的动画 */
@keyframes outOpacity {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>

<style>
h1 {
  font-size: 20px;
  font-weight: 500;
  color: #2e2f33;
  line-height: 28px;
  margin-bottom: 20px;
}
h2 {
  font-size: 16px;
  font-weight: 500;
  color: #2e2f33;
  line-height: 22px;
}
h3 {
  font-size: 14px;
  font-weight: 500;
  color: #2e2f33;
  line-height: 20px;
  margin-top: 16px;
  margin-bottom: 8px;
}
p {
  font-size: 14px;
  font-weight: 400;
  color: #5c5e66;
  line-height: 24px;
}
li {
  list-style: none;
}
</style>
