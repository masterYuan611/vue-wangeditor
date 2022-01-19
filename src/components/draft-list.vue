<template>
  <!-- 我的观点列表 -->
  <div class="my-view-list">
    <div class="card">
      <div class="search flex-center">
        <span class="mr-12">观点标题</span>
        <Input v-model="viewTitle" placeholder="请输入" style="width: auto" />
      </div>
      <div class="btns flex-center">
        <button class="reset" @click="reset">重置</button>
        <button class="match" @click="search">查询</button>
      </div>
    </div>
    <div class="content">
      <Table :columns="tabDraftHeader" :data="draftList">
        <template slot-scope="{ row }" slot="viewTitle">
          <p class="view-title" @click="preview(row)">{{ row.viewTitle }}</p>
        </template>
        <template slot-scope="{ row }" slot="status">
          <span>{{ row.status == '0' ? '草稿' : '--' }}</span>
        </template>
        <template slot="active" slot-scope="{ row }">
          <button class="active-btn" @click="edit(row)">编辑</button>
          <span class="line">|</span>
          <button class="active-btn" @click="onClickDel(row)">删除</button>
        </template>
      </Table>
      <div class="page" v-if="total > 0">
        <Page
          :total="total"
          :current="pageNum"
          :page-size="pageSize"
          show-sizer
          show-elevator
          :page-size-opts="[20, 30, 40]"
          @on-change="onChangePage"
          @on-page-size-change="onChangePageSize"
          @on-prev="onChangePrev"
          @on-next="onChangeNext"
        />
      </div>
    </div>
    <Modal v-model="delModal" width="480">
      <p slot="header">
        <span class="model-title">确定删除</span>
      </p>
      <div class="modal-content">
        <img class="icon-img-tip" src="../assets/imgs/icon-tip.png" />
        <p>是否删除该观点?</p>
      </div>
      <div slot="footer" class="footer-button">
        <Button @click="onCancel">取消</Button>
        <Button type="primary" @click="onSureDel">确定</Button>
      </div>
    </Modal>
    <!-- 查看 -->
    <Preview ref="preview" />
  </div>
</template>
<script>
import { viewSearch, viewDelete, viewDetail } from '../api';
import Preview from './preview.vue';

export default {
  components: { Preview },
  name: 'draft-list',
  data() {
    return {
      viewTitle: '', // 搜索的标题
      status: 'draft', // 状态
      total: 0,
      pageNum: 1, // 当前页码
      pageSize: 20, // 每页记录数
      tabDraftHeader: [
        {
          title: '观点标题',
          key: 'viewTitle',
          // width: '320px',
          slot: 'viewTitle'
        },
        {
          title: '创建时间',
          key: 'addDate'
          // minWidth: 200
        },
        {
          title: '状态',
          key: 'status',
          // minWidth: 110,
          slot: 'status'
        },
        {
          title: '操作',
          key: 'active',
          // width: '150px',
          slot: 'active'
        }
      ],
      draftList: [], // 草稿观点
      delModal: false,
      viewId: 0
    };
  },
  created() {
    // 列表
    this.searchRequest();
  },
  methods: {
    // 查看
    preview(row) {
      const param = {
        viewId: row.viewId
      };
      viewDetail(param).then(({ data }) => {
        if (data) {
          this.$refs.preview.show({ title: data.viewTitle, content: data.viewContent, isButs: true });
        }
      });
    },
    // 删除确定
    onSureDel() {
      this.detaleRequest();
      this.delModal = false;
    },
    onCancel() {
      this.delModal = false;
      this.viewId = 0;
    },
    // 删除按钮
    onClickDel(e) {
      this.viewId = e.viewId;
      this.delModal = true;
    },
    // 重置按钮
    reset() {
      this.total = 0;
      this.pageNum = 1; // 当前页码
      this.viewTitle = '';
      this.searchRequest();
    },
    onChangePage(e) {
      this.pageNum = e;
      this.searchRequest();
    },
    onChangePageSize(e) {
      this.pageSize = e;
      this.searchRequest();
    },
    onChangePrev(e) {
      this.pageNum = e;
      this.searchRequest();
    },
    onChangeNext(e) {
      this.pageNum = e;
      this.searchRequest();
    },
    // 查询按钮
    search() {
      this.total = 0;
      this.pageNum = 1; // 当前页码
      //   请求
      this.searchRequest();
    },
    // 列表接口
    searchRequest() {
      const param = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        status: this.status,
        viewTitle: this.viewTitle
      };
      viewSearch(param).then(({ data }) => {
        if (data) {
          this.pageNum = data.pageNum;
          this.total = data.totalNum;
          this.draftList = data.rows;
        }
      });
    },
    // 删除接口
    detaleRequest() {
      const param = {
        viewId: this.viewId
      };
      viewDelete(param).then(({ retCode }) => {
        if (retCode == 'SUCCESS') {
          this.searchRequest();
        }
      });
    },
    // 编辑
    edit(row) {
      this.$EventBus.$emit('edit', row.viewId);
    }
  }
};
</script>

