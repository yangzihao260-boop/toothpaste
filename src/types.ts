/**
 * Toothpaste Learning Game Types
 */

export type PastePatternType = 'striped' | 'rainbow' | 'solid' | 'swirl' | 'candy';

export interface ToothpasteStyle {
  id: string;
  name: string;
  nameZh: string;
  type: PastePatternType;
  colors: string[];
  stripeWeights?: number[];
  sparkle?: boolean;
}

export interface PasteSegment {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style: ToothpasteStyle;
  offsetRatio: number; // For swirl curvature
  createdAt: number;
}

export interface AudioSettings {
  bgmEnabled: boolean;
  sfxEnabled: boolean;
  speechEnabled: boolean;
  volume: number;
}
