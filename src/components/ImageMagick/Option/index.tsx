import { ImageMagickOptionProps } from '@interfaces/component-props';

import './index.css';

export function Option({ name, border }: ImageMagickOptionProps) {
  return (
    <div className="magick-option" style={{ borderStyle: border ? 'solid' : 'hidden' }}>
      {name}
    </div>
  );
}
