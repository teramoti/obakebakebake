const iconModules = import.meta.glob('../../../resources/icons/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

const audioModules = import.meta.glob('../../../resources/audio/*.wav', {
  eager: true,
  query: '?url',
  import: 'default',
});

const byFileName = (modules) => Object.fromEntries(
  Object.entries(modules).map(([path, url]) => [path.split('/').pop(), url]),
);

export const ICON_URLS = byFileName(iconModules);
export const AUDIO_URLS = byFileName(audioModules);

export function iconUrl(name) {
  const fileName = `${name}.png`;
  const url = ICON_URLS[fileName];
  if (!url) throw new Error(`Missing icon asset: ${fileName}`);
  return url;
}

export function audioUrl(name) {
  const fileName = name.endsWith('.wav') ? name : `${name}.wav`;
  const url = AUDIO_URLS[fileName];
  if (!url) throw new Error(`Missing audio asset: ${fileName}`);
  return url;
}
