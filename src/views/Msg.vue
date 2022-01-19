<template>
  <div class="create-idea">
    <div class="content">
      <div>
        <span class="title"><span class="necessary">*</span>标题</span>
        <Input v-model="viewTitle" placeholder="输入观点标题" class="ideaHeader" clearable maxlength="50" show-word-limit />
      </div>
      <div class="operation">
        <Button @click="preview" :disabled="buttonDisabled">预 览</Button>
        <Dropdown>
          <Button type="primary">
            加载模板
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem v-if="template.length === 0">暂无模板</DropdownItem>
            <DropdownItem v-for="item in template" :key="item.id" @click.native="selectTemplate(item)">{{ item.name }}</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div class="editor">
        <span class="title"><span class="necessary">*</span>正文</span>
        <div id="edit"></div>
      </div>
      <div class="function">
        <Button @click="submit" :disabled="buttonDisabled" class="mainButton">提交审核</Button>
        <Button @click="save" :disabled="buttonDisabled">保存草稿</Button>
        <Button @click="reset">重 置</Button>
      </div>
      <!--上传图片对话框-->
      <Modal v-model="modal1" title="上传图片" width="480" @on-ok="ok" @on-cancel="cancel">
        <Upload
          ref="upload"
          type="drag"
          :before-upload="handleUpload"
          :headers="authorization"
          :data="{ file: fileName, viewId: viewId || '' }"
          :on-success="onSuccess"
          :on-remove="remove"
          :on-exceeded-size="exceeded"
          :on-format-error="formError"
          :action="uploadImgPath"
          :format="['jpg', 'png']"
          :max-size="3072"
        >
          <div style="padding: 20px 0">
            <img src="../assets/imgs/icon-upload.png" class="icon-upload" />
            <p style="color:#007BF6">点击上传图片</p>
          </div>
        </Upload>
        <p class="restrict">
          支持jpg、png格式的图片，大小不超过3M<span class="tip" v-show="tipshow">文件大小不符合规范!</span>
          <span class="tip" v-show="formTipshow">文件格式不符合规范！</span>
        </p>
      </Modal>
      <!--预览-->
      <Preview ref="preview" />
    </div>
  </div>
</template>

<script>
import E from 'wangeditor';
import { allTemplate, viewSave, viewSubmitAudit } from '../api';
import path from '../utils/path';
import Preview from '../components/preview.vue';

