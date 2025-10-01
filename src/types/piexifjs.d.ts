/**
 * TypeScript declarations for piexifjs
 * piexifjs is a library for reading and writing EXIF data in JPEG images
 */

declare module 'piexifjs' {
  /**
   * EXIF data structure organized by IFD (Image File Directory)
   */
  export interface ExifObject {
    '0th'?: { [key: number]: any };
    Exif?: { [key: number]: any };
    GPS?: { [key: number]: any };
    Interop?: { [key: number]: any };
    '1st'?: { [key: number]: any };
    thumbnail?: string | null;
  }

  /**
   * Load EXIF data from a JPEG image data URL
   * @param dataUrl - JPEG image as data URL (base64)
   * @returns EXIF object containing all EXIF data
   */
  export function load(dataUrl: string): ExifObject;

  /**
   * Dump EXIF object to binary string
   * @param exifObj - EXIF object to convert
   * @returns Binary string representation of EXIF data
   */
  export function dump(exifObj: ExifObject): string;

  /**
   * Insert EXIF data into JPEG image data URL
   * @param exif - Binary EXIF data (from dump)
   * @param dataUrl - JPEG image as data URL (base64)
   * @returns New data URL with EXIF data embedded
   */
  export function insert(exif: string, dataUrl: string): string;

  /**
   * Remove EXIF data from JPEG image data URL
   * @param dataUrl - JPEG image as data URL (base64)
   * @returns New data URL without EXIF data
   */
  export function remove(dataUrl: string): string;

  /**
   * EXIF tag constants
   */
  export const ImageIFD: {
    ProcessingSoftware: number;
    NewSubfileType: number;
    SubfileType: number;
    ImageWidth: number;
    ImageLength: number;
    BitsPerSample: number;
    Compression: number;
    PhotometricInterpretation: number;
    Thresholding: number;
    CellWidth: number;
    CellLength: number;
    FillOrder: number;
    DocumentName: number;
    ImageDescription: number;
    Make: number;
    Model: number;
    StripOffsets: number;
    Orientation: number;
    SamplesPerPixel: number;
    RowsPerStrip: number;
    StripByteCounts: number;
    XResolution: number;
    YResolution: number;
    PlanarConfiguration: number;
    ResolutionUnit: number;
    TransferFunction: number;
    Software: number;
    DateTime: number;
    Artist: number;
    WhitePoint: number;
    PrimaryChromaticities: number;
    JPEGInterchangeFormat: number;
    JPEGInterchangeFormatLength: number;
    YCbCrCoefficients: number;
    YCbCrSubSampling: number;
    YCbCrPositioning: number;
    ReferenceBlackWhite: number;
    Copyright: number;
    ExifTag: number;
    GPSTag: number;
    [key: string]: number;
  };

  export const ExifIFD: {
    ExposureTime: number;
    FNumber: number;
    ExposureProgram: number;
    SpectralSensitivity: number;
    ISOSpeedRatings: number;
    OECF: number;
    SensitivityType: number;
    ExifVersion: number;
    DateTimeOriginal: number;
    DateTimeDigitized: number;
    ComponentsConfiguration: number;
    CompressedBitsPerPixel: number;
    ShutterSpeedValue: number;
    ApertureValue: number;
    BrightnessValue: number;
    ExposureBiasValue: number;
    MaxApertureValue: number;
    SubjectDistance: number;
    MeteringMode: number;
    LightSource: number;
    Flash: number;
    FocalLength: number;
    SubjectArea: number;
    MakerNote: number;
    UserComment: number;
    SubSecTime: number;
    SubSecTimeOriginal: number;
    SubSecTimeDigitized: number;
    FlashpixVersion: number;
    ColorSpace: number;
    PixelXDimension: number;
    PixelYDimension: number;
    RelatedSoundFile: number;
    FlashEnergy: number;
    SpatialFrequencyResponse: number;
    FocalPlaneXResolution: number;
    FocalPlaneYResolution: number;
    FocalPlaneResolutionUnit: number;
    SubjectLocation: number;
    ExposureIndex: number;
    SensingMethod: number;
    FileSource: number;
    SceneType: number;
    CFAPattern: number;
    CustomRendered: number;
    ExposureMode: number;
    WhiteBalance: number;
    DigitalZoomRatio: number;
    FocalLengthIn35mmFilm: number;
    SceneCaptureType: number;
    GainControl: number;
    Contrast: number;
    Saturation: number;
    Sharpness: number;
    DeviceSettingDescription: number;
    SubjectDistanceRange: number;
    ImageUniqueID: number;
    LensSpecification: number;
    LensMake: number;
    LensModel: number;
    [key: string]: number;
  };

  export const GPSIFD: {
    GPSVersionID: number;
    GPSLatitudeRef: number;
    GPSLatitude: number;
    GPSLongitudeRef: number;
    GPSLongitude: number;
    GPSAltitudeRef: number;
    GPSAltitude: number;
    GPSTimeStamp: number;
    GPSSatellites: number;
    GPSStatus: number;
    GPSMeasureMode: number;
    GPSDOP: number;
    GPSSpeedRef: number;
    GPSSpeed: number;
    GPSTrackRef: number;
    GPSTrack: number;
    GPSImgDirectionRef: number;
    GPSImgDirection: number;
    GPSMapDatum: number;
    GPSDestLatitudeRef: number;
    GPSDestLatitude: number;
    GPSDestLongitudeRef: number;
    GPSDestLongitude: number;
    GPSDestBearingRef: number;
    GPSDestBearing: number;
    GPSDestDistanceRef: number;
    GPSDestDistance: number;
    GPSProcessingMethod: number;
    GPSAreaInformation: number;
    GPSDateStamp: number;
    GPSDifferential: number;
    [key: string]: number;
  };

  export const InteropIFD: {
    InteroperabilityIndex: number;
    [key: string]: number;
  };

  /**
   * Default export containing all functions
   */
  const piexif: {
    load: typeof load;
    dump: typeof dump;
    insert: typeof insert;
    remove: typeof remove;
    ImageIFD: typeof ImageIFD;
    ExifIFD: typeof ExifIFD;
    GPSIFD: typeof GPSIFD;
    InteropIFD: typeof InteropIFD;
  };

  export default piexif;
}
