import is from '@sindresorhus/is';
import test, {ExecutionContext} from 'ava';
import Audic, {playAudioFile} from './source/index.js';

test('main', (t: ExecutionContext) => {
	t.true(is.class_(Audic));
	t.true(is.function_(playAudioFile));
});
