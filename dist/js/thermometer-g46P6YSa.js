var b=Object.defineProperty,x=Object.defineProperties;var L=Object.getOwnPropertyDescriptors;var i=Object.getOwnPropertySymbols;var h=Object.prototype.hasOwnProperty,C=Object.prototype.propertyIsEnumerable;var u=(e,t,r)=>t in e?b(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,c=(e,t)=>{for(var r in t||(t={}))h.call(t,r)&&u(e,r,t[r]);if(i)for(var r of i(t))C.call(t,r)&&u(e,r,t[r]);return e},w=(e,t)=>x(e,L(t));var p=(e,t)=>{var r={};for(var o in e)h.call(e,o)&&t.indexOf(o)<0&&(r[o]=e[o]);if(e!=null&&i)for(var o of i(e))t.indexOf(o)<0&&C.call(e,o)&&(r[o]=e[o]);return r};import{r as n}from"./react-BIszHAjf.js";/**
* @license lucide-react v0.554.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/const _=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),$=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,r,o)=>o?o.toUpperCase():r.toLowerCase()),f=e=>{const t=$(e);return t.charAt(0).toUpperCase()+t.slice(1)},g=(...e)=>e.filter((t,r,o)=>!!t&&t.trim()!==""&&o.indexOf(t)===r).join(" ").trim(),E=e=>{for(const t in e)if(t.startsWith("aria-")||t==="role"||t==="title")return!0};/**
* @license lucide-react v0.554.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/var j={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
* @license lucide-react v0.554.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/const M=n.forwardRef((z,y)=>{var m=z,{color:e="currentColor",size:t=24,strokeWidth:r=2,absoluteStrokeWidth:o,className:l="",children:a,iconNode:d}=m,s=p(m,["color","size","strokeWidth","absoluteStrokeWidth","className","children","iconNode"]);return n.createElement("svg",c(c(w(c({ref:y},j),{width:t,height:t,stroke:e,strokeWidth:o?Number(r)*24/Number(t):r,className:g("lucide",l)}),!a&&!E(s)&&{"aria-hidden":"true"}),s),[...d.map(([A,v])=>n.createElement(A,v)),...Array.isArray(a)?a:[a]])});/**
* @license lucide-react v0.554.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/const k=(e,t)=>{const r=n.forwardRef((d,a)=>{var s=d,{className:o}=s,l=p(s,["className"]);return n.createElement(M,c({ref:a,iconNode:t,className:g(`lucide-${_(f(e))}`,`lucide-${e}`,o)},l))});return r.displayName=f(e),r};/**
* @license lucide-react v0.554.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/const N=[["path",{d:"M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z",key:"1ptgy4"}],["path",{d:"M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97",key:"1sl1rz"}]],I=k("droplets",N);/**
* @license lucide-react v0.554.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/const Z=[["path",{d:"M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z",key:"17jzev"}]],P=k("thermometer",Z);export{I as D,P as T,k as c};
