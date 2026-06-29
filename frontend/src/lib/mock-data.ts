export interface Province {
  id: string
  code: string
  name: string
  nameAr: string
  nameFr: string
  capital: string
  population: number
  areaKm2: number
  density: number
  governor: string
  latitude: number
  longitude: number
  compositeScore: number
  scores: Record<string, number>
  indicators: Record<string, number>
  trends: Record<string, 'improving' | 'stable' | 'declining' | 'critical'>
}

export interface Alert {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  description: string
  titleKey?: string
  descriptionKey?: string
  provinceCode: string
  timestamp: string
  read: boolean
}

export interface Decision {
  id: string
  title: string
  summary: string
  titleKey?: string
  summaryKey?: string
  targetProvince: string
  sector: string
  sectorKey?: string
  priorityScore: number
  confidence: number
  status: 'pending' | 'accepted' | 'rejected' | 'implemented'
  evidence: string[]
  evidenceKeys?: string[]
  createdAt: string
}

export interface Insight {
  id: string
  title: string
  description: string
  titleKey?: string
  descriptionKey?: string
  type: 'trend' | 'risk' | 'opportunity' | 'anomaly'
  provinceCode: string
}

const provinceNames: [string, string, string, string, string, number, number, number, number][] = [
  ['DZ-01', 'Adrar', 'أدرار', 'Adrar', 'Adrar', 399714, 427968, 0.9, 27.8],
  ['DZ-02', 'Chlef', 'الشلف', 'Chlef', 'Chlef', 1002088, 4975, 201.4, 36.2],
  ['DZ-03', 'Laghouat', 'الأغواط', 'Laghouat', 'Laghouat', 455602, 25057, 18.2, 33.9],
  ['DZ-04', 'Oum El Bouaghi', 'أم البواقي', 'Oum El Bouaghi', 'Oum El Bouaghi', 644364, 6763, 95.3, 35.6],
  ['DZ-05', 'Batna', 'باتنة', 'Batna', 'Batna', 1119791, 12192, 91.8, 35.6],
  ['DZ-06', 'Béjaïa', 'بجاية', 'Béjaïa', 'Béjaïa', 912577, 3223, 283.2, 36.8],
  ['DZ-07', 'Biskra', 'بسكرة', 'Biskra', 'Biskra', 721356, 21671, 33.3, 34.9],
  ['DZ-08', 'Béchar', 'بشار', 'Béchar', 'Béchar', 270061, 161400, 1.7, 31.6],
  ['DZ-09', 'Blida', 'البليدة', 'Blida', 'Blida', 1002928, 1481, 677.2, 36.5],
  ['DZ-10', 'Bouira', 'البويرة', 'Bouira', 'Bouira', 694750, 4463, 155.7, 36.4],
  ['DZ-11', 'Tamanrasset', 'تمنراست', 'Tamanrasset', 'Tamanrasset', 176637, 557906, 0.3, 22.8],
  ['DZ-12', 'Tébessa', 'تبسة', 'Tébessa', 'Tébessa', 648703, 14227, 45.6, 35.4],
  ['DZ-13', 'Tlemcen', 'تلمسان', 'Tlemcen', 'Tlemcen', 949135, 9061, 104.7, 34.9],
  ['DZ-14', 'Tiaret', 'تيارت', 'Tiaret', 'Tiaret', 842060, 20673, 40.7, 35.4],
  ['DZ-15', 'Tizi Ouzou', 'تيزي وزو', 'Tizi Ouzou', 'Tizi Ouzou', 1120492, 3568, 314.1, 36.8],
  ['DZ-16', 'Algiers', 'الجزائر العاصمة', 'Alger', 'Algiers', 2988145, 1190, 2511.0, 36.8],
  ['DZ-17', 'Djelfa', 'الجلفة', 'Djelfa', 'Djelfa', 1092970, 29005, 37.7, 34.7],
  ['DZ-18', 'Jijel', 'جيجل', 'Jijel', 'Jijel', 636948, 2577, 247.2, 36.8],
  ['DZ-19', 'Sétif', 'سطيف', 'Sétif', 'Sétif', 1489979, 6504, 229.1, 36.2],
  ['DZ-20', 'Saïda', 'سعيدة', 'Saïda', 'Saïda', 330641, 6864, 48.2, 34.8],
  ['DZ-21', 'Skikda', 'سكيكدة', 'Skikda', 'Skikda', 904195, 4026, 224.6, 36.9],
  ['DZ-22', 'Sidi Bel Abbès', 'سيدي بلعباس', 'Sidi Bel Abbès', 'Sidi Bel Abbès', 604744, 9150, 66.1, 35.2],
  ['DZ-23', 'Annaba', 'عنابة', 'Annaba', 'Annaba', 609499, 1439, 423.6, 36.9],
  ['DZ-24', 'Guelma', 'قالمة', 'Guelma', 'Guelma', 482261, 4101, 117.6, 36.5],
  ['DZ-25', 'Constantine', 'قسنطينة', 'Constantine', 'Constantine', 938475, 2187, 429.1, 36.4],
  ['DZ-26', 'Médéa', 'المدية', 'Médéa', 'Médéa', 830943, 8866, 93.7, 36.3],
  ['DZ-27', 'Mostaganem', 'مستغانم', 'Mostaganem', 'Mostaganem', 746947, 2269, 329.2, 35.9],
  ['DZ-28', 'Msila', 'المسيلة', 'Msila', 'Msila', 990591, 18718, 52.9, 35.7],
  ['DZ-29', 'Mascara', 'معسكر', 'Mascara', 'Mascara', 784073, 5941, 132.0, 35.4],
  ['DZ-30', 'Ouargla', 'ورقلة', 'Ouargla', 'Ouargla', 552539, 211980, 2.6, 31.9],
  ['DZ-31', 'Oran', 'وهران', 'Oran', 'Oran', 1454566, 2114, 688.1, 35.7],
  ['DZ-32', 'El Bayadh', 'البيض', 'El Bayadh', 'El Bayadh', 228624, 78870, 2.9, 33.7],
  ['DZ-33', 'Illizi', 'إليزي', 'Illizi', 'Illizi', 52952, 285000, 0.2, 26.5],
  ['DZ-34', 'Bordj Bou Arréridj', 'برج بوعريريج', 'Bordj Bou Arréridj', 'Bordj Bou Arréridj', 661155, 4115, 160.7, 36.1],
  ['DZ-35', 'Boumerdès', 'بومرداس', 'Boumerdès', 'Boumerdès', 786911, 1483, 530.7, 36.8],
  ['DZ-36', 'El Tarf', 'الطارف', 'El Tarf', 'El Tarf', 408414, 3339, 122.3, 36.8],
  ['DZ-37', 'Tindouf', 'تندوف', 'Tindouf', 'Tindouf', 150000, 159000, 0.9, 27.7],
  ['DZ-38', 'Tissemsilt', 'تيسمسيلت', 'Tissemsilt', 'Tissemsilt', 294476, 3152, 93.4, 35.6],
  ['DZ-39', 'El Oued', 'الوادي', 'El Oued', 'El Oued', 673934, 54543, 12.4, 33.4],
  ['DZ-40', 'Khenchela', 'خنشلة', 'Khenchela', 'Khenchela', 384268, 9811, 39.2, 35.4],
  ['DZ-41', 'Souk Ahras', 'سوق أهراس', 'Souk Ahras', 'Souk Ahras', 440299, 4360, 101.0, 36.3],
  ['DZ-42', 'Tipaza', 'تيبازة', 'Tipaza', 'Tipaza', 591010, 1700, 347.7, 36.6],
  ['DZ-43', 'Mila', 'ميلة', 'Mila', 'Mila', 766886, 3433, 223.4, 36.4],
  ['DZ-44', 'Aïn Defla', 'عين الدفلى', 'Aïn Defla', 'Aïn Defla', 766013, 4897, 156.4, 36.3],
  ['DZ-45', 'Naâma', 'النعامة', 'Naâma', 'Naâma', 192385, 29950, 6.4, 33.3],
  ['DZ-46', 'Aïn Témouchent', 'عين تموشنت', 'Aïn Témouchent', 'Aïn Témouchent', 371239, 2376, 156.2, 35.3],
  ['DZ-47', 'Ghardaïa', 'غرداية', 'Ghardaïa', 'Ghardaïa', 363598, 86105, 4.2, 32.5],
  ['DZ-48', 'Relizane', 'غليزان', 'Relizane', 'Relizane', 727845, 4870, 149.5, 35.7],
  ['DZ-49', 'El M\'Ghair', 'المغير', 'El M\'Ghair', 'El M\'Ghair', 162000, 8717, 18.6, 33.9],
  ['DZ-50', 'El Menia', 'المنيعة', 'El Menia', 'El Menia', 72000, 62000, 1.2, 30.6],
  ['DZ-51', 'Ouled Djellal', 'أولاد جلال', 'Ouled Djellal', 'Ouled Djellal', 174000, 13000, 13.4, 34.4],
  ['DZ-52', 'Bordj Baji Mokhtar', 'برج باجي مختار', 'Bordj Baji Mokhtar', 'Bordj Baji Mokhtar', 22000, 122000, 0.2, 24.5],
  ['DZ-53', 'Béni Abbès', 'بني عباس', 'Béni Abbès', 'Béni Abbès', 66000, 109000, 0.6, 30.1],
  ['DZ-54', 'Timimoun', 'تيميمون', 'Timimoun', 'Timimoun', 98000, 69000, 1.4, 29.2],
  ['DZ-55', 'Touggourt', 'تقرت', 'Touggourt', 'Touggourt', 247000, 18500, 13.4, 33.1],
  ['DZ-56', 'Djanet', 'جانت', 'Djanet', 'Djanet', 25000, 113000, 0.2, 24.6],
  ['DZ-57', 'In Salah', 'عين صالح', 'In Salah', 'In Salah', 58000, 132000, 0.4, 27.2],
  ['DZ-58', 'In Guezzam', 'إن قزام', 'In Guezzam', 'In Guezzam', 12000, 95000, 0.1, 22.8],
]