<style lang="less" scoped>
// 删除弹窗样式
::v-deep .ivu-modal-content {
  border-radius: 2px;
}
::v-deep .model-title {
  font-size: 16px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 500;
  color: #000000;
  line-height: 22px;
}
::v-deep .ivu-modal-mask {
  z-index: 10005 !important;
}
::v-deep .ivu-modal-wrap {
  z-index: 10005 !important;
  display: flex;
  justify-content: center;
  align-items: center;
}
::v-deep .ivu-modal {
  top: 0;
}
::v-deep .ivu-modal-footer {
  border-top: none;
}
::v-deep .ivu-modal-header {
  padding: 16px 24px;
}
::v-deep .ivu-modal-body {
  padding: 24px;
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #5c5e66;
  line-height: 24px;
}
::v-deep .footer-button {
  height: 32px;
  padding-right: 6px;
  margin: 16px 0;
  .ivu-btn {
    width: 80px;
    height: 32px;
    line-height: 32px;
    font-size: 14px;
    border-radius: 2px;
    background: #007bf6;
    &:first-child {
      background: linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%);
      border: 1px solid #ebebeb;
      color: rgba(0, 0, 0, 0.65);
      &:hover {
        border: 1px solid rgba(0, 123, 246, 0.5);
        color: #007bf6;
      }
      &:active {
        border: 1px solid #007bf6;
        color: #007bf6;
      }
    }
    &:last-child {
      background: #007bf6;
      border: 1px solid #007bf6;
      color: #fff;
      &:hover {
        background: rgba(0, 123, 246, 0.8);
        border: 1px solid rgba(0, 123, 246, 0.8);
      }
      &:active {
        background: #0b6dcf;
        border: 1px solid #0b6dcf;
      }
    }
  }
}
.modal-content {
  display: flex;
  align-items: center;
  .icon-img-tip {
    width: 20px;
    height: 20px;
    margin-right: 4px;
  }
}

