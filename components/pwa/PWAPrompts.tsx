"use client";

import { Download, RefreshCw, X, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWA } from "@/hooks/usePWA";
import { useState, useEffect } from "react";

export function InstallPrompt() {
  const { isInstallable, install } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem("pwa-install-dismissed");
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (isInstallable && !dismissed) {
      const timer = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(timer);
    }
    return;
  }, [isInstallable, dismissed]);

  if (!visible || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
    sessionStorage.setItem("pwa-install-dismissed", "true");
  };

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setVisible(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-amber-500/20 p-2">
            <Download className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">Installer Bodegalisten</h3>
            <p className="mt-1 text-sm text-slate-400">
              Få hurtig adgang fra din hjemmeskærm
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <Button
            onClick={handleInstall}
            size="sm"
            className="flex-1 bg-amber-600 hover:bg-amber-700"
          >
            Installer
          </Button>
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            Ikke nu
          </Button>
        </div>
      </div>
    </div>
  );
}

export function UpdatePrompt() {
  const { isUpdateAvailable, update } = usePWA();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isUpdateAvailable) {
      setVisible(true);
    }
  }, [isUpdateAvailable]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="rounded-lg border border-blue-700 bg-blue-950 p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-blue-500/20 p-2">
            <RefreshCw className="h-5 w-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">Ny version tilgængelig</h3>
            <p className="mt-1 text-sm text-blue-300">
              Opdater for at få de seneste funktioner
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button
            onClick={update}
            size="sm"
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Opdater nu
          </Button>
          <Button
            onClick={() => setVisible(false)}
            size="sm"
            variant="outline"
            className="flex-1 border-blue-700 text-blue-300 hover:bg-blue-900"
          >
            Senere
          </Button>
        </div>
      </div>
    </div>
  );
}

export function OfflineIndicator() {
  const { isOffline } = usePWA();

  if (!isOffline) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-50 bg-amber-600 px-4 py-2 text-center text-sm font-medium text-white">
      Du er offline - nogle funktioner er muligvis ikke tilgængelige
    </div>
  );
}

export function FullscreenToggle() {
  const { isFullscreen, toggleFullscreen, capabilities, isInstalled } = usePWA();

  // Only show in installed PWA mode and if fullscreen is supported
  if (!capabilities.fullscreen || !isInstalled) return null;

  return (
    <Button
      onClick={toggleFullscreen}
      size="icon"
      variant="ghost"
      className="fixed bottom-4 right-4 z-40 h-10 w-10 rounded-full bg-slate-800/80 text-white backdrop-blur-sm hover:bg-slate-700"
      title={isFullscreen ? "Afslut fuld skærm" : "Fuld skærm"}
    >
      {isFullscreen ? (
        <Minimize className="h-5 w-5" />
      ) : (
        <Maximize className="h-5 w-5" />
      )}
    </Button>
  );
}