const dimensionKeys = [
  'health',
  'education',
  'economy',
  'employment',
  'investment',
  'infrastructure',
  'security',
  'environment',
  'transportation',
  'water',
  'agriculture',
  'tourism',
] as const

export type DimensionKey = (typeof dimensionKeys)[number]

const dimensionLabels: Record<DimensionKey, string> = {
  health: 'الصحة',
  education: 'التعليم',
  economy: 'الاقتصاد',
  employment: 'التوظيف',
  investment: 'الاستثمار',
  infrastructure: 'البنية التحتية',
  security: 'الأمن',
  environment: 'البيئة',
  transportation: 'النقل',
  water: 'المياه',
  agriculture: 'الزراعة',
  tourism: 'السياحة',
}

const dimensionIcons: Record<DimensionKey, string> = {
  health: 'Heart',
  education: 'Book',
  economy: 'TrendingUp',
  employment: 'Briefcase',
  investment: 'Banknote',
  infrastructure: 'Building2',
  security: 'Shield',
  environment: 'Leaf',
  transportation: 'Truck',
  water: 'Droplets',
  agriculture: 'Wheat',
  tourism: 'Compass',
}

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function generateProvinceData(): Province[] {
  return provinceNames.map(([code, name, nameAr, nameFr, capital, population, areaKm2, density, lat], index) => {
    const rand = seededRandom(index + 1)
    const scores: Record<string, number> = {}
    for (const key of dimensionKeys) {
      const base = 40 + rand() * 55
      const variation = (rand() - 0.5) * 15
      scores[key] = Math.round(Math.min(100, Math.max(5, base + variation)))
    }

    const compositeScore = Math.round(
      Object.values(scores).reduce((a, b) => a + b, 0) / dimensionKeys.length
    )

    const indicators: Record<string, number> = {
      populationGrowth: 0.5 + rand() * 3,
      unemploymentRate: 5 + rand() * 25,
      literacyRate: 55 + rand() * 45,
      povertyRate: 5 + rand() * 30,
      internetAccess: 30 + rand() * 70,
      cleanWaterAccess: 50 + rand() * 50,
      lifeExpectancy: 65 + rand() * 15,
      hospitalBedsPer1000: 0.5 + rand() * 3.5,
      doctorsPer1000: 0.3 + rand() * 2.2,
    }

    const trendOptions: ('improving' | 'stable' | 'declining' | 'critical')[] = [
      'improving', 'stable', 'declining', 'critical',
    ]
    const trends: Record<string, 'improving' | 'stable' | 'declining' | 'critical'> = {}
    for (const key of dimensionKeys) {
      trends[key] = trendOptions[Math.floor(rand() * 4)]
    }

    return {
      id: `prov-${code.toLowerCase().replace('-', '')}`,
      code,
      name,
      nameAr,
      nameFr,
      capital: typeof capital === 'string' ? capital : name,
      population,
      areaKm2,
      density: Math.round(density * 10) / 10,
      governor: 'والٍِ ' + name,
      latitude: lat,
      longitude: 1 + (index % 58) * 0.5,
      compositeScore,
      scores,
      indicators,
      trends,
    }
  })
}

