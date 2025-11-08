export const lyric = {

    //歌词填充区域
    lyric: document.querySelector('#qrc_ctn'),

    /**
     * 解析 LRC 格式歌词文本为时间+文本数组
     * @param {string} text - LRC 歌词字符串
     * @returns {{ time: number, text: string }[]} 歌词数组
     */
    parse(text) {
        const lines = text.split(/\r?\n/);
        const lyrics = [];
        const timeReg = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?]/g;

        for (const line of lines) {
            const timeMatches = [...line.matchAll(timeReg)];
            const text = line.replace(timeReg, '').trim();
            if (!text) continue
            for (const match of timeMatches) {
                const min = parseInt(match[1]);
                const sec = parseInt(match[2]);
                const ms = match[3] ? parseInt(match[3].padEnd(3, '0')) : 0;
                const time = min * 60 + sec + ms / 1000;
                lyrics.push({time, text});
            }
        }

        return lyrics.sort((a, b) => a.time - b.time);
    },

    /**
     * 渲染歌词到指定容器
     * @param {{ time: number, text: string }[]} lyrics - 歌词数组
     */
    render(lyrics) {
        this.lyric.innerHTML = '';
        lyrics.forEach((item, i) => {
            const p = document.createElement('p');
            p.innerHTML = `<span>${item.text}</span>`;
            p.dataset.index = i;
            this.lyric.appendChild(p);
        });
    },

    /**
     * 高亮当前歌词并自动滚动
     * @param {number} index - 当前歌词索引
     */
    highlight(index) {
        const prev = this.lyric.querySelector('p.on');
        if (prev) prev.classList.remove('on');

        const currentP = this.lyric.querySelector(`p[data-index="${index}"]`);
        if (currentP) {
            currentP.classList.add('on');

            const containerHeight = this.lyric.parentElement.clientHeight;
            const contentHeight = this.lyric.scrollHeight;
            const elOffsetTop = currentP.offsetTop;
            const elHeight = currentP.clientHeight;

            let translateY = 0;

            const fixedRow = Math.floor(containerHeight / 2.5 / elHeight);

            const num = elOffsetTop - fixedRow * elHeight
            if (num !== 0) {
                translateY = -num
            }

            // 边界限制
            const maxTranslate = 0;
            const minTranslate = containerHeight - contentHeight;
            translateY = Math.max(Math.min(translateY, maxTranslate), minTranslate);

            this.lyric.style.transform = `translateY(${translateY}px)`;
        }
    },

    wheel() {
        this.lyric.addEventListener('wheel', e => e.preventDefault(), { passive: false })
    }

}