import { useEffect, useMemo, useRef, useState } from 'react'
import {
  defaultArtworkState,
  mockupViews,
  printAreaOptions,
  printAreasById,
  type PrintAreaId,
  type ViewId,
} from './data/mockups'
import {
  calculateQuote,
  colorOptions,
  defaultPricingConfig,
  formatCurrency,
  formatDimension,
  garmentStyleOptions,
  loadPricingConfig,
  pricingStorageKey,
  type GarmentColorId,
  type GarmentStyleId,
  type PricingConfig,
} from './lib/pricing'

type PageId = 'calculator' | 'admin'
type Language = 'th' | 'en'

type ArtworkState = {
  src: string | null
  name: string
  aspectRatio: number
  leftPct: number
  topPct: number
  widthPct: number
  rotation: number
}

type InteractionState =
  | {
      mode: 'move'
      startX: number
      startY: number
      startLeftPct: number
      startTopPct: number
    }
  | {
      mode: 'resize'
      startX: number
      startY: number
      startWidthPct: number
    }
  | {
      mode: 'rotate'
      startAngle: number
      startRotation: number
    }

const copy = {
  th: {
    brand: 'DTG Studio Calculator',
    title: 'เครื่องคำนวณ DTG ที่อ่านง่ายและคุมงานออกแบบง่ายขึ้น',
    subtitle:
      'รองรับไทยและอังกฤษ เลือกแขนสั้นหรือแขนยาว ดูเสื้อจริง วางลายบน grid 1x1 นิ้ว และเห็นขนาดลายสด ๆ ระหว่างย่อขยาย',
    calculator: 'คำนวณราคา',
    admin: 'ตั้งค่าราคา',
    language: 'ภาษา',
    product: 'สินค้า',
    shirtStyle: 'ทรงเสื้อ',
    shirtColor: 'สีเสื้อ',
    artwork: 'อาร์ตเวิร์ก',
    upload: 'อัปโหลดลาย',
    replace: 'เปลี่ยนไฟล์ลาย',
    browse: 'เลือกไฟล์',
    remove: 'ลบไฟล์',
    uploadHint: 'ลาก ย่อ ขยาย หมุนได้จากพรีวิว และจะเห็นขนาดกว้าง x สูงเป็นนิ้วทันที',
    noArtwork: 'ยังไม่ได้เลือกลาย',
    liveArtworkSize: 'ขนาดลายปัจจุบัน',
    printLocation: 'ตำแหน่งพิมพ์',
    quantity: 'จำนวน',
    fineTune: 'ปรับละเอียด',
    previewZoom: 'ซูมพรีวิว',
    artworkScale: 'สเกลลาย',
    rotation: 'หมุนรอบทิศ',
    rotationNow: 'องศาปัจจุบัน',
    mockupPreview: 'พรีวิวเสื้อ',
    mockupHint: 'เสื้อจะเปลี่ยนตามแขนสั้น/แขนยาว และสีเสื้อทันที',
    activePrintArea: 'พื้นที่พิมพ์ที่เลือก',
    view: 'มุมมอง',
    printableZone: 'โซนพิมพ์',
    areaDimensions: 'ขนาดพื้นที่พิมพ์',
    oneInchGrid: 'ตาราง 1 x 1 นิ้ว',
    uploadToPlace: 'อัปโหลดลายเพื่อเริ่มวางงาน',
    quoteSummary: 'สรุปราคา',
    quoteHint: 'ราคาอัปเดตทันทีตามชนิดเสื้อ สี ขนาดลาย และจำนวน',
    grandTotal: 'ราคารวม',
    perShirt: 'ต่อ 1 ตัว',
    liveQuote: 'ราคาปัจจุบัน',
    printSpec: 'รายละเอียดงานพิมพ์',
    garment: 'รายละเอียดเสื้อ',
    priceBreakdown: 'โครงสร้างราคา',
    location: 'ตำแหน่ง',
    artworkSize: 'ขนาดลาย',
    coverage: 'พื้นที่ลาย',
    color: 'สี',
    style: 'ทรง',
    blankCost: 'ต้นทุนเสื้อ',
    colorSurcharge: 'ค่าสีเสื้อ',
    printCharge: 'ค่าพิมพ์',
    baseSubtotal: 'รวมก่อนบวกกำไร',
    marginIncluded: 'กำไรที่รวมแล้ว',
    adminTitle: 'หน้าตั้งค่าราคา',
    adminHint: 'กำหนดต้นทุนเสื้อและเรตราคาพิมพ์ แล้วบันทึกไว้ในเครื่องด้วย localStorage',
    savePricing: 'บันทึกราคา',
    resetDefaults: 'รีเซ็ตค่าเริ่มต้น',
    pricingSaved: 'บันทึกราคาเรียบร้อย',
    pricingSnapshot: 'ค่าสรุปราคาปัจจุบัน',
    dimensionsBadge: 'กว้าง x สูง',
    fields: {
      shortSleeveCost: 'ต้นทุนเสื้อแขนสั้น',
      longSleeveCost: 'ต้นทุนเสื้อแขนยาว',
      marginPercent: 'เปอร์เซ็นต์กำไร',
      minimumPrintCharge: 'ค่าพิมพ์ขั้นต่ำ',
      whiteSurcharge: 'ค่าสีขาว',
      blackSurcharge: 'ค่าสีดำ',
      frontRate: 'เรตราคาอก/หน้า ต่อ ตร.นิ้ว',
      backRate: 'เรตราคาหลัง ต่อ ตร.นิ้ว',
      sleeveRate: 'เรตราคาแขน ต่อ ตร.นิ้ว',
    },
    colors: { white: 'ขาว', black: 'ดำ' },
    styles: { shortSleeve: 'แขนสั้น', longSleeve: 'แขนยาว' },
    views: { front: 'ด้านหน้า', back: 'ด้านหลัง', side: 'ด้านข้าง' },
    areas: {
      front: { label: 'หน้าอก / ด้านหน้า', description: 'งานพิมพ์หลักตรงอกและลำตัวด้านหน้า' },
      back: { label: 'กลางหลัง', description: 'พื้นที่พิมพ์ใหญ่สำหรับงานหลัง' },
      sleeve: { label: 'แขนเสื้อ', description: 'พื้นที่พิมพ์แนวตั้งบนแขนเสื้อ' },
    },
  },
  en: {
    brand: 'DTG Studio Calculator',
    title: 'A clearer DTG calculator for daily production use',
    subtitle:
      'Use Thai or English, switch between short and long sleeves, place artwork on a 1x1 inch grid, and read the live print size while scaling.',
    calculator: 'Calculator',
    admin: 'Admin Pricing',
    language: 'Language',
    product: 'Product',
    shirtStyle: 'Shirt style',
    shirtColor: 'Shirt color',
    artwork: 'Artwork',
    upload: 'Upload artwork',
    replace: 'Replace artwork',
    browse: 'Browse',
    remove: 'Remove',
    uploadHint: 'Drag, resize, and rotate from the preview while reading the live width x height in inches.',
    noArtwork: 'No artwork selected yet',
    liveArtworkSize: 'Current artwork size',
    printLocation: 'Print location',
    quantity: 'Quantity',
    fineTune: 'Fine tune',
    previewZoom: 'Preview zoom',
    artworkScale: 'Artwork scale',
    rotation: 'Full rotation',
    rotationNow: 'Current angle',
    mockupPreview: 'Mockup preview',
    mockupHint: 'The shirt mockup updates instantly for short sleeve, long sleeve, and color.',
    activePrintArea: 'Active print area',
    view: 'View',
    printableZone: 'Printable zone',
    areaDimensions: 'Area dimensions',
    oneInchGrid: '1 x 1 inch grid',
    uploadToPlace: 'Upload artwork to place design',
    quoteSummary: 'Quote summary',
    quoteHint: 'Pricing updates live based on shirt type, shirt color, artwork size, and quantity.',
    grandTotal: 'Grand total',
    perShirt: 'Per shirt',
    liveQuote: 'Live quote',
    printSpec: 'Print spec',
    garment: 'Garment',
    priceBreakdown: 'Price breakdown',
    location: 'Location',
    artworkSize: 'Artwork size',
    coverage: 'Coverage',
    color: 'Color',
    style: 'Style',
    blankCost: 'Blank cost',
    colorSurcharge: 'Color surcharge',
    printCharge: 'Print charge',
    baseSubtotal: 'Base subtotal',
    marginIncluded: 'Margin included',
    adminTitle: 'Admin Pricing Page',
    adminHint: 'Set garment costs and print rates, then save them locally with localStorage.',
    savePricing: 'Save pricing',
    resetDefaults: 'Reset to defaults',
    pricingSaved: 'Pricing saved locally',
    pricingSnapshot: 'Current pricing snapshot',
    dimensionsBadge: 'W x H',
    fields: {
      shortSleeveCost: 'Short sleeve garment cost',
      longSleeveCost: 'Long sleeve garment cost',
      marginPercent: 'Margin percent',
      minimumPrintCharge: 'Minimum print charge',
      whiteSurcharge: 'White shirt surcharge',
      blackSurcharge: 'Black shirt surcharge',
      frontRate: 'Front print rate / sq.in',
      backRate: 'Back print rate / sq.in',
      sleeveRate: 'Sleeve print rate / sq.in',
    },
    colors: { white: 'White', black: 'Black' },
    styles: { shortSleeve: 'Short sleeve', longSleeve: 'Long sleeve' },
    views: { front: 'Front', back: 'Back', side: 'Side' },
    areas: {
      front: { label: 'Front chest / body', description: 'Main print area across the front body panel.' },
      back: { label: 'Back body', description: 'Large print area for the back panel.' },
      sleeve: { label: 'Sleeve print', description: 'Vertical print area aligned to the sleeve panel.' },
    },
  },
} as const

