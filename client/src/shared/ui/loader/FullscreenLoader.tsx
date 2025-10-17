import React from "react";
import {Loader} from "./Loader";

export const FullscreenLoader: React.FC = () => (
    <div className="fixed inset-0 grid place-items-center bg-black/50 backdrop-blur-sm z-50">
        <div className="flex items-center gap-3 text-white">
            <Loader/>
            <span className="text-sm">Loading…</span>
        </div>
    </div>
);
