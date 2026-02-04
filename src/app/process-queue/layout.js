import { SystemLayoutWrapper } from "@/components/providers/system-layout-wrapper";

export default function ProcessQueueLayout({ children }) {
  return (
    <SystemLayoutWrapper>
      {children}
    </SystemLayoutWrapper>
  );
}
