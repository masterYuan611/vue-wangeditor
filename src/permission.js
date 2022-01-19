import { LoadingBar } from 'view-design';
import router from './router';
import { getDocumentTitle } from './utils';

// 是否有菜单数据
router.beforeEach(async (to, from, next) => {
  document.title = getDocumentTitle(to.meta.title);
  LoadingBar.start();
  next();
});

router.afterEach(() => {
  LoadingBar.finish();
});
