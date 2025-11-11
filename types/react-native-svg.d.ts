declare module 'react-native-svg' {
  import React from 'react';
  import { ViewProps } from 'react-native';

  export interface SvgProps extends ViewProps {
    width?: number | string;
    height?: number | string;
    viewBox?: string;
    preserveAspectRatio?: string;
    color?: string;
    title?: string;
  }

  export interface PathProps {
    d: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number | string;
    strokeLinecap?: 'butt' | 'round' | 'square';
    strokeLinejoin?: 'miter' | 'round' | 'bevel';
  }

  export class Svg extends React.Component<SvgProps> {}
  export class Circle extends React.Component<CircleProps> {}
  export class Ellipse extends React.Component<EllipseProps> {}
  export class G extends React.Component<GProps> {}
  export class Text extends React.Component<TextProps> {}
  export class TextPath extends React.Component<TextPathProps> {}
  export class TSpan extends React.Component<TSpanProps> {}
  export class Path extends React.Component<PathProps> {}
  export class Polygon extends React.Component<PolygonProps> {}
  export class Polyline extends React.Component<PolylineProps> {}
  export class Line extends React.Component<LineProps> {}
  export class Rect extends React.Component<RectProps> {}
  export class Use extends React.Component<UseProps> {}
  export class Image extends React.Component<ImageProps> {}
  export class Symbol extends React.Component<SymbolProps> {}
  export class Defs extends React.Component<DefsProps> {}
  export class LinearGradient extends React.Component<LinearGradientProps> {}
  export class RadialGradient extends React.Component<RadialGradientProps> {}
  export class Stop extends React.Component<StopProps> {}
  export class ClipPath extends React.Component<ClipPathProps> {}
  export class Pattern extends React.Component<PatternProps> {}
  export class Mask extends React.Component<MaskProps> {}

  export interface CircleProps {
    cx?: number | string;
    cy?: number | string;
    r?: number | string;
    fill?: string;
  }

  export interface EllipseProps {
    cx?: number | string;
    cy?: number | string;
    rx?: number | string;
    ry?: number | string;
    fill?: string;
  }

  export interface GProps {
    fill?: string;
    stroke?: string;
  }

  export interface TextProps {
    x?: number | string;
    y?: number | string;
    rotate?: number | string;
    textAnchor?: 'start' | 'middle' | 'end';
    fontFamily?: string;
    fontSize?: number | string;
    fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    fill?: string;
  }

  export interface TextPathProps {
    href?: string;
    startOffset?: number | string;
  }

  export interface TSpanProps {
    x?: number | string;
    y?: number | string;
    rotate?: number | string;
    fill?: string;
  }

  export interface PolygonProps {
    points?: string;
    fill?: string;
  }

  export interface PolylineProps {
    points?: string;
    fill?: string;
  }

  export interface LineProps {
    x1?: number | string;
    y1?: number | string;
    x2?: number | string;
    y2?: number | string;
    stroke?: string;
  }

  export interface RectProps {
    x?: number | string;
    y?: number | string;
    width?: number | string;
    height?: number | string;
    rx?: number | string;
    ry?: number | string;
    fill?: string;
  }

  export interface UseProps {
    href?: string;
    x?: number | string;
    y?: number | string;
    width?: number | string;
    height?: number | string;
  }

  export interface ImageProps {
    x?: number | string;
    y?: number | string;
    width?: number | string;
    height?: number | string;
    href?: number | string;
    preserveAspectRatio?: string;
  }

  export interface SymbolProps {
    viewBox?: string;
    width?: number | string;
    height?: number | string;
  }

  export interface DefsProps {}

  export interface LinearGradientProps {
    x1?: number | string;
    y1?: number | string;
    x2?: number | string;
    y2?: number | string;
    gradientUnits?: 'userSpaceOnUse' | 'objectBoundingBox';
    id?: string;
  }

  export interface RadialGradientProps {
    cx?: number | string;
    cy?: number | string;
    rx?: number | string;
    ry?: number | string;
    gradientUnits?: 'userSpaceOnUse' | 'objectBoundingBox';
    id?: string;
  }

  export interface StopProps {
    offset?: number | string;
    stopColor?: string;
    stopOpacity?: number | string;
  }

  export interface ClipPathProps {
    id?: string;
  }

  export interface PatternProps {
    x?: number | string;
    y?: number | string;
    width?: number | string;
    height?: number | string;
    patternUnits?: 'userSpaceOnUse' | 'objectBoundingBox';
    id?: string;
  }

  export interface MaskProps {
    id?: string;
  }
}
