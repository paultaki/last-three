// Episode production (tools/episode): an edited film may replace an event's
// on-screen line with a shorter written version and drop the recorded-excerpt
// cards. The replay itself is unchanged when no episode is active.
export const episode = { active: false, lines: new Map() };
export function setEpisode({ lines = {} } = {}) {
  episode.active = true;
  episode.lines = new Map(
    Object.entries(lines).map(([i, text]) => [Number(i), String(text)]),
  );
}
