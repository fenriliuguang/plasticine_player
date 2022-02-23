import { createApp } from 'vue'
import App from './App.vue'
import pl_player from '~/index'

createApp(App)
    .use(pl_player)
    .mount('#app')
