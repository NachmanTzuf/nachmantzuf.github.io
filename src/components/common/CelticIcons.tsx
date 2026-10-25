import React from 'react';
interface IconProps {size?:number;color?:string;active?:boolean;filled?:boolean;style?:any}
const paths = {
 home:'M12 12C6 9 8 2 13 3c4 1 3 6 0 5M12 12c6-3 11 2 8 6-3 3-7 0-4-2M12 12c0 7-7 9-9 4-1-4 3-6 4-3',
 knot:'M12 3C5 11 3 17 12 17S19 11 12 3ZM4 17C14 20 21 18 16 10S8 8 4 17ZM20 17C17 7 12 2 8 10S10 19 20 17Z',
 lever:'M6 20V9m6 11V5m6 15V11M3 9h6m0-4h6m0 6h6',
 cross:'M12 2v20M2 12h20M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14',
 flame:'M12 3c0 6-7 7-7 12a7 7 0 0 0 14 0c0-3-2-5-3-6 0 5-4 5-4 5',
 torc:'M8 5a8 8 0 1 0 8 0M8 5v4M16 5v4',
 lock:'M6 11h12v9H6ZM8 11V7a4 4 0 0 1 8 0v4M12 15v2',
 stone:'M4 7h16M6 7l-2 13m14-13 2 13M3 4h18',
 lyre:'M5 4v7a7 7 0 0 0 14 0V4M5 6h14M9 6v10m6-10v10M12 18v3M8 21h8',
 star:'M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z',
 flora:'M12 21V9M12 14C3 14 3 5 7 5c3 0 5 4 5 9Zm0 0c9 0 9-9 5-9-3 0-5 4-5 9Z',
 cup:'M5 4h14v5a7 7 0 0 1-14 0ZM12 16v5M8 21h8'
};
const glyph=(kind:keyof typeof paths)=>({size=24,color='#d9c394',style}:IconProps)=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true"><path d={paths[kind]}/></svg>;
export const CrannogHomeIcon=glyph('home'),TriquetraChordIcon=glyph('knot'),CamacLeverIcon=glyph('lever'),CelticSolarCrossIcon=glyph('cross'),SaintBrigidFlameIcon=glyph('flame'),GoldTorcIcon=glyph('torc'),CelticBroochLockIcon=glyph('lock'),MegalithicDolmenIcon=glyph('stone'),CelticLyreIcon=glyph('lyre'),CelticSunburstStarIcon=glyph('star'),PurpleHeatherFlora=glyph('flora'),CelticChaliceRelicIcon=glyph('cup');
