/**
 * Medical Audio Narration Service
 * Grounded in clinical ophthalmology education (AAO BCSC).
 * Provides professional Vietnamese voice synthesis using Web Speech API with fallback.
 */

export interface AudioScript {
  id: string;
  title: string;
  text: string;
  keyTakeaway: string;
  speaker?: 'mascot' | 'brain' | 'narrator';
}

export const MEDICAL_SCRIPTS: Record<string, AudioScript> = {
  // ==================== STORYLINE CHAPTERS (EPIC SCI-FI QUEST) ====================
  story_intro: {
    id: 'story_intro',
    title: 'Trạm Chỉ Huy: Kích Hoạt Chiến Hạm Thị Giác',
    text: 'Chào mừng tân binh! Hãy ngồi thẳng trước camera! Hệ thống sinh học đang quét mắt bạn... Chuyến phiêu lưu này không đưa bạn ra ngoài không gian, mà đưa bạn thám hiểm cỗ máy kỳ diệu nhất: Đôi mắt và bộ não của chính bạn! Hãy cùng thuyền trưởng Chớp Chớp và phi công Lém Lỉnh giải cứu chiến hạm thị giác nhé!',
    keyTakeaway: 'Chuyến thám hiểm cơ chế thị giác hai mắt và trung khu xử lý não bộ.',
    speaker: 'brain',
  },
  story_ch1: {
    id: 'story_ch1',
    title: 'Hồi 1: Liên Quân Hoàn Hảo — Phép Màu 3D',
    text: 'Báo cáo Chỉ Huy! Hai phi thuyền mắt đang khóa một trăm phần trăm tọa độ vào viên ngọc năng lượng! Khi hai mắt cùng nhìn về một điểm, Bác Não sẽ hợp nhất hai góc nhìn thành một bức tranh ba đê nổi bần bật! Bạn thấy viên ngọc một hình ảnh duy nhất đúng không? Tuyệt cú mèo!',
    keyTakeaway: 'Hai mắt cùng trục thị giác · Dung hợp cảm giác 100% tạo thị giác lập thể 3D.',
    speaker: 'mascot',
  },
  story_ch2: {
    id: 'story_ch2',
    title: 'Hồi 2: Vụ "Đào Tẩu" Của Phi Công Nghịch Ngợm',
    text: 'Ôi chao! Có một chú bướm thiên hà lấp lánh bay qua kìa! Cơ phó Lém Lỉnh tính lén liếc mắt sang xem, nhưng ối ối... hệ cơ mắt giật dây cương kéo ngược về vị trí ngay! Mắt bạn hơi căng tí thôi nhưng bạn vẫn nhìn thấy một ảnh đơn sắc nét. Đó chính là lác ẩn đấy!',
    keyTakeaway: 'Lác ẩn (Phoria): Hệ cơ vận nhãn bù trừ co kéo liên tục để giữ nguyên ảnh đơn.',
    speaker: 'mascot',
  },
  story_ch3: {
    id: 'story_ch3',
    title: 'Hồi 3: Báo Động Đỏ — Hai Mắt Rẽ Hai Hướng',
    text: 'Báo động cấp hai! Cơ mắt đã mỏi rã rời, hai phi thuyền mắt bắt đầu tuột tay lái và rẽ sang hai hướng khác nhau! Nhìn kìa, viền khuôn mặt bạn bắt đầu trượt bóng ma phát sáng! Trục đồng quy tan vỡ, sắp xảy ra hiện tượng bẻ cong thị giác kinh ngạc nhất rồi!',
    keyTakeaway: 'Chớm mất bù (Decompensation): Cơ mắt kiệt sức, hình ảnh trượt bóng mờ.',
    speaker: 'brain',
  },
  story_ch4: {
    id: 'story_ch4',
    title: 'Hồi 4: Vũ Trụ Nhân Đôi — Ma Trận Song Thị!',
    text: 'Bùm! Thế giới bị nhân bản làm hai! Hai chiếc mũi, hai khuôn mặt, hai con tàu! Đâu mới là cơ thể thật đây?! Hãy thử giơ bàn tay lên trước camera xem! Bạn sẽ thấy mình có tận hai bàn tay song song! Đây chính là song thị trong truyền thuyết!',
    keyTakeaway: 'Song thị (Diplopia): Dung hợp sụp đổ, một vật thể tách thành hai ảnh song song.',
    speaker: 'mascot',
  },
  story_ch5: {
    id: 'story_ch5',
    title: 'Hồi 5: Chiêu Thức Thần Sầu — Bác Não "Cắt Cầu Dao"',
    text: 'Đừng hoảng loạn, để Bác Não ra tay! Hai màn hình chiếu cùng lúc làm ta nhức đầu quá! Kích hoạt giao thức tối mật: Bấm nút tắt kênh mắt phải! Xoẹt! Hình ảnh phân thân tan biến, bạn lại nhìn thấy một ảnh đơn bình yên! Bác Não đã giải cứu thành công!',
    keyTakeaway: 'Ức chế vỏ não (Suppression): Não dập tắt tín hiệu mắt lệch để triệt tiêu song thị.',
    speaker: 'brain',
  },
  story_ch6: {
    id: 'story_ch6',
    title: 'Hồi 6: Căn Phòng Đóng Băng — Đánh Thức Mắt Ngủ Quên',
    text: 'Các phi công nhìn kìa... Vì con tàu mắt phải bị tắt sóng quá lâu, kính chắn gió của nó đã đóng băng và mờ sương! Đó gọi là nhược thị. Nhưng đừng sợ! Nếu phát hiện sớm và tập luyện nhãn khoa chăm chỉ, con tàu sẽ lại sáng rõ như mới!',
    keyTakeaway: 'Nhược thị (Amblyopia): Mắt bị ức chế lâu ngày suy giảm thị lực, cần can thiệp sớm.',
    speaker: 'brain',
  },
  story_ending: {
    id: 'story_ending',
    title: 'Đích Đến Hoàng Kim: Hai Mắt, Một Thế Giới',
    text: 'Hoan hô Phi Công Trưởng! Bạn đã xuất sắc chỉ huy chiến hạm vượt qua Hố Đen Song Thị an toàn! Hai đôi mắt phối hợp cùng Bộ Não thông minh đã tạo nên một thế giới rực rỡ. Hãy nhớ quy tắc hai mươi hai mươi hai mươi và yêu thương đôi mắt mỗi ngày bạn nhé!',
    keyTakeaway: 'Hai mắt — Một thế giới · Chăm sóc thị giác và thăm khám nhãn khoa định kỳ.',
    speaker: 'mascot',
  },

  // ==================== CLINICAL LAB SCRIPTS ====================
  normal: {
    id: 'normal',
    title: 'Giai đoạn 01: Thị giác Hai mắt Bình thường',
    text: 'Giai đoạn một: Thị giác hai mắt bình thường. Trục thị giác của cả hai mắt cùng hướng chính xác vào tiêu điểm quan sát. Hình ảnh từ hai mắt rơi trọn vẹn vào hoàng điểm võng mạc và được vỏ não thị giác dung hợp thành một hình ảnh duy nhất, mang lại cảm nhận chiều sâu lập thể sắc nét.',
    keyTakeaway: 'Dung hợp cảm giác và vận nhãn 100% · Không có hiện tượng song thị hay ức chế.',
  },
  early_strabismus: {
    id: 'early_strabismus',
    title: 'Giai đoạn 02: Lệch nhẹ / Lác ẩn (Phoria)',
    text: 'Giai đoạn hai: Lệch nhẹ hay lác ẩn. Ở giai đoạn này, nhãn cầu có xu hướng lệch nhẹ, nhưng não bộ và hệ cơ vận nhãn đang chủ động kích hoạt cơ chế dung hợp bù trừ. Người bệnh hoàn toàn không bị nhìn đôi, mà chỉ cảm thấy mỏi mắt, căng cơ hốc mắt khi tập trung làm việc kéo dài.',
    keyTakeaway: 'Dung hợp vận nhãn đang bù trừ · Giữ nguyên 1 hình ảnh đơn sắc nét (Không song thị).',
  },
  clear_strabismus: {
    id: 'clear_strabismus',
    title: 'Giai đoạn 03: Lệch rõ / Chớm mất bù',
    text: 'Giai đoạn ba: Lệch rõ trục thị giác. Lúc này, độ lệch của nhãn cầu bắt đầu vượt quá vùng dung hợp của võng mạc. Hình ảnh khuôn mặt và môi trường xung quanh bắt đầu xuất hiện viền bóng mờ trượt nhẹ sang một bên, báo hiệu hệ thống dung hợp đang mất bù và chuẩn bị tách thành hai hình ảnh.',
    keyTakeaway: 'Chớm mất bù (Decompensation) · Xuất hiện viền bóng mờ trượt nhẹ trước khi tách đôi.',
  },
  diplopia: {
    id: 'diplopia',
    title: 'Giai đoạn 04: Song thị toàn phần (Diplopia)',
    text: 'Giai đoạn bốn: Song thị toàn phần. Khả năng dung hợp của não bộ sụp đổ hoàn toàn và chưa có ức chế vỏ não. Người quan sát nhìn thấy hai hình ảnh hoàn chỉnh tách đôi chồng lấn của chính mình và môi trường xung quanh, với độ lệch song song vừa phải theo đúng góc nhìn lâm sàng.',
    keyTakeaway: 'Dung hợp 0% · Nhìn đôi hai hình ảnh song song cân bằng 50/50 theo đúng lâm sàng.',
  },
  suppression: {
    id: 'suppression',
    title: 'Giai đoạn 05: Thích nghi Vỏ não (Ức chế triệt tiêu song thị)',
    text: 'Giai đoạn năm: Não thích nghi hay ức chế vỏ não. Ở trẻ nhỏ có lác khởi phát sớm, vỏ não sẽ chủ động dập tắt tín hiệu hình ảnh từ mắt lệch. Kết quả là song thị hoàn toàn biến mất, chỉ còn một hình ảnh từ mắt lành, nhưng cái giá phải trả là mất cảm nhận chiều sâu ba chiều.',
    keyTakeaway: 'Vỏ não dập tắt mắt lệch · Triệt tiêu hoàn toàn song thị · Mất thị giác lập thể.',
  },
  amblyopia: {
    id: 'amblyopia',
    title: 'Giai đoạn 06: Nhược thị do Lác (Strabismic Amblyopia)',
    text: 'Giai đoạn sáu: Tầm nhìn Nhược thị do lác. Hình ảnh mờ nhòe không thể bù trừ hoàn toàn bằng kính, do vùng não tiếp nhận không phân giải được chi tiết. Người bệnh bị suy giảm hoặc mất cảm nhận chiều sâu ba chiều, dễ bước hụt cầu thang, khó bắt bóng hay rót nước. Mắt nhược thị gặp hiện tượng chen chúc, chữ dính chùm vào nhau khi nằm trong hàng dài, và giảm độ nhạy tương phản, nhạt màu. Khi mở cả hai mắt, não tự động ưu tiên mắt khỏe nên người bệnh sinh hoạt gần như bình thường. Nhưng khi che mắt lành lại, mắt nhược thị buộc phải làm việc độc lập, hình ảnh sẽ rung nhẹ, mờ đục và không gian xung quanh thiếu tính ổn định.',
    keyTakeaway: 'Mờ nhòe không bù được bằng kính · Mất thị giác 3D · Hiện tượng chen chúc · Giảm tương phản · Khác biệt rõ rệt khi che mắt lành.',
  },
  cover_test: {
    id: 'cover_test',
    title: 'Nghiệm pháp Che mắt (Cover - Uncover Test)',
    text: 'Nghiệm pháp che mắt: Khi dùng tấm che che mắt lành, mắt lệch lập tức chuyển động giật thẳng trục để định thị lại mục tiêu. Ngược lại, khi che mắt lệch, mắt lành vẫn giữ nguyên định thị. Bỏ che giúp phát hiện chuyển động hồi phục trong lác ẩn.',
    keyTakeaway: 'Che mắt lành: Mắt lệch chuyển động định thị · Che mắt lệch: Mắt lành không chuyển động.',
  },
  hirschberg: {
    id: 'hirschberg',
    title: 'Nghiệm pháp Phản xạ Giác mạc (Hirschberg Test)',
    text: 'Nghiệm pháp phản xạ ánh sáng giác mạc Hirschberg: Chiếu đèn pin đồng trục vào hai mắt. Ở mắt bình thường, điểm sáng nằm ngay tâm đồng tử. Trong lác trong, điểm phản xạ bị dời ra phía thái dương. Trong lác ngoài, điểm phản xạ bị dời vào phía mũi. Mỗi milimét lệch tương đương khoảng mười lăm lăng kính đi-ốp.',
    keyTakeaway: 'Quy tắc Hirschberg: 1mm lệch ≈ 7 độ ≈ 15 lăng kính đi-ốp (Δ).',
  },
};

