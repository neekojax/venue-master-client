var b=Object.defineProperty,v=Object.defineProperties;var x=Object.getOwnPropertyDescriptors;var i=Object.getOwnPropertySymbols;var h=Object.prototype.hasOwnProperty,w=Object.prototype.propertyIsEnumerable;var m=(e,t,r)=>t in e?b(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,n=(e,t)=>{for(var r in t||(t={}))h.call(t,r)&&m(e,r,t[r]);if(i)for(var r of i(t))w.call(t,r)&&m(e,r,t[r]);return e},C=(e,t)=>v(e,x(t));var p=(e,t)=>{var r={};for(var o in e)h.call(e,o)&&t.indexOf(o)<0&&(r[o]=e[o]);if(e!=null&&i)for(var o of i(e))t.indexOf(o)<0&&w.call(e,o)&&(r[o]=e[o]);return r};import{r as c}from"./react-BIszHAjf.js";/**
* @license lucide-react v0.554.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/const L=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),E=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,r,o)=>o?o.toUpperCase():r.toLowerCase()),f=e=>{const t=E(e);return t.charAt(0).toUpperCase()+t.slice(1)},g=(...e)=>e.filter((t,r,o)=>!!t&&t.trim()!==""&&o.indexOf(t)===r).join(" ").trim(),$=e=>{for(const t in e)if(t.startsWith("aria-")||t==="role"||t==="title")return!0};/**
* @license lucide-react v0.554.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/var j={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
* @license lucide-react v0.554.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/const _=c.forwardRef((M,A)=>{var d=M,{color:e="currentColor",size:t=24,strokeWidth:r=2,absoluteStrokeWidth:o,className:l="",children:a,iconNode:u}=d,s=p(d,["color","size","strokeWidth","absoluteStrokeWidth","className","children","iconNode"]);return c.createElement("svg",n(n(C(n({ref:A},j),{width:t,height:t,stroke:e,strokeWidth:o?Number(r)*24/Number(t):r,className:g("lucide",l)}),!a&&!$(s)&&{"aria-hidden":"true"}),s),[...u.map(([k,y])=>c.createElement(k,y)),...Array.isArray(a)?a:[a]])});/**
* @license lucide-react v0.554.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/const B=(e,t)=>{const r=c.forwardRef((u,a)=>{var s=u,{className:o}=s,l=p(s,["className"]);return c.createElement(_,n({ref:a,iconNode:t,className:g(`lucide-${L(f(e))}`,`lucide-${e}`,o)},l))});return r.displayName=f(e),r};/**
* @license lucide-react v0.554.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/const I=[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]],R=B("triangle-alert",I);export{R as T,B as c};
