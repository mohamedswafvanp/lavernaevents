import { useIsDesktop } from "@/hooks/useMediaQuery";
import RegisterFormDesktop from "@/components/auth/desktop/RegisterFormDesktop";
import RegisterFormMobile from "@/components/auth/mobile/RegisterFormMobile";

export default function Register() {
  const isDesktop = useIsDesktop();

  return isDesktop ? <RegisterFormDesktop /> : <RegisterFormMobile />;
}