export const provinces: Province[] = generateProvinceData()

export function getProvinceByCode(code: string): Province | undefined {
  return provinces.find((p) => p.code === code)
}

export const alerts: Alert[] = [
  {
    id: 'alert-001',
    type: 'critical',
    title: 'أزمة الطاقة الاستيعابية للرعاية الصحية',
    description: 'تمنراست: نسبة إشغال العناية المركزة 98%. نقص حاد في أجهزة التنفس.',
    titleKey: 'alerts.healthcareCrisis',
    descriptionKey: 'alerts.healthcareCrisisDesc',
    provinceCode: 'DZ-11',
    timestamp: '2026-06-28T14:30:00Z',
    read: false,
  },
  {
    id: 'alert-002',
    type: 'warning',
    title: 'تدهور البنية التحتية',
    description: 'مؤشر جودة الطرق في تيزي وزو انخفض بنسبة 12% هذا الربع.',
    titleKey: 'alerts.infrastructureDegradation',
    descriptionKey: 'alerts.infrastructureDegradationDesc',
    provinceCode: 'DZ-15',
    timestamp: '2026-06-28T09:15:00Z',
    read: false,
  },
  {
    id: 'alert-003',
    type: 'warning',
    title: 'خطر إمدادات المياه',
    description: 'مستويات السدود في تيارت عند 34% من السعة — أدنى مستوى في 5 سنوات.',
    titleKey: 'alerts.waterSupplyRisk',
    descriptionKey: 'alerts.waterSupplyRiskDesc',
    provinceCode: 'DZ-14',
    timestamp: '2026-06-27T16:45:00Z',
    read: true,
  },
  {
    id: 'alert-004',
    type: 'info',
    title: 'طفرة استثمارية',
    description: 'ولاية وهران تسجل زيادة بنسبة 40% في الاستثمار الأجنبي المباشر هذا الربع.',
    titleKey: 'alerts.investmentSurge',
    descriptionKey: 'alerts.investmentSurgeDesc',
    provinceCode: 'DZ-31',
    timestamp: '2026-06-27T11:00:00Z',
    read: true,
  },
  {
    id: 'alert-005',
    type: 'critical',
    title: 'ارتفاع حاد في البطالة',
    description: 'بطالة الشباب في سكيكدة بلغت 42%.',
    titleKey: 'alerts.unemploymentSpike',
    descriptionKey: 'alerts.unemploymentSpikeDesc',
    provinceCode: 'DZ-21',
    timestamp: '2026-06-26T08:20:00Z',
    read: false,
  },
]

