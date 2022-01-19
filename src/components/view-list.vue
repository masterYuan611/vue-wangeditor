<template>
  <!-- 我的观点列表 -->
  <div class="my-view-list">
    <div class="card">
      <div class="search flex-center">
        <span class="mr-12">观点标题</span>
        <Input v-model="viewTitle" placeholder="请输入" style="width: auto" />
      </div>
      <div class="condition">
        <span class="mr-12">状态</span>
        <RadioGroup @on-change="changeRadio" v-model="btnRadio" type="button" size="small">
          <Radio label="全部"></Radio>
          <Radio label="待审核"></Radio>
          <Radio label="已上架"></Radio>
          <Radio label="已下架"></Radio>
          <Radio label="已驳回"></Radio>
        </RadioGroup>
      </div>
      <div class="btns flex-center">
        <button class="reset" @click="reset">重置</button>
        <button class="match" @click="search">查询</button>
      </div>
    </div>
    <div class="content">
      <Table :columns="viewTableHeader" :data="viewList" max-height="">
        <template slot-scope="{ row }" slot="viewTitle">
          <p class="view-title" @click="preview(row)">{{ row.viewTitle }}</p>
        </template>
        <template slot-scope="{ row }" slot="reviewTime">
          <span>{{ row.reviewTime ? row.reviewTime : '--' }}</span>
        </template>
        <template slot-scope="{ row }" slot="status">
          <div class="status-box">
            <span class="dot" :style="{ background: statusDotBg(row.status) }"></span>
            <span class="status">{{ statusFormatter(row.status) }}</span>
          </div>
        </template>
        <template slot-scope="{ row }" slot="active">
          <span @click="edit(row)" class="edit" :style="{ color: editFormatter(row.status).color }">{{
            editFormatter(row.status).txt
          }}</span>
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
    <!-- 查看 -->
    <Preview ref="preview" />
  </div>
</template>
<script>
import { viewSearch, viewDetail } from '../api';
import Preview from './preview.vue';

