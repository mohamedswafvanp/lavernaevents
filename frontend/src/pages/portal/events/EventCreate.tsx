import { useIsDesktop } from "@/hooks/useMediaQuery";
import EventFormDesktop from "@/components/events/desktop/EventFormDesktop";
import EventFormMobile from "@/components/events/mobile/EventFormMobile";

export default function EventCreate() {
  const isDesktop = useIsDesktop();

  return isDesktop ? <EventFormDesktop /> : <EventFormMobile />;
}
