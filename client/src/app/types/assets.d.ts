// types/index.d.ts
declare module '*.svg?react' {
    import * as React from 'react';
    const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
    export default ReactComponent;
}
declare module '*.svg?url' {
    const src: string;
    export default src;
}
declare module '*.png?url' {
    const src: string;
    export default src;
}
declare module '*.jpg?url' {
    const src: string;
    export default src;
}
declare module '*.jpeg?url' {
    const src: string;
    export default src;
}
