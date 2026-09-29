import React from 'react';
import { X, ExternalLink, ShieldAlert, BookOpen } from 'lucide-react';
import { RemiCareLogo } from './RemiCareLogo';

interface MedicalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MedicalModal: React.FC<MedicalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#071922] border border-[#113e52] rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#0e3546] bg-[#05131b]">
          <div className="flex items-center gap-3">
            <RemiCareLogo size={30} showText={false} />
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Cơ sở Y học & Giới hạn Mô phỏng</span>
              </h2>
              <p className="text-[11px] text-teal-400 font-medium">
                RemiCare Clinical Knowledge Base (AAO BCSC)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#0c2635] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-sm text-slate-300 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Important Medical Disclaimer */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-medium">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span className="font-bold">Khuyến cáo Giáo dục Y học (Educational Approximation)</span>
            </div>
            <p className="text-xs text-amber-200/90 leading-relaxed">
              Trang web này là <strong>công cụ trực quan hóa mang tính giáo dục</strong>, KHÔNG PHẢI là mô phỏng chính xác tuyệt đối 100% cảm nhận của từng người bệnh cụ thể, và <strong>KHÔNG CÓ GIÁ TRỊ CHẨN ĐOÁN HOẶC ĐIỀU TRỊ Y KHOA</strong>.
            </p>
          </div>

          {/* Clinical Principles */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#00c4b4]" />
              <span>Tại sao trải nghiệm thị giác khác nhau giữa các giai đoạn?</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Theo tài liệu BCSC (Pediatric Ophthalmology and Strabismus) của Hiệp hội Nhãn khoa Hoa Kỳ (AAO) và giáo trình kinh điển của Gunter K. von Noorden:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <li className="p-3 bg-[#05131b] rounded-xl border border-[#0e3546]">
                <span className="font-semibold text-emerald-400 block mb-1">1. Lệch nhẹ / Lác ẩn (Phoria): Không Song thị</span>
                <span className="text-slate-400 leading-relaxed">Hệ thống dung hợp vận nhãn (Fusional Vergence) liên tục bù trừ cơ học để giữ ảnh trong vùng Panum. Do đó <strong>người bệnh nhìn thấy 1 ảnh đơn</strong>, chỉ cảm thấy mỏi mắt (Asthenopia).</span>
              </li>
              <li className="p-3 bg-[#05131b] rounded-xl border border-[#0e3546]">
                <span className="font-semibold text-amber-400 block mb-1">2. Mất bù (Decompensation): Chớm bóng ma</span>
                <span className="text-slate-400 leading-relaxed">Khi độ lệch vượt quá dự trữ dung hợp, ảnh trượt ra khỏi vùng Panum, bắt đầu xuất hiện hiện tượng chồng chéo thị giác (Visual Confusion) và bóng ma mờ không ổn định.</span>
              </li>
              <li className="p-3 bg-[#05131b] rounded-xl border border-[#0e3546]">
                <span className="font-semibold text-rose-400 block mb-1">3. Song thị Thực sự (Diplopia ở Người lớn)</span>
                <span className="text-slate-400 leading-relaxed">Khi mất hoàn toàn dung hợp và vỏ não không thể ức chế (lác mắc phải ở người lớn), người bệnh nhìn thấy <strong>hai hình ảnh tách biệt rõ rệt</strong> của cùng một vật thể.</span>
              </li>
              <li className="p-3 bg-[#05131b] rounded-xl border border-[#0e3546]">
                <span className="font-semibold text-[#00c4b4] block mb-1">4. Ức chế Vỏ não (Suppression ở Trẻ em)</span>
                <span className="text-slate-400 leading-relaxed">Vỏ não mềm dẻo của trẻ dập tắt tín hiệu từ mắt lệch để <strong>triệt tiêu song thị</strong>. Trẻ thấy 1 ảnh đơn bình thường nhưng mất thị giác 3D (Stereopsis) và có nguy cơ nhược thị.</span>
              </li>
            </ul>
          </div>

          {/* Diplopia Mechanics */}
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-100">
              Quy luật quang học của Song thị (Diplopia)
            </h3>
            <div className="space-y-1.5 text-xs text-slate-400 leading-relaxed">
              <p>
                <strong className="text-teal-300">Lác trong (Esotropia):</strong> Gây ra <em>Song thị đồng danh (Uncrossed Diplopia)</em> — ảnh từ mắt phải lệch thấy ở phía bên phải, ảnh mắt trái thấy ở phía bên trái do ảnh rơi vào vùng võng mạc phía mũi (nasal retina).
              </p>
              <p>
                <strong className="text-teal-300">Lác ngoài (Exotropia):</strong> Gây ra <em>Song thị chéo (Crossed Diplopia)</em> — ảnh từ mắt phải lệch thấy ở phía bên trái và ngược lại do ảnh rơi vào vùng võng mạc phía thái dương (temporal retina).
              </p>
            </div>
          </div>

          {/* Medical References */}
          <div className="space-y-2 pt-2 border-t border-[#0e3546]">
            <h3 className="font-semibold text-slate-100">Tài liệu tham khảo Y học Quốc tế</h3>
            <div className="space-y-2 text-xs">
              <a
                href="https://www.aao.org/education/bcsc"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 bg-[#05131b] hover:bg-[#092230] rounded-xl border border-[#0e3546] text-slate-300 hover:text-white transition-colors group"
              >
                <span>American Academy of Ophthalmology (AAO) — Pediatric Ophthalmology & Strabismus</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00c4b4]" />
              </a>

              <a
                href="https://eyewiki.org/Strabismus"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 bg-[#05131b] hover:bg-[#092230] rounded-xl border border-[#0e3546] text-slate-300 hover:text-white transition-colors group"
              >
                <span>EyeWiki (AAO) — Strabismus Evaluation & Sensory Adaptation</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00c4b4]" />
              </a>

              <a
                href="https://aapos.org/glossary/strabismus"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 bg-[#05131b] hover:bg-[#092230] rounded-xl border border-[#0e3546] text-slate-300 hover:text-white transition-colors group"
              >
                <span>American Association for Pediatric Ophthalmology and Strabismus (AAPOS)</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00c4b4]" />
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#05131b] border-t border-[#0e3546] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#00a896] hover:bg-[#009688] rounded-xl transition-all shadow-md cursor-pointer"
          >
            Đã hiểu & Tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
};
