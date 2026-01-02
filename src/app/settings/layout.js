import { SystemLayoutWrapper } from "@/components/providers/system-layout-wrapper";

export default function SettingsLayout({ children }) {
    return (
        <SystemLayoutWrapper>
            {children}
        </SystemLayoutWrapper>
    )
}

