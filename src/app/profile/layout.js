import { SystemLayoutWrapper } from "@/components/providers/system-layout-wrapper";

export default function ProfileLayout({ children }) {
    return (
        <SystemLayoutWrapper>
            {children}
        </SystemLayoutWrapper>
    )
}
