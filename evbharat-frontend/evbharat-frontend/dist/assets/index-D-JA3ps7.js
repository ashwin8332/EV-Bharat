(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const r of n.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function a(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(s){if(s.ep)return;s.ep=!0;const n=a(s);fetch(s.href,n)}})();class ai{routes=new Map;currentPath="";constructor(){window.addEventListener("popstate",()=>this.handleRoute()),document.addEventListener("click",e=>this.handleLinkClick(e))}register(e,a,i){this.routes.set(e,{path:e,title:a,render:i})}navigate(e,a=!0){if(this.currentPath===e)return;const i=this.routes.get(e);if(!i){this.navigate("/404",a);return}this.currentPath=e,a&&window.history.pushState({path:e},i.title,e),document.title=i.title,this.showPageTransition(async()=>{await i.render(),window.scrollTo({top:0,behavior:"instant"})})}handleRoute(){const e=window.location.pathname;this.navigate(e,!1)}handleLinkClick(e){const a=e.target.closest("a");if(!a)return;const i=a.getAttribute("href");!i||i.startsWith("http")||i.startsWith("#")||this.routes.has(i)&&(e.preventDefault(),this.navigate(i))}showPageTransition(e){const a=document.getElementById("app");if(!a)return e();a.style.opacity="0",a.style.transition="opacity 0.3s ease-out",setTimeout(async()=>{await e(),a.style.opacity="1"},300)}init(){this.handleRoute()}}const R=new ai,O={id:"1",email:"user@evbharat.com",password:"Evbharat@123",name:"Alex Sharma",role:"owner"};class ii{storageKey="evbharat_auth";userKey="evbharat_user";getAuthState(){const e=localStorage.getItem(this.storageKey),a=localStorage.getItem(this.userKey);if(e&&a)try{return{isAuthenticated:!0,user:JSON.parse(a),token:e}}catch{return{isAuthenticated:!1,user:null,token:null}}return{isAuthenticated:!1,user:null,token:null}}isAuthenticated(){return this.getAuthState().isAuthenticated}getCurrentUser(){return this.getAuthState().user}login(e,a){if(e===O.email&&a===O.password){const i={id:O.id,email:O.email,name:O.name,role:O.role},s=this.generateToken();return localStorage.setItem(this.storageKey,s),localStorage.setItem(this.userKey,JSON.stringify(i)),{success:!0,message:"Login successful",user:i}}return{success:!1,message:"Invalid email or password"}}signup(e,a,i){const s={id:String(Date.now()),email:a,name:e,role:"owner"},n=this.generateToken();return localStorage.setItem(this.storageKey,n),localStorage.setItem(this.userKey,JSON.stringify(s)),{success:!0,message:"Account created successfully",user:s}}logout(){localStorage.removeItem(this.storageKey),localStorage.removeItem(this.userKey)}generateToken(){return"token_"+Math.random().toString(36).substr(2,9)+"_"+Date.now()}getDefaultCredentials(){return{email:O.email,password:O.password,name:O.name}}}const K=new ii;class si{navbar=null;mobileMenu=null;isMenuOpen=!1;constructor(){this.render(),this.attachEventListeners()}render(){const e=K.isAuthenticated(),a=K.getCurrentUser(),i=`
            <nav class="fixed top-0 left-0 w-full z-50 px-4 md:px-8 py-4 md:py-6 transition-all duration-300" id="navbar">
                <div class="max-w-7xl mx-auto flex justify-between items-center">
                    <!-- Logo -->
                    <a href="/" class="text-xl md:text-2xl font-bold tracking-widest text-white uppercase font-orbitron hover:text-pagani-gold transition-colors">
                        EV<span class="text-pagani-gold">BHARAT</span>
                    </a>

                    <!-- Desktop Navigation -->
                    <div class="hidden md:flex items-center gap-8">
                        <a href="/" class="nav-link text-sm tracking-wider uppercase hover:text-pagani-gold transition-colors">Home</a>
                        <a href="/about" class="nav-link text-sm tracking-wider uppercase hover:text-pagani-gold transition-colors">About</a>
                        <a href="/technology" class="nav-link text-sm tracking-wider uppercase hover:text-pagani-gold transition-colors">Technology</a>
                        <a href="/gallery" class="nav-link text-sm tracking-wider uppercase hover:text-pagani-gold transition-colors">Gallery</a>
                        <a href="/contact" class="nav-link text-sm tracking-wider uppercase hover:text-pagani-gold transition-colors">Contact</a>
                        <a href="/dashboard" class="nav-link text-sm tracking-wider uppercase hover:text-pagani-gold transition-colors">Dashboard</a>
                    </div>

                    <!-- User Menu (Desktop) -->
                    <div class="hidden md:flex items-center gap-4">
                        ${e?`
                            <div class="flex items-center gap-3 px-4 py-2 border border-pagani-gold/30 rounded-lg">
                                <div class="text-right">
                                    <p class="text-xs text-gray-400 uppercase tracking-wider">User</p>
                                    <p class="text-sm font-orbitron font-bold">${a?.name}</p>
                                </div>
                                <div class="text-2xl">👤</div>
                            </div>
                            <button id="logout-btn" class="px-6 py-2 bg-pagani-gold/20 border border-pagani-gold/50 text-xs tracking-[0.2em] hover:bg-pagani-gold hover:text-black transition-all uppercase">
                                Logout
                            </button>
                        `:`
                            <a href="/auth" class="px-6 py-2 border border-pagani-gold/30 text-xs tracking-[0.2em] hover:text-pagani-gold hover:border-pagani-gold transition-all uppercase">
                                Login
                            </a>
                            <button class="px-6 py-2 border border-pagani-gold/30 text-xs tracking-[0.2em] hover:bg-pagani-gold hover:text-black transition-all uppercase">
                                Book Test Drive
                            </button>
                        `}
                    </div>

                    <!-- Mobile Menu Button -->
                    <button id="mobile-menu-btn" class="md:hidden text-white focus:outline-none">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path class="menu-icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            <path class="close-icon hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <!-- Mobile Menu -->
                <div id="mobile-menu" class="md:hidden fixed inset-0 bg-pagani-black/95 backdrop-blur-lg transform translate-x-full transition-transform duration-300 pt-20">
                    <div class="flex flex-col items-center gap-8 p-8">
                        <a href="/" class="mobile-nav-link text-2xl tracking-wider uppercase hover:text-pagani-gold transition-colors">Home</a>
                        <a href="/about" class="mobile-nav-link text-2xl tracking-wider uppercase hover:text-pagani-gold transition-colors">About</a>
                        <a href="/technology" class="mobile-nav-link text-2xl tracking-wider uppercase hover:text-pagani-gold transition-colors">Technology</a>
                        <a href="/configurator" class="mobile-nav-link text-2xl tracking-wider uppercase hover:text-pagani-gold transition-colors">Configurator</a>
                        <a href="/gallery" class="mobile-nav-link text-2xl tracking-wider uppercase hover:text-pagani-gold transition-colors">Gallery</a>
                        <a href="/contact" class="mobile-nav-link text-2xl tracking-wider uppercase hover:text-pagani-gold transition-colors">Contact</a>
                        <a href="/dashboard" class="mobile-nav-link text-2xl tracking-wider uppercase hover:text-pagani-gold transition-colors">Dashboard</a>
                        <div class="flex flex-col gap-4 w-full mt-8">
                            ${e?`
                                <div class="text-center py-3 border border-pagani-gold/30 rounded-lg">
                                    <p class="text-xs text-gray-400 uppercase tracking-wider">Logged in as</p>
                                    <p class="font-orbitron font-bold text-pagani-gold">${a?.name}</p>
                                </div>
                                <button id="logout-mobile-btn" class="w-full px-8 py-3 bg-pagani-gold/20 border border-pagani-gold/50 text-sm tracking-[0.2em] hover:bg-pagani-gold hover:text-black transition-all uppercase">
                                    Logout
                                </button>
                            `:`
                                <a href="/auth" class="w-full text-center py-3 border border-pagani-gold/30 text-sm tracking-[0.2em] hover:text-pagani-gold hover:border-pagani-gold transition-all uppercase">
                                    Login
                                </a>
                                <button class="w-full px-8 py-3 border border-pagani-gold text-sm tracking-[0.2em] hover:bg-pagani-gold hover:text-black transition-all uppercase">
                                    Book Test Drive
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </nav>
        `;document.body.insertAdjacentHTML("afterbegin",i),this.navbar=document.getElementById("navbar"),this.mobileMenu=document.getElementById("mobile-menu")}attachEventListeners(){const e=document.getElementById("logout-btn"),a=document.getElementById("logout-mobile-btn");e?.addEventListener("click",()=>this.handleLogout()),a?.addEventListener("click",()=>this.handleLogout()),document.getElementById("mobile-menu-btn")?.addEventListener("click",()=>this.toggleMobileMenu()),document.querySelectorAll(".mobile-nav-link").forEach(n=>{n.addEventListener("click",()=>this.closeMobileMenu())}),window.addEventListener("scroll",()=>this.handleScroll(),{passive:!0}),this.updateActiveLink(),window.addEventListener("popstate",()=>this.updateActiveLink())}handleLogout(){K.logout(),window.location.href="/"}toggleMobileMenu(){this.isMenuOpen=!this.isMenuOpen,this.isMenuOpen?(this.mobileMenu?.classList.remove("translate-x-full"),document.querySelector(".menu-icon")?.classList.add("hidden"),document.querySelector(".close-icon")?.classList.remove("hidden"),document.body.style.overflow="hidden"):this.closeMobileMenu()}closeMobileMenu(){this.isMenuOpen=!1,this.mobileMenu?.classList.add("translate-x-full"),document.querySelector(".menu-icon")?.classList.remove("hidden"),document.querySelector(".close-icon")?.classList.add("hidden"),document.body.style.overflow=""}handleScroll(){if(!this.navbar)return;window.scrollY>50?this.navbar.classList.add("bg-pagani-black/80","backdrop-blur-md","shadow-lg"):this.navbar.classList.remove("bg-pagani-black/80","backdrop-blur-md","shadow-lg")}updateActiveLink(){const e=window.location.pathname;document.querySelectorAll(".nav-link, .mobile-nav-link").forEach(i=>{i.getAttribute("href")===e?i.classList.add("text-pagani-gold"):i.classList.remove("text-pagani-gold")})}destroy(){this.navbar?.remove()}}class ni{constructor(){this.render()}render(){document.body.insertAdjacentHTML("beforeend",`
            <footer class="relative z-20 bg-pagani-black border-t border-pagani-gold/20">
                <div class="max-w-7xl mx-auto px-8 py-16">
                    <!-- Main Footer Content -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                        <!-- Company -->
                        <div>
                            <h3 class="text-xl font-orbitron font-bold mb-6">
                                EV<span class="text-pagani-gold">BHARAT</span>
                            </h3>
                            <p class="text-gray-400 text-sm leading-relaxed mb-6">
                                Pioneering India's electric future with AI-powered intelligence and hypercar performance.
                            </p>
                            <div class="flex gap-4">
                                <a href="#" class="w-10 h-10 border border-white/20 hover:border-pagani-gold flex items-center justify-center transition-colors group">
                                    <span class="text-white group-hover:text-pagani-gold">𝕏</span>
                                </a>
                                <a href="#" class="w-10 h-10 border border-white/20 hover:border-pagani-gold flex items-center justify-center transition-colors group">
                                    <span class="text-white group-hover:text-pagani-gold">in</span>
                                </a>
                                <a href="#" class="w-10 h-10 border border-white/20 hover:border-pagani-gold flex items-center justify-center transition-colors group">
                                    <span class="text-white group-hover:text-pagani-gold">IG</span>
                                </a>
                                <a href="#" class="w-10 h-10 border border-white/20 hover:border-pagani-gold flex items-center justify-center transition-colors group">
                                    <span class="text-white group-hover:text-pagani-gold">YT</span>
                                </a>
                            </div>
                        </div>

                        <!-- Products -->
                        <div>
                            <h4 class="text-sm font-orbitron tracking-widest uppercase mb-6 text-pagani-gold">Products</h4>
                            <ul class="space-y-3">
                                <li><a href="/configurator" class="text-gray-400 hover:text-white transition-colors text-sm">EVBharat X-1</a></li>
                                <li><a href="/technology" class="text-gray-400 hover:text-white transition-colors text-sm">AI Technology</a></li>
                                <li><a href="/configurator" class="text-gray-400 hover:text-white transition-colors text-sm">Configure</a></li>
                                <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">Accessories</a></li>
                            </ul>
                        </div>

                        <!-- Company -->
                        <div>
                            <h4 class="text-sm font-orbitron tracking-widest uppercase mb-6 text-pagani-gold">Company</h4>
                            <ul class="space-y-3">
                                <li><a href="/about" class="text-gray-400 hover:text-white transition-colors text-sm">About Us</a></li>
                                <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">Careers</a></li>
                                <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">Press</a></li>
                                <li><a href="/contact" class="text-gray-400 hover:text-white transition-colors text-sm">Contact</a></li>
                            </ul>
                        </div>

                        <!-- Newsletter -->
                        <div>
                            <h4 class="text-sm font-orbitron tracking-widest uppercase mb-6 text-pagani-gold">Stay Updated</h4>
                            <p class="text-gray-400 text-sm mb-4">Get the latest news and updates</p>
                            <form class="flex flex-col gap-3" id="newsletter-form">
                                <input 
                                    type="email" 
                                    placeholder="Your email" 
                                    class="bg-white/5 border border-white/10 px-4 py-2 text-sm focus:outline-none focus:border-pagani-gold transition-colors"
                                    required
                                />
                                <button 
                                    type="submit"
                                    class="bg-pagani-gold text-black px-4 py-2 text-xs tracking-widest uppercase hover:bg-pagani-gold/90 transition-colors font-semibold"
                                >
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>

                    <!-- Bottom Bar -->
                    <div class="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-white/30 text-xs">
                        <p>&copy; 2026 EVBharat Automotive. All rights reserved.</p>
                        <div class="flex gap-8 uppercase tracking-widest">
                            <a href="#" class="hover:text-pagani-gold transition-colors">Privacy</a>
                            <a href="#" class="hover:text-pagani-gold transition-colors">Terms</a>
                            <a href="#" class="hover:text-pagani-gold transition-colors">Legal</a>
                        </div>
                    </div>

                    <!-- Back to Top Button -->
                    <button 
                        id="back-to-top"
                        class="fixed bottom-8 right-8 w-12 h-12 bg-pagani-gold text-black flex items-center justify-center opacity-0 pointer-events-none transition-opacity hover:bg-pagani-gold/90"
                        aria-label="Back to top"
                    >
                        ↑
                    </button>
                </div>
            </footer>
        `),this.attachEventListeners()}attachEventListeners(){document.getElementById("newsletter-form")?.addEventListener("submit",i=>{i.preventDefault(),alert("Thank you for subscribing! 🎉"),i.target.reset()});const a=document.getElementById("back-to-top");window.addEventListener("scroll",()=>{window.scrollY>500?a?.classList.remove("opacity-0","pointer-events-none"):a?.classList.add("opacity-0","pointer-events-none")},{passive:!0}),a?.addEventListener("click",()=>{window.scrollTo({top:0,behavior:"smooth"})})}}class ri{loader=null;constructor(){this.render()}render(){document.body.insertAdjacentHTML("afterbegin",`
            <div id="page-loader" class="fixed inset-0 z-[100] bg-pagani-black flex items-center justify-center transition-opacity duration-500">
                <div class="text-center">
                    <div class="relative w-24 h-24 mx-auto mb-8">
                        <div class="absolute inset-0 border-4 border-pagani-gold/20 rounded-full"></div>
                        <div class="absolute inset-0 border-4 border-transparent border-t-pagani-gold rounded-full animate-spin"></div>
                    </div>
                    <div class="text-2xl font-orbitron font-bold tracking-widest">
                        EV<span class="text-pagani-gold">BHARAT</span>
                    </div>
                    <div class="text-xs text-gray-400 mt-4 tracking-wider uppercase">Loading Experience...</div>
                </div>
            </div>
        `),this.loader=document.getElementById("page-loader")}hide(){this.loader&&(this.loader.style.opacity="0",setTimeout(()=>{this.loader?.remove()},500))}show(){this.loader?this.loader.style.opacity="1":this.render()}}class oi{canvas;ctx;images=[];totalFrames=240;isLoaded=!1;currentFrameIndex=-1;constructor(e,a=240){if(this.canvas=document.getElementById(e),!this.canvas)throw new Error(`Canvas with id ${e} not found`);this.ctx=this.canvas.getContext("2d",{alpha:!1}),this.totalFrames=a,this.ctx&&(this.ctx.imageSmoothingEnabled=!0,this.ctx.imageSmoothingQuality="high"),this.resize(),window.addEventListener("resize",()=>this.resize()),this.preloadImages()}resize(){if(!this.canvas||!this.ctx)return;const e=window.devicePixelRatio||1,a=this.canvas.parentElement?.getBoundingClientRect();a&&(this.canvas.width=a.width*e,this.canvas.height=a.height*e,this.ctx.scale(e,e),this.ctx.imageSmoothingEnabled=!0,this.ctx.imageSmoothingQuality="high",this.currentFrameIndex>=0&&this.renderFrame(this.currentFrameIndex))}preloadImages(){let e=0;for(let a=1;a<=this.totalFrames;a++){const i=new Image;i.src=`/images/zonda-sequence/${a}.jpg`,i.onload=()=>{e++,e===this.totalFrames&&(this.isLoaded=!0,this.renderFrame(0))},this.images.push(i)}}update(e){if(!this.isLoaded)return;const a=Math.min(this.totalFrames-1,Math.max(0,Math.floor(e*this.totalFrames)));a!==this.currentFrameIndex&&(this.renderFrame(a),this.currentFrameIndex=a)}renderFrame(e){if(!this.ctx||!this.canvas)return;const a=this.images[e];if(!a)return;const i=window.devicePixelRatio||1;this.ctx.clearRect(0,0,this.canvas.width/i,this.canvas.height/i);const s=this.canvas.width/i,n=this.canvas.height/i,r=Math.min(s/a.width,n/a.height),o=s/2-a.width/2*r,l=n/2-a.height/2*r;this.ctx.drawImage(a,o,l,a.width*r,a.height*r)}}function li(t,e){t.indexOf(e)===-1&&t.push(e)}function Zt(t,e){const a=t.indexOf(e);a>-1&&t.splice(a,1)}const z=(t,e,a)=>a>e?e:a<t?t:a;let Ze=()=>{};const j={},Qt=t=>/^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(t);function ci(t){return typeof t=="object"&&t!==null}const Jt=t=>/^0[^.\s]+$/u.test(t);function Qe(t){let e;return()=>(e===void 0&&(e=t()),e)}const Q=t=>t,di=(t,e)=>a=>e(t(a)),Je=(...t)=>t.reduce(di),et=(t,e,a)=>{const i=e-t;return i===0?1:(a-t)/i};class ea{constructor(){this.subscriptions=[]}add(e){return li(this.subscriptions,e),()=>Zt(this.subscriptions,e)}notify(e,a,i){const s=this.subscriptions.length;if(s)if(s===1)this.subscriptions[0](e,a,i);else for(let n=0;n<s;n++){const r=this.subscriptions[n];r&&r(e,a,i)}}getSize(){return this.subscriptions.length}clear(){this.subscriptions.length=0}}const $=t=>t*1e3,B=t=>t/1e3;function ta(t,e){return e?t*(1e3/e):0}const pi=(t,e,a)=>{const i=e-t;return((a-t)%i+i)%i+t},aa=(t,e,a)=>(((1-3*a+3*e)*t+(3*a-6*e))*t+3*e)*t,gi=1e-7,ui=12;function hi(t,e,a,i,s){let n,r,o=0;do r=e+(a-e)/2,n=aa(r,i,s)-t,n>0?a=r:e=r;while(Math.abs(n)>gi&&++o<ui);return r}function me(t,e,a,i){if(t===e&&a===i)return Q;const s=n=>hi(n,0,1,t,a);return n=>n===0||n===1?n:aa(s(n),e,i)}const ia=t=>e=>e<=.5?t(2*e)/2:(2-t(2*(1-e)))/2,sa=t=>e=>1-t(1-e),na=me(.33,1.53,.69,.99),tt=sa(na),ra=ia(tt),oa=t=>(t*=2)<1?.5*tt(t):.5*(2-Math.pow(2,-10*(t-1))),at=t=>1-Math.sin(Math.acos(t)),mi=sa(at),la=ia(at),fi=me(.42,0,1,1),bi=me(0,0,.58,1),ca=me(.42,0,.58,1),da=t=>Array.isArray(t)&&typeof t[0]!="number";function pa(t,e){return da(t)?t[pi(0,t.length,e)]:t}const ga=t=>Array.isArray(t)&&typeof t[0]=="number",xi={linear:Q,easeIn:fi,easeInOut:ca,easeOut:bi,circIn:at,circInOut:la,circOut:mi,backIn:tt,backInOut:ra,backOut:na,anticipate:oa},vi=t=>typeof t=="string",Et=t=>{if(ga(t)){Ze(t.length===4);const[e,a,i,s]=t;return me(e,a,i,s)}else if(vi(t))return xi[t];return t},we=["setup","read","resolveKeyframes","preUpdate","update","preRender","render","postRender"];function yi(t,e){let a=new Set,i=new Set,s=!1,n=!1;const r=new WeakSet;let o={delta:0,timestamp:0,isProcessing:!1};function l(c){r.has(c)&&(d.schedule(c),t()),c(o)}const d={schedule:(c,p=!1,g=!1)=>{const x=g&&s?a:i;return p&&r.add(c),x.has(c)||x.add(c),c},cancel:c=>{i.delete(c),r.delete(c)},process:c=>{if(o=c,s){n=!0;return}s=!0,[a,i]=[i,a],a.forEach(l),a.clear(),s=!1,n&&(n=!1,d.process(c))}};return d}const wi=40;function ua(t,e){let a=!1,i=!0;const s={delta:0,timestamp:0,isProcessing:!1},n=()=>a=!0,r=we.reduce((T,k)=>(T[k]=yi(n),T),{}),{setup:o,read:l,resolveKeyframes:d,preUpdate:c,update:p,preRender:g,render:h,postRender:x}=r,b=()=>{const T=j.useManualTiming?s.timestamp:performance.now();a=!1,j.useManualTiming||(s.delta=i?1e3/60:Math.max(Math.min(T-s.timestamp,wi),1)),s.timestamp=T,s.isProcessing=!0,o.process(s),l.process(s),d.process(s),c.process(s),p.process(s),g.process(s),h.process(s),x.process(s),s.isProcessing=!1,a&&e&&(i=!1,t(b))},y=()=>{a=!0,i=!0,s.isProcessing||t(b)};return{schedule:we.reduce((T,k)=>{const m=r[k];return T[k]=(w,A=!1,f=!1)=>(a||y(),m.schedule(w,A,f)),T},{}),cancel:T=>{for(let k=0;k<we.length;k++)r[we[k]].cancel(T)},state:s,steps:r}}const{schedule:N,cancel:Fe,state:Se}=ua(typeof requestAnimationFrame<"u"?requestAnimationFrame:Q,!0);let Ee;function Ti(){Ee=void 0}const V={now:()=>(Ee===void 0&&V.set(Se.isProcessing||j.useManualTiming?Se.timestamp:performance.now()),Ee),set:t=>{Ee=t,queueMicrotask(Ti)}},ha=t=>e=>typeof e=="string"&&e.startsWith(t),ma=ha("--"),ki=ha("var(--"),it=t=>ki(t)?Ei.test(t.split("/*")[0].trim()):!1,Ei=/var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;function St(t){return typeof t!="string"?!1:t.split("/*")[0].includes("var(--")}const J={test:t=>typeof t=="number",parse:parseFloat,transform:t=>t},de={...J,transform:t=>z(0,1,t)},Te={...J,default:1},le=t=>Math.round(t*1e5)/1e5,st=/-?(?:\d+(?:\.\d+)?|\.\d+)/gu;function Si(t){return t==null}const Ai=/^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu,nt=(t,e)=>a=>!!(typeof a=="string"&&Ai.test(a)&&a.startsWith(t)||e&&!Si(a)&&Object.prototype.hasOwnProperty.call(a,e)),fa=(t,e,a)=>i=>{if(typeof i!="string")return i;const[s,n,r,o]=i.match(st);return{[t]:parseFloat(s),[e]:parseFloat(n),[a]:parseFloat(r),alpha:o!==void 0?parseFloat(o):1}},Mi=t=>z(0,255,t),Le={...J,transform:t=>Math.round(Mi(t))},W={test:nt("rgb","red"),parse:fa("red","green","blue"),transform:({red:t,green:e,blue:a,alpha:i=1})=>"rgba("+Le.transform(t)+", "+Le.transform(e)+", "+Le.transform(a)+", "+le(de.transform(i))+")"};function Ci(t){let e="",a="",i="",s="";return t.length>5?(e=t.substring(1,3),a=t.substring(3,5),i=t.substring(5,7),s=t.substring(7,9)):(e=t.substring(1,2),a=t.substring(2,3),i=t.substring(3,4),s=t.substring(4,5),e+=e,a+=a,i+=i,s+=s),{red:parseInt(e,16),green:parseInt(a,16),blue:parseInt(i,16),alpha:s?parseInt(s,16)/255:1}}const Oe={test:nt("#"),parse:Ci,transform:W.transform},fe=t=>({test:e=>typeof e=="string"&&e.endsWith(t)&&e.split(" ").length===1,parse:parseFloat,transform:e=>`${e}${t}`}),H=fe("deg"),Z=fe("%"),u=fe("px"),Ii=fe("vh"),Li=fe("vw"),At={...Z,parse:t=>Z.parse(t)/100,transform:t=>Z.transform(t*100)},X={test:nt("hsl","hue"),parse:fa("hue","saturation","lightness"),transform:({hue:t,saturation:e,lightness:a,alpha:i=1})=>"hsla("+Math.round(t)+", "+Z.transform(le(e))+", "+Z.transform(le(a))+", "+le(de.transform(i))+")"},C={test:t=>W.test(t)||Oe.test(t)||X.test(t),parse:t=>W.test(t)?W.parse(t):X.test(t)?X.parse(t):Oe.parse(t),transform:t=>typeof t=="string"?t:t.hasOwnProperty("red")?W.transform(t):X.transform(t),getAnimatableNone:t=>{const e=C.parse(t);return e.alpha=0,C.transform(e)}},Vi=/(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;function Pi(t){return isNaN(t)&&typeof t=="string"&&(t.match(st)?.length||0)+(t.match(Vi)?.length||0)>0}const ba="number",xa="color",Bi="var",Di="var(",Mt="${}",Ri=/var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;function pe(t){const e=t.toString(),a=[],i={color:[],number:[],var:[]},s=[];let n=0;const o=e.replace(Ri,l=>(C.test(l)?(i.color.push(n),s.push(xa),a.push(C.parse(l))):l.startsWith(Di)?(i.var.push(n),s.push(Bi),a.push(l)):(i.number.push(n),s.push(ba),a.push(parseFloat(l))),++n,Mt)).split(Mt);return{values:a,split:o,indexes:i,types:s}}function va(t){return pe(t).values}function ya(t){const{split:e,types:a}=pe(t),i=e.length;return s=>{let n="";for(let r=0;r<i;r++)if(n+=e[r],s[r]!==void 0){const o=a[r];o===ba?n+=le(s[r]):o===xa?n+=C.transform(s[r]):n+=s[r]}return n}}const Fi=t=>typeof t=="number"?0:C.test(t)?C.getAnimatableNone(t):t;function Oi(t){const e=va(t);return ya(t)(e.map(Fi))}const U={test:Pi,parse:va,createTransformer:ya,getAnimatableNone:Oi};function Ve(t,e,a){return a<0&&(a+=1),a>1&&(a-=1),a<1/6?t+(e-t)*6*a:a<1/2?e:a<2/3?t+(e-t)*(2/3-a)*6:t}function $i({hue:t,saturation:e,lightness:a,alpha:i}){t/=360,e/=100,a/=100;let s=0,n=0,r=0;if(!e)s=n=r=a;else{const o=a<.5?a*(1+e):a+e-a*e,l=2*a-o;s=Ve(l,o,t+1/3),n=Ve(l,o,t),r=Ve(l,o,t-1/3)}return{red:Math.round(s*255),green:Math.round(n*255),blue:Math.round(r*255),alpha:i}}function Ae(t,e){return a=>a>0?e:t}const ee=(t,e,a)=>t+(e-t)*a,Pe=(t,e,a)=>{const i=t*t,s=a*(e*e-i)+i;return s<0?0:Math.sqrt(s)},ji=[Oe,W,X],Ni=t=>ji.find(e=>e.test(t));function Ct(t){const e=Ni(t);if(!e)return!1;let a=e.parse(t);return e===X&&(a=$i(a)),a}const It=(t,e)=>{const a=Ct(t),i=Ct(e);if(!a||!i)return Ae(t,e);const s={...a};return n=>(s.red=Pe(a.red,i.red,n),s.green=Pe(a.green,i.green,n),s.blue=Pe(a.blue,i.blue,n),s.alpha=ee(a.alpha,i.alpha,n),W.transform(s))},$e=new Set(["none","hidden"]);function _i(t,e){return $e.has(t)?a=>a<=0?t:e:a=>a>=1?e:t}function Hi(t,e){return a=>ee(t,e,a)}function rt(t){return typeof t=="number"?Hi:typeof t=="string"?it(t)?Ae:C.test(t)?It:zi:Array.isArray(t)?wa:typeof t=="object"?C.test(t)?It:qi:Ae}function wa(t,e){const a=[...t],i=a.length,s=t.map((n,r)=>rt(n)(n,e[r]));return n=>{for(let r=0;r<i;r++)a[r]=s[r](n);return a}}function qi(t,e){const a={...t,...e},i={};for(const s in a)t[s]!==void 0&&e[s]!==void 0&&(i[s]=rt(t[s])(t[s],e[s]));return s=>{for(const n in i)a[n]=i[n](s);return a}}function Ki(t,e){const a=[],i={color:0,var:0,number:0};for(let s=0;s<e.values.length;s++){const n=e.types[s],r=t.indexes[n][i[n]],o=t.values[r]??0;a[s]=o,i[n]++}return a}const zi=(t,e)=>{const a=U.createTransformer(e),i=pe(t),s=pe(e);return i.indexes.var.length===s.indexes.var.length&&i.indexes.color.length===s.indexes.color.length&&i.indexes.number.length>=s.indexes.number.length?$e.has(t)&&!s.values.length||$e.has(e)&&!i.values.length?_i(t,e):Je(wa(Ki(i,s),s.values),a):Ae(t,e)};function Ta(t,e,a){return typeof t=="number"&&typeof e=="number"&&typeof a=="number"?ee(t,e,a):rt(t)(t,e)}const Ui=t=>{const e=({timestamp:a})=>t(a);return{start:(a=!0)=>N.update(e,a),stop:()=>Fe(e),now:()=>Se.isProcessing?Se.timestamp:V.now()}},ka=(t,e,a=10)=>{let i="";const s=Math.max(Math.round(e/a),2);for(let n=0;n<s;n++)i+=Math.round(t(n/(s-1))*1e4)/1e4+", ";return`linear(${i.substring(0,i.length-2)})`},Me=2e4;function ot(t){let e=0;const a=50;let i=t.next(e);for(;!i.done&&e<Me;)e+=a,i=t.next(e);return e>=Me?1/0:e}function Ea(t,e=100,a){const i=a({...t,keyframes:[0,e]}),s=Math.min(ot(i),Me);return{type:"keyframes",ease:n=>i.next(s*n).value/e,duration:B(s)}}const Wi=5;function Sa(t,e,a){const i=Math.max(e-Wi,0);return ta(a-t(i),e-i)}const M={stiffness:100,damping:10,mass:1,velocity:0,duration:800,bounce:.3,visualDuration:.3,restSpeed:{granular:.01,default:2},restDelta:{granular:.005,default:.5},minDuration:.01,maxDuration:10,minDamping:.05,maxDamping:1},Be=.001;function Gi({duration:t=M.duration,bounce:e=M.bounce,velocity:a=M.velocity,mass:i=M.mass}){let s,n,r=1-e;r=z(M.minDamping,M.maxDamping,r),t=z(M.minDuration,M.maxDuration,B(t)),r<1?(s=d=>{const c=d*r,p=c*t,g=c-a,h=je(d,r),x=Math.exp(-p);return Be-g/h*x},n=d=>{const p=d*r*t,g=p*a+a,h=Math.pow(r,2)*Math.pow(d,2)*t,x=Math.exp(-p),b=je(Math.pow(d,2),r);return(-s(d)+Be>0?-1:1)*((g-h)*x)/b}):(s=d=>{const c=Math.exp(-d*t),p=(d-a)*t+1;return-Be+c*p},n=d=>{const c=Math.exp(-d*t),p=(a-d)*(t*t);return c*p});const o=5/t,l=Xi(s,n,o);if(t=$(t),isNaN(l))return{stiffness:M.stiffness,damping:M.damping,duration:t};{const d=Math.pow(l,2)*i;return{stiffness:d,damping:r*2*Math.sqrt(i*d),duration:t}}}const Yi=12;function Xi(t,e,a){let i=a;for(let s=1;s<Yi;s++)i=i-t(i)/e(i);return i}function je(t,e){return t*Math.sqrt(1-e*e)}const Zi=["duration","bounce"],Qi=["stiffness","damping","mass"];function Lt(t,e){return e.some(a=>t[a]!==void 0)}function Ji(t){let e={velocity:M.velocity,stiffness:M.stiffness,damping:M.damping,mass:M.mass,isResolvedFromDuration:!1,...t};if(!Lt(t,Qi)&&Lt(t,Zi))if(t.visualDuration){const a=t.visualDuration,i=2*Math.PI/(a*1.2),s=i*i,n=2*z(.05,1,1-(t.bounce||0))*Math.sqrt(s);e={...e,mass:M.mass,stiffness:s,damping:n}}else{const a=Gi(t);e={...e,...a,mass:M.mass},e.isResolvedFromDuration=!0}return e}function ge(t=M.visualDuration,e=M.bounce){const a=typeof t!="object"?{visualDuration:t,keyframes:[0,1],bounce:e}:t;let{restSpeed:i,restDelta:s}=a;const n=a.keyframes[0],r=a.keyframes[a.keyframes.length-1],o={done:!1,value:n},{stiffness:l,damping:d,mass:c,duration:p,velocity:g,isResolvedFromDuration:h}=Ji({...a,velocity:-B(a.velocity||0)}),x=g||0,b=d/(2*Math.sqrt(l*c)),y=r-n,v=B(Math.sqrt(l/c)),S=Math.abs(y)<5;i||(i=S?M.restSpeed.granular:M.restSpeed.default),s||(s=S?M.restDelta.granular:M.restDelta.default);let T;if(b<1){const m=je(v,b);T=w=>{const A=Math.exp(-b*v*w);return r-A*((x+b*v*y)/m*Math.sin(m*w)+y*Math.cos(m*w))}}else if(b===1)T=m=>r-Math.exp(-v*m)*(y+(x+v*y)*m);else{const m=v*Math.sqrt(b*b-1);T=w=>{const A=Math.exp(-b*v*w),f=Math.min(m*w,300);return r-A*((x+b*v*y)*Math.sinh(f)+m*y*Math.cosh(f))/m}}const k={calculatedDuration:h&&p||null,next:m=>{const w=T(m);if(h)o.done=m>=p;else{let A=m===0?x:0;b<1&&(A=m===0?$(x):Sa(T,m,w));const f=Math.abs(A)<=i,E=Math.abs(r-w)<=s;o.done=f&&E}return o.value=o.done?r:w,o},toString:()=>{const m=Math.min(ot(k),Me),w=ka(A=>k.next(m*A).value,m,30);return m+"ms "+w},toTransition:()=>{}};return k}ge.applyToOptions=t=>{const e=Ea(t,100,ge);return t.ease=e.ease,t.duration=$(e.duration),t.type="keyframes",t};function Ne({keyframes:t,velocity:e=0,power:a=.8,timeConstant:i=325,bounceDamping:s=10,bounceStiffness:n=500,modifyTarget:r,min:o,max:l,restDelta:d=.5,restSpeed:c}){const p=t[0],g={done:!1,value:p},h=f=>o!==void 0&&f<o||l!==void 0&&f>l,x=f=>o===void 0?l:l===void 0||Math.abs(o-f)<Math.abs(l-f)?o:l;let b=a*e;const y=p+b,v=r===void 0?y:r(y);v!==y&&(b=v-p);const S=f=>-b*Math.exp(-f/i),T=f=>v+S(f),k=f=>{const E=S(f),L=T(f);g.done=Math.abs(E)<=d,g.value=g.done?v:L};let m,w;const A=f=>{h(g.value)&&(m=f,w=ge({keyframes:[g.value,x(g.value)],velocity:Sa(T,f,g.value),damping:s,stiffness:n,restDelta:d,restSpeed:c}))};return A(0),{calculatedDuration:null,next:f=>{let E=!1;return!w&&m===void 0&&(E=!0,k(f),A(f)),m!==void 0&&f>=m?w.next(f-m):(!E&&k(f),g)}}}function es(t,e,a){const i=[],s=a||j.mix||Ta,n=t.length-1;for(let r=0;r<n;r++){let o=s(t[r],t[r+1]);if(e){const l=Array.isArray(e)?e[r]||Q:e;o=Je(l,o)}i.push(o)}return i}function ts(t,e,{clamp:a=!0,ease:i,mixer:s}={}){const n=t.length;if(Ze(n===e.length),n===1)return()=>e[0];if(n===2&&e[0]===e[1])return()=>e[1];const r=t[0]===t[1];t[0]>t[n-1]&&(t=[...t].reverse(),e=[...e].reverse());const o=es(e,i,s),l=o.length,d=c=>{if(r&&c<t[0])return e[0];let p=0;if(l>1)for(;p<t.length-2&&!(c<t[p+1]);p++);const g=et(t[p],t[p+1],c);return o[p](g)};return a?c=>d(z(t[0],t[n-1],c)):d}function Aa(t,e){const a=t[t.length-1];for(let i=1;i<=e;i++){const s=et(0,e,i);t.push(ee(a,1,s))}}function Ma(t){const e=[0];return Aa(e,t.length-1),e}function as(t,e){return t.map(a=>a*e)}function is(t,e){return t.map(()=>e||ca).splice(0,t.length-1)}function ce({duration:t=300,keyframes:e,times:a,ease:i="easeInOut"}){const s=da(i)?i.map(Et):Et(i),n={done:!1,value:e[0]},r=as(a&&a.length===e.length?a:Ma(e),t),o=ts(r,e,{ease:Array.isArray(s)?s:is(e,s)});return{calculatedDuration:t,next:l=>(n.value=o(l),n.done=l>=t,n)}}const ss=t=>t!==null;function lt(t,{repeat:e,repeatType:a="loop"},i,s=1){const n=t.filter(ss),o=s<0||e&&a!=="loop"&&e%2===1?0:n.length-1;return!o||i===void 0?n[o]:i}const ns={decay:Ne,inertia:Ne,tween:ce,keyframes:ce,spring:ge};function Ca(t){typeof t.type=="string"&&(t.type=ns[t.type])}class ct{constructor(){this.updateFinished()}get finished(){return this._finished}updateFinished(){this._finished=new Promise(e=>{this.resolve=e})}notifyFinished(){this.resolve()}then(e,a){return this.finished.then(e,a)}}const rs=t=>t/100;class dt extends ct{constructor(e){super(),this.state="idle",this.startTime=null,this.isStopped=!1,this.currentTime=0,this.holdTime=null,this.playbackSpeed=1,this.stop=()=>{const{motionValue:a}=this.options;a&&a.updatedAt!==V.now()&&this.tick(V.now()),this.isStopped=!0,this.state!=="idle"&&(this.teardown(),this.options.onStop?.())},this.options=e,this.initAnimation(),this.play(),e.autoplay===!1&&this.pause()}initAnimation(){const{options:e}=this;Ca(e);const{type:a=ce,repeat:i=0,repeatDelay:s=0,repeatType:n,velocity:r=0}=e;let{keyframes:o}=e;const l=a||ce;l!==ce&&typeof o[0]!="number"&&(this.mixKeyframes=Je(rs,Ta(o[0],o[1])),o=[0,100]);const d=l({...e,keyframes:o});n==="mirror"&&(this.mirroredGenerator=l({...e,keyframes:[...o].reverse(),velocity:-r})),d.calculatedDuration===null&&(d.calculatedDuration=ot(d));const{calculatedDuration:c}=d;this.calculatedDuration=c,this.resolvedDuration=c+s,this.totalDuration=this.resolvedDuration*(i+1)-s,this.generator=d}updateTime(e){const a=Math.round(e-this.startTime)*this.playbackSpeed;this.holdTime!==null?this.currentTime=this.holdTime:this.currentTime=a}tick(e,a=!1){const{generator:i,totalDuration:s,mixKeyframes:n,mirroredGenerator:r,resolvedDuration:o,calculatedDuration:l}=this;if(this.startTime===null)return i.next(0);const{delay:d=0,keyframes:c,repeat:p,repeatType:g,repeatDelay:h,type:x,onUpdate:b,finalKeyframe:y}=this.options;this.speed>0?this.startTime=Math.min(this.startTime,e):this.speed<0&&(this.startTime=Math.min(e-s/this.speed,this.startTime)),a?this.currentTime=e:this.updateTime(e);const v=this.currentTime-d*(this.playbackSpeed>=0?1:-1),S=this.playbackSpeed>=0?v<0:v>s;this.currentTime=Math.max(v,0),this.state==="finished"&&this.holdTime===null&&(this.currentTime=s);let T=this.currentTime,k=i;if(p){const f=Math.min(this.currentTime,s)/o;let E=Math.floor(f),L=f%1;!L&&f>=1&&(L=1),L===1&&E--,E=Math.min(E,p+1),E%2&&(g==="reverse"?(L=1-L,h&&(L-=h/o)):g==="mirror"&&(k=r)),T=z(0,1,L)*o}const m=S?{done:!1,value:c[0]}:k.next(T);n&&(m.value=n(m.value));let{done:w}=m;!S&&l!==null&&(w=this.playbackSpeed>=0?this.currentTime>=s:this.currentTime<=0);const A=this.holdTime===null&&(this.state==="finished"||this.state==="running"&&w);return A&&x!==Ne&&(m.value=lt(c,this.options,y,this.speed)),b&&b(m.value),A&&this.finish(),m}then(e,a){return this.finished.then(e,a)}get duration(){return B(this.calculatedDuration)}get iterationDuration(){const{delay:e=0}=this.options||{};return this.duration+B(e)}get time(){return B(this.currentTime)}set time(e){e=$(e),this.currentTime=e,this.startTime===null||this.holdTime!==null||this.playbackSpeed===0?this.holdTime=e:this.driver&&(this.startTime=this.driver.now()-e/this.playbackSpeed),this.driver?.start(!1)}get speed(){return this.playbackSpeed}set speed(e){this.updateTime(V.now());const a=this.playbackSpeed!==e;this.playbackSpeed=e,a&&(this.time=B(this.currentTime))}play(){if(this.isStopped)return;const{driver:e=Ui,startTime:a}=this.options;this.driver||(this.driver=e(s=>this.tick(s))),this.options.onPlay?.();const i=this.driver.now();this.state==="finished"?(this.updateFinished(),this.startTime=i):this.holdTime!==null?this.startTime=i-this.holdTime:this.startTime||(this.startTime=a??i),this.state==="finished"&&this.speed<0&&(this.startTime+=this.calculatedDuration),this.holdTime=null,this.state="running",this.driver.start()}pause(){this.state="paused",this.updateTime(V.now()),this.holdTime=this.currentTime}complete(){this.state!=="running"&&this.play(),this.state="finished",this.holdTime=null}finish(){this.notifyFinished(),this.teardown(),this.state="finished",this.options.onComplete?.()}cancel(){this.holdTime=null,this.startTime=0,this.tick(0),this.teardown(),this.options.onCancel?.()}teardown(){this.state="idle",this.stopDriver(),this.startTime=this.holdTime=null}stopDriver(){this.driver&&(this.driver.stop(),this.driver=void 0)}sample(e){return this.startTime=0,this.tick(e,!0)}attachTimeline(e){return this.options.allowFlatten&&(this.options.type="keyframes",this.options.ease="linear",this.initAnimation()),this.driver?.stop(),e.observe(this)}}function os(t){for(let e=1;e<t.length;e++)t[e]??(t[e]=t[e-1])}const G=t=>t*180/Math.PI,_e=t=>{const e=G(Math.atan2(t[1],t[0]));return He(e)},ls={x:4,y:5,translateX:4,translateY:5,scaleX:0,scaleY:3,scale:t=>(Math.abs(t[0])+Math.abs(t[3]))/2,rotate:_e,rotateZ:_e,skewX:t=>G(Math.atan(t[1])),skewY:t=>G(Math.atan(t[2])),skew:t=>(Math.abs(t[1])+Math.abs(t[2]))/2},He=t=>(t=t%360,t<0&&(t+=360),t),Vt=_e,Pt=t=>Math.sqrt(t[0]*t[0]+t[1]*t[1]),Bt=t=>Math.sqrt(t[4]*t[4]+t[5]*t[5]),cs={x:12,y:13,z:14,translateX:12,translateY:13,translateZ:14,scaleX:Pt,scaleY:Bt,scale:t=>(Pt(t)+Bt(t))/2,rotateX:t=>He(G(Math.atan2(t[6],t[5]))),rotateY:t=>He(G(Math.atan2(-t[2],t[0]))),rotateZ:Vt,rotate:Vt,skewX:t=>G(Math.atan(t[4])),skewY:t=>G(Math.atan(t[1])),skew:t=>(Math.abs(t[1])+Math.abs(t[4]))/2};function qe(t){return t.includes("scale")?1:0}function Ke(t,e){if(!t||t==="none")return qe(e);const a=t.match(/^matrix3d\(([-\d.e\s,]+)\)$/u);let i,s;if(a)i=cs,s=a;else{const o=t.match(/^matrix\(([-\d.e\s,]+)\)$/u);i=ls,s=o}if(!s)return qe(e);const n=i[e],r=s[1].split(",").map(ps);return typeof n=="function"?n(r):r[n]}const ds=(t,e)=>{const{transform:a="none"}=getComputedStyle(t);return Ke(a,e)};function ps(t){return parseFloat(t.trim())}const te=["transformPerspective","x","y","z","translateX","translateY","translateZ","scale","scaleX","scaleY","rotate","rotateX","rotateY","rotateZ","skew","skewX","skewY"],ae=new Set(te),Dt=t=>t===J||t===u,gs=new Set(["x","y","z"]),us=te.filter(t=>!gs.has(t));function hs(t){const e=[];return us.forEach(a=>{const i=t.getValue(a);i!==void 0&&(e.push([a,i.get()]),i.set(a.startsWith("scale")?1:0))}),e}const q={width:({x:t},{paddingLeft:e="0",paddingRight:a="0"})=>t.max-t.min-parseFloat(e)-parseFloat(a),height:({y:t},{paddingTop:e="0",paddingBottom:a="0"})=>t.max-t.min-parseFloat(e)-parseFloat(a),top:(t,{top:e})=>parseFloat(e),left:(t,{left:e})=>parseFloat(e),bottom:({y:t},{top:e})=>parseFloat(e)+(t.max-t.min),right:({x:t},{left:e})=>parseFloat(e)+(t.max-t.min),x:(t,{transform:e})=>Ke(e,"x"),y:(t,{transform:e})=>Ke(e,"y")};q.translateX=q.x;q.translateY=q.y;const Y=new Set;let ze=!1,Ue=!1,We=!1;function Ia(){if(Ue){const t=Array.from(Y).filter(i=>i.needsMeasurement),e=new Set(t.map(i=>i.element)),a=new Map;e.forEach(i=>{const s=hs(i);s.length&&(a.set(i,s),i.render())}),t.forEach(i=>i.measureInitialState()),e.forEach(i=>{i.render();const s=a.get(i);s&&s.forEach(([n,r])=>{i.getValue(n)?.set(r)})}),t.forEach(i=>i.measureEndState()),t.forEach(i=>{i.suspendedScrollY!==void 0&&window.scrollTo(0,i.suspendedScrollY)})}Ue=!1,ze=!1,Y.forEach(t=>t.complete(We)),Y.clear()}function La(){Y.forEach(t=>{t.readKeyframes(),t.needsMeasurement&&(Ue=!0)})}function ms(){We=!0,La(),Ia(),We=!1}class pt{constructor(e,a,i,s,n,r=!1){this.state="pending",this.isAsync=!1,this.needsMeasurement=!1,this.unresolvedKeyframes=[...e],this.onComplete=a,this.name=i,this.motionValue=s,this.element=n,this.isAsync=r}scheduleResolve(){this.state="scheduled",this.isAsync?(Y.add(this),ze||(ze=!0,N.read(La),N.resolveKeyframes(Ia))):(this.readKeyframes(),this.complete())}readKeyframes(){const{unresolvedKeyframes:e,name:a,element:i,motionValue:s}=this;if(e[0]===null){const n=s?.get(),r=e[e.length-1];if(n!==void 0)e[0]=n;else if(i&&a){const o=i.readValue(a,r);o!=null&&(e[0]=o)}e[0]===void 0&&(e[0]=r),s&&n===void 0&&s.set(e[0])}os(e)}setFinalKeyframe(){}measureInitialState(){}renderEndStyles(){}measureEndState(){}complete(e=!1){this.state="complete",this.onComplete(this.unresolvedKeyframes,this.finalKeyframe,e),Y.delete(this)}cancel(){this.state==="scheduled"&&(Y.delete(this),this.state="pending")}resume(){this.state==="pending"&&this.scheduleResolve()}}const fs=t=>t.startsWith("--");function bs(t,e,a){fs(e)?t.style.setProperty(e,a):t.style[e]=a}const xs=Qe(()=>window.ScrollTimeline!==void 0),vs={};function ys(t,e){const a=Qe(t);return()=>vs[e]??a()}const Va=ys(()=>{try{document.createElement("div").animate({opacity:0},{easing:"linear(0, 1)"})}catch{return!1}return!0},"linearEasing"),oe=([t,e,a,i])=>`cubic-bezier(${t}, ${e}, ${a}, ${i})`,Rt={linear:"linear",ease:"ease",easeIn:"ease-in",easeOut:"ease-out",easeInOut:"ease-in-out",circIn:oe([0,.65,.55,1]),circOut:oe([.55,0,1,.45]),backIn:oe([.31,.01,.66,-.59]),backOut:oe([.33,1.53,.69,.99])};function Pa(t,e){if(t)return typeof t=="function"?Va()?ka(t,e):"ease-out":ga(t)?oe(t):Array.isArray(t)?t.map(a=>Pa(a,e)||Rt.easeOut):Rt[t]}function ws(t,e,a,{delay:i=0,duration:s=300,repeat:n=0,repeatType:r="loop",ease:o="easeOut",times:l}={},d=void 0){const c={[e]:a};l&&(c.offset=l);const p=Pa(o,s);Array.isArray(p)&&(c.easing=p);const g={delay:i,duration:s,easing:Array.isArray(p)?"linear":p,fill:"both",iterations:n+1,direction:r==="reverse"?"alternate":"normal"};return d&&(g.pseudoElement=d),t.animate(c,g)}function gt(t){return typeof t=="function"&&"applyToOptions"in t}function Ts({type:t,...e}){return gt(t)&&Va()?t.applyToOptions(e):(e.duration??(e.duration=300),e.ease??(e.ease="easeOut"),e)}class ks extends ct{constructor(e){if(super(),this.finishedTime=null,this.isStopped=!1,this.manualStartTime=null,!e)return;const{element:a,name:i,keyframes:s,pseudoElement:n,allowFlatten:r=!1,finalKeyframe:o,onComplete:l}=e;this.isPseudoElement=!!n,this.allowFlatten=r,this.options=e,Ze(typeof e.type!="string");const d=Ts(e);this.animation=ws(a,i,s,d,n),d.autoplay===!1&&this.animation.pause(),this.animation.onfinish=()=>{if(this.finishedTime=this.time,!n){const c=lt(s,this.options,o,this.speed);this.updateMotionValue?this.updateMotionValue(c):bs(a,i,c),this.animation.cancel()}l?.(),this.notifyFinished()}}play(){this.isStopped||(this.manualStartTime=null,this.animation.play(),this.state==="finished"&&this.updateFinished())}pause(){this.animation.pause()}complete(){this.animation.finish?.()}cancel(){try{this.animation.cancel()}catch{}}stop(){if(this.isStopped)return;this.isStopped=!0;const{state:e}=this;e==="idle"||e==="finished"||(this.updateMotionValue?this.updateMotionValue():this.commitStyles(),this.isPseudoElement||this.cancel())}commitStyles(){this.isPseudoElement||this.animation.commitStyles?.()}get duration(){const e=this.animation.effect?.getComputedTiming?.().duration||0;return B(Number(e))}get iterationDuration(){const{delay:e=0}=this.options||{};return this.duration+B(e)}get time(){return B(Number(this.animation.currentTime)||0)}set time(e){this.manualStartTime=null,this.finishedTime=null,this.animation.currentTime=$(e)}get speed(){return this.animation.playbackRate}set speed(e){e<0&&(this.finishedTime=null),this.animation.playbackRate=e}get state(){return this.finishedTime!==null?"finished":this.animation.playState}get startTime(){return this.manualStartTime??Number(this.animation.startTime)}set startTime(e){this.manualStartTime=this.animation.startTime=e}attachTimeline({timeline:e,observe:a}){return this.allowFlatten&&this.animation.effect?.updateTiming({easing:"linear"}),this.animation.onfinish=null,e&&xs()?(this.animation.timeline=e,Q):a(this)}}const Ba={anticipate:oa,backInOut:ra,circInOut:la};function Es(t){return t in Ba}function Ss(t){typeof t.ease=="string"&&Es(t.ease)&&(t.ease=Ba[t.ease])}const De=10;class As extends ks{constructor(e){Ss(e),Ca(e),super(e),e.startTime!==void 0&&(this.startTime=e.startTime),this.options=e}updateMotionValue(e){const{motionValue:a,onUpdate:i,onComplete:s,element:n,...r}=this.options;if(!a)return;if(e!==void 0){a.set(e);return}const o=new dt({...r,autoplay:!1}),l=Math.max(De,V.now()-this.startTime),d=z(0,De,l-De);a.setWithVelocity(o.sample(Math.max(0,l-d)).value,o.sample(l).value,d),o.stop()}}const Ft=(t,e)=>e==="zIndex"?!1:!!(typeof t=="number"||Array.isArray(t)||typeof t=="string"&&(U.test(t)||t==="0")&&!t.startsWith("url("));function Ms(t){const e=t[0];if(t.length===1)return!0;for(let a=0;a<t.length;a++)if(t[a]!==e)return!0}function Cs(t,e,a,i){const s=t[0];if(s===null)return!1;if(e==="display"||e==="visibility")return!0;const n=t[t.length-1],r=Ft(s,e),o=Ft(n,e);return!r||!o?!1:Ms(t)||(a==="spring"||gt(a))&&i}function Ge(t){t.duration=0,t.type="keyframes"}const Is=new Set(["opacity","clipPath","filter","transform"]),Ls=Qe(()=>Object.hasOwnProperty.call(Element.prototype,"animate"));function Vs(t){const{motionValue:e,name:a,repeatDelay:i,repeatType:s,damping:n,type:r}=t;if(!(e?.owner?.current instanceof HTMLElement))return!1;const{onUpdate:l,transformTemplate:d}=e.owner.getProps();return Ls()&&a&&Is.has(a)&&(a!=="transform"||!d)&&!l&&!i&&s!=="mirror"&&n!==0&&r!=="inertia"}const Ps=40;class Bs extends ct{constructor({autoplay:e=!0,delay:a=0,type:i="keyframes",repeat:s=0,repeatDelay:n=0,repeatType:r="loop",keyframes:o,name:l,motionValue:d,element:c,...p}){super(),this.stop=()=>{this._animation&&(this._animation.stop(),this.stopTimeline?.()),this.keyframeResolver?.cancel()},this.createdAt=V.now();const g={autoplay:e,delay:a,type:i,repeat:s,repeatDelay:n,repeatType:r,name:l,motionValue:d,element:c,...p},h=c?.KeyframeResolver||pt;this.keyframeResolver=new h(o,(x,b,y)=>this.onKeyframesResolved(x,b,g,!y),l,d,c),this.keyframeResolver?.scheduleResolve()}onKeyframesResolved(e,a,i,s){this.keyframeResolver=void 0;const{name:n,type:r,velocity:o,delay:l,isHandoff:d,onUpdate:c}=i;this.resolvedAt=V.now(),Cs(e,n,r,o)||((j.instantAnimations||!l)&&c?.(lt(e,i,a)),e[0]=e[e.length-1],Ge(i),i.repeat=0);const g={startTime:s?this.resolvedAt?this.resolvedAt-this.createdAt>Ps?this.resolvedAt:this.createdAt:this.createdAt:void 0,finalKeyframe:a,...i,keyframes:e},h=!d&&Vs(g)?new As({...g,element:g.motionValue.owner.current}):new dt(g);h.finished.then(()=>this.notifyFinished()).catch(Q),this.pendingTimeline&&(this.stopTimeline=h.attachTimeline(this.pendingTimeline),this.pendingTimeline=void 0),this._animation=h}get finished(){return this._animation?this.animation.finished:this._finished}then(e,a){return this.finished.finally(e).then(()=>{})}get animation(){return this._animation||(this.keyframeResolver?.resume(),ms()),this._animation}get duration(){return this.animation.duration}get iterationDuration(){return this.animation.iterationDuration}get time(){return this.animation.time}set time(e){this.animation.time=e}get speed(){return this.animation.speed}get state(){return this.animation.state}set speed(e){this.animation.speed=e}get startTime(){return this.animation.startTime}attachTimeline(e){return this._animation?this.stopTimeline=this.animation.attachTimeline(e):this.pendingTimeline=e,()=>this.stop()}play(){this.animation.play()}pause(){this.animation.pause()}complete(){this.animation.complete()}cancel(){this._animation&&this.animation.cancel(),this.keyframeResolver?.cancel()}}class Ds{constructor(e){this.stop=()=>this.runAll("stop"),this.animations=e.filter(Boolean)}get finished(){return Promise.all(this.animations.map(e=>e.finished))}getAll(e){return this.animations[0][e]}setAll(e,a){for(let i=0;i<this.animations.length;i++)this.animations[i][e]=a}attachTimeline(e){const a=this.animations.map(i=>i.attachTimeline(e));return()=>{a.forEach((i,s)=>{i&&i(),this.animations[s].stop()})}}get time(){return this.getAll("time")}set time(e){this.setAll("time",e)}get speed(){return this.getAll("speed")}set speed(e){this.setAll("speed",e)}get state(){return this.getAll("state")}get startTime(){return this.getAll("startTime")}get duration(){return Ot(this.animations,"duration")}get iterationDuration(){return Ot(this.animations,"iterationDuration")}runAll(e){this.animations.forEach(a=>a[e]())}play(){this.runAll("play")}pause(){this.runAll("pause")}cancel(){this.runAll("cancel")}complete(){this.runAll("complete")}}function Ot(t,e){let a=0;for(let i=0;i<t.length;i++){const s=t[i][e];s!==null&&s>a&&(a=s)}return a}class Rs extends Ds{then(e,a){return this.finished.finally(e).then(()=>{})}}const Fs=/^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u;function Os(t){const e=Fs.exec(t);if(!e)return[,];const[,a,i,s]=e;return[`--${a??i}`,s]}function Da(t,e,a=1){const[i,s]=Os(t);if(!i)return;const n=window.getComputedStyle(e).getPropertyValue(i);if(n){const r=n.trim();return Qt(r)?parseFloat(r):r}return it(s)?Da(s,e,a+1):s}function Ra(t,e){return t?.[e]??t?.default??t}const $s={type:"spring",stiffness:500,damping:25,restSpeed:10},js=t=>({type:"spring",stiffness:550,damping:t===0?2*Math.sqrt(550):30,restSpeed:10}),Ns={type:"keyframes",duration:.8},_s={type:"keyframes",ease:[.25,.1,.35,1],duration:.3},Hs=(t,{keyframes:e})=>e.length>2?Ns:ae.has(t)?t.startsWith("scale")?js(e[1]):$s:_s;function qs({when:t,delay:e,delayChildren:a,staggerChildren:i,staggerDirection:s,repeat:n,repeatType:r,repeatDelay:o,from:l,elapsed:d,...c}){return!!Object.keys(c).length}const Ks=t=>t!==null;function zs(t,{repeat:e,repeatType:a="loop"},i){const s=t.filter(Ks),n=e&&a!=="loop"&&e%2===1?0:s.length-1;return s[n]}const Fa=(t,e,a,i={},s,n)=>r=>{const o=Ra(i,t)||{},l=o.delay||i.delay||0;let{elapsed:d=0}=i;d=d-$(l);const c={keyframes:Array.isArray(a)?a:[null,a],ease:"easeOut",velocity:e.getVelocity(),...o,delay:-d,onUpdate:g=>{e.set(g),o.onUpdate&&o.onUpdate(g)},onComplete:()=>{r(),o.onComplete&&o.onComplete()},name:t,motionValue:e,element:n?void 0:s};qs(o)||Object.assign(c,Hs(t,c)),c.duration&&(c.duration=$(c.duration)),c.repeatDelay&&(c.repeatDelay=$(c.repeatDelay)),c.from!==void 0&&(c.keyframes[0]=c.from);let p=!1;if((c.type===!1||c.duration===0&&!c.repeatDelay)&&(Ge(c),c.delay===0&&(p=!0)),(j.instantAnimations||j.skipAnimations)&&(p=!0,Ge(c),c.delay=0),c.allowFlatten=!o.type&&!o.ease,p&&!n&&e.get()!==void 0){const g=zs(c.keyframes,o);if(g!==void 0){N.update(()=>{c.onUpdate(g),c.onComplete()});return}}return o.isSync?new dt(c):new Bs(c)},Oa=new Set(["width","height","top","left","right","bottom",...te]),$t=30,Us=t=>!isNaN(parseFloat(t));class Ws{constructor(e,a={}){this.canTrackVelocity=null,this.events={},this.updateAndNotify=i=>{const s=V.now();if(this.updatedAt!==s&&this.setPrevFrameValue(),this.prev=this.current,this.setCurrent(i),this.current!==this.prev&&(this.events.change?.notify(this.current),this.dependents))for(const n of this.dependents)n.dirty()},this.hasAnimated=!1,this.setCurrent(e),this.owner=a.owner}setCurrent(e){this.current=e,this.updatedAt=V.now(),this.canTrackVelocity===null&&e!==void 0&&(this.canTrackVelocity=Us(this.current))}setPrevFrameValue(e=this.current){this.prevFrameValue=e,this.prevUpdatedAt=this.updatedAt}onChange(e){return this.on("change",e)}on(e,a){this.events[e]||(this.events[e]=new ea);const i=this.events[e].add(a);return e==="change"?()=>{i(),N.read(()=>{this.events.change.getSize()||this.stop()})}:i}clearListeners(){for(const e in this.events)this.events[e].clear()}attach(e,a){this.passiveEffect=e,this.stopPassiveEffect=a}set(e){this.passiveEffect?this.passiveEffect(e,this.updateAndNotify):this.updateAndNotify(e)}setWithVelocity(e,a,i){this.set(a),this.prev=void 0,this.prevFrameValue=e,this.prevUpdatedAt=this.updatedAt-i}jump(e,a=!0){this.updateAndNotify(e),this.prev=e,this.prevUpdatedAt=this.prevFrameValue=void 0,a&&this.stop(),this.stopPassiveEffect&&this.stopPassiveEffect()}dirty(){this.events.change?.notify(this.current)}addDependent(e){this.dependents||(this.dependents=new Set),this.dependents.add(e)}removeDependent(e){this.dependents&&this.dependents.delete(e)}get(){return this.current}getPrevious(){return this.prev}getVelocity(){const e=V.now();if(!this.canTrackVelocity||this.prevFrameValue===void 0||e-this.updatedAt>$t)return 0;const a=Math.min(this.updatedAt-this.prevUpdatedAt,$t);return ta(parseFloat(this.current)-parseFloat(this.prevFrameValue),a)}start(e){return this.stop(),new Promise(a=>{this.hasAnimated=!0,this.animation=e(a),this.events.animationStart&&this.events.animationStart.notify()}).then(()=>{this.events.animationComplete&&this.events.animationComplete.notify(),this.clearAnimation()})}stop(){this.animation&&(this.animation.stop(),this.events.animationCancel&&this.events.animationCancel.notify()),this.clearAnimation()}isAnimating(){return!!this.animation}clearAnimation(){delete this.animation}destroy(){this.dependents?.clear(),this.events.destroy?.notify(),this.clearListeners(),this.stop(),this.stopPassiveEffect&&this.stopPassiveEffect()}}function ue(t,e){return new Ws(t,e)}function jt(t){const e=[{},{}];return t?.values.forEach((a,i)=>{e[0][i]=a.get(),e[1][i]=a.getVelocity()}),e}function $a(t,e,a,i){if(typeof e=="function"){const[s,n]=jt(i);e=e(a!==void 0?a:t.custom,s,n)}if(typeof e=="string"&&(e=t.variants&&t.variants[e]),typeof e=="function"){const[s,n]=jt(i);e=e(a!==void 0?a:t.custom,s,n)}return e}function Gs(t,e,a){const i=t.getProps();return $a(i,e,i.custom,t)}const Ys=t=>Array.isArray(t);function Xs(t,e,a){t.hasValue(e)?t.getValue(e).set(a):t.addValue(e,ue(a))}function Zs(t){return Ys(t)?t[t.length-1]||0:t}function Qs(t,e){const a=Gs(t,e);let{transitionEnd:i={},transition:s={},...n}=a||{};n={...n,...i};for(const r in n){const o=Zs(n[r]);Xs(t,r,o)}}const I=t=>!!(t&&t.getVelocity);function Js(t){return!!(I(t)&&t.add)}function en(t,e){const a=t.getValue("willChange");if(Js(a))return a.add(e);if(!a&&j.WillChange){const i=new j.WillChange("auto");t.addValue("willChange",i),i.add(e)}}function ut(t){return t.replace(/([A-Z])/g,e=>`-${e.toLowerCase()}`)}const tn="framerAppearId",an="data-"+ut(tn);function sn(t){return t.props[an]}function nn({protectedKeys:t,needsAnimating:e},a){const i=t.hasOwnProperty(a)&&e[a]!==!0;return e[a]=!1,i}function rn(t,e,{delay:a=0,transitionOverride:i,type:s}={}){let{transition:n=t.getDefaultTransition(),transitionEnd:r,...o}=e;i&&(n=i);const l=[],d=s&&t.animationState&&t.animationState.getState()[s];for(const c in o){const p=t.getValue(c,t.latestValues[c]??null),g=o[c];if(g===void 0||d&&nn(d,c))continue;const h={delay:a,...Ra(n||{},c)},x=p.get();if(x!==void 0&&!p.isAnimating&&!Array.isArray(g)&&g===x&&!h.velocity)continue;let b=!1;if(window.MotionHandoffAnimation){const v=sn(t);if(v){const S=window.MotionHandoffAnimation(v,c,N);S!==null&&(h.startTime=S,b=!0)}}en(t,c),p.start(Fa(c,p,g,t.shouldReduceMotion&&Oa.has(c)?{type:!1}:h,t,b));const y=p.animation;y&&l.push(y)}return r&&Promise.all(l).then(()=>{N.update(()=>{r&&Qs(t,r)})}),l}const on={test:t=>t==="auto",parse:t=>t},ja=t=>e=>e.test(t),Na=[J,u,Z,H,Li,Ii,on],Nt=t=>Na.find(ja(t));function ln(t){return typeof t=="number"?t===0:t!==null?t==="none"||t==="0"||Jt(t):!0}const cn=new Set(["brightness","contrast","saturate","opacity"]);function dn(t){const[e,a]=t.slice(0,-1).split("(");if(e==="drop-shadow")return t;const[i]=a.match(st)||[];if(!i)return t;const s=a.replace(i,"");let n=cn.has(e)?1:0;return i!==a&&(n*=100),e+"("+n+s+")"}const pn=/\b([a-z-]*)\(.*?\)/gu,Ye={...U,getAnimatableNone:t=>{const e=t.match(pn);return e?e.map(dn).join(" "):t}},_t={...J,transform:Math.round},gn={rotate:H,rotateX:H,rotateY:H,rotateZ:H,scale:Te,scaleX:Te,scaleY:Te,scaleZ:Te,skew:H,skewX:H,skewY:H,distance:u,translateX:u,translateY:u,translateZ:u,x:u,y:u,z:u,perspective:u,transformPerspective:u,opacity:de,originX:At,originY:At,originZ:u},ht={borderWidth:u,borderTopWidth:u,borderRightWidth:u,borderBottomWidth:u,borderLeftWidth:u,borderRadius:u,radius:u,borderTopLeftRadius:u,borderTopRightRadius:u,borderBottomRightRadius:u,borderBottomLeftRadius:u,width:u,maxWidth:u,height:u,maxHeight:u,top:u,right:u,bottom:u,left:u,inset:u,insetBlock:u,insetBlockStart:u,insetBlockEnd:u,insetInline:u,insetInlineStart:u,insetInlineEnd:u,padding:u,paddingTop:u,paddingRight:u,paddingBottom:u,paddingLeft:u,paddingBlock:u,paddingBlockStart:u,paddingBlockEnd:u,paddingInline:u,paddingInlineStart:u,paddingInlineEnd:u,margin:u,marginTop:u,marginRight:u,marginBottom:u,marginLeft:u,marginBlock:u,marginBlockStart:u,marginBlockEnd:u,marginInline:u,marginInlineStart:u,marginInlineEnd:u,backgroundPositionX:u,backgroundPositionY:u,...gn,zIndex:_t,fillOpacity:de,strokeOpacity:de,numOctaves:_t},un={...ht,color:C,backgroundColor:C,outlineColor:C,fill:C,stroke:C,borderColor:C,borderTopColor:C,borderRightColor:C,borderBottomColor:C,borderLeftColor:C,filter:Ye,WebkitFilter:Ye},_a=t=>un[t];function Ha(t,e){let a=_a(t);return a!==Ye&&(a=U),a.getAnimatableNone?a.getAnimatableNone(e):void 0}const hn=new Set(["auto","none","0"]);function mn(t,e,a){let i=0,s;for(;i<t.length&&!s;){const n=t[i];typeof n=="string"&&!hn.has(n)&&pe(n).values.length&&(s=t[i]),i++}if(s&&a)for(const n of e)t[n]=Ha(a,s)}class fn extends pt{constructor(e,a,i,s,n){super(e,a,i,s,n,!0)}readKeyframes(){const{unresolvedKeyframes:e,element:a,name:i}=this;if(!a||!a.current)return;super.readKeyframes();for(let c=0;c<e.length;c++){let p=e[c];if(typeof p=="string"&&(p=p.trim(),it(p))){const g=Da(p,a.current);g!==void 0&&(e[c]=g),c===e.length-1&&(this.finalKeyframe=p)}}if(this.resolveNoneKeyframes(),!Oa.has(i)||e.length!==2)return;const[s,n]=e,r=Nt(s),o=Nt(n),l=St(s),d=St(n);if(l!==d&&q[i]){this.needsMeasurement=!0;return}if(r!==o)if(Dt(r)&&Dt(o))for(let c=0;c<e.length;c++){const p=e[c];typeof p=="string"&&(e[c]=parseFloat(p))}else q[i]&&(this.needsMeasurement=!0)}resolveNoneKeyframes(){const{unresolvedKeyframes:e,name:a}=this,i=[];for(let s=0;s<e.length;s++)(e[s]===null||ln(e[s]))&&i.push(s);i.length&&mn(e,i,a)}measureInitialState(){const{element:e,unresolvedKeyframes:a,name:i}=this;if(!e||!e.current)return;i==="height"&&(this.suspendedScrollY=window.pageYOffset),this.measuredOrigin=q[i](e.measureViewportBox(),window.getComputedStyle(e.current)),a[0]=this.measuredOrigin;const s=a[a.length-1];s!==void 0&&e.getValue(i,s).jump(s,!1)}measureEndState(){const{element:e,name:a,unresolvedKeyframes:i}=this;if(!e||!e.current)return;const s=e.getValue(a);s&&s.jump(this.measuredOrigin,!1);const n=i.length-1,r=i[n];i[n]=q[a](e.measureViewportBox(),window.getComputedStyle(e.current)),r!==null&&this.finalKeyframe===void 0&&(this.finalKeyframe=r),this.removedTransforms?.length&&this.removedTransforms.forEach(([o,l])=>{e.getValue(o).set(l)}),this.resolveNoneKeyframes()}}function bn(t,e,a){if(t instanceof EventTarget)return[t];if(typeof t=="string"){let i=document;const s=a?.[t]??i.querySelectorAll(t);return s?Array.from(s):[]}return Array.from(t)}const qa=(t,e)=>e&&typeof t=="number"?e.transform(t):t,{schedule:xn}=ua(queueMicrotask,!1);function Ka(t){return ci(t)&&"ownerSVGElement"in t}function vn(t){return Ka(t)&&t.tagName==="svg"}const yn=[...Na,C,U],wn=t=>yn.find(ja(t)),Ht=()=>({min:0,max:0}),mt=()=>({x:Ht(),y:Ht()}),Xe={current:null},za={current:!1},Tn=typeof window<"u";function kn(){if(za.current=!0,!!Tn)if(window.matchMedia){const t=window.matchMedia("(prefers-reduced-motion)"),e=()=>Xe.current=t.matches;t.addEventListener("change",e),e()}else Xe.current=!1}const he=new WeakMap;function En(t){return t!==null&&typeof t=="object"&&typeof t.start=="function"}function Sn(t){return typeof t=="string"||Array.isArray(t)}const An=["animate","whileInView","whileFocus","whileHover","whileTap","whileDrag","exit"],Mn=["initial",...An];function Ua(t){return En(t.animate)||Mn.some(e=>Sn(t[e]))}function Cn(t){return!!(Ua(t)||t.variants)}function In(t,e,a){for(const i in e){const s=e[i],n=a[i];if(I(s))t.addValue(i,s);else if(I(n))t.addValue(i,ue(s,{owner:t}));else if(n!==s)if(t.hasValue(i)){const r=t.getValue(i);r.liveStyle===!0?r.jump(s):r.hasAnimated||r.set(s)}else{const r=t.getStaticValue(i);t.addValue(i,ue(r!==void 0?r:s,{owner:t}))}}for(const i in a)e[i]===void 0&&t.removeValue(i);return e}const qt=["AnimationStart","AnimationComplete","Update","BeforeLayoutMeasure","LayoutMeasure","LayoutAnimationStart","LayoutAnimationComplete"];let Kt={};class Wa{scrapeMotionValuesFromProps(e,a,i){return{}}constructor({parent:e,props:a,presenceContext:i,reducedMotionConfig:s,blockInitialAnimation:n,visualState:r},o={}){this.current=null,this.children=new Set,this.isVariantNode=!1,this.isControllingVariants=!1,this.shouldReduceMotion=null,this.values=new Map,this.KeyframeResolver=pt,this.features={},this.valueSubscriptions=new Map,this.prevMotionValues={},this.events={},this.propEventSubscriptions={},this.notifyUpdate=()=>this.notify("Update",this.latestValues),this.render=()=>{this.current&&(this.triggerBuild(),this.renderInstance(this.current,this.renderState,this.props.style,this.projection))},this.renderScheduledAt=0,this.scheduleRender=()=>{const g=V.now();this.renderScheduledAt<g&&(this.renderScheduledAt=g,N.render(this.render,!1,!0))};const{latestValues:l,renderState:d}=r;this.latestValues=l,this.baseTarget={...l},this.initialValues=a.initial?{...l}:{},this.renderState=d,this.parent=e,this.props=a,this.presenceContext=i,this.depth=e?e.depth+1:0,this.reducedMotionConfig=s,this.options=o,this.blockInitialAnimation=!!n,this.isControllingVariants=Ua(a),this.isVariantNode=Cn(a),this.isVariantNode&&(this.variantChildren=new Set),this.manuallyAnimateOnMount=!!(e&&e.current);const{willChange:c,...p}=this.scrapeMotionValuesFromProps(a,{},this);for(const g in p){const h=p[g];l[g]!==void 0&&I(h)&&h.set(l[g])}}mount(e){this.current=e,he.set(e,this),this.projection&&!this.projection.instance&&this.projection.mount(e),this.parent&&this.isVariantNode&&!this.isControllingVariants&&(this.removeFromVariantTree=this.parent.addVariantChild(this)),this.values.forEach((a,i)=>this.bindToMotionValue(i,a)),this.reducedMotionConfig==="never"?this.shouldReduceMotion=!1:this.reducedMotionConfig==="always"?this.shouldReduceMotion=!0:(za.current||kn(),this.shouldReduceMotion=Xe.current),this.parent?.addChild(this),this.update(this.props,this.presenceContext)}unmount(){this.projection&&this.projection.unmount(),Fe(this.notifyUpdate),Fe(this.render),this.valueSubscriptions.forEach(e=>e()),this.valueSubscriptions.clear(),this.removeFromVariantTree&&this.removeFromVariantTree(),this.parent?.removeChild(this);for(const e in this.events)this.events[e].clear();for(const e in this.features){const a=this.features[e];a&&(a.unmount(),a.isMounted=!1)}this.current=null}addChild(e){this.children.add(e),this.enteringChildren??(this.enteringChildren=new Set),this.enteringChildren.add(e)}removeChild(e){this.children.delete(e),this.enteringChildren&&this.enteringChildren.delete(e)}bindToMotionValue(e,a){this.valueSubscriptions.has(e)&&this.valueSubscriptions.get(e)();const i=ae.has(e);i&&this.onBindTransform&&this.onBindTransform();const s=a.on("change",r=>{this.latestValues[e]=r,this.props.onUpdate&&N.preRender(this.notifyUpdate),i&&this.projection&&(this.projection.isTransformDirty=!0),this.scheduleRender()});let n;typeof window<"u"&&window.MotionCheckAppearSync&&(n=window.MotionCheckAppearSync(this,e,a)),this.valueSubscriptions.set(e,()=>{s(),n&&n(),a.owner&&a.stop()})}sortNodePosition(e){return!this.current||!this.sortInstanceNodePosition||this.type!==e.type?0:this.sortInstanceNodePosition(this.current,e.current)}updateFeatures(){let e="animation";for(e in Kt){const a=Kt[e];if(!a)continue;const{isEnabled:i,Feature:s}=a;if(!this.features[e]&&s&&i(this.props)&&(this.features[e]=new s(this)),this.features[e]){const n=this.features[e];n.isMounted?n.update():(n.mount(),n.isMounted=!0)}}}triggerBuild(){this.build(this.renderState,this.latestValues,this.props)}measureViewportBox(){return this.current?this.measureInstanceViewportBox(this.current,this.props):mt()}getStaticValue(e){return this.latestValues[e]}setStaticValue(e,a){this.latestValues[e]=a}update(e,a){(e.transformTemplate||this.props.transformTemplate)&&this.scheduleRender(),this.prevProps=this.props,this.props=e,this.prevPresenceContext=this.presenceContext,this.presenceContext=a;for(let i=0;i<qt.length;i++){const s=qt[i];this.propEventSubscriptions[s]&&(this.propEventSubscriptions[s](),delete this.propEventSubscriptions[s]);const n="on"+s,r=e[n];r&&(this.propEventSubscriptions[s]=this.on(s,r))}this.prevMotionValues=In(this,this.scrapeMotionValuesFromProps(e,this.prevProps||{},this),this.prevMotionValues),this.handleChildMotionValue&&this.handleChildMotionValue()}getProps(){return this.props}getVariant(e){return this.props.variants?this.props.variants[e]:void 0}getDefaultTransition(){return this.props.transition}getTransformPagePoint(){return this.props.transformPagePoint}getClosestVariantNode(){return this.isVariantNode?this:this.parent?this.parent.getClosestVariantNode():void 0}addVariantChild(e){const a=this.getClosestVariantNode();if(a)return a.variantChildren&&a.variantChildren.add(e),()=>a.variantChildren.delete(e)}addValue(e,a){const i=this.values.get(e);a!==i&&(i&&this.removeValue(e),this.bindToMotionValue(e,a),this.values.set(e,a),this.latestValues[e]=a.get())}removeValue(e){this.values.delete(e);const a=this.valueSubscriptions.get(e);a&&(a(),this.valueSubscriptions.delete(e)),delete this.latestValues[e],this.removeValueFromRenderState(e,this.renderState)}hasValue(e){return this.values.has(e)}getValue(e,a){if(this.props.values&&this.props.values[e])return this.props.values[e];let i=this.values.get(e);return i===void 0&&a!==void 0&&(i=ue(a===null?void 0:a,{owner:this}),this.addValue(e,i)),i}readValue(e,a){let i=this.latestValues[e]!==void 0||!this.current?this.latestValues[e]:this.getBaseTargetFromProps(this.props,e)??this.readValueFromInstance(this.current,e,this.options);return i!=null&&(typeof i=="string"&&(Qt(i)||Jt(i))?i=parseFloat(i):!wn(i)&&U.test(a)&&(i=Ha(e,a)),this.setBaseTarget(e,I(i)?i.get():i)),I(i)?i.get():i}setBaseTarget(e,a){this.baseTarget[e]=a}getBaseTarget(e){const{initial:a}=this.props;let i;if(typeof a=="string"||typeof a=="object"){const n=$a(this.props,a,this.presenceContext?.custom);n&&(i=n[e])}if(a&&i!==void 0)return i;const s=this.getBaseTargetFromProps(this.props,e);return s!==void 0&&!I(s)?s:this.initialValues[e]!==void 0&&i===void 0?void 0:this.baseTarget[e]}on(e,a){return this.events[e]||(this.events[e]=new ea),this.events[e].add(a)}notify(e,...a){this.events[e]&&this.events[e].notify(...a)}scheduleRenderMicrotask(){xn.render(this.render)}}class Ga extends Wa{constructor(){super(...arguments),this.KeyframeResolver=fn}sortInstanceNodePosition(e,a){return e.compareDocumentPosition(a)&2?1:-1}getBaseTargetFromProps(e,a){const i=e.style;return i?i[a]:void 0}removeValueFromRenderState(e,{vars:a,style:i}){delete a[e],delete i[e]}handleChildMotionValue(){this.childSubscription&&(this.childSubscription(),delete this.childSubscription);const{children:e}=this.props;I(e)&&(this.childSubscription=e.on("change",a=>{this.current&&(this.current.textContent=`${a}`)}))}}function Ln({top:t,left:e,right:a,bottom:i}){return{x:{min:e,max:a},y:{min:t,max:i}}}function Vn(t,e){if(!e)return t;const a=e({x:t.left,y:t.top}),i=e({x:t.right,y:t.bottom});return{top:a.y,left:a.x,bottom:i.y,right:i.x}}function Pn(t,e){return Ln(Vn(t.getBoundingClientRect(),e))}const Bn={x:"translateX",y:"translateY",z:"translateZ",transformPerspective:"perspective"},Dn=te.length;function Rn(t,e,a){let i="",s=!0;for(let n=0;n<Dn;n++){const r=te[n],o=t[r];if(o===void 0)continue;let l=!0;if(typeof o=="number"?l=o===(r.startsWith("scale")?1:0):l=parseFloat(o)===0,!l||a){const d=qa(o,ht[r]);if(!l){s=!1;const c=Bn[r]||r;i+=`${c}(${d}) `}a&&(e[r]=d)}}return i=i.trim(),a?i=a(e,s?"":i):s&&(i="none"),i}function Ya(t,e,a){const{style:i,vars:s,transformOrigin:n}=t;let r=!1,o=!1;for(const l in e){const d=e[l];if(ae.has(l)){r=!0;continue}else if(ma(l)){s[l]=d;continue}else{const c=qa(d,ht[l]);l.startsWith("origin")?(o=!0,n[l]=c):i[l]=c}}if(e.transform||(r||a?i.transform=Rn(e,t.transform,a):i.transform&&(i.transform="none")),o){const{originX:l="50%",originY:d="50%",originZ:c=0}=n;i.transformOrigin=`${l} ${d} ${c}`}}function Xa(t,{style:e,vars:a},i,s){const n=t.style;let r;for(r in e)n[r]=e[r];s?.applyProjectionStyles(n,i);for(r in a)n.setProperty(r,a[r])}function zt(t,e){return e.max===e.min?0:t/(e.max-e.min)*100}const re={correct:(t,e)=>{if(!e.target)return t;if(typeof t=="string")if(u.test(t))t=parseFloat(t);else return t;const a=zt(t,e.target.x),i=zt(t,e.target.y);return`${a}% ${i}%`}},Fn={correct:(t,{treeScale:e,projectionDelta:a})=>{const i=t,s=U.parse(t);if(s.length>5)return i;const n=U.createTransformer(t),r=typeof s[0]!="number"?1:0,o=a.x.scale*e.x,l=a.y.scale*e.y;s[0+r]/=o,s[1+r]/=l;const d=ee(o,l,.5);return typeof s[2+r]=="number"&&(s[2+r]/=d),typeof s[3+r]=="number"&&(s[3+r]/=d),n(s)}},On={borderRadius:{...re,applyTo:["borderTopLeftRadius","borderTopRightRadius","borderBottomLeftRadius","borderBottomRightRadius"]},borderTopLeftRadius:re,borderTopRightRadius:re,borderBottomLeftRadius:re,borderBottomRightRadius:re,boxShadow:Fn};function $n(t,{layout:e,layoutId:a}){return ae.has(t)||t.startsWith("origin")||(e||a!==void 0)&&(!!On[t]||t==="opacity")}function Za(t,e,a){const i=t.style,s=e?.style,n={};if(!i)return n;for(const r in i)(I(i[r])||s&&I(s[r])||$n(r,t)||a?.getValue(r)?.liveStyle!==void 0)&&(n[r]=i[r]);return n}function jn(t){return window.getComputedStyle(t)}class Nn extends Ga{constructor(){super(...arguments),this.type="html",this.renderInstance=Xa}readValueFromInstance(e,a){if(ae.has(a))return this.projection?.isProjecting?qe(a):ds(e,a);{const i=jn(e),s=(ma(a)?i.getPropertyValue(a):i[a])||0;return typeof s=="string"?s.trim():s}}measureInstanceViewportBox(e,{transformPagePoint:a}){return Pn(e,a)}build(e,a,i){Ya(e,a,i.transformTemplate)}scrapeMotionValuesFromProps(e,a,i){return Za(e,a,i)}}const _n={offset:"stroke-dashoffset",array:"stroke-dasharray"},Hn={offset:"strokeDashoffset",array:"strokeDasharray"};function qn(t,e,a=1,i=0,s=!0){t.pathLength=1;const n=s?_n:Hn;t[n.offset]=u.transform(-i);const r=u.transform(e),o=u.transform(a);t[n.array]=`${r} ${o}`}const Kn=["offsetDistance","offsetPath","offsetRotate","offsetAnchor"];function zn(t,{attrX:e,attrY:a,attrScale:i,pathLength:s,pathSpacing:n=1,pathOffset:r=0,...o},l,d,c){if(Ya(t,o,d),l){t.style.viewBox&&(t.attrs.viewBox=t.style.viewBox);return}t.attrs=t.style,t.style={};const{attrs:p,style:g}=t;p.transform&&(g.transform=p.transform,delete p.transform),(g.transform||p.transformOrigin)&&(g.transformOrigin=p.transformOrigin??"50% 50%",delete p.transformOrigin),g.transform&&(g.transformBox=c?.transformBox??"fill-box",delete p.transformBox);for(const h of Kn)p[h]!==void 0&&(g[h]=p[h],delete p[h]);e!==void 0&&(p.x=e),a!==void 0&&(p.y=a),i!==void 0&&(p.scale=i),s!==void 0&&qn(p,s,n,r,!1)}const Qa=new Set(["baseFrequency","diffuseConstant","kernelMatrix","kernelUnitLength","keySplines","keyTimes","limitingConeAngle","markerHeight","markerWidth","numOctaves","targetX","targetY","surfaceScale","specularConstant","specularExponent","stdDeviation","tableValues","viewBox","gradientTransform","pathLength","startOffset","textLength","lengthAdjust"]),Un=t=>typeof t=="string"&&t.toLowerCase()==="svg";function Wn(t,e,a,i){Xa(t,e,void 0,i);for(const s in e.attrs)t.setAttribute(Qa.has(s)?s:ut(s),e.attrs[s])}function Gn(t,e,a){const i=Za(t,e,a);for(const s in t)if(I(t[s])||I(e[s])){const n=te.indexOf(s)!==-1?"attr"+s.charAt(0).toUpperCase()+s.substring(1):s;i[n]=t[s]}return i}class Yn extends Ga{constructor(){super(...arguments),this.type="svg",this.isSVGTag=!1,this.measureInstanceViewportBox=mt}getBaseTargetFromProps(e,a){return e[a]}readValueFromInstance(e,a){if(ae.has(a)){const i=_a(a);return i&&i.default||0}return a=Qa.has(a)?a:ut(a),e.getAttribute(a)}scrapeMotionValuesFromProps(e,a,i){return Gn(e,a,i)}build(e,a,i){zn(e,a,this.isSVGTag,i.transformTemplate,i.style)}renderInstance(e,a,i,s){Wn(e,a,i,s)}mount(e){this.isSVGTag=Un(e.tagName),super.mount(e)}}function Xn(t,e){return t in e}class Zn extends Wa{constructor(){super(...arguments),this.type="object"}readValueFromInstance(e,a){if(Xn(a,e)){const i=e[a];if(typeof i=="string"||typeof i=="number")return i}}getBaseTargetFromProps(){}removeValueFromRenderState(e,a){delete a.output[e]}measureInstanceViewportBox(){return mt()}build(e,a){Object.assign(e.output,a)}renderInstance(e,{output:a}){Object.assign(e,a)}sortInstanceNodePosition(){return 0}}function Qn(t,e,a){const i=I(t)?t:ue(t);return i.start(Fa("",i,e,a)),i.animation}function ft(t){return typeof t=="object"&&!Array.isArray(t)}function Ja(t,e,a,i){return typeof t=="string"&&ft(e)?bn(t,a,i):t instanceof NodeList?Array.from(t):Array.isArray(t)?t:[t]}function Jn(t,e,a){return t*(e+1)}function Ut(t,e,a,i){return typeof e=="number"?e:e.startsWith("-")||e.startsWith("+")?Math.max(0,t+parseFloat(e)):e==="<"?a:e.startsWith("<")?Math.max(0,a+parseFloat(e.slice(1))):i.get(e)??t}function er(t,e,a){for(let i=0;i<t.length;i++){const s=t[i];s.at>e&&s.at<a&&(Zt(t,s),i--)}}function tr(t,e,a,i,s,n){er(t,s,n);for(let r=0;r<e.length;r++)t.push({value:e[r],at:ee(s,n,i[r]),easing:pa(a,r)})}function ar(t,e){for(let a=0;a<t.length;a++)t[a]=t[a]/(e+1)}function ir(t,e){return t.at===e.at?t.value===null?1:e.value===null?-1:0:t.at-e.at}const sr="easeInOut";function nr(t,{defaultTransition:e={},...a}={},i,s){const n=e.duration||.3,r=new Map,o=new Map,l={},d=new Map;let c=0,p=0,g=0;for(let h=0;h<t.length;h++){const x=t[h];if(typeof x=="string"){d.set(x,p);continue}else if(!Array.isArray(x)){d.set(x.name,Ut(p,x.at,c,d));continue}let[b,y,v={}]=x;v.at!==void 0&&(p=Ut(p,v.at,c,d));let S=0;const T=(k,m,w,A=0,f=0)=>{const E=rr(k),{delay:L=0,times:D=Ma(E),type:Ie="keyframes",repeat:xe,repeatType:zr,repeatDelay:Ur=0,...ti}=m;let{ease:_=e.ease||"easeOut",duration:F}=m;const xt=typeof L=="function"?L(A,f):L,vt=E.length,yt=gt(Ie)?Ie:s?.[Ie||"keyframes"];if(vt<=2&&yt){let ie=100;if(vt===2&&cr(E)){const se=E[1]-E[0];ie=Math.abs(se)}const ve={...ti};F!==void 0&&(ve.duration=$(F));const ye=Ea(ve,ie,yt);_=ye.ease,F=ye.duration}F??(F=n);const wt=p+xt;D.length===1&&D[0]===0&&(D[1]=1);const Tt=D.length-E.length;if(Tt>0&&Aa(D,Tt),E.length===1&&E.unshift(null),xe){F=Jn(F,xe);const ie=[...E],ve=[...D];_=Array.isArray(_)?[..._]:[_];const ye=[..._];for(let se=0;se<xe;se++){E.push(...ie);for(let ne=0;ne<ie.length;ne++)D.push(ve[ne]+(se+1)),_.push(ne===0?"linear":pa(ye,ne-1))}ar(D,xe)}const kt=wt+F;tr(w,E,_,D,wt,kt),S=Math.max(xt+F,S),g=Math.max(kt,g)};if(I(b)){const k=Wt(b,o);T(y,v,Gt("default",k))}else{const k=Ja(b,y,i,l),m=k.length;for(let w=0;w<m;w++){y=y,v=v;const A=k[w],f=Wt(A,o);for(const E in y)T(y[E],or(v,E),Gt(E,f),w,m)}}c=p,p+=S}return o.forEach((h,x)=>{for(const b in h){const y=h[b];y.sort(ir);const v=[],S=[],T=[];for(let m=0;m<y.length;m++){const{at:w,value:A,easing:f}=y[m];v.push(A),S.push(et(0,g,w)),T.push(f||"easeOut")}S[0]!==0&&(S.unshift(0),v.unshift(v[0]),T.unshift(sr)),S[S.length-1]!==1&&(S.push(1),v.push(null)),r.has(x)||r.set(x,{keyframes:{},transition:{}});const k=r.get(x);k.keyframes[b]=v,k.transition[b]={...e,duration:g,ease:T,times:S,...a}}}),r}function Wt(t,e){return!e.has(t)&&e.set(t,{}),e.get(t)}function Gt(t,e){return e[t]||(e[t]=[]),e[t]}function rr(t){return Array.isArray(t)?t:[t]}function or(t,e){return t&&t[e]?{...t,...t[e]}:{...t}}const lr=t=>typeof t=="number",cr=t=>t.every(lr);function dr(t){const e={presenceContext:null,props:{},visualState:{renderState:{transform:{},transformOrigin:{},style:{},vars:{},attrs:{}},latestValues:{}}},a=Ka(t)&&!vn(t)?new Yn(e):new Nn(e);a.mount(t),he.set(t,a)}function pr(t){const e={presenceContext:null,props:{},visualState:{renderState:{output:{}},latestValues:{}}},a=new Zn(e);a.mount(t),he.set(t,a)}function gr(t,e){return I(t)||typeof t=="number"||typeof t=="string"&&!ft(e)}function ei(t,e,a,i){const s=[];if(gr(t,e))s.push(Qn(t,ft(e)&&e.default||e,a&&(a.default||a)));else{const n=Ja(t,e,i),r=n.length;for(let o=0;o<r;o++){const l=n[o],d=l instanceof Element?dr:pr;he.has(l)||d(l);const c=he.get(l),p={...a};"delay"in p&&typeof p.delay=="function"&&(p.delay=p.delay(o,r)),s.push(...rn(c,{...e,transition:p},{}))}}return s}function ur(t,e,a){const i=[];return nr(t,e,a,{spring:ge}).forEach(({keyframes:n,transition:r},o)=>{i.push(...ei(o,n,r))}),i}function hr(t){return Array.isArray(t)&&t.some(Array.isArray)}function mr(t){function e(a,i,s){let n=[],r;if(hr(a))n=ur(a,i,t);else{const{onComplete:l,...d}=s||{};typeof l=="function"&&(r=l),n=ei(a,i,d,t)}const o=new Rs(n);return r&&o.finished.then(r),o}return e}const Ce=mr();class fr{modal=null;isOpen=!1;open(e,a){if(this.isOpen)return;const i=`
            <div id="modal-overlay" class="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div id="modal-content" class="bg-pagani-black border border-pagani-gold/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    ${a?`
                        <div class="border-b border-pagani-gold/20 px-8 py-6 flex justify-between items-center">
                            <h2 class="text-2xl font-orbitron font-bold">${a}</h2>
                            <button id="modal-close" class="text-white/50 hover:text-white text-2xl leading-none">&times;</button>
                        </div>
                    `:`
                        <button id="modal-close" class="absolute top-4 right-4 text-white/50 hover:text-white text-2xl leading-none z-10">&times;</button>
                    `}
                    <div class="p-8">
                        ${e}
                    </div>
                </div>
            </div>
        `;document.body.insertAdjacentHTML("beforeend",i),this.modal=document.getElementById("modal-overlay"),this.isOpen=!0,document.body.style.overflow="hidden";const s=document.getElementById("modal-content");s&&Ce(s,{opacity:[0,1],transform:["scale(0.9)","scale(1)"]},{duration:.3}),document.getElementById("modal-close")?.addEventListener("click",()=>this.close()),this.modal?.addEventListener("click",r=>{r.target===this.modal&&this.close()});const n=r=>{r.key==="Escape"&&(this.close(),document.removeEventListener("keydown",n))};document.addEventListener("keydown",n)}close(){if(!this.isOpen||!this.modal)return;const e=document.getElementById("modal-content");e&&Ce(e,{opacity:0,transform:"scale(0.9)"},{duration:.2}).finished.then(()=>{this.modal?.remove(),this.modal=null,this.isOpen=!1,document.body.style.overflow=""})}}const bt=new fr;class br{container;heroEl;designEl;engineEl;constructor(e){if(this.container=document.getElementById(e),!this.container)throw new Error(`HUD container with id ${e} not found`);this.container.innerHTML="",this.heroEl=this.createPhaseElement("hero",`
            <div class="text-center relative">
                <div class="absolute -top-12 left-1/2 -translate-x-1/2 w-[1px] h-8 bg-pagani-gold/50"></div>
                <h1 class="text-5xl md:text-8xl font-black text-white tracking-tight mb-6 glitch-text" data-text="AI-POWERED EV INTELLIGENCE">AI-POWERED<br><span class="text-pagani-gold">EV INTELLIGENCE</span></h1>
                <div class="flex items-center justify-center gap-4 text-white/80 text-base tracking-wide mb-8">
                    <span class="w-12 h-[1px] bg-pagani-gold/50"></span>
                    <span class="uppercase text-sm">Smart Battery • Intelligent Routing • Indian Roads</span>
                    <span class="w-12 h-[1px] bg-pagani-gold/50"></span>
                </div>
                <p class="text-gray-400 max-w-2xl mx-auto mb-8 text-lg leading-relaxed">
                    Solving India's EV challenges with Machine Learning for battery health monitoring and traffic-aware energy optimization.
                </p>
            </div>
        `),this.designEl=this.createPhaseElement("design",`
            <div class="max-w-2xl text-left absolute left-8 md:left-24 bottom-1/4 pointer-events-auto">
                <div class="flex items-center gap-4 mb-4">
                    <div class="text-pagani-gold text-xs tracking-[0.3em] uppercase">AI/ML CORE</div>
                    <div class="h-[1px] w-16 bg-pagani-gold/50"></div>
                </div>
                <h2 class="text-5xl md:text-6xl font-black mb-6 leading-tight cursor-pointer hover:text-pagani-gold transition-colors" id="hud-battery-health-title">BATTERY HEALTH<br><span class="text-pagani-gold">PREDICTION</span></h2>
                <ul class="space-y-4 text-gray-300 text-base leading-relaxed border-l-2 border-pagani-gold/30 pl-6">
                   <li class="flex items-start gap-3"><span class="text-pagani-gold mt-1">▸</span><span>Real-time battery degradation monitoring using ML models</span></li>
                   <li class="flex items-start gap-3"><span class="text-pagani-gold mt-1">▸</span><span>Energy consumption prediction based on driving patterns</span></li>
                   <li class="flex items-start gap-3"><span class="text-pagani-gold mt-1">▸</span><span>Destination feasibility analysis with current charge levels</span></li>
                </ul>
            </div>
        `),this.engineEl=this.createPhaseElement("engine",`
             <div class="max-w-2xl text-right absolute right-8 md:right-24 top-1/4 text-right flex flex-col items-end pointer-events-auto">
                <div class="flex items-center gap-4 mb-4">
                    <div class="h-[1px] w-16 bg-pagani-gold/50"></div>
                    <div class="text-pagani-gold text-xs tracking-[0.3em] uppercase">INTELLIGENT NAVIGATION</div>
                </div>
                <h2 class="text-5xl md:text-6xl font-black mb-6 leading-tight">SMART<br><span class="text-pagani-gold">ROUTING</span></h2>
                <ul class="space-y-4 text-gray-300 text-base leading-relaxed border-r-2 border-pagani-gold/30 pr-6 text-right">
                    <li class="flex items-end justify-end gap-3"><span>Traffic-aware route optimization for Indian road conditions</span><span class="text-pagani-gold mt-1">◂</span></li>
                    <li class="flex items-end justify-end gap-3"><span>Energy-efficient path planning with real-time updates</span><span class="text-pagani-gold mt-1">◂</span></li>
                    <li class="flex items-end justify-end gap-3"><span>Charging station recommendations based on battery SOC</span><span class="text-pagani-gold mt-1">◂</span></li>
                </ul>
            </div>
        `),this.container.appendChild(this.heroEl),this.container.appendChild(this.designEl),this.container.appendChild(this.engineEl),this.setPhaseOpacity(this.heroEl,1),this.setPhaseOpacity(this.designEl,0),this.setPhaseOpacity(this.engineEl,0),this.setupClickHandlers()}setupClickHandlers(){setTimeout(()=>{const e=document.getElementById("hud-battery-health-title");e&&e.addEventListener("click",this.openBatteryHealthWindow)},100)}openBatteryHealthWindow(){const e=`
            <div class="space-y-8">
                <!-- Header -->
                <div class="text-center mb-8">
                    <div class="text-7xl mb-4">🔋</div>
                    <h3 class="text-3xl font-orbitron font-bold mb-2">AI Battery Health Prediction System</h3>
                    <p class="text-gray-400">Real-time ML-powered battery monitoring and analysis</p>
                </div>

                <!-- Current Battery Status -->
                <div class="bg-gradient-to-br from-pagani-gold/10 to-transparent border border-pagani-gold/30 p-6 rounded-lg">
                    <h4 class="text-xl font-orbitron font-bold mb-4 text-pagani-gold">Current Battery Status</h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="text-center">
                            <div class="text-3xl font-bold text-white">94%</div>
                            <div class="text-sm text-gray-400">State of Health</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-white">82%</div>
                            <div class="text-sm text-gray-400">Current Charge</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-white">28°C</div>
                            <div class="text-sm text-gray-400">Temperature</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-white">245</div>
                            <div class="text-sm text-gray-400">Charge Cycles</div>
                        </div>
                    </div>
                </div>

                <!-- ML Predictions -->
                <div class="grid md:grid-cols-2 gap-6">
                    <div class="bg-pagani-black border border-pagani-gold/20 p-6">
                        <h4 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                            <span class="text-pagani-gold">▸</span>
                            Predicted Degradation
                        </h4>
                        <div class="space-y-3">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-400">Next 6 months</span>
                                <span class="text-white font-bold">2.3% decline</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-400">Next 12 months</span>
                                <span class="text-white font-bold">4.8% decline</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-400">Estimated lifespan</span>
                                <span class="text-white font-bold">8.2 years</span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-pagani-black border border-pagani-gold/20 p-6">
                        <h4 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                            <span class="text-pagani-gold">▸</span>
                            Optimization Recommendations
                        </h4>
                        <ul class="space-y-3 text-gray-300">
                            <li class="flex items-start gap-2">
                                <span class="text-green-500 mt-1">✓</span>
                                <span>Charging patterns optimal</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <span class="text-yellow-500 mt-1">⚠</span>
                                <span>Consider reducing fast-charge frequency</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <span class="text-green-500 mt-1">✓</span>
                                <span>Temperature management excellent</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Key Features -->
                <div class="border-t border-pagani-gold/20 pt-6">
                    <h4 class="text-xl font-orbitron font-bold mb-4">AI/ML Features</h4>
                    <div class="grid md:grid-cols-3 gap-4">
                        ${[{icon:"📊",title:"Real-time Monitoring",desc:"Continuous SOH analysis with ML models"},{icon:"🎯",title:"Predictive Alerts",desc:"Proactive maintenance notifications"},{icon:"⚡",title:"Smart Charging",desc:"Adaptive charging cycle optimization"},{icon:"🌡️",title:"Thermal Management",desc:"Temperature-aware battery control"},{icon:"📈",title:"Pattern Analysis",desc:"Driving behavior impact assessment"},{icon:"🔮",title:"Lifespan Prediction",desc:"Accurate remaining life estimation"}].map(a=>`
                            <div class="bg-gradient-to-br from-pagani-gold/5 to-transparent border border-pagani-gold/20 p-4">
                                <div class="text-3xl mb-2">${a.icon}</div>
                                <h5 class="font-bold text-sm mb-1">${a.title}</h5>
                                <p class="text-xs text-gray-400">${a.desc}</p>
                            </div>
                        `).join("")}
                    </div>
                </div>

                <!-- Technical Details -->
                <div class="bg-pagani-black border border-pagani-gold/20 p-6">
                    <h4 class="text-lg font-orbitron font-bold mb-4">Technical Specifications</h4>
                    <div class="grid md:grid-cols-2 gap-4 text-sm">
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-gray-400">ML Model Type:</span>
                                <span class="text-white">LSTM Neural Network</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Prediction Accuracy:</span>
                                <span class="text-white">97.3%</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Update Frequency:</span>
                                <span class="text-white">Real-time (50ms)</span>
                            </div>
                        </div>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-gray-400">Data Points Analyzed:</span>
                                <span class="text-white">250+ parameters</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Training Dataset:</span>
                                <span class="text-white">5M+ charge cycles</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Edge Computing:</span>
                                <span class="text-white">On-board AI chip</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;bt.open(e,"BATTERY HEALTH PREDICTION")}createPhaseElement(e,a){const i=document.createElement("div");return i.id=`phase-${e}`,i.className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 transition-opacity duration-500",i.innerHTML=a,i}setPhaseOpacity(e,a){Ce(e,{opacity:a},{duration:.5})}update(e){if(e<.25)this.setPhaseOpacity(this.heroEl,1),this.setPhaseOpacity(this.designEl,0),this.setPhaseOpacity(this.engineEl,0);else if(e>=.25&&e<.35){const a=(e-.25)/.1;this.setPhaseOpacity(this.heroEl,1-a),this.setPhaseOpacity(this.designEl,a),this.setPhaseOpacity(this.engineEl,0)}else if(e>=.35&&e<.6)this.setPhaseOpacity(this.heroEl,0),this.setPhaseOpacity(this.designEl,1),this.setPhaseOpacity(this.engineEl,0);else if(e>=.6&&e<.7){const a=(e-.6)/.1;this.setPhaseOpacity(this.heroEl,0),this.setPhaseOpacity(this.designEl,1-a),this.setPhaseOpacity(this.engineEl,a)}else this.setPhaseOpacity(this.heroEl,0),this.setPhaseOpacity(this.designEl,0),this.setPhaseOpacity(this.engineEl,1)}}const xr=[{id:"battery-health",icon:"🔋",title:"AI Battery Health Monitoring",description:"Real-time ML-powered battery degradation analysis and predictive maintenance alerts",category:"ai"},{id:"smart-routing",icon:"🗺️",title:"Intelligent Route Optimization",description:"Traffic-aware energy-efficient routing optimized for Indian road conditions",category:"routing"},{id:"energy-prediction",icon:"⚡",title:"Energy Consumption Prediction",description:"ML models predict range based on driving patterns, terrain, and weather",category:"ai"},{id:"fast-charging",icon:"⚡",title:"800V Ultra-Fast Charging",description:"10-80% charge in 18 minutes with advanced thermal management",category:"battery"},{id:"quad-motor",icon:"🏎️",title:"Quad Motor Torque Vectoring",description:"Independent motor control for each wheel delivering unmatched handling",category:"performance"},{id:"range",icon:"🎯",title:"850 KM Range",description:"Solid-state battery technology with graphene enhancement",category:"battery"},{id:"charging-network",icon:"📍",title:"Smart Charging Network",description:"AI-powered charging station recommendations based on availability and pricing",category:"routing"},{id:"performance",icon:"🚀",title:"0-100 in 2.1s",description:"Hypercar-level acceleration with instant torque delivery",category:"performance"}],vr=[{id:"1",name:"Vikram Singh",role:"Tech Entrepreneur",company:"Mumbai",content:"The AI-powered battery management is a game-changer. I drive 200km daily and the range prediction is incredibly accurate.",rating:5,image:"/images/testimonials/1.jpg"},{id:"2",name:"Ananya Desai",role:"Business Executive",company:"Bangalore",content:"Smart routing saves me 30 minutes daily on my commute. The traffic-aware navigation is brilliant for Indian roads.",rating:5,image:"/images/testimonials/2.jpg"},{id:"3",name:"Rahul Kapoor",role:"Automotive Journalist",company:"Delhi",content:"This is not just an EV, it's a technological masterpiece. The performance rivals any hypercar I've driven.",rating:5,image:"/images/testimonials/3.jpg"}];class be{observer;constructor(e=.1){this.observer=new IntersectionObserver(a=>{a.forEach(i=>{i.isIntersecting&&i.target.classList.add("animate-in")})},{threshold:e})}observe(e){this.observer.observe(e)}observeAll(e){document.querySelectorAll(e).forEach(i=>this.observe(i))}disconnect(){this.observer.disconnect()}}function yr(t,e,a,i=2e3,s=""){const n=Date.now(),r=()=>{const o=Date.now()-n,l=Math.min(o/i,1),d=1-Math.pow(1-l,3),c=Math.floor(e+(a-e)*d);t.textContent=c.toLocaleString()+s,l<1&&requestAnimationFrame(r)};r()}async function wr(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
        <!-- Scroll Sequence Container -->
        <main class="relative h-[600vh]" id="scroll-container">
            <div class="sticky top-0 left-0 w-full h-screen overflow-hidden">
                <!-- Canvas Layer -->
                <canvas id="zonda-canvas" class="absolute inset-0 w-full h-full object-contain z-0"></canvas>

                <!-- HUD Layer -->
                <div id="zonda-hud" class="absolute inset-0 w-full h-full pointer-events-none z-10 flex flex-col justify-center items-center p-8">
                    <!-- Dynamic Content Injected Here -->
                </div>
            </div>
        </main>

        <!-- Features Section -->
        <section class="relative z-20 bg-gradient-to-b from-pagani-black to-gray-900 py-24 px-8">
            <div class="max-w-7xl mx-auto">
                <div class="text-center mb-16 fade-in-section">
                    <div class="flex items-center justify-center gap-4 mb-6">
                        <span class="w-12 h-[2px] bg-pagani-gold"></span>
                        <span class="text-pagani-gold tracking-[0.3em] uppercase text-sm">Features</span>
                        <span class="w-12 h-[2px] bg-pagani-gold"></span>
                    </div>
                    <h2 class="text-4xl md:text-5xl font-orbitron font-bold mb-6">REVOLUTIONARY <span class="text-pagani-gold">TECHNOLOGY</span></h2>
                    <p class="text-gray-400 max-w-2xl mx-auto text-lg">Experience the future of electric mobility with cutting-edge AI and performance engineering</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    ${xr.map((o,l)=>`
                        <div class="feature-card fade-in-section bg-pagani-black border border-white/10 p-8 hover:border-pagani-gold/50 transition-all duration-300 group" style="animation-delay: ${l*100}ms">
                            <div class="text-5xl mb-4 group-hover:scale-110 transition-transform">${o.icon}</div>
                            <h3 class="text-xl font-orbitron font-bold mb-3 group-hover:text-pagani-gold transition-colors">${o.title}</h3>
                            <p class="text-gray-400 text-sm leading-relaxed">${o.description}</p>
                        </div>
                    `).join("")}
                </div>
            </div>
        </section>

        <!-- Stats Section -->
        <section class="relative z-20 bg-pagani-black py-24 px-8 border-y border-pagani-gold/20">
            <div class="max-w-7xl mx-auto">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div class="text-center fade-in-section">
                        <div class="text-5xl md:text-6xl font-orbitron font-bold text-pagani-gold mb-2" data-counter="850">0</div>
                        <div class="text-sm text-gray-400 uppercase tracking-wider">KM Range</div>
                    </div>
                    <div class="text-center fade-in-section">
                        <div class="text-5xl md:text-6xl font-orbitron font-bold text-pagani-gold mb-2" data-counter="2.1">0</div>
                        <div class="text-sm text-gray-400 uppercase tracking-wider">0-100 km/h (s)</div>
                    </div>
                    <div class="text-center fade-in-section">
                        <div class="text-5xl md:text-6xl font-orbitron font-bold text-pagani-gold mb-2" data-counter="1877">0</div>
                        <div class="text-sm text-gray-400 uppercase tracking-wider">Horsepower</div>
                    </div>
                    <div class="text-center fade-in-section">
                        <div class="text-5xl md:text-6xl font-orbitron font-bold text-pagani-gold mb-2" data-counter="18">0</div>
                        <div class="text-sm text-gray-400 uppercase tracking-wider">Min Charge (10-80%)</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Testimonials Section -->
        <section class="relative z-20 bg-gradient-to-b from-gray-900 to-pagani-black py-24 px-8">
            <div class="max-w-7xl mx-auto">
                <div class="text-center mb-16 fade-in-section">
                    <div class="flex items-center justify-center gap-4 mb-6">
                        <span class="w-12 h-[2px] bg-pagani-gold"></span>
                        <span class="text-pagani-gold tracking-[0.3em] uppercase text-sm">Testimonials</span>
                        <span class="w-12 h-[2px] bg-pagani-gold"></span>
                    </div>
                    <h2 class="text-4xl md:text-5xl font-orbitron font-bold">WHAT OWNERS <span class="text-pagani-gold">SAY</span></h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    ${vr.map((o,l)=>`
                        <div class="fade-in-section bg-pagani-black border border-white/10 p-8 hover:border-pagani-gold/50 transition-all" style="animation-delay: ${l*150}ms">
                            <div class="flex gap-1 mb-4">
                                ${Array(o.rating).fill("⭐").join("")}
                            </div>
                            <p class="text-gray-300 mb-6 leading-relaxed italic">"${o.content}"</p>
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 bg-pagani-gold/20 rounded-full flex items-center justify-center text-pagani-gold font-bold">
                                    ${o.name.charAt(0)}
                                </div>
                                <div>
                                    <div class="font-semibold">${o.name}</div>
                                    <div class="text-sm text-gray-400">${o.role}, ${o.company}</div>
                                </div>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="relative z-20 bg-pagani-black py-24 px-8 border-t border-pagani-gold/20">
            <div class="max-w-4xl mx-auto text-center fade-in-section">
                <h2 class="text-4xl md:text-6xl font-orbitron font-bold mb-8">EXPERIENCE THE <span class="text-pagani-gold">FUTURE</span></h2>
                <p class="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">Configure your EVBharat X-1 or schedule a test drive to experience the pinnacle of electric performance.</p>
                <div class="flex flex-col sm:flex-row gap-6 justify-center">
                    <a href="/configurator" class="px-12 py-4 bg-pagani-gold text-black font-semibold tracking-widest uppercase hover:bg-pagani-gold/90 transition-all text-sm">
                        Configure Now
                    </a>
                    <a href="/contact" class="px-12 py-4 border border-pagani-gold text-pagani-gold font-semibold tracking-widest uppercase hover:bg-pagani-gold hover:text-black transition-all text-sm">
                        Book Test Drive
                    </a>
                </div>
            </div>
        </section>
    `;const e=new oi("zonda-canvas",241),a=new br("zonda-hud"),i=document.querySelector("#scroll-container"),s=()=>{if(!i)return;const o=i.getBoundingClientRect(),l=window.innerHeight,c=i.offsetHeight-l,p=-o.top,g=Math.min(1,Math.max(0,p/c));e.update(g),a.update(g)};window.addEventListener("scroll",s,{passive:!0}),s(),new be(.1).observeAll(".fade-in-section");const r=new IntersectionObserver(o=>{o.forEach(l=>{if(l.isIntersecting){const d=l.target,c=parseFloat(d.dataset.counter||"0"),p=d.dataset.counter?.includes(".")?"s":"";yr(d,0,c,2e3,p),r.unobserve(d)}})});document.querySelectorAll("[data-counter]").forEach(o=>{r.observe(o)})}const Tr=[{id:"ceo",name:"Dr. Rajesh Kumar",role:"CEO & Founder",bio:"Former Tesla engineer with 15+ years in EV technology. PhD in Electrical Engineering from MIT.",image:"/images/team/ceo.jpg",linkedin:"#"},{id:"cto",name:"Priya Sharma",role:"CTO",bio:"AI/ML expert specializing in automotive applications. Led autonomous driving projects at Waymo.",image:"/images/team/cto.jpg",linkedin:"#"},{id:"design",name:"Arjun Patel",role:"Head of Design",bio:"Award-winning automotive designer. Previously at Pagani and Lamborghini.",image:"/images/team/design.jpg",linkedin:"#"},{id:"engineering",name:"Dr. Meera Reddy",role:"Chief Engineer",bio:"Battery technology pioneer. 20+ patents in solid-state battery systems.",image:"/images/team/engineering.jpg",linkedin:"#"}];async function kr(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
        <!-- Hero Section -->
        <section class="relative min-h-screen flex items-center justify-center px-8 py-32 bg-gradient-to-b from-pagani-black via-gray-900 to-pagani-black">
            <div class="absolute inset-0 opacity-10">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.1),transparent_50%)]"></div>
            </div>
            <div class="max-w-4xl mx-auto text-center relative z-10 fade-in-section">
                <div class="flex items-center justify-center gap-4 mb-8">
                    <span class="w-16 h-[2px] bg-pagani-gold"></span>
                    <span class="text-pagani-gold tracking-[0.3em] uppercase text-sm">About Us</span>
                    <span class="w-16 h-[2px] bg-pagani-gold"></span>
                </div>
                <h1 class="text-5xl md:text-7xl font-orbitron font-bold mb-8 leading-tight">
                    PIONEERING INDIA'S<br><span class="text-pagani-gold">ELECTRIC FUTURE</span>
                </h1>
                <p class="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                    EVBharat was born from a vision to solve India's unique EV challenges with cutting-edge AI technology and hypercar-level performance engineering.
                </p>
            </div>
        </section>

        <!-- Mission Section -->
        <section class="relative z-20 bg-pagani-black py-24 px-8 border-y border-pagani-gold/20">
            <div class="max-w-7xl mx-auto">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div class="fade-in-section">
                        <div class="flex items-center gap-4 mb-6">
                            <span class="w-12 h-[2px] bg-pagani-gold"></span>
                            <span class="text-pagani-gold tracking-[0.3em] uppercase text-sm">Our Mission</span>
                        </div>
                        <h2 class="text-4xl md:text-5xl font-orbitron font-bold mb-6">REDEFINING <span class="text-pagani-gold">ELECTRIC MOBILITY</span></h2>
                        <p class="text-gray-400 text-lg leading-relaxed mb-6">
                            We're not just building electric vehicles—we're creating intelligent machines that understand Indian roads, traffic patterns, and driving conditions.
                        </p>
                        <p class="text-gray-400 text-lg leading-relaxed">
                            Our AI-powered platform combines machine learning for battery health prediction, traffic-aware routing optimization, and energy consumption analysis to deliver an unmatched EV experience.
                        </p>
                    </div>
                    <div class="fade-in-section grid grid-cols-2 gap-4">
                        <div class="bg-gradient-to-br from-pagani-gold/10 to-transparent border border-pagani-gold/30 p-8">
                            <div class="text-5xl font-orbitron font-bold text-pagani-gold mb-2">2024</div>
                            <div class="text-sm text-gray-400 uppercase tracking-wider">Founded</div>
                        </div>
                        <div class="bg-gradient-to-br from-pagani-gold/10 to-transparent border border-pagani-gold/30 p-8">
                            <div class="text-5xl font-orbitron font-bold text-pagani-gold mb-2">500+</div>
                            <div class="text-sm text-gray-400 uppercase tracking-wider">Engineers</div>
                        </div>
                        <div class="bg-gradient-to-br from-pagani-gold/10 to-transparent border border-pagani-gold/30 p-8">
                            <div class="text-5xl font-orbitron font-bold text-pagani-gold mb-2">50+</div>
                            <div class="text-sm text-gray-400 uppercase tracking-wider">Patents</div>
                        </div>
                        <div class="bg-gradient-to-br from-pagani-gold/10 to-transparent border border-pagani-gold/30 p-8">
                            <div class="text-5xl font-orbitron font-bold text-pagani-gold mb-2">3</div>
                            <div class="text-sm text-gray-400 uppercase tracking-wider">R&D Centers</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Timeline Section -->
        <section class="relative z-20 bg-gradient-to-b from-gray-900 to-pagani-black py-24 px-8">
            <div class="max-w-5xl mx-auto">
                <div class="text-center mb-16 fade-in-section">
                    <h2 class="text-4xl md:text-5xl font-orbitron font-bold mb-6">OUR <span class="text-pagani-gold">JOURNEY</span></h2>
                </div>

                <div class="space-y-12">
                    ${[{year:"2024",title:"Company Founded",desc:"EVBharat established with a vision to revolutionize Indian EV market"},{year:"2025",title:"AI Platform Launch",desc:"Launched proprietary AI/ML platform for battery health and routing optimization"},{year:"2025",title:"X-1 Prototype",desc:"Unveiled EVBharat X-1 prototype at Auto Expo India"},{year:"2026",title:"Production Ready",desc:"X-1 enters production with 850km range and 2.1s 0-100 acceleration"}].map((a,i)=>`
                        <div class="fade-in-section flex gap-8 items-start" style="animation-delay: ${i*100}ms">
                            <div class="flex-shrink-0 w-32 text-right">
                                <div class="text-3xl font-orbitron font-bold text-pagani-gold">${a.year}</div>
                            </div>
                            <div class="flex-shrink-0 w-px h-full bg-pagani-gold/30 relative">
                                <div class="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-pagani-gold rounded-full"></div>
                            </div>
                            <div class="flex-1 pb-8">
                                <h3 class="text-2xl font-orbitron font-bold mb-2">${a.title}</h3>
                                <p class="text-gray-400">${a.desc}</p>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
        </section>

        <!-- Team Section -->
        <section class="relative z-20 bg-pagani-black py-24 px-8 border-t border-pagani-gold/20">
            <div class="max-w-7xl mx-auto">
                <div class="text-center mb-16 fade-in-section">
                    <div class="flex items-center justify-center gap-4 mb-6">
                        <span class="w-12 h-[2px] bg-pagani-gold"></span>
                        <span class="text-pagani-gold tracking-[0.3em] uppercase text-sm">Leadership</span>
                        <span class="w-12 h-[2px] bg-pagani-gold"></span>
                    </div>
                    <h2 class="text-4xl md:text-5xl font-orbitron font-bold">MEET THE <span class="text-pagani-gold">TEAM</span></h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    ${Tr.map((a,i)=>`
                        <div class="fade-in-section group" style="animation-delay: ${i*100}ms">
                            <div class="relative overflow-hidden mb-6 aspect-square bg-gradient-to-br from-pagani-gold/20 to-transparent border border-pagani-gold/30">
                                <div class="absolute inset-0 flex items-center justify-center text-6xl font-orbitron font-bold text-pagani-gold/30">
                                    ${a.name.split(" ").map(s=>s[0]).join("")}
                                </div>
                                <div class="absolute inset-0 bg-gradient-to-t from-pagani-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <h3 class="text-xl font-orbitron font-bold mb-1 group-hover:text-pagani-gold transition-colors">${a.name}</h3>
                            <div class="text-pagani-gold text-sm mb-3 uppercase tracking-wider">${a.role}</div>
                            <p class="text-gray-400 text-sm leading-relaxed">${a.bio}</p>
                        </div>
                    `).join("")}
                </div>
            </div>
        </section>

        <!-- Values Section -->
        <section class="relative z-20 bg-gradient-to-b from-gray-900 to-pagani-black py-24 px-8">
            <div class="max-w-7xl mx-auto">
                <div class="text-center mb-16 fade-in-section">
                    <h2 class="text-4xl md:text-5xl font-orbitron font-bold">OUR <span class="text-pagani-gold">VALUES</span></h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    ${[{icon:"🚀",title:"Innovation First",desc:"Pushing boundaries with AI and cutting-edge technology"},{icon:"🌱",title:"Sustainability",desc:"Building a cleaner, greener future for India"},{icon:"🎯",title:"Performance",desc:"Never compromising on speed, range, or reliability"}].map((a,i)=>`
                        <div class="fade-in-section text-center p-8 border border-white/10 hover:border-pagani-gold/50 transition-all" style="animation-delay: ${i*100}ms">
                            <div class="text-6xl mb-6">${a.icon}</div>
                            <h3 class="text-2xl font-orbitron font-bold mb-4">${a.title}</h3>
                            <p class="text-gray-400 leading-relaxed">${a.desc}</p>
                        </div>
                    `).join("")}
                </div>
            </div>
        </section>
    `,new be(.1).observeAll(".fade-in-section")}const Er=[{category:"Performance",specs:[{label:"0-100 km/h",value:"2.1 seconds"},{label:"Top Speed",value:"350 km/h"},{label:"Power Output",value:"1,400 kW (1,877 HP)"},{label:"Torque",value:"2,300 Nm"},{label:"Drive Type",value:"Quad Motor AWD"}]},{category:"Battery & Range",specs:[{label:"Battery Capacity",value:"120 kWh"},{label:"Battery Type",value:"Solid-State Graphene"},{label:"Range (WLTP)",value:"850 km"},{label:"Charging",value:"800V Architecture"},{label:"10-80% Charge Time",value:"18 minutes"}]},{category:"Dimensions & Weight",specs:[{label:"Length",value:"4,650 mm"},{label:"Width",value:"2,050 mm"},{label:"Height",value:"1,150 mm"},{label:"Wheelbase",value:"2,750 mm"},{label:"Dry Weight",value:"1,150 kg"}]},{category:"AI & Technology",specs:[{label:"AI Processor",value:"NVIDIA Drive Orin"},{label:"Sensors",value:"12 Cameras, 8 Radars, 4 LiDAR"},{label:"Connectivity",value:"5G, V2X"},{label:"OTA Updates",value:"Full Stack"},{label:"Autonomous Level",value:"Level 3"}]}];async function Sr(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
        <!-- Hero Section -->
        <section class="relative min-h-screen flex items-center justify-center px-8 py-32 bg-gradient-to-b from-pagani-black via-gray-900 to-pagani-black overflow-hidden">
            <div class="absolute inset-0">
                <div class="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:64px_64px]"></div>
            </div>
            <div class="max-w-5xl mx-auto text-center relative z-10 fade-in-section">
                <div class="flex items-center justify-center gap-4 mb-8">
                    <span class="w-16 h-[2px] bg-pagani-gold"></span>
                    <span class="text-pagani-gold tracking-[0.3em] uppercase text-sm">Technology</span>
                    <span class="w-16 h-[2px] bg-pagani-gold"></span>
                </div>
                <h1 class="text-5xl md:text-7xl font-orbitron font-bold mb-8 leading-tight">
                    AI-POWERED<br><span class="text-pagani-gold">INTELLIGENCE</span>
                </h1>
                <p class="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                    Revolutionary machine learning algorithms optimized for Indian roads, traffic patterns, and driving conditions.
                </p>
            </div>
        </section>

        <!-- AI Features Section -->
        <section class="relative z-20 bg-pagani-black py-24 px-8 border-y border-pagani-gold/20">
            <div class="max-w-7xl mx-auto">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
                    <div class="fade-in-section">
                        <div class="flex items-center gap-4 mb-6">
                            <span class="w-12 h-[2px] bg-pagani-gold"></span>
                            <span class="text-pagani-gold tracking-[0.3em] uppercase text-sm">AI Core</span>
                        </div>
                        <h2 class="text-4xl md:text-5xl font-orbitron font-bold mb-6 cursor-pointer hover:text-pagani-gold transition-colors" id="battery-health-title">BATTERY HEALTH<br><span class="text-pagani-gold">PREDICTION</span></h2>
                        <p class="text-gray-400 text-lg leading-relaxed mb-8">
                            Our proprietary ML models continuously monitor battery degradation patterns, predict remaining useful life, and optimize charging cycles to maximize longevity.
                        </p>
                        <ul class="space-y-4">
                            ${["Real-time State of Health (SOH) monitoring","Predictive maintenance alerts","Adaptive charging optimization","Temperature-aware battery management","Driving pattern analysis"].map(i=>`
                                <li class="flex items-start gap-3">
                                    <span class="text-pagani-gold mt-1">▸</span>
                                    <span class="text-gray-300">${i}</span>
                                </li>
                            `).join("")}
                        </ul>
                    </div>
                    <div class="fade-in-section flex items-center justify-center">
                        <div class="relative w-full aspect-square max-w-md">
                            <div class="absolute inset-0 border-4 border-pagani-gold/20 rounded-full"></div>
                            <div class="absolute inset-8 border-4 border-pagani-gold/30 rounded-full"></div>
                            <div class="absolute inset-16 border-4 border-pagani-gold/40 rounded-full"></div>
                            <div class="absolute inset-0 flex items-center justify-center">
                                <div class="text-center">
                                    <div class="text-7xl mb-4">🔋</div>
                                    <div class="text-2xl font-orbitron font-bold text-pagani-gold">AI CORE</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div class="fade-in-section flex items-center justify-center order-2 lg:order-1">
                        <div class="relative w-full aspect-square max-w-md">
                            <div class="absolute inset-0 bg-gradient-to-br from-pagani-gold/10 to-transparent border border-pagani-gold/30 flex items-center justify-center">
                                <div class="text-center">
                                    <div class="text-7xl mb-4">🗺️</div>
                                    <div class="text-2xl font-orbitron font-bold text-pagani-gold">SMART ROUTING</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="fade-in-section order-1 lg:order-2">
                        <div class="flex items-center gap-4 mb-6">
                            <span class="w-12 h-[2px] bg-pagani-gold"></span>
                            <span class="text-pagani-gold tracking-[0.3em] uppercase text-sm">Navigation</span>
                        </div>
                        <h2 class="text-4xl md:text-5xl font-orbitron font-bold mb-6">INTELLIGENT<br><span class="text-pagani-gold">ROUTING</span></h2>
                        <p class="text-gray-400 text-lg leading-relaxed mb-8">
                            Traffic-aware route optimization that considers real-time conditions, elevation changes, and energy consumption to deliver the most efficient path.
                        </p>
                        <ul class="space-y-4">
                            ${["Real-time traffic integration","Elevation-aware energy calculation","Dynamic charging station recommendations","Weather-adjusted range prediction","Multi-destination optimization"].map(i=>`
                                <li class="flex items-start gap-3">
                                    <span class="text-pagani-gold mt-1">▸</span>
                                    <span class="text-gray-300">${i}</span>
                                </li>
                            `).join("")}
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <!-- Specifications Section -->
        <section class="relative z-20 bg-gradient-to-b from-gray-900 to-pagani-black py-24 px-8">
            <div class="max-w-7xl mx-auto">
                <div class="text-center mb-16 fade-in-section">
                    <h2 class="text-4xl md:text-5xl font-orbitron font-bold mb-6">TECHNICAL <span class="text-pagani-gold">SPECIFICATIONS</span></h2>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    ${Er.map((i,s)=>`
                        <div class="fade-in-section bg-pagani-black border border-white/10 p-8" style="animation-delay: ${s*100}ms">
                            <h3 class="text-2xl font-orbitron font-bold text-pagani-gold mb-6 uppercase tracking-wider">${i.category}</h3>
                            <div class="space-y-4">
                                ${i.specs.map(n=>`
                                    <div class="flex justify-between items-center border-b border-white/5 pb-3">
                                        <span class="text-gray-400">${n.label}</span>
                                        <span class="font-semibold text-white">${n.value}</span>
                                    </div>
                                `).join("")}
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
        </section>

        <!-- Innovation Section -->
        <section class="relative z-20 bg-pagani-black py-24 px-8 border-t border-pagani-gold/20">
            <div class="max-w-7xl mx-auto">
                <div class="text-center mb-16 fade-in-section">
                    <h2 class="text-4xl md:text-5xl font-orbitron font-bold">BREAKTHROUGH <span class="text-pagani-gold">INNOVATIONS</span></h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    ${[{title:"Solid-State Battery",desc:"Graphene-enhanced solid-state cells delivering 850km range with superior safety and longevity",icon:"⚡"},{title:"Quad Motor System",desc:"Independent motor control for each wheel enabling precise torque vectoring and unmatched handling",icon:"🏎️"},{title:"800V Architecture",desc:"Ultra-fast charging capability with advanced thermal management for optimal performance",icon:"🔌"}].map((i,s)=>`
                        <div class="fade-in-section bg-gradient-to-br from-pagani-gold/5 to-transparent border border-pagani-gold/30 p-8 hover:border-pagani-gold transition-all group" style="animation-delay: ${s*100}ms">
                            <div class="text-6xl mb-6 group-hover:scale-110 transition-transform">${i.icon}</div>
                            <h3 class="text-2xl font-orbitron font-bold mb-4 group-hover:text-pagani-gold transition-colors">${i.title}</h3>
                            <p class="text-gray-400 leading-relaxed">${i.desc}</p>
                        </div>
                    `).join("")}
                </div>
            </div>
        </section>
    `,new be(.1).observeAll(".fade-in-section");const a=document.getElementById("battery-health-title");a&&a.addEventListener("click",Ar)}function Ar(){const t=`
        <div class="space-y-8">
            <!-- Header -->
            <div class="text-center mb-8">
                <div class="text-7xl mb-4">🔋</div>
                <h3 class="text-3xl font-orbitron font-bold mb-2">AI Battery Health Prediction System</h3>
                <p class="text-gray-400">Real-time ML-powered battery monitoring and analysis</p>
            </div>

            <!-- Current Battery Status -->
            <div class="bg-gradient-to-br from-pagani-gold/10 to-transparent border border-pagani-gold/30 p-6 rounded-lg">
                <h4 class="text-xl font-orbitron font-bold mb-4 text-pagani-gold">Current Battery Status</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="text-center">
                        <div class="text-3xl font-bold text-white">94%</div>
                        <div class="text-sm text-gray-400">State of Health</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-white">82%</div>
                        <div class="text-sm text-gray-400">Current Charge</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-white">28°C</div>
                        <div class="text-sm text-gray-400">Temperature</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-white">245</div>
                        <div class="text-sm text-gray-400">Charge Cycles</div>
                    </div>
                </div>
            </div>

            <!-- ML Predictions -->
            <div class="grid md:grid-cols-2 gap-6">
                <div class="bg-pagani-black border border-pagani-gold/20 p-6">
                    <h4 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                        <span class="text-pagani-gold">▸</span>
                        Predicted Degradation
                    </h4>
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">Next 6 months</span>
                            <span class="text-white font-bold">2.3% decline</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">Next 12 months</span>
                            <span class="text-white font-bold">4.8% decline</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">Estimated lifespan</span>
                            <span class="text-white font-bold">8.2 years</span>
                        </div>
                    </div>
                </div>

                <div class="bg-pagani-black border border-pagani-gold/20 p-6">
                    <h4 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                        <span class="text-pagani-gold">▸</span>
                        Optimization Recommendations
                    </h4>
                    <ul class="space-y-3 text-gray-300">
                        <li class="flex items-start gap-2">
                            <span class="text-green-500 mt-1">✓</span>
                            <span>Charging patterns optimal</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-yellow-500 mt-1">⚠</span>
                            <span>Consider reducing fast-charge frequency</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-green-500 mt-1">✓</span>
                            <span>Temperature management excellent</span>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Key Features -->
            <div class="border-t border-pagani-gold/20 pt-6">
                <h4 class="text-xl font-orbitron font-bold mb-4">AI/ML Features</h4>
                <div class="grid md:grid-cols-3 gap-4">
                    ${[{icon:"📊",title:"Real-time Monitoring",desc:"Continuous SOH analysis with ML models"},{icon:"🎯",title:"Predictive Alerts",desc:"Proactive maintenance notifications"},{icon:"⚡",title:"Smart Charging",desc:"Adaptive charging cycle optimization"},{icon:"🌡️",title:"Thermal Management",desc:"Temperature-aware battery control"},{icon:"📈",title:"Pattern Analysis",desc:"Driving behavior impact assessment"},{icon:"🔮",title:"Lifespan Prediction",desc:"Accurate remaining life estimation"}].map(e=>`
                        <div class="bg-gradient-to-br from-pagani-gold/5 to-transparent border border-pagani-gold/20 p-4">
                            <div class="text-3xl mb-2">${e.icon}</div>
                            <h5 class="font-bold text-sm mb-1">${e.title}</h5>
                            <p class="text-xs text-gray-400">${e.desc}</p>
                        </div>
                    `).join("")}
                </div>
            </div>

            <!-- Technical Details -->
            <div class="bg-pagani-black border border-pagani-gold/20 p-6">
                <h4 class="text-lg font-orbitron font-bold mb-4">Technical Specifications</h4>
                <div class="grid md:grid-cols-2 gap-4 text-sm">
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-gray-400">ML Model Type:</span>
                            <span class="text-white">LSTM Neural Network</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Prediction Accuracy:</span>
                            <span class="text-white">97.3%</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Update Frequency:</span>
                            <span class="text-white">Real-time (50ms)</span>
                        </div>
                    </div>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-gray-400">Data Points Analyzed:</span>
                            <span class="text-white">250+ parameters</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Training Dataset:</span>
                            <span class="text-white">5M+ charge cycles</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Edge Computing:</span>
                            <span class="text-white">On-board AI chip</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;bt.open(t,"BATTERY HEALTH PREDICTION")}class Mr{rules=new Map;addRule(e,a){this.rules.set(e,a)}validate(e){const a=[];return this.rules.forEach((i,s)=>{const n=e.get(s)||"",r=this.validateField(s,n,i);a.push(...r)}),{isValid:a.length===0,errors:a}}validateField(e,a,i){const s=[];return i.required&&!a.trim()?(s.push(`${this.formatFieldName(e)} is required`),s):(a&&i.email&&!this.isValidEmail(a)&&s.push(`${this.formatFieldName(e)} must be a valid email address`),a&&i.phone&&!this.isValidPhone(a)&&s.push(`${this.formatFieldName(e)} must be a valid phone number`),a&&i.minLength&&a.length<i.minLength&&s.push(`${this.formatFieldName(e)} must be at least ${i.minLength} characters`),a&&i.maxLength&&a.length>i.maxLength&&s.push(`${this.formatFieldName(e)} must not exceed ${i.maxLength} characters`),a&&i.pattern&&!i.pattern.test(a)&&s.push(`${this.formatFieldName(e)} format is invalid`),a&&i.custom&&!i.custom(a)&&s.push(`${this.formatFieldName(e)} is invalid`),s)}isValidEmail(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}isValidPhone(e){return/^[\d\s\-\+\(\)]+$/.test(e)&&e.replace(/\D/g,"").length>=10}formatFieldName(e){return e.split(/[-_]/).map(a=>a.charAt(0).toUpperCase()+a.slice(1)).join(" ")}}async function Cr(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
        <!-- Hero Section -->
        <section class="relative min-h-[60vh] flex items-center justify-center px-8 py-32 bg-gradient-to-b from-pagani-black via-gray-900 to-pagani-black">
            <div class="max-w-4xl mx-auto text-center relative z-10 fade-in-section">
                <div class="flex items-center justify-center gap-4 mb-8">
                    <span class="w-16 h-[2px] bg-pagani-gold"></span>
                    <span class="text-pagani-gold tracking-[0.3em] uppercase text-sm">Contact Us</span>
                    <span class="w-16 h-[2px] bg-pagani-gold"></span>
                </div>
                <h1 class="text-5xl md:text-7xl font-orbitron font-bold mb-8">
                    GET IN <span class="text-pagani-gold">TOUCH</span>
                </h1>
                <p class="text-xl text-gray-300 leading-relaxed">
                    Ready to experience the future? Contact us for inquiries, test drives, or partnership opportunities.
                </p>
            </div>
        </section>

        <!-- Contact Form & Info Section -->
        <section class="relative z-20 bg-pagani-black py-24 px-8">
            <div class="max-w-7xl mx-auto">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <!-- Contact Form -->
                    <div class="fade-in-section">
                        <h2 class="text-3xl font-orbitron font-bold mb-8">SEND US A <span class="text-pagani-gold">MESSAGE</span></h2>
                        <form id="contact-form" class="space-y-6">
                            <div>
                                <label class="block text-sm uppercase tracking-wider text-gray-400 mb-2">Full Name *</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    required
                                    class="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-pagani-gold transition-colors"
                                    placeholder="John Doe"
                                />
                                <div class="field-error text-red-500 text-sm mt-1 hidden"></div>
                            </div>

                            <div>
                                <label class="block text-sm uppercase tracking-wider text-gray-400 mb-2">Email *</label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    required
                                    class="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-pagani-gold transition-colors"
                                    placeholder="john@example.com"
                                />
                                <div class="field-error text-red-500 text-sm mt-1 hidden"></div>
                            </div>

                            <div>
                                <label class="block text-sm uppercase tracking-wider text-gray-400 mb-2">Phone</label>
                                <input 
                                    type="tel" 
                                    name="phone"
                                    class="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-pagani-gold transition-colors"
                                    placeholder="+91 98765 43210"
                                />
                                <div class="field-error text-red-500 text-sm mt-1 hidden"></div>
                            </div>

                            <div>
                                <label class="block text-sm uppercase tracking-wider text-gray-400 mb-2">Subject *</label>
                                <select 
                                    name="subject" 
                                    required
                                    class="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-pagani-gold transition-colors"
                                >
                                    <option value="">Select a subject</option>
                                    <option value="test-drive">Book Test Drive</option>
                                    <option value="purchase">Purchase Inquiry</option>
                                    <option value="partnership">Partnership</option>
                                    <option value="support">Customer Support</option>
                                    <option value="other">Other</option>
                                </select>
                                <div class="field-error text-red-500 text-sm mt-1 hidden"></div>
                            </div>

                            <div>
                                <label class="block text-sm uppercase tracking-wider text-gray-400 mb-2">Message *</label>
                                <textarea 
                                    name="message" 
                                    required
                                    rows="5"
                                    class="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-pagani-gold transition-colors resize-none"
                                    placeholder="Tell us how we can help..."
                                ></textarea>
                                <div class="field-error text-red-500 text-sm mt-1 hidden"></div>
                            </div>

                            <button 
                                type="submit"
                                class="w-full bg-pagani-gold text-black px-8 py-4 font-semibold tracking-widest uppercase hover:bg-pagani-gold/90 transition-all"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>

                    <!-- Contact Info -->
                    <div class="fade-in-section space-y-8">
                        <div>
                            <h2 class="text-3xl font-orbitron font-bold mb-8">VISIT OUR <span class="text-pagani-gold">SHOWROOMS</span></h2>
                        </div>

                        <!-- Locations -->
                        ${[{city:"Mumbai",address:"Bandra Kurla Complex, Mumbai 400051",phone:"+91 22 1234 5678",email:"mumbai@evbharat.com"},{city:"Bangalore",address:"Koramangala, Bangalore 560095",phone:"+91 80 1234 5678",email:"bangalore@evbharat.com"},{city:"Delhi",address:"Connaught Place, New Delhi 110001",phone:"+91 11 1234 5678",email:"delhi@evbharat.com"}].map(s=>`
                            <div class="bg-gradient-to-br from-pagani-gold/5 to-transparent border border-pagani-gold/30 p-6">
                                <h3 class="text-xl font-orbitron font-bold text-pagani-gold mb-4">${s.city}</h3>
                                <div class="space-y-3 text-gray-300">
                                    <div class="flex items-start gap-3">
                                        <span class="text-pagani-gold mt-1">📍</span>
                                        <span>${s.address}</span>
                                    </div>
                                    <div class="flex items-start gap-3">
                                        <span class="text-pagani-gold mt-1">📞</span>
                                        <a href="tel:${s.phone}" class="hover:text-pagani-gold transition-colors">${s.phone}</a>
                                    </div>
                                    <div class="flex items-start gap-3">
                                        <span class="text-pagani-gold mt-1">✉️</span>
                                        <a href="mailto:${s.email}" class="hover:text-pagani-gold transition-colors">${s.email}</a>
                                    </div>
                                </div>
                            </div>
                        `).join("")}

                        <!-- Social Media -->
                        <div class="border-t border-white/10 pt-8">
                            <h3 class="text-xl font-orbitron font-bold mb-4">FOLLOW US</h3>
                            <div class="flex gap-4">
                                ${["Twitter","LinkedIn","Instagram","YouTube"].map(s=>`
                                    <a href="#" class="w-12 h-12 border border-white/20 hover:border-pagani-gold flex items-center justify-center transition-colors group">
                                        <span class="text-white group-hover:text-pagani-gold text-xs">${s.slice(0,2)}</span>
                                    </a>
                                `).join("")}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- FAQ Section -->
        <section class="relative z-20 bg-gradient-to-b from-gray-900 to-pagani-black py-24 px-8 border-t border-pagani-gold/20">
            <div class="max-w-4xl mx-auto">
                <div class="text-center mb-16 fade-in-section">
                    <h2 class="text-4xl md:text-5xl font-orbitron font-bold">FREQUENTLY ASKED <span class="text-pagani-gold">QUESTIONS</span></h2>
                </div>

                <div class="space-y-4">
                    ${[{q:"How do I book a test drive?",a:'You can book a test drive by filling out the contact form above, calling our showrooms, or using the "Book Test Drive" button on our homepage.'},{q:"What is the delivery timeline?",a:"Current delivery timeline is 6-8 months from order confirmation. Priority delivery options are available."},{q:"What warranty is included?",a:"EVBharat X-1 comes with a 5-year/100,000 km vehicle warranty and 8-year/160,000 km battery warranty."},{q:"Are there financing options available?",a:"Yes, we partner with leading banks to offer flexible financing options with competitive interest rates."}].map((s,n)=>`
                        <div class="fade-in-section faq-item border border-white/10 hover:border-pagani-gold/50 transition-all" style="animation-delay: ${n*50}ms">
                            <button class="faq-question w-full text-left p-6 flex justify-between items-center">
                                <span class="font-orbitron font-bold text-lg">${s.q}</span>
                                <span class="text-pagani-gold text-2xl faq-icon">+</span>
                            </button>
                            <div class="faq-answer hidden px-6 pb-6 text-gray-400 leading-relaxed">
                                ${s.a}
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
        </section>
    `;const e=new Mr;e.addRule("name",{required:!0,minLength:2}),e.addRule("email",{required:!0,email:!0}),e.addRule("phone",{phone:!0}),e.addRule("subject",{required:!0}),e.addRule("message",{required:!0,minLength:10});const a=document.getElementById("contact-form");a?.addEventListener("submit",s=>{s.preventDefault();const n=new FormData(a),r=e.validate(n);r.isValid?(alert("Thank you for your message! We will get back to you soon. 🎉"),a.reset()):alert(r.errors.join(`
`))}),document.querySelectorAll(".faq-question").forEach(s=>{s.addEventListener("click",()=>{const r=s.parentElement?.querySelector(".faq-answer"),o=s.querySelector(".faq-icon");r?.classList.contains("hidden")?(r.classList.remove("hidden"),o&&(o.textContent="−")):(r?.classList.add("hidden"),o&&(o.textContent="+"))})}),new be(.1).observeAll(".fade-in-section")}class Ir{prefix;constructor(e="evbharat_"){this.prefix=e}set(e,a){try{const i=JSON.stringify(a);localStorage.setItem(this.prefix+e,i)}catch(i){console.error("Error saving to localStorage:",i)}}get(e,a){try{const i=localStorage.getItem(this.prefix+e);return i===null?a??null:JSON.parse(i)}catch(i){return console.error("Error reading from localStorage:",i),a??null}}remove(e){localStorage.removeItem(this.prefix+e)}clear(){Object.keys(localStorage).forEach(a=>{a.startsWith(this.prefix)&&localStorage.removeItem(a)})}has(e){return localStorage.getItem(this.prefix+e)!==null}}const Yt=new Ir,ke=125e5,P={colors:[{id:"midnight-black",name:"Midnight Black",hex:"#0a0a0a",price:0,image:"/images/gallery/ev_car_side_black_1768921527957.png"},{id:"pagani-gold",name:"Pagani Gold",hex:"#d4af37",price:2e5,image:"/images/gallery/ev_car_side_gold_1768921550995.png"},{id:"arctic-white",name:"Arctic White",hex:"#f5f5f5",price:0,image:"/images/gallery/ev_car_side_white_1768921572922.png"},{id:"racing-red",name:"Racing Red",hex:"#c41e3a",price:15e4,image:"/images/gallery/ev_car_side_black_1768921527957.png"},{id:"electric-blue",name:"Electric Blue",hex:"#0066cc",price:15e4,image:"/images/gallery/ev_car_side_white_1768921572922.png"}],wheels:[{id:"standard",name:'20" Standard Alloy',price:0},{id:"carbon",name:'21" Carbon Fiber',price:5e5},{id:"forged",name:'22" Forged Titanium',price:8e5}],interior:[{id:"black-leather",name:"Black Leather",price:0},{id:"tan-leather",name:"Tan Premium Leather",price:3e5},{id:"carbon-alcantara",name:"Carbon Alcantara",price:6e5}]};async function Lr(){const t=document.getElementById("app");if(!t)return;const e=Yt.get("configurator")||{color:"midnight-black",wheels:"standard",interior:"black-leather",autopilot:!1,price:ke},a=P.colors.find(r=>r.id===e.color);t.innerHTML=`
        <!-- Hero Section -->
        <section class="relative min-h-screen bg-pagani-black px-8 py-24">
            <div class="max-w-7xl mx-auto">
                <div class="text-center mb-12 fade-in-section">
                    <div class="flex items-center justify-center gap-4 mb-6">
                        <span class="w-16 h-[2px] bg-pagani-gold"></span>
                        <span class="text-pagani-gold tracking-[0.3em] uppercase text-sm">Configurator</span>
                        <span class="w-16 h-[2px] bg-pagani-gold"></span>
                    </div>
                    <h1 class="text-4xl md:text-6xl font-orbitron font-bold mb-4">
                        BUILD YOUR <span class="text-pagani-gold">EVBHARAT X-1</span>
                    </h1>
                    <p class="text-gray-400 text-lg">Customize every detail to create your perfect electric hypercar</p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <!-- Preview Section -->
                    <div class="fade-in-section">
                        <div class="sticky top-24">
                            <div id="car-preview" class="relative aspect-video bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/30 overflow-hidden mb-6">
                                <img 
                                    id="car-image" 
                                    src="${a?.image||"/images/gallery/ev_car_side_black_1768921527957.png"}" 
                                    alt="EVBharat X-1" 
                                    class="w-full h-full object-contain transition-opacity duration-500"
                                />
                                <div class="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm px-4 py-2 border border-pagani-gold/30">
                                    <div class="text-sm text-pagani-gold font-semibold" id="selected-color">${a?.name||"Midnight Black"}</div>
                                </div>
                            </div>

                            <!-- Price Summary -->
                            <div class="bg-gradient-to-br from-pagani-gold/10 to-transparent border border-pagani-gold/30 p-6">
                                <div class="flex justify-between items-center mb-4">
                                    <span class="text-gray-400">Base Price</span>
                                    <span class="font-semibold">₹${(ke/1e5).toFixed(1)}L</span>
                                </div>
                                <div id="price-breakdown" class="space-y-2 mb-4 text-sm"></div>
                                <div class="border-t border-white/10 pt-4 flex justify-between items-center">
                                    <span class="text-xl font-orbitron font-bold">Total Price</span>
                                    <span id="total-price" class="text-3xl font-orbitron font-bold text-pagani-gold">₹${(ke/1e5).toFixed(1)}L</span>
                                </div>
                            </div>

                            <div class="mt-6 space-y-3">
                                <button id="save-config" class="w-full bg-pagani-gold text-black px-6 py-4 font-semibold tracking-widest uppercase hover:bg-pagani-gold/90 transition-all">
                                    Save Configuration
                                </button>
                                <button id="share-config" class="w-full border border-pagani-gold text-pagani-gold px-6 py-4 font-semibold tracking-widest uppercase hover:bg-pagani-gold hover:text-black transition-all">
                                    Share Configuration
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Options Section -->
                    <div class="space-y-8">
                        <!-- Exterior Color -->
                        <div class="fade-in-section">
                            <h3 class="text-2xl font-orbitron font-bold mb-6 flex items-center gap-3">
                                <span class="text-pagani-gold">01</span>
                                <span>EXTERIOR COLOR</span>
                            </h3>
                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4" id="color-options">
                                ${P.colors.map(r=>`
                                    <button 
                                        class="color-option group border-2 border-white/10 hover:border-pagani-gold p-4 transition-all ${r.id===e.color?"border-pagani-gold":""}"
                                        data-id="${r.id}"
                                        data-price="${r.price}"
                                        data-image="${r.image}"
                                    >
                                        <div class="w-full aspect-square rounded-full mb-3 border-2 border-white/20" style="background-color: ${r.hex}"></div>
                                        <div class="text-sm font-semibold mb-1">${r.name}</div>
                                        <div class="text-xs text-gray-400">${r.price>0?"+₹"+(r.price/1e5).toFixed(1)+"L":"Included"}</div>
                                    </button>
                                `).join("")}
                            </div>
                        </div>

                        <!-- Wheels -->
                        <div class="fade-in-section">
                            <h3 class="text-2xl font-orbitron font-bold mb-6 flex items-center gap-3">
                                <span class="text-pagani-gold">02</span>
                                <span>WHEELS</span>
                            </h3>
                            <div class="space-y-3" id="wheel-options">
                                ${P.wheels.map(r=>`
                                    <button 
                                        class="wheel-option w-full text-left border-2 border-white/10 hover:border-pagani-gold p-4 transition-all flex justify-between items-center ${r.id===e.wheels?"border-pagani-gold bg-pagani-gold/5":""}"
                                        data-id="${r.id}"
                                        data-price="${r.price}"
                                    >
                                        <div>
                                            <div class="font-semibold mb-1">${r.name}</div>
                                            <div class="text-xs text-gray-400">${r.price>0?"+₹"+(r.price/1e5).toFixed(1)+"L":"Included"}</div>
                                        </div>
                                        <div class="text-2xl">⚙️</div>
                                    </button>
                                `).join("")}
                            </div>
                        </div>

                        <!-- Interior -->
                        <div class="fade-in-section">
                            <h3 class="text-2xl font-orbitron font-bold mb-6 flex items-center gap-3">
                                <span class="text-pagani-gold">03</span>
                                <span>INTERIOR</span>
                            </h3>
                            <div class="space-y-3" id="interior-options">
                                ${P.interior.map(r=>`
                                    <button 
                                        class="interior-option w-full text-left border-2 border-white/10 hover:border-pagani-gold p-4 transition-all flex justify-between items-center ${r.id===e.interior?"border-pagani-gold bg-pagani-gold/5":""}"
                                        data-id="${r.id}"
                                        data-price="${r.price}"
                                    >
                                        <div>
                                            <div class="font-semibold mb-1">${r.name}</div>
                                            <div class="text-xs text-gray-400">${r.price>0?"+₹"+(r.price/1e5).toFixed(1)+"L":"Included"}</div>
                                        </div>
                                        <div class="text-2xl">🪑</div>
                                    </button>
                                `).join("")}
                            </div>
                        </div>

                        <!-- Autopilot -->
                        <div class="fade-in-section">
                            <h3 class="text-2xl font-orbitron font-bold mb-6 flex items-center gap-3">
                                <span class="text-pagani-gold">04</span>
                                <span>ENHANCED AUTOPILOT</span>
                            </h3>
                            <button 
                                id="autopilot-toggle"
                                class="w-full border-2 border-white/10 hover:border-pagani-gold p-6 transition-all ${e.autopilot?"border-pagani-gold bg-pagani-gold/5":""}"
                            >
                                <div class="flex justify-between items-center">
                                    <div class="text-left">
                                        <div class="font-semibold text-lg mb-2">Level 3 Autonomous Driving</div>
                                        <div class="text-sm text-gray-400">Advanced AI-powered self-driving capabilities</div>
                                        <div class="text-sm text-pagani-gold mt-2">+₹15.0L</div>
                                    </div>
                                    <div class="text-4xl">${e.autopilot?"✅":"⬜"}</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;let i={...e};function s(){let r=ke;const o=[],l=P.colors.find(h=>h.id===i.color);l&&l.price>0&&(r+=l.price,o.push(`<div class="flex justify-between"><span>${l.name}</span><span>+₹${(l.price/1e5).toFixed(1)}L</span></div>`));const d=P.wheels.find(h=>h.id===i.wheels);d&&d.price>0&&(r+=d.price,o.push(`<div class="flex justify-between"><span>${d.name}</span><span>+₹${(d.price/1e5).toFixed(1)}L</span></div>`));const c=P.interior.find(h=>h.id===i.interior);c&&c.price>0&&(r+=c.price,o.push(`<div class="flex justify-between"><span>${c.name}</span><span>+₹${(c.price/1e5).toFixed(1)}L</span></div>`)),i.autopilot&&(r+=15e5,o.push('<div class="flex justify-between"><span>Enhanced Autopilot</span><span>+₹15.0L</span></div>')),i.price=r;const p=document.getElementById("total-price"),g=document.getElementById("price-breakdown");p&&(Ce(p,{scale:[1,1.1,1]},{duration:.3}),p.textContent=`₹${(r/1e5).toFixed(1)}L`),g&&(g.innerHTML=o.join(""))}document.querySelectorAll(".color-option").forEach(r=>{r.addEventListener("click",()=>{document.querySelectorAll(".color-option").forEach(g=>g.classList.remove("border-pagani-gold")),r.classList.add("border-pagani-gold");const o=r.getAttribute("data-id")||"",l=r.getAttribute("data-image")||"";i.color=o;const d=document.getElementById("car-image"),c=document.getElementById("selected-color"),p=P.colors.find(g=>g.id===o);d&&(d.style.opacity="0",setTimeout(()=>{d.src=l,d.style.opacity="1"},300)),c&&p&&(c.textContent=p.name),s()})}),document.querySelectorAll(".wheel-option").forEach(r=>{r.addEventListener("click",()=>{document.querySelectorAll(".wheel-option").forEach(o=>{o.classList.remove("border-pagani-gold","bg-pagani-gold/5")}),r.classList.add("border-pagani-gold","bg-pagani-gold/5"),i.wheels=r.getAttribute("data-id")||"",s()})}),document.querySelectorAll(".interior-option").forEach(r=>{r.addEventListener("click",()=>{document.querySelectorAll(".interior-option").forEach(o=>{o.classList.remove("border-pagani-gold","bg-pagani-gold/5")}),r.classList.add("border-pagani-gold","bg-pagani-gold/5"),i.interior=r.getAttribute("data-id")||"",s()})});const n=document.getElementById("autopilot-toggle");n?.addEventListener("click",()=>{i.autopilot=!i.autopilot,i.autopilot?(n.classList.add("border-pagani-gold","bg-pagani-gold/5"),n.querySelector(".text-4xl").textContent="✅"):(n.classList.remove("border-pagani-gold","bg-pagani-gold/5"),n.querySelector(".text-4xl").textContent="⬜"),s()}),document.getElementById("save-config")?.addEventListener("click",()=>{Yt.set("configurator",i),alert("Configuration saved! 💾")}),document.getElementById("share-config")?.addEventListener("click",()=>{const r=`My EVBharat X-1 Configuration:

Color: ${P.colors.find(o=>o.id===i.color)?.name}
Wheels: ${P.wheels.find(o=>o.id===i.wheels)?.name}
Interior: ${P.interior.find(o=>o.id===i.interior)?.name}
Autopilot: ${i.autopilot?"Yes":"No"}

Total: ₹${(i.price/1e5).toFixed(1)}L`;navigator.share?navigator.share({text:r}):(navigator.clipboard.writeText(r),alert("Configuration copied to clipboard! 📋"))}),s()}const Xt=[{id:1,category:"exterior",title:"Front View",description:"Aggressive front fascia with LED headlights",src:"/images/gallery/ev_car_front_1768921597944.png"},{id:2,category:"exterior",title:"Side Profile - Black",description:"Midnight black with aerodynamic design",src:"/images/gallery/ev_car_side_black_1768921527957.png"},{id:3,category:"exterior",title:"Side Profile - Gold",description:"Pagani gold metallic finish",src:"/images/gallery/ev_car_side_gold_1768921550995.png"},{id:4,category:"exterior",title:"Side Profile - White",description:"Arctic white with carbon fiber accents",src:"/images/gallery/ev_car_side_white_1768921572922.png"},{id:5,category:"exterior",title:"Rear View",description:"Integrated LED light bar and diffuser",src:"/images/gallery/ev_car_rear_1768921622132.png"},{id:6,category:"interior",title:"Dashboard",description:"Minimalist digital cockpit with OLED displays",src:"/images/gallery/ev_car_interior_dashboard_1768921641324.png"},{id:7,category:"technology",title:"Front Design",description:"Advanced aerodynamics and LED technology",src:"/images/gallery/ev_car_front_1768921597944.png"},{id:8,category:"technology",title:"Rear Technology",description:"Active aero and thermal management",src:"/images/gallery/ev_car_rear_1768921622132.png"},{id:9,category:"interior",title:"Cockpit View",description:"Driver-focused interior design",src:"/images/gallery/ev_car_interior_dashboard_1768921641324.png"}];async function Vr(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
        <!-- Hero Section -->
        <section class="relative min-h-[60vh] flex items-center justify-center px-8 py-32 bg-gradient-to-b from-pagani-black via-gray-900 to-pagani-black">
            <div class="max-w-4xl mx-auto text-center relative z-10 fade-in-section">
                <div class="flex items-center justify-center gap-4 mb-8">
                    <span class="w-16 h-[2px] bg-pagani-gold"></span>
                    <span class="text-pagani-gold tracking-[0.3em] uppercase text-sm">Gallery</span>
                    <span class="w-16 h-[2px] bg-pagani-gold"></span>
                </div>
                <h1 class="text-5xl md:text-7xl font-orbitron font-bold mb-8">
                    VISUAL <span class="text-pagani-gold">EXCELLENCE</span>
                </h1>
                <p class="text-xl text-gray-300 leading-relaxed">
                    Explore every detail of the EVBharat X-1 through our curated image collection
                </p>
            </div>
        </section>

        <!-- Filter Section -->
        <section class="relative z-20 bg-pagani-black py-12 px-8 border-y border-pagani-gold/20">
            <div class="max-w-7xl mx-auto">
                <div class="flex flex-wrap justify-center gap-4">
                    <button class="filter-btn active px-6 py-3 border border-pagani-gold bg-pagani-gold text-black font-semibold tracking-wider uppercase transition-all text-sm" data-filter="all">
                        All
                    </button>
                    <button class="filter-btn px-6 py-3 border border-white/20 hover:border-pagani-gold font-semibold tracking-wider uppercase transition-all text-sm" data-filter="exterior">
                        Exterior
                    </button>
                    <button class="filter-btn px-6 py-3 border border-white/20 hover:border-pagani-gold font-semibold tracking-wider uppercase transition-all text-sm" data-filter="interior">
                        Interior
                    </button>
                    <button class="filter-btn px-6 py-3 border border-white/20 hover:border-pagani-gold font-semibold tracking-wider uppercase transition-all text-sm" data-filter="technology">
                        Technology
                    </button>
                </div>
            </div>
        </section>

        <!-- Gallery Grid -->
        <section class="relative z-20 bg-gradient-to-b from-gray-900 to-pagani-black py-24 px-8">
            <div class="max-w-7xl mx-auto">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="gallery-grid">
                    ${Xt.map((n,r)=>`
                        <div class="gallery-item fade-in-section group cursor-pointer" data-category="${n.category}" data-id="${n.id}" style="animation-delay: ${r*50}ms">
                            <div class="relative aspect-video bg-gradient-to-br from-pagani-gold/10 to-transparent border border-pagani-gold/30 overflow-hidden">
                                <img 
                                    src="${n.src}" 
                                    alt="${n.title}" 
                                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    loading="lazy"
                                />
                                <div class="absolute inset-0 bg-gradient-to-t from-pagani-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div class="absolute bottom-0 left-0 right-0 p-6">
                                        <h3 class="text-xl font-orbitron font-bold mb-2">${n.title}</h3>
                                        <p class="text-sm text-gray-300">${n.description}</p>
                                    </div>
                                </div>
                                <!-- Category badge -->
                                <div class="absolute top-4 right-4 px-3 py-1 bg-pagani-gold/90 text-black text-xs font-semibold uppercase tracking-wider">
                                    ${n.category}
                                </div>
                            </div>
                        </div>
                    `).join("")}
                </div>

                <!-- No results message -->
                <div id="no-results" class="hidden text-center py-16">
                    <div class="text-6xl mb-4">🔍</div>
                    <h3 class="text-2xl font-orbitron font-bold mb-2">No images found</h3>
                    <p class="text-gray-400">Try selecting a different category</p>
                </div>
            </div>
        </section>

        <!-- Download Section -->
        <section class="relative z-20 bg-pagani-black py-24 px-8 border-t border-pagani-gold/20">
            <div class="max-w-4xl mx-auto text-center fade-in-section">
                <h2 class="text-4xl md:text-5xl font-orbitron font-bold mb-6">PRESS & <span class="text-pagani-gold">MEDIA</span></h2>
                <p class="text-gray-400 text-lg mb-8">Download high-resolution images and press materials</p>
                <button class="px-12 py-4 bg-pagani-gold text-black font-semibold tracking-widest uppercase hover:bg-pagani-gold/90 transition-all">
                    Download Press Kit
                </button>
            </div>
        </section>
    `;const e=document.querySelectorAll(".filter-btn"),a=document.querySelectorAll(".gallery-item"),i=document.getElementById("no-results");e.forEach(n=>{n.addEventListener("click",()=>{e.forEach(l=>{l.classList.remove("active","bg-pagani-gold","text-black"),l.classList.add("border-white/20")}),n.classList.add("active","bg-pagani-gold","text-black"),n.classList.remove("border-white/20");const r=n.getAttribute("data-filter");let o=0;a.forEach(l=>{const d=l.getAttribute("data-category");r==="all"||d===r?(l.classList.remove("hidden"),o++):l.classList.add("hidden")}),o===0?i?.classList.remove("hidden"):i?.classList.add("hidden")})}),a.forEach(n=>{n.addEventListener("click",()=>{const r=n.getAttribute("data-id"),o=Xt.find(l=>l.id===parseInt(r||"0"));if(o){const l=`
                    <div class="text-center">
                        <div class="aspect-video bg-gradient-to-br from-pagani-gold/10 to-transparent border border-pagani-gold/30 flex items-center justify-center mb-6 overflow-hidden">
                            <img src="${o.src}" alt="${o.title}" class="w-full h-full object-contain" />
                        </div>
                        <h3 class="text-3xl font-orbitron font-bold mb-4">${o.title}</h3>
                        <p class="text-gray-400 text-lg mb-6">${o.description}</p>
                        <div class="flex gap-4 justify-center">
                            <a href="${o.src}" download class="px-8 py-3 bg-pagani-gold text-black font-semibold tracking-wider uppercase hover:bg-pagani-gold/90 transition-all">
                                Download HD
                            </a>
                            <button class="px-8 py-3 border border-pagani-gold text-pagani-gold font-semibold tracking-wider uppercase hover:bg-pagani-gold hover:text-black transition-all" onclick="navigator.share ? navigator.share({url: '${o.src}'}) : navigator.clipboard.writeText('${o.src}')">
                                Share
                            </button>
                        </div>
                    </div>
                `;bt.open(l)}})}),new be(.1).observeAll(".fade-in-section")}function Pr(t){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)}function Br(t){return t.length>=6}async function Dr(){const t=document.getElementById("app");t&&(t.innerHTML=`
        <!-- Auth Container -->
        <div class="min-h-screen bg-gradient-to-b from-pagani-black via-gray-900 to-pagani-black flex items-center justify-center px-4 py-12 relative overflow-hidden">
            <!-- Animated Background Elements -->
            <div class="absolute inset-0 opacity-5">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(212,175,55,0.1),transparent_50%)]"></div>
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(212,175,55,0.1),transparent_50%)]"></div>
            </div>

            <!-- Main Auth Container -->
            <div class="relative z-10 w-full max-w-md">
                <!-- Auth Card -->
                <div class="bg-gradient-to-br from-gray-900 via-pagani-black to-gray-900 border border-pagani-gold/20 rounded-lg overflow-hidden shadow-2xl">
                    <!-- Tab Navigation -->
                    <div class="grid grid-cols-2 bg-pagani-black border-b border-pagani-gold/20">
                        <button class="auth-tab py-4 px-6 font-orbitron font-bold text-center text-pagani-gold border-b-2 border-pagani-gold transition-all relative" data-tab="login">
                            LOGIN
                        </button>
                        <button class="auth-tab py-4 px-6 font-orbitron font-bold text-center text-gray-400 hover:text-pagani-gold transition-all" data-tab="signup">
                            SIGN UP
                        </button>
                    </div>

                    <!-- Tab Content -->
                    <div class="p-8">
                        <!-- Login Tab -->
                        <form class="auth-form hidden" id="login-form" data-form="login">
                            <div class="space-y-5 fade-in-section">
                                <!-- Email Input -->
                                <div class="form-group">
                                    <label class="block text-sm font-orbitron font-bold text-pagani-gold mb-2 uppercase tracking-wider">Email</label>
                                    <input 
                                        type="email" 
                                        class="w-full px-4 py-3 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pagani-gold focus:ring-2 focus:ring-pagani-gold/20 transition-all" 
                                        placeholder="your@email.com"
                                        required
                                    />
                                    <span class="error-message text-red-500 text-xs mt-1 block hidden"></span>
                                </div>

                                <!-- Password Input -->
                                <div class="form-group">
                                    <label class="block text-sm font-orbitron font-bold text-pagani-gold mb-2 uppercase tracking-wider">Password</label>
                                    <div class="relative">
                                        <input 
                                            type="password" 
                                            class="w-full px-4 py-3 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pagani-gold focus:ring-2 focus:ring-pagani-gold/20 transition-all" 
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button 
                                            type="button" 
                                            class="toggle-password absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pagani-gold transition-colors"
                                        >
                                            👁️
                                        </button>
                                    </div>
                                    <span class="error-message text-red-500 text-xs mt-1 block hidden"></span>
                                </div>

                                <!-- Remember Me & Forgot Password -->
                                <div class="flex items-center justify-between pt-2">
                                    <label class="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" class="w-4 h-4 accent-pagani-gold rounded" />
                                        <span class="text-xs text-gray-400">Remember me</span>
                                    </label>
                                    <a href="#" class="text-xs text-pagani-gold hover:text-bright-gold transition-colors">Forgot password?</a>
                                </div>

                                <!-- Submit Button -->
                                <button 
                                    type="submit" 
                                    class="w-full py-3 mt-6 bg-gradient-to-r from-pagani-gold to-bright-gold text-black font-orbitron font-bold rounded-lg hover:shadow-lg hover:shadow-pagani-gold/50 transition-all uppercase tracking-wider"
                                >
                                    Enter Portal
                                </button>
                            </div>
                        </form>

                        <!-- Signup Tab -->
                        <form class="auth-form" id="signup-form" data-form="signup">
                            <div class="space-y-5 fade-in-section">
                                <!-- Full Name Input -->
                                <div class="form-group">
                                    <label class="block text-sm font-orbitron font-bold text-pagani-gold mb-2 uppercase tracking-wider">Full Name</label>
                                    <input 
                                        type="text" 
                                        class="w-full px-4 py-3 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pagani-gold focus:ring-2 focus:ring-pagani-gold/20 transition-all" 
                                        placeholder="Your full name"
                                        required
                                    />
                                    <span class="error-message text-red-500 text-xs mt-1 block hidden"></span>
                                </div>

                                <!-- Email Input -->
                                <div class="form-group">
                                    <label class="block text-sm font-orbitron font-bold text-pagani-gold mb-2 uppercase tracking-wider">Email</label>
                                    <input 
                                        type="email" 
                                        class="w-full px-4 py-3 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pagani-gold focus:ring-2 focus:ring-pagani-gold/20 transition-all" 
                                        placeholder="your@email.com"
                                        required
                                    />
                                    <span class="error-message text-red-500 text-xs mt-1 block hidden"></span>
                                </div>

                                <!-- Password Input -->
                                <div class="form-group">
                                    <label class="block text-sm font-orbitron font-bold text-pagani-gold mb-2 uppercase tracking-wider">Password</label>
                                    <div class="relative">
                                        <input 
                                            type="password" 
                                            class="w-full px-4 py-3 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pagani-gold focus:ring-2 focus:ring-pagani-gold/20 transition-all" 
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button 
                                            type="button" 
                                            class="toggle-password absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pagani-gold transition-colors"
                                        >
                                            👁️
                                        </button>
                                    </div>
                                    <!-- Password Strength Indicator -->
                                    <div class="mt-2 flex items-center gap-1">
                                        <div class="password-strength-bar w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                                            <div class="strength-fill h-full w-0 transition-all duration-300"></div>
                                        </div>
                                        <span class="strength-text text-xs text-gray-400 w-12 text-right">Weak</span>
                                    </div>
                                    <span class="error-message text-red-500 text-xs mt-1 block hidden"></span>
                                </div>

                                <!-- Confirm Password Input -->
                                <div class="form-group">
                                    <label class="block text-sm font-orbitron font-bold text-pagani-gold mb-2 uppercase tracking-wider">Confirm Password</label>
                                    <input 
                                        type="password" 
                                        class="w-full px-4 py-3 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pagani-gold focus:ring-2 focus:ring-pagani-gold/20 transition-all" 
                                        placeholder="••••••••"
                                        required
                                    />
                                    <span class="error-message text-red-500 text-xs mt-1 block hidden"></span>
                                </div>

                                <!-- Terms & Conditions -->
                                <label class="flex items-start gap-2 cursor-pointer">
                                    <input type="checkbox" class="w-4 h-4 accent-pagani-gold rounded mt-1" required />
                                    <span class="text-xs text-gray-400">
                                        I agree to the <a href="#" class="text-pagani-gold hover:text-bright-gold transition-colors">Terms of Service</a> and <a href="#" class="text-pagani-gold hover:text-bright-gold transition-colors">Privacy Policy</a>
                                    </span>
                                </label>

                                <!-- Submit Button -->
                                <button 
                                    type="submit" 
                                    class="w-full py-3 mt-6 bg-gradient-to-r from-pagani-gold to-bright-gold text-black font-orbitron font-bold rounded-lg hover:shadow-lg hover:shadow-pagani-gold/50 transition-all uppercase tracking-wider"
                                >
                                    Access EVBharat
                                </button>
                            </div>
                        </form>

                        <!-- Success Message -->
                        <div class="success-message hidden p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm text-center">
                            Success! Redirecting...
                        </div>
                    </div>

                    <!-- Footer Link -->
                    <div class="px-8 py-4 bg-pagani-black border-t border-pagani-gold/20 text-center text-xs text-gray-500">
                        Back to <a href="/" class="text-pagani-gold hover:text-bright-gold transition-colors">Home Portal</a>
                    </div>
                </div>

                <!-- Security Badge -->
                <div class="mt-8 text-center text-xs text-gray-500 fade-in-section" style="animation-delay: 300ms">
                    <div class="flex items-center justify-center gap-2">
                        🔒 Secured with AI-Protected Encryption
                    </div>
                </div>

                <!-- Demo Credentials -->
                <div class="mt-6 p-4 bg-pagani-gold/10 border border-pagani-gold/30 rounded-lg fade-in-section" style="animation-delay: 400ms">
                    <p class="text-xs text-gray-400 uppercase tracking-wider mb-3">DEMO CREDENTIALS</p>
                    <div class="space-y-2 text-xs">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">Email:</span>
                            <code class="bg-pagani-black px-2 py-1 rounded text-pagani-gold font-mono">user@evbharat.com</code>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">Password:</span>
                            <code class="bg-pagani-black px-2 py-1 rounded text-pagani-gold font-mono">Evbharat@123</code>
                        </div>
                    </div>
                    <p class="text-gray-500 mt-3 text-xs italic">Click 'Use Demo' button to auto-fill credentials</p>
                    <button id="use-demo-btn" class="w-full mt-3 px-4 py-2 bg-pagani-gold/20 border border-pagani-gold/50 rounded text-pagani-gold text-xs font-orbitron uppercase hover:bg-pagani-gold/30 transition-all">
                        Use Demo Credentials
                    </button>
                </div>
            </div>
        </div>
    `,setTimeout(()=>{Rr()},100))}function Rr(){document.querySelectorAll(".auth-tab").forEach(n=>{n.addEventListener("click",()=>{const r=n.dataset.tab;r&&Re(r)})});const e=document.getElementById("use-demo-btn");e&&e.addEventListener("click",n=>{n.preventDefault(),Re("login");const r=K.getDefaultCredentials(),o=document.querySelector('input[type="email"]'),l=document.querySelector('input[type="password"]');o&&l&&(o.value=r.email,l.value=r.password)}),document.querySelectorAll(".toggle-password").forEach(n=>{n.addEventListener("click",r=>{r.preventDefault();const o=n.parentElement;if(o){const l=o.querySelector("input");if(l){const d=l.type==="password";l.type=d?"text":"password",n.textContent=d?"🙈":"👁️"}}})}),document.querySelectorAll('input[type="password"]').forEach(n=>{const r=n.parentElement?.parentElement;r&&r.querySelector(".password-strength-bar")&&n.addEventListener("input",()=>{Fr(n)})}),document.querySelectorAll(".auth-form").forEach(n=>{n.addEventListener("submit",r=>{r.preventDefault(),Or(n)})}),Re("login")}function Re(t){document.querySelectorAll(".auth-tab").forEach(i=>{i.dataset.tab===t?(i.classList.add("text-pagani-gold"),i.classList.remove("text-gray-400","hover:text-pagani-gold"),i.style.borderBottomColor="var(--color-pagani-gold)"):(i.classList.remove("text-pagani-gold"),i.classList.add("text-gray-400","hover:text-pagani-gold"),i.style.borderBottomColor="transparent")}),document.querySelectorAll(".auth-form").forEach(i=>{i.dataset.form===t?i.classList.remove("hidden"):i.classList.add("hidden")})}function Fr(t){const e=t.value;let a=0;e.length>=8&&a++,e.match(/[a-z]/)&&e.match(/[A-Z]/)&&a++,e.match(/\d/)&&a++,e.match(/[@$!%*?&]/)&&a++;const i=t.parentElement?.parentElement;if(!i)return;const s=i.querySelector(".strength-fill"),n=i.querySelector(".strength-text"),r=a/4*100;s&&(s.style.width=r+"%",s.className="strength-fill h-full transition-all duration-300 "+(a===1?"bg-red-500":a===2?"bg-orange-500":a===3?"bg-yellow-500":"bg-green-500")),n&&(n.textContent=a===1?"Weak":a===2?"Fair":a===3?"Good":"Strong")}function Or(t){const a=t.dataset.form,i=t.querySelectorAll("input");let s=!0;if(t.querySelectorAll(".error-message").forEach(n=>{n.classList.add("hidden")}),i.forEach(n=>{const o=n.parentElement?.querySelector(".error-message");let l="";n.value.trim()?n.type==="email"&&!Pr(n.value)?(l="Please enter a valid email",s=!1):n.type==="password"&&a==="login"&&!Br(n.value)&&(l="Invalid password format",s=!1):(l="This field is required",s=!1),n.type==="checkbox"&&!n.checked&&n.hasAttribute("required")&&(l="You must accept this",s=!1),l&&o&&(o.textContent=l,o.classList.remove("hidden"))}),a==="signup"){const n=Array.from(i).filter(r=>r.type==="password");if(n.length>=2){const r=n[0].value,o=n[1].value;if(r!==o){const l=n[1].parentElement?.parentElement?.querySelector(".error-message");l&&(l.textContent="Passwords do not match",l.classList.remove("hidden")),s=!1}}}if(s){const n=t.querySelector('input[type="email"]'),r=t.querySelector('input[type="password"]'),o=t.querySelector('input[type="text"]');let l;if(a==="login"?l=K.login(n.value,r.value):l=K.signup(o.value,n.value,r.value),l.success){const d=t.parentElement?.querySelector(".success-message");d&&(d.classList.remove("hidden"),setTimeout(()=>{window.location.href="/dashboard"},1500))}else{const d=document.createElement("div");d.className="fixed top-8 right-8 bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-4 rounded-lg backdrop-blur-sm z-50 font-orbitron text-sm fade-in-section",d.textContent=l.message,document.body.appendChild(d),setTimeout(()=>d.remove(),3e3)}}}async function $r(){if(!K.isAuthenticated()){window.location.href="/auth";return}const t=K.getCurrentUser(),e=document.getElementById("app");e&&(e.innerHTML=`
        <!-- Dashboard Container -->
        <div class="min-h-screen bg-pagani-black pt-24 pb-12">
            <!-- Header Section -->
            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-12">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div class="fade-in-section">
                        <p class="text-pagani-gold text-sm uppercase tracking-wider mb-2">Welcome Back</p>
                        <h1 class="text-4xl md:text-5xl font-orbitron font-bold mb-2">${t?.name||"User"}'s FLEET</h1>
                        <p class="text-gray-400 text-lg">Manage and monitor your EVBharat vehicles</p>
                    </div>
                    <button id="add-vehicle-btn" class="fade-in-section px-8 py-3 bg-gradient-to-r from-pagani-gold to-bright-gold text-black font-orbitron font-bold rounded-lg hover:shadow-lg hover:shadow-pagani-gold/50 transition-all uppercase tracking-wider">
                        + Add Vehicle
                    </button>
                </div>
            </div>

            <!-- Stats Overview -->
            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-12">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <!-- Total Vehicles -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-lg p-6 fade-in-section" style="animation-delay: 0ms">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-400 text-sm uppercase tracking-wider mb-2">Total Vehicles</p>
                                <p class="text-3xl font-orbitron font-bold text-pagani-gold" id="total-vehicles">3</p>
                            </div>
                            <div class="text-4xl">🚗</div>
                        </div>
                    </div>

                    <!-- Total Distance -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-lg p-6 fade-in-section" style="animation-delay: 100ms">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-400 text-sm uppercase tracking-wider mb-2">Total Distance</p>
                                <p class="text-3xl font-orbitron font-bold text-pagani-gold" id="total-distance">2,450 km</p>
                            </div>
                            <div class="text-4xl">📍</div>
                        </div>
                    </div>

                    <!-- Battery Health -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-lg p-6 fade-in-section" style="animation-delay: 200ms">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-400 text-sm uppercase tracking-wider mb-2">Avg Battery Health</p>
                                <p class="text-3xl font-orbitron font-bold text-green-400" id="battery-health">94%</p>
                            </div>
                            <div class="text-4xl">⚡</div>
                        </div>
                    </div>

                    <!-- Active Warnings -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-lg p-6 fade-in-section" style="animation-delay: 300ms">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-400 text-sm uppercase tracking-wider mb-2">Maintenance Due</p>
                                <p class="text-3xl font-orbitron font-bold text-orange-400" id="maintenance-alerts">1</p>
                            </div>
                            <div class="text-4xl">⚠️</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Vehicles List -->
            <div class="max-w-7xl mx-auto px-4 md:px-8">
                <h2 class="text-2xl font-orbitron font-bold mb-6">YOUR VEHICLES</h2>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6" id="vehicles-grid">
                    <!-- Vehicle Cards will be populated here -->
                </div>
            </div>
        </div>

        <!-- Add Vehicle Modal -->
        <div id="add-vehicle-modal" class="hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-lg max-w-md w-full p-8 fade-in-section">
                <h3 class="text-2xl font-orbitron font-bold mb-6">Add New Vehicle</h3>
                
                <form id="add-vehicle-form" class="space-y-5">
                    <div>
                        <label class="block text-sm font-orbitron font-bold text-pagani-gold mb-2 uppercase">Vehicle Model</label>
                        <input type="text" class="w-full px-4 py-2 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pagani-gold focus:ring-2 focus:ring-pagani-gold/20 transition-all" placeholder="e.g., EVBharat X-1" required />
                    </div>

                    <div>
                        <label class="block text-sm font-orbitron font-bold text-pagani-gold mb-2 uppercase">Registration No.</label>
                        <input type="text" class="w-full px-4 py-2 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pagani-gold focus:ring-2 focus:ring-pagani-gold/20 transition-all" placeholder="e.g., DL-01-AB-1234" required />
                    </div>

                    <div>
                        <label class="block text-sm font-orbitron font-bold text-pagani-gold mb-2 uppercase">Year of Purchase</label>
                        <input type="number" class="w-full px-4 py-2 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pagani-gold focus:ring-2 focus:ring-pagani-gold/20 transition-all" placeholder="2024" min="2020" max="2026" required />
                    </div>

                    <div>
                        <label class="block text-sm font-orbitron font-bold text-pagani-gold mb-2 uppercase">Current Mileage (km)</label>
                        <input type="number" class="w-full px-4 py-2 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pagani-gold focus:ring-2 focus:ring-pagani-gold/20 transition-all" placeholder="0" min="0" required />
                    </div>

                    <div class="flex gap-4 pt-6">
                        <button type="button" id="cancel-btn" class="flex-1 px-4 py-2 border border-pagani-gold/30 text-white rounded-lg hover:bg-pagani-gold/10 transition-all">
                            Cancel
                        </button>
                        <button type="submit" class="flex-1 px-4 py-2 bg-gradient-to-r from-pagani-gold to-bright-gold text-black font-orbitron font-bold rounded-lg hover:shadow-lg hover:shadow-pagani-gold/50 transition-all">
                            Add Vehicle
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `,setTimeout(()=>{jr()},100))}function jr(){Nr([{id:1,model:"EVBharat X-1",registration:"DL-01-AB-1234",year:2024,mileage:850,battery:95,range:450,lastService:"2 weeks ago",status:"Active"},{id:2,model:"EVBharat X-1",registration:"MH-02-CD-5678",year:2024,mileage:1200,battery:92,range:420,lastService:"1 month ago",status:"Active"},{id:3,model:"EVBharat X-1 Premium",registration:"KA-03-EF-9012",year:2025,mileage:400,battery:96,range:480,lastService:"Just delivered",status:"Maintenance Due"}]),_r()}function Nr(t){const e=document.getElementById("vehicles-grid");e&&(e.innerHTML=t.map((a,i)=>`
        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-lg overflow-hidden hover:border-pagani-gold/50 transition-all fade-in-section" style="animation-delay: ${i*100}ms">
            <!-- Vehicle Header -->
            <div class="bg-gradient-to-r from-pagani-gold/20 to-bright-gold/10 px-6 py-4 border-b border-pagani-gold/20">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-xl font-orbitron font-bold">${a.model}</h3>
                    <span class="px-3 py-1 bg-pagani-gold/20 border border-pagani-gold/50 rounded-full text-xs font-orbitron text-pagani-gold uppercase">
                        ${a.status}
                    </span>
                </div>
                <p class="text-sm text-gray-400">${a.registration}</p>
            </div>

            <!-- Vehicle Details -->
            <div class="p-6 space-y-4">
                <!-- Quick Stats -->
                <div class="grid grid-cols-3 gap-4">
                    <div class="text-center">
                        <p class="text-2xl font-orbitron font-bold text-pagani-gold">${a.mileage}</p>
                        <p class="text-xs text-gray-400 uppercase mt-1">km</p>
                    </div>
                    <div class="text-center border-l border-r border-pagani-gold/20">
                        <p class="text-2xl font-orbitron font-bold text-green-400">${a.battery}%</p>
                        <p class="text-xs text-gray-400 uppercase mt-1">Battery</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-orbitron font-bold text-bright-gold">${a.range}</p>
                        <p class="text-xs text-gray-400 uppercase mt-1">km Range</p>
                    </div>
                </div>

                <!-- Status Bar -->
                <div class="pt-4 border-t border-pagani-gold/20">
                    <p class="text-xs text-gray-400 mb-2 uppercase tracking-wider">Battery Health</p>
                    <div class="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-green-500 to-green-400" style="width: ${a.battery}%"></div>
                    </div>
                </div>

                <!-- Service Info -->
                <div class="bg-pagani-black/50 p-3 rounded-lg">
                    <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">Last Service</p>
                    <p class="text-sm font-orbitron">${a.lastService}</p>
                </div>

                <!-- Action Buttons -->
                <div class="grid grid-cols-2 gap-3 pt-2">
                    <button class="px-4 py-2 border border-pagani-gold/30 text-sm font-orbitron rounded-lg hover:bg-pagani-gold/10 hover:border-pagani-gold transition-all">
                        View Details
                    </button>
                    <button class="px-4 py-2 bg-pagani-gold/20 border border-pagani-gold/50 text-sm font-orbitron rounded-lg hover:bg-pagani-gold/30 transition-all">
                        Book Service
                    </button>
                </div>
            </div>
        </div>
    `).join(""))}function _r(){const t=document.getElementById("add-vehicle-btn"),e=document.getElementById("add-vehicle-modal"),a=document.getElementById("cancel-btn"),i=document.getElementById("add-vehicle-form");t&&t.addEventListener("click",()=>{e?.classList.remove("hidden")}),a&&a.addEventListener("click",()=>{e?.classList.add("hidden")}),e?.addEventListener("click",s=>{s.target===e&&e.classList.add("hidden")}),i&&i.addEventListener("submit",s=>{s.preventDefault();const n=new FormData(i);console.log("Add vehicle:",Object.fromEntries(n)),e?.classList.add("hidden"),i.reset(),Hr("Vehicle added successfully!")})}function Hr(t){const e=document.createElement("div");e.className="fixed top-8 right-8 bg-green-500/20 border border-green-500/50 text-green-400 px-6 py-4 rounded-lg backdrop-blur-sm z-50 font-orbitron text-sm fade-in-section",e.textContent=t,document.body.appendChild(e),setTimeout(()=>{e.remove()},3e3)}async function qr(){const t=document.getElementById("app");t&&(t.innerHTML=`
        <section class="relative min-h-screen flex items-center justify-center px-8 py-32 bg-gradient-to-b from-pagani-black via-gray-900 to-pagani-black">
            <div class="absolute inset-0 overflow-hidden">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.05),transparent_70%)]"></div>
            </div>
            
            <div class="max-w-4xl mx-auto text-center relative z-10">
                <div class="mb-12 animate-pulse">
                    <div class="text-[200px] md:text-[300px] font-orbitron font-bold leading-none text-pagani-gold/20">
                        404
                    </div>
                </div>
                
                <h1 class="text-4xl md:text-6xl font-orbitron font-bold mb-6">
                    PAGE NOT <span class="text-pagani-gold">FOUND</span>
                </h1>
                
                <p class="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                    Looks like you've ventured off the planned route. Let's get you back on track.
                </p>
                
                <div class="flex flex-col sm:flex-row gap-6 justify-center">
                    <a href="/" class="px-12 py-4 bg-pagani-gold text-black font-semibold tracking-widest uppercase hover:bg-pagani-gold/90 transition-all inline-block">
                        Return Home
                    </a>
                    <a href="/contact" class="px-12 py-4 border border-pagani-gold text-pagani-gold font-semibold tracking-widest uppercase hover:bg-pagani-gold hover:text-black transition-all inline-block">
                        Contact Support
                    </a>
                </div>

                <!-- Quick Links -->
                <div class="mt-16 pt-16 border-t border-white/10">
                    <h3 class="text-sm uppercase tracking-wider text-gray-400 mb-6">Quick Links</h3>
                    <div class="flex flex-wrap justify-center gap-6 text-sm">
                        <a href="/" class="hover:text-pagani-gold transition-colors">Home</a>
                        <a href="/about" class="hover:text-pagani-gold transition-colors">About</a>
                        <a href="/technology" class="hover:text-pagani-gold transition-colors">Technology</a>
                        <a href="/configurator" class="hover:text-pagani-gold transition-colors">Configurator</a>
                        <a href="/gallery" class="hover:text-pagani-gold transition-colors">Gallery</a>
                        <a href="/contact" class="hover:text-pagani-gold transition-colors">Contact</a>
                    </div>
                </div>
            </div>
        </section>
    `)}const Kr=new ri;document.addEventListener("DOMContentLoaded",async()=>{new si,new ni,R.register("/","EVBharat | AI-Powered EV Intelligence",wr),R.register("/about","About Us | EVBharat",kr),R.register("/technology","Technology | EVBharat",Sr),R.register("/contact","Contact Us | EVBharat",Cr),R.register("/configurator","Configurator | EVBharat",Lr),R.register("/gallery","Gallery | EVBharat",Vr),R.register("/auth","Login | EVBharat",Dr),R.register("/dashboard","Dashboard | EVBharat",$r),R.register("/404","404 Not Found | EVBharat",qr),R.init(),setTimeout(()=>{Kr.hide()},1500)});
