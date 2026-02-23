import { SystemLayoutWrapper } from "@/components/providers/system-layout-wrapper";

export default function MyRomsLayout({ children }) {
    return (
        <SystemLayoutWrapper>
            {children}
        </SystemLayoutWrapper>
    )
}
