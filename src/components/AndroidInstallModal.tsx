import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Layers,
  Terminal,
  HelpCircle,
  Share2,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { APP_ICON_PATH } from './HeaderLogo';

interface AndroidInstallModalProps {
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, install, isAndroid } = usePWAInstall();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activeTab, setActiveTab] = useState<'direct' | 'apk' | 'cli'>('direct');

  // The current app URL
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://whatsup-web.app';
  // Microsoft PWABuilder prefilled URL
  const pwaBuilderUrl = `https://www.pwabuilder.com?url=${encodeURIComponent(appUrl)}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadAndroidBundle = () => {
    const configData = {
      app_name: "What's up",
      short_name: "What's up",
      package_id: "com.whatsup.webchat",
      version: "1.0.0",
      version_code: 1,
      start_url: appUrl,
      theme_color: "#111b21",
      background_color: "#111b21",
      icon_url: `${appUrl}${APP_ICON_PATH}`,
      display_mode: "standalone",
      instructions: [
        "To compile into a signed APK for Android:",
        "1. Open https://www.pwabuilder.com and input this app's URL:",
        `   ${appUrl}`,
        "2. Click 'Package for Stores' -> Choose 'Android'",
        "3. Download the signed APK directly to your phone and install!",
        "Alternatively, use Google's official Bubblewrap CLI:",
        "   npm install -g @bubblewrap/cli",
        `   bubblewrap init --manifest="${appUrl}/manifest.webmanifest"`,
        "   bubblewrap build"
      ]
    };

    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "whatsup-android-apk-bundle.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#202c33] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#111b21] border-b border-[#2a3942]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-white/10 shrink-0 bg-[#0f172a]">
              <img src={APP_ICON_PATH} alt="What's up" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white leading-tight">Android App & APK</h3>
              <p className="text-xs text-[#00a884] font-medium">Install on your phone or generate APK</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#2a3942] bg-[#182229] px-4 pt-2">
          <button
            onClick={() => setActiveTab('direct')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'direct'
                ? 'border-[#00a884] text-[#00a884]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone size={15} />
            Direct Install (Instant)
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'apk'
                ? 'border-[#00a884] text-[#00a884]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download size={15} />
            Build / Download APK
          </button>
          <button
            onClick={() => setActiveTab('cli')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'cli'
                ? 'border-[#00a884] text-[#00a884]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal size={15} />
            Developer / CLI
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {activeTab === 'direct' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#111b21] border border-[#2a3942] space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#00a884]/20 text-[#00a884]">
                    <Smartphone size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Direct Android WebAPK Installation</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Android natively turns this application into a dedicated Android app on your home screen with no URL bar, custom waving hand icon, offline support, and full screen experience.
                    </p>
                  </div>
                </div>

                {isInstalled ? (
                  <div className="p-3 rounded-lg bg-[#00a884]/15 border border-[#00a884]/30 flex items-center gap-2 text-xs text-[#00a884] font-medium">
                    <Check size={16} />
                    <span>App is already running as an installed standalone application!</span>
                  </div>
                ) : isInstallable ? (
                  <button
                    onClick={async () => {
                      const success = await install();
                      if (success) onClose();
                    }}
                    className="w-full py-3 rounded-xl bg-[#00a884] hover:bg-[#008f6f] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00a884]/25 transition-all"
                  >
                    <Download size={18} />
                    Install "What's up" on this Device Now
                  </button>
                ) : (
                  <div className="text-xs text-slate-300 space-y-2 pt-1 border-t border-[#2a3942]">
                    <p className="font-medium text-slate-200">How to install on Android Chrome / Samsung Internet:</p>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                      <li>Tap the three dots menu (<strong>⋮</strong>) in the top-right corner of your browser.</li>
                      <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                      <li>Tap <strong>Install</strong>. Android will create the native APK app on your device!</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Share URL to phone */}
              <div className="p-3.5 rounded-xl bg-[#111b21]/70 border border-[#2a3942] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Share2 size={14} className="text-[#00a884]" />
                    Open on your Android phone
                  </span>
                  <button
                    onClick={handleCopyUrl}
                    className="text-xs text-[#00a884] hover:underline flex items-center gap-1 font-medium"
                  >
                    {copiedUrl ? (
                      <>
                        <Check size={13} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={13} /> Copy Link
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-[#0b141a] px-3 py-2 rounded-lg text-xs font-mono text-slate-300 truncate select-all border border-white/5">
                  {appUrl}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#111b21] border border-[#2a3942] space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                    <Download size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Generate Signed Android APK (Free)</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Use Microsoft PWABuilder (the industry standard official builder) to instantly compile this app's PWA Manifest into a signed `.apk` file for direct installation on Android or Google Play.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={pwaBuilderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#00a884] hover:bg-[#008f6f] text-white font-medium text-xs flex items-center justify-center gap-2 shadow-md transition-all text-center"
                  >
                    <ExternalLink size={16} />
                    Open 1-Click APK Generator (PWABuilder)
                  </a>

                  <button
                    onClick={handleDownloadAndroidBundle}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#2a3942] hover:bg-[#32424b] text-slate-200 font-medium text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <Download size={15} />
                    Download Android Package & Manifest Bundle (.json)
                  </button>
                </div>
              </div>

              {/* 3 Step Guide */}
              <div className="p-3.5 rounded-xl bg-[#111b21]/70 border border-[#2a3942] space-y-2 text-xs text-slate-300">
                <p className="font-semibold text-white">3 Simple Steps to your .apk file:</p>
                <div className="space-y-1.5 text-slate-400">
                  <p>1. Click the button above to open PWABuilder with this app's prefilled URL.</p>
                  <p>2. Click <strong>Package for Stores</strong> and choose <strong>Android</strong>.</p>
                  <p>3. Download the compiled <strong>.apk</strong> or signed package directly to your phone!</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cli' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#111b21] border border-[#2a3942] space-y-3">
                <div className="flex items-center gap-2 text-slate-200 font-medium text-xs">
                  <Terminal size={16} className="text-[#00a884]" />
                  <span>Build APK using Google Bubblewrap CLI</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Google's official CLI tool packages any PWA into a production-grade Android APK or Android App Bundle (AAB):
                </p>
                <div className="bg-[#0b141a] p-3 rounded-lg text-[11px] font-mono text-emerald-400 space-y-1 border border-white/5 overflow-x-auto">
                  <p className="text-slate-500"># 1. Install Bubblewrap CLI</p>
                  <p>npm install -g @bubblewrap/cli</p>
                  <p className="text-slate-500 pt-1"># 2. Initialize Android project from Manifest</p>
                  <p>bubblewrap init --manifest="{appUrl}/manifest.webmanifest"</p>
                  <p className="text-slate-500 pt-1"># 3. Build signed APK</p>
                  <p>bubblewrap build</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#111b21]/70 border border-[#2a3942] text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#00a884] shrink-0" />
                <span>The generated APK includes the waving hand app icon, offline capabilities, and zero browser chrome.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#111b21] border-t border-[#2a3942] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-[#00a884] inline-block animate-pulse" />
            <span>PWA & Android WebAPK Ready</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#2a3942] hover:bg-[#32424b] text-white text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