export default {
  components: { Preview },
  name: 'view-list',
  data() {
    return {
      btnRadio: '全部',
      viewTitle: '', // 搜索的标题
      status: 'all', // 状态
      total: 0,
      pageNum: 1, // 当前页码
      pageSize: 20, // 每页记录数
      viewTableHeader: [
        {
          title: '观点标题',
          key: 'viewTitle',
          width: '320px',
          slot: 'viewTitle',
          ellipsis: true
        },
        {
          title: '创建时间',
          key: 'addDate',
          width: '200px'
        },
        {
          title: '提交时间',
          key: 'submitDate',
          width: '200px'
        },
        {
          title: '审核时间',
          key: 'reviewTime',
          width: '200px',
          slot: 'reviewTime'
        },
        {
          title: '审核反馈',
          key: 'auditFeedback',
          width: '200px',
          ellipsis: true,
          slot: 'auditFeedback',
          render: (h, params) =>
            h(
              'Tooltip',
              {
                props: {
                  placement: 'top-start',
                  transfer: true, // 提示框一直被th遮挡，添加此属性后就不在被遮挡
                  'max-width': '200' // 设最大宽度，添加此属性后文字太长会换行，否则浮窗里只会显示一些文字，多余的文字在浮窗外且看不见
                }
              },
              [
                h(
                  'span',
                  {
                    style: {
                      display: 'block',
                      width: '180px',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'normal',
                      overflow: 'hidden'
                    }
                  },
                  params.row.auditFeedback ? params.row.auditFeedback : '--'
                ),
                h(
                  'span',
                  {
                    slot: 'content',
                    style: {
                      whiteSpace: 'normal',
                      wordBreak: 'break-all'
                    }
                  },
                  params.row.auditFeedback ? params.row.auditFeedback : '--'
                )
              ]
            ),
          resizable: true,
          tooltip: true,
          align: 'left'
        },
        {
          title: '状态',
          key: 'status',
          minWidth: 230,
          // maxWidth: 400,
          slot: 'status'
        },
        {
          title: '操作',
          key: 'active',
          width: '80px',
          slot: 'active',
          className: 'active-box',
          fixed: 'right'
        }
      ],
      viewList: []
    };
  },
  created() {
    this.searchRequest();
    // document.getElementsByClassName(".ivu-table-tip")
  },
  mounted() {},
  methods: {
    // 查看
    preview(row) {
      const param = {
        viewId: row.viewId
      };
      viewDetail(param).then(({ data }) => {
        if (data) {
          this.$refs.preview.show({
            title: data.viewTitle, // 标题
            content: data.viewContent, // 内容
            updateTitle: data.updateViewTitle, // 观点更新后标题
            updateContent: data.updateViewContent, // 观点更新后内容
            status: data.status, // 观点状态
            viewId: row.viewId,
            isButs: true
          });
        }
      });
    },
    // 编辑
    edit(row) {
      this.$EventBus.$emit('edit', row.viewId);
    },
    // 编辑处理
    editFormatter(status) {
      let color = '';
      let txt = '';
      if (status == 3 || status == 4 || status == 5) {
        txt = '编辑';
        color = '#007BF6';
      } else {
        txt = '--';
      }
      return { txt, color };
    },
    // 状态处理
    statusFormatter(status) {
      let type = '';
      if (status == 1) {
        type = '待审核';
      } else if (status == 2) {
        type = '已上架（更新待审核）';
      } else if (status == 3) {
        type = '已驳回';
      } else if (status == 4) {
        type = '已上架（更新已驳回）';
      } else if (status == 5) {
        type = '已上架';
      } else if (status == 6) {
        type = '已下架';
      }
      return type;
    },
    statusDotBg(status) {
      let color = '';
      if (status == 2 || status == 4 || status == 5) {
        color = '#1890FF';
      } else if (status == 1) {
        color = '#F69B47';
      } else if (status == 3 || status == 6) {
        color = '#ccc';
      }
      return color;
    },
    // 状态切换处理
    changeRadio() {
      switch (this.btnRadio) {
        case '待审核':
          this.status = 'auditing';
          break;
        case '已上架':
          this.status = 'approve';
          break;
        case '已下架':
          this.status = 'removed';
          break;
        case '已驳回':
          this.status = 'reject';
          break;
        case '全部':
          this.status = 'all';
          break;
      }
    },
    reset() {
      this.total = 0;
      this.pageNum = 1; // 当前页码
      this.viewTitle = '';
      this.btnRadio = '全部';
      this.status = 'all';
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
    // 表格数据接口
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
          this.viewList = data.rows;
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
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
    min-width: 1050px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    height: 80px;
    background: #ffffff;
    border-radius: 0px 0px 4px 4px;
    padding-left: 32px;
    .search {
      margin-right: 32px;
    }
    .condition {
      display: flex;
      align-items: center;
      margin-right: 54px;
    }
    ::v-deep .ivu-radio-group-button.ivu-radio-group-small .ivu-radio-wrapper {
      height: 32px;
      line-height: 32px;
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
    ::v-deep .ivu-table-tip table {
      min-height: 300px;
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
      &:hover {
        color: #007bf6;
      }
    }
    ::v-deep .ivu-radio-group-button .ivu-radio-wrapper-checked {
      background: rgba(0, 123, 246, 0.1);
      border-radius: 2px;
      color: #007bf6;
      box-shadow: none;
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
  .status-box {
    display: flex;
    align-items: center;
    color: #5c5e66;
    .dot {
      display: inline-block;
      width: 4px;
      height: 4px;
      background: #1890ff;
      border-radius: 50%;
      margin-right: 10px;
    }
  }
  .edit {
    display: inline-block;
    width: 100%;
    padding: 10px 0;
  }

  ::v-deep .ivu-table-tip {
    min-height: 200px;
    table {
      min-height: 200px;
    }
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
  // 表格样式
  // ::v-deep .ivu-tooltip-rel,
  // ::v-deep .ivu-tooltip-rel p {
  //   max-width: 200px;
  //   overflow: hidden;
  //   text-overflow: ellipsis;
  //   white-space: nowrap;
  // }
  ::v-deep .ivu-table td {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  // ::v-deep .ivu-table-overflowX {
  //   // min-width: 1200px;
  //   overflow-x: auto;
  // }
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
  /* 定义滚动条样式 */
  ::-webkit-scrollbar {
    border-radius: 10px; //定义滚动条圆角
    height: 5px;
    background: #ebebeb;
  }

  /*定义滚动条轨道 内阴影+圆角*/
  ::-webkit-scrollbar-track {
    height: 5px;
    background: #ebebeb;
    border-radius: 3px;
    padding: 15px 0;
    width: 474px;
  }

  /*定义滑块 内阴影+圆角*/
  ::-webkit-scrollbar-thumb {
    height: 5px;
    border-radius: 3px;
    background: #cccccc;
    width: 300px;
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
@media all and (max-width: 1900px) {
  ::v-deep .ivu-table-fixed-right {
    box-shadow: -6px 0 20px 3px rgba(94, 94, 94, 0.1);
  }
}
@media all and (min-width: 1900px) {
  ::-webkit-scrollbar {
    width: 0 !important;
  }
  ::-webkit-scrollbar {
    width: 0 !important;
    height: 0;
  }
  ::v-deep .ivu-table-overflowX {
    overflow-x: hidden;
  }
  ::v-deep .ivu-table-fixed,
  ::v-deep .ivu-table-fixed-right {
    box-shadow: none;
  }
  ::v-deep .ivu-table-fixed-right {
    top: 1px;
    width: 300px;
    &::before {
      height: 0;
    }
  }
}
</style>
