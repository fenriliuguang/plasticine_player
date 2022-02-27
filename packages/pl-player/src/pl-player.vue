<template>
    <div class="__pl_player__">
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
                    <div class="__speed__">

                    </div>
                    <div class="__voice__">
                        <div @click="muteSwitch">
                            <div v-if="!isMute">
                                <slot name="__un-mute__">
                                    <div class="__player_button__">
                                        <i class="__iconfont">&#xe629;</i>
                                    </div>
                                </slot>
                            </div>
                            <div v-else>
                                <slot name="__mute__">
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
        const video = ref();
        const controlBar = ref();
        const inner_controlBar = ref();
        const canvas = ref();
        const timeBar_P = ref();

        // data
        const currentTime = ref('00:00:00');
        const duration = ref('00:00:00');
        const isPlay = ref(props.autoplay);
        const isMute = ref(props.mute);
        const d = ref(1);

        // methods
        const playSwitch = () => {
            const v = video.value as HTMLVideoElement;

            if(v.paused) {
                v.play();
            }else {
                v.pause();
            }

            isPlay.value = !v.paused;
        }
        const muteSwitch = () => {
            const v = video.value as HTMLVideoElement;

            isMute.value = v.muted = !v.muted;
        }
        const toTimeString = (time: number):string => {
            let h = Math.floor(time / 3600);
            let m = Math.floor((time - h * 3600) / 60);
            let s = Math.floor(time % 60);

            return (h > 99 ? h : ("0" + h).slice(-2)) + ":" + ("0" + m).slice(-2) + ":" + ("0" + s).slice(-2);
        }

        // computer
        const isCoverShow = computed(() => {
            return !(props.cover == '') && !isPlay.value && (props.coverWhenStop || currentTime.value == '00:00:00');
        })

        onMounted(() => {
            let cxt = (canvas.value as HTMLCanvasElement).getContext("2d");
            let timer:number;

            (video.value as HTMLVideoElement).src = props.src as string;
            // 时间监听
            (video.value as HTMLVideoElement).addEventListener('loadedmetadata', () => {
                d.value = (video.value as HTMLVideoElement).duration;
                duration.value = toTimeString(d.value);
                (canvas.value as HTMLCanvasElement).width = (video.value as HTMLVideoElement).videoWidth;
                (canvas.value as HTMLCanvasElement).height = (video.value as HTMLVideoElement).videoHeight;
            });
            (video.value as HTMLVideoElement).addEventListener('timeupdate', () => {
                let c = (video.value as HTMLVideoElement).currentTime;
                currentTime.value = toTimeString(c);

                (timeBar_P.value as HTMLDivElement).style.width = `${c/d.value * 100}%`;

                if(c == d.value)isPlay.value = false;
            });
            (video.value as HTMLVideoElement).addEventListener('play', () => {
                timer = setInterval(() => {
                    if((video.value as HTMLVideoElement).paused){
                        clearInterval(timer);
                    }
                    cxt?.drawImage((video.value as HTMLVideoElement),0,0);
                },16);
            });

            // 控制条动效
            (controlBar.value as HTMLDivElement).onmouseover = () => {
                (inner_controlBar.value as HTMLDivElement).style.visibility = 'visible';
            }

            (controlBar.value as HTMLDivElement).onmouseleave = () => {
                setTimeout(() => {
                    (inner_controlBar.value as HTMLDivElement).style.visibility = 'hidden';
                }, props.controlBarHoverTime);
            }
        })

        return {
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

            playSwitch,
            muteSwitch
        }
    }
})
</script>

<style scoped lang="less">
@import '../less/index.less';
</style>