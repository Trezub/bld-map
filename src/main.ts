import { addIcons, OhVueIcon } from 'oh-vue-icons';
import { FaTrash, FaEdit, FaBars } from 'oh-vue-icons/icons';
import { createApp } from 'vue';
import VueGoogleMaps from '@fawmi/vue-google-maps';
import App from './App.vue';

addIcons(FaTrash, FaEdit, FaBars);

import './styles/global.scss';
import router from './routes/Router';

const app = createApp(App);
app.use(router);
app.component('v-icon', OhVueIcon);
// app.use(VueGoogleMaps, {
//   load: {
//     key: '',
//     language: 'pt-br',
//     libraries: 'geometry',
//     installComponents: true,
//   },
// });

app.mount('#app');
