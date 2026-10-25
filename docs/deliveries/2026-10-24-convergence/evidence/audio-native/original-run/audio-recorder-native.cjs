// Local browser verification: real Chromium MediaRecorder, synthetic WebAudio.
// Only the permission source and WorkspaceStore are replaced. No physical mic.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { chromium } = require('../rea-lab/toolchain/node_modules/playwright-core');

const output = __dirname;
const repo = path.resolve(__dirname, '../../ardesia');
const source = path.join(repo, 'apps/studio/src/store/AudioRecorder.ts');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const origin = process.env.ARDESIA_TEST_ORIGIN || 'http://127.0.0.1:5197';
const executablePath = path.resolve(__dirname, '../rea-lab/browser-bin/chromium');

(async () => {
  const started = Date.now();
  const before = sha(fs.readFileSync(source));
  const gitHead = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim();
  const network = [];
  const pageErrors = [];
  const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
  let result;
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      network.push({ method: route.request().method(), url: url.href });
      if (url.origin !== origin) return route.abort();
      if (url.pathname === '/__audio-native-harness__') {
        return route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="en"><title>Ardesia synthetic audio test</title><body><button id="run">Run synthetic audio</button><pre id="result"></pre></body></html>' });
      }
      return route.continue();
    });
    page.on('pageerror', e => pageErrors.push(String(e)));
    await page.goto(origin + '/__audio-native-harness__');
    await page.evaluate(async () => {
      const { AudioRecorder, parseSessionYaml } = await import('/src/store/AudioRecorder.ts');
      const NativeMediaRecorder = window.MediaRecorder;
      const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
      const deadline = (promise, ms, label) => new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(label + ' timed out')), ms);
        Promise.resolve(promise).then(value => { clearTimeout(timer); resolve(value); }, error => { clearTimeout(timer); reject(error); });
      });
      const waitUntil = async test => {
        const stop = performance.now() + 3000;
        while (!test()) { if (performance.now() >= stop) throw new Error('condition timed out'); await sleep(10); }
      };
      document.querySelector('#run').onclick = () => {
        window.__audioResultPromise = (async () => {
          const checks = [];
          const check = (name, pass, detail) => checks.push({ name, pass: Boolean(pass), ...(detail === undefined ? {} : { detail }) });
          const clock = () => Math.floor(performance.timeOrigin + performance.now());
          const audioContext = new AudioContext();
          const sources = [];
          const streams = [];
          const recorders = [];
          const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
          const syntheticSource = () => {
            const destination = audioContext.createMediaStreamDestination();
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();
            oscillator.frequency.value = 440;
            gain.gain.value = 0.05;
            oscillator.connect(gain).connect(destination);
            oscillator.start();
            sources.push(oscillator);
            streams.push(destination.stream);
            return destination.stream;
          };
          const makeStore = (events, writeDelay) => {
            const files = new Map();
            return {
              files,
              store: {
                async write(file, blob) {
                  events.push({ name: 'write-start', time: performance.now(), file, bytes: blob.size });
                  await sleep(writeDelay);
                  files.set(file, blob);
                  events.push({ name: 'write-complete', time: performance.now(), file });
                },
                async delete(file) { files.delete(file); },
                async list(prefix) { return [...files].filter(([file]) => file.startsWith(prefix)).map(([file, data]) => ({ path: file, data, mtime: 0 })); },
                async saveSessionYaml(yaml) { files.set('raw/session.yaml', new Blob([yaml])); },
              },
            };
          };
          let completed;
          try {
            await deadline(audioContext.resume(), 3000, 'WebAudio resume');
            check('MediaRecorder is the native browser constructor', /\[native code\]/.test(NativeMediaRecorder.toString()));
            check('synthetic WebAudio context is running', audioContext.state === 'running');

            // Case A: stop BEFORE the 30-second timeslice must persist native tail.
            const events = [];
            const markers = [];
            const memory = makeStore(events, 80);
            const stream = syntheticSource();
            let permissionCalls = 0;
            let nativeConstructed = 0;
            navigator.mediaDevices.getUserMedia = async () => { permissionCalls++; return stream; };
            const recorder = new AudioRecorder({
              store: memory.store,
              clock,
              createMediaRecorder(media) {
                nativeConstructed++;
                const native = new NativeMediaRecorder(media);
                for (const name of ['start', 'dataavailable', 'stop', 'error']) {
                  native.addEventListener(name, event => events.push({ name: 'native-' + name, time: performance.now(), trusted: event.isTrusted, ...(event.data ? { bytes: event.data.size, mimeType: event.data.type } : {}) }));
                }
                return native;
              },
              onChunk(index, from, to) {
                const file = `raw/audio/chunk-${index}.webm`;
                const marker = { index, from, to, storedAtEmission: memory.files.has(file), bytesAtEmission: memory.files.get(file)?.size || 0 };
                markers.push(marker);
                events.push({ name: 'marker', time: performance.now(), ...marker });
              },
            });
            recorders.push(recorder);
            recorder.consent = true;
            await deadline(recorder.start(), 5000, 'normal start');
            check('capture entered recording state', recorder.recording);
            await sleep(1200);
            check('no timeslice chunk emitted before short stop', !events.some(event => event.name === 'native-dataavailable'));
            let stopResolved = false;
            const stopping = recorder.stop().then(() => { stopResolved = true; events.push({ name: 'stop-resolved', time: performance.now() }); });
            check('tracks end synchronously on ordinary stop', stream.getTracks().every(track => track.readyState === 'ended'));
            await waitUntil(() => events.some(event => event.name === 'write-start'));
            check('stop promise waits while native tail storage is pending', !stopResolved);
            check('marker waits while native tail storage is pending', markers.length === 0);
            await deadline(stopping, 5000, 'normal stop');
            const file = 'raw/audio/chunk-0.webm';
            const blob = memory.files.get(file);
            check('native final chunk exists and has nonzero bytes', blob instanceof Blob && blob.size > 0, blob?.size);
            check('single short capture produces one persisted chunk and marker', [...memory.files.keys()].filter(file => file.startsWith('raw/audio/')).length === 1 && markers.length === 1);
            check('marker observes already persisted audio', markers.length === 1 && markers[0].storedAtEmission && markers[0].bytesAtEmission > 0);
            const eventIndex = name => events.findIndex(event => event.name === name);
            check('native dataavailable precedes native stop', eventIndex('native-dataavailable') >= 0 && eventIndex('native-dataavailable') < eventIndex('native-stop'));
            check('browser generated trusted final media events', events.filter(event => ['native-dataavailable', 'native-stop'].includes(event.name)).every(event => event.trusted));
            check('storage completes before marker and stop resolves', eventIndex('write-complete') < eventIndex('marker') && eventIndex('marker') < eventIndex('stop-resolved'));
            check('normal stop leaves recorder inactive and tracks ended', !recorder.recording && stream.getTracks().every(track => track.readyState === 'ended'));
            const bytes = new Uint8Array(await blob.arrayBuffer());
            const decoded = await deadline(audioContext.decodeAudioData(bytes.buffer.slice(0)), 5000, 'native audio decode');
            let maxAmplitude = 0;
            for (const sample of decoded.getChannelData(0)) maxAmplitude = Math.max(maxAmplitude, Math.abs(sample));
            check('native final blob decodes to non-silent synthetic audio', decoded.duration > 0.5 && maxAmplitude > 0.001, { duration: decoded.duration, sampleRate: decoded.sampleRate, channels: decoded.numberOfChannels, maxAmplitude });
            const normal = { permissionCalls, nativeConstructed, chunk: { file, bytes: blob.size, mimeType: blob.type, signatureHex: [...bytes.subarray(0, 4)].map(value => value.toString(16).padStart(2, '0')).join('') }, markers, events, decoded: { duration: decoded.duration, sampleRate: decoded.sampleRate, channels: decoded.numberOfChannels, maxAmplitude }, tracksAfterStop: stream.getTracks().map(track => ({ kind: track.kind, readyState: track.readyState })), audioBase64: btoa(String.fromCharCode(...bytes)) };

            // Case B: permission resolves with a REAL stream after revoke.
            const pendingEvents = [];
            const pendingMarkers = [];
            const pendingMemory = makeStore(pendingEvents, 0);
            const lateStream = syntheticSource();
            let resolvePermission;
            let pendingPermissionCalls = 0;
            let lateNativeConstructed = 0;
            navigator.mediaDevices.getUserMedia = () => {
              pendingPermissionCalls++;
              return new Promise(resolve => { resolvePermission = resolve; });
            };
            const pendingRecorder = new AudioRecorder({
              store: pendingMemory.store, clock,
              createMediaRecorder(media) { lateNativeConstructed++; return new NativeMediaRecorder(media); },
              onChunk(...args) { pendingMarkers.push(args); },
            });
            recorders.push(pendingRecorder);
            pendingRecorder.consent = true;
            const pendingStart = pendingRecorder.start();
            await waitUntil(() => pendingPermissionCalls === 1);
            check('pending permission fixture supplies live native MediaStream', lateStream instanceof MediaStream && lateStream.getTracks().every(track => track.readyState === 'live'));
            pendingRecorder.consent = false;
            await deadline(pendingRecorder.lastRevoke, 5000, 'revoke before permission');
            resolvePermission(lateStream);
            await deadline(pendingStart, 5000, 'late permission settlement');
            check('late permission never constructs or starts a MediaRecorder', lateNativeConstructed === 0 && !pendingRecorder.recording);
            check('late stream tracks are ended after pending permission revoke', lateStream.getTracks().every(track => track.readyState === 'ended'));
            check('pending permission revoke persists no audio and emits no marker', pendingMarkers.length === 0 && [...pendingMemory.files.keys()].every(file => !file.startsWith('raw/audio/')));
            const session = parseSessionYaml(await pendingMemory.files.get('raw/session.yaml').text());
            check('pending permission revoke retains consent OFF in session', session.audioConsent === false && pendingRecorder.consent === false);
            completed = {
              browser: { userAgent: navigator.userAgent, secureContext: isSecureContext, supportedOpus: NativeMediaRecorder.isTypeSupported('audio/webm;codecs=opus') },
              checks,
              normal,
              pendingRevoke: { permissionCalls: pendingPermissionCalls, nativeConstructed: lateNativeConstructed, markers: pendingMarkers, session, tracksAfterSettlement: lateStream.getTracks().map(track => ({ kind: track.kind, readyState: track.readyState })) },
              scope: { MediaRecorder: 'native Chromium', input: '440Hz WebAudio oscillator into MediaStreamDestination; no audio output connected', replaced: ['getUserMedia permission source', 'WorkspaceStore in-memory test implementation'], physicalMicrophoneUsed: false, networkWrites: false, journalIntegrationVerified: false, realFilesystemPersistenceVerified: false },
            };
          } finally {
            navigator.mediaDevices.getUserMedia = originalGetUserMedia;
            for (const recorder of recorders) recorder.dispose();
            for (const stream of streams) for (const track of stream.getTracks()) track.stop();
            for (const oscillator of sources) { try { oscillator.stop(); } catch {} oscillator.disconnect(); }
            await audioContext.close();
          }
          completed.cleanup = { audioContext: audioContext.state, everyTrackEnded: streams.every(stream => stream.getTracks().every(track => track.readyState === 'ended')) };
          return completed;
        })().catch(error => ({ error: { message: error.message, stack: error.stack } }));
      };
    });
    await page.click('#run');
    result = await page.evaluate(() => window.__audioResultPromise);
    if (result.normal?.audioBase64) {
      const bytes = Buffer.from(result.normal.audioBase64, 'base64');
      delete result.normal.audioBase64;
      fs.writeFileSync(path.join(output, 'audio-recorder-native-tail.webm'), bytes);
      result.normal.chunk.sha256 = sha(bytes);
    }
    result.browserVersion = await browser.version();
  } catch (error) {
    result = { error: { message: error.message, stack: error.stack } };
  } finally {
    await browser.close();
  }
  result.metadata = { schema: 'ardesia.audio.native-observation.v1', date: new Date().toISOString(), elapsedMs: Date.now() - started, gitHead, source: path.relative(repo, source), sourceSha256Before: before, sourceSha256After: sha(fs.readFileSync(source)), scriptSha256: sha(fs.readFileSync(__filename)), executablePath, origin, browserClosed: true };
  result.network = network;
  result.pageErrors = pageErrors;
  result.passed = !result.error && result.checks.every(check => check.pass) && result.metadata.sourceSha256Before === result.metadata.sourceSha256After && pageErrors.length === 0 && result.cleanup.everyTrackEnded;
  fs.writeFileSync(path.join(output, 'audio-recorder-native-result.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ passed: result.passed, checks: result.checks?.length, failures: result.checks?.filter(check => !check.pass), error: result.error, chunk: result.normal?.chunk, decoded: result.normal?.decoded, cleanup: result.cleanup, elapsedMs: result.metadata.elapsedMs, sourceSha256: result.metadata.sourceSha256After }, null, 2));
  if (!result.passed) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
