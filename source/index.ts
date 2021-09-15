import EventTarget, {Event} from 'event-target-shim'; // TODO: Use built-in version when targeting Node.js 16
import createVlc from '@richienb/vlc';
import pEvent from 'p-event';
import pInterval from 'interval-promise';

/**
Play some audio.

@example
```js
import {playAudioFile} from 'audic';

await playAudioFile('audio.mp3');
```

@example
```js
import Audic from 'audic';

const audic = new Audic('audio.mp3');

await audic.play();

audic.addEventListener('ended', () => {
	audic.destroy();
});
```
*/
export default class Audic extends EventTarget<{
	'timeupdate': Event<'timeupdate'>;
	'ended': Event<'ended'>;
	'playing': Event<'playing'>;
	'pause': Event<'pause'>;
	'volumechange': Event<'volumechange'>;
	'canplay': Event<'canplay'>;
	'canplaythrough': Event<'canplaythrough'>;
	'seeking': Event<'seeking'>;
	'seeked': Event<'seeked'>;
	'play': Event<'play'>;
}> {
	/**
	The duration of the audio.
	*/
	public duration = Number.NaN;

	private _playing = false;

	private _src?: string;

	private _volume = 1;

	private _currentTime = 0;

	private readonly _vlc: ReturnType<typeof createVlc>;

	private _loop = false;

	private _isEnded = false;

	constructor(src?: string) {
		super();

		if (src) {
			if (typeof src !== 'string') {
				throw new TypeError(`Expected a string, got ${typeof src}`);
			}

			this._src = src;
		}

		this._vlc = (async () => {
			const vlc = await createVlc();
			void pInterval(this._onUpdate.bind(this), 1000);

			await vlc.command('pl_repeat');
			if (src) {
				await vlc.command('in_enqueue', {
					input: src,
				});
			}

			return vlc;
		})();
	}

	/**
	Start playing the audio.
	*/
	async play() {
		if (!this.playing) {
			this._playing = true;
			const vlc = await this._vlc;
			await vlc.command('pl_pause', {
				id: 0,
			});
			if (this._isEnded) {
				this._isEnded = false;
				void pInterval(this._onUpdate.bind(this), 1000);
			}

			this.dispatchEvent(new Event('playing'));
		}
	}

	/**
	Pause the audio playback.
	*/
	async pause() {
		if (this.playing) {
			this._playing = false;
			const vlc = await this._vlc;
			await vlc.command('pl_pause', {
				id: 0,
			});
			this.dispatchEvent(new Event('pause'));
		}
	}

	/**
	The volume of the audio as a decimal between `0` and `1`.
	*/
	get volume() {
		return this._volume;
	}

	/**
	The volume of the audio as a decimal between `0` and `1`.
	*/
	set volume(value) {
		if (typeof value !== 'number' || !Number.isFinite(value) || value > 1 || value < 0) {
			throw new TypeError(`Expected a number between 0 and 1, got ${typeof value}`);
		}

		void (async () => {
			const vlc = await this._vlc;
			this._volume = value;
			await vlc.command('volume', {val: Math.round(value * 256)});
			this.dispatchEvent(new Event('volumechange'));
		})();
	}

	/**
	The path to the file that is being played.
	*/
	get src() {
		return this._src;
	}

	/**
	The path to the file that is being played.
	*/
	set src(value) {
		if (typeof value !== 'string') {
			throw new TypeError(`Expected a string, got ${typeof value}`);
		}

		this._src = value;

		void (async () => {
			const vlc = await this._vlc;
			await vlc.command('pl_empty');
			await vlc.command('in_enqueue', {
				input: value,
			});
			this._playing = false;
			this.dispatchEvent(new Event('canplay'));
			this.dispatchEvent(new Event('canplaythrough'));
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
		if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
			throw new TypeError(`Expected an integer greater than or equal to 0, got ${typeof value}`);
		}

		void (async () => {
			const vlc = await this._vlc;
			this.dispatchEvent(new Event('seeking'));
			await vlc.command('seek', {val: value});
			this.dispatchEvent(new Event('seeked'));
		})();
	}

	/**
	Whether audio playback is looped.
	*/
	get loop() {
		return this._loop;
	}

	set loop(value) {
		if (typeof value !== 'boolean') {
			throw new TypeError(`Expected a boolean, got ${typeof value}`);
		}

		if (this._loop !== value) {
			this._loop = value;
			void (async () => {
				const vlc = await this._vlc;
				await vlc.command('pl_repeat');
			})();
		}
	}

	/**
	Whether the audio is currently playing.
	*/
	get playing() {
		return this._playing;
	}

	/**
	Whether the audio is currently playing.
	*/
	set playing(value) {
		if (typeof value !== 'boolean') {
			throw new TypeError(`Expected a boolean, got ${typeof value}`);
		}

		if (this._playing !== value) {
			this._playing = value;
			if (value) {
				void this.play();
				this.dispatchEvent(new Event('play'));
			} else {
				void this.pause();
			}
		}
	}

	/**
	Destroy the player instance.
	*/
	async destroy() {
		const vlc = await this._vlc;
		vlc.kill();
		this._isEnded = true;
	}

	private async _onUpdate(_: number, stop: () => void) {
		if (this._isEnded) {
			stop();
			return;
		}

		const vlc = await this._vlc;

		const {length: duration, time: currentTime} = await vlc.info();
		if (this.currentTime !== currentTime) {
			this._currentTime = currentTime;
			this.dispatchEvent(new Event('timeupdate'));
		}

		this.duration = duration;
		if (duration === 0 && currentTime === 0) {
			this._playing = false;
			this.dispatchEvent(new Event('ended'));
			if (!this._loop) {
				this._isEnded = true;
				stop();
			}
		}
	}
}

export async function playAudioFile(src: string) {
	const audic = new Audic(src);
	void audic.play();
	await pEvent(audic, 'ended');
	void audic.destroy();
}
