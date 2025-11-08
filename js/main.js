import { common } from './common.js';
import { Player } from './player.js';

(async function init() {
    const data = await common.loadJson('./data.json');
    const player = new Player(data);
    player.init();
})();
