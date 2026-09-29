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
}

export const MEDICAL_SCRIPTS: Record<string, AudioScript> = {
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

  public speakScript(scriptId: string): void {
    if (this.isMuted || !this.synth) return;

    const script = MEDICAL_SCRIPTS[scriptId];
    if (!script) return;

    this.stop();
    this.currentScriptId = scriptId;

    try {
      const utterance = new SpeechSynthesisUtterance(script.text);
      if (this.cachedVoice) {
        utterance.voice = this.cachedVoice;
      }
      utterance.lang = 'vi-VN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        this.notify(true);
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        this.notify(false);
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        this.currentUtterance = null;
        this.notify(false);
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    } catch (err) {
      console.warn('Cannot speak audio:', err);
      this.notify(false);
    }
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
    this.notify(false);
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
