import { App } from "vue";
import pl_player from "./pl-player";

const components = [ pl_player ];

const install = (app: App): void => {
    components.map(component => app.component(component.name, component))
}

export {
    pl_player
}

export default {
    install
}