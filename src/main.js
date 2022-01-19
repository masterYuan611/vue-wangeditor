import Vue from 'vue';
import axios from 'axios';
import ViewUI from 'view-design';
import Vconsole from 'vconsole';
import App from './App';
import store from './store';
import router from './router';
import 'view-design/dist/styles/iview.css';
import './permission';

new Vconsole();

Vue.config.productionTip = false;
Vue.use(ViewUI);

Vue.prototype.$axios = axios;
Vue.prototype.$EventBus = new Vue();

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
});
