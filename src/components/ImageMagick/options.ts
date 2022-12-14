export interface OptionString {
  displayName: string;
  flag: string;
  cfg?: string | number;
}

export const optionStrings: OptionString[] = [
  {
    displayName: 'Negate Image',
    flag: '--negate',
  },
  {
    displayName: 'Rotationally Blur Image',
    flag: '--rotational-blur',
  },
  {
    displayName: 'Segment Image',
    flag: '--segment',
  },
  {
    displayName: 'Sepia-Tone Image',
    flag: 'sepia-tone',
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
