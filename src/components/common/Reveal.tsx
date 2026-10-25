import React,{useEffect,useRef} from 'react';
import {Animated} from 'react-native';
export function Reveal({children,style}:{children:React.ReactNode;style?:any}) {
 const v=useRef(new Animated.Value(0)).current;
 useEffect(()=>{Animated.timing(v,{toValue:1,duration:420,useNativeDriver:true}).start();return()=>v.stopAnimation();},[]);
 return <Animated.View style={[style,{opacity:v,transform:[{translateY:v.interpolate({inputRange:[0,1],outputRange:[-24,0]})}]}]}>{children}</Animated.View>;
}
