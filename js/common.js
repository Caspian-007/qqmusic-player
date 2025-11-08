export const common = {
    /**
     * 将时间字符串（如 "03:45" 或 "01:02:30"）解析为秒数
     * @param {string} timeStr - 需要解析的时间字符串
     * @returns {number} 秒数
     */
    parseTimeString(timeStr) {
        if (!timeStr || typeof timeStr !== 'string') return 0;
        const parts = timeStr.split(':').map(Number).filter(n => !isNaN(n));

        if (parts.length === 2) {
            const [minutes, seconds] = parts;
            return minutes * 60 + seconds;
        } else if (parts.length === 3) {
            const [hours, minutes, seconds] = parts;
            return hours * 3600 + minutes * 60 + seconds;
        }
        return 0;
    },

    /**
     * 将秒数格式化为 "mm:ss" 或 "hh:mm:ss"
     * @param {number} totalSeconds - 需要格式化的总秒数
     * @returns {string} 格式化后的时间字符串
     */
    formatSeconds(totalSeconds) {
        if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);

        return hours > 0
            ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    },

    /**
     * 异步加载 JSON 文件（带错误处理）
     * @param {string} url - JSON 文件的路径或 URL
     * @returns {Promise<object|null>} 解析后的 JSON 数据
     */
    async loadJson(url) {
        try {
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error(`请求失败: ${res.status} ${res.statusText}`);
            }
            return await res.json();
        } catch (err) {
            console.error(`[loadJson] 加载失败: ${url}`, err);
            return null;
        }
    },

    /**
     * 二分查找算法找歌词下标
     * @param {Array} lyrics - 歌词数组
     * @param {number} current - 当前时间
     * @returns {number} 当前歌词索引
     */
    binarySearch(lyrics, current) {
        if (!lyrics || lyrics.length === 0) return
        let low = 0, high = lyrics.length - 1
        let index = 0
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (lyrics[mid].time <= current) {
                index = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return index
    }
};