.my-view-list {
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #2e2f33;
  line-height: 22px;
  .mr-12 {
    margin-right: 12px;
  }
  .flex-center {
    display: flex;
    align-items: center;
  }
  .card {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    height: 80px;
    background: #ffffff;
    border-radius: 0px 0px 4px 4px;
    padding-left: 32px;
    min-width: 1000px;
    overflow: hidden;
    .search {
      margin-right: 32px;
    }
    .btns {
      .reset,
      .match {
        width: 88px;
        height: 32px;
        background: linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%);
        border-radius: 2px;
        border: 1px solid #ebebeb;
        color: #5c5e66;
      }
      .match {
        background: #007bf6;
        border: 1px solid #007bf6;
        color: #fff;
        margin-left: 12px;
      }
      button:hover,
      button:active {
        font-weight: 500;
      }
      .match:hover {
        background: rgba(0, 123, 246, 0.8);
        border: 1px solid rgba(0, 123, 246, 0.8);
      }
      .match:active {
        background: #0b6dcf;
        border: 1px solid #0b6dcf;
      }
      .reset:hover {
        border: 1px solid rgba(0, 123, 246, 0.5);
        color: #007bf6;
      }
      .reset:active {
        border: 1px solid #007bf6;
        color: #007bf6;
      }
    }
    ::v-deep .ivu-input {
      width: 272px;
      height: 32px;
      background: #ffffff;
      border-radius: 2px;
      border: 1px solid #ebebeb;
      padding: 5px 12px;
    }
    ::v-deep .ivu-radio-group-button.ivu-radio-group-small .ivu-radio-wrapper {
      border: none;
      color: #5c5e66;
      padding: 0 16px;
      &::before,
      &::after {
        display: none;
      }
    }
    ::v-deep .ivu-radio-group-button .ivu-radio-wrapper-checked {
      background: rgba(0, 123, 246, 0.1);
      border-radius: 2px;
      color: #007bf6;
      box-shadow: none;
    }
  }
  .btns {
    .reset,
    .match {
      width: 88px;
      height: 32px;
      background: linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%);
      border-radius: 2px;
      border: 1px solid #ebebeb;
      color: #5c5e66;
    }
    .match {
      background: #007bf6;
      border: 1px solid #007bf6;
      color: #fff;
      margin-left: 12px;
    }
    button:hover,
    button:active {
      font-weight: 500;
    }
    .match:hover {
      background: rgba(0, 123, 246, 0.8);
      border: 1px solid rgba(0, 123, 246, 0.8);
    }
    .match:active {
      background: #0b6dcf;
      border: 1px solid #0b6dcf;
    }
    .reset:hover {
      border: 1px solid rgba(0, 123, 246, 0.5);
      color: #007bf6;
    }
    .reset:active {
      border: 1px solid #007bf6;
      color: #007bf6;
    }
  }
  .content {
    padding: 27px 32px 24px;
    background: #ffffff;
    border-radius: 2px;
    margin-top: 8px;
    .page {
      margin-top: 25px;
      text-align: right;
    }
  }
  .view-title {
    width: 100%;
    padding: 10px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ::v-deep .ivu-table-tip table {
    min-height: 300px;
  }
  ::v-deep .ivu-table {
    border: 1px solid #f5f5f5;
    th {
      background: #f5f5f5;
      font-weight: 500;
      color: #2e2f33;
      line-height: 22px;
    }
    td {
      background: none;
      font-weight: 400;
      color: #5c5e66;
      line-height: 20px;
    }
    .ivu-table-cell {
      padding-left: 24px;
      padding-right: 24px;
    }
    .ivu-table-tbody {
      tr {
        background: #fafafa;
        &:first-child {
          background: #f5f5f5;
        }
        &:nth-child(odd) {
          background: #fff;
        }
      }
    }
  }
  .active-btn {
    border: none;
    background: none;
    padding-left: 0;
    padding-right: 0;
    color: #007bf6;
    padding: 10px 0;
    &:first-child {
      padding-right: 6px;
    }
    &:last-child {
      padding-left: 6px;
      padding-right: 10px;
    }
  }
  .line {
    color: #ebebeb;
  }
  ::v-deep .ivu-table-cell-slot .ivu-btn-small {
    padding: 0;
  }
  // 表格样式
  ::v-deep .ivu-table-cell {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ::v-deep .ivu-table-overflowX {
    overflow-x: hidden;
  }
  // 分页样式调整
  ::v-deep .ivu-page-item {
    border: 1px solid #ebebeb;
    border-radius: 2px;
  }
  ::v-deep .ivu-page-next {
    border: 1px solid #ebebeb;
    border-radius: 2px;
  }
  ::v-deep .ivu-page-prev {
    border: 1px solid #ebebeb;
    border-radius: 2px;
  }
  ::v-deep .ivu-select-selection {
    border: 1px solid #ebebeb;
    border-radius: 2px;
  }
  ::v-deep .ivu-page-options-elevator input {
    border: 1px solid #ebebeb;
    border-radius: 2px;
    text-align: center;
  }
  ::v-deep .ivu-page-item-active {
    background: #007bf6;
    border: 1px solid #007bf6;
    a {
      color: #fff;
    }
  }
  ::v-deep .ivu-table-header {
    .ivu-table-cell {
      font-weight: 600;
      font-family: PingFangSC-Medium, PingFang SC;
    }
  }
  ::v-deep .ivu-table td,
  ::v-deep .ivu-table th {
    border: none;
  }
}
</style>
