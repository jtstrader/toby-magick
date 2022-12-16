import { ImageMagickRequest, ImageMagickResponse } from '@interfaces/requests';

import { OptionString } from '@components/ImageMagick/options';

import { FLASK_URL } from '@utils/constants';

export async function getConvertedImage(
  b64Image: string,
  opts: OptionString
): Promise<ImageMagickResponse> {
  const { displayName, ...cmd } = opts;
  let reqBody: ImageMagickRequest = { b64Image, ...cmd };
  const options: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reqBody),
  };
  const response = await fetch(FLASK_URL, options);
  return response.json();
}
