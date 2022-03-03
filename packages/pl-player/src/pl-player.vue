<template>
    <div ref="player" class="__pl_player__">
        <div v-if="isCoverShow" class="__pl_cover__">
            <img style="object-fit: contain;width: 100%;height: 100%;" :src="cover">
        </div>
        <!--
            视频标签
        -->
        <canvas
            ref="canvas"
            class="__pl_main_player"
        ></canvas>
        <video 
            ref="video"
            style="display: none;">
        
        </video>

        <!--
            主要控件
        -->
        <div ref="controlBar" class="__pl_player_controlBar">
            <div ref="inner_controlBar" class="__inner_controlBar">
                <!--
                    时间进度条
                -->
                <div class="__pl_player_timeBar">
                    <div ref="timeBar_P" class="__timeBar_played__"></div>
                </div>
                <!--
                    控制按钮
                -->
                <div class="__pl_player_buttons">
                    <div class="__play__">
                        <div @click="playSwitch">
                            <div v-if="!isPlay">
                                <slot name="play">
                                    <div class="__player_button__">
                                        <i class="__iconfont">&#xe624;</i>
                                    </div>
                                </slot>
                            </div>
                            <div v-else>
                                <slot name="pause">
                                    <div class="__player_button__">
                                        <i class="__iconfont">&#xe625;</i>
                                    </div>
                                </slot>
                            </div>
                        </div>
                    </div>
                    <div class="__time__">
                        <div class="__inner_time__">{{ currentTime }} / {{ duration }}</div>
                    </div>
                    <div class="__fullScreen__">
                        <div @click="fullScreenSwitch">
                            <div v-if="!isFullScreen">
                                <slot name="fullScreen">
                                    <div class="__player_button__">
                                        <i class="__iconfont">&#xe62b;</i>
                                    </div>
                                </slot>
                            </div>
                            <div v-else>
                                <slot name="exitFullScreen">
                                    <div class="__player_button__">
                                        <i class="__iconfont">&#xe62c;</i>
                                    </div>
                                </slot>
                            </div>
                        </div>
                    </div>
                    <div class="__speed__">

                    </div>
                    <div class="__voice__">
                        <div @click="muteSwitch">
                            <div v-if="!isMute">
                                <slot name="un-mute">
                                    <div class="__player_button__">
                                        <i class="__iconfont">&#xe629;</i>
                                    </div>
                                </slot>
                            </div>
                            <div v-else>
                                <slot name="mute">
                                    <div class="__player_button__">
                                        <i class="__iconfont">&#xe62a;</i>
                                    </div>
                                </slot>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, provide, ref } from "vue";

export default defineComponent({
    name: "pl-player",
    props: {
        src: {
            type: String,
            require: true
        },
        autoplay: {
            type: Boolean,
            default: false
        },
        mute: {
            type: Boolean,
            default: false
        },
        controlBarHoverTime: {
            type: Number,
            default: 7000
        },
        cover: {
            type: String,
            default: ""
        },
        coverWhenStop: {
            type: Boolean,
            default: false
        }
    },
    setup(props) {
        // dom
        const player = ref<HTMLDivElement>()
        const video = ref<HTMLVideoElement>();
        const controlBar = ref<HTMLDivElement>();
        const inner_controlBar = ref();
        const canvas = ref<HTMLCanvasElement>();
        const timeBar_P = ref();

        // data
        const currentTime = ref('00:00:00');
        const duration = ref('00:00:00');
        const isPlay = ref(props.autoplay);
        const isMute = ref(props.mute);
        const isFullScreen = ref(false);
        const d = ref(1);

        // methods
        const playSwitch = () => {
            const v = video.value!;

            if(v.paused) {
                v.play();
            }else {
                v.pause();
            }

            isPlay.value = !v.paused;
        }
        const muteSwitch = () => {
            const v = video.value!;

            isMute.value = v.muted = !v.muted;
        }
        const toTimeString = (time: number):string => {
            let h = Math.floor(time / 3600);
            let m = Math.floor((time - h * 3600) / 60);
            let s = Math.floor(time % 60);

            return (h > 99 ? h : ("0" + h).slice(-2)) + ":" + ("0" + m).slice(-2) + ":" + ("0" + s).slice(-2);
        }
        const fullScreenSwitch = () => {
            let el = player.value as any;
            let doc = document as any;
            let rfs = 
                    el.requestFullscreen        ||
                    el.requestFullScreen        ||
                    el.webkitRequestFullScreen  ||
                    el.mozRequestFullScreen     ||
                    el.msRequestFullScreen;
            let cfs = 
                    doc.cancelFullScreen        ||
                    doc.webkitCancelFullScreen  ||
                    doc.mozCancelFullScreen     ||
                    doc.exitFullscreen          ||
                    doc.exitFullScreen;
            if(isFullScreen.value){
                cfs.call(doc);
            }else{
                rfs.call(el);
            }
        }

        // computer
        const isCoverShow = computed(() => {
            return !(props.cover == '') && !isPlay.value && (props.coverWhenStop || currentTime.value == '00:00:00');
        })

        onMounted(() => {
            let cxt = canvas.value!.getContext("2d");
            let timer:number;

            video.value!.src = props.src as string;
            // 时间监听
            video.value!.addEventListener('loadedmetadata', () => {
                d.value = video.value!.duration;

                duration.value = toTimeString(d.value);
                canvas.value!.width = video.value!.videoWidth;
                canvas.value!.height = video.value!.videoHeight;
            });
            video.value!.addEventListener('timeupdate', () => {
                let c = video.value!.currentTime;

                currentTime.value = toTimeString(c);
                timeBar_P.value!.style.width = `${c/d.value * 100}%`;
                if(c == d.value)isPlay.value = false;
            });
            video.value!.addEventListener('play', () => {
                timer = setInterval(() => {
                    if(video.value!.paused){
                        clearInterval(timer);
                    }
                    cxt?.drawImage(video.value!,0,0);
                },16);
            });

            // 控制条动效
            controlBar.value!.onmouseover = () => {
                inner_controlBar.value!.style.visibility = 'visible';
            }

            controlBar.value!.onmouseleave = () => {
                setTimeout(() => {
                    inner_controlBar.value!.style.visibility = 'hidden';
                }, props.controlBarHoverTime);
            }

            document.onfullscreenchange = () => {
                isFullScreen.value = !isFullScreen.value;
            }
        })

        return {
            player,
            video,
            controlBar,
            inner_controlBar,
            canvas,

            currentTime,
            duration,
            isPlay,
            isMute,
            timeBar_P,

            isCoverShow,
            isFullScreen,

            playSwitch,
            muteSwitch,
            fullScreenSwitch
        }
    }
})
</script>

<style scoped lang="less">
@import '../less/media.less';
@import '../less/index.less';
</style>