type Translation = (typeof copy)[Language]

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function normalizeRotation(value: number) {
  return ((value % 360) + 360) % 360
}

function getArtworkHeightPct(
  widthPct: number,
  aspectRatio: number,
  printAreaId: PrintAreaId,
  garmentStyle: GarmentStyleId,
) {
  const area = printAreasById[printAreaId]
  const view = mockupViews[area.viewId]
  const boxAspect =
    (view.frameWidthByStyle[garmentStyle] * area.overlay.widthPct) /
    (view.frameHeight * area.overlay.heightPct)

  return (widthPct * boxAspect) / aspectRatio
}

function clampArtworkPosition(
  artwork: ArtworkState,
  printAreaId: PrintAreaId,
  garmentStyle: GarmentStyleId,
) {
  const heightPct = getArtworkHeightPct(
    artwork.widthPct,
    artwork.aspectRatio,
    printAreaId,
    garmentStyle,
  )

  return {
    ...artwork,
    leftPct: clamp(artwork.leftPct, 0, 1 - artwork.widthPct),
    topPct: clamp(artwork.topPct, 0, Math.max(0, 1 - heightPct)),
  }
}

function createInitialArtworkState(next: Partial<ArtworkState> = {}): ArtworkState {
  return {
    ...defaultArtworkState,
    ...next,
  }
}

