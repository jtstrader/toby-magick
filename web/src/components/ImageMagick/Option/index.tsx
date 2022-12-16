import { ImageMagickOptionProps } from '@interfaces/component-props';

import './index.css';

export function Option({ displayName, border }: ImageMagickOptionProps) {
  return (
    <div className="magick-option" style={{ borderStyle: border ? 'solid' : 'hidden' }}>
      {displayName}
    </div>
  );
}