class MedicalAudioService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private isMuted = false;
  private cachedVoice: SpeechSynthesisVoice | null = null;
  private listeners: Set<(speaking: boolean, scriptId?: string) => void> = new Set();
  private currentScriptId: string | null = null;
  private onCompleteCallback: (() => void) | null = null;
  private fallbackTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoice();
    }
  }

  private initVoice() {
    if (!this.synth) return;
    const findVoice = () => {
      const voices = this.synth!.getVoices();
      // Look for Vietnamese voice first
      const viVoice = voices.find(
        (v) => v.lang.startsWith('vi') || v.lang.includes('VIE') || v.name.toLowerCase().includes('vietnam')
      );
      if (viVoice) {
        this.cachedVoice = viVoice;
      } else {
        // Fallback to default high quality natural voice
        this.cachedVoice = voices.find((v) => v.default) || voices[0] || null;
      }
    };

    findVoice();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = findVoice;
    }
  }

  public subscribe(listener: (speaking: boolean, scriptId?: string) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(speaking: boolean) {
    this.isSpeaking = speaking;
    this.listeners.forEach((l) => l(speaking, this.currentScriptId || undefined));
  }

  public speakScript(scriptId: string, onComplete?: () => void): void {
    this.stop();
    this.currentScriptId = scriptId;
    this.onCompleteCallback = onComplete || null;

    const script = MEDICAL_SCRIPTS[scriptId];
    if (!script) {
      this.onCompleteCallback?.();
      return;
    }

    if (this.isMuted || !this.synth) {
      // If audio is muted or speech synth unavailable, trigger onComplete after short reading period
      const readingDurationMs = Math.max(3000, script.text.split(' ').length * 180);
      this.notify(true);
      this.fallbackTimer = setTimeout(() => {
        this.notify(false);
        const cb = this.onCompleteCallback;
        this.onCompleteCallback = null;
        cb?.();
      }, readingDurationMs);
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(script.text);
      if (this.cachedVoice) {
        utterance.voice = this.cachedVoice;
      }
      utterance.lang = 'vi-VN';
      utterance.rate = 1.02;
      utterance.pitch = 1.05;

      utterance.onstart = () => {
        this.notify(true);
      };

      utterance.onend = () => {
        if (this.fallbackTimer) clearTimeout(this.fallbackTimer);
        this.currentUtterance = null;
        this.notify(false);
        const cb = this.onCompleteCallback;
        this.onCompleteCallback = null;
        cb?.();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        if (this.fallbackTimer) clearTimeout(this.fallbackTimer);
        this.currentUtterance = null;
        this.notify(false);
        const cb = this.onCompleteCallback;
        this.onCompleteCallback = null;
        cb?.();
      };

      // Fallback timer: in case browser SpeechSynthesis hangs or ignores onend
      const estimatedDurationMs = Math.max(4500, script.text.split(' ').length * 320);
      this.fallbackTimer = setTimeout(() => {
        if (this.isSpeaking) {
          this.currentUtterance = null;
          this.notify(false);
          const cb = this.onCompleteCallback;
          this.onCompleteCallback = null;
          cb?.();
        }
      }, estimatedDurationMs + 2000);

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    } catch (err) {
      console.warn('Cannot speak audio:', err);
      this.notify(false);
      this.onCompleteCallback?.();
    }
  }

  public stop(): void {
    if (this.fallbackTimer) {
      clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
    this.notify(false);
    this.onCompleteCallback = null;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stop();
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public getCurrentScript(): AudioScript | null {
    if (!this.currentScriptId) return null;
    return MEDICAL_SCRIPTS[this.currentScriptId] || null;
  }
}

export const medicalAudio = new MedicalAudioService();
