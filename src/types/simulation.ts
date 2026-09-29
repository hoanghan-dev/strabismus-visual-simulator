/**
 * Clinical Strabismus & Binocular Vision Simulation Specifications
 * Grounded in American Academy of Ophthalmology (AAO) BCSC Pediatric Ophthalmology & Strabismus,
 * von Noorden & Campos Binocular Vision, and EyeWiki.
 */

export type TabCategory = 'stages' | 'directions' | 'orthoptics';

export type ConditionId =
  // 6 Primary Clinical Progression Stages
  | 'normal'
  | 'early_strabismus'
  | 'clear_strabismus'
  | 'diplopia'
  | 'suppression'
  | 'amblyopia'
  // Clinical Deviation Types
  | 'esotropia'
  | 'exotropia'
  | 'hypertropia'
  | 'hypotropia'
  | 'alternating'
  // Orthoptic Tests
  | 'cover_test'
  | 'worth_4_dot'
  | 'hirschberg';

export type StrabismusDirection = 'esotropia' | 'exotropia' | 'hypertropia' | 'hypotropia';
export type DeviatingEye = 'right' | 'left' | 'alternating';
export type ImageSource = 'camera' | 'sample_scene';
export type CoverState = 'none' | 'cover_left' | 'cover_right' | 'alternate_cover';
export type EyeOcclusionMode = 'both' | 'left_covered' | 'right_covered';
export type BrainResponseMode = 'diplopia' | 'suppression';

export interface SimulationParameters {
  condition: ConditionId;
  tab: TabCategory;
  // Core optical & disparity variables
  deviation: number;          // 0 - 100% (angular deviation)
  diplopiaOffset: number;     // 0 - 100% (actual perceived separation)
  suppression: number;        // 0 - 100% (cortical inhibition level)
  fusion: number;             // 0 - 100% (motor & sensory fusional reserve)
  direction: StrabismusDirection;
  deviatingEye: DeviatingEye;
  // First-person Binocular Vision & Brain Response Layer
  eyeOcclusionMode: EyeOcclusionMode;
  brainResponseMode?: BrainResponseMode;
  // Visual Confusion (Nhầm lẫn thị giác theo nghiên cứu)
  visualConfusionEnabled: boolean;
  // Scientific Orthoptic Aids & Tests
  showCrowdingTest: boolean;          // Hiện tượng đám đông / chen chúc (Crowding Phenomenon)
  showSuppressionScotoma: boolean;    // Ám điểm ức chế cục bộ GABAergic V1
  // Cover test & orthoptic aids
  coverState: CoverState;
  redCyanDisparityAid: boolean;
  showHirschbergOverlay: boolean;
  showFaceBox: boolean;
  mirrored: boolean;
  // Audio voiceover
  audioVoiceoverEnabled: boolean;
  // Distance
  simulatedDistanceCm: number;// 12 - 48 cm
  autoDistance: boolean;      // Auto tracked by webcam face detector
  imageSource: ImageSource;
  // Optical degradation (for amblyopia)
  blurAmount: number;
}

export interface ConditionInfo {
  id: ConditionId;
  category: TabCategory;
  name: string;
  stageNumber?: string;
  badge?: string;
  medicalTitle: string;
  medicalDescription: string;
  clinicalNote: string;
  pathophysiology: string;
  defaultParams: Partial<SimulationParameters>;
}

