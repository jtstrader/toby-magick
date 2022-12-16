/**
 * Request to get an converted image response from ImageMagick.
 */
export interface ImageMagickRequest {
  /**
   * The base64 representation of the image.
   */
  b64Image: string;

  /**
   * The command needed to perform an ImageMagick command.
   */
  cmd: string;

  /**
   * The channels of the image to affect.
   */
  channel?: string;

  /**
   * Any command options/configuration
   */
  cfg?: string | number;
}

/**
 * The expected response for an ImageMagick request.
 */
export interface ImageMagickResponse {
    /**
     * The image source data in base64.
     */
    img: string
}