import ow from "ow"

export = class Audic {
	private _el: HTMLAudioElement

	constructor(src: string) {
		ow(src, ow.optional.string)

		this._el = new Audio(src)
	}

	public async play() {
		await this._el.play()
	}

	public async pause() {
		this._el.pause()
	}

	public get volume() {
		return this._el.volume
	}

	public set volume(value) {
		ow(value, ow.number.inRange(0, 1))

		this._el.volume = value
	}

	public get duration() {
		return this._el.duration
	}

	public get playing() {
		return !this._el.paused
	}

	public get src() {
		return this._el.src
	}

	public set src(value) {
		ow(value, ow.string)

		this._el.src = value
	}

	public get currentTime() {
		return this._el.currentTime
	}

	public set currentTime(value) {
		ow(value, ow.number.integer.greaterThanOrEqual(0))

		this._el.currentTime = value
	}

	public destroy() {
		this._el.remove()
	}
}
