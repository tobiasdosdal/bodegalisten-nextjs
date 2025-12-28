"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  isUpdateAvailable: boolean;
  isFullscreen: boolean;
  canShare: boolean;
  canShareFiles: boolean;
  hasPushPermission: boolean;
  hasNotificationPermission: boolean;
  displayMode: "browser" | "standalone" | "minimal-ui" | "fullscreen" | "window-controls-overlay";
}

interface PWACapabilities {
  backgroundSync: boolean;
  periodicSync: boolean;
  pushNotifications: boolean;
  badging: boolean;
  fileHandling: boolean;
  shareTarget: boolean;
  launchHandler: boolean;
  fullscreen: boolean;
}

interface UsePWAReturn extends PWAState {
  install: () => Promise<boolean>;
  update: () => void;
  share: (data: ShareData) => Promise<boolean>;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  setBadge: (count?: number) => Promise<void>;
  clearBadge: () => Promise<void>;
  queueBackgroundSync: (request: { url: string; method: string; body: string }) => void;
  registerPeriodicSync: (tag: string, minInterval: number) => Promise<boolean>;
  showNotification: (title: string, options?: NotificationOptions) => Promise<void>;
  enterFullscreen: () => Promise<boolean>;
  exitFullscreen: () => Promise<boolean>;
  toggleFullscreen: () => Promise<boolean>;
  capabilities: PWACapabilities;
}