export const insights: Insight[] = [
  {
    id: 'ins-001',
    title: 'الولايات الساحلية تقود النمو الاقتصادي',
    description: 'الجزائر العاصمة ووهران وعنابة تُظهر نمواً في الناتج المحلي الإجمالي أسرع بـ 2.3 مرة.',
    titleKey: 'insights.coastalGrowth',
    descriptionKey: 'insights.coastalGrowthDesc',
    type: 'trend',
    provinceCode: 'DZ-16',
  },
  {
    id: 'ins-002',
    title: 'الولايات الجنوبية بحاجة للبنية التحتية',
    description: 'تمنراست وإليزي وجانت لديها نتائج بنية تحتية أقل بنسبة 60%.',
    titleKey: 'insights.southInfrastructure',
    descriptionKey: 'insights.southInfrastructureDesc',
    type: 'risk',
    provinceCode: 'DZ-11',
  },
  {
    id: 'ins-003',
    title: 'تحسن التعليم يتسارع',
    description: 'سطيف وتيزي وزو تُظهران أسرع تحسن في معدل الإلمام بالقراءة والكتابة.',
    titleKey: 'insights.educationImprovement',
    descriptionKey: 'insights.educationImprovementDesc',
    type: 'opportunity',
    provinceCode: 'DZ-19',
  },
  {
    id: 'ins-004',
    title: 'ندرة المياه تتفاقم',
    description: '6 ولايات في منطقة الهضاب العليا تُظهر مستويات إجهاد مائي حرجة.',
    titleKey: 'insights.waterScarcity',
    descriptionKey: 'insights.waterScarcityDesc',
    type: 'risk',
    provinceCode: 'DZ-14',
  },
]