export const CONDITIONS_REGISTRY: Record<ConditionId, ConditionInfo> = {
  // ==================== STAGE 1: NORMAL BINOCULAR SINGLE VISION ====================
  normal: {
    id: 'normal',
    category: 'stages',
    stageNumber: '01',
    name: 'Chính thị (Bình thường)',
    badge: 'Chuẩn',
    medicalTitle: '01. Thị giác Hai mắt Bình thường (Normal Binocular Single Vision)',
    medicalDescription: 'Hai mắt cùng hướng chính xác về điểm định thị. Hình ảnh rơi vào các điểm võng mạc tương ứng (vòng Horopter và vùng dung hợp Panum), kích hoạt 3 cấp độ tuần tự theo Claud Worth: Cảm nhận đồng thời (Simultaneous perception) ➔ Hợp thị cảm giác (Sensory fusion) ➔ Thị giác lập thể (Stereopsis tinh tế < 60 giây cung).',
    clinicalNote: 'Không có hiện tượng song thị hoặc ức chế. Biên độ dung hợp vận nhãn (Motor Fusion) và dung hợp cảm giác (Sensory Fusion) đạt 100%. Nhận thức chiều sâu 3D sắc nét tuyệt đối.',
    pathophysiology: 'Các nơ-ron hai mắt tại vỏ thị giác sơ cấp V1 (diện Brodmann 17) tích hợp tín hiệu qua các cột ưu thế thị giác, trích xuất độ chênh lệch võng mạc ngang (horizontal retinal disparity).',
    defaultParams: {
      deviation: 0,
      diplopiaOffset: 0,
      suppression: 0,
      fusion: 100,
      blurAmount: 0,
      coverState: 'none',
      redCyanDisparityAid: false,
      visualConfusionEnabled: false,
      showCrowdingTest: false,
      showSuppressionScotoma: false,
    },
  },

  // ==================== STAGE 2: EARLY / INTERMITTENT (PHORIA / IXT) ====================
  early_strabismus: {
    id: 'early_strabismus',
    category: 'stages',
    stageNumber: '02',
    name: 'Lác ẩn / Luân phiên (Phoria / IXT)',
    badge: 'Dung hợp bù trừ',
    medicalTitle: '02. Lác ẩn & Lác ngoài Luân phiên (Heterophoria / Intermittent Exotropia - IXT)',
    medicalDescription: 'Trục thị giác có xu hướng trôi lệch, nhưng lực hợp thị vận nhãn (Fusional Vergence) bù trừ hoàn toàn giữ hai mắt thẳng hàng khi tỉnh táo và tập trung. Do đó, người bệnh HOÀN TOÀN KHÔNG BỊ NHÌN ĐÔI (Ảnh đơn 100%).',
    clinicalNote: 'Triệu chứng thực tế: Mỏi mắt (Asthenopia), căng tức cơ hốc mắt khi làm việc kéo dài. Trong lác ngoài luân phiên (IXT), bệnh nhân có phản xạ nheo một mắt ngoài nắng (bright light squinting) để tránh quá tải võng mạc phá vỡ hợp thị; khi mệt mỏi sẽ trôi sang pha lác hiện (Tropic phase). Thang điểm Newcastle (NCS ≥ 4) đánh giá nguy cơ mất kiểm soát.',
    pathophysiology: 'Quy luật Hering và Sherrington điều phối trương lực cơ vận nhãn bù trừ. Điểm phá vỡ hợp thị (Break point) xuất hiện khi dự trữ dung hợp suy kiệt.',
    defaultParams: {
      deviation: 20,
      diplopiaOffset: 0,       // QUAN TRỌNG: Lệch nhẹ KHÔNG CÓ song thị!
      suppression: 0,
      fusion: 85,
      blurAmount: 0,
      coverState: 'none',
      visualConfusionEnabled: false,
      showCrowdingTest: false,
      showSuppressionScotoma: false,
    },
  },

  // ==================== STAGE 3: CLEAR MISALIGNMENT (DECOMPENSATED) ====================
  clear_strabismus: {
    id: 'clear_strabismus',
    category: 'stages',
    stageNumber: '03',
    name: 'Lệch rõ / Chớm mất bù (Decompensated)',
    badge: 'Chớm mất bù',
    medicalTitle: '03. Lệch rõ / Chớm Mất Bù Hợp Thị (Decompensated Strabismus)',
    medicalDescription: 'Độ lệch nhãn cầu bắt đầu vượt quá biên độ dung sai của vùng dung hợp Panum (Decompensation). Vỏ não chưa kịp thích nghi và biên độ dung hợp vận nhãn suy giảm. Hình ảnh bắt đầu trượt tách nhẹ tạo viền bóng mờ (~10-14px, alpha ~32%), người xem cảm nhận sự mất ổn định thị giác trước khi chuyển sang song thị hoàn toàn.',
    clinicalNote: 'Hình ảnh khuôn mặt xuất hiện bóng mờ viền trượt nhẹ (~10-14px, độ mờ ~32%). Đây là giai đoạn chuyển tiếp quan trọng khi hệ cơ vận nhãn không còn giữ nổi ảnh đơn, chữ trên trang sách chớm xô lệch.',
    pathophysiology: 'Ảnh võng mạc trượt ra ngoài vùng Panum nhưng não vẫn còn phản xạ cố gắng dung hợp yếu ớt.',
    defaultParams: {
      deviation: 35,
      diplopiaOffset: 15,      // Chớm lệch viền mờ (~11px)
      suppression: 0,
      fusion: 40,
      blurAmount: 0,
      coverState: 'none',
      visualConfusionEnabled: false,
      showCrowdingTest: false,
      showSuppressionScotoma: false,
    },
  },

  // ==================== STAGE 4: DIPLOPIA & VISUAL CONFUSION ====================
  diplopia: {
    id: 'diplopia',
    category: 'stages',
    stageNumber: '04',
    name: 'Song thị & Nhầm lẫn thị giác',
    badge: 'Rối loạn cảm giác kép',
    medicalTitle: '04. Rối loạn Cảm giác Kép: Song thị & Nhầm lẫn Thị giác (Diplopia & Visual Confusion)',
    medicalDescription: 'Đặc trưng cốt lõi của lác mắc phải ở người lớn: Hai hiện tượng cảm giác tách biệt xuất hiện đồng thời! (1) Song thị (Diplopia): Một vật thể thành hai hình ở hai vị trí không gian (đồng chiều trong Lác trong, bắt chéo trong Lác ngoài). (2) Nhầm lẫn thị giác (Visual Confusion): Hai vật thể khác nhau bị hai fovea tiếp nhận và chiếu chồng đè lên cùng một tọa độ trung tâm.',
    clinicalNote: 'Gây suy giảm chất lượng cuộc sống chức năng nghiêm trọng (theo thang đo AS-20 và Diplopia Questionnaire): mất khả năng đọc sách liên tục, dễ bước hụt ngã cầu thang, mất định vị không gian, buộc phải nhắm hoặc bịt một mắt.',
    pathophysiology: 'Mỗi vùng võng mạc có hướng thị giác chủ quan cố định. Fovea luôn chiếu thẳng trước mặt. Khi 2 fovea nhìn 2 vật khác nhau, chúng bị đè lên nhau (Confusion); khi 1 vật rơi vào 1 fovea và 1 điểm ngoại vi, nó bị chiếu ra 2 nơi (Diplopia).',
    defaultParams: {
      deviation: 65,
      diplopiaOffset: 32,      // Chuẩn tỉ lệ lâm sàng thực tế (~24-28px)
      suppression: 0,
      fusion: 0,
      blurAmount: 0,
      coverState: 'none',
      visualConfusionEnabled: true,
      showCrowdingTest: false,
      showSuppressionScotoma: false,
    },
  },

  // ==================== STAGE 5: CORTICAL SUPPRESSION (GABAERGIC) ====================
  suppression: {
    id: 'suppression',
    category: 'stages',
    stageNumber: '05',
    name: 'Não thích nghi (Ức chế GABAergic)',
    badge: 'Triệt tiêu song thị',
    medicalTitle: '05. Thích nghi Vỏ não ở Trẻ em: Ức chế Cục bộ (Cortical Suppression)',
    medicalDescription: 'Ở trẻ nhỏ có lác khởi phát sớm (< 7-8 tuổi), tính mềm dẻo của vỏ não kích hoạt mạng nơ-ron trung gian giải phóng chất dẫn truyền GABA tại diện V1. Hình thành Ám điểm ức chế Fovea (triệt tiêu nhầm lẫn thị giác) và Ám điểm ức chế Ngoại vi (triệt tiêu song thị). Trẻ không còn thấy nhìn đôi.',
    clinicalNote: 'BẰNG CHỨNG Y KHOA KHẲNG ĐỊNH: Não KHÔNG làm tối đen hay tắt hoàn toàn một mắt! Trường nhìn ngoại vi và xử lý chuyển động hai mắt (Motion Processing tại diện MT/V5) vẫn hoạt động đạt 31.2% - 100%. Ngay khi che mắt lành, ức chế biến mất tức thì, mắt lệch định thị lại ngay.',
    pathophysiology: 'Các interneuron ức chế GABAergic ở vỏ não V1 ngăn chặn dòng tín hiệu thị giác từ mắt lệch truyền lên trung khu nhận thức thị giác cao cấp. Hậu quả: mất thị giác lập thể 3D tinh tế và nguy cơ nhược thị nếu lác một mắt kéo dài.',
    defaultParams: {
      deviation: 75,
      diplopiaOffset: 0,       // QUAN TRỌNG: Song thị biến mất vì não đã ức chế mắt lệch!
      suppression: 95,         // Mức ức chế cao
      fusion: 0,
      blurAmount: 0,
      coverState: 'none',
      visualConfusionEnabled: false,
      showCrowdingTest: false,
      showSuppressionScotoma: true,
    },
  },

  // ==================== STAGE 6: STRABISMIC AMBLYOPIA & CROWDING ====================
  amblyopia: {
    id: 'amblyopia',
    category: 'stages',
    stageNumber: '06',
    name: 'Nhược thị & Hiện tượng Chen chúc',
    badge: 'Tổn thương V1',
    medicalTitle: '06. Nhược thị Thần kinh do Lác (Amblyopia) & Hiện tượng Chen chúc (Crowding)',
    medicalDescription: 'Phát sinh khi lác một mắt liên tục kéo dài trong giai đoạn phát triển nhạy cảm (< 7-8 tuổi). Mờ nhòe không thể bù trừ hoàn toàn bằng kính do vùng não tiếp nhận V1 thoái hóa xi-náp, không phân giải được chi tiết; Giảm độ nhạy tương phản (nhạt màu, phẳng - flat); Hiện tượng chen chúc (Crowding Phenomenon): chữ đơn lẻ đọc được nhưng chữ trong hàng dài bị dính chùm, méo mó.',
    clinicalNote: 'LÁC VÀ NHƯỢC THỊ LÀ 2 THỰC THỂ TÁCH BIỆT: Lác luân phiên tự do bảo tồn thị lực 20/20 ở cả hai mắt (không nhược thị). Nhược thị chỉ xảy ra khi lác cố định 1 mắt. Khác biệt khi nhìn 1 mắt và 2 mắt: Mở 2 mắt thì não bù trừ bằng mắt lành (người bệnh sinh hoạt bình thường và không nhận biết); Che mắt lành thì mắt nhược thị bộc lộ mờ đục, nhạt màu và rung nhẹ định vị bất ổn định.',
    pathophysiology: 'Cạnh tranh xi-náp bất bình đẳng làm teo nhỏ tế bào thần kinh ở thể gối ngoài (LGN) và diện V1 phụ trách mắt lệch.',
    defaultParams: {
      deviation: 70,
      diplopiaOffset: 0,
      suppression: 98,
      fusion: 0,
      blurAmount: 4.5,
      coverState: 'none',
      visualConfusionEnabled: false,
      showCrowdingTest: true,
      showSuppressionScotoma: false,
    },
  },

  // ==================== DIRECTIONS TAB ====================
  esotropia: {
    id: 'esotropia',
    category: 'directions',
    name: 'Lác trong (Esotropia)',
    badge: 'Hội tụ',
    medicalTitle: 'Lác trong (Esotropia / Convergent Strabismus)',
    medicalDescription: 'Mắt lệch xoay vào phía trong (phía mũi). Khi xảy ra song thị, tạo ra Song thị đồng danh (Uncrossed Diplopia): ảnh từ mắt phải lệch thấy ở phía bên phải.',
    clinicalNote: 'Thường liên quan đến viễn thị nặng (Lác trong điều tiết - Accommodative Esotropia) do trẻ nỗ lực quy tụ quá mức.',
    pathophysiology: 'Tia sáng từ vật tiêu rơi vào vùng võng mạc phía mũi (Nasal Retina), não chiếu ảnh ra phía ngoài cùng bên.',
    defaultParams: {
      direction: 'esotropia',
      deviation: 75,
      diplopiaOffset: 70,
      suppression: 0,
    },
  },

  exotropia: {
    id: 'exotropia',
    category: 'directions',
    name: 'Lác ngoài (Exotropia)',
    badge: 'Phân kỳ',
    medicalTitle: 'Lác ngoài (Exotropia / Divergent Strabismus)',
    medicalDescription: 'Mắt lệch xoay ra phía ngoài (phía thái dương). Khi xảy ra song thị, tạo ra Song thị chéo (Crossed Diplopia): ảnh từ mắt phải lệch thấy ở phía bên trái.',
    clinicalNote: 'Thường khởi phát dưới dạng lác ngoài từng lúc (Intermittent Exotropia), rõ hơn khi mệt mỏi, nhìn xa hoặc ra ngoài trời nắng.',
    pathophysiology: 'Tia sáng rơi vào vùng võng mạc phía thái dương (Temporal Retina), não chiếu ảnh bắt chéo sang phía đối diện.',
    defaultParams: {
      direction: 'exotropia',
      deviation: 75,
      diplopiaOffset: 70,
      suppression: 0,
    },
  },

  hypertropia: {
    id: 'hypertropia',
    category: 'directions',
    name: 'Lác đứng (Hypertropia)',
    badge: 'Lên/Xuống',
    medicalTitle: 'Lác đứng (Hypertropia / Vertical Strabismus)',
    medicalDescription: 'Trục thị giác một mắt lệch theo phương thẳng đứng (hướng lên trên so với mắt đối diện). Gây song thị đứng rất khó chịu.',
    clinicalNote: 'Thường do liệt dây thần kinh sọ số IV (Liệt cơ chéo lớn / Superior Oblique Palsy). Bệnh nhân thường nghiêng đầu bù trừ.',
    pathophysiology: 'Sự chênh lệch cao độ của hoàng điểm hai mắt khiến hai ảnh bị tách theo trục thẳng đứng Y.',
    defaultParams: {
      direction: 'hypertropia',
      deviation: 70,
      diplopiaOffset: 65,
      suppression: 0,
    },
  },

  hypotropia: {
    id: 'hypotropia',
    category: 'directions',
    name: 'Lác xuống (Hypotropia)',
    badge: 'Lệch xuống',
    medicalTitle: 'Lác xuống dưới (Hypotropia / Downward Strabismus)',
    medicalDescription: 'Trục thị giác một mắt lệch thấp hơn so với mắt đối diện. Gây song thị đứng với ảnh từ mắt lệch nằm ở vị trí cao hơn ảnh từ mắt lành.',
    clinicalNote: 'Thường gặp trong chấn thương vỡ sàn hốc mắt (Blowout fracture) kẹt cơ trực dưới hoặc bệnh nhãn giáp Graves.',
    pathophysiology: 'Hoàng điểm mắt lệch bị đẩy lên cao hơn trục quang học, vỏ não phóng chiếu ảnh xuống thấp hơn.',
    defaultParams: {
      direction: 'hypotropia',
      deviation: 70,
      diplopiaOffset: 65,
      suppression: 0,
    },
  },

  alternating: {
    id: 'alternating',
    category: 'directions',
    name: 'Lác luân phiên (Alternating)',
    badge: 'Thay phiên',
    medicalTitle: 'Lác Luân phiên (Alternating Strabismus)',
    medicalDescription: 'Người bệnh có thể luân phiên dùng mắt phải hoặc mắt trái để cố định tiêu điểm. Khi dùng mắt này nhìn thì mắt kia lệch và ngược lại.',
    clinicalNote: 'Ưu điểm lâm sàng: Vì cả hai mắt đều được luân phiên sử dụng nên hiếm khi bị nhược thị nặng, nhưng vẫn mất cảm nhận chiều sâu (Stereopsis).',
    pathophysiology: 'Vỏ não thay phiên kích hoạt cơ chế ức chế luân phiên tùy thuộc vào mắt nào đang đảm nhận việc định thị.',
    defaultParams: {
      deviation: 70,
      diplopiaOffset: 55,
      suppression: 50,
    },
  },

  // ==================== ORTHOPTICS TAB ====================
  cover_test: {
    id: 'cover_test',
    category: 'orthoptics',
    name: 'Nghiệm pháp Che mắt (Cover Test)',
    badge: 'Tiêu chuẩn vàng',
    medicalTitle: 'Nghiệm pháp Che mắt (Cover - Uncover Test)',
    medicalDescription: 'Tiêu chuẩn vàng trong nhãn khoa để phân biệt Lác ẩn (Phoria) và Lác hiện (Tropia). Khi che một mắt, dung hợp hai mắt bị phá vỡ, mắt dưới tấm che sẽ trượt về vị trí nghỉ tự nhiên.',
    clinicalNote: 'Khi bỏ tấm che ra, nếu mắt nhanh chóng điều chỉnh lại (Refixation Saccade) để lấy lại ảnh đơn thì đó là lác ẩn được bù trừ.',
    pathophysiology: 'Loại bỏ tín hiệu thị giác hai mắt sẽ giải phóng hệ thống vận nhãn khỏi sự kiểm soát của cơ chế dung hợp vỏ não.',
    defaultParams: {
      deviation: 50,
      diplopiaOffset: 0,
      coverState: 'cover_left',
      showHirschbergOverlay: false,
      redCyanDisparityAid: false,
    },
  },

  worth_4_dot: {
    id: 'worth_4_dot',
    category: 'orthoptics',
    name: 'Kính Đỏ-Xanh (Worth 4-Dot)',
    badge: 'Phân ly ảnh',
    medicalTitle: 'Thử nghiệm Phân ly Sắc giác (Worth 4-Dot Test)',
    medicalDescription: 'Sử dụng kính phân ly màu đỏ (mắt phải) và màu xanh (mắt trái) để phân định chính xác mắt nào đang nhìn thấy hình ảnh nào, kiểm tra tình trạng dung hợp, song thị hay ức chế.',
    clinicalNote: 'Nhìn thấy 4 điểm: Dung hợp bình thường. Nhìn thấy 5 điểm: Song thị. Chỉ nhìn thấy 2 hoặc 3 điểm: Đang có hiện tượng ức chế (Suppression).',
    pathophysiology: 'Lọc quang học tách bạch hoàn toàn kênh thị giác của hai mắt để khảo sát trực tiếp khả năng phối hợp thần kinh trung ương.',
    defaultParams: {
      redCyanDisparityAid: true,
      deviation: 70,
      diplopiaOffset: 45,
      suppression: 0,
      showHirschbergOverlay: false,
      coverState: 'none',
    },
  },

  hirschberg: {
    id: 'hirschberg',
    category: 'orthoptics',
    name: 'Phản xạ Giác mạc (Hirschberg)',
    badge: 'Phản xạ ánh sáng',
    medicalTitle: 'Đo độ Lác bằng Phản xạ Giác mạc (Hirschberg Test)',
    medicalDescription: 'Chiếu ánh sáng vào mắt bệnh nhân và quan sát vị trí chấm sáng phản xạ trên giác mạc so với tâm đồng tử. Bình thường phản xạ nằm ở trung tâm.',
    clinicalNote: 'Nếu phản xạ lệch ra rìa ngoài đồng tử 1mm tương đương độ lác khoảng 7° (15 lăng kính diopter).',
    pathophysiology: 'Xác định góc lệch quang học khách quan độc lập với phản xạ hợp nhất chủ quan của bệnh nhân.',
    defaultParams: {
      showHirschbergOverlay: true,
      deviation: 60,
      diplopiaOffset: 0,
      coverState: 'none',
      redCyanDisparityAid: false,
    },
  },
};
