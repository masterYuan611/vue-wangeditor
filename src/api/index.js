import request from '@/utils/request';

const api = {
  viewSave: '/view/save', // 保存草稿功能
  viewSubmitAudit: '/view/submit/audit', // 提交审核观点
  allTemplate: 'view/query/all/template', // 查询所有的观点模板
  viewSearch: '/view/search', // 观点列表——查询观点
  viewDelete: '/view/delete', // 删除草稿
  viewDetail: '/view/detail', // 观点详情
  qyAuth: '/qy/auth' // 授权登录
};

// 根据观点id查询观点内容
export function viewDetail(params) {
  return request.get(api.viewDetail, { params });
}

// 删除草稿功能
export function viewDelete(param) {
  return request.post(`${api.viewDelete}?viewId=${param.viewId}`);
}

// 保存草稿功能
export function viewSave(params) {
  return request.post(api.viewSave, params);
}

// 提交审核观点
export function viewSubmitAudit(params) {
  return request.post(api.viewSubmitAudit, params);
}

// 查询所有的观点模板
export function allTemplate() {
  return request.get(api.allTemplate);
}

export function viewSearch(param) {
  return request.get(api.viewSearch, { params: param });
}

export function qyAuth(param) {
  return request.post(api.qyAuth, param);
}