export function usePWA(): UsePWAReturn {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOffline: false,
    isUpdateAvailable: false,
    isFullscreen: false,
    canShare: false,
    canShareFiles: false,
    hasPushPermission: false,
    hasNotificationPermission: false,
    displayMode: "browser",
  });

  const [capabilities] = useState<PWACapabilities>(() => ({
    backgroundSync: typeof window !== "undefined" && "SyncManager" in window,
    periodicSync: typeof window !== "undefined" && "PeriodicSyncManager" in window,
    pushNotifications: typeof window !== "undefined" && "PushManager" in window,
    badging: typeof navigator !== "undefined" && "setAppBadge" in navigator,
    fileHandling: typeof window !== "undefined" && "launchQueue" in window,
    shareTarget: typeof window !== "undefined" && "launchQueue" in window,
    launchHandler: true,
    fullscreen: typeof document !== "undefined" && "fullscreenEnabled" in document,
  }));

  const swRegistration = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Detect display mode
    const getDisplayMode = (): PWAState["displayMode"] => {
      if (window.matchMedia("(display-mode: window-controls-overlay)").matches) {
        return "window-controls-overlay";
      }
      if (window.matchMedia("(display-mode: fullscreen)").matches) {
        return "fullscreen";
      }
      if (window.matchMedia("(display-mode: standalone)").matches) {
        return "standalone";
      }
      if (window.matchMedia("(display-mode: minimal-ui)").matches) {
        return "minimal-ui";
      }
      if ((window.navigator as Navigator & { standalone?: boolean }).standalone === true) {
        return "standalone";
      }
      return "browser";
    };

    const displayMode = getDisplayMode();
    const isStandalone = displayMode !== "browser";

    // Check sharing capabilities
    const canShare = typeof navigator !== "undefined" && "share" in navigator;
    const canShareFiles = canShare && typeof navigator !== "undefined" && "canShare" in navigator;

    // Check notification permission
    const hasNotificationPermission =
      typeof Notification !== "undefined" && Notification.permission === "granted";

    // Check fullscreen state
    const isFullscreen = !!document.fullscreenElement;

    setState((prev) => ({
      ...prev,
      isInstalled: isStandalone,
      isOffline: !navigator.onLine,
      isFullscreen,
      canShare,
      canShareFiles,
      hasNotificationPermission,
      displayMode,
    }));

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setState((prev) => ({ ...prev, isInstallable: true }));
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setState((prev) => ({
        ...prev,
        isInstallable: false,
        isInstalled: true,
        displayMode: "standalone",
      }));
    };

    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOffline: false }));
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOffline: true }));
    };

    // Listen for display mode changes
    const displayModeMediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = () => {
      setState((prev) => ({ ...prev, displayMode: getDisplayMode() }));
    };

    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      setState((prev) => ({ ...prev, isFullscreen: !!document.fullscreenElement }));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    displayModeMediaQuery.addEventListener("change", handleDisplayModeChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // Service worker setup
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        swRegistration.current = registration;

        // Check push permission
        registration.pushManager?.getSubscription().then((subscription) => {
          setState((prev) => ({ ...prev, hasPushPermission: !!subscription }));
        });

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                setState((prev) => ({ ...prev, isUpdateAvailable: true }));
              }
            });
          }
        });
      });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      displayModeMediaQuery.removeEventListener("change", handleDisplayModeChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const install = useCallback(async (): Promise<boolean> => {
    if (!installPrompt) return false;

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === "accepted") {
      setInstallPrompt(null);
      setState((prev) => ({
        ...prev,
        isInstallable: false,
        isInstalled: true,
      }));
      return true;
    }

    return false;
  }, [installPrompt]);

  const update = useCallback(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.waiting?.postMessage({ type: "SKIP_WAITING" });
      });
      window.location.reload();
    }
  }, []);

  // Web Share API
  const share = useCallback(async (data: ShareData): Promise<boolean> => {
    if (!navigator.share) return false;

    try {
      // Check if we can share files
      if (data.files && navigator.canShare) {
        const canShareFiles = navigator.canShare({ files: data.files });
        if (!canShareFiles) {
          // Fall back to sharing without files
          const { files: _files, ...dataWithoutFiles } = data;
          await navigator.share(dataWithoutFiles);
          return true;
        }
      }

      await navigator.share(data);
      return true;
    } catch (error) {
      // User cancelled or share failed
      if ((error as Error).name !== "AbortError") {
        console.error("Share failed:", error);
      }
      return false;
    }
  }, []);

  // Notification permission
  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!("Notification" in window)) {
      return "denied";
    }

    const permission = await Notification.requestPermission();
    setState((prev) => ({ ...prev, hasNotificationPermission: permission === "granted" }));
    return permission;
  }, []);

  // Badging API
  const setBadge = useCallback(async (count?: number): Promise<void> => {
    if ("setAppBadge" in navigator) {
      try {
        if (count !== undefined) {
          await (navigator as Navigator & { setAppBadge: (count: number) => Promise<void> }).setAppBadge(count);
        } else {
          await (navigator as Navigator & { setAppBadge: () => Promise<void> }).setAppBadge();
        }
      } catch {
        // Badging not supported or failed
      }
    }

    // Also notify service worker
    if (swRegistration.current?.active) {
      swRegistration.current.active.postMessage({
        type: "SET_BADGE",
        count: count ?? 0,
      });
    }
  }, []);

  const clearBadge = useCallback(async (): Promise<void> => {
    if ("clearAppBadge" in navigator) {
      try {
        await (navigator as Navigator & { clearAppBadge: () => Promise<void> }).clearAppBadge();
      } catch {
        // Badging not supported or failed
      }
    }

    // Also notify service worker
    if (swRegistration.current?.active) {
      swRegistration.current.active.postMessage({ type: "CLEAR_BADGE" });
    }
  }, []);

  // Background Sync
  const queueBackgroundSync = useCallback(
    (request: { url: string; method: string; body: string }) => {
      if (swRegistration.current?.active) {
        swRegistration.current.active.postMessage({
          type: "QUEUE_REQUEST",
          request,
        });
      }
    },
    []
  );

  // Periodic Background Sync
  const registerPeriodicSync = useCallback(
    async (tag: string, minInterval: number): Promise<boolean> => {
      if (!swRegistration.current) return false;

      try {
        const periodicSyncManager = (
          swRegistration.current as ServiceWorkerRegistration & {
            periodicSync?: {
              register: (tag: string, options: { minInterval: number }) => Promise<void>;
            };
          }
        ).periodicSync;

        if (periodicSyncManager) {
          await periodicSyncManager.register(tag, { minInterval });
          return true;
        }
      } catch {
        // Periodic sync not supported or permission denied
      }
      return false;
    },
    []
  );

  // Show notification
  const showNotification = useCallback(
    async (title: string, options?: NotificationOptions): Promise<void> => {
      const defaultOptions = {
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        vibrate: [100, 50, 100],
        ...options,
      };

      if (swRegistration.current) {
        await swRegistration.current.showNotification(title, defaultOptions);
      } else if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, options);
      }
    },
    []
  );

  // Fullscreen API
  const enterFullscreen = useCallback(async (): Promise<boolean> => {
    try {
      if (document.fullscreenEnabled && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        return true;
      }
    } catch {
      // Fullscreen request failed
    }
    return false;
  }, []);

  const exitFullscreen = useCallback(async (): Promise<boolean> => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return true;
      }
    } catch {
      // Exit fullscreen failed
    }
    return false;
  }, []);

  const toggleFullscreen = useCallback(async (): Promise<boolean> => {
    if (document.fullscreenElement) {
      return exitFullscreen();
    }
    return enterFullscreen();
  }, [enterFullscreen, exitFullscreen]);

  return {
    ...state,
    install,
    update,
    share,
    requestNotificationPermission,
    setBadge,
    clearBadge,
    queueBackgroundSync,
    registerPeriodicSync,
    showNotification,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
    capabilities,
  };
}
