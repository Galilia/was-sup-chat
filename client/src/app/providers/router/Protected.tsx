import React, {ReactNode} from "react";
import {Navigate} from "react-router-dom";

type ProtectedProps = {
    allow: boolean;
    to: string;
    children: ReactNode;
};

export const Protected = ({allow, to, children}: ProtectedProps): React.ReactElement =>
    allow ? <>{children}</> : <Navigate to={to} replace/>;
