'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function AboutPage() {
  const [showEvidence, setShowEvidence] = useState(false);
  const [showOriginalGreek, setShowOriginalGreek] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-[#F3EEEA]">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Title Section */}
          <div className="p-8 md:p-12 pb-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-slate-900 font-cinzel">
                Credo Verum
              </h1>
              <p className="text-lg text-slate-600 italic">
                Latin for "I believe the truth"
              </p>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <blockquote className="text-base text-slate-700 italic">
                  {showOriginalGreek
                    ? "ΕΓΩ ΕΙ ΜΙ Η Ο ΔΟC ΚΑΙ Η ΑΛΗΘΕΙΑ ΚΑΙ Η ΖΩΗ"
                    : '"I am the way, and the truth, and the life."'}
                </blockquote>
                <p className="mt-1 text-sm text-slate-600">
                  — John 14:6
                </p>

                {/* Evidence Toggle Buttons */}
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEvidence(!showEvidence)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#776b5d] hover:bg-[#5d5449] text-sm font-semibold text-white transition-colors"
                  >
                    <span>📜</span>
                    {showEvidence ? 'Hide Evidence' : 'Show Evidence'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowOriginalGreek(!showOriginalGreek)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 text-sm font-semibold text-white transition-colors"
                  >
                    <span>{showOriginalGreek ? '🇬🇧' : '🇬🇷'}</span>
                    {showOriginalGreek ? 'View English' : 'View Original Greek'}
                  </button>
                </div>

                {/* Evidence Section */}
                {showEvidence && (
                  <div className="mt-6 rounded-2xl border border-slate-300 bg-slate-50 p-4">
                    <p className="text-xs font-semibold tracking-[0.18em] uppercase text-slate-600 mb-3">
                      Manuscript Witness
                    </p>

                    <button
                      type="button"
                      onClick={() => setFullscreenImage('/evidence/Vat.gr.1209_1375_pa_1371_m.jpg')}
                      className="group block w-full text-left hover:opacity-90 transition-opacity"
                    >
                      <div className="overflow-hidden rounded-xl border border-slate-300 cursor-pointer">
                        <img
                          src="/evidence/Vat.gr.1209_1375_pa_1371_m.jpg"
                          alt="John 14:6 manuscript from Vatican Library"
                          className="w-full max-h-72 object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-600 text-center">
                        Codex Vaticanus Graecus 1209, page 1371, Vatican Library (4th century) – click to view full folio
                      </p>
                    </button>

                    <div className="mt-3 flex justify-center">
                      <a
                        href="https://digi.vatlib.it/view/MSS_Vat.gr.1209"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-sm font-semibold text-amber-800 transition-colors"
                      >
                        <span>📜</span>
                        View Digitized Manuscript
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="flex justify-center px-8 pb-8 bg-gradient-to-b from-white to-slate-50">
            <div className="relative w-full max-w-md aspect-square">
              <Image
                src="/Agnus-Dei-Full.png"
                alt="Agnus Dei - Lamb of God"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="p-8 md:p-12 pt-6 space-y-6">

            <div className="border-t border-slate-200 pt-6">
              <p className="text-base text-slate-700 leading-relaxed">
                A historical case for Jesus Christ, presenting evidence from Roman, Jewish, and Christian sources that document the life, death, and impact of Jesus of Nazareth.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-slate-600 mb-3">
                Our Mission
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                To provide a comprehensive, academically rigorous examination of historical evidence for Jesus Christ, making primary sources and scholarly analysis accessible to all who seek the truth.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-slate-600 mb-3">
                Statement of Faith
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                Credo Verum is shaped by the Catholic understanding of Christianity and holds that the Catholic Church preserves the fullness of the faith handed down from the earliest Christians. The evidence presented invites everyone from all backgrounds to examine the sources and draw their conclusions.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-slate-600 mb-3">
                A Word to Fellow Christians
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                To our Protestant brothers and sisters in Christ we invite you to consider the fullness of the faith as it was received, preserved, and handed on from the apostles. Christ did not leave us a book alone, but a Church—founded on the apostles and entrusted with teaching, sanctifying, and governing in His name. Our aim is not division, but unity in truth. We encourage all Christians to prayerfully examine the historical and apostolic foundations of the Church Christ established, and to submit fully to Jesus Christ and the authority He gave to His Church.
              </p>
            </div>

            <div className="border-l-4 border-[#776b5d] bg-slate-50 rounded-r-xl p-6">
              <blockquote className="text-base text-slate-700 italic leading-relaxed">
                "Go therefore and make disciples of all nations…"
              </blockquote>
              <p className="mt-2 text-sm text-slate-600">
                — Matthew 28:19
              </p>
              <p className="mt-4 text-sm text-slate-700">
                We seek to carry out this mission as our Lord instructed.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white hover:text-slate-300 text-2xl font-bold z-10"
            onClick={() => setFullscreenImage(null)}
            aria-label="Close fullscreen image"
          >
            ×
          </button>
          <div className="max-w-4xl max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={fullscreenImage}
              alt="Fullscreen manuscript view"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </main>
  );
}
