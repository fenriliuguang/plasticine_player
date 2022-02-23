import { App } from "vue";
import pl_player from './src/pl-player.vue'

pl_player.install = (app: App):void => {
    app.component(pl_player.name, pl_player)
}

export default pl_player