export const volume = {

    isDragging: false,

    btnMute: document.querySelector('.btn_big_voice'),

    progress: document.querySelector('.player_voice'),

    drag(audio) {

        document.body.classList.add('user-select-none');
        const move = (e) => {
            if (!this.isDragging) return
            this.update(e.clientX)
        }

        const up = (e) => {
            if (!this.isDragging) return
            this.isDragging = false
            document.body.classList.remove('user-select-none')

            const number = this.update(e.clientX)
            audio.volume = number
            if (number === 0) {
                this.btnMute.classList.add('btn_big_voice--no')
            } else {
                this.btnMute.classList.remove('btn_big_voice--no')
            }

            document.removeEventListener('mousemove', move)
            document.removeEventListener('mouseup', up)
        }

        const inner = this.progress.querySelector('.player_progress__inner');

        // 鼠标按下开始拖动
        inner.addEventListener('mousedown', (e) => {
            this.isDragging = true;

            e.preventDefault();
            this.update(e.clientX)

            // 鼠标移动更新进度
            document.addEventListener('mousemove', move)

            // 鼠标释放结束拖动
            document.addEventListener('mouseup', up);
        })
    },

    muted(audio) {
        const muted = () => {
            audio.muted = !audio.muted
            this.btnMute.classList.toggle('btn_big_voice--no');
            let span = this.btnMute.querySelector('.icon_txt');
            span.textContent = this.btnMute.classList.contains('no') ? '打开声音' : '关闭声音';
        }
        this.btnMute.addEventListener('click', muted)
    },

    update(x) {
        const bar = this.progress.querySelector('.player_progress__inner')
        const dot = bar.querySelector('.player_progress__play')
        const rect = bar.getBoundingClientRect()
        const percent = (x - rect.left) / rect.width;
        const clamped = Math.max(0, Math.min(1, percent));
        dot.style.width = `${clamped * 100}%`
        return clamped
    }
}