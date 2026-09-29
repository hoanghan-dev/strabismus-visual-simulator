import React, { useState } from 'react';
import { X, ExternalLink, ShieldAlert, BookOpen, Brain, Eye, FileText, CheckCircle2 } from 'lucide-react';
import { RemiCareLogo } from './RemiCareLogo';

interface MedicalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'principles' | 'branching' | 'evidence' | 'conclusions' | 'paradox';

export const MedicalModal: React.FC<MedicalModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('principles');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#071922] border border-[#113e52] rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#0e3546] bg-[#05131b]">
          <div className="flex items-center gap-3">
            <RemiCareLogo size={32} showText={false} />
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Cơ sở Y học & Bằng chứng Nghiên cứu Lâm sàng</span>
              </h2>
              <p className="text-[11px] text-teal-400 font-medium">
                Tổng hợp Nghiên cứu Sinh lý bệnh Lác, Rối loạn Thị giác Hai mắt & BCSC AAO
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-[#0e3546] bg-[#061822] overflow-x-auto no-scrollbar">
          {[
            { id: 'principles', label: '1. Sinh lý Thần kinh', icon: Brain },
            { id: 'branching', label: '2. Phân nhánh Tự nhiên', icon: Eye },
            { id: 'evidence', label: '3. Bảng Chứng cứ Y khoa', icon: FileText },
            { id: 'conclusions', label: '4. 10 Kết luận Khoa học', icon: CheckCircle2 },
            { id: 'paradox', label: '5. Nghịch lý Màn hình 2D', icon: ShieldAlert },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as TabType)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-[#00c4b4] text-[#00c4b4] bg-[#0a202c]/50'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#0a202c]/30'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 text-sm text-slate-300 max-h-[72vh] overflow-y-auto custom-scrollbar">
          {/* TAB 1: PRINCIPLES */}
          {activeTab === 'principles' && (
            <div className="space-y-4 text-xs leading-relaxed">
              <div className="p-4 bg-teal-950/20 border border-teal-500/30 rounded-2xl space-y-2">
                <span className="font-bold text-teal-300 text-sm block">
                  Bản chất Hình học & Thần kinh của Lác (Strabismus)
                </span>
                <p className="text-slate-300">
                  Lác là sự mất thẳng hàng của hai trục thị giác, phá vỡ điều kiện hình học để kích thích các điểm võng mạc tương ứng trên vòng <strong>Horopter</strong> và vượt quá <strong>vùng dung hợp Panum</strong>. Điều này triệt tiêu cơ chế hợp thị hai mắt và thị giác lập thể.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-[#05131b] rounded-2xl border border-[#0e3546] space-y-2">
                  <span className="font-bold text-amber-400 block text-xs">
                    1. Song thị hai mắt (Binocular Diplopia)
                  </span>
                  <p className="text-slate-300">
                    Một vật thể thành hai hình ảnh ở hai vị trí không gian. Do vật định thị rơi vào fovea mắt thẳng và rơi vào điểm võng mạc ngoại vi của mắt lệch.
                  </p>
                  <ul className="text-slate-400 pl-3 list-disc space-y-1 text-[11px]">
                    <li><strong>Lác trong (Esotropia):</strong> Song thị đồng chiều (Uncrossed) — ảnh phụ mắt phải nằm ở bên phải.</li>
                    <li><strong>Lác ngoài (Exotropia):</strong> Song thị bắt chéo (Crossed) — ảnh phụ mắt phải nằm ở bên trái.</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-[#05131b] rounded-2xl border border-[#0e3546] space-y-2">
                  <span className="font-bold text-rose-400 block text-xs">
                    2. Nhầm lẫn thị giác (Visual Confusion)
                  </span>
                  <p className="text-slate-300">
                    Hai vật thể KHÁC NHAU ngoài không gian bị chiếu chồng đè lên CÙNG MỘT TỌA ĐỘ TRUNG TÂM!
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Do fovea của hai mắt chia sẻ cùng một hướng thị giác chủ quan chính. Fovea mắt thẳng nhìn vật A, fovea mắt lệch nhìn vật B ➔ Não chiếu cả hai vật đè lên nhau gây choáng váng thị giác.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-[#05131b] rounded-2xl border border-[#0e3546] space-y-2">
                <span className="font-bold text-emerald-400 block text-xs">
                  3 cấp độ Thị giác Hai mắt theo Claud Worth
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2.5 bg-[#081e2a] rounded-xl border border-[#113e52]">
                    <strong className="text-teal-300 block mb-0.5">Cấp độ 1</strong>
                    <span>Cảm nhận đồng thời (Simultaneous perception) tín hiệu từ hai mắt.</span>
                  </div>
                  <div className="p-2.5 bg-[#081e2a] rounded-xl border border-[#113e52]">
                    <strong className="text-teal-300 block mb-0.5">Cấp độ 2</strong>
                    <span>Hợp thị cảm giác (Sensory fusion): vỏ não tích hợp hai ảnh thành một.</span>
                  </div>
                  <div className="p-2.5 bg-[#081e2a] rounded-xl border border-[#113e52]">
                    <strong className="text-teal-300 block mb-0.5">Cấp độ 3</strong>
                    <span>Thị giác lập thể (Stereopsis tinh tế &lt; 60 giây cung): cảm nhận chiều sâu 3D.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BRANCHING NATURAL HISTORY */}
          {activeTab === 'branching' && (
            <div className="space-y-4 text-xs leading-relaxed">
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-1.5">
                <span className="font-bold text-amber-300 block text-xs">
                  KHẲNG ĐỊNH QUAN TRỌNG: Không có "Hệ thống Phân kỳ Giai đoạn Tuyến tính Phổ quát"
                </span>
                <p className="text-slate-300 text-[11px]">
                  Y văn quốc tế không có mô hình tuyến tính bắt buộc (Nhẹ ➔ Vừa ➔ Nặng ➔ Song thị ➔ Nhược thị). Tiến triển của lác là <strong>Khung phân nhánh phụ thuộc độ tuổi khởi phát và tính mềm dẻo vỏ não</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-[#05131b] rounded-2xl border border-teal-500/40 space-y-2">
                  <span className="font-bold text-teal-300 block text-xs">
                    👶 Nhánh Khởi phát ở Trẻ nhỏ (&lt; 7-8 tuổi)
                  </span>
                  <p className="text-slate-300 text-[11px]">
                    Lệch trục kích hoạt song thị và nhầm lẫn thoáng qua. Tính mềm dẻo của vỏ não lập tức kích hoạt <strong>Ức chế vỏ não GABAergic tại diện V1</strong> (tạo Ám điểm fovea và Ám điểm ngoại vi).
                  </p>
                  <ul className="text-slate-400 pl-3 list-disc space-y-1 text-[11px]">
                    <li>Song thị bị triệt tiêu hoàn toàn.</li>
                    <li>Nếu lác luân phiên tự do: <strong>Thị lực 20/20 được bảo tồn cả hai mắt (KHÔNG nhược thị)</strong>.</li>
                    <li>Nếu lác cố định 1 mắt kéo dài: Ức chế liên tục dẫn đến <strong>Nhược thị do lác (Amblyopia)</strong>.</li>
                  </ul>
                </div>

                <div className="p-4 bg-[#05131b] rounded-2xl border border-rose-500/40 space-y-2">
                  <span className="font-bold text-rose-300 block text-xs">
                    🧑 Nhánh Khởi phát ở Người trưởng thành
                  </span>
                  <p className="text-slate-300 text-[11px]">
                    Lệch trục do liệt dây thần kinh (III, IV, VI), chấn thương hoặc bệnh tuyến giáp. Vỏ não đã trơ cứng và cố định, không thể hình thành ám điểm ức chế.
                  </p>
                  <ul className="text-slate-400 pl-3 list-disc space-y-1 text-[11px]">
                    <li><strong>Song thị và Nhầm lẫn thị giác liên tục</strong>, gây choáng váng.</li>
                    <li>Suy giảm nặng nề chất lượng cuộc sống (thang đo AS-20): khó đọc, dễ té ngã.</li>
                    <li><strong>KHÔNG BAO GIỜ bị nhược thị:</strong> Thị lực từng mắt khi che mắt kia được bảo tồn 100%.</li>
                  </ul>
                </div>
              </div>

              <div className="p-3.5 bg-[#05131b] rounded-2xl border border-[#0e3546] space-y-1.5">
                <span className="font-bold text-sky-300 block text-xs">
                  Mô hình Lác ngoài Luân phiên (Intermittent Exotropia - IXT)
                </span>
                <p className="text-slate-300 text-[11px]">
                  Bệnh nhân trải nghiệm 2 trạng thái thị giác luân phiên: <strong>Pha lác ẩn (Phoric phase)</strong> giữ ảnh đơn sắc nét nhờ lực quy tụ hợp thị; khi mệt mỏi hoặc dưới ánh nắng chói (quá tải võng mạc ngoại vi) sẽ chuyển sang <strong>Pha lác hiện (Tropic phase)</strong> trôi nhãn cầu ra ngoài. Thang điểm Newcastle Control Score (NCS ≥ 4) là chỉ định phẫu thuật.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: EVIDENCE TABLE */}
          {activeTab === 'evidence' && (
            <div className="space-y-3 text-xs leading-relaxed">
              <span className="font-bold text-slate-200 block">
                Bảng Tổng Hợp Chứng Cứ Khoa Học (Evidence Synthesis Table)
              </span>

              <div className="overflow-x-auto no-scrollbar border border-[#0e3546] rounded-2xl">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-[#05131b] text-teal-300 font-bold border-b border-[#0e3546]">
                    <tr>
                      <th className="p-2.5">Hiện tượng</th>
                      <th className="p-2.5">Cấp độ</th>
                      <th className="p-2.5">Nghiên cứu / Năm</th>
                      <th className="p-2.5">Kết quả cốt lõi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#0e3546]/60 text-slate-300">
                    <tr className="hover:bg-[#0a202c]/50">
                      <td className="p-2.5 font-semibold text-amber-300">Song thị & Nhầm lẫn</td>
                      <td className="p-2.5"><span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">ESTABLISHED</span></td>
                      <td className="p-2.5 font-mono text-[10px]">Peli & Satgunam (2014)</td>
                      <td className="p-2.5">Song thị và nhầm lẫn thị giác xuất hiện đồng thời khi lệch trục kích thích các điểm không tương ứng.</td>
                    </tr>
                    <tr className="hover:bg-[#0a202c]/50">
                      <td className="p-2.5 font-semibold text-rose-300">Chất lượng sống AS-20</td>
                      <td className="p-2.5"><span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">ESTABLISHED</span></td>
                      <td className="p-2.5 font-mono text-[10px]">Hatt, Holmes et al. (2009)</td>
                      <td className="p-2.5">n=181 người lớn. Lác làm suy giảm nặng nề khả năng đọc sách, tri giác chiều sâu và tâm lý xã hội.</td>
                    </tr>
                    <tr className="hover:bg-[#0a202c]/50">
                      <td className="p-2.5 font-semibold text-teal-300">Ức chế GABAergic V1</td>
                      <td className="p-2.5"><span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px]">SUPPORTED</span></td>
                      <td className="p-2.5 font-mono text-[10px]">Sengpiel et al. (2022)</td>
                      <td className="p-2.5">Ức chế thị giác là quá trình vỏ não điều hòa bởi nồng độ GABA tại diện V1, tương quan với độ sâu nhược thị.</td>
                    </tr>
                    <tr className="hover:bg-[#0a202c]/50">
                      <td className="p-2.5 font-semibold text-emerald-300">Bảo tồn chuyển động MT/V5</td>
                      <td className="p-2.5"><span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px]">SUPPORTED</span></td>
                      <td className="p-2.5 font-mono text-[10px]">Mansouri & Hess (2021)</td>
                      <td className="p-2.5">Tích hợp chuyển động từ mắt bị ức chế đạt 31.2% - 100%. Chứng minh não không tắt hoàn toàn một mắt.</td>
                    </tr>
                    <tr className="hover:bg-[#0a202c]/50">
                      <td className="p-2.5 font-semibold text-sky-300">Lác luân phiên ≠ Nhược thị</td>
                      <td className="p-2.5"><span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">ESTABLISHED</span></td>
                      <td className="p-2.5 font-mono text-[10px]">Adams et al. (2021)</td>
                      <td className="p-2.5">Động vật linh trưởng lác luân phiên duy trì độ nhạy tương phản và thị lực bình thường ở cả 2 mắt.</td>
                    </tr>
                    <tr className="hover:bg-[#0a202c]/50">
                      <td className="p-2.5 font-semibold text-amber-300">Thang Newcastle NCS</td>
                      <td className="p-2.5"><span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">ESTABLISHED</span></td>
                      <td className="p-2.5 font-mono text-[10px]">Haggerty & Clarke (2007)</td>
                      <td className="p-2.5">n=272 trẻ em. Điểm NCS ≥ 4 dự báo chỉ định phẫu thuật với tỷ suất chênh OR 29.3.</td>
                    </tr>
                    <tr className="hover:bg-[#0a202c]/50">
                      <td className="p-2.5 font-semibold text-teal-300">Tiến triển tự nhiên IXT</td>
                      <td className="p-2.5"><span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">ESTABLISHED</span></td>
                      <td className="p-2.5 font-mono text-[10px]">PEDIG Group (2014-2015)</td>
                      <td className="p-2.5">n=577 trẻ em. Tỷ lệ suy thoái thành lác thường xuyên sau 6 tháng rất thấp, không bắt buộc xấu đi ở mọi ca.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CONCLUSIONS */}
          {activeTab === 'conclusions' && (
            <div className="space-y-2.5 text-xs leading-relaxed">
              <span className="font-bold text-slate-200 block text-sm">
                10 Kết Luận Khoa Học Cốt Lõi (Final Scientific Conclusions)
              </span>

              <div className="space-y-2">
                {[
                  { q: '1. Lác là gì?', a: 'Rối loạn chức năng vận nhãn biểu hiện bởi sự sai lệch vị trí tương đối giữa hai trục thị giác, phá vỡ cơ chế hợp thị hai mắt và thị giác lập thể 3D.' },
                  { q: '2. Vì sao hai mắt lệch nhau tạo ra 2 hình?', a: 'Do mỗi điểm võng mạc có hướng thị giác chủ quan cố định. Fovea chiếu thẳng, ngoại vi chiếu lệch. Cùng 1 vật rơi vào 2 điểm khác nhau buộc não chiếu ra 2 vị trí không gian.' },
                  { q: '3. Vì sao người lớn nhìn đôi còn trẻ em không?', a: 'Trẻ em (< 7-8 tuổi) có vỏ não mềm dẻo kích hoạt ức chế vỏ não dập tắt ảnh phụ; Người lớn vỏ não đã cố định không thể ức chế nên bị song thị liên tục.' },
                  { q: '4. Cơ chế của Ức chế (Suppression) là gì?', a: 'Ức chế tích cực tại vỏ thị giác sơ cấp V1 qua trung gian mạng nơ-ron GABAergic, làm suy giảm đáp ứng đối với fovea và võng mạc mắt lệch.' },
                  { q: '5. Ức chế có phải là "não tắt một mắt" không?', a: 'Tuyệt đối KHÔNG. Ức chế chỉ mang tính cục bộ (ám điểm). Mắt lệch vẫn đóng góp trường nhìn ngoại vi và xử lý chuyển động (MT/V5 đạt 31.2% - 100%).' },
                  { q: '6. Mối quan hệ giữa Lác và Nhược thị?', a: 'Là hai thực thể tách biệt! Lác luân phiên không gây nhược thị (thị lực 2 mắt 20/20). Lác chỉ gây nhược thị khi lệch trục liên tục 1 mắt duy nhất ở trẻ nhỏ.' },
                  { q: '7. Có hệ thống phân giai đoạn tuyến tính chuẩn không?', a: 'KHÔNG CÓ hệ thống phân kỳ giai đoạn tuyến tính phổ quát duy nhất. Diễn tiến phân nhánh theo tuổi khởi phát, căn nguyên và khả năng bù trừ.' },
                  { q: '8. Những thay đổi thị giác có bằng chứng mạnh?', a: 'Song thị hai mắt, Nhầm lẫn thị giác, Ám điểm ức chế cục bộ, Mất stereopsis tinh tế, Nhược thị do lác cố định, Mỏi mắt kiệt quệ cơ học.' },
                  { q: '9. Webcam máy tính làm được gì?', a: 'Đo độ lệch đồng tử và phản xạ Hirschberg để sàng lọc nguy cơ lệch trục từ xa; KHÔNG THỂ đo đạc nhận thức cảm giác nội tại (song thị, ức chế).' },
                  { q: '10. Những hiệu ứng TUYỆT ĐỐI TRÁNH khi mô phỏng?', a: 'Không làm tối đen màn hình để biểu diễn ức chế; Không dùng Gaussian blur đơn thuần để mô phỏng nhược thị; Không gắn góc lệch lớn với độ nhòe hình ảnh.' },
                ].map((item, i) => (
                  <div key={i} className="p-2.5 bg-[#05131b] rounded-xl border border-[#0e3546] space-y-1">
                    <strong className="text-teal-300 block font-semibold">{item.q}</strong>
                    <p className="text-slate-300 text-[11px]">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: MONOCULAR SCREEN PARADOX */}
          {activeTab === 'paradox' && (
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Nghịch Lý Màn Hình Đơn Mắt (The Monocular Screen Paradox)</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  Rào cản vật lý lớn nhất của mô phỏng web thông thường là việc hiển thị trên <strong>một màn hình phẳng 2D được quan sát bởi cả hai mắt bình thường của người dùng</strong>.
                </p>
                <p className="text-slate-300 leading-relaxed text-xs">
                  Khi phần mềm vẽ hai hình ảnh lệch nhau lên màn hình để minh họa song thị, cả hai mắt của người xem đều tiếp nhận đồng thời cả hai hình ảnh đó. Đây thực chất là tạo ra một bức tranh chứa hai vật thể, hoàn toàn không kích hoạt cơ chế song thị hai mắt sinh lý trong vỏ não.
                </p>
                <p className="text-amber-200/90 font-medium text-xs">
                  ➔ Các hiệu ứng song thị, nhầm lẫn thị giác và ức chế trên màn hình 2D chỉ là <strong>Xấp xỉ nhận thức (Cognitive Approximations)</strong> nhằm mục đích giáo dục cộng đồng. Để tái tạo chuẩn xác về thần kinh, bắt buộc phải dùng kính VR phân ly hai mắt (dichoptic display).
                </p>
              </div>

              <div className="p-3.5 bg-[#05131b] rounded-2xl border border-[#0e3546] space-y-2 text-[11px]">
                <span className="font-bold text-teal-300 block text-xs">Tài liệu Y học & Trích dẫn Quốc tế</span>
                <div className="space-y-1.5">
                  <a
                    href="https://www.aao.org/education/bcsc"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 bg-[#081e2a] hover:bg-[#0c2f42] rounded-xl border border-[#113e52] text-slate-300 hover:text-white transition-colors group"
                  >
                    <span>American Academy of Ophthalmology (AAO) — Pediatric Ophthalmology & Strabismus (BCSC)</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00c4b4]" />
                  </a>
                  <a
                    href="https://eyewiki.org/Strabismus"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 bg-[#081e2a] hover:bg-[#0c2f42] rounded-xl border border-[#113e52] text-slate-300 hover:text-white transition-colors group"
                  >
                    <span>EyeWiki (AAO) — Strabismus Evaluation & Sensory Adaptation</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00c4b4]" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#05131b] border-t border-[#0e3546] flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            RemiCare Scientific Knowledge Engine · Phục vụ Giáo dục Y khoa
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#00a896] hover:bg-[#009688] rounded-xl transition-all shadow-md cursor-pointer"
          >
            Đã hiểu & Tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
};

