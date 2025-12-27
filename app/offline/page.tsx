"use client";

import { WifiOff, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 px-4">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-slate-800 p-6">
            <WifiOff className="h-16 w-16 text-amber-500" />
          </div>
        </div>

        <h1 className="mb-4 text-3xl font-bold text-white">
          Du er offline
        </h1>

        <p className="mb-8 max-w-md text-slate-400">
          Det ser ud til, at du ikke har forbindelse til internettet. 
          Tjek din forbindelse og prøv igen.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button
            onClick={handleRetry}
            className="gap-2 bg-amber-600 hover:bg-amber-700"
          >
            <RefreshCw className="h-4 w-4" />
            Prøv igen
          </Button>

          <Link href="/">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Home className="h-4 w-4" />
              Gå til forsiden
            </Button>
          </Link>
        </div>
      </div>

      <p className="absolute bottom-8 text-sm text-slate-500">
        Bodegalisten fungerer bedst med en internetforbindelse
      </p>
    </div>
  );
}