export const decisions: Decision[] = [
  {
    id: 'dec-001',
    title: 'زيادة ميزانية الصحة في تمنراست',
    summary: 'الولاية لديها 0.8 سرير لكل 1,000 نسمة مقابل 2.1 كمتوسط وطني. عدد السكان ينمو بنسبة 3.2% سنوياً.',
    titleKey: 'decisions.increaseHealthBudget',
    summaryKey: 'decisions.increaseHealthBudgetSummary',
    targetProvince: 'DZ-11',
    sector: 'الصحة',
    sectorKey: 'decisions.sector.health',
    priorityScore: 87,
    confidence: 0.84,
    status: 'pending',
    evidence: [
      'وزارة الصحة — التقرير السنوي 2025',
      'بيانات الإحصاء الوطني 2025',
      'مؤشر الوصول للرعاية الصحية - منظمة الصحة العالمية',
    ],
    evidenceKeys: ['decisions.evidence.healthMinistry', 'decisions.evidence.onsData', 'decisions.evidence.whoIndex'],
    createdAt: '2026-06-28T10:00:00Z',
  },
  {
    id: 'dec-002',
    title: 'استثمار في البنية التحتية للطرق في إليزي',
    summary: '12% فقط من الطرق معبدة. 3 قرى غير قابلة للوصول خلال موسم الأمطار.',
    titleKey: 'decisions.roadInfrastructure',
    summaryKey: 'decisions.roadInfrastructureSummary',
    targetProvince: 'DZ-33',
    sector: 'البنية التحتية',
    sectorKey: 'decisions.sector.infrastructure',
    priorityScore: 82,
    confidence: 0.79,
    status: 'pending',
    evidence: [
      'سجل الطرق - وزارة الأشغال العمومية',
      'تحليل صور الأقمار الصناعية (الوكالة الفضائية الجزائرية)',
    ],
    evidenceKeys: ['decisions.evidence.publicWorks', 'decisions.evidence.satelliteImagery'],
    createdAt: '2026-06-27T14:30:00Z',
  },
  {
    id: 'dec-003',
    title: 'برنامج التكوين المهني في سكيكدة',
    summary: 'بطالة الشباب عند 42%. توجد 3 مدارس تكوين مهني لسكان 900 ألف نسمة.',
    titleKey: 'decisions.vocationalTraining',
    summaryKey: 'decisions.vocationalTrainingSummary',
    targetProvince: 'DZ-21',
    sector: 'التوظيف',
    sectorKey: 'decisions.sector.employment',
    priorityScore: 78,
    confidence: 0.72,
    status: 'accepted',
    evidence: [
      'وزارة العمل — مسح التوظيف 2025',
      'وزارة التربية الوطنية — إحصاء المدارس',
    ],
    evidenceKeys: ['decisions.evidence.laborSurvey', 'decisions.evidence.schoolCensus'],
    createdAt: '2026-06-25T09:00:00Z',
  },
  {
    id: 'dec-004',
    title: 'تطوير البنية التحتية للمياه في تيارت',
    summary: 'مستويات السدود عند 34% من السعة. شبكة توزيع المياه تفقد 40% بسبب التسربات.',
    titleKey: 'decisions.waterInfrastructure',
    summaryKey: 'decisions.waterInfrastructureSummary',
    targetProvince: 'DZ-14',
    sector: 'المياه',
    sectorKey: 'decisions.sector.water',
    priorityScore: 91,
    confidence: 0.88,
    status: 'pending',
    evidence: [
      'الوكالة الوطنية للموارد المائية — بيانات تشغيل السدود',
      'وزارة الموارد المائية — تدقيق شبكة التوزيع',
    ],
    evidenceKeys: ['decisions.evidence.waterAgency', 'decisions.evidence.distributionAudit'],
    createdAt: '2026-06-26T11:15:00Z',
  },
  {
    id: 'dec-005',
    title: 'توسعة الطاقة الاستيعابية للجامعة في ورقلة',
    summary: 'ارتفع الالتحاق بالجامعة بنسبة 45% في عامين. المرافق الحالية تعمل بنسبة 140% من الطاقة.',
    titleKey: 'decisions.expandUniversity',
    summaryKey: 'decisions.expandUniversitySummary',
    targetProvince: 'DZ-30',
    sector: 'التعليم',
    sectorKey: 'decisions.sector.education',
    priorityScore: 74,
    confidence: 0.69,
    status: 'implemented',
    evidence: [
      'وزارة التعليم العالي — بيانات الالتحاق',
      'تقييم البنية التحتية للجامعة',
    ],
    evidenceKeys: ['decisions.evidence.higherEdEnrollment', 'decisions.evidence.universityInfrastructure'],
    createdAt: '2026-06-20T08:00:00Z',
  },
]

export function getDimensionLabel(key: string): string {
  return dimensionLabels[key as DimensionKey] || key
}

export { dimensionKeys, dimensionLabels, dimensionIcons }
