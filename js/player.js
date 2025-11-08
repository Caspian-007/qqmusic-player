// player.js
import {common} from './common.js';
import {lyric} from './lyric.js';
import {progress} from './progress.js'
import {volume} from './volume.js'

export class Player {

    /**
     * @param {Object[]} data - 歌曲列表
     */
    constructor(data) {

        this.data = data;

        this.elements = {
            btnPlay: document.querySelector('.btn_big_play'),
            musicTime: document.querySelector('.player_music__time'),
            songList: document.querySelector('.songlist__list'),
            musicInfo: document.querySelector('.player_music__info'),
            songInfo: document.querySelector('.song_info__info'),
            btnLoop: document.querySelector('.btn_big_style_list')
        }

        this.modes = [
            {className: 'btn_big_style_list', title: '列表循环', text: '列表循环'},
            {className: 'btn_big_style_single', title: '单曲循环', text: '单曲循环'},
            {className: 'btn_big_style_random', title: '随机播放', text: '随机播放'},
            {className: 'btn_big_style_order', title: '顺序循环', text: '顺序循环'}
        ]

        this.currentTrackIndex = 0;
        this.audio = new Audio();
        this.lyrics = [];
        this.trackDuration = 0;
        this.currentLyricIndex = -1
        this.currentLoopIndex = 0
    }

    /** 初始化播放器 */
    init() {
        this.loadSongList(this.data)
        this.loadTrack(this.data[this.currentTrackIndex]);
        this.bindPlayEvents();
        this.progressDrag(this.audio, this.elements.btnPlay)
        this.isMuted(this.audio)
        this.lyricWheel()
        this.loop()
        this.volumeDrag(this.audio)
        this.audio.addEventListener('timeupdate', () => this.onTimeUpdate());
        this.audio.addEventListener('ended', () => this.loopPlay());
        this.btnSongListPlay(this.audio)
    }

    /** 加载歌曲及歌词 */
    loadTrack(song) {
        this.lyrics = this.lyricParse(song.lrc)
        this.trackDuration = common.parseTimeString(song.duration)
        this.lyricRender(this.lyrics)

        this.loadSongInfo(song)

        if (this.audio) this.audio.pause();
        this.audio.src = song.url

        this.progressInit(this.audio, this.trackDuration)

        this.updateTimeDisplay(0);
    }

    /** 更新时间显示和歌词高亮 */
    onTimeUpdate() {
        if (progress.isDragging) return
        let currentTime = this.audio.currentTime;

        this.updateTimeDisplay(currentTime);

        progress.updateByTime(currentTime)

        this.lyricHighlight(this.lyrics, currentTime)
    }

    /** 更新时间显示 */
    updateTimeDisplay(currentTime) {
        this.elements.musicTime.textContent = `${common.formatSeconds(currentTime)} / ${common.formatSeconds(this.trackDuration)}`;
    }

    /** 播放或暂停 */
    togglePlay() {
        const {btnPlay, songList} = this.elements
        if (this.audio.paused) {
            this.audio.play();
            btnPlay.classList.add('btn_big_play--pause');
            this.songListPlaying(this.currentTrackIndex, songList)
        } else {
            this.audio.pause();
            btnPlay.classList.remove('btn_big_play--pause');
            this.songListPaused(this.currentTrackIndex)
        }
    }

    /** 播放下一首 */
    loopPlay() {
        const {btnPlay, songList} = this.elements;
        const length = this.data.length;

        // 暂停当前播放
        btnPlay.classList.remove('btn_big_play--pause');
        this.songListPaused(this.currentTrackIndex)
        this.audio.pause();

        // 计算下一首索引
        let nextIndex = this.currentTrackIndex;

        switch (this.currentLoopIndex) {
            case 0: // 列表循环
                nextIndex = (nextIndex + 1) % length;
                break

            case 1: // 单曲循环
                break

            case 2: // 随机播放（排除当前）
                if (length === 1) break // 只有一首歌
                nextIndex = Math.floor(Math.random() * length)
                if (nextIndex >= this.currentTrackIndex) nextIndex += 1
                break

            case 3: // 顺序播放
                nextIndex += 1
                if (nextIndex >= length) return // 到末尾停止
                break

            default:
                console.warn('未知播放模式', this.currentLoopIndex)
                return
        }

        // 更新索引
        this.currentTrackIndex = nextIndex;

        // 加载并播放
        btnPlay.classList.add('btn_big_play--pause');
        this.loadTrack(this.data[this.currentTrackIndex]);

        this.audio.play();
        this.songListPlaying(this.currentTrackIndex, songList)
    }

    /** 绑定 UI 事件 */
    bindPlayEvents() {
        const {btnPlay} = this.elements;
        btnPlay.addEventListener('click', () => this.togglePlay());
    }

