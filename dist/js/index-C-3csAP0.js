var K=Object.defineProperty,J=Object.defineProperties;var Q=Object.getOwnPropertyDescriptors;var A=Object.getOwnPropertySymbols;var P=Object.prototype.hasOwnProperty,I=Object.prototype.propertyIsEnumerable;var T=(s,e,a)=>e in s?K(s,e,{enumerable:!0,configurable:!0,writable:!0,value:a}):s[e]=a,_=(s,e)=>{for(var a in e||(e={}))P.call(e,a)&&T(s,a,e[a]);if(A)for(var a of A(e))I.call(e,a)&&T(s,a,e[a]);return s},F=(s,e)=>J(s,Q(e));var $=(s,e)=>{var a={};for(var r in s)P.call(s,r)&&e.indexOf(r)<0&&(a[r]=s[r]);if(s!=null&&A)for(var r of A(s))e.indexOf(r)<0&&I.call(s,r)&&(a[r]=s[r]);return a};var H=(s,e,a)=>new Promise((r,i)=>{var c=m=>{try{d(a.next(m))}catch(p){i(p)}},g=m=>{try{d(a.throw(m))}catch(p){i(p)}},d=m=>m.done?r(m.value):Promise.resolve(m.value).then(c,g);d((a=a.apply(s,e)).next())});import{j as t,a as X,b as ee}from"./index-BISOQbt2.js";import{r as h}from"./react-BIszHAjf.js";import{d as O,z as te,u as se,i as ae,q as re,x as ne}from"./antd-COYDBf-C.js";import{h as oe}from"./api-Cx6IW55D.js";import{u as ie,c as ce,b as le,a as de,e as me,d as ue}from"./install-BpSnZ9HG.js";import"./fetchHelper-BMLDqFbV.js";/**
* @license lucide-react v0.554.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/const he=s=>s.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),pe=s=>s.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,a,r)=>r?r.toUpperCase():a.toLowerCase()),R=s=>{const e=pe(s);return e.charAt(0).toUpperCase()+e.slice(1)},B=(...s)=>s.filter((e,a,r)=>!!e&&e.trim()!==""&&r.indexOf(e)===a).join(" ").trim(),xe=s=>{for(const e in s)if(e.startsWith("aria-")||e==="role"||e==="title")return!0};/**
* @license lucide-react v0.554.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/var fe={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
* @license lucide-react v0.554.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/const ye=h.forwardRef((p,m)=>{var w=p,{color:s="currentColor",size:e=24,strokeWidth:a=2,absoluteStrokeWidth:r,className:i="",children:c,iconNode:g}=w,d=$(w,["color","size","strokeWidth","absoluteStrokeWidth","className","children","iconNode"]);return h.createElement("svg",_(_(F(_({ref:m},fe),{width:e,height:e,stroke:s,strokeWidth:r?Number(a)*24/Number(e):a,className:B("lucide",i)}),!c&&!xe(d)&&{"aria-hidden":"true"}),d),[...g.map(([v,b])=>h.createElement(v,b)),...Array.isArray(c)?c:[c]])});/**
* @license lucide-react v0.554.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/const y=(s,e)=>{const a=h.forwardRef((g,c)=>{var d=g,{className:r}=d,i=$(d,["className"]);return h.createElement(ye,_({ref:c,iconNode:e,className:B(`lucide-${he(R(s))}`,`lucide-${s}`,r)},i))});return a.displayName=R(s),a};/**
* @license lucide-react v0.554.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/const ge=[["path",{d:"M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973",key:"1cez44"}],["path",{d:"m13 12-3 5h4l-3 5",key:"1t22er"}]],je=y("cloud-lightning",ge);/**
* @license lucide-react v0.554.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/const we=[["path",{d:"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242",key:"1pljnt"}],["path",{d:"M16 14v6",key:"1j4efv"}],["path",{d:"M8 14v6",key:"17c4r9"}],["path",{d:"M12 16v6",key:"c8a4gj"}]],U=y("cloud-rain",we);/**
* @license lucide-react v0.554.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/const be=[["path",{d:"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242",key:"1pljnt"}],["path",{d:"M8 15h.01",key:"a7atzg"}],["path",{d:"M8 19h.01",key:"puxtts"}],["path",{d:"M12 17h.01",key:"p32p05"}],["path",{d:"M12 21h.01",key:"h35vbk"}],["path",{d:"M16 15h.01",key:"rnfrdf"}],["path",{d:"M16 19h.01",key:"1vcnzz"}]],ve=y("cloud-snow",be);/**
* @license lucide-react v0.554.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/const ke=[["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}],["path",{d:"M15.947 12.65a4 4 0 0 0-5.925-4.128",key:"dpwdj0"}],["path",{d:"M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z",key:"s09mg5"}]],_e=y("cloud-sun",ke);/**
* @license lucide-react v0.554.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/const Ne=[["path",{d:"M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z",key:"p7xjir"}]],Me=y("cloud",Ne);/**
* @license lucide-react v0.554.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/const Ce=[["path",{d:"M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z",key:"1ptgy4"}],["path",{d:"M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97",key:"1sl1rz"}]],Se=y("droplets",Ce);/**
* @license lucide-react v0.554.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/const ze=[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]],Ae=y("map-pin",ze);/**
* @license lucide-react v0.554.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/const De=[["path",{d:"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",key:"kfwtm"}]],$e=y("moon",De);/**
* @license lucide-react v0.554.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/const Le=[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]],Z=y("sun",Le);/**
* @license lucide-react v0.554.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/const We=[["path",{d:"M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z",key:"17jzev"}]],Ye=y("thermometer",We);/**
* @license lucide-react v0.554.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/const Ee=[["path",{d:"M12.8 19.6A2 2 0 1 0 14 16H2",key:"148xed"}],["path",{d:"M17.5 8a2.5 2.5 0 1 1 2 4H2",key:"1u4tom"}],["path",{d:"M9.8 4.4A2 2 0 1 1 11 8H2",key:"75valh"}]],Te=y("wind",Ee),Pe=({condition:s,className:e,isNight:a})=>{if(a&&(s==="sunny"||s==="clear"))return t.jsx($e,{className:e});switch(s){case"sunny":case"clear":return t.jsx(Z,{className:e});case"cloudy":return t.jsx(Me,{className:e});case"rainy":return t.jsx(U,{className:e});case"snowy":return t.jsx(ve,{className:e});case"stormy":return t.jsx(je,{className:e});case"partly-cloudy":return t.jsx(_e,{className:e});default:return t.jsx(Z,{className:e})}},q=({label:s,data:e,isNight:a})=>{const r=i=>{if(!i)return"sunny";const c=i.toLowerCase();return i.includes("雷")||c.includes("storm")?"stormy":i.includes("云")||c.includes("cloud")?"cloudy":i.includes("雨")||i.includes("暴雨")||c.includes("rain")?"rainy":i.includes("雪")||c.includes("snow")?"snowy":i.includes("阴")?"cloudy":"sunny"};return t.jsxs("div",{className:`flex flex-col sm:flex-row items-center sm:items-start justify-between sm:gap-6 p-3 rounded-lg ${a?"bg-indigo-900 text-indigo-50":"bg-sky-100 text-slate-800"}`,children:[t.jsxs("div",{className:"flex flex-col items-center sm:items-start gap-1 mb-2 sm:mb-0 sm:flex-none sm:shrink-0",children:[t.jsx("div",{className:"flex items-center gap-1",children:t.jsx(Pe,{condition:r(e.weather),isNight:a,className:"w-6 h-6"})}),t.jsxs("span",{style:{fontSize:"0.75rem",fontWeight:"bold"},children:[t.jsxs("span",{children:[s,"  "]}),e.weather.replace("（白天）","").replace("（夜间）","")]})]}),t.jsxs("div",{className:"grid grid-cols-4 gap-2 sm:gap-4 text-sm w-full sm:w-auto sm:ml-6 sm:justify-items-end text-right ml-auto",children:[t.jsxs("div",{className:"flex flex-col items-center ",children:[t.jsx(Ye,{className:"w-4 h-4 mb-1 opacity-70"}),t.jsxs("span",{className:"whitespace-nowrap",style:{fontSize:"0.75rem",fontWeight:"bold",marginTop:"7px"},children:[e.min_temperature.toFixed(2),"° ~ ",e.max_temperature.toFixed(2),"°"]})]}),t.jsxs("div",{className:"flex flex-col items-center",children:[t.jsx(Se,{className:"w-4 h-4 mb-1 opacity-70"}),t.jsxs("span",{style:{fontSize:"0.75rem",fontWeight:"bold",marginTop:"7px"},children:[e.humidity,"%"]})]}),t.jsxs("div",{className:"flex flex-col items-center",children:[t.jsx(Te,{className:"w-4 h-4 mb-1 opacity-70"}),t.jsxs("span",{style:{fontSize:"0.75rem",fontWeight:"bold",marginTop:"7px"},children:[e.wind_speed.toFixed(0)," km/h"]})]}),t.jsxs("div",{className:"flex flex-col items-center",children:[t.jsx(U,{className:"w-4 h-4 mb-1 opacity-70"}),t.jsxs("span",{style:{fontSize:"0.75rem",fontWeight:"bold",marginTop:"7px"},children:[Number.isInteger(e.precipitation)?e.precipitation:Number(e.precipitation).toFixed(1)," ","mm"]})]})]})]})},Ie=({site:s})=>{var e,a;return console.log("SiteCard",s),t.jsxs("div",{className:"bg-white mb-4 rounded-xl p-2 shadow-sm border border-gray-100 w-full hover:shadow-md transition-shadow",children:[t.jsxs("div",{className:"mb-4 border-b border-gray-100 pb-2 flex items-center gap-2",children:[t.jsx(Ae,{className:"w-5 h-5 text-blue-500"}),t.jsx("h2",{className:"text-lg font-semibold text-slate-700",children:(e=s==null?void 0:s.venue)==null?void 0:e.name})]}),t.jsx("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-4",children:(a=s.items)==null?void 0:a.map(r=>{var m,p,w,v,b,N,M,C,D,k;const i=new Date(r.date),c=new Intl.DateTimeFormat("zh-CN",{month:"numeric",day:"numeric",weekday:"short"}).format(i),g={venue_id:(p=(m=s.venue)==null?void 0:m.id)!=null?p:0,venue_name:(v=(w=s.venue)==null?void 0:w.name)!=null?v:"",date:r.date,day_period:"白天",weather:"-",min_temperature:0,max_temperature:0,humidity:0,precipitation:0,wind_speed:0},d={venue_id:(N=(b=s.venue)==null?void 0:b.id)!=null?N:0,venue_name:(C=(M=s.venue)==null?void 0:M.name)!=null?C:"",date:r.date,day_period:"夜间",weather:"-",min_temperature:0,max_temperature:0,humidity:0,precipitation:0,wind_speed:0};return t.jsxs("div",{className:"flex flex-col gap-2",children:[t.jsx("div",{className:"text-center text-sm font-medium text-slate-500",children:c}),t.jsxs("div",{className:"flex flex-col gap-2 flex-1",children:[t.jsx(q,{label:"白天",data:(D=r.day)!=null?D:g}),t.jsx(q,{label:"夜间",data:(k=r.night)!=null?k:d,isNight:!0})]})]},r.date)})})]})};ie([ce,le,de,me,ue]);const Ue=()=>{const{poolType:s}=X(ee(["poolType"])),[e,a]=h.useState([]),[r,i]=h.useState(""),[c,g]=h.useState(1),[d,m]=h.useState(5),[p,w]=h.useState(O().format("YYYY-MM-DD")),[v,b]=h.useState(!1),N=n=>{var x;const o=new Map;if(!Array.isArray(n))return[];for(const l of n){const u=l==null?void 0:l.date;if(!u)continue;const j=(x=o.get(u))!=null?x:{date:u},S=(l.day_period||"").trim();S==="白天"?j.day=l:S==="夜间"?j.night=l:j.day?j.night||(j.night=l):j.day=l,o.set(u,j)}return Array.from(o.values()).sort((l,u)=>l.date.localeCompare(u.date))},M=()=>H(void 0,null,function*(){b(!0);try{const n=yield oe(s,p),{success:o,code:x,message:l,data:u}=n||{};if(o===!1||typeof x=="number"&&x!==0)throw new Error(`API error! code: ${x}, message: ${l}`);if(u&&typeof u=="object"){const S=Object.entries(u).map(([z,f])=>{var Y,E;return!f||!Array.isArray(f)||f.length===0?{venue_id:0,venue_name:z,list:f||[],grouped_list:[]}:{venue_id:Number((E=(Y=f==null?void 0:f[0])==null?void 0:Y.venue_id)!=null?E:0),venue_name:z,list:f,grouped_list:N(f)}}).filter(z=>{var f;return((f=z.grouped_list)==null?void 0:f.length)>0});a(S)}else a([])}catch(n){console.error("getWeatherData error:",n),a([])}finally{b(!1)}});h.useEffect(()=>{a([]),M()},[s,p]),h.useEffect(()=>{g(1)},[e]);const C=Array.from(new Set(e.map(n=>n.venue_name||"未知场地"))).map(n=>({value:n,label:n})),k=e.filter(n=>{if(!r)return!0;const o=(n.venue_name||"").toLowerCase(),x=r.toLowerCase();return o.includes(x)}).reduce((n,o)=>{var l,u;const x=Number((l=o.venue_id)!=null?l:0);return n[x]={venue:{id:x,name:(u=o.venue_name)!=null?u:"未知场地"},items:Array.isArray(o.grouped_list)?o.grouped_list:[]},n},{}),L=Object.entries(k),V=L.length,W=(c-1)*d,G=L.slice(W,W+d);return t.jsxs("div",{className:"min-h-screen text-gray-900",children:[t.jsx("div",{className:"bg-white shadow-sm py-4 px-4 rounded-lg",style:{marginBottom:"16px"},children:t.jsxs("div",{className:"mx-auto flex flex-wrap gap-6 items-center justify-between",children:[t.jsx("div",{children:t.jsx(te,{size:"middle",placeholder:"选择日期",className:"w-40",format:"YYYY-MM-DD",value:p?O(p):void 0,onChange:n=>w(n?n.format("YYYY-MM-DD"):"")})}),t.jsxs("div",{className:"relative ml-auto w-64",children:[t.jsx(se,{className:"absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"}),t.jsx(ae,{size:"middle",showSearch:!0,allowClear:!0,placeholder:"搜索场地名称...",style:{fontSize:"12px"},className:"w-full select-placeholder-12",onSearch:n=>i(n),onChange:n=>i(n||""),options:C,filterOption:(n,o)=>{var l;return((l=o==null?void 0:o.label)!=null?l:"").toString().toLowerCase().includes(n.toLowerCase())}})]})]})}),t.jsx(re,{spinning:v,tip:"加载中...",children:t.jsx("div",{className:" flex-grow",children:t.jsxs("div",{className:"mx-auto ",children:[G.filter(([,n])=>{var o;return((o=n.items)==null?void 0:o.length)>0}).map(([n,o])=>t.jsx(Ie,{site:o},n)),t.jsx("div",{className:"flex justify-center mt-6",children:t.jsx(ne,{current:c,pageSize:d,total:V,showSizeChanger:!0,onChange:(n,o)=>{g(n),m(o)}})}),Object.keys(k).length===0&&t.jsxs("div",{className:"text-center py-12 rounded-xl bg-white  shadow",children:[t.jsx("div",{className:"text-5xl mb-4 text-gray-300",children:t.jsx("i",{className:"fas fa-cloud-sun"})}),t.jsx("h3",{className:"text-xl font-medium mb-2",children:"未找到匹配的天气数据"}),t.jsx("p",{className:"text-gray-500 dark:text-gray-400",children:"请尝试调整筛选条件或搜索关键词"})]})]})})})]})};export{Ue as default};
