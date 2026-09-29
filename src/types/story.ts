import { ConditionId } from './simulation';

export type StoryChapterId =
  | 'intro'
  | 'ch1'
  | 'ch2'
  | 'ch3'
  | 'ch4'
  | 'ch5'
  | 'ch6'
  | 'ending';

export interface StoryChapter {
  id: StoryChapterId;
  order: number;
  chapterNumber?: string;
  title: string;
  badge: string;
  medicalCode: string;
  conditionId: ConditionId;
  audioScriptId: string;
  mascotMood: 'happy' | 'wandering' | 'curious' | 'surprised' | 'heroic' | 'caring' | 'celebrating';
  dialogueSpeaker: string;
  speakerRole: 'captain' | 'pilot' | 'commander' | 'narrator';
  dialogueQuote: string;
  dialogueDetails?: string;
  interactiveChallenge?: {
    type: 'gem_lock' | 'butterfly_chase' | 'radar_warning' | 'hand_clone' | 'brain_zap' | 'spyglass_lens';
    promptText: string;
    actionHint?: string;
  };
  visualSchematic?: string;
  nextChapterId: StoryChapterId | null;
  prevChapterId: StoryChapterId | null;
  buttonNextLabel: string;
}

export const STORY_CHAPTERS: Record<StoryChapterId, StoryChapter> = {
  intro: {
    id: 'intro',
    order: 0,
    title: 'Kích Hoạt Chiến Hạm Thị Giác',
    badge: 'Trạm Chỉ Huy',
    medicalCode: 'Khám phá Bí mật Não bộ & Nhãn cầu',
    conditionId: 'normal',
    audioScriptId: 'story_intro',
    mascotMood: 'happy',
    dialogueSpeaker: 'Tổng Chỉ Huy Bác Não 🧠⚡',
    speakerRole: 'commander',
    dialogueQuote:
      'Chào Tân Binh! Hãy ngồi thẳng trước camera! Hệ thống sinh học đang quét mắt bạn... Chuyến phiêu lưu này không đưa bạn ra ngoài vũ trụ, mà đưa bạn thám hiểm cỗ máy kỳ diệu nhất: ĐÔI MẮT VÀ BỘ NÃO CỦA CHÍNH BẠN!',
    dialogueDetails:
      'Gặp gỡ 2 phi công tí hon: Thuyền trưởng Chớp Chớp (mắt trái) & Cơ phó Lém Lỉnh (mắt phải) cùng phi vụ giải cứu thị giác ngoạn mục!',
    nextChapterId: 'ch1',
    prevChapterId: null,
    buttonNextLabel: '🚀 Khởi Động Động Cơ Phi Hành',
  },
  ch1: {
    id: 'ch1',
    order: 1,
    chapterNumber: '01',
    title: 'Liên Quân Hoàn Hảo — Phép Màu 3D',
    badge: 'Hồi 1 · Đồng tâm hiệp lực',
    medicalCode: '01 — Chính thị (Normal Binocular Single Vision)',
    conditionId: 'normal',
    audioScriptId: 'story_ch1',
    mascotMood: 'happy',
    dialogueSpeaker: 'Thuyền Trưởng Chớp Chớp 👁️✨',
    speakerRole: 'captain',
    dialogueQuote:
      'Báo cáo Chỉ Huy! Hai phi thuyền mắt đang khóa 100% tọa độ vào Viên Ngọc Năng Lượng! Khi hai mắt cùng nhìn về một điểm, Bác Não sẽ hợp nhất 2 góc nhìn thành một bức tranh 3D nổi bần bật!',
    interactiveChallenge: {
      type: 'gem_lock',
      promptText: 'Hãy ngắm thẳng vào Viên Ngọc Không Gian ⭐ phía trước! Bạn thấy mấy viên?',
      actionHint: '👉 Chuẩn xác 1 viên duy nhất! Khả năng dung hợp lập thể (Stereopsis) đạt điểm tuyệt đối 100%!',
    },
    visualSchematic: '⭐ [KHÓA MỤC TIÊU] 👁️ + 👁️ = HÌNH ẢNH 3D ĐỘC NHẤT',
    nextChapterId: 'ch2',
    prevChapterId: 'intro',
    buttonNextLabel: 'Sang Hồi 2: Cuộc Đào Tẩu Của Lém Lỉnh ➔',
  },
  ch2: {
    id: 'ch2',
    order: 2,
    chapterNumber: '02',
    title: 'Vụ "Đào Tẩu" Của Phi Công Nghịch Ngợm',
    badge: 'Hồi 2 · Bão kéo đàn hồi',
    medicalCode: '02 — Lệch nhẹ / Lác ẩn (Phoria / Vergence)',
    conditionId: 'early_strabismus',
    audioScriptId: 'story_ch2',
    mascotMood: 'wandering',
    dialogueSpeaker: 'Cơ Phó Lém Lỉnh 🚀',
    speakerRole: 'pilot',
    dialogueQuote:
      'Ôi chao! Có một Chú Bướm Thiên Hà 🦋 lấp lánh bay qua kìa! Tớ phải liếc sang xem mới được! Nhưng ối ối... hệ cơ mắt giật dây cương kéo tớ về vị trí ngay! Không dễ trốn đâu nha!',
    interactiveChallenge: {
      type: 'butterfly_chase',
      promptText: 'Chú bướm neon 🦋 đang bay vè vè sang bên phải, mắt phải khẽ giật theo.',
      actionHint: 'Dung hợp vận nhãn (Fusional Vergence) đang gồng mình tập gym để giữ 1 ảnh đơn!',
    },
    visualSchematic: '👁️ ↘ (Trôi dạt) ⚡ [DÂY CƯƠNG KÉO LẠI] ➔ VẪN LÀ 1 ẢNH ĐƠN',
    nextChapterId: 'ch3',
    prevChapterId: 'ch1',
    buttonNextLabel: 'Sang Hồi 3: Đứt Dây Cương — Lệch Trục! ➔',
  },
  ch3: {
    id: 'ch3',
    order: 3,
    chapterNumber: '03',
    title: 'Báo Động Đỏ — Hai Mắt Rẽ Hai Hướng',
    badge: 'Hồi 3 · Mất kiểm soát',
    medicalCode: '03 — Lệch rõ trục thị giác (Decompensation)',
    conditionId: 'clear_strabismus',
    audioScriptId: 'story_ch3',
    mascotMood: 'curious',
    dialogueSpeaker: 'Tổng Chỉ Huy Bác Não 🧠⚡',
    speakerRole: 'commander',
    dialogueQuote:
      'WEE-WOO! Cảnh báo cấp hai! Cơ mắt đã đuối sức, hai phi thuyền mắt bắt đầu tuột tay lái và rẽ sang hai hướng khác nhau! Nhìn kìa, viền khuôn mặt bạn bắt đầu trượt bóng ma phát sáng!',
    interactiveChallenge: {
      type: 'radar_warning',
      promptText: 'Trục thị giác chớm mất bù (Decompensation) vượt qua ngưỡng an toàn Panum!',
      actionHint: 'Giữ chặt tay lái! Sắp tới hiện tượng bẻ cong không gian kinh ngạc nhất!',
    },
    visualSchematic: '⚠️ CẢNH BÁO: TRỤC ĐỒNG QUY PHÂN RÃ ➔ XUẤT HIỆN BÓNG MA',
    nextChapterId: 'ch4',
    prevChapterId: 'ch2',
    buttonNextLabel: '🔥 ĐẾN CAO TRÀO: HỐ ĐEN SONG THỊ! ➔',
  },
  ch4: {
    id: 'ch4',
    order: 4,
    chapterNumber: '04',
    title: 'Vũ Trụ Nhân Đôi — Ma Trận Song Thị!',
    badge: 'Hồi 4 · Cao Trào Kinh Điển',
    medicalCode: '04 — Song thị toàn phần (Full Diplopia)',
    conditionId: 'diplopia',
    audioScriptId: 'story_ch4',
    mascotMood: 'surprised',
    dialogueSpeaker: 'Cả Hai Phi Công Hốt Hoảng 😱',
    speakerRole: 'captain',
    dialogueQuote:
      'BOOM! Thế giới bị nhân bản làm hai! Hai chiếc mũi, hai khuôn mặt, hai căn phòng! Đâu mới là cơ thể thật của chúng ta?! Mau giơ bàn tay lên trước camera thử nghiệm ma pháp phân thân đi!',
    interactiveChallenge: {
      type: 'hand_clone',
      promptText: 'Thử nghiệm ngay: Hãy đưa bàn tay ✋ lên trước camera! Bạn thấy 2 bàn tay song song!',
      actionHint: 'Khả năng ghép ảnh sụp đổ 0%! Một vật thể bị nhân đôi thành hai luồng hình ảnh rõ nét!',
    },
    visualSchematic: '👤 [ẢNH 1] ⚡ 👤 [ẢNH 2] (SONG THỊ SONG SONG 50/50)',
    nextChapterId: 'ch5',
    prevChapterId: 'ch3',
    buttonNextLabel: 'Xem Bác Não Rút Gươm Giải Cứu ➔',
  },
  ch5: {
    id: 'ch5',
    order: 5,
    chapterNumber: '05',
    title: 'Chiêu Thức Thần Sầu — Bác Não "Cắt Cầu Dao"',
    badge: 'Hồi 5 · Cứu Nguy Thần Tốc',
    medicalCode: '05 — Ức chế vỏ não thị giác (Cortical Suppression)',
    conditionId: 'suppression',
    audioScriptId: 'story_ch5',
    mascotMood: 'heroic',
    dialogueSpeaker: 'Tổng Chỉ Huy Bác Não 🧠⚡',
    speakerRole: 'commander',
    dialogueQuote:
      'Đừng hoảng loạn, để Bác Não ra tay! Hai màn hình chiếu cùng lúc làm ta nhức đầu quá! KÍCH HOẠT GIAO THỨC TỐI MẬT: BẤM NÚT TẮT KÊNH MẮT PHẢI! Xoẹt! Hình ảnh phân thân tan biến, bạn chỉ còn thấy MỘT ảnh!',
    interactiveChallenge: {
      type: 'brain_zap',
      promptText: 'Bác Não dập tắt tín hiệu xung đột: 👤 👤 ➔ 👤 ░ ➔ 👤 (Ảnh đơn trở lại!)',
      actionHint: 'Tuyệt vời: Hết nhìn đôi! Nhưng cái giá phải trả: Tạm thời mất cảm nhận chiều sâu 3D!',
    },
    visualSchematic: '👁️ + [👁️ BỊ DẬP TẮT] ➔ 🧠 ➔ 1 THẾ GIỚI DUY NHẤT',
    nextChapterId: 'ch6',
    prevChapterId: 'ch4',
    buttonNextLabel: 'Sang Hồi 6: Căn Phòng Đóng Băng & Bài Học ➔',
  },
  ch6: {
    id: 'ch6',
    order: 6,
    chapterNumber: '06',
    title: 'Căn Phòng Đóng Băng — Đánh Thức Mắt Ngủ Quên',
    badge: 'Hồi 6 · Thấu Hiểu Y Khoa',
    medicalCode: '06 — Nhược thị thần kinh do lác (Amblyopia)',
    conditionId: 'amblyopia',
    audioScriptId: 'story_ch6',
    mascotMood: 'caring',
    dialogueSpeaker: 'Bác Não & Chớp Chớp ân cần 💖',
    speakerRole: 'commander',
    dialogueQuote:
      'Các phi công nhìn kìa... Vì con tàu mắt phải bị "tắt sóng" quá lâu, kính chắn gió của nó đã đóng băng và mờ sương! Đó gọi là Nhược thị. Nhưng đừng sợ! Nếu huấn luyện và đeo kính bịt mắt lành từ sớm, con tàu sẽ lại sáng rõ như mới!',
    interactiveChallenge: {
      type: 'spyglass_lens',
      promptText: 'So sánh: 🪟 Mắt Lành = Siêu nét 4K 🌳 | 🪟 Mắt Nhược Thị = Mờ sương giảm tương phản 🌫️',
      actionHint: 'Khám mắt và tập nhãn khoa sớm ở tuổi vàng (trước 8 tuổi) giúp phục hồi thị lực hoàn hảo!',
    },
    visualSchematic: 'MẮT LÀNH: [SẮC NÉT 100%] ⚡ MẮT NHƯỢC THỊ: [MỜ ĐỤC CẦN LUYỆN TẬP]',
    nextChapterId: 'ending',
    prevChapterId: 'ch5',
    buttonNextLabel: 'Nhận Huân Chương Phi Hành & Kết Thúc ➔',
  },
  ending: {
    id: 'ending',
    order: 7,
    title: 'Vinh Danh Phi Hành Gia — Hai Mắt, Một Thế Giới',
    badge: 'Đích Đến Hoàng Kim',
    medicalCode: 'Chứng chỉ Thám Hiểm Thị Giác RemiCare',
    conditionId: 'normal',
    audioScriptId: 'story_ending',
    mascotMood: 'celebrating',
    dialogueSpeaker: 'Toàn Thể Biệt Đội Thị Giác 🎆🌎',
    speakerRole: 'commander',
    dialogueQuote:
      'HOAN HÔ PHI CÔNG TRƯỞNG! Bạn vừa chỉ huy Chiến Hạm Thị Giác vượt qua Hố Đen Song Thị và Bão Não Ức Chế an toàn! Hai đôi mắt phối hợp cùng Bộ Não thông minh đã tạo nên một thế giới diệu kỳ. Hãy bảo vệ và yêu thương đôi mắt mỗi ngày!',
    visualSchematic: '🏆 HUÂN CHƯƠNG CHIẾN HẠM THỊ GIÁC: HAI MẮT — MỘT THẾ GIỚI 🌎',
    nextChapterId: null,
    prevChapterId: 'ch6',
    buttonNextLabel: '🔄 Tái Khởi Động Chuyến Du Hành Vũ Trụ',
  },
};
