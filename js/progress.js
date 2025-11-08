export const progress = {

    //是否拖拽中
    isDragging: false,

    //进度条元素
    progressBar: document.querySelector('.player_progress'),

    /**
     * 进度条拖转
     * @param {HTMLElement} audio - 播放器
     * @param {HTMLElement} btn - 播放按钮
     * @param callback
     * @param args
     */
    drag(audio, btn, callback, args = []) {
        document.body.classList.add('user-select-none');

        const move = (e) => {
            if (!this.isDragging) return
            this.updateByClientX(e.clientX)
        }

        const up = (e) => {
            if (!this.isDragging) return
            this.isDragging = false
            document.body.classList.remove('user-select-none')

            const percent = this.updateByClientX(e.clientX);
            audio.currentTime = percent * (parseFloat(this.progressBar.dataset.duration) || 0)

            btn.classList.add('btn_big_play--pause');

            if (audio.paused) {
                audio.play()
            }

            if (typeof callback === 'function') {
                callback(...args);
            }

            document.removeEventListener('mousemove', move)
            document.removeEventListener('mouseup', up)
        }

        // 鼠标按下开始拖动
        this.progressBar.addEventListener('mousedown', (e) => {
            this.isDragging = true;

            e.preventDefault();
            this.updateByClientX(e)

            // 鼠标移动更新进度
            document.addEventListener('mousemove', move)

            // 鼠标释放结束拖动
            document.addEventListener('mouseup', up);
        })
    },

    /**
     * 更新进度条进度
     * @param {number} clientX - 总时长
     */
    updateByClientX(clientX) {
        let bar = this.progressBar.querySelector('.player_progress__play')
        let inner = this.progressBar.querySelector('.player_progress__inner')
        const rect = inner.getBoundingClientRect()
        let res = ((clientX - rect.left) / rect.width)
        let percent = Math.min(Math.max(res * 100, 0), 100).toFixed(2)
        bar.style.width = `${percent}%`
        return res
    },

    /**
     * 更新进度条进度
     * @param {number} current - 当前播放时间（秒）
     */
    updateByTime(current) {
        let bar = this.progressBar.querySelector('.player_progress__play')
        const duration = parseFloat(this.progressBar.dataset.duration) || 0
        let percent = duration ? ((current / duration) * 100).toFixed(2) : 0
        bar.style.width = `${percent}%`
    },

    /**
     * 初始化进度条
     * @param {HTMLElement} audio - audio元素
     * @param {string} duration - 总时长（秒）
     */
    init(audio, duration) {
        this.progressBar.dataset.duration = duration; // 保存总时长，方便更新
    }

}