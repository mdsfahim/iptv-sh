"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const WorldCupPopup = dynamic(() => import("./WorldCupPopup"), {
  ssr: false,
});

interface ClientPopupWrapperProps {
  showPopup: boolean;
}

export default function ClientPopupWrapper({ showPopup }: ClientPopupWrapperProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!showPopup) return;

    // Only render the component if not dismissed in the session
    const isDismissed = sessionStorage.getItem("dismissed_world_cup_popup_2026");
    if (isDismissed !== "true") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldRender(true);
    }
  }, [showPopup]);

  if (!shouldRender) return null;

  return <WorldCupPopup showPopup={showPopup} />;
}
