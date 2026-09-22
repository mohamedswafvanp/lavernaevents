import { useIsDesktop } from "@/hooks/useMediaQuery";
import EventListDesktop from "@/components/events/desktop/EventListDesktop";
import EventListMobile from "@/components/events/mobile/EventListMobile";

export default function EventsList() {
  const isDesktop = useIsDesktop();

  return isDesktop ? <EventListDesktop /> : <EventListMobile />;
}