    /**
     *  加载当前播放歌曲信息
     *  @param {Object} song - 当前播放歌曲
     */
    loadSongInfo(song) {
        const {musicInfo, songInfo} = this.elements;
        // 渲染进度条上歌曲信息
        musicInfo.innerHTML = `
            <a title="${song.name}" rel="noopener noreferrer" href="">${song.name}</a> - 
            <a class="playlist__author" title="${song.singer}" href="">${song.singer}</a>
        `

        // 渲染右侧歌曲信息
        songInfo.innerHTML = `
            <a class="song_info__cover"
                                                    href="" rel="noopener noreferrer"><img
                            class="song_info__pic" loading="lazy"
                            src="${song.cover}"
                            alt="${song.name}"></a>
                        <div class="song_info__name">歌曲名：<a href=""
                                                               rel="noopener noreferrer">${song.name}</a>
                        </div>
                        <div class="song_info__singer">歌手：<a class="playlist__author" title="${song.singer}"
                                                               href="">${song.singer}</a>
                        </div>
                        <div class="song_info__album">专辑：<a href=""
                                                               rel="noopener noreferrer">${song.album}</a>
                        </div>
        `
    }

    /**
     *  加载歌曲列表
     *  @param {Array} data - 歌曲列表
     */
    loadSongList(data) {
        const {songList} = this.elements;
        songList.innerHTML = '';
        data.forEach((song, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="songlist__item songlist__item--even">
                                        <div class="sprite songlist__edit songlist__edit"><input type="checkbox"
                                                                                                 class="songlist__checkbox">
                                        </div>
                                        <div class="songlist__number songlist__number--top">${index + 1}</div>
                                        <div class="songlist__songname"><span class="songlist__songname_txt"><a
                                                title="${song.name}"
                                                href="">${song.name}</a></span>
                                            <div class="mod_list_menu"><a class="list_menu__item list_menu__play"
                                                                          title="播放"><i
                                                    class="list_menu__icon_play"></i><span class="icon_txt">播放</span></a><a
                                                    class="list_menu__item list_menu__add" title="添加到歌单"><i
                                                    class="list_menu__icon_add"></i><span
                                                    class="icon_txt">添加到歌单</span></a><a
                                                    class="list_menu__item list_menu__share" title="分享"><i
                                                    class="list_menu__icon_share"></i><span class="icon_txt">分享</span></a>
                                            </div>
                                        </div>
                                        <div class="songlist__artist"><a class="playlist__author" title="${song.name}"
                                                                         href="">${song.singer}</a>
                                        </div>
                                        <div class="songlist__time songlist__time_delete">${song.duration}</div>
                                        <a class="songlist__delete"><span class="icon_txt">删除</span></a></div>`;
            songList.appendChild(li);
        });
    }

    progressInit(audio, duration) {
        progress.init(audio, duration)
    }

    progressDrag(audio, btn) {
        const {songList} = this.elements
        progress.drag(audio, btn, this.songListPlaying, [this.currentTrackIndex, songList])
    }

    lyricParse(lrc) {
        return lyric.parse(lrc);
    }

    lyricRender(lyrics) {
        lyric.render(lyrics)
    }

    lyricHighlight(lyrics, currentTime) {
        const index = common.binarySearch(lyrics, currentTime);
        if (this.currentLyricIndex === index) return
        lyric.highlight(index);
    }

    lyricWheel() {
        lyric.wheel()
    }

    isMuted(audio) {
        volume.muted(audio)
    }

    volumeDrag(audio) {
        volume.drag(audio)
    }

    loop() {
        const {btnLoop} = this.elements

        const nextMode = () => {
            this.currentLoopIndex++
            if (this.currentLoopIndex > this.modes.length - 1) {
                this.currentLoopIndex = 0
            }
            this.modes.forEach(mode => btnLoop.classList.remove(mode.className))
            const mode = this.modes[this.currentLoopIndex];
            btnLoop.classList.add(mode.className);
            btnLoop.title = mode.title
            const text = btnLoop.querySelector('.icon_txt');
            text.textContent = mode.text
        }

        btnLoop.addEventListener('click', nextMode)
    }

    songListPlaying(index, element) {
        const children = element.children[index]
        const current = children.querySelector('.songlist__item')
        const btnPlay = current.querySelector('.list_menu__icon_play')
        current.classList.add('songlist__item--playing')
        btnPlay.classList.add('list_menu__icon_pause')
    }

    songListPaused(index) {
        const {songList} = this.elements
        const children = songList.children[index]
        const current = children.querySelector('.songlist__item')
        const btnPlay = current.querySelector('.list_menu__icon_play')
        current.classList.remove('songlist__item--playing')
        btnPlay.classList.remove('list_menu__icon_pause')
    }

    btnSongListPlay(audio) {
        const {btnPlay, songList} = this.elements
        songList.addEventListener('click', (e) => {
            if (e.target.closest('.list_menu__play')) {
                const li = e.target.closest('li');
                const index = Array.from(songList.children).indexOf(li);
                if (this.currentTrackIndex !== index) {
                    btnPlay.classList.remove('btn_big_play--pause');
                    this.loadTrack(this.data[index])
                }
                if (audio.paused) {
                    this.songListPaused(this.currentTrackIndex)
                    this.songListPlaying(index, songList)
                    setTimeout(() => {
                        btnPlay.classList.add('btn_big_play--pause');
                    }, 100)

                    audio.play()
                } else {
                    this.songListPaused(index)
                    btnPlay.classList.remove('btn_big_play--pause');
                    audio.pause()
                }
                this.currentTrackIndex = index
            }
        })
    }

}
