/// <reference types="node"/>
import vlc from "@richienb/vlc"
import ow from "ow"
import { AsyncReturnType } from "type-fest" // eslint-disable-line import/no-unresolved, node/no-missing-import, @typescript-eslint/no-unused-vars
import { EventEmitter } from 'events'

class Audic extends EventEmitter {
	/**
	Whether the audio is currently playing.
	*/
	public playing = false

	/**
	The duration of the audio.
	*/
	public duration: number

	/*
	Event state
	*/
	private _endedEventTriggered: boolean

	private _src: string

	private _volume = 1

	private _currentTime = 0

	private _vlc: AsyncReturnType<typeof vlc>

	private readonly _setup: Promise<void>

	private _timeUpdater: NodeJS.Timeout

	constructor(src?: string) {
		super()

		ow(src, ow.optional.string)

		this._src = src

		this._endedEventTriggered = (src) ? false : true

		this._setup = (async () => {
			this._vlc = await vlc()
			if (src) {
				await this._vlc.command("in_enqueue", {
					input: src
				})
			}

			this._timeUpdater = setInterval(async () => {
				const { length: duration, time: currentTime } = await this._vlc.info()
				this.duration = duration
				this._currentTime = currentTime
				if (duration === 0 && currentTime === 0) {
					this.playing = false
				}

				if (this._endedEventTriggered === false && duration === currentTime) {
					this.emit('ended')

					this._endedEventTriggered = true
				}
			}, 1000)
		})()
	}

	/**
	Start playing the audio.
	*/
	public async play() {
		if (!this.playing) {
			this.playing = true
			await this._setup
			await this._vlc.command("pl_pause", {
				id: 0
			})
		}
	}

	/**
	Pause the audio playback.
	*/
	public async pause() {
		if (this.playing) {
			this.playing = false
			await this._setup
			await this._vlc.command("pl_pause", {
				id: 0
			})
		}
	}

	/**
	Set the source of the audio and await vlc
	*/
	public async setSrc(value) {
		ow(value, ow.string)

		await this.setVlcInput(value)

		this._src = value

		this._endedEventTriggered = false

		this.emit('canplaythrough')
	}

	/**
	Set the audio source of vlc
	*/
	private async setVlcInput(value) {
		await this._setup
		await this._vlc.command("pl_empty")
		await this._vlc.command("in_enqueue", {
			input: value
		})
		this.playing = false
	}

	/**
	The volume of the audio.
	*/
	public get volume() {
		return this._volume
	}

	/**
	The volume of the audio.
	*/
	public set volume(value) {
		ow(value, ow.number.inRange(0, 1))
		void (async () => {
			await this._setup
			this._volume = value
			await this._vlc.command("volume", { val: Math.round(value * 256) })
		})()
	}

	/**
	The source uri of the audio.
	*/
	public get src() {
		return this._src
	}

	/**
	The source uri of the audio.
	*/
	public set src(value) {
		this.setSrc(value)
	}

	/**
	The current playing time of the audio.
	*/
	public get currentTime() {
		return this._currentTime
	}

	/**
	The current playing time of the audio.
	*/
	public set currentTime(value) {
		ow(value, ow.number.integer.greaterThanOrEqual(0))

		void (async () => {
			await this._setup
			await this._vlc.command("seek", { val: value })
		})()
	}

	/**
	Destroy the player instance.
	*/
	public destroy() {
		clearInterval(this._timeUpdater)
		this._vlc.kill()
	}
}

export = Audic
