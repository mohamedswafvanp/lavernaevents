import { useIsDesktop } from "@/hooks/useMediaQuery";
import PricingGridDesktop from "@/components/membership/desktop/PricingGridDesktop";
import PricingGridMobile from "@/components/membership/mobile/PricingGridMobile";

export default function Pricing() {
  const isDesktop = useIsDesktop();

  return isDesktop ? <PricingGridDesktop /> : <PricingGridMobile />;
}
