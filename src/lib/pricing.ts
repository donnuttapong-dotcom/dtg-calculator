import { printAreasById, type PrintAreaId } from '../data/mockups'

export type GarmentColorId = 'white' | 'black'
export type GarmentStyleId = 'shortSleeve' | 'longSleeve'

export type PricingConfig = {
  shortSleeveGarmentCost: number
  longSleeveGarmentCost: number
  minimumPrintCharge: number
  frontRate: number
  backRate: number
  sleeveRate: number
  whiteSurcharge: number
  blackSurcharge: number
  marginPercent: number
}

export const pricingStorageKey = 'dtg-pricing-config-v3'

export const defaultPricingConfig: PricingConfig = {
  shortSleeveGarmentCost: 95,
  longSleeveGarmentCost: 145,
  minimumPrintCharge: 80,
  frontRate: 1.45,
  backRate: 1.55,
  sleeveRate: 2.5,
  whiteSurcharge: 0,
  blackSurcharge: 18,
  marginPercent: 32,
}

export const colorOptions: Array<{
  id: GarmentColorId
  label: string
  swatch: string
}> = [
  { id: 'white', label: 'White', swatch: '#f8fafc' },
  { id: 'black', label: 'Black', swatch: '#0f172a' },
]

export const garmentStyleOptions: Array<{
  id: GarmentStyleId
  label: string
}> = [
  { id: 'shortSleeve', label: 'Short sleeve' },
  { id: 'longSleeve', label: 'Long sleeve' },
]

export function loadPricingConfig() {
  const storedValue = localStorage.getItem(pricingStorageKey)

  if (!storedValue) {
    return defaultPricingConfig
  }

  try {
    const parsed = JSON.parse(storedValue) as Partial<PricingConfig>
    return {
      ...defaultPricingConfig,
      ...parsed,
    }
  } catch {
    return defaultPricingConfig
  }
}

function getGarmentBaseCost(
  pricing: PricingConfig,
  garmentStyle: GarmentStyleId,
) {
  return garmentStyle === 'longSleeve'
    ? pricing.longSleeveGarmentCost
    : pricing.shortSleeveGarmentCost
}

function getColorSurcharge(
  pricing: PricingConfig,
  garmentColor: GarmentColorId,
) {
  return garmentColor === 'black'
    ? pricing.blackSurcharge
    : pricing.whiteSurcharge
}

function getPrintRate(pricing: PricingConfig, printAreaId: PrintAreaId) {
  const rateMap: Record<PrintAreaId, number> = {
    front: pricing.frontRate,
    back: pricing.backRate,
    sleeve: pricing.sleeveRate,
  }

  return rateMap[printAreaId]
}

export function calculateQuote({
  pricing,
  printAreaId,
  garmentColor,
  garmentStyle,
  quantity,
  artworkWidthPct,
  artworkHeightPct,
}: {
  pricing: PricingConfig
  printAreaId: PrintAreaId
  garmentColor: GarmentColorId
  garmentStyle: GarmentStyleId
  quantity: number
  artworkWidthPct: number
  artworkHeightPct: number
}) {
  const printArea = printAreasById[printAreaId]
  const artworkWidthIn =
    printArea.physicalSize.widthIn * Math.max(artworkWidthPct, 0)
  const artworkHeightIn =
    printArea.physicalSize.heightIn * Math.max(artworkHeightPct, 0)
  const printSquareInches = artworkWidthIn * artworkHeightIn

  const blankGarmentCost = getGarmentBaseCost(pricing, garmentStyle)
  const colorSurcharge = getColorSurcharge(pricing, garmentColor)
  const printCharge = Math.max(
    pricing.minimumPrintCharge,
    printSquareInches * getPrintRate(pricing, printAreaId),
  )
  const subtotalBeforeMargin = blankGarmentCost + colorSurcharge + printCharge
  const finalUnitPrice =
    subtotalBeforeMargin * (1 + pricing.marginPercent / 100)
  const total = finalUnitPrice * quantity

  return {
    artworkWidthIn,
    artworkHeightIn,
    printSquareInches,
    blankGarmentCost,
    colorSurcharge,
    printCharge,
    subtotalBeforeMargin,
    marginPercent: pricing.marginPercent,
    finalUnitPrice,
    total,
  }
}

export function formatCurrency(value: number, locale = 'th-TH') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDimension(value: number) {
  return `${value.toFixed(1)}"`
}