function getGridBackground(widthIn: number, heightIn: number) {
  return {
    backgroundImage:
      'linear-gradient(to right, rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.18) 1px, transparent 1px)',
    backgroundSize: `${100 / widthIn}% ${100 / heightIn}%`,
  }
}

function App() {
  const [language, setLanguage] = useState<Language>('th')
  const [page, setPage] = useState<PageId>('calculator')
  const [activeViewId, setActiveViewId] = useState<ViewId>('front')
  const [printAreaId, setPrintAreaId] = useState<PrintAreaId>('front')
  const [artwork, setArtwork] = useState<ArtworkState>(() => createInitialArtworkState())
  const [quantity, setQuantity] = useState(24)
  const [garmentColor, setGarmentColor] = useState<GarmentColorId>('white')
  const [garmentStyle, setGarmentStyle] = useState<GarmentStyleId>('shortSleeve')
  const [previewZoom, setPreviewZoom] = useState(1)
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(() => loadPricingConfig())
  const [pricingDraft, setPricingDraft] = useState<PricingConfig>(() => loadPricingConfig())
  const [pricingSaved, setPricingSaved] = useState(false)
  const uploadRef = useRef<HTMLInputElement | null>(null)
  const printAreaRef = useRef<HTMLDivElement | null>(null)
  const interactionRef = useRef<InteractionState | null>(null)

  const t = copy[language]
  const locale = language === 'th' ? 'th-TH' : 'en-US'
  const selectedArea = printAreasById[printAreaId]
  const activeView = mockupViews[activeViewId]
  const printAreaView = mockupViews[selectedArea.viewId]
  const activeMockupSrc = activeView.imageSrcByStyle[garmentStyle]
  const normalizedRotation = normalizeRotation(artwork.rotation)

  const artworkHeightPct = getArtworkHeightPct(
    artwork.widthPct,
    artwork.aspectRatio,
    printAreaId,
    garmentStyle,
  )
  const artworkWidthInches = selectedArea.physicalSize.widthIn * artwork.widthPct
  const artworkHeightInches = selectedArea.physicalSize.heightIn * artworkHeightPct

  const quote = useMemo(
    () =>
      calculateQuote({
        pricing: pricingConfig,
        printAreaId,
        garmentColor,
        garmentStyle,
        quantity,
        artworkWidthPct: artwork.widthPct,
        artworkHeightPct,
      }),
    [
      artwork.widthPct,
      artworkHeightPct,
      garmentColor,
      garmentStyle,
      pricingConfig,
      printAreaId,
      quantity,
    ],
  )

  useEffect(() => {
    const previousUrl = artwork.src
    return () => {
      if (previousUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previousUrl)
      }
    }
  }, [artwork.src])

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const interaction = interactionRef.current
      const areaEl = printAreaRef.current
      if (!interaction || !areaEl) return

      const rect = areaEl.getBoundingClientRect()
      if (!rect.width || !rect.height) return

      if (interaction.mode === 'move') {
        const deltaX = (event.clientX - interaction.startX) / rect.width
        const deltaY = (event.clientY - interaction.startY) / rect.height
        setArtwork((current) =>
          clampArtworkPosition(
            {
              ...current,
              leftPct: interaction.startLeftPct + deltaX,
              topPct: interaction.startTopPct + deltaY,
            },
            printAreaId,
            garmentStyle,
          ),
        )
      }

      if (interaction.mode === 'resize') {
        const deltaX = (event.clientX - interaction.startX) / rect.width
        const deltaY = (event.clientY - interaction.startY) / rect.height
        const nextWidthPct = clamp(interaction.startWidthPct + deltaX + deltaY * 0.45, 0.08, 0.98)
        setArtwork((current) =>
          clampArtworkPosition(
            {
              ...current,
              widthPct: nextWidthPct,
            },
            printAreaId,
            garmentStyle,
          ),
        )
      }

      if (interaction.mode === 'rotate') {
        const artworkEl = areaEl.querySelector('[data-artwork-box="true"]') as HTMLDivElement | null
        if (!artworkEl) return
        const artworkRect = artworkEl.getBoundingClientRect()
        const centerX = artworkRect.left + artworkRect.width / 2
        const centerY = artworkRect.top + artworkRect.height / 2
        const nextAngle = (Math.atan2(event.clientY - centerY, event.clientX - centerX) * 180) / Math.PI
        setArtwork((current) => ({
          ...current,
          rotation: normalizeRotation(interaction.startRotation + (nextAngle - interaction.startAngle)),
        }))
      }
    }

    const handlePointerUp = () => {
      interactionRef.current = null
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [garmentStyle, printAreaId])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const nextUrl = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      setArtwork((current) => {
        if (current.src?.startsWith('blob:')) URL.revokeObjectURL(current.src)
        return clampArtworkPosition(
          createInitialArtworkState({
            src: nextUrl,
            name: file.name,
            aspectRatio: image.width / image.height,
          }),
          printAreaId,
          garmentStyle,
        )
      })
    }
    image.src = nextUrl
    event.target.value = ''
  }

  const handleRemoveArtwork = () => {
    setArtwork((current) => {
      if (current.src?.startsWith('blob:')) URL.revokeObjectURL(current.src)
      return createInitialArtworkState()
    })
  }

  const startMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!artwork.src) return
    event.preventDefault()
    interactionRef.current = {
      mode: 'move',
      startX: event.clientX,
      startY: event.clientY,
      startLeftPct: artwork.leftPct,
      startTopPct: artwork.topPct,
    }
  }

  const startResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!artwork.src) return
    event.preventDefault()
    event.stopPropagation()
    interactionRef.current = {
      mode: 'resize',
      startX: event.clientX,
      startY: event.clientY,
      startWidthPct: artwork.widthPct,
    }
  }

  const startRotate = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!artwork.src || !printAreaRef.current) return
    event.preventDefault()
    event.stopPropagation()
    const areaEl = printAreaRef.current
    const artworkEl = areaEl.querySelector('[data-artwork-box="true"]') as HTMLDivElement | null
    if (!artworkEl) return
    const artworkRect = artworkEl.getBoundingClientRect()
    const centerX = artworkRect.left + artworkRect.width / 2
    const centerY = artworkRect.top + artworkRect.height / 2
    const startAngle = (Math.atan2(event.clientY - centerY, event.clientX - centerX) * 180) / Math.PI
    interactionRef.current = {
      mode: 'rotate',
      startAngle,
      startRotation: artwork.rotation,
    }
  }

  const handlePricingInput = <K extends keyof PricingConfig>(key: K, value: number) => {
    setPricingDraft((current) => ({ ...current, [key]: value }))
    setPricingSaved(false)
  }

  const handlePrintAreaChange = (nextPrintAreaId: PrintAreaId) => {
    setPrintAreaId(nextPrintAreaId)
    setActiveViewId(printAreasById[nextPrintAreaId].viewId)
    setArtwork((current) => clampArtworkPosition(current, nextPrintAreaId, garmentStyle))
  }

  const savePricing = () => {
    localStorage.setItem(pricingStorageKey, JSON.stringify(pricingDraft))
    setPricingConfig(pricingDraft)
    setPricingSaved(true)
  }

  const resetPricing = () => {
    localStorage.setItem(pricingStorageKey, JSON.stringify(defaultPricingConfig))
    setPricingConfig(defaultPricingConfig)
    setPricingDraft(defaultPricingConfig)
    setPricingSaved(true)
  }

  const shirtTintClass = garmentColor === 'black' ? 'brightness-[0.18] contrast-[1.18] grayscale' : ''
  const gridStyle = getGridBackground(selectedArea.physicalSize.widthIn, selectedArea.physicalSize.heightIn)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col px-3 pb-28 pt-3 sm:px-5 lg:px-8 lg:pb-8 lg:pt-5">
        <header className="mb-3 rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 backdrop-blur sm:px-6 sm:py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300 sm:text-sm">{t.brand}</p>
              <h1 className="mt-2 max-w-4xl text-2xl font-semibold tracking-tight text-white sm:text-4xl">{t.title}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">{t.subtitle}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-1.5">
                <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{t.language}</div>
                <div className="inline-flex rounded-full bg-slate-900/30 p-1">
                  {(['th', 'en'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setLanguage(lang)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        language === lang ? 'bg-cyan-400 text-slate-950' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {lang === 'th' ? 'ไทย' : 'English'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="inline-flex rounded-full border border-white/10 bg-slate-900/70 p-1">
                {([
                  { id: 'calculator', label: t.calculator },
                  { id: 'admin', label: t.admin },
                ] as Array<{ id: PageId; label: string }>).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPage(item.id)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      page === item.id ? 'bg-cyan-400 text-slate-950' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {page === 'calculator' ? (
          <main className="grid flex-1 gap-3 xl:grid-cols-[22rem_minmax(0,1fr)_22rem] xl:gap-4">
            <section className="order-2 space-y-3 xl:order-1 xl:sticky xl:top-5 xl:h-fit">
              <ControlCard title={t.product}>
                <FieldLabel>{t.shirtStyle}</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  {garmentStyleOptions.map((style) => (
                    <SelectCard
                      key={style.id}
                      active={garmentStyle === style.id}
                      onClick={() => setGarmentStyle(style.id)}
                      label={t.styles[style.id]}
                    />
                  ))}
                </div>

                <FieldLabel className="mt-4">{t.shirtColor}</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setGarmentColor(color.id)}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        garmentColor === color.id
                          ? 'border-cyan-300 bg-cyan-300/15 text-white'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <span className="mb-2 block h-4 w-10 rounded-full border border-black/15" style={{ backgroundColor: color.swatch }} />
                      <span className="text-sm font-medium">{t.colors[color.id]}</span>
                    </button>
                  ))}
                </div>
              </ControlCard>

              <ControlCard title={t.artwork} action={artwork.src ? { label: t.remove, onClick: handleRemoveArtwork } : undefined}>
                <button
                  type="button"
                  onClick={() => uploadRef.current?.click()}
                  className="flex w-full items-center justify-between rounded-3xl border border-dashed border-cyan-400/40 bg-cyan-400/10 px-4 py-4 text-left transition hover:border-cyan-300 hover:bg-cyan-400/15"
                >
                  <div>
                    <p className="font-medium text-white">{artwork.src ? t.replace : t.upload}</p>
                    <p className="mt-1 text-sm text-slate-300">{t.uploadHint}</p>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">{t.browse}</span>
                </button>
                <input ref={uploadRef} className="hidden" type="file" accept="image/*" onChange={handleFileUpload} />
                <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                  <p className="font-medium text-white">{artwork.name || t.noArtwork}</p>
                  <p className="mt-2 text-cyan-200">{t.liveArtworkSize}: {formatDimension(artworkWidthInches)} × {formatDimension(artworkHeightInches)}</p>
                </div>
              </ControlCard>

              <ControlCard title={t.printLocation}>
                <div className="grid gap-2">
                  {printAreaOptions.map((area) => (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => handlePrintAreaChange(area.id)}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        printAreaId === area.id
                          ? 'border-cyan-300 bg-cyan-300/15 text-white'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium">{t.areas[area.id].label}</p>
                          <p className="mt-1 text-sm text-slate-400">{t.areas[area.id].description}</p>
                        </div>
                        <span className="text-sm font-semibold text-cyan-200">{area.sizeLabel}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </ControlCard>

              <ControlCard title={t.quantity} rightLabel={`${quantity} pcs`}>
                <input
                  type="range"
                  min="1"
                  max="250"
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  className="w-full accent-cyan-400"
                />
                <div className="mt-2 flex justify-between text-xs uppercase tracking-[0.2em] text-slate-500">
                  <span>1</span>
                  <span>250</span>
                </div>
              </ControlCard>

              <ControlCard title={t.fineTune} rightLabel={`${Math.round(previewZoom * 100)}%`}>
                <RangeField
                  label={t.previewZoom}
                  value={previewZoom}
                  min={0.85}
                  max={1.35}
                  step={0.01}
                  onChange={(value) => setPreviewZoom(value)}
                />
                <RangeField
                  label={`${t.artworkScale} • ${formatDimension(artworkWidthInches)} × ${formatDimension(artworkHeightInches)}`}
                  value={artwork.widthPct}
                  min={0.08}
                  max={0.98}
                  step={0.01}
                  onChange={(value) =>
                    setArtwork((current) =>
                      clampArtworkPosition(
                        {
                          ...current,
                          widthPct: value,
                        },
                        printAreaId,
                        garmentStyle,
                      ),
                    )
                  }
                />
                <RangeField
                  label={`${t.rotation} • ${Math.round(normalizedRotation)}°`}
                  value={normalizedRotation}
                  min={0}
                  max={360}
                  step={1}
                  onChange={(value) => setArtwork((current) => ({ ...current, rotation: value }))}
                />
              </ControlCard>
            </section>

            <section className="order-1 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.22),_transparent_34%),linear-gradient(180deg,_rgba(15,23,42,0.9),_rgba(2,6,23,0.96))] p-3 shadow-2xl shadow-slate-950/40 sm:p-4 xl:order-2">
              <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">{t.mockupPreview}</h2>
                  <p className="mt-1 text-sm text-slate-300">{t.mockupHint}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
                  {(Object.values(mockupViews) as Array<(typeof mockupViews)[ViewId]>).map((view) => (
                    <button
                      key={view.id}
                      type="button"
                      onClick={() => setActiveViewId(view.id)}
                      className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                        activeViewId === view.id ? 'bg-white text-slate-950' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {t.views[view.id]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-3 sm:p-4">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
                  <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.85),rgba(2,6,23,0.92))]">
                    <div className="flex min-h-[460px] items-center justify-center p-3 sm:p-6">
                      <div className="relative origin-center transition-transform duration-300" style={{ transform: `scale(${previewZoom})` }}>
                        <img
                          src={activeMockupSrc}
                          alt={`${t.views[activeView.id]} T-shirt mockup`}
                          className={`block w-[300px] max-w-full object-contain transition duration-300 sm:w-[380px] lg:w-[460px] ${shirtTintClass}`}
                        />

                        {selectedArea.viewId === activeViewId ? (
                          <div
                            ref={printAreaRef}
                            className="absolute overflow-hidden rounded-2xl border border-cyan-300/70 bg-cyan-300/10 shadow-[0_0_0_1px_rgba(34,211,238,0.16)] backdrop-blur-[1px]"
                            style={{
                              left: `${selectedArea.overlay.leftPct * 100}%`,
                              top: `${selectedArea.overlay.topPct * 100}%`,
                              width: `${selectedArea.overlay.widthPct * 100}%`,
                              height: `${selectedArea.overlay.heightPct * 100}%`,
                              transform: selectedArea.overlay.rotationDeg
                                ? `rotate(${selectedArea.overlay.rotationDeg}deg)`
                                : undefined,
                            }}
                          >
                            <div className="absolute inset-0" style={gridStyle} />
                            <div className="absolute left-2 top-2 rounded-full bg-slate-950/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
                              {t.oneInchGrid}
                            </div>
                            <div className="absolute right-2 top-2 rounded-full bg-slate-950/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                              {selectedArea.physicalSize.widthIn} x {selectedArea.physicalSize.heightIn} in
                            </div>

                            {artwork.src ? (
                              <div
                                data-artwork-box="true"
                                onPointerDown={startMove}
                                className="absolute cursor-move touch-none rounded-lg border border-white/80 shadow-[0_10px_25px_rgba(15,23,42,0.3)]"
                                style={{
                                  left: `${artwork.leftPct * 100}%`,
                                  top: `${artwork.topPct * 100}%`,
                                  width: `${artwork.widthPct * 100}%`,
                                  aspectRatio: `${artwork.aspectRatio}`,
                                  transform: `rotate(${normalizedRotation}deg)`,
                                  transformOrigin: 'center',
                                  backgroundImage: `url(${artwork.src})`,
                                  backgroundPosition: 'center',
                                  backgroundSize: 'contain',
                                  backgroundRepeat: 'no-repeat',
                                }}
                              >
                                <div className="absolute inset-x-2 -bottom-9 rounded-xl bg-slate-950/90 px-2 py-1 text-center text-[10px] font-semibold text-cyan-200 shadow-lg">
                                  {t.dimensionsBadge}: {formatDimension(artworkWidthInches)} × {formatDimension(artworkHeightInches)}
                                </div>
                                <button
                                  type="button"
                                  onPointerDown={startRotate}
                                  className="absolute left-1/2 top-0 h-7 w-7 -translate-x-1/2 -translate-y-9 rounded-full border border-white/60 bg-slate-950/90 text-xs font-bold text-cyan-200 shadow-lg"
                                  aria-label="Rotate artwork"
                                >
                                  ↻
                                </button>
                                <button
                                  type="button"
                                  onPointerDown={startResize}
                                  className="absolute bottom-0 right-0 h-7 w-7 translate-x-1/2 translate-y-1/2 rounded-full border border-white/60 bg-cyan-300 text-xs font-bold text-slate-950 shadow-lg"
                                  aria-label="Resize artwork"
                                >
                                  ↘
                                </button>
                              </div>
                            ) : (
                              <div className="absolute inset-3 grid place-items-center rounded-xl border border-dashed border-white/40 bg-white/5 px-4 text-center text-xs font-medium uppercase tracking-[0.2em] text-slate-300">
                                {t.uploadToPlace}
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <aside className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <h3 className="text-base font-semibold text-white">{t.activePrintArea}</h3>
                    <div className="mt-4 space-y-3 text-sm text-slate-300">
                      <InfoCard label={t.view} value={t.views[printAreaView.id]} />
                      <InfoCard label={t.printableZone} value={t.areas[printAreaId].label} description={t.areas[printAreaId].description} />
                      <InfoCard label={t.areaDimensions} value={selectedArea.sizeLabel} description={`${selectedArea.physicalSize.widthIn} x ${selectedArea.physicalSize.heightIn} ${t.oneInchGrid.toLowerCase()}`} />
                      <InfoCard label={t.artworkSize} value={`${formatDimension(artworkWidthInches)} × ${formatDimension(artworkHeightInches)}`} description={`${quote.printSquareInches.toFixed(1)} sq.in`} />
                    </div>
                  </aside>
                </div>
              </div>
            </section>

            <aside className="order-3 hidden rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-2xl shadow-slate-950/30 xl:block">
              <QuoteSummary
                t={t}
                locale={locale}
                garmentColor={garmentColor}
                garmentStyle={garmentStyle}
                quote={quote}
                quantity={quantity}
                printAreaLabel={t.areas[printAreaId].label}
                artworkHeightInches={artworkHeightInches}
                artworkWidthInches={artworkWidthInches}
              />
            </aside>
          </main>
        ) : (
          <main className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
            <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-2xl shadow-slate-950/30 sm:p-6">
              <div className="max-w-3xl">
                <h2 className="text-2xl font-semibold text-white">{t.adminTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {t.adminHint}{' '}
                  <code className="rounded bg-white/10 px-2 py-1 text-cyan-200">{pricingStorageKey}</code>
                </p>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <AdminNumberField label={t.fields.shortSleeveCost} value={pricingDraft.shortSleeveGarmentCost} onChange={(value) => handlePricingInput('shortSleeveGarmentCost', value)} />
                <AdminNumberField label={t.fields.longSleeveCost} value={pricingDraft.longSleeveGarmentCost} onChange={(value) => handlePricingInput('longSleeveGarmentCost', value)} />
                <AdminNumberField label={t.fields.marginPercent} value={pricingDraft.marginPercent} onChange={(value) => handlePricingInput('marginPercent', value)} />
                <AdminNumberField label={t.fields.minimumPrintCharge} value={pricingDraft.minimumPrintCharge} onChange={(value) => handlePricingInput('minimumPrintCharge', value)} />
                <AdminNumberField label={t.fields.whiteSurcharge} value={pricingDraft.whiteSurcharge} onChange={(value) => handlePricingInput('whiteSurcharge', value)} />
                <AdminNumberField label={t.fields.blackSurcharge} value={pricingDraft.blackSurcharge} onChange={(value) => handlePricingInput('blackSurcharge', value)} />
                <AdminNumberField label={t.fields.frontRate} value={pricingDraft.frontRate} onChange={(value) => handlePricingInput('frontRate', value)} />
                <AdminNumberField label={t.fields.backRate} value={pricingDraft.backRate} onChange={(value) => handlePricingInput('backRate', value)} />
                <AdminNumberField label={t.fields.sleeveRate} value={pricingDraft.sleeveRate} onChange={(value) => handlePricingInput('sleeveRate', value)} />
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={savePricing} className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-300">{t.savePricing}</button>
                <button type="button" onClick={resetPricing} className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">{t.resetDefaults}</button>
                {pricingSaved ? <span className="self-center text-sm text-emerald-300">{t.pricingSaved}</span> : null}
              </div>
            </section>

            <aside className="rounded-[28px] border border-white/10 bg-slate-900/70 p-4 shadow-2xl shadow-slate-950/30 sm:p-6">
              <h3 className="text-lg font-semibold text-white">{t.pricingSnapshot}</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <PricingRow label={t.fields.shortSleeveCost} value={formatCurrency(pricingConfig.shortSleeveGarmentCost, locale)} />
                <PricingRow label={t.fields.longSleeveCost} value={formatCurrency(pricingConfig.longSleeveGarmentCost, locale)} />
                <PricingRow label={t.fields.minimumPrintCharge} value={formatCurrency(pricingConfig.minimumPrintCharge, locale)} />
                <PricingRow label={t.fields.frontRate} value={`${formatCurrency(pricingConfig.frontRate, locale)} / sq.in`} />
                <PricingRow label={t.fields.backRate} value={`${formatCurrency(pricingConfig.backRate, locale)} / sq.in`} />
                <PricingRow label={t.fields.sleeveRate} value={`${formatCurrency(pricingConfig.sleeveRate, locale)} / sq.in`} />
                <PricingRow label={t.fields.marginPercent} value={`${pricingConfig.marginPercent}%`} />
              </div>
            </aside>
          </main>
        )}

        {page === 'calculator' ? (
          <div className="fixed inset-x-3 bottom-3 z-50 rounded-[24px] border border-cyan-300/20 bg-slate-950/95 p-4 shadow-[0_20px_60px_rgba(2,6,23,0.6)] backdrop-blur xl:hidden">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">{t.liveQuote}</p>
                <p className="mt-1 text-lg font-semibold text-white">{formatCurrency(quote.total, locale)}</p>
                <p className="text-sm text-slate-400">{quantity} pcs · {t.areas[printAreaId].label}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t.perShirt}</p>
                <p className="mt-1 text-base font-semibold text-white">{formatCurrency(quote.finalUnitPrice, locale)}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function ControlCard({
  title,
  rightLabel,
  action,
  children,
}: {
  title: string
  rightLabel?: string
  action?: { label: string; onClick: () => void }
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-slate-900/70 p-4 shadow-2xl shadow-slate-950/30">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {action ? (
          <button type="button" onClick={action.onClick} className="text-sm font-medium text-rose-300 transition hover:text-rose-200">{action.label}</button>
        ) : rightLabel ? (
          <span className="text-sm font-semibold text-cyan-200">{rightLabel}</span>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function FieldLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <label className={`mb-2 block text-sm font-medium text-slate-300 ${className}`}>{children}</label>
}

function SelectCard({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-left transition ${
        active ? 'border-cyan-300 bg-cyan-300/15 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white'
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}

function RangeField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-cyan-400" />
    </label>
  )
}

function InfoCard({ label, value, description }: { label: string; value: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-base font-semibold text-white">{value}</p>
      {description ? <p className="mt-1 text-slate-400">{description}</p> : null}
    </div>
  )
}

function QuoteSummary({
  t,
  locale,
  quote,
  garmentColor,
  garmentStyle,
  quantity,
  printAreaLabel,
  artworkWidthInches,
  artworkHeightInches,
}: {
  t: Translation
  locale: string
  quote: ReturnType<typeof calculateQuote>
  garmentColor: GarmentColorId
  garmentStyle: GarmentStyleId
  quantity: number
  printAreaLabel: string
  artworkWidthInches: number
  artworkHeightInches: number
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white">{t.quoteSummary}</h2>
      <p className="mt-2 text-sm text-slate-300">{t.quoteHint}</p>
      <div className="mt-6 rounded-[28px] border border-cyan-300/20 bg-cyan-400/10 p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">{t.grandTotal}</p>
        <p className="mt-2 text-3xl font-semibold text-white">{formatCurrency(quote.total, locale)}</p>
        <p className="mt-2 text-sm text-cyan-50/80">{quantity} pcs at {formatCurrency(quote.finalUnitPrice, locale)} each</p>
      </div>
      <div className="mt-5 space-y-3">
        <SummaryCard title={t.printSpec} rows={[
          { label: t.location, value: printAreaLabel },
          { label: t.artworkSize, value: `${formatDimension(artworkWidthInches)} × ${formatDimension(artworkHeightInches)}` },
          { label: t.coverage, value: `${quote.printSquareInches.toFixed(1)} sq.in` },
        ]} />
        <SummaryCard title={t.garment} rows={[
          { label: t.color, value: t.colors[garmentColor] },
          { label: t.style, value: t.styles[garmentStyle] },
          { label: t.blankCost, value: formatCurrency(quote.blankGarmentCost, locale) },
          { label: t.colorSurcharge, value: formatCurrency(quote.colorSurcharge, locale) },
        ]} />
        <SummaryCard title={t.priceBreakdown} rows={[
          { label: t.printCharge, value: formatCurrency(quote.printCharge, locale) },
          { label: t.baseSubtotal, value: formatCurrency(quote.subtotalBeforeMargin, locale) },
          { label: t.marginIncluded, value: `${quote.marginPercent}%` },
        ]} />
      </div>
    </div>
  )
}

function SummaryCard({ title, rows }: { title: string; rows: { label: string; value: string }[] }) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{title}</h3>
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-4">
            <span className="text-sm text-slate-400">{row.label}</span>
            <span className="text-right text-sm font-medium text-white">{row.value}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function PricingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <span>{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  )
}

function AdminNumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="rounded-[24px] border border-white/10 bg-white/5 p-4">
      <span className="mb-3 block text-sm font-medium text-slate-300">{label}</span>
      <input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none ring-0 transition placeholder:text-slate-500 focus:border-cyan-300" />
    </label>
  )
}

export default App
