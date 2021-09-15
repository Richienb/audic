# audic

Play some audio.

## Install

```sh
npm install audic
```

## Usage

```js
import {playAudioFile} from 'audic';

await playAudioFile('audio.mp3');
```

```js
import Audic from 'audic';

const audic = new Audic('audio.mp3');

await audic.play();

audic.addEventListener('ended', () => {
	audic.destroy();
});
```

## API

### playAudioFile(src)

Convenience function that plays an audio file. Returns a promise that resolves when playback has completed.

### Audic(src)

### audic.play()

Play the audio if it is not already playing.

### audic.pause()

Pause the audio if it not already paused.

### audic.destroy()

Destroy the player instance.

### audic.src

Type: `string`

The path to the file that is being played.

### audic.volume

Type: `number`

The volume of the audio as a decimal between `0` and `1`.

### audic.currentTime

Type: `number`

The current playing time of the audio.

### audic.duration

Type: `number`

The duration of the audio.

### audic.loop

Type: `boolean`\
Default: `false`

Whether audio playback is looped.

### audic.playing

Type: `boolean`

Whether the audio is currently playing.

### Events

These events from the Web Audio API are also emitted by Audic:

- `timeupdate` - When `currentTime` changes
- `ended` - When the current song has finished playing
- `playing` - When `playing` is set to `true`
- `pause` - When playback is paused
- `volumechange` - When the volume is changed
- `canplay` - When the audio is ready to start playing
- `canplaythrough` - When the audio is ready to play through to the end
- `seeking` - When an audio seek has been initiated
- `seeked` - When an audio seek has completed
- `play` - When audio playback is started or restarted
