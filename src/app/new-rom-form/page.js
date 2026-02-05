import { CreateRomForm } from "./create-rom-form"
import { RomAutomationProvider } from "@/components/providers/rom-automation-provider"

export default function CreateRomPage() {
    return (
        <RomAutomationProvider>
            <div className="p-8 w-full max-w-[1800px] mx-auto">
                <CreateRomForm />
            </div>
        </RomAutomationProvider>
    )
}
