import { addIcons, OhVueIcon } from 'oh-vue-icons';
import { FaTrash, FaEdit, FaBars } from 'oh-vue-icons/icons';
import { createApp } from 'vue';
import App from './App.vue';
import ToastPlugin from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-default.css';

addIcons(FaTrash, FaEdit, FaBars);

import './styles/global.scss';
import router from './routes/Router';

const app = createApp(App);
app.use(ToastPlugin);
app.use(router);
app.component('v-icon', OhVueIcon);

app.mount('#app');
