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
    medicalDescription: 'Hai mắt cùng hướng chính xác vào tiêu điểm quan sát. Hình ảnh rơi đúng vào hoàng điểm (Fovea) của cả hai mắt, được vỏ não thị giác dung hợp hoàn hảo thành một hình ảnh duy nhất có cảm nhận chiều sâu lập thể sắc nét (Stereopsis).',
    clinicalNote: 'Không có hiện tượng song thị hoặc ức chế. Biên độ dung hợp vận nhãn (Motor Fusion) và dung hợp cảm giác (Sensory Fusion) đạt 100%.',
    pathophysiology: 'Tia sáng hội tụ đối xứng trên vùng Panum của võng mạc hai mắt, kích thích các tế bào thần kinh nhị nhãn ở vỏ não thùy chẩm V1/V2.',
    defaultParams: {
      deviation: 0,
      diplopiaOffset: 0,
      suppression: 0,
      fusion: 100,
      blurAmount: 0,
      coverState: 'none',
      redCyanDisparityAid: false,
    },
  },

  // ==================== STAGE 2: EARLY / INTERMITTENT (PHORIA) ====================
  early_strabismus: {
    id: 'early_strabismus',
    category: 'stages',
    stageNumber: '02',
    name: 'Lệch nhẹ / Lác ẩn (Phoria)',
    badge: 'Dung hợp bù trừ',
    medicalTitle: '02. Lệch nhẹ / Lác ẩn (Heterophoria / Intermittent Tropia)',
    medicalDescription: 'Trục thị giác có xu hướng lệch nhẹ, NHƯNG não bộ và hệ cơ vận nhãn vẫn chủ động bù trừ (Fusional Vergence) để giữ ảnh trong vùng Panum. Do đó, người bệnh HOÀN TOÀN KHÔNG BỊ NHÌN ĐÔI (Ảnh đơn 100%).',
    clinicalNote: 'Triệu chứng thực tế: Mỏi mắt (Asthenopia), căng tức cơ hốc mắt, vi rung điều tiết khi chuyển tiêu cự hoặc khi làm việc mệt mỏi, nhưng hình ảnh vẫn là ẢNH ĐƠN.',
    pathophysiology: 'Hệ thống dung hợp vận nhãn liên tục kích hoạt cơ trực trong/ngoài để giữ ảnh trong vùng dung hợp Panum. Khi phá vỡ dung hợp (như che một mắt), độ lệch mới bộc lộ.',
    defaultParams: {
      deviation: 20,
      diplopiaOffset: 0,       // QUAN TRỌNG: Lệch nhẹ KHÔNG CÓ song thị!
      suppression: 0,
      fusion: 85,
      blurAmount: 0,
      coverState: 'none',
    },
  },

  // ==================== STAGE 3: CLEAR MISALIGNMENT (LỆCH RÕ) ====================
  clear_strabismus: {
    id: 'clear_strabismus',
    category: 'stages',
    stageNumber: '03',
    name: 'Lệch rõ (Clear Misalignment)',
    badge: 'Chớm mất bù',
    medicalTitle: '03. Lệch rõ Trục thị giác (Clear Ocular Misalignment)',
    medicalDescription: 'Độ lệch nhãn cầu bắt đầu vượt quá vùng dung hợp Panum (Decompensation). Vỏ não chưa kịp thích nghi và biên độ dung hợp vận nhãn suy giảm. Hình ảnh bắt đầu trượt nhẹ sang một bên tạo viền bóng mờ chớm tách (~10-14px), người xem cảm nhận sự mất ổn định thị giác trước khi chuyển sang song thị hoàn toàn.',
    clinicalNote: 'Hình ảnh khuôn mặt xuất hiện bóng mờ viền trượt nhẹ (~10-14px, độ mờ ~30%). Đây là giai đoạn chuyển tiếp quan trọng khi hệ cơ vận nhãn không còn giữ nổi ảnh đơn.',
    pathophysiology: 'Ảnh võng mạc trượt ra ngoài vùng Panum nhưng não vẫn còn phản xạ cố gắng dung hợp yếu ớt.',
    defaultParams: {
      deviation: 35,
      diplopiaOffset: 15,      // Chớm lệch viền mờ (~11px)
      suppression: 0,
      fusion: 40,
      blurAmount: 0,
      coverState: 'none',
    },
  },

  // ==================== STAGE 4: TRUE DIPLOPIA (SONG THỊ HOÀN TOÀN) ====================
  diplopia: {
    id: 'diplopia',
    category: 'stages',
    stageNumber: '04',
    name: 'Song thị hoàn toàn (Diplopia)',
    badge: 'Nhìn đôi chuẩn lâm sàng',
    medicalTitle: '04. Song thị Toàn phần (Full Manifest Diplopia)',
    medicalDescription: 'Tính năng cốt lõi: Khả năng dung hợp sụp đổ hoàn toàn (Fusion = 0%) và chưa xảy ra ức chế vỏ não. Hình ảnh tách đôi song song với khoảng cách vừa phải chuẩn xác (~24-28px, hai khuôn mặt lồng ghép vào nhau với viền sống mũi, khóe mắt và đường nét rõ ràng theo đúng ảnh lâm sàng thực tế "chỉ lệch như này thôi", không bị tách quá xa hay méo mó).',
    clinicalNote: 'Hình ảnh khuôn mặt, đôi mắt và môi trường xung quanh bị tách thành hai hình ảnh song song rõ nét với tỉ lệ cân bằng 50/50, khoảng cách lệch tự nhiên ~24-28px. Có thể kéo thanh trượt Song thị để tinh chỉnh độ lệch.',
    pathophysiology: 'Sự tách biệt hoàn toàn giữa hai hướng thị giác chủ quan (Subjective Visual Directions) mà không có sự can thiệp dập tắt của vỏ não.',
    defaultParams: {
      deviation: 65,
      diplopiaOffset: 32,      // Chuẩn tỉ lệ lâm sàng thực tế "chỉ lệch như này thôi" (~24-28px)
      suppression: 0,
      fusion: 0,
      blurAmount: 0,
      coverState: 'none',
    },
  },

  // ==================== STAGE 5: CORTICAL SUPPRESSION (ADAPTATION) ====================
  suppression: {
    id: 'suppression',
    category: 'stages',
    stageNumber: '05',
    name: 'Não thích nghi (Ức chế vỏ não)',
    badge: 'Triệt tiêu song thị',
    medicalTitle: '05. Thích nghi Vỏ não Thị giác (Cortical Suppression)',
    medicalDescription: 'Ở trẻ nhỏ có lác khởi phát sớm (dưới 8 tuổi), vỏ não mềm dẻo sẽ thích nghi bằng cách chủ động dập tắt tín hiệu từ hoàng điểm mắt lệch. Kết quả: SONG THỊ HOÀN TOÀN BIẾN MẤT, trẻ chỉ thấy một hình ảnh đơn từ mắt lành.',
    clinicalNote: 'Song thị bị triệt tiêu, nhưng cái giá phải trả là mất hoàn toàn cảm nhận chiều sâu 3D (Stereopsis) và nguy cơ tiến triển thành nhược thị vĩnh viễn.',
    pathophysiology: 'Các interneuron ức chế GABAergic ở vỏ não V1 ngăn chặn dòng tín hiệu thị giác từ mắt lệch truyền lên trung khu nhận thức thị giác cao cấp.',
    defaultParams: {
      deviation: 75,
      diplopiaOffset: 0,       // QUAN TRỌNG: Song thị biến mất vì não đã ức chế mắt lệch!
      suppression: 95,         // Mức ức chế cao
      fusion: 0,
      blurAmount: 0,
      coverState: 'none',
    },
  },

  // ==================== STAGE 6: STRABISMIC AMBLYOPIA ====================
  amblyopia: {
    id: 'amblyopia',
    category: 'stages',
    stageNumber: '06',
    name: 'Nhược thị do Lác (Amblyopia)',
    badge: 'Giảm thị lực',
    medicalTitle: '06. Nhược thị Thần kinh do Lác (Strabismic Amblyopia)',
    medicalDescription: 'Hậu quả lâu dài khi mắt lệch bị ức chế liên tục trong giai đoạn phát triển thị giác vàng. Ngay cả khi đeo kính đúng số và che mắt lành, mắt nhược thị vẫn bị suy giảm thị lực và giảm độ nhạy tương phản trầm trọng.',
    clinicalNote: 'Mắt nhược thị nhìn mờ, giảm tương phản chi tiết cao và gặp hiện tượng đám đông (Crowding: chữ đứng một mình dễ đọc hơn chữ trong hàng).',
    pathophysiology: 'Teo nhỏ các tế bào thần kinh ở thể gối ngoài (LGN) và vỏ não vận nhãn phụ trách tiếp nhận tín hiệu từ mắt nhược thị.',
    defaultParams: {
      deviation: 70,
      diplopiaOffset: 0,
      suppression: 98,
      fusion: 0,
      blurAmount: 4.5,
      coverState: 'none',
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