export default {
  components: { Preview },
  data() {
    return {
      viewId: null, // 观点id
      viewTitle: '', // 标题
      editor: null, // 富文本编辑器
      modal1: false, // 上传图片弹框是否展示标志
      fileName: '', // 文件名
      src: '', // 后台返回图片路径
      uploadImgPath: path.apibaseUrl + path.uploadImg, // 上传图片路径
      buttonDisabled: false, // 控制按钮是否可点击
      savingFlag: false, // 保存草稿节流标志
      template: [], // 观点模板
      filePathList: [], // 观点路径
      tipshow: false, // 文件发小不符合规范提示
      formTipshow: false // 文件格式不符合规范提示
    };
  },
  created() {
    this.getAlltemplate();
    this.$EventBus.$on('submit', () => {
      this.submit();
    });
    this.$EventBus.$off('save');
    this.$EventBus.$on('save', () => {
      this.save();
    });
    this.$EventBus.$on('reset', () => {
      this.reset();
    });
  },
  mounted() {
    this.editor = new E('#edit');
    this.editor.config.menus = ['undo', 'redo', 'image', 'head', 'bold', 'underline', 'strikeThrough', 'italic', 'list'];
    this.editor.create();
    this.initImg();
    this.setEditHeight();
  },
  computed: {
    authorization() {
      return {
        Authorization: localStorage.getItem('Authorization')
      };
    }
  },
  methods: {
    // 编辑区高度控制
    setEditHeight() {
      const mainH = document.body.clientHeight;
      document.querySelector('body').setAttribute('style', 'overflow:hidden;');
      document.getElementById('edit').style.height = `${mainH - 270}px`;
      document.querySelector('.w-e-text-container').style.height = `${mainH - 302}px`;
    },
    // 选择模板
    selectTemplate(item) {
      this.editor.txt.html(item.content);
    },
    getAlltemplate() {
      allTemplate().then(({ data }) => {
        this.template.push(...data);
      });
    },
    checkView() {
      return new Promise((resolve, reject) => {
        const contentLength = this.editor.txt.text().length; // 观点内容长度
        const contentHtml = this.editor.txt.html(); // 观点内容
        let desc = '';
        if (!this.viewTitle.trim()) {
          desc = '观点标题不能为空';
        } else if (!contentHtml) {
          desc = '观点内容不能为空';
        } else if (contentLength > 10000) {
          desc = '观点内容长度大于10000';
        }
        if (desc) {
          this.buttonDisabled = true;
          this.$Notice.error({
            title: '观点不符合规范',
            desc,
            onClose: () => {
              this.buttonDisabled = false;
            }
          });
          this.savingFlag = false;
          reject();
        }
        resolve();
      });
    },
    submit() {
      this.checkView().then(
        () => {
          const params = {
            filePathList: this.filePathList,
            viewContent: this.editor.txt.html(), // 内容
            viewTitle: this.viewTitle, // 标题
            viewId: this.viewId
          };
          if (!this.viewId) {
            params.filePathList = this.filePathList;
          }
          viewSubmitAudit(params).then(({ data }) => {
            if (data && data.viewId) {
              this.$Message.success({
                content: '提交审核成功'
              });
              this.viewId = '';
              this.viewTitle = '';
              this.editor.txt.clear();
            }
          });
        },
        () => {}
      );
    },
    // 观点保存，使用节流控制500毫秒触发一次
    save() {
      if (this.savingFlag) return;
      this.savingFlag = true;
      setTimeout(() => {
        this.checkView().then(
          () => {
            const param = {
              viewTitle: this.viewTitle,
              viewContent: this.editor.txt.html(),
              viewId: this.viewId,
              filePathList: []
            };
            if (!this.viewId) {
              param.filePathList = this.filePathList;
            }
            viewSave(param).then(({ data }) => {
              if (data && data.viewId) {
                this.savingFlag = false;
                this.viewId = data.viewId;
                this.$Message.success({
                  content: '保存草稿成功'
                });
              }
            });
          },
          () => {}
        );
      }, 500);
    },
    // 预览
    preview() {
      this.checkView().then(
        () => {
          this.$refs.preview.show({ title: this.viewTitle, content: this.editor.txt.html() });
        },
        () => {}
      );
    },
    // 重置
    reset() {
      this.viewTitle = '';
      this.editor.txt.clear();
      this.$Message.success({
        content: '重置成功'
      });
    },
    operate() {
      document.querySelectorAll('.w-e-panel-container')[0].style.display = 'none';
      this.modal1 = true;
    },
    initImg() {
      document.querySelectorAll('.w-e-menu')[2].addEventListener('click', this.operate);
      document.querySelectorAll('.w-e-menu')[9].style.display = 'none'; // 隐藏全屏功能
      document.querySelectorAll('.w-e-menu')[3].addEventListener('click', () => {
        document.querySelectorAll('.w-e-dp-title')[0].style.display = 'none';
        const li = document.querySelectorAll('.w-e-menu li');
        li.forEach((item, index) => {
          if ([3, 4].includes(index)) {
            item.style.display = 'none';
          }
        });
      });
    },
    ok() {
      this.$refs.upload.clearFiles(); // 上传组件清除文件路径
      if (this.src) {
        this.editor.cmd.do('insertHtml', '<img src="' + this.src + '" style="max-width:100%;"/>');
      }
      this.src = '';
    },
    cancel() {
      this.$refs.upload.clearFiles();
    },
    handleUpload(file) {
      this.$refs.upload.clearFiles(); // 上传图片时清楚原有图片
      const img = new Image();
      img.src = this.src;
      const URL = window.URL || window.webkitURL;
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        console.log('图片高度', img.width, img.height);
      };
      this.fileName = file.name;
      let promise = new Promise(resolve => {
        this.$nextTick(() => {
          resolve(true);
        });
      });
      return promise;
    },

    onSuccess(res) {
      if (!this.viewId) {
        this.filePathList.push(res.data.filePath);
      } else {
        this.filePathList = [];
      }
      this.src = `${path.imgBaseUrl}/${res.data.filePath}`;
    },
    remove() {
      this.filePathList.shift();
      this.src = '';
    },
    exceeded() {
      this.tipshow = true;
      setTimeout(() => {
        this.tipshow = false;
      }, 5000);
    },
    formError() {
      this.formTipshow = true;
      setTimeout(() => {
        this.formTipshow = false;
      }, 5000);
    }
  }
};
</script>

