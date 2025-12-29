'use client';

import Image from 'next/image';

export default function AboutPage() {
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
                  "I am the way, and the truth, and the life."
                </blockquote>
                <p className="mt-1 text-sm text-slate-600">
                  — John 14:6
                </p>
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
    </main>
  );
}
