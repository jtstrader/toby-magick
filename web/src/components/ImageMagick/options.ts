export interface OptionString {
  displayName: string;
  channel?: string;
  cmd: string;
  cfg?: string | number;
}

export const optionStrings: OptionString[] = [
  {
    displayName: 'Negate Image',
    channel: '-channel RGB',
    cmd: '-negate',
  },
  {
    displayName: 'Rotationally Blur Image',
    cmd: '-rotational-blur',
    cfg: 5
  },
  {
    displayName: 'Segment Image',
    cmd: '-segment',
    cfg: 5
  },
  {
    displayName: 'Sepia-Tone Image',
    cmd: '-sepia-tone',
    cfg: '75%'
  },
];

/**
 * Get a list of randomly selected option strings.
 *
 * @param n The number of option strings to get. If this number is greater than the length of `optionStrings`, throw an error.
 *
 * @returns A list of valid option strings defined in `optionStrings`.
 */
export const getOptionStrings = (n: number): OptionString[] => {
  let list = [...optionStrings];
  let res: OptionString[] = [];
  for (let i = 0; i < n; i++) {
    res.push(list.splice(Math.floor(Math.random() * list.length), 1)[0]);
  }
  return res;
};
