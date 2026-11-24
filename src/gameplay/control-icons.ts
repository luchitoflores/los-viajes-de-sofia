const paths:Record<string,string>={
 run:'M15 4a2 2 0 1 0 0 .1 M13 8l-3 5 4 3 3 5 M10 13l-5 7 M12 9l5 3 4-1 M11 9L7 8l-3 4',
 crouch:'M13 4a2 2 0 1 0 0 .1 M12 8l-3 5 5 2 4 5 M9 13l-4 4 5 3 M11 9l5 3 4-1',
 jump:'M12 4a2 2 0 1 0 0 .1 M12 8v6 M12 9L6 6 M12 9l6-4 M12 14l-5 6 M12 14l5 6 M3 22h18',
 flashlight:'M3 9h10l5-4v14l-5-4H3Z M6 9v6 M21 7v10',
 fire:'M4 12h16 M14 6l6 6-6 6'};
export function controlIcon(kind:string){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+(paths[kind]??paths.fire)+'"/></svg>'}
