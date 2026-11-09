import React from 'react';
import {Sequence} from 'remotion';
import {KineticAd,cuts,words} from './kinetic/Kinetic';
function Shot({start=0,text=''}:{start?:number;text?:string}){return <Sequence from={-start}><KineticAd sound={false} titleOverride={text}/></Sequence>}
export const WORKBENCH={name:'Earpa · Kinetic landscape',fps:30,width:1920,height:1080,total:1350,background:'#071913',revision:'kinetic-1',
shots:cuts.slice(0,-1).map((from,i)=>({id:'shot-'+i,label:words[i],from,duration:cuts[i+1]-from,component:Shot,props:{start:from,text:words[i]},schema:[{type:'text',key:'text',label:'Headline',default:words[i]}]})),
bgm:[{from:0,duration:1350,src:'kinetic/v6-original.mp3',volume:1,label:'Original V6 narration and mix'}],
sfx:cuts.slice(1,-1).map((from,i)=>({from,duration:25,src:'kinetic/'+(i%5===0?'impact':i%2?'snap':'sweep')+'.mp3',volume:i%5===0?.16:.12})),original:KineticAd};
