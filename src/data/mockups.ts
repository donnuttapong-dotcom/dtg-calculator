import { shortFront, shortSide, shortBack, longFront, longSide, longBack } from './mockupAssets'

export type ViewId = 'front' | 'back' | 'side'
export type PrintAreaId = 'front' | 'back' | 'sleeve'
export type GarmentStyleId = 'shortSleeve' | 'longSleeve'

type OverlayConfig = {
  leftPct: number
  topPct: number
  widthPct: number
  heightPct: number
  rotationDeg?: number
}

export const mockupViews: Record<
  ViewId,
  {
    id: ViewId
    label: string
    imageSrcByStyle: Record<GarmentStyleId, string>
    frameWidthByStyle: Record<GarmentStyleId, number>
    frameHeight: number
  }
> = {
  front: {
    id: 'front',
    label: 'Front',
    imageSrcByStyle: {
      shortSleeve: shortFront,
      longSleeve: longFront,
    },
    frameWidthByStyle: {
      shortSleeve: 684,
      longSleeve: 649,
    },
    frameHeight: 832,
  },
  back: {
    id: 'back',
    label: 'Back',
    imageSrcByStyle: {
      shortSleeve: shortBack,
      longSleeve: longBack,
    },
    frameWidthByStyle: {
      shortSleeve: 670,
      longSleeve: 635,
    },
    frameHeight: 836,
  },
  side: {
    id: 'side',
    label: 'Side',
    imageSrcByStyle: {
      shortSleeve: shortSide,
      longSleeve: longSide,
    },
    frameWidthByStyle: {
      shortSleeve: 403,
      longSleeve: 383,
    },
    frameHeight: 832,
  },
}

export const printAreaOptions: Array<{
  id: PrintAreaId
  label: string
  description: string
  sizeLabel: string
}> = [
  {
    id: 'front',
    label: 'Front chest / body',
    description: 'Main artwork placement centered on the front body panel.',
    sizeLabel: '16" × 21"',
  },
  {
    id: 'back',
    label: 'Back body',
    description: 'Large back print zone for full-size designs.',
    sizeLabel: '16" × 21"',
  },
  {
    id: 'sleeve',
    label: 'Sleeve print',
    description: 'Compact print zone aligned to the side sleeve area.',
    sizeLabel: '4" × 12"',
  },
]

export const printAreasById: Record<
  PrintAreaId,
  {
    id: PrintAreaId
    label: string
    description: string
    sizeLabel: string
    viewId: ViewId
    physicalSize: { widthIn: number; heightIn: number }
    overlay: OverlayConfig
  }
> = {
  front: {
    id: 'front',
    label: 'Front chest / body',
    description: 'Centered around the chest and upper body print area.',
    sizeLabel: '16" × 21"',
    viewId: 'front',
    physicalSize: { widthIn: 16, heightIn: 21 },
    overlay: {
      leftPct: 0.217,
      topPct: 0.226,
      widthPct: 0.566,
      heightPct: 0.57,
    },
  },
  back: {
    id: 'back',
    label: 'Back body',
    description: 'Large print zone across the upper back body panel.',
    sizeLabel: '16" × 21"',
    viewId: 'back',
    physicalSize: { widthIn: 16, heightIn: 21 },
    overlay: {
      leftPct: 0.214,
      topPct: 0.212,
      widthPct: 0.572,
      heightPct: 0.584,
    },
  },
  sleeve: {
    id: 'sleeve',
    label: 'Sleeve print',
    description: 'Sleeve print aligned on the visible side sleeve panel.',
    sizeLabel: '4" × 12"',
    viewId: 'side',
    physicalSize: { widthIn: 4, heightIn: 12 },
    overlay: {
      leftPct: 0.088,
      topPct: 0.066,
      widthPct: 0.182,
      heightPct: 0.398,
      rotationDeg: -20,
    },
  },
}

export const defaultArtworkState = {
  src: null,
  name: '',
  aspectRatio: 1,
  leftPct: 0.18,
  topPct: 0.15,
  widthPct: 0.42,
  rotation: 0,
}
