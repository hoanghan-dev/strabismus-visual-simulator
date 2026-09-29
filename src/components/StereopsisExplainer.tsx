import React, { useState } from 'react';
import { Eye, Layers, Box, Check, AlertCircle } from 'lucide-react';

export const StereopsisExplainer: React.FC = () => {
  const [mode, setMode] = useState<'normal' | 'strabismus'>('normal');

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-slate-100">
            Khái niệm Thị giác Lập thể & Cảm nhận Chiều sâu (Stereopsis)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Mô phỏng hình học minh họa cách não bộ hợp nhất hai góc nhìn hơi khác nhau để tái hiện không gian 3 chiều.
          </p>
        </div>

        {/* Toggle Mode */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/70 border border-slate-800 rounded-lg shrink-0">
          <button
            onClick={() => setMode('normal')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'normal'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Thị giác bình thường
          </button>
          <button
            onClick={() => setMode('strabismus')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'strabismus'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mắt lệch trục
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Visual Schematic Diagram */}
        <div className="relative aspect-4/3 max-h-[260px] bg-slate-950 rounded-xl border border-slate-800/90 flex items-center justify-center p-4 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 400 240">
            {/* Target Object in 3D Space */}
            <circle cx="200" cy="45" r="14" fill="#38bdf8" className="transition-all" />
            <text x="200" y="24" fill="#94a3b8" fontSize="11" textAnchor="middle">
              Vật thể quan sát
            </text>

            {/* Left Eye */}
            <circle cx="120" cy="200" r="12" fill="#0284c7" />
            <text x="120" y="226" fill="#64748b" fontSize="10" textAnchor="middle">
              Mắt Trái (OS)
            </text>

            {/* Right Eye */}
            <circle
              cx="280"
              cy="200"
              r="12"
              fill={mode === 'normal' ? '#0284c7' : '#f43f5e'}
            />
            <text x="280" y="226" fill="#64748b" fontSize="10" textAnchor="middle">
              {mode === 'normal' ? 'Mắt Phải (OD)' : 'Mắt Phải (Lệch)'}
            </text>

            {/* Left Line of Sight */}
            <line
              x1="120"
              y1="190"
              x2="195"
              y2="55"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="4 3"
            />

            {/* Right Line of Sight */}
            {mode === 'normal' ? (
              <line
                x1="280"
                y1="190"
                x2="205"
                y2="55"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="4 3"
                className="transition-all"
              />
            ) : (
              <line
                x1="280"
                y1="190"
                x2="245"
                y2="60"
                stroke="#f43f5e"
                strokeWidth="2"
                strokeDasharray="4 3"
                className="transition-all"
              />
            )}

            {/* Convergence point / Disparity Zone */}
            {mode === 'normal' ? (
              <circle
                cx="200"
                cy="50"
                r="22"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="1.5"
                opacity="0.6"
              />
            ) : (
              <g>
                <circle
                  cx="245"
                  cy="60"
                  r="10"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                />
                <text x="255" y="80" fill="#f43f5e" fontSize="10">
                  Lệch tiêu điểm
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Narrative & Scientific Explanation */}
        <div className="space-y-3">
          {mode === 'normal' ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-medium text-xs">
                <Check className="w-4 h-4" />
                <span>Thị giác Lập thể Hoàn Chỉnh (Stereopsis Đạt Chuẩn)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Hai mắt cách nhau khoảng 60–65mm (khoảng cách đồng tử), do đó mỗi mắt ghi nhận một góc nhìn hơi khác nhau về cùng một vật thể. Vỏ não phân tích độ lệch thị sai võng mạc (retinal disparity) để tái dựng chính xác cảm nhận chiều sâu, khoảng cách và tính lập thể 3D.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-medium text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>Mất Hoặc Suy Giảm Thị Giác Lập Thể</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Khi một mắt lệch trục, hai hoàng điểm không cùng hướng về một điểm trong không gian. Não không còn nhận được các tín hiệu thị sai tương ứng để dung hợp. Thay vào đó, người bị lác phải dựa chủ yếu vào các manh mối đơn nhãn (monocular cues) như phối cảnh, kích thước tương đối và bóng đổ để phán đoán khoảng cách.
              </p>
            </div>
          )}

          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg text-[11px] text-slate-400">
            ℹ️ <strong>Lưu ý giáo dục:</strong> Đây là mô hình hình học minh họa khái niệm quang học. Webcam không thể dùng để tự kiểm tra hay đo lường độ nhạy lập thể lâm sàng (Titmus fly hay TNO test).
          </div>
        </div>
      </div>
    </div>
  );
};
