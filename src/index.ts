import vlc from "@richienb/vlc"
import ow from "ow"
import { AsyncReturnType } from "type-fest"

class Audic {
	/** If the audio is playing. */
	public playing = false

	/** The duration of the audio. */
	public duration: number

	private _src: string

	private _volume = 1

	private _currentTime = 0

	private _vlc: AsyncReturnType<typeof vlc>

	private _setup: Promise<void>

	constructor(src?: string) {
		ow(src, ow.optional.string)

		this._src = src

		this._setup = (async () => {
			this._vlc = await vlc()
			if (src) await this._vlc.command("in_enqueue", {
				input: src
			})
			setInterval(async () => {
				const { length: duration, time: currentTime } = await this._vlc.info()
				this.duration = duration
				this._currentTime = currentTime
				if (duration === 0 && currentTime === 0) this.playing = false
			}, 1000)
		})()
	}

	/** Play the audio. */
	public async play() {
		if (!this.playing) {
			this.playing = true
			await this._setup
			await this._vlc.command("pl_pause", {
				id: 0
			})
		}
	}

	/** Pause the audio. */
	public async pause() {
		if (this.playing) {
			this.playing = false
			await this._setup
			await this._vlc.command("pl_pause", {
				id: 0
			})
		}
	}

	/** The volume of the audio. */
	public get volume() {
		return this._volume
	}

	/** The volume of the audio. */
	public set volume(value) {
		ow(value, ow.number.inRange(0, 1))
		void (async () => {
			await this._setup
			this._volume = value
			await this._vlc.command("volume", { val: Math.round(value * 256) })
		})()
	}

	/** The source uri of the audio. */
	public get src() {
		return this._src
	}

	/** The source uri of the audio. */
	public set src(value) {
		ow(value, ow.string)

		void (async () => {
			await this._setup
			await this._vlc.command("pl_empty")
			await this._vlc.command("in_enqueue", {
				input: value
			})
			this.playing = false
		})()
	}

	/** The current playing time of the audio. */
	public get currentTime() {
		return this._currentTime
	}

	/** The current playing time of the audio. */
	public set currentTime(value) {
		ow(value, ow.number.integer.greaterThanOrEqual(0))

		void (async () => {
			await this._setup
			await this._vlc.command("seek", { val: value })
		})()
	}

	/** Destroy the player instance. */
	public destroy() {
		this._vlc.kill()
	}
}

export = Audic
