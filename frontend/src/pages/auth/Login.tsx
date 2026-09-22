import { useIsDesktop } from "@/hooks/useMediaQuery";
import LoginFormDesktop from "@/components/auth/desktop/LoginFormDesktop";
import LoginFormMobile from "@/components/auth/mobile/LoginFormMobile";

export default function Login() {
  const isDesktop = useIsDesktop();

  return isDesktop ? <LoginFormDesktop /> : <LoginFormMobile />;
}
