"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
/// <reference types="node"/>
const vlc_1 = __importDefault(require("@richienb/vlc"));
const ow_1 = __importDefault(require("ow"));
class Audic {
    constructor(src, callback=null) {
        /**
        Whether the audio is currently playing.
        */
        this.playing = false;
        this._volume = 1;
        this._currentTime = 0;
		this.callbackTriggered = false;
        ow_1.default(src, ow_1.default.optional.string);
        this._src = src;
        this._setup = (async () => {
            this._vlc = await vlc_1.default();
            if (src) {
                await this._vlc.command("in_enqueue", {
                    input: src
                });
            }
            this._timeUpdater = setInterval(async () => {
                const { length: duration, time: currentTime } = await this._vlc.info();
                this.duration = duration;
                this._currentTime = currentTime;
                if (duration === 0 && currentTime === 0) {
                    this.playing = false;
                }
				if(duration == currentTime && !this.callbackTriggered && callback!==null){
					this.callbackTriggered = true
					callback()
				}
            }, 1000);
        })();
    }
    /**
    Start playing the audio.
    */
    async play() {
		this.callbackTriggered = false
        if (!this.playing) {
            this.playing = true;
            await this._setup;
            await this._vlc.command("pl_pause", {
                id: 0
            });
        }
    }
    /**
    Pause the audio playback.
    */
    async pause() {
        if (this.playing) {
            this.playing = false;
            await this._setup;
            await this._vlc.command("pl_pause", {
                id: 0
            });
        }
    }
    /**
    The volume of the audio.
    */
    get volume() {
        return this._volume;
    }
    /**
    The volume of the audio.
    */
    set volume(value) {
        ow_1.default(value, ow_1.default.number.inRange(0, 1));
        void (async () => {
            await this._setup;
            this._volume = value;
            await this._vlc.command("volume", { val: Math.round(value * 256) });
        })();
    }
    /**
    The source uri of the audio.
    */
    get src() {
        return this._src;
    }
    /**
    The source uri of the audio.
    */
    set src(value) {
        ow_1.default(value, ow_1.default.string);
        this._src = value;
        void (async () => {
            await this._setup;
            await this._vlc.command("pl_empty");
            await this._vlc.command("in_enqueue", {
                input: value
            });
            this.playing = false;
        })();
    }
    /**
    The current playing time of the audio.
    */
    get currentTime() {
        return this._currentTime;
    }
    /**
    The current playing time of the audio.
    */
    set currentTime(value) {
        ow_1.default(value, ow_1.default.number.integer.greaterThanOrEqual(0));
        void (async () => {
            await this._setup;
            await this._vlc.command("seek", { val: value });
        })();
    }
    /**
    Destroy the player instance.
    */
    destroy() {
        clearInterval(this._timeUpdater);
        this._vlc.kill();
    }
}
module.exports = Audic;
//# sourceMappingURL=index.js.map
