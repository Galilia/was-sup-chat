// src/widgets/sidebar/ui/sidebar-tabs/SidebarTabs.tsx
import {RequestsPanel} from "../requests-panel/RequestsPanel";
import {SidebarTab} from "../../model/sidebar-types";

interface SidebarTabsProps {
    tab?: SidebarTab;
    setTab: (tab: SidebarTab) => void;
}

export const SidebarTabs = ({tab, setTab}: SidebarTabsProps) => {
    return (
        <div className="flex gap-2 mt-5 text-sm">
            <button
                className={`px-3 py-1 rounded-full border ${tab === "contacts" ? "bg-white/10" : "border-gray-700"}`}
                onClick={() => setTab("contacts")}>Contacts
            </button>
            <button
                className={`px-3 py-1 rounded-full border ${tab === "requests" ? "bg-white/10" : "border-gray-700"}`}
                onClick={() => setTab("requests")}>Requests
            </button>
            <button className={`px-3 py-1 rounded-full border ${tab === "add" ? "bg-white/10" : "border-gray-700"}`}
                    onClick={() => setTab("add")}>Add
            </button>
        </div>
    );
};
