import { useIsDesktop } from "@/hooks/useMediaQuery";
import VerifyMobileFormDesktop from "@/components/auth/desktop/VerifyMobileFormDesktop";
import VerifyMobileFormMobile from "@/components/auth/mobile/VerifyMobileFormMobile";

export default function VerifyMobile() {
  const isDesktop = useIsDesktop();

  return isDesktop ? <VerifyMobileFormDesktop /> : <VerifyMobileFormMobile />;
}