<style lang="less" scoped>
.icon-upload {
  width: 60px;
  height: 60px;
}
.mainButton {
  background: #007bf6;
  color: #fff;
}
.mainButton:hover {
  background: #007bf6;
  color: #fff;
}
/deep/.w-e-toolbar h1 {
  font-size: 20px !important;
}
/deep/.w-e-toolbar h2 {
  font-size: 16px !important;
}
/deep/.w-e-toolbar h3 {
  font-size: 14px !important;
}
/deep/.w-e-toolbar p {
  font-size: 14px !important;
}
/deep/.ivu-select-dropdown {
  z-index: 100001 !important;
}
/deep/.w-e-menu {
  width: 30px;
  height: 30px;
}
/deep/.ivu-modal-mask {
  z-index: 10005 !important;
}
/deep/.ivu-modal-wrap {
  z-index: 10005 !important;
  display: flex;
  justify-content: center;
  align-items: center;
}
/deep/.ivu-modal {
  top: 0;
}
/deep/.ivu-upload-drag {
  background: #fafafa;
  height: 180px;
  display: flex;
  justify-content: center;
  align-items: center;
}
/deep/.w-e-text-container {
  background: #fafafa;
}
/deep/.ivu-btn-default {
  margin-left: 12px;
}
/deep/.w-e-text {
  padding-left: 40px;
}
/deep/.placeholder {
  left: 40px;
}
/deep/.ivu-modal-header {
  border-bottom: none;
}
button {
  background: linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%);
  border-radius: 2px;
  border: 1px solid #ebebeb;
  font-size: 14px;
  color: #5c5e66;
  min-width: 80px;
  margin-left: 12px;
}
button:hover {
  border: 1px solid rgba(0, 123, 246, 0.5);
  font-weight: 500;
  color: #007bf6;
}
button:active {
  border: 1px solid #007bf6;
  font-weight: 500;
  color: #007bf6;
}
.restrict {
  margin-top: 24px;
  margin-bottom: 8px;
  height: 20px;
  font-size: 14px;
  font-weight: 400;
  color: #8a8e99;
  line-height: 20px;
  display: flex;
  .tip {
    color: #e72b2b;
    margin-left: auto;
  }
}
.create-idea {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  padding-top: 32px;
  padding-bottom: 24px;
  background: #fff;
  .title {
    display: inline-block;
    width: 36px;
    height: 22px;
    line-height: 22px;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    margin-right: 12px;
    .necessary {
      color: #e72b2b;
    }
  }
  .content {
    width: 848px;
    input::-webkit-input-placeholder {
      color: #b8bdcc;
    }
    .ideaHeader {
      width: 800px;
      height: 32px;
      background: #ffffff;
      border-radius: 2px;
    }
  }
  .operation {
    display: flex;
    flex-direction: row-reverse;
    margin-top: 24px;
    margin-bottom: 16px;
  }
  .editor {
    display: flex;
    #edit {
      width: 800px;
    }
  }
  .function {
    display: flex;
    flex-direction: row-reverse;
    margin-top: 24px;
    button {
      margin-left: 12px;
    }
  }
}
</style>
