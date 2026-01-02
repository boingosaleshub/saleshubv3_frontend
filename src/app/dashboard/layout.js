import { SystemLayoutWrapper } from "@/components/providers/system-layout-wrapper";

export default function DashboardLayout({ children }) {
  return (
    <SystemLayoutWrapper>
      {children}
    </SystemLayoutWrapper>
  )
}

