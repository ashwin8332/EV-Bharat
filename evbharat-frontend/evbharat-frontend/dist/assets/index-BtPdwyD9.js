(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const r of n.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function a(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(i){if(i.ep)return;i.ep=!0;const n=a(i);fetch(i.href,n)}})();class Is{routes=new Map;currentPath="";constructor(){window.addEventListener("popstate",()=>this.handleRoute()),document.addEventListener("click",e=>this.handleLinkClick(e))}register(e,a,s){this.routes.set(e,{path:e,title:a,render:s})}navigate(e,a=!0){if(this.currentPath===e)return;const s=this.routes.get(e);if(!s){this.navigate("/404",a);return}this.currentPath=e,a&&window.history.pushState({path:e},s.title,e),document.title=s.title,this.showPageTransition(async()=>{await s.render(),window.scrollTo({top:0,behavior:"instant"})})}handleRoute(){const e=window.location.pathname;this.navigate(e,!1)}handleLinkClick(e){const a=e.target.closest("a");if(!a)return;const s=a.getAttribute("href");!s||s.startsWith("http")||s.startsWith("#")||this.routes.has(s)&&(e.preventDefault(),this.navigate(s))}showPageTransition(e){const a=document.getElementById("app");if(!a)return e();a.style.opacity="0",a.style.transition="opacity 0.3s ease-out",setTimeout(async()=>{await e(),a.style.opacity="1"},300)}init(){this.handleRoute()}}const O=new Is;class Ls{storageKey="evbharat_auth";userKey="evbharat_user";apiBase="";getAuthState(){const e=localStorage.getItem(this.storageKey),a=localStorage.getItem(this.userKey);if(e&&a)try{return{isAuthenticated:!0,user:JSON.parse(a),token:e}}catch{return{isAuthenticated:!1,user:null,token:null}}return{isAuthenticated:!1,user:null,token:null}}isAuthenticated(){return this.getAuthState().isAuthenticated}getCurrentUser(){return this.getAuthState().user}async login(e,a){return this.requestAuth("/api/auth/login",{email:e,password:a})}async signup(e,a,s){return this.requestAuth("/api/auth/signup",{name:e,email:a,password:s})}logout(){localStorage.removeItem(this.storageKey),localStorage.removeItem(this.userKey)}getDefaultCredentials(){return null}persistAuth(e,a){localStorage.setItem(this.storageKey,e),localStorage.setItem(this.userKey,JSON.stringify(a))}async requestAuth(e,a){try{const s=await fetch(`${this.apiBase}${e}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)}),i=await s.json().catch(()=>({}));return s.ok?(i?.token&&i?.user&&this.persistAuth(i.token,i.user),{success:!0,message:i?.message??"Success",user:i?.user}):{success:!1,message:i?.message??"Request failed. Please try again."}}catch{return{success:!1,message:"Network error. Please try again."}}}}const H=new Ls;class Bs{navbar=null;mobileMenu=null;isMenuOpen=!1;constructor(){this.render(),this.attachEventListeners()}render(){const e=H.isAuthenticated(),a=H.getCurrentUser(),s=`
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
                        ${e?`
                        <div class="relative group">
                            <button class="nav-link text-sm tracking-wider uppercase hover:text-pagani-gold transition-colors flex items-center gap-1">
                                <i class="fa-solid fa-gauge-high text-xs"></i> Dashboard <i class="fa-solid fa-chevron-down text-xs"></i>
                            </button>
                            <div class="absolute top-full left-0 mt-2 w-56 bg-pagani-black/95 backdrop-blur-lg border border-pagani-gold/30 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-xl">
                                <a href="/dashboard" class="flex items-center gap-3 px-4 py-3 text-sm hover:bg-pagani-gold/20 hover:text-pagani-gold transition-all border-b border-pagani-gold/10">
                                    <i class="fa-solid fa-gauge-high w-5"></i> Dashboard
                                </a>
                                <a href="/battery" class="flex items-center gap-3 px-4 py-3 text-sm hover:bg-pagani-gold/20 hover:text-pagani-gold transition-all border-b border-pagani-gold/10">
                                    <i class="fa-solid fa-car-battery w-5"></i> Battery Health
                                </a>
                                <a href="/rag-chat" class="flex items-center gap-3 px-4 py-3 text-sm hover:bg-pagani-gold/20 hover:text-pagani-gold transition-all border-b border-pagani-gold/10">
                                    <i class="fa-solid fa-robot w-5"></i> AI Assistant
                                </a>
                                <a href="/map" class="flex items-center gap-3 px-4 py-3 text-sm hover:bg-pagani-gold/20 hover:text-pagani-gold transition-all border-b border-pagani-gold/10">
                                    <i class="fa-solid fa-route w-5"></i> Route Planner
                                </a>
                                <a href="/alerts" class="flex items-center gap-3 px-4 py-3 text-sm hover:bg-pagani-gold/20 hover:text-pagani-gold transition-all">
                                    <i class="fa-solid fa-bell w-5"></i> Alerts
                                </a>
                            </div>
                        </div>
                        `:""}
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

                        <a href="/gallery" class="mobile-nav-link text-2xl tracking-wider uppercase hover:text-pagani-gold transition-colors">Gallery</a>
                        <a href="/contact" class="mobile-nav-link text-2xl tracking-wider uppercase hover:text-pagani-gold transition-colors">Contact</a>
                        ${e?`
                        <div class="w-full border-t border-pagani-gold/30 pt-6">
                            <p class="text-xs text-pagani-gold uppercase tracking-wider text-center mb-4">EV Management</p>
                            <div class="flex flex-col gap-3">
                                <a href="/dashboard" class="mobile-nav-link flex items-center justify-center gap-3 text-lg tracking-wider uppercase hover:text-pagani-gold transition-colors">
                                    <i class="fa-solid fa-gauge-high"></i> Dashboard
                                </a>
                                <a href="/battery" class="mobile-nav-link flex items-center justify-center gap-3 text-lg tracking-wider uppercase hover:text-pagani-gold transition-colors">
                                    <i class="fa-solid fa-car-battery"></i> Battery
                                </a>
                                <a href="/rag-chat" class="mobile-nav-link flex items-center justify-center gap-3 text-lg tracking-wider uppercase hover:text-pagani-gold transition-colors">
                                    <i class="fa-solid fa-robot"></i> AI Assistant
                                </a>
                                <a href="/map" class="mobile-nav-link flex items-center justify-center gap-3 text-lg tracking-wider uppercase hover:text-pagani-gold transition-colors">
                                    <i class="fa-solid fa-route"></i> Route Planner
                                </a>
                                <a href="/alerts" class="mobile-nav-link flex items-center justify-center gap-3 text-lg tracking-wider uppercase hover:text-pagani-gold transition-colors">
                                    <i class="fa-solid fa-bell"></i> Alerts
                                </a>
                            </div>
                        </div>
                        `:""}
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
        `;document.body.insertAdjacentHTML("afterbegin",s),this.navbar=document.getElementById("navbar"),this.mobileMenu=document.getElementById("mobile-menu")}attachEventListeners(){const e=document.getElementById("logout-btn"),a=document.getElementById("logout-mobile-btn");e?.addEventListener("click",()=>this.handleLogout()),a?.addEventListener("click",()=>this.handleLogout()),document.getElementById("mobile-menu-btn")?.addEventListener("click",()=>this.toggleMobileMenu()),document.querySelectorAll(".mobile-nav-link").forEach(n=>{n.addEventListener("click",()=>this.closeMobileMenu())}),window.addEventListener("scroll",()=>this.handleScroll(),{passive:!0}),this.updateActiveLink(),window.addEventListener("popstate",()=>this.updateActiveLink())}handleLogout(){H.logout(),window.location.href="/"}toggleMobileMenu(){this.isMenuOpen=!this.isMenuOpen,this.isMenuOpen?(this.mobileMenu?.classList.remove("translate-x-full"),document.querySelector(".menu-icon")?.classList.add("hidden"),document.querySelector(".close-icon")?.classList.remove("hidden"),document.body.style.overflow="hidden"):this.closeMobileMenu()}closeMobileMenu(){this.isMenuOpen=!1,this.mobileMenu?.classList.add("translate-x-full"),document.querySelector(".menu-icon")?.classList.remove("hidden"),document.querySelector(".close-icon")?.classList.add("hidden"),document.body.style.overflow=""}handleScroll(){if(!this.navbar)return;window.scrollY>50?this.navbar.classList.add("bg-pagani-black/80","backdrop-blur-md","shadow-lg"):this.navbar.classList.remove("bg-pagani-black/80","backdrop-blur-md","shadow-lg")}updateActiveLink(){const e=window.location.pathname;document.querySelectorAll(".nav-link, .mobile-nav-link").forEach(s=>{s.getAttribute("href")===e?s.classList.add("text-pagani-gold"):s.classList.remove("text-pagani-gold")})}destroy(){this.navbar?.remove()}}class Vs{constructor(){this.render()}render(){document.body.insertAdjacentHTML("beforeend",`
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

                        <!-- Pages -->
                        <div>
                            <h4 class="text-sm font-orbitron tracking-widest uppercase mb-6 text-pagani-gold">Pages</h4>
                            <ul class="space-y-3">
                                <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">Dashboard</a></li>
                                <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">Battery Health</a></li>
                                <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">Route Planner</a></li>
                                <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">Alerts</a></li>
                            </ul>
                        </div>

                        <!-- Company -->
                        <div>
                            <h4 class="text-sm font-orbitron tracking-widest uppercase mb-6 text-pagani-gold">Company</h4>
                            <ul class="space-y-3">
                                <li><a href="/about" class="text-gray-400 hover:text-white transition-colors text-sm">About Us</a></li>
                                <li><a href="/gallery" class="text-gray-400 hover:text-white transition-colors text-sm">Gallery</a></li>
                                <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">Technology</a></li>
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
        `),this.attachEventListeners()}attachEventListeners(){document.getElementById("newsletter-form")?.addEventListener("submit",s=>{s.preventDefault(),alert("Thank you for subscribing! 🎉"),s.target.reset()});const a=document.getElementById("back-to-top");window.addEventListener("scroll",()=>{window.scrollY>500?a?.classList.remove("opacity-0","pointer-events-none"):a?.classList.add("opacity-0","pointer-events-none")},{passive:!0}),a?.addEventListener("click",()=>{window.scrollTo({top:0,behavior:"smooth"})})}}class Rs{loader=null;constructor(){this.render()}render(){document.body.insertAdjacentHTML("afterbegin",`
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
        `),this.loader=document.getElementById("page-loader")}hide(){this.loader&&(this.loader.style.opacity="0",setTimeout(()=>{this.loader?.remove()},500))}show(){this.loader?this.loader.style.opacity="1":this.render()}}class $s{canvas;ctx;images=[];totalFrames=240;isLoaded=!1;currentFrameIndex=-1;constructor(e,a=240){if(this.canvas=document.getElementById(e),!this.canvas)throw new Error(`Canvas with id ${e} not found`);this.ctx=this.canvas.getContext("2d",{alpha:!1}),this.totalFrames=a,this.ctx&&(this.ctx.imageSmoothingEnabled=!0,this.ctx.imageSmoothingQuality="high"),this.resize(),window.addEventListener("resize",()=>this.resize()),this.preloadImages()}resize(){if(!this.canvas||!this.ctx)return;const e=window.devicePixelRatio||1,a=this.canvas.parentElement?.getBoundingClientRect();a&&(this.canvas.width=a.width*e,this.canvas.height=a.height*e,this.ctx.scale(e,e),this.ctx.imageSmoothingEnabled=!0,this.ctx.imageSmoothingQuality="high",this.currentFrameIndex>=0&&this.renderFrame(this.currentFrameIndex))}preloadImages(){let e=0;for(let a=1;a<=this.totalFrames;a++){const s=new Image;s.src=`/images/zonda-sequence/${a}.jpg`,s.onload=()=>{e++,e===this.totalFrames&&(this.isLoaded=!0,this.renderFrame(0))},this.images.push(s)}}update(e){if(!this.isLoaded)return;const a=Math.min(this.totalFrames-1,Math.max(0,Math.floor(e*this.totalFrames)));a!==this.currentFrameIndex&&(this.renderFrame(a),this.currentFrameIndex=a)}renderFrame(e){if(!this.ctx||!this.canvas)return;const a=this.images[e];if(!a)return;const s=window.devicePixelRatio||1;this.ctx.clearRect(0,0,this.canvas.width/s,this.canvas.height/s);const i=this.canvas.width/s,n=this.canvas.height/s,r=Math.min(i/a.width,n/a.height),o=i/2-a.width/2*r,l=n/2-a.height/2*r;this.ctx.drawImage(a,o,l,a.width*r,a.height*r)}}function Ps(t,e){t.indexOf(e)===-1&&t.push(e)}function va(t,e){const a=t.indexOf(e);a>-1&&t.splice(a,1)}const ae=(t,e,a)=>a>e?e:a<t?t:a;let ht=()=>{};const X={},ya=t=>/^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(t);function Ds(t){return typeof t=="object"&&t!==null}const wa=t=>/^0[^.\s]+$/u.test(t);function bt(t){let e;return()=>(e===void 0&&(e=t()),e)}const pe=t=>t,js=(t,e)=>a=>e(t(a)),xt=(...t)=>t.reduce(js),vt=(t,e,a)=>{const s=e-t;return s===0?1:(a-t)/s};class ka{constructor(){this.subscriptions=[]}add(e){return Ps(this.subscriptions,e),()=>va(this.subscriptions,e)}notify(e,a,s){const i=this.subscriptions.length;if(i)if(i===1)this.subscriptions[0](e,a,s);else for(let n=0;n<i;n++){const r=this.subscriptions[n];r&&r(e,a,s)}}getSize(){return this.subscriptions.length}clear(){this.subscriptions.length=0}}const Y=t=>t*1e3,z=t=>t/1e3;function Ea(t,e){return e?t*(1e3/e):0}const Os=(t,e,a)=>{const s=e-t;return((a-t)%s+s)%s+t},Sa=(t,e,a)=>(((1-3*a+3*e)*t+(3*a-6*e))*t+3*e)*t,Fs=1e-7,Hs=12;function Ns(t,e,a,s,i){let n,r,o=0;do r=e+(a-e)/2,n=Sa(r,s,i)-t,n>0?a=r:e=r;while(Math.abs(n)>Fs&&++o<Hs);return r}function Le(t,e,a,s){if(t===e&&a===s)return pe;const i=n=>Ns(n,0,1,t,a);return n=>n===0||n===1?n:Sa(i(n),e,s)}const Ta=t=>e=>e<=.5?t(2*e)/2:(2-t(2*(1-e)))/2,Aa=t=>e=>1-t(1-e),Ca=Le(.33,1.53,.69,.99),yt=Aa(Ca),Ma=Ta(yt),Ia=t=>(t*=2)<1?.5*yt(t):.5*(2-Math.pow(2,-10*(t-1))),wt=t=>1-Math.sin(Math.acos(t)),zs=Aa(wt),La=Ta(wt),_s=Le(.42,0,1,1),qs=Le(0,0,.58,1),Ba=Le(.42,0,.58,1),Va=t=>Array.isArray(t)&&typeof t[0]!="number";function Ra(t,e){return Va(t)?t[Os(0,t.length,e)]:t}const $a=t=>Array.isArray(t)&&typeof t[0]=="number",Us={linear:pe,easeIn:_s,easeInOut:Ba,easeOut:qs,circIn:wt,circInOut:La,circOut:zs,backIn:yt,backInOut:Ma,backOut:Ca,anticipate:Ia},Ws=t=>typeof t=="string",Nt=t=>{if($a(t)){ht(t.length===4);const[e,a,s,i]=t;return Le(e,a,s,i)}else if(Ws(t))return Us[t];return t},De=["setup","read","resolveKeyframes","preUpdate","update","preRender","render","postRender"];function Ks(t,e){let a=new Set,s=new Set,i=!1,n=!1;const r=new WeakSet;let o={delta:0,timestamp:0,isProcessing:!1};function l(d){r.has(d)&&(c.schedule(d),t()),d(o)}const c={schedule:(d,p=!1,u=!1)=>{const x=u&&i?a:s;return p&&r.add(d),x.has(d)||x.add(d),d},cancel:d=>{s.delete(d),r.delete(d)},process:d=>{if(o=d,i){n=!0;return}i=!0,[a,s]=[s,a],a.forEach(l),a.clear(),i=!1,n&&(n=!1,c.process(d))}};return c}const Gs=40;function Pa(t,e){let a=!1,s=!0;const i={delta:0,timestamp:0,isProcessing:!1},n=()=>a=!0,r=De.reduce((T,E)=>(T[E]=Ks(n),T),{}),{setup:o,read:l,resolveKeyframes:c,preUpdate:d,update:p,preRender:u,render:m,postRender:x}=r,y=()=>{const T=X.useManualTiming?i.timestamp:performance.now();a=!1,X.useManualTiming||(i.delta=s?1e3/60:Math.max(Math.min(T-i.timestamp,Gs),1)),i.timestamp=T,i.isProcessing=!0,o.process(i),l.process(i),c.process(i),d.process(i),p.process(i),u.process(i),m.process(i),x.process(i),i.isProcessing=!1,a&&e&&(s=!1,t(y))},v=()=>{a=!0,s=!0,i.isProcessing||t(y)};return{schedule:De.reduce((T,E)=>{const b=r[E];return T[E]=(A,B=!1,k=!1)=>(a||v(),b.schedule(A,B,k)),T},{}),cancel:T=>{for(let E=0;E<De.length;E++)r[De[E]].cancel(T)},state:i,steps:r}}const{schedule:J,cancel:Ze,state:He}=Pa(typeof requestAnimationFrame<"u"?requestAnimationFrame:pe,!0);let Fe;function Ys(){Fe=void 0}const F={now:()=>(Fe===void 0&&F.set(He.isProcessing||X.useManualTiming?He.timestamp:performance.now()),Fe),set:t=>{Fe=t,queueMicrotask(Ys)}},Da=t=>e=>typeof e=="string"&&e.startsWith(t),ja=Da("--"),Xs=Da("var(--"),kt=t=>Xs(t)?Js.test(t.split("/*")[0].trim()):!1,Js=/var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;function zt(t){return typeof t!="string"?!1:t.split("/*")[0].includes("var(--")}const ge={test:t=>typeof t=="number",parse:parseFloat,transform:t=>t},Te={...ge,transform:t=>ae(0,1,t)},je={...ge,default:1},Ee=t=>Math.round(t*1e5)/1e5,Et=/-?(?:\d+(?:\.\d+)?|\.\d+)/gu;function Zs(t){return t==null}const Qs=/^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu,St=(t,e)=>a=>!!(typeof a=="string"&&Qs.test(a)&&a.startsWith(t)||e&&!Zs(a)&&Object.prototype.hasOwnProperty.call(a,e)),Oa=(t,e,a)=>s=>{if(typeof s!="string")return s;const[i,n,r,o]=s.match(Et);return{[t]:parseFloat(i),[e]:parseFloat(n),[a]:parseFloat(r),alpha:o!==void 0?parseFloat(o):1}},ei=t=>ae(0,255,t),Ue={...ge,transform:t=>Math.round(ei(t))},ie={test:St("rgb","red"),parse:Oa("red","green","blue"),transform:({red:t,green:e,blue:a,alpha:s=1})=>"rgba("+Ue.transform(t)+", "+Ue.transform(e)+", "+Ue.transform(a)+", "+Ee(Te.transform(s))+")"};function ti(t){let e="",a="",s="",i="";return t.length>5?(e=t.substring(1,3),a=t.substring(3,5),s=t.substring(5,7),i=t.substring(7,9)):(e=t.substring(1,2),a=t.substring(2,3),s=t.substring(3,4),i=t.substring(4,5),e+=e,a+=a,s+=s,i+=i),{red:parseInt(e,16),green:parseInt(a,16),blue:parseInt(s,16),alpha:i?parseInt(i,16)/255:1}}const Qe={test:St("#"),parse:ti,transform:ie.transform},Be=t=>({test:e=>typeof e=="string"&&e.endsWith(t)&&e.split(" ").length===1,parse:parseFloat,transform:e=>`${e}${t}`}),ee=Be("deg"),de=Be("%"),h=Be("px"),ai=Be("vh"),si=Be("vw"),_t={...de,parse:t=>de.parse(t)/100,transform:t=>de.transform(t*100)},le={test:St("hsl","hue"),parse:Oa("hue","saturation","lightness"),transform:({hue:t,saturation:e,lightness:a,alpha:s=1})=>"hsla("+Math.round(t)+", "+de.transform(Ee(e))+", "+de.transform(Ee(a))+", "+Ee(Te.transform(s))+")"},R={test:t=>ie.test(t)||Qe.test(t)||le.test(t),parse:t=>ie.test(t)?ie.parse(t):le.test(t)?le.parse(t):Qe.parse(t),transform:t=>typeof t=="string"?t:t.hasOwnProperty("red")?ie.transform(t):le.transform(t),getAnimatableNone:t=>{const e=R.parse(t);return e.alpha=0,R.transform(e)}},ii=/(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;function ni(t){return isNaN(t)&&typeof t=="string"&&(t.match(Et)?.length||0)+(t.match(ii)?.length||0)>0}const Fa="number",Ha="color",ri="var",oi="var(",qt="${}",li=/var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;function Ae(t){const e=t.toString(),a=[],s={color:[],number:[],var:[]},i=[];let n=0;const o=e.replace(li,l=>(R.test(l)?(s.color.push(n),i.push(Ha),a.push(R.parse(l))):l.startsWith(oi)?(s.var.push(n),i.push(ri),a.push(l)):(s.number.push(n),i.push(Fa),a.push(parseFloat(l))),++n,qt)).split(qt);return{values:a,split:o,indexes:s,types:i}}function Na(t){return Ae(t).values}function za(t){const{split:e,types:a}=Ae(t),s=e.length;return i=>{let n="";for(let r=0;r<s;r++)if(n+=e[r],i[r]!==void 0){const o=a[r];o===Fa?n+=Ee(i[r]):o===Ha?n+=R.transform(i[r]):n+=i[r]}return n}}const di=t=>typeof t=="number"?0:R.test(t)?R.getAnimatableNone(t):t;function ci(t){const e=Na(t);return za(t)(e.map(di))}const se={test:ni,parse:Na,createTransformer:za,getAnimatableNone:ci};function We(t,e,a){return a<0&&(a+=1),a>1&&(a-=1),a<1/6?t+(e-t)*6*a:a<1/2?e:a<2/3?t+(e-t)*(2/3-a)*6:t}function pi({hue:t,saturation:e,lightness:a,alpha:s}){t/=360,e/=100,a/=100;let i=0,n=0,r=0;if(!e)i=n=r=a;else{const o=a<.5?a*(1+e):a+e-a*e,l=2*a-o;i=We(l,o,t+1/3),n=We(l,o,t),r=We(l,o,t-1/3)}return{red:Math.round(i*255),green:Math.round(n*255),blue:Math.round(r*255),alpha:s}}function Ne(t,e){return a=>a>0?e:t}const ue=(t,e,a)=>t+(e-t)*a,Ke=(t,e,a)=>{const s=t*t,i=a*(e*e-s)+s;return i<0?0:Math.sqrt(i)},gi=[Qe,ie,le],ui=t=>gi.find(e=>e.test(t));function Ut(t){const e=ui(t);if(!e)return!1;let a=e.parse(t);return e===le&&(a=pi(a)),a}const Wt=(t,e)=>{const a=Ut(t),s=Ut(e);if(!a||!s)return Ne(t,e);const i={...a};return n=>(i.red=Ke(a.red,s.red,n),i.green=Ke(a.green,s.green,n),i.blue=Ke(a.blue,s.blue,n),i.alpha=ue(a.alpha,s.alpha,n),ie.transform(i))},et=new Set(["none","hidden"]);function fi(t,e){return et.has(t)?a=>a<=0?t:e:a=>a>=1?e:t}function mi(t,e){return a=>ue(t,e,a)}function Tt(t){return typeof t=="number"?mi:typeof t=="string"?kt(t)?Ne:R.test(t)?Wt:xi:Array.isArray(t)?_a:typeof t=="object"?R.test(t)?Wt:hi:Ne}function _a(t,e){const a=[...t],s=a.length,i=t.map((n,r)=>Tt(n)(n,e[r]));return n=>{for(let r=0;r<s;r++)a[r]=i[r](n);return a}}function hi(t,e){const a={...t,...e},s={};for(const i in a)t[i]!==void 0&&e[i]!==void 0&&(s[i]=Tt(t[i])(t[i],e[i]));return i=>{for(const n in s)a[n]=s[n](i);return a}}function bi(t,e){const a=[],s={color:0,var:0,number:0};for(let i=0;i<e.values.length;i++){const n=e.types[i],r=t.indexes[n][s[n]],o=t.values[r]??0;a[i]=o,s[n]++}return a}const xi=(t,e)=>{const a=se.createTransformer(e),s=Ae(t),i=Ae(e);return s.indexes.var.length===i.indexes.var.length&&s.indexes.color.length===i.indexes.color.length&&s.indexes.number.length>=i.indexes.number.length?et.has(t)&&!i.values.length||et.has(e)&&!s.values.length?fi(t,e):xt(_a(bi(s,i),i.values),a):Ne(t,e)};function qa(t,e,a){return typeof t=="number"&&typeof e=="number"&&typeof a=="number"?ue(t,e,a):Tt(t)(t,e)}const vi=t=>{const e=({timestamp:a})=>t(a);return{start:(a=!0)=>J.update(e,a),stop:()=>Ze(e),now:()=>He.isProcessing?He.timestamp:F.now()}},Ua=(t,e,a=10)=>{let s="";const i=Math.max(Math.round(e/a),2);for(let n=0;n<i;n++)s+=Math.round(t(n/(i-1))*1e4)/1e4+", ";return`linear(${s.substring(0,s.length-2)})`},ze=2e4;function At(t){let e=0;const a=50;let s=t.next(e);for(;!s.done&&e<ze;)e+=a,s=t.next(e);return e>=ze?1/0:e}function Wa(t,e=100,a){const s=a({...t,keyframes:[0,e]}),i=Math.min(At(s),ze);return{type:"keyframes",ease:n=>s.next(i*n).value/e,duration:z(i)}}const yi=5;function Ka(t,e,a){const s=Math.max(e-yi,0);return Ea(a-t(s),e-s)}const V={stiffness:100,damping:10,mass:1,velocity:0,duration:800,bounce:.3,visualDuration:.3,restSpeed:{granular:.01,default:2},restDelta:{granular:.005,default:.5},minDuration:.01,maxDuration:10,minDamping:.05,maxDamping:1},Ge=.001;function wi({duration:t=V.duration,bounce:e=V.bounce,velocity:a=V.velocity,mass:s=V.mass}){let i,n,r=1-e;r=ae(V.minDamping,V.maxDamping,r),t=ae(V.minDuration,V.maxDuration,z(t)),r<1?(i=c=>{const d=c*r,p=d*t,u=d-a,m=tt(c,r),x=Math.exp(-p);return Ge-u/m*x},n=c=>{const p=c*r*t,u=p*a+a,m=Math.pow(r,2)*Math.pow(c,2)*t,x=Math.exp(-p),y=tt(Math.pow(c,2),r);return(-i(c)+Ge>0?-1:1)*((u-m)*x)/y}):(i=c=>{const d=Math.exp(-c*t),p=(c-a)*t+1;return-Ge+d*p},n=c=>{const d=Math.exp(-c*t),p=(a-c)*(t*t);return d*p});const o=5/t,l=Ei(i,n,o);if(t=Y(t),isNaN(l))return{stiffness:V.stiffness,damping:V.damping,duration:t};{const c=Math.pow(l,2)*s;return{stiffness:c,damping:r*2*Math.sqrt(s*c),duration:t}}}const ki=12;function Ei(t,e,a){let s=a;for(let i=1;i<ki;i++)s=s-t(s)/e(s);return s}function tt(t,e){return t*Math.sqrt(1-e*e)}const Si=["duration","bounce"],Ti=["stiffness","damping","mass"];function Kt(t,e){return e.some(a=>t[a]!==void 0)}function Ai(t){let e={velocity:V.velocity,stiffness:V.stiffness,damping:V.damping,mass:V.mass,isResolvedFromDuration:!1,...t};if(!Kt(t,Ti)&&Kt(t,Si))if(t.visualDuration){const a=t.visualDuration,s=2*Math.PI/(a*1.2),i=s*s,n=2*ae(.05,1,1-(t.bounce||0))*Math.sqrt(i);e={...e,mass:V.mass,stiffness:i,damping:n}}else{const a=wi(t);e={...e,...a,mass:V.mass},e.isResolvedFromDuration=!0}return e}function Ce(t=V.visualDuration,e=V.bounce){const a=typeof t!="object"?{visualDuration:t,keyframes:[0,1],bounce:e}:t;let{restSpeed:s,restDelta:i}=a;const n=a.keyframes[0],r=a.keyframes[a.keyframes.length-1],o={done:!1,value:n},{stiffness:l,damping:c,mass:d,duration:p,velocity:u,isResolvedFromDuration:m}=Ai({...a,velocity:-z(a.velocity||0)}),x=u||0,y=c/(2*Math.sqrt(l*d)),v=r-n,w=z(Math.sqrt(l/d)),C=Math.abs(v)<5;s||(s=C?V.restSpeed.granular:V.restSpeed.default),i||(i=C?V.restDelta.granular:V.restDelta.default);let T;if(y<1){const b=tt(w,y);T=A=>{const B=Math.exp(-y*w*A);return r-B*((x+y*w*v)/b*Math.sin(b*A)+v*Math.cos(b*A))}}else if(y===1)T=b=>r-Math.exp(-w*b)*(v+(x+w*v)*b);else{const b=w*Math.sqrt(y*y-1);T=A=>{const B=Math.exp(-y*w*A),k=Math.min(b*A,300);return r-B*((x+y*w*v)*Math.sinh(k)+b*v*Math.cosh(k))/b}}const E={calculatedDuration:m&&p||null,next:b=>{const A=T(b);if(m)o.done=b>=p;else{let B=b===0?x:0;y<1&&(B=b===0?Y(x):Ka(T,b,A));const k=Math.abs(B)<=s,M=Math.abs(r-A)<=i;o.done=k&&M}return o.value=o.done?r:A,o},toString:()=>{const b=Math.min(At(E),ze),A=Ua(B=>E.next(b*B).value,b,30);return b+"ms "+A},toTransition:()=>{}};return E}Ce.applyToOptions=t=>{const e=Wa(t,100,Ce);return t.ease=e.ease,t.duration=Y(e.duration),t.type="keyframes",t};function at({keyframes:t,velocity:e=0,power:a=.8,timeConstant:s=325,bounceDamping:i=10,bounceStiffness:n=500,modifyTarget:r,min:o,max:l,restDelta:c=.5,restSpeed:d}){const p=t[0],u={done:!1,value:p},m=k=>o!==void 0&&k<o||l!==void 0&&k>l,x=k=>o===void 0?l:l===void 0||Math.abs(o-k)<Math.abs(l-k)?o:l;let y=a*e;const v=p+y,w=r===void 0?v:r(v);w!==v&&(y=w-p);const C=k=>-y*Math.exp(-k/s),T=k=>w+C(k),E=k=>{const M=C(k),P=T(k);u.done=Math.abs(M)<=c,u.value=u.done?w:P};let b,A;const B=k=>{m(u.value)&&(b=k,A=Ce({keyframes:[u.value,x(u.value)],velocity:Ka(T,k,u.value),damping:i,stiffness:n,restDelta:c,restSpeed:d}))};return B(0),{calculatedDuration:null,next:k=>{let M=!1;return!A&&b===void 0&&(M=!0,E(k),B(k)),b!==void 0&&k>=b?A.next(k-b):(!M&&E(k),u)}}}function Ci(t,e,a){const s=[],i=a||X.mix||qa,n=t.length-1;for(let r=0;r<n;r++){let o=i(t[r],t[r+1]);if(e){const l=Array.isArray(e)?e[r]||pe:e;o=xt(l,o)}s.push(o)}return s}function Mi(t,e,{clamp:a=!0,ease:s,mixer:i}={}){const n=t.length;if(ht(n===e.length),n===1)return()=>e[0];if(n===2&&e[0]===e[1])return()=>e[1];const r=t[0]===t[1];t[0]>t[n-1]&&(t=[...t].reverse(),e=[...e].reverse());const o=Ci(e,s,i),l=o.length,c=d=>{if(r&&d<t[0])return e[0];let p=0;if(l>1)for(;p<t.length-2&&!(d<t[p+1]);p++);const u=vt(t[p],t[p+1],d);return o[p](u)};return a?d=>c(ae(t[0],t[n-1],d)):c}function Ga(t,e){const a=t[t.length-1];for(let s=1;s<=e;s++){const i=vt(0,e,s);t.push(ue(a,1,i))}}function Ya(t){const e=[0];return Ga(e,t.length-1),e}function Ii(t,e){return t.map(a=>a*e)}function Li(t,e){return t.map(()=>e||Ba).splice(0,t.length-1)}function Se({duration:t=300,keyframes:e,times:a,ease:s="easeInOut"}){const i=Va(s)?s.map(Nt):Nt(s),n={done:!1,value:e[0]},r=Ii(a&&a.length===e.length?a:Ya(e),t),o=Mi(r,e,{ease:Array.isArray(i)?i:Li(e,i)});return{calculatedDuration:t,next:l=>(n.value=o(l),n.done=l>=t,n)}}const Bi=t=>t!==null;function Ct(t,{repeat:e,repeatType:a="loop"},s,i=1){const n=t.filter(Bi),o=i<0||e&&a!=="loop"&&e%2===1?0:n.length-1;return!o||s===void 0?n[o]:s}const Vi={decay:at,inertia:at,tween:Se,keyframes:Se,spring:Ce};function Xa(t){typeof t.type=="string"&&(t.type=Vi[t.type])}class Mt{constructor(){this.updateFinished()}get finished(){return this._finished}updateFinished(){this._finished=new Promise(e=>{this.resolve=e})}notifyFinished(){this.resolve()}then(e,a){return this.finished.then(e,a)}}const Ri=t=>t/100;class It extends Mt{constructor(e){super(),this.state="idle",this.startTime=null,this.isStopped=!1,this.currentTime=0,this.holdTime=null,this.playbackSpeed=1,this.stop=()=>{const{motionValue:a}=this.options;a&&a.updatedAt!==F.now()&&this.tick(F.now()),this.isStopped=!0,this.state!=="idle"&&(this.teardown(),this.options.onStop?.())},this.options=e,this.initAnimation(),this.play(),e.autoplay===!1&&this.pause()}initAnimation(){const{options:e}=this;Xa(e);const{type:a=Se,repeat:s=0,repeatDelay:i=0,repeatType:n,velocity:r=0}=e;let{keyframes:o}=e;const l=a||Se;l!==Se&&typeof o[0]!="number"&&(this.mixKeyframes=xt(Ri,qa(o[0],o[1])),o=[0,100]);const c=l({...e,keyframes:o});n==="mirror"&&(this.mirroredGenerator=l({...e,keyframes:[...o].reverse(),velocity:-r})),c.calculatedDuration===null&&(c.calculatedDuration=At(c));const{calculatedDuration:d}=c;this.calculatedDuration=d,this.resolvedDuration=d+i,this.totalDuration=this.resolvedDuration*(s+1)-i,this.generator=c}updateTime(e){const a=Math.round(e-this.startTime)*this.playbackSpeed;this.holdTime!==null?this.currentTime=this.holdTime:this.currentTime=a}tick(e,a=!1){const{generator:s,totalDuration:i,mixKeyframes:n,mirroredGenerator:r,resolvedDuration:o,calculatedDuration:l}=this;if(this.startTime===null)return s.next(0);const{delay:c=0,keyframes:d,repeat:p,repeatType:u,repeatDelay:m,type:x,onUpdate:y,finalKeyframe:v}=this.options;this.speed>0?this.startTime=Math.min(this.startTime,e):this.speed<0&&(this.startTime=Math.min(e-i/this.speed,this.startTime)),a?this.currentTime=e:this.updateTime(e);const w=this.currentTime-c*(this.playbackSpeed>=0?1:-1),C=this.playbackSpeed>=0?w<0:w>i;this.currentTime=Math.max(w,0),this.state==="finished"&&this.holdTime===null&&(this.currentTime=i);let T=this.currentTime,E=s;if(p){const k=Math.min(this.currentTime,i)/o;let M=Math.floor(k),P=k%1;!P&&k>=1&&(P=1),P===1&&M--,M=Math.min(M,p+1),M%2&&(u==="reverse"?(P=1-P,m&&(P-=m/o)):u==="mirror"&&(E=r)),T=ae(0,1,P)*o}const b=C?{done:!1,value:d[0]}:E.next(T);n&&(b.value=n(b.value));let{done:A}=b;!C&&l!==null&&(A=this.playbackSpeed>=0?this.currentTime>=i:this.currentTime<=0);const B=this.holdTime===null&&(this.state==="finished"||this.state==="running"&&A);return B&&x!==at&&(b.value=Ct(d,this.options,v,this.speed)),y&&y(b.value),B&&this.finish(),b}then(e,a){return this.finished.then(e,a)}get duration(){return z(this.calculatedDuration)}get iterationDuration(){const{delay:e=0}=this.options||{};return this.duration+z(e)}get time(){return z(this.currentTime)}set time(e){e=Y(e),this.currentTime=e,this.startTime===null||this.holdTime!==null||this.playbackSpeed===0?this.holdTime=e:this.driver&&(this.startTime=this.driver.now()-e/this.playbackSpeed),this.driver?.start(!1)}get speed(){return this.playbackSpeed}set speed(e){this.updateTime(F.now());const a=this.playbackSpeed!==e;this.playbackSpeed=e,a&&(this.time=z(this.currentTime))}play(){if(this.isStopped)return;const{driver:e=vi,startTime:a}=this.options;this.driver||(this.driver=e(i=>this.tick(i))),this.options.onPlay?.();const s=this.driver.now();this.state==="finished"?(this.updateFinished(),this.startTime=s):this.holdTime!==null?this.startTime=s-this.holdTime:this.startTime||(this.startTime=a??s),this.state==="finished"&&this.speed<0&&(this.startTime+=this.calculatedDuration),this.holdTime=null,this.state="running",this.driver.start()}pause(){this.state="paused",this.updateTime(F.now()),this.holdTime=this.currentTime}complete(){this.state!=="running"&&this.play(),this.state="finished",this.holdTime=null}finish(){this.notifyFinished(),this.teardown(),this.state="finished",this.options.onComplete?.()}cancel(){this.holdTime=null,this.startTime=0,this.tick(0),this.teardown(),this.options.onCancel?.()}teardown(){this.state="idle",this.stopDriver(),this.startTime=this.holdTime=null}stopDriver(){this.driver&&(this.driver.stop(),this.driver=void 0)}sample(e){return this.startTime=0,this.tick(e,!0)}attachTimeline(e){return this.options.allowFlatten&&(this.options.type="keyframes",this.options.ease="linear",this.initAnimation()),this.driver?.stop(),e.observe(this)}}function $i(t){for(let e=1;e<t.length;e++)t[e]??(t[e]=t[e-1])}const ne=t=>t*180/Math.PI,st=t=>{const e=ne(Math.atan2(t[1],t[0]));return it(e)},Pi={x:4,y:5,translateX:4,translateY:5,scaleX:0,scaleY:3,scale:t=>(Math.abs(t[0])+Math.abs(t[3]))/2,rotate:st,rotateZ:st,skewX:t=>ne(Math.atan(t[1])),skewY:t=>ne(Math.atan(t[2])),skew:t=>(Math.abs(t[1])+Math.abs(t[2]))/2},it=t=>(t=t%360,t<0&&(t+=360),t),Gt=st,Yt=t=>Math.sqrt(t[0]*t[0]+t[1]*t[1]),Xt=t=>Math.sqrt(t[4]*t[4]+t[5]*t[5]),Di={x:12,y:13,z:14,translateX:12,translateY:13,translateZ:14,scaleX:Yt,scaleY:Xt,scale:t=>(Yt(t)+Xt(t))/2,rotateX:t=>it(ne(Math.atan2(t[6],t[5]))),rotateY:t=>it(ne(Math.atan2(-t[2],t[0]))),rotateZ:Gt,rotate:Gt,skewX:t=>ne(Math.atan(t[4])),skewY:t=>ne(Math.atan(t[1])),skew:t=>(Math.abs(t[1])+Math.abs(t[4]))/2};function nt(t){return t.includes("scale")?1:0}function rt(t,e){if(!t||t==="none")return nt(e);const a=t.match(/^matrix3d\(([-\d.e\s,]+)\)$/u);let s,i;if(a)s=Di,i=a;else{const o=t.match(/^matrix\(([-\d.e\s,]+)\)$/u);s=Pi,i=o}if(!i)return nt(e);const n=s[e],r=i[1].split(",").map(Oi);return typeof n=="function"?n(r):r[n]}const ji=(t,e)=>{const{transform:a="none"}=getComputedStyle(t);return rt(a,e)};function Oi(t){return parseFloat(t.trim())}const fe=["transformPerspective","x","y","z","translateX","translateY","translateZ","scale","scaleX","scaleY","rotate","rotateX","rotateY","rotateZ","skew","skewX","skewY"],me=new Set(fe),Jt=t=>t===ge||t===h,Fi=new Set(["x","y","z"]),Hi=fe.filter(t=>!Fi.has(t));function Ni(t){const e=[];return Hi.forEach(a=>{const s=t.getValue(a);s!==void 0&&(e.push([a,s.get()]),s.set(a.startsWith("scale")?1:0))}),e}const te={width:({x:t},{paddingLeft:e="0",paddingRight:a="0"})=>t.max-t.min-parseFloat(e)-parseFloat(a),height:({y:t},{paddingTop:e="0",paddingBottom:a="0"})=>t.max-t.min-parseFloat(e)-parseFloat(a),top:(t,{top:e})=>parseFloat(e),left:(t,{left:e})=>parseFloat(e),bottom:({y:t},{top:e})=>parseFloat(e)+(t.max-t.min),right:({x:t},{left:e})=>parseFloat(e)+(t.max-t.min),x:(t,{transform:e})=>rt(e,"x"),y:(t,{transform:e})=>rt(e,"y")};te.translateX=te.x;te.translateY=te.y;const re=new Set;let ot=!1,lt=!1,dt=!1;function Ja(){if(lt){const t=Array.from(re).filter(s=>s.needsMeasurement),e=new Set(t.map(s=>s.element)),a=new Map;e.forEach(s=>{const i=Ni(s);i.length&&(a.set(s,i),s.render())}),t.forEach(s=>s.measureInitialState()),e.forEach(s=>{s.render();const i=a.get(s);i&&i.forEach(([n,r])=>{s.getValue(n)?.set(r)})}),t.forEach(s=>s.measureEndState()),t.forEach(s=>{s.suspendedScrollY!==void 0&&window.scrollTo(0,s.suspendedScrollY)})}lt=!1,ot=!1,re.forEach(t=>t.complete(dt)),re.clear()}function Za(){re.forEach(t=>{t.readKeyframes(),t.needsMeasurement&&(lt=!0)})}function zi(){dt=!0,Za(),Ja(),dt=!1}class Lt{constructor(e,a,s,i,n,r=!1){this.state="pending",this.isAsync=!1,this.needsMeasurement=!1,this.unresolvedKeyframes=[...e],this.onComplete=a,this.name=s,this.motionValue=i,this.element=n,this.isAsync=r}scheduleResolve(){this.state="scheduled",this.isAsync?(re.add(this),ot||(ot=!0,J.read(Za),J.resolveKeyframes(Ja))):(this.readKeyframes(),this.complete())}readKeyframes(){const{unresolvedKeyframes:e,name:a,element:s,motionValue:i}=this;if(e[0]===null){const n=i?.get(),r=e[e.length-1];if(n!==void 0)e[0]=n;else if(s&&a){const o=s.readValue(a,r);o!=null&&(e[0]=o)}e[0]===void 0&&(e[0]=r),i&&n===void 0&&i.set(e[0])}$i(e)}setFinalKeyframe(){}measureInitialState(){}renderEndStyles(){}measureEndState(){}complete(e=!1){this.state="complete",this.onComplete(this.unresolvedKeyframes,this.finalKeyframe,e),re.delete(this)}cancel(){this.state==="scheduled"&&(re.delete(this),this.state="pending")}resume(){this.state==="pending"&&this.scheduleResolve()}}const _i=t=>t.startsWith("--");function qi(t,e,a){_i(e)?t.style.setProperty(e,a):t.style[e]=a}const Ui=bt(()=>window.ScrollTimeline!==void 0),Wi={};function Ki(t,e){const a=bt(t);return()=>Wi[e]??a()}const Qa=Ki(()=>{try{document.createElement("div").animate({opacity:0},{easing:"linear(0, 1)"})}catch{return!1}return!0},"linearEasing"),we=([t,e,a,s])=>`cubic-bezier(${t}, ${e}, ${a}, ${s})`,Zt={linear:"linear",ease:"ease",easeIn:"ease-in",easeOut:"ease-out",easeInOut:"ease-in-out",circIn:we([0,.65,.55,1]),circOut:we([.55,0,1,.45]),backIn:we([.31,.01,.66,-.59]),backOut:we([.33,1.53,.69,.99])};function es(t,e){if(t)return typeof t=="function"?Qa()?Ua(t,e):"ease-out":$a(t)?we(t):Array.isArray(t)?t.map(a=>es(a,e)||Zt.easeOut):Zt[t]}function Gi(t,e,a,{delay:s=0,duration:i=300,repeat:n=0,repeatType:r="loop",ease:o="easeOut",times:l}={},c=void 0){const d={[e]:a};l&&(d.offset=l);const p=es(o,i);Array.isArray(p)&&(d.easing=p);const u={delay:s,duration:i,easing:Array.isArray(p)?"linear":p,fill:"both",iterations:n+1,direction:r==="reverse"?"alternate":"normal"};return c&&(u.pseudoElement=c),t.animate(d,u)}function Bt(t){return typeof t=="function"&&"applyToOptions"in t}function Yi({type:t,...e}){return Bt(t)&&Qa()?t.applyToOptions(e):(e.duration??(e.duration=300),e.ease??(e.ease="easeOut"),e)}class Xi extends Mt{constructor(e){if(super(),this.finishedTime=null,this.isStopped=!1,this.manualStartTime=null,!e)return;const{element:a,name:s,keyframes:i,pseudoElement:n,allowFlatten:r=!1,finalKeyframe:o,onComplete:l}=e;this.isPseudoElement=!!n,this.allowFlatten=r,this.options=e,ht(typeof e.type!="string");const c=Yi(e);this.animation=Gi(a,s,i,c,n),c.autoplay===!1&&this.animation.pause(),this.animation.onfinish=()=>{if(this.finishedTime=this.time,!n){const d=Ct(i,this.options,o,this.speed);this.updateMotionValue?this.updateMotionValue(d):qi(a,s,d),this.animation.cancel()}l?.(),this.notifyFinished()}}play(){this.isStopped||(this.manualStartTime=null,this.animation.play(),this.state==="finished"&&this.updateFinished())}pause(){this.animation.pause()}complete(){this.animation.finish?.()}cancel(){try{this.animation.cancel()}catch{}}stop(){if(this.isStopped)return;this.isStopped=!0;const{state:e}=this;e==="idle"||e==="finished"||(this.updateMotionValue?this.updateMotionValue():this.commitStyles(),this.isPseudoElement||this.cancel())}commitStyles(){this.isPseudoElement||this.animation.commitStyles?.()}get duration(){const e=this.animation.effect?.getComputedTiming?.().duration||0;return z(Number(e))}get iterationDuration(){const{delay:e=0}=this.options||{};return this.duration+z(e)}get time(){return z(Number(this.animation.currentTime)||0)}set time(e){this.manualStartTime=null,this.finishedTime=null,this.animation.currentTime=Y(e)}get speed(){return this.animation.playbackRate}set speed(e){e<0&&(this.finishedTime=null),this.animation.playbackRate=e}get state(){return this.finishedTime!==null?"finished":this.animation.playState}get startTime(){return this.manualStartTime??Number(this.animation.startTime)}set startTime(e){this.manualStartTime=this.animation.startTime=e}attachTimeline({timeline:e,observe:a}){return this.allowFlatten&&this.animation.effect?.updateTiming({easing:"linear"}),this.animation.onfinish=null,e&&Ui()?(this.animation.timeline=e,pe):a(this)}}const ts={anticipate:Ia,backInOut:Ma,circInOut:La};function Ji(t){return t in ts}function Zi(t){typeof t.ease=="string"&&Ji(t.ease)&&(t.ease=ts[t.ease])}const Ye=10;class Qi extends Xi{constructor(e){Zi(e),Xa(e),super(e),e.startTime!==void 0&&(this.startTime=e.startTime),this.options=e}updateMotionValue(e){const{motionValue:a,onUpdate:s,onComplete:i,element:n,...r}=this.options;if(!a)return;if(e!==void 0){a.set(e);return}const o=new It({...r,autoplay:!1}),l=Math.max(Ye,F.now()-this.startTime),c=ae(0,Ye,l-Ye);a.setWithVelocity(o.sample(Math.max(0,l-c)).value,o.sample(l).value,c),o.stop()}}const Qt=(t,e)=>e==="zIndex"?!1:!!(typeof t=="number"||Array.isArray(t)||typeof t=="string"&&(se.test(t)||t==="0")&&!t.startsWith("url("));function en(t){const e=t[0];if(t.length===1)return!0;for(let a=0;a<t.length;a++)if(t[a]!==e)return!0}function tn(t,e,a,s){const i=t[0];if(i===null)return!1;if(e==="display"||e==="visibility")return!0;const n=t[t.length-1],r=Qt(i,e),o=Qt(n,e);return!r||!o?!1:en(t)||(a==="spring"||Bt(a))&&s}function ct(t){t.duration=0,t.type="keyframes"}const an=new Set(["opacity","clipPath","filter","transform"]),sn=bt(()=>Object.hasOwnProperty.call(Element.prototype,"animate"));function nn(t){const{motionValue:e,name:a,repeatDelay:s,repeatType:i,damping:n,type:r}=t;if(!(e?.owner?.current instanceof HTMLElement))return!1;const{onUpdate:l,transformTemplate:c}=e.owner.getProps();return sn()&&a&&an.has(a)&&(a!=="transform"||!c)&&!l&&!s&&i!=="mirror"&&n!==0&&r!=="inertia"}const rn=40;class on extends Mt{constructor({autoplay:e=!0,delay:a=0,type:s="keyframes",repeat:i=0,repeatDelay:n=0,repeatType:r="loop",keyframes:o,name:l,motionValue:c,element:d,...p}){super(),this.stop=()=>{this._animation&&(this._animation.stop(),this.stopTimeline?.()),this.keyframeResolver?.cancel()},this.createdAt=F.now();const u={autoplay:e,delay:a,type:s,repeat:i,repeatDelay:n,repeatType:r,name:l,motionValue:c,element:d,...p},m=d?.KeyframeResolver||Lt;this.keyframeResolver=new m(o,(x,y,v)=>this.onKeyframesResolved(x,y,u,!v),l,c,d),this.keyframeResolver?.scheduleResolve()}onKeyframesResolved(e,a,s,i){this.keyframeResolver=void 0;const{name:n,type:r,velocity:o,delay:l,isHandoff:c,onUpdate:d}=s;this.resolvedAt=F.now(),tn(e,n,r,o)||((X.instantAnimations||!l)&&d?.(Ct(e,s,a)),e[0]=e[e.length-1],ct(s),s.repeat=0);const u={startTime:i?this.resolvedAt?this.resolvedAt-this.createdAt>rn?this.resolvedAt:this.createdAt:this.createdAt:void 0,finalKeyframe:a,...s,keyframes:e},m=!c&&nn(u)?new Qi({...u,element:u.motionValue.owner.current}):new It(u);m.finished.then(()=>this.notifyFinished()).catch(pe),this.pendingTimeline&&(this.stopTimeline=m.attachTimeline(this.pendingTimeline),this.pendingTimeline=void 0),this._animation=m}get finished(){return this._animation?this.animation.finished:this._finished}then(e,a){return this.finished.finally(e).then(()=>{})}get animation(){return this._animation||(this.keyframeResolver?.resume(),zi()),this._animation}get duration(){return this.animation.duration}get iterationDuration(){return this.animation.iterationDuration}get time(){return this.animation.time}set time(e){this.animation.time=e}get speed(){return this.animation.speed}get state(){return this.animation.state}set speed(e){this.animation.speed=e}get startTime(){return this.animation.startTime}attachTimeline(e){return this._animation?this.stopTimeline=this.animation.attachTimeline(e):this.pendingTimeline=e,()=>this.stop()}play(){this.animation.play()}pause(){this.animation.pause()}complete(){this.animation.complete()}cancel(){this._animation&&this.animation.cancel(),this.keyframeResolver?.cancel()}}class ln{constructor(e){this.stop=()=>this.runAll("stop"),this.animations=e.filter(Boolean)}get finished(){return Promise.all(this.animations.map(e=>e.finished))}getAll(e){return this.animations[0][e]}setAll(e,a){for(let s=0;s<this.animations.length;s++)this.animations[s][e]=a}attachTimeline(e){const a=this.animations.map(s=>s.attachTimeline(e));return()=>{a.forEach((s,i)=>{s&&s(),this.animations[i].stop()})}}get time(){return this.getAll("time")}set time(e){this.setAll("time",e)}get speed(){return this.getAll("speed")}set speed(e){this.setAll("speed",e)}get state(){return this.getAll("state")}get startTime(){return this.getAll("startTime")}get duration(){return ea(this.animations,"duration")}get iterationDuration(){return ea(this.animations,"iterationDuration")}runAll(e){this.animations.forEach(a=>a[e]())}play(){this.runAll("play")}pause(){this.runAll("pause")}cancel(){this.runAll("cancel")}complete(){this.runAll("complete")}}function ea(t,e){let a=0;for(let s=0;s<t.length;s++){const i=t[s][e];i!==null&&i>a&&(a=i)}return a}class dn extends ln{then(e,a){return this.finished.finally(e).then(()=>{})}}const cn=/^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u;function pn(t){const e=cn.exec(t);if(!e)return[,];const[,a,s,i]=e;return[`--${a??s}`,i]}function as(t,e,a=1){const[s,i]=pn(t);if(!s)return;const n=window.getComputedStyle(e).getPropertyValue(s);if(n){const r=n.trim();return ya(r)?parseFloat(r):r}return kt(i)?as(i,e,a+1):i}function ss(t,e){return t?.[e]??t?.default??t}const gn={type:"spring",stiffness:500,damping:25,restSpeed:10},un=t=>({type:"spring",stiffness:550,damping:t===0?2*Math.sqrt(550):30,restSpeed:10}),fn={type:"keyframes",duration:.8},mn={type:"keyframes",ease:[.25,.1,.35,1],duration:.3},hn=(t,{keyframes:e})=>e.length>2?fn:me.has(t)?t.startsWith("scale")?un(e[1]):gn:mn;function bn({when:t,delay:e,delayChildren:a,staggerChildren:s,staggerDirection:i,repeat:n,repeatType:r,repeatDelay:o,from:l,elapsed:c,...d}){return!!Object.keys(d).length}const xn=t=>t!==null;function vn(t,{repeat:e,repeatType:a="loop"},s){const i=t.filter(xn),n=e&&a!=="loop"&&e%2===1?0:i.length-1;return i[n]}const is=(t,e,a,s={},i,n)=>r=>{const o=ss(s,t)||{},l=o.delay||s.delay||0;let{elapsed:c=0}=s;c=c-Y(l);const d={keyframes:Array.isArray(a)?a:[null,a],ease:"easeOut",velocity:e.getVelocity(),...o,delay:-c,onUpdate:u=>{e.set(u),o.onUpdate&&o.onUpdate(u)},onComplete:()=>{r(),o.onComplete&&o.onComplete()},name:t,motionValue:e,element:n?void 0:i};bn(o)||Object.assign(d,hn(t,d)),d.duration&&(d.duration=Y(d.duration)),d.repeatDelay&&(d.repeatDelay=Y(d.repeatDelay)),d.from!==void 0&&(d.keyframes[0]=d.from);let p=!1;if((d.type===!1||d.duration===0&&!d.repeatDelay)&&(ct(d),d.delay===0&&(p=!0)),(X.instantAnimations||X.skipAnimations)&&(p=!0,ct(d),d.delay=0),d.allowFlatten=!o.type&&!o.ease,p&&!n&&e.get()!==void 0){const u=vn(d.keyframes,o);if(u!==void 0){J.update(()=>{d.onUpdate(u),d.onComplete()});return}}return o.isSync?new It(d):new on(d)},ns=new Set(["width","height","top","left","right","bottom",...fe]),ta=30,yn=t=>!isNaN(parseFloat(t));class wn{constructor(e,a={}){this.canTrackVelocity=null,this.events={},this.updateAndNotify=s=>{const i=F.now();if(this.updatedAt!==i&&this.setPrevFrameValue(),this.prev=this.current,this.setCurrent(s),this.current!==this.prev&&(this.events.change?.notify(this.current),this.dependents))for(const n of this.dependents)n.dirty()},this.hasAnimated=!1,this.setCurrent(e),this.owner=a.owner}setCurrent(e){this.current=e,this.updatedAt=F.now(),this.canTrackVelocity===null&&e!==void 0&&(this.canTrackVelocity=yn(this.current))}setPrevFrameValue(e=this.current){this.prevFrameValue=e,this.prevUpdatedAt=this.updatedAt}onChange(e){return this.on("change",e)}on(e,a){this.events[e]||(this.events[e]=new ka);const s=this.events[e].add(a);return e==="change"?()=>{s(),J.read(()=>{this.events.change.getSize()||this.stop()})}:s}clearListeners(){for(const e in this.events)this.events[e].clear()}attach(e,a){this.passiveEffect=e,this.stopPassiveEffect=a}set(e){this.passiveEffect?this.passiveEffect(e,this.updateAndNotify):this.updateAndNotify(e)}setWithVelocity(e,a,s){this.set(a),this.prev=void 0,this.prevFrameValue=e,this.prevUpdatedAt=this.updatedAt-s}jump(e,a=!0){this.updateAndNotify(e),this.prev=e,this.prevUpdatedAt=this.prevFrameValue=void 0,a&&this.stop(),this.stopPassiveEffect&&this.stopPassiveEffect()}dirty(){this.events.change?.notify(this.current)}addDependent(e){this.dependents||(this.dependents=new Set),this.dependents.add(e)}removeDependent(e){this.dependents&&this.dependents.delete(e)}get(){return this.current}getPrevious(){return this.prev}getVelocity(){const e=F.now();if(!this.canTrackVelocity||this.prevFrameValue===void 0||e-this.updatedAt>ta)return 0;const a=Math.min(this.updatedAt-this.prevUpdatedAt,ta);return Ea(parseFloat(this.current)-parseFloat(this.prevFrameValue),a)}start(e){return this.stop(),new Promise(a=>{this.hasAnimated=!0,this.animation=e(a),this.events.animationStart&&this.events.animationStart.notify()}).then(()=>{this.events.animationComplete&&this.events.animationComplete.notify(),this.clearAnimation()})}stop(){this.animation&&(this.animation.stop(),this.events.animationCancel&&this.events.animationCancel.notify()),this.clearAnimation()}isAnimating(){return!!this.animation}clearAnimation(){delete this.animation}destroy(){this.dependents?.clear(),this.events.destroy?.notify(),this.clearListeners(),this.stop(),this.stopPassiveEffect&&this.stopPassiveEffect()}}function Me(t,e){return new wn(t,e)}function aa(t){const e=[{},{}];return t?.values.forEach((a,s)=>{e[0][s]=a.get(),e[1][s]=a.getVelocity()}),e}function rs(t,e,a,s){if(typeof e=="function"){const[i,n]=aa(s);e=e(a!==void 0?a:t.custom,i,n)}if(typeof e=="string"&&(e=t.variants&&t.variants[e]),typeof e=="function"){const[i,n]=aa(s);e=e(a!==void 0?a:t.custom,i,n)}return e}function kn(t,e,a){const s=t.getProps();return rs(s,e,s.custom,t)}const En=t=>Array.isArray(t);function Sn(t,e,a){t.hasValue(e)?t.getValue(e).set(a):t.addValue(e,Me(a))}function Tn(t){return En(t)?t[t.length-1]||0:t}function An(t,e){const a=kn(t,e);let{transitionEnd:s={},transition:i={},...n}=a||{};n={...n,...s};for(const r in n){const o=Tn(n[r]);Sn(t,r,o)}}const D=t=>!!(t&&t.getVelocity);function Cn(t){return!!(D(t)&&t.add)}function Mn(t,e){const a=t.getValue("willChange");if(Cn(a))return a.add(e);if(!a&&X.WillChange){const s=new X.WillChange("auto");t.addValue("willChange",s),s.add(e)}}function Vt(t){return t.replace(/([A-Z])/g,e=>`-${e.toLowerCase()}`)}const In="framerAppearId",Ln="data-"+Vt(In);function Bn(t){return t.props[Ln]}function Vn({protectedKeys:t,needsAnimating:e},a){const s=t.hasOwnProperty(a)&&e[a]!==!0;return e[a]=!1,s}function Rn(t,e,{delay:a=0,transitionOverride:s,type:i}={}){let{transition:n=t.getDefaultTransition(),transitionEnd:r,...o}=e;s&&(n=s);const l=[],c=i&&t.animationState&&t.animationState.getState()[i];for(const d in o){const p=t.getValue(d,t.latestValues[d]??null),u=o[d];if(u===void 0||c&&Vn(c,d))continue;const m={delay:a,...ss(n||{},d)},x=p.get();if(x!==void 0&&!p.isAnimating&&!Array.isArray(u)&&u===x&&!m.velocity)continue;let y=!1;if(window.MotionHandoffAnimation){const w=Bn(t);if(w){const C=window.MotionHandoffAnimation(w,d,J);C!==null&&(m.startTime=C,y=!0)}}Mn(t,d),p.start(is(d,p,u,t.shouldReduceMotion&&ns.has(d)?{type:!1}:m,t,y));const v=p.animation;v&&l.push(v)}return r&&Promise.all(l).then(()=>{J.update(()=>{r&&An(t,r)})}),l}const $n={test:t=>t==="auto",parse:t=>t},os=t=>e=>e.test(t),ls=[ge,h,de,ee,si,ai,$n],sa=t=>ls.find(os(t));function Pn(t){return typeof t=="number"?t===0:t!==null?t==="none"||t==="0"||wa(t):!0}const Dn=new Set(["brightness","contrast","saturate","opacity"]);function jn(t){const[e,a]=t.slice(0,-1).split("(");if(e==="drop-shadow")return t;const[s]=a.match(Et)||[];if(!s)return t;const i=a.replace(s,"");let n=Dn.has(e)?1:0;return s!==a&&(n*=100),e+"("+n+i+")"}const On=/\b([a-z-]*)\(.*?\)/gu,pt={...se,getAnimatableNone:t=>{const e=t.match(On);return e?e.map(jn).join(" "):t}},ia={...ge,transform:Math.round},Fn={rotate:ee,rotateX:ee,rotateY:ee,rotateZ:ee,scale:je,scaleX:je,scaleY:je,scaleZ:je,skew:ee,skewX:ee,skewY:ee,distance:h,translateX:h,translateY:h,translateZ:h,x:h,y:h,z:h,perspective:h,transformPerspective:h,opacity:Te,originX:_t,originY:_t,originZ:h},Rt={borderWidth:h,borderTopWidth:h,borderRightWidth:h,borderBottomWidth:h,borderLeftWidth:h,borderRadius:h,radius:h,borderTopLeftRadius:h,borderTopRightRadius:h,borderBottomRightRadius:h,borderBottomLeftRadius:h,width:h,maxWidth:h,height:h,maxHeight:h,top:h,right:h,bottom:h,left:h,inset:h,insetBlock:h,insetBlockStart:h,insetBlockEnd:h,insetInline:h,insetInlineStart:h,insetInlineEnd:h,padding:h,paddingTop:h,paddingRight:h,paddingBottom:h,paddingLeft:h,paddingBlock:h,paddingBlockStart:h,paddingBlockEnd:h,paddingInline:h,paddingInlineStart:h,paddingInlineEnd:h,margin:h,marginTop:h,marginRight:h,marginBottom:h,marginLeft:h,marginBlock:h,marginBlockStart:h,marginBlockEnd:h,marginInline:h,marginInlineStart:h,marginInlineEnd:h,backgroundPositionX:h,backgroundPositionY:h,...Fn,zIndex:ia,fillOpacity:Te,strokeOpacity:Te,numOctaves:ia},Hn={...Rt,color:R,backgroundColor:R,outlineColor:R,fill:R,stroke:R,borderColor:R,borderTopColor:R,borderRightColor:R,borderBottomColor:R,borderLeftColor:R,filter:pt,WebkitFilter:pt},ds=t=>Hn[t];function cs(t,e){let a=ds(t);return a!==pt&&(a=se),a.getAnimatableNone?a.getAnimatableNone(e):void 0}const Nn=new Set(["auto","none","0"]);function zn(t,e,a){let s=0,i;for(;s<t.length&&!i;){const n=t[s];typeof n=="string"&&!Nn.has(n)&&Ae(n).values.length&&(i=t[s]),s++}if(i&&a)for(const n of e)t[n]=cs(a,i)}class _n extends Lt{constructor(e,a,s,i,n){super(e,a,s,i,n,!0)}readKeyframes(){const{unresolvedKeyframes:e,element:a,name:s}=this;if(!a||!a.current)return;super.readKeyframes();for(let d=0;d<e.length;d++){let p=e[d];if(typeof p=="string"&&(p=p.trim(),kt(p))){const u=as(p,a.current);u!==void 0&&(e[d]=u),d===e.length-1&&(this.finalKeyframe=p)}}if(this.resolveNoneKeyframes(),!ns.has(s)||e.length!==2)return;const[i,n]=e,r=sa(i),o=sa(n),l=zt(i),c=zt(n);if(l!==c&&te[s]){this.needsMeasurement=!0;return}if(r!==o)if(Jt(r)&&Jt(o))for(let d=0;d<e.length;d++){const p=e[d];typeof p=="string"&&(e[d]=parseFloat(p))}else te[s]&&(this.needsMeasurement=!0)}resolveNoneKeyframes(){const{unresolvedKeyframes:e,name:a}=this,s=[];for(let i=0;i<e.length;i++)(e[i]===null||Pn(e[i]))&&s.push(i);s.length&&zn(e,s,a)}measureInitialState(){const{element:e,unresolvedKeyframes:a,name:s}=this;if(!e||!e.current)return;s==="height"&&(this.suspendedScrollY=window.pageYOffset),this.measuredOrigin=te[s](e.measureViewportBox(),window.getComputedStyle(e.current)),a[0]=this.measuredOrigin;const i=a[a.length-1];i!==void 0&&e.getValue(s,i).jump(i,!1)}measureEndState(){const{element:e,name:a,unresolvedKeyframes:s}=this;if(!e||!e.current)return;const i=e.getValue(a);i&&i.jump(this.measuredOrigin,!1);const n=s.length-1,r=s[n];s[n]=te[a](e.measureViewportBox(),window.getComputedStyle(e.current)),r!==null&&this.finalKeyframe===void 0&&(this.finalKeyframe=r),this.removedTransforms?.length&&this.removedTransforms.forEach(([o,l])=>{e.getValue(o).set(l)}),this.resolveNoneKeyframes()}}function qn(t,e,a){if(t instanceof EventTarget)return[t];if(typeof t=="string"){let s=document;const i=a?.[t]??s.querySelectorAll(t);return i?Array.from(i):[]}return Array.from(t)}const ps=(t,e)=>e&&typeof t=="number"?e.transform(t):t,{schedule:Un}=Pa(queueMicrotask,!1);function gs(t){return Ds(t)&&"ownerSVGElement"in t}function Wn(t){return gs(t)&&t.tagName==="svg"}const Kn=[...ls,R,se],Gn=t=>Kn.find(os(t)),na=()=>({min:0,max:0}),$t=()=>({x:na(),y:na()}),gt={current:null},us={current:!1},Yn=typeof window<"u";function Xn(){if(us.current=!0,!!Yn)if(window.matchMedia){const t=window.matchMedia("(prefers-reduced-motion)"),e=()=>gt.current=t.matches;t.addEventListener("change",e),e()}else gt.current=!1}const Ie=new WeakMap;function Jn(t){return t!==null&&typeof t=="object"&&typeof t.start=="function"}function Zn(t){return typeof t=="string"||Array.isArray(t)}const Qn=["animate","whileInView","whileFocus","whileHover","whileTap","whileDrag","exit"],er=["initial",...Qn];function fs(t){return Jn(t.animate)||er.some(e=>Zn(t[e]))}function tr(t){return!!(fs(t)||t.variants)}function ar(t,e,a){for(const s in e){const i=e[s],n=a[s];if(D(i))t.addValue(s,i);else if(D(n))t.addValue(s,Me(i,{owner:t}));else if(n!==i)if(t.hasValue(s)){const r=t.getValue(s);r.liveStyle===!0?r.jump(i):r.hasAnimated||r.set(i)}else{const r=t.getStaticValue(s);t.addValue(s,Me(r!==void 0?r:i,{owner:t}))}}for(const s in a)e[s]===void 0&&t.removeValue(s);return e}const ra=["AnimationStart","AnimationComplete","Update","BeforeLayoutMeasure","LayoutMeasure","LayoutAnimationStart","LayoutAnimationComplete"];let oa={};class ms{scrapeMotionValuesFromProps(e,a,s){return{}}constructor({parent:e,props:a,presenceContext:s,reducedMotionConfig:i,blockInitialAnimation:n,visualState:r},o={}){this.current=null,this.children=new Set,this.isVariantNode=!1,this.isControllingVariants=!1,this.shouldReduceMotion=null,this.values=new Map,this.KeyframeResolver=Lt,this.features={},this.valueSubscriptions=new Map,this.prevMotionValues={},this.events={},this.propEventSubscriptions={},this.notifyUpdate=()=>this.notify("Update",this.latestValues),this.render=()=>{this.current&&(this.triggerBuild(),this.renderInstance(this.current,this.renderState,this.props.style,this.projection))},this.renderScheduledAt=0,this.scheduleRender=()=>{const u=F.now();this.renderScheduledAt<u&&(this.renderScheduledAt=u,J.render(this.render,!1,!0))};const{latestValues:l,renderState:c}=r;this.latestValues=l,this.baseTarget={...l},this.initialValues=a.initial?{...l}:{},this.renderState=c,this.parent=e,this.props=a,this.presenceContext=s,this.depth=e?e.depth+1:0,this.reducedMotionConfig=i,this.options=o,this.blockInitialAnimation=!!n,this.isControllingVariants=fs(a),this.isVariantNode=tr(a),this.isVariantNode&&(this.variantChildren=new Set),this.manuallyAnimateOnMount=!!(e&&e.current);const{willChange:d,...p}=this.scrapeMotionValuesFromProps(a,{},this);for(const u in p){const m=p[u];l[u]!==void 0&&D(m)&&m.set(l[u])}}mount(e){this.current=e,Ie.set(e,this),this.projection&&!this.projection.instance&&this.projection.mount(e),this.parent&&this.isVariantNode&&!this.isControllingVariants&&(this.removeFromVariantTree=this.parent.addVariantChild(this)),this.values.forEach((a,s)=>this.bindToMotionValue(s,a)),this.reducedMotionConfig==="never"?this.shouldReduceMotion=!1:this.reducedMotionConfig==="always"?this.shouldReduceMotion=!0:(us.current||Xn(),this.shouldReduceMotion=gt.current),this.parent?.addChild(this),this.update(this.props,this.presenceContext)}unmount(){this.projection&&this.projection.unmount(),Ze(this.notifyUpdate),Ze(this.render),this.valueSubscriptions.forEach(e=>e()),this.valueSubscriptions.clear(),this.removeFromVariantTree&&this.removeFromVariantTree(),this.parent?.removeChild(this);for(const e in this.events)this.events[e].clear();for(const e in this.features){const a=this.features[e];a&&(a.unmount(),a.isMounted=!1)}this.current=null}addChild(e){this.children.add(e),this.enteringChildren??(this.enteringChildren=new Set),this.enteringChildren.add(e)}removeChild(e){this.children.delete(e),this.enteringChildren&&this.enteringChildren.delete(e)}bindToMotionValue(e,a){this.valueSubscriptions.has(e)&&this.valueSubscriptions.get(e)();const s=me.has(e);s&&this.onBindTransform&&this.onBindTransform();const i=a.on("change",r=>{this.latestValues[e]=r,this.props.onUpdate&&J.preRender(this.notifyUpdate),s&&this.projection&&(this.projection.isTransformDirty=!0),this.scheduleRender()});let n;typeof window<"u"&&window.MotionCheckAppearSync&&(n=window.MotionCheckAppearSync(this,e,a)),this.valueSubscriptions.set(e,()=>{i(),n&&n(),a.owner&&a.stop()})}sortNodePosition(e){return!this.current||!this.sortInstanceNodePosition||this.type!==e.type?0:this.sortInstanceNodePosition(this.current,e.current)}updateFeatures(){let e="animation";for(e in oa){const a=oa[e];if(!a)continue;const{isEnabled:s,Feature:i}=a;if(!this.features[e]&&i&&s(this.props)&&(this.features[e]=new i(this)),this.features[e]){const n=this.features[e];n.isMounted?n.update():(n.mount(),n.isMounted=!0)}}}triggerBuild(){this.build(this.renderState,this.latestValues,this.props)}measureViewportBox(){return this.current?this.measureInstanceViewportBox(this.current,this.props):$t()}getStaticValue(e){return this.latestValues[e]}setStaticValue(e,a){this.latestValues[e]=a}update(e,a){(e.transformTemplate||this.props.transformTemplate)&&this.scheduleRender(),this.prevProps=this.props,this.props=e,this.prevPresenceContext=this.presenceContext,this.presenceContext=a;for(let s=0;s<ra.length;s++){const i=ra[s];this.propEventSubscriptions[i]&&(this.propEventSubscriptions[i](),delete this.propEventSubscriptions[i]);const n="on"+i,r=e[n];r&&(this.propEventSubscriptions[i]=this.on(i,r))}this.prevMotionValues=ar(this,this.scrapeMotionValuesFromProps(e,this.prevProps||{},this),this.prevMotionValues),this.handleChildMotionValue&&this.handleChildMotionValue()}getProps(){return this.props}getVariant(e){return this.props.variants?this.props.variants[e]:void 0}getDefaultTransition(){return this.props.transition}getTransformPagePoint(){return this.props.transformPagePoint}getClosestVariantNode(){return this.isVariantNode?this:this.parent?this.parent.getClosestVariantNode():void 0}addVariantChild(e){const a=this.getClosestVariantNode();if(a)return a.variantChildren&&a.variantChildren.add(e),()=>a.variantChildren.delete(e)}addValue(e,a){const s=this.values.get(e);a!==s&&(s&&this.removeValue(e),this.bindToMotionValue(e,a),this.values.set(e,a),this.latestValues[e]=a.get())}removeValue(e){this.values.delete(e);const a=this.valueSubscriptions.get(e);a&&(a(),this.valueSubscriptions.delete(e)),delete this.latestValues[e],this.removeValueFromRenderState(e,this.renderState)}hasValue(e){return this.values.has(e)}getValue(e,a){if(this.props.values&&this.props.values[e])return this.props.values[e];let s=this.values.get(e);return s===void 0&&a!==void 0&&(s=Me(a===null?void 0:a,{owner:this}),this.addValue(e,s)),s}readValue(e,a){let s=this.latestValues[e]!==void 0||!this.current?this.latestValues[e]:this.getBaseTargetFromProps(this.props,e)??this.readValueFromInstance(this.current,e,this.options);return s!=null&&(typeof s=="string"&&(ya(s)||wa(s))?s=parseFloat(s):!Gn(s)&&se.test(a)&&(s=cs(e,a)),this.setBaseTarget(e,D(s)?s.get():s)),D(s)?s.get():s}setBaseTarget(e,a){this.baseTarget[e]=a}getBaseTarget(e){const{initial:a}=this.props;let s;if(typeof a=="string"||typeof a=="object"){const n=rs(this.props,a,this.presenceContext?.custom);n&&(s=n[e])}if(a&&s!==void 0)return s;const i=this.getBaseTargetFromProps(this.props,e);return i!==void 0&&!D(i)?i:this.initialValues[e]!==void 0&&s===void 0?void 0:this.baseTarget[e]}on(e,a){return this.events[e]||(this.events[e]=new ka),this.events[e].add(a)}notify(e,...a){this.events[e]&&this.events[e].notify(...a)}scheduleRenderMicrotask(){Un.render(this.render)}}class hs extends ms{constructor(){super(...arguments),this.KeyframeResolver=_n}sortInstanceNodePosition(e,a){return e.compareDocumentPosition(a)&2?1:-1}getBaseTargetFromProps(e,a){const s=e.style;return s?s[a]:void 0}removeValueFromRenderState(e,{vars:a,style:s}){delete a[e],delete s[e]}handleChildMotionValue(){this.childSubscription&&(this.childSubscription(),delete this.childSubscription);const{children:e}=this.props;D(e)&&(this.childSubscription=e.on("change",a=>{this.current&&(this.current.textContent=`${a}`)}))}}function sr({top:t,left:e,right:a,bottom:s}){return{x:{min:e,max:a},y:{min:t,max:s}}}function ir(t,e){if(!e)return t;const a=e({x:t.left,y:t.top}),s=e({x:t.right,y:t.bottom});return{top:a.y,left:a.x,bottom:s.y,right:s.x}}function nr(t,e){return sr(ir(t.getBoundingClientRect(),e))}const rr={x:"translateX",y:"translateY",z:"translateZ",transformPerspective:"perspective"},or=fe.length;function lr(t,e,a){let s="",i=!0;for(let n=0;n<or;n++){const r=fe[n],o=t[r];if(o===void 0)continue;let l=!0;if(typeof o=="number"?l=o===(r.startsWith("scale")?1:0):l=parseFloat(o)===0,!l||a){const c=ps(o,Rt[r]);if(!l){i=!1;const d=rr[r]||r;s+=`${d}(${c}) `}a&&(e[r]=c)}}return s=s.trim(),a?s=a(e,i?"":s):i&&(s="none"),s}function bs(t,e,a){const{style:s,vars:i,transformOrigin:n}=t;let r=!1,o=!1;for(const l in e){const c=e[l];if(me.has(l)){r=!0;continue}else if(ja(l)){i[l]=c;continue}else{const d=ps(c,Rt[l]);l.startsWith("origin")?(o=!0,n[l]=d):s[l]=d}}if(e.transform||(r||a?s.transform=lr(e,t.transform,a):s.transform&&(s.transform="none")),o){const{originX:l="50%",originY:c="50%",originZ:d=0}=n;s.transformOrigin=`${l} ${c} ${d}`}}function xs(t,{style:e,vars:a},s,i){const n=t.style;let r;for(r in e)n[r]=e[r];i?.applyProjectionStyles(n,s);for(r in a)n.setProperty(r,a[r])}function la(t,e){return e.max===e.min?0:t/(e.max-e.min)*100}const ye={correct:(t,e)=>{if(!e.target)return t;if(typeof t=="string")if(h.test(t))t=parseFloat(t);else return t;const a=la(t,e.target.x),s=la(t,e.target.y);return`${a}% ${s}%`}},dr={correct:(t,{treeScale:e,projectionDelta:a})=>{const s=t,i=se.parse(t);if(i.length>5)return s;const n=se.createTransformer(t),r=typeof i[0]!="number"?1:0,o=a.x.scale*e.x,l=a.y.scale*e.y;i[0+r]/=o,i[1+r]/=l;const c=ue(o,l,.5);return typeof i[2+r]=="number"&&(i[2+r]/=c),typeof i[3+r]=="number"&&(i[3+r]/=c),n(i)}},cr={borderRadius:{...ye,applyTo:["borderTopLeftRadius","borderTopRightRadius","borderBottomLeftRadius","borderBottomRightRadius"]},borderTopLeftRadius:ye,borderTopRightRadius:ye,borderBottomLeftRadius:ye,borderBottomRightRadius:ye,boxShadow:dr};function pr(t,{layout:e,layoutId:a}){return me.has(t)||t.startsWith("origin")||(e||a!==void 0)&&(!!cr[t]||t==="opacity")}function vs(t,e,a){const s=t.style,i=e?.style,n={};if(!s)return n;for(const r in s)(D(s[r])||i&&D(i[r])||pr(r,t)||a?.getValue(r)?.liveStyle!==void 0)&&(n[r]=s[r]);return n}function gr(t){return window.getComputedStyle(t)}class ur extends hs{constructor(){super(...arguments),this.type="html",this.renderInstance=xs}readValueFromInstance(e,a){if(me.has(a))return this.projection?.isProjecting?nt(a):ji(e,a);{const s=gr(e),i=(ja(a)?s.getPropertyValue(a):s[a])||0;return typeof i=="string"?i.trim():i}}measureInstanceViewportBox(e,{transformPagePoint:a}){return nr(e,a)}build(e,a,s){bs(e,a,s.transformTemplate)}scrapeMotionValuesFromProps(e,a,s){return vs(e,a,s)}}const fr={offset:"stroke-dashoffset",array:"stroke-dasharray"},mr={offset:"strokeDashoffset",array:"strokeDasharray"};function hr(t,e,a=1,s=0,i=!0){t.pathLength=1;const n=i?fr:mr;t[n.offset]=h.transform(-s);const r=h.transform(e),o=h.transform(a);t[n.array]=`${r} ${o}`}const br=["offsetDistance","offsetPath","offsetRotate","offsetAnchor"];function xr(t,{attrX:e,attrY:a,attrScale:s,pathLength:i,pathSpacing:n=1,pathOffset:r=0,...o},l,c,d){if(bs(t,o,c),l){t.style.viewBox&&(t.attrs.viewBox=t.style.viewBox);return}t.attrs=t.style,t.style={};const{attrs:p,style:u}=t;p.transform&&(u.transform=p.transform,delete p.transform),(u.transform||p.transformOrigin)&&(u.transformOrigin=p.transformOrigin??"50% 50%",delete p.transformOrigin),u.transform&&(u.transformBox=d?.transformBox??"fill-box",delete p.transformBox);for(const m of br)p[m]!==void 0&&(u[m]=p[m],delete p[m]);e!==void 0&&(p.x=e),a!==void 0&&(p.y=a),s!==void 0&&(p.scale=s),i!==void 0&&hr(p,i,n,r,!1)}const ys=new Set(["baseFrequency","diffuseConstant","kernelMatrix","kernelUnitLength","keySplines","keyTimes","limitingConeAngle","markerHeight","markerWidth","numOctaves","targetX","targetY","surfaceScale","specularConstant","specularExponent","stdDeviation","tableValues","viewBox","gradientTransform","pathLength","startOffset","textLength","lengthAdjust"]),vr=t=>typeof t=="string"&&t.toLowerCase()==="svg";function yr(t,e,a,s){xs(t,e,void 0,s);for(const i in e.attrs)t.setAttribute(ys.has(i)?i:Vt(i),e.attrs[i])}function wr(t,e,a){const s=vs(t,e,a);for(const i in t)if(D(t[i])||D(e[i])){const n=fe.indexOf(i)!==-1?"attr"+i.charAt(0).toUpperCase()+i.substring(1):i;s[n]=t[i]}return s}class kr extends hs{constructor(){super(...arguments),this.type="svg",this.isSVGTag=!1,this.measureInstanceViewportBox=$t}getBaseTargetFromProps(e,a){return e[a]}readValueFromInstance(e,a){if(me.has(a)){const s=ds(a);return s&&s.default||0}return a=ys.has(a)?a:Vt(a),e.getAttribute(a)}scrapeMotionValuesFromProps(e,a,s){return wr(e,a,s)}build(e,a,s){xr(e,a,this.isSVGTag,s.transformTemplate,s.style)}renderInstance(e,a,s,i){yr(e,a,s,i)}mount(e){this.isSVGTag=vr(e.tagName),super.mount(e)}}function Er(t,e){return t in e}class Sr extends ms{constructor(){super(...arguments),this.type="object"}readValueFromInstance(e,a){if(Er(a,e)){const s=e[a];if(typeof s=="string"||typeof s=="number")return s}}getBaseTargetFromProps(){}removeValueFromRenderState(e,a){delete a.output[e]}measureInstanceViewportBox(){return $t()}build(e,a){Object.assign(e.output,a)}renderInstance(e,{output:a}){Object.assign(e,a)}sortInstanceNodePosition(){return 0}}function Tr(t,e,a){const s=D(t)?t:Me(t);return s.start(is("",s,e,a)),s.animation}function Pt(t){return typeof t=="object"&&!Array.isArray(t)}function ws(t,e,a,s){return typeof t=="string"&&Pt(e)?qn(t,a,s):t instanceof NodeList?Array.from(t):Array.isArray(t)?t:[t]}function Ar(t,e,a){return t*(e+1)}function da(t,e,a,s){return typeof e=="number"?e:e.startsWith("-")||e.startsWith("+")?Math.max(0,t+parseFloat(e)):e==="<"?a:e.startsWith("<")?Math.max(0,a+parseFloat(e.slice(1))):s.get(e)??t}function Cr(t,e,a){for(let s=0;s<t.length;s++){const i=t[s];i.at>e&&i.at<a&&(va(t,i),s--)}}function Mr(t,e,a,s,i,n){Cr(t,i,n);for(let r=0;r<e.length;r++)t.push({value:e[r],at:ue(i,n,s[r]),easing:Ra(a,r)})}function Ir(t,e){for(let a=0;a<t.length;a++)t[a]=t[a]/(e+1)}function Lr(t,e){return t.at===e.at?t.value===null?1:e.value===null?-1:0:t.at-e.at}const Br="easeInOut";function Vr(t,{defaultTransition:e={},...a}={},s,i){const n=e.duration||.3,r=new Map,o=new Map,l={},c=new Map;let d=0,p=0,u=0;for(let m=0;m<t.length;m++){const x=t[m];if(typeof x=="string"){c.set(x,p);continue}else if(!Array.isArray(x)){c.set(x.name,da(p,x.at,d,c));continue}let[y,v,w={}]=x;w.at!==void 0&&(p=da(p,w.at,d,c));let C=0;const T=(E,b,A,B=0,k=0)=>{const M=Rr(E),{delay:P=0,times:L=Ya(M),type:Z="keyframes",repeat:Q,repeatType:Ht,repeatDelay:qe=0,...he}=b;let{ease:q=e.ease||"easeOut",duration:N}=b;const Re=typeof P=="function"?P(B,k):P,be=M.length,g=Bt(Z)?Z:i?.[Z||"keyframes"];if(be<=2&&g){let j=100;if(be===2&&Dr(M)){const xe=M[1]-M[0];j=Math.abs(xe)}const $e={...he};N!==void 0&&($e.duration=Y(N));const Pe=Wa($e,j,g);q=Pe.ease,N=Pe.duration}N??(N=n);const f=p+Re;L.length===1&&L[0]===0&&(L[1]=1);const S=L.length-M.length;if(S>0&&Ga(L,S),M.length===1&&M.unshift(null),Q){N=Ar(N,Q);const j=[...M],$e=[...L];q=Array.isArray(q)?[...q]:[q];const Pe=[...q];for(let xe=0;xe<Q;xe++){M.push(...j);for(let ve=0;ve<j.length;ve++)L.push($e[ve]+(xe+1)),q.push(ve===0?"linear":Ra(Pe,ve-1))}Ir(L,Q)}const I=f+N;Mr(A,M,q,L,f,I),C=Math.max(Re+N,C),u=Math.max(I,u)};if(D(y)){const E=ca(y,o);T(v,w,pa("default",E))}else{const E=ws(y,v,s,l),b=E.length;for(let A=0;A<b;A++){v=v,w=w;const B=E[A],k=ca(B,o);for(const M in v)T(v[M],$r(w,M),pa(M,k),A,b)}}d=p,p+=C}return o.forEach((m,x)=>{for(const y in m){const v=m[y];v.sort(Lr);const w=[],C=[],T=[];for(let b=0;b<v.length;b++){const{at:A,value:B,easing:k}=v[b];w.push(B),C.push(vt(0,u,A)),T.push(k||"easeOut")}C[0]!==0&&(C.unshift(0),w.unshift(w[0]),T.unshift(Br)),C[C.length-1]!==1&&(C.push(1),w.push(null)),r.has(x)||r.set(x,{keyframes:{},transition:{}});const E=r.get(x);E.keyframes[y]=w,E.transition[y]={...e,duration:u,ease:T,times:C,...a}}}),r}function ca(t,e){return!e.has(t)&&e.set(t,{}),e.get(t)}function pa(t,e){return e[t]||(e[t]=[]),e[t]}function Rr(t){return Array.isArray(t)?t:[t]}function $r(t,e){return t&&t[e]?{...t,...t[e]}:{...t}}const Pr=t=>typeof t=="number",Dr=t=>t.every(Pr);function jr(t){const e={presenceContext:null,props:{},visualState:{renderState:{transform:{},transformOrigin:{},style:{},vars:{},attrs:{}},latestValues:{}}},a=gs(t)&&!Wn(t)?new kr(e):new ur(e);a.mount(t),Ie.set(t,a)}function Or(t){const e={presenceContext:null,props:{},visualState:{renderState:{output:{}},latestValues:{}}},a=new Sr(e);a.mount(t),Ie.set(t,a)}function Fr(t,e){return D(t)||typeof t=="number"||typeof t=="string"&&!Pt(e)}function ks(t,e,a,s){const i=[];if(Fr(t,e))i.push(Tr(t,Pt(e)&&e.default||e,a&&(a.default||a)));else{const n=ws(t,e,s),r=n.length;for(let o=0;o<r;o++){const l=n[o],c=l instanceof Element?jr:Or;Ie.has(l)||c(l);const d=Ie.get(l),p={...a};"delay"in p&&typeof p.delay=="function"&&(p.delay=p.delay(o,r)),i.push(...Rn(d,{...e,transition:p},{}))}}return i}function Hr(t,e,a){const s=[];return Vr(t,e,a,{spring:Ce}).forEach(({keyframes:n,transition:r},o)=>{s.push(...ks(o,n,r))}),s}function Nr(t){return Array.isArray(t)&&t.some(Array.isArray)}function zr(t){function e(a,s,i){let n=[],r;if(Nr(a))n=Hr(a,s,t);else{const{onComplete:l,...c}=i||{};typeof l=="function"&&(r=l),n=ks(a,s,c,t)}const o=new dn(n);return r&&o.finished.then(r),o}return e}const ut=zr();class _r{modal=null;isOpen=!1;open(e,a){if(this.isOpen)return;const s=`
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
        `;document.body.insertAdjacentHTML("beforeend",s),this.modal=document.getElementById("modal-overlay"),this.isOpen=!0,document.body.style.overflow="hidden";const i=document.getElementById("modal-content");i&&ut(i,{opacity:[0,1],transform:["scale(0.9)","scale(1)"]},{duration:.3}),document.getElementById("modal-close")?.addEventListener("click",()=>this.close()),this.modal?.addEventListener("click",r=>{r.target===this.modal&&this.close()});const n=r=>{r.key==="Escape"&&(this.close(),document.removeEventListener("keydown",n))};document.addEventListener("keydown",n)}close(){if(!this.isOpen||!this.modal)return;const e=document.getElementById("modal-content");e&&ut(e,{opacity:0,transform:"scale(0.9)"},{duration:.2}).finished.then(()=>{this.modal?.remove(),this.modal=null,this.isOpen=!1,document.body.style.overflow=""})}}const Dt=new _r;class qr{container;heroEl;designEl;engineEl;constructor(e){if(this.container=document.getElementById(e),!this.container)throw new Error(`HUD container with id ${e} not found`);this.container.innerHTML="",this.heroEl=this.createPhaseElement("hero",`
            <div class="text-center relative">
                <div class="absolute -top-12 left-1/2 -translate-x-1/2 w-[1px] h-8 bg-pagani-gold/50"></div>
                <h1 class="text-5xl md:text-8xl font-black text-white tracking-tight mb-6 glitch-text">AI-POWERED<br><span class="text-pagani-gold">EV INTELLIGENCE</span></h1>
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
             <div class="max-w-2xl absolute right-8 md:right-24 top-1/4 text-right flex flex-col items-end pointer-events-auto">
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
        `;Dt.open(e,"BATTERY HEALTH PREDICTION")}createPhaseElement(e,a){const s=document.createElement("div");return s.id=`phase-${e}`,s.className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 transition-opacity duration-500",s.innerHTML=a,s}setPhaseOpacity(e,a){ut(e,{opacity:a},{duration:.5})}update(e){if(e<.25)this.setPhaseOpacity(this.heroEl,1),this.setPhaseOpacity(this.designEl,0),this.setPhaseOpacity(this.engineEl,0);else if(e>=.25&&e<.35){const a=(e-.25)/.1;this.setPhaseOpacity(this.heroEl,1-a),this.setPhaseOpacity(this.designEl,a),this.setPhaseOpacity(this.engineEl,0)}else if(e>=.35&&e<.6)this.setPhaseOpacity(this.heroEl,0),this.setPhaseOpacity(this.designEl,1),this.setPhaseOpacity(this.engineEl,0);else if(e>=.6&&e<.7){const a=(e-.6)/.1;this.setPhaseOpacity(this.heroEl,0),this.setPhaseOpacity(this.designEl,1-a),this.setPhaseOpacity(this.engineEl,a)}else this.setPhaseOpacity(this.heroEl,0),this.setPhaseOpacity(this.designEl,0),this.setPhaseOpacity(this.engineEl,1)}}const Ur=[{id:"battery-health",icon:"🔋",title:"AI Battery Health Monitoring",description:"Real-time ML-powered battery degradation analysis and predictive maintenance alerts",category:"ai"},{id:"smart-routing",icon:"🗺️",title:"Intelligent Route Optimization",description:"Traffic-aware energy-efficient routing optimized for Indian road conditions",category:"routing"},{id:"energy-prediction",icon:"⚡",title:"Energy Consumption Prediction",description:"ML models predict range based on driving patterns, terrain, and weather",category:"ai"},{id:"fast-charging",icon:"⚡",title:"800V Ultra-Fast Charging",description:"10-80% charge in 18 minutes with advanced thermal management",category:"battery"},{id:"quad-motor",icon:"🏎️",title:"Quad Motor Torque Vectoring",description:"Independent motor control for each wheel delivering unmatched handling",category:"performance"},{id:"range",icon:"🎯",title:"850 KM Range",description:"Solid-state battery technology with graphene enhancement",category:"battery"},{id:"charging-network",icon:"📍",title:"Smart Charging Network",description:"AI-powered charging station recommendations based on availability and pricing",category:"routing"},{id:"performance",icon:"🚀",title:"0-100 in 2.1s",description:"Hypercar-level acceleration with instant torque delivery",category:"performance"}],Wr=[{id:"1",name:"Vikram Singh",role:"Tech Entrepreneur",company:"Mumbai",content:"The AI-powered battery management is a game-changer. I drive 200km daily and the range prediction is incredibly accurate.",rating:5,image:"/images/testimonials/1.jpg"},{id:"2",name:"Ananya Desai",role:"Business Executive",company:"Bangalore",content:"Smart routing saves me 30 minutes daily on my commute. The traffic-aware navigation is brilliant for Indian roads.",rating:5,image:"/images/testimonials/2.jpg"},{id:"3",name:"Rahul Kapoor",role:"Automotive Journalist",company:"Delhi",content:"This is not just an EV, it's a technological masterpiece. The performance rivals any hypercar I've driven.",rating:5,image:"/images/testimonials/3.jpg"}];class Ve{observer;constructor(e=.1){this.observer=new IntersectionObserver(a=>{a.forEach(s=>{s.isIntersecting&&s.target.classList.add("animate-in")})},{threshold:e})}observe(e){this.observer.observe(e)}observeAll(e){document.querySelectorAll(e).forEach(s=>this.observe(s))}disconnect(){this.observer.disconnect()}}function Kr(t,e,a,s=2e3,i=""){const n=Date.now(),r=()=>{const o=Date.now()-n,l=Math.min(o/s,1),c=1-Math.pow(1-l,3),d=Math.floor(e+(a-e)*c);t.textContent=d.toLocaleString()+i,l<1&&requestAnimationFrame(r)};r()}async function Gr(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
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
                    ${Ur.map((o,l)=>`
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
                    ${Wr.map((o,l)=>`
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
    `;const e=new $s("zonda-canvas",241),a=new qr("zonda-hud"),s=document.querySelector("#scroll-container"),i=()=>{if(!s)return;const o=s.getBoundingClientRect(),l=window.innerHeight,d=s.offsetHeight-l,p=-o.top,u=Math.min(1,Math.max(0,p/d));e.update(u),a.update(u)};window.addEventListener("scroll",i,{passive:!0}),i(),new Ve(.1).observeAll(".fade-in-section");const r=new IntersectionObserver(o=>{o.forEach(l=>{if(l.isIntersecting){const c=l.target,d=parseFloat(c.dataset.counter||"0"),p=c.dataset.counter?.includes(".")?"s":"";Kr(c,0,d,2e3,p),r.unobserve(c)}})});document.querySelectorAll("[data-counter]").forEach(o=>{r.observe(o)})}const Yr=[{id:"ceo",name:"Karthik Janardhan",role:"CEO & Founder",image:"/images/ceo.jpg"},{id:"cto",name:"Anushka Kotal",role:"CTO",image:"/images/cto.jpg"},{id:"design",name:"Stash Lopes",role:"Head of Design",image:"/images/design.jpg"},{id:"engineering",name:"Ashwin Vincent Koonissery",role:"Chief Engineer",image:"/images/engineering.jpg"}];async function Xr(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
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
                    ${Yr.map((a,s)=>`
                        <div class="fade-in-section group" style="animation-delay: ${s*100}ms">
                            <div class="relative overflow-hidden mb-6 aspect-square bg-gradient-to-br from-pagani-gold/20 to-transparent border border-pagani-gold/30 group">
                                <img src="${a.image}" alt="${a.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                                <div class="absolute inset-0 bg-gradient-to-t from-pagani-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <h3 class="text-xl font-orbitron font-bold mb-1 group-hover:text-pagani-gold transition-colors">${a.name}</h3>
                            <div class="text-pagani-gold text-sm mb-3 uppercase tracking-wider">${a.role}</div>
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
                    ${[{icon:"🚀",title:"Innovation First",desc:"Pushing boundaries with AI and cutting-edge technology"},{icon:"🌱",title:"Sustainability",desc:"Building a cleaner, greener future for India"},{icon:"🎯",title:"Performance",desc:"Never compromising on speed, range, or reliability"}].map((a,s)=>`
                        <div class="fade-in-section text-center p-8 border border-white/10 hover:border-pagani-gold/50 transition-all" style="animation-delay: ${s*100}ms">
                            <div class="text-6xl mb-6">${a.icon}</div>
                            <h3 class="text-2xl font-orbitron font-bold mb-4">${a.title}</h3>
                            <p class="text-gray-400 leading-relaxed">${a.desc}</p>
                        </div>
                    `).join("")}
                </div>
            </div>
        </section>
    `,new Ve(.1).observeAll(".fade-in-section")}const Jr=[{category:"Performance",specs:[{label:"0-100 km/h",value:"2.1 seconds"},{label:"Top Speed",value:"350 km/h"},{label:"Power Output",value:"1,400 kW (1,877 HP)"},{label:"Torque",value:"2,300 Nm"},{label:"Drive Type",value:"Quad Motor AWD"}]},{category:"Battery & Range",specs:[{label:"Battery Capacity",value:"120 kWh"},{label:"Battery Type",value:"Solid-State Graphene"},{label:"Range (WLTP)",value:"850 km"},{label:"Charging",value:"800V Architecture"},{label:"10-80% Charge Time",value:"18 minutes"}]},{category:"Dimensions & Weight",specs:[{label:"Length",value:"4,650 mm"},{label:"Width",value:"2,050 mm"},{label:"Height",value:"1,150 mm"},{label:"Wheelbase",value:"2,750 mm"},{label:"Dry Weight",value:"1,150 kg"}]},{category:"AI & Technology",specs:[{label:"AI Processor",value:"NVIDIA Drive Orin"},{label:"Sensors",value:"12 Cameras, 8 Radars, 4 LiDAR"},{label:"Connectivity",value:"5G, V2X"},{label:"OTA Updates",value:"Full Stack"},{label:"Autonomous Level",value:"Level 3"}]}];async function Zr(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
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
                            ${["Real-time State of Health (SOH) monitoring","Predictive maintenance alerts","Adaptive charging optimization","Temperature-aware battery management","Driving pattern analysis"].map(s=>`
                                <li class="flex items-start gap-3">
                                    <span class="text-pagani-gold mt-1">▸</span>
                                    <span class="text-gray-300">${s}</span>
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
                            ${["Real-time traffic integration","Elevation-aware energy calculation","Dynamic charging station recommendations","Weather-adjusted range prediction","Multi-destination optimization"].map(s=>`
                                <li class="flex items-start gap-3">
                                    <span class="text-pagani-gold mt-1">▸</span>
                                    <span class="text-gray-300">${s}</span>
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
                    ${Jr.map((s,i)=>`
                        <div class="fade-in-section bg-pagani-black border border-white/10 p-8" style="animation-delay: ${i*100}ms">
                            <h3 class="text-2xl font-orbitron font-bold text-pagani-gold mb-6 uppercase tracking-wider">${s.category}</h3>
                            <div class="space-y-4">
                                ${s.specs.map(n=>`
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
                    ${[{title:"Solid-State Battery",desc:"Graphene-enhanced solid-state cells delivering 850km range with superior safety and longevity",icon:"⚡"},{title:"Quad Motor System",desc:"Independent motor control for each wheel enabling precise torque vectoring and unmatched handling",icon:"🏎️"},{title:"800V Architecture",desc:"Ultra-fast charging capability with advanced thermal management for optimal performance",icon:"🔌"}].map((s,i)=>`
                        <div class="fade-in-section bg-gradient-to-br from-pagani-gold/5 to-transparent border border-pagani-gold/30 p-8 hover:border-pagani-gold transition-all group" style="animation-delay: ${i*100}ms">
                            <div class="text-6xl mb-6 group-hover:scale-110 transition-transform">${s.icon}</div>
                            <h3 class="text-2xl font-orbitron font-bold mb-4 group-hover:text-pagani-gold transition-colors">${s.title}</h3>
                            <p class="text-gray-400 leading-relaxed">${s.desc}</p>
                        </div>
                    `).join("")}
                </div>
            </div>
        </section>
    `,new Ve(.1).observeAll(".fade-in-section");const a=document.getElementById("battery-health-title");a&&a.addEventListener("click",Qr)}function Qr(){const t=`
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
    `;Dt.open(t,"BATTERY HEALTH PREDICTION")}class Es{rules=new Map;addRule(e,a){this.rules.set(e,a)}validate(e){const a=[];return this.rules.forEach((s,i)=>{const n=e.get(i)||"",r=this.validateField(i,n,s);a.push(...r)}),{isValid:a.length===0,errors:a}}validateField(e,a,s){const i=[];return s.required&&!a.trim()?(i.push(`${this.formatFieldName(e)} is required`),i):(a&&s.email&&!this.isValidEmail(a)&&i.push(`${this.formatFieldName(e)} must be a valid email address`),a&&s.phone&&!this.isValidPhone(a)&&i.push(`${this.formatFieldName(e)} must be a valid phone number`),a&&s.minLength&&a.length<s.minLength&&i.push(`${this.formatFieldName(e)} must be at least ${s.minLength} characters`),a&&s.maxLength&&a.length>s.maxLength&&i.push(`${this.formatFieldName(e)} must not exceed ${s.maxLength} characters`),a&&s.pattern&&!s.pattern.test(a)&&i.push(`${this.formatFieldName(e)} format is invalid`),a&&s.custom&&!s.custom(a)&&i.push(`${this.formatFieldName(e)} is invalid`),i)}isValidEmail(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}isValidPhone(e){return/^[\d\s\-\+\(\)]+$/.test(e)&&e.replace(/\D/g,"").length>=10}formatFieldName(e){return e.split(/[-_]/).map(a=>a.charAt(0).toUpperCase()+a.slice(1)).join(" ")}}async function eo(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
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
                        ${[{city:"Mumbai",address:"Bandra Kurla Complex, Mumbai 400051",phone:"+91 22 1234 5678",email:"mumbai@evbharat.com"},{city:"Bangalore",address:"Koramangala, Bangalore 560095",phone:"+91 80 1234 5678",email:"bangalore@evbharat.com"},{city:"Delhi",address:"Connaught Place, New Delhi 110001",phone:"+91 11 1234 5678",email:"delhi@evbharat.com"}].map(i=>`
                            <div class="bg-gradient-to-br from-pagani-gold/5 to-transparent border border-pagani-gold/30 p-6">
                                <h3 class="text-xl font-orbitron font-bold text-pagani-gold mb-4">${i.city}</h3>
                                <div class="space-y-3 text-gray-300">
                                    <div class="flex items-start gap-3">
                                        <span class="text-pagani-gold mt-1">📍</span>
                                        <span>${i.address}</span>
                                    </div>
                                    <div class="flex items-start gap-3">
                                        <span class="text-pagani-gold mt-1">📞</span>
                                        <a href="tel:${i.phone}" class="hover:text-pagani-gold transition-colors">${i.phone}</a>
                                    </div>
                                    <div class="flex items-start gap-3">
                                        <span class="text-pagani-gold mt-1">✉️</span>
                                        <a href="mailto:${i.email}" class="hover:text-pagani-gold transition-colors">${i.email}</a>
                                    </div>
                                </div>
                            </div>
                        `).join("")}

                        <!-- Social Media -->
                        <div class="border-t border-white/10 pt-8">
                            <h3 class="text-xl font-orbitron font-bold mb-4">FOLLOW US</h3>
                            <div class="flex gap-4">
                                ${["Twitter","LinkedIn","Instagram","YouTube"].map(i=>`
                                    <a href="#" class="w-12 h-12 border border-white/20 hover:border-pagani-gold flex items-center justify-center transition-colors group">
                                        <span class="text-white group-hover:text-pagani-gold text-xs">${i.slice(0,2)}</span>
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
                    ${[{q:"What is EV Bharat?",a:"EV Bharat is an intelligent Vehicle‑to‑Everything (V2E) safety and communication platform that enhances road safety using predictive battery monitoring, accident detection, and secure Visible Light Communication (VLC) technology."},{q:"How is EV Bharat different from existing EV systems?",a:"Unlike conventional EV systems that focus only on navigation or battery monitoring, EV Bharat integrates accident detection, predictive battery alerts, secure vehicle communication, and emergency response into one unified platform."},{q:"How does EV Bharat improve road safety?",a:"The system detects accidents and critical situations in real time and generates immediate alerts. It can broadcast distress signals to nearby vehicles and initiate emergency escalation if assistance is not received."},{q:"Is EV Bharat secure?",a:"Yes. The system uses light-based communication and secure embedded processing, reducing vulnerability to traditional RF-based cyber threats."},{q:"How does the battery prediction feature help drivers?",a:"The system predicts battery status and provides early warnings before critical depletion, helping drivers plan routes efficiently and reduce range anxiety."},{q:"Can EV Bharat be integrated into existing vehicles?",a:"Yes. The platform is designed to be modular and can be integrated into EVs through embedded hardware and software modules."},{q:"What is the long-term vision of EV Bharat?",a:"To build a secure, intelligent, and scalable V2E ecosystem that enhances autonomous decision-making, improves road safety, and supports the future of smart mobility."}].map((i,n)=>`
                        <div class="fade-in-section faq-item border border-white/10 hover:border-pagani-gold/50 transition-all" style="animation-delay: ${n*50}ms">
                            <button class="faq-question w-full text-left p-6 flex justify-between items-center">
                                <span class="font-orbitron font-bold text-lg">${i.q}</span>
                                <span class="text-pagani-gold text-2xl faq-icon">+</span>
                            </button>
                            <div class="faq-answer hidden px-6 pb-6 text-gray-400 leading-relaxed">
                                ${i.a}
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
        </section>
    `;const e=new Es;e.addRule("name",{required:!0,minLength:2}),e.addRule("email",{required:!0,email:!0}),e.addRule("phone",{phone:!0}),e.addRule("subject",{required:!0}),e.addRule("message",{required:!0,minLength:10});const a=document.getElementById("contact-form");a?.addEventListener("submit",i=>{i.preventDefault();const n=new FormData(a),r=e.validate(n);r.isValid?(alert("Thank you for your message! We will get back to you soon. 🎉"),a.reset()):alert(r.errors.join(`
`))}),document.querySelectorAll(".faq-question").forEach(i=>{i.addEventListener("click",()=>{const r=i.parentElement?.querySelector(".faq-answer"),o=i.querySelector(".faq-icon");r?.classList.contains("hidden")?(r.classList.remove("hidden"),o&&(o.textContent="−")):(r?.classList.add("hidden"),o&&(o.textContent="+"))})}),new Ve(.1).observeAll(".fade-in-section")}const ga=[{id:1,category:"exterior",title:"Front View",description:"Aggressive front fascia with LED headlights",src:"/images/gallery/ev_car_front_1768921597944.png"},{id:2,category:"exterior",title:"Side Profile - Black",description:"Midnight black with aerodynamic design",src:"/images/gallery/ev_car_side_black_1768921527957.png"},{id:3,category:"exterior",title:"Side Profile - Gold",description:"Pagani gold metallic finish",src:"/images/gallery/ev_car_side_gold_1768921550995.png"},{id:4,category:"exterior",title:"Side Profile - White",description:"Arctic white with carbon fiber accents",src:"/images/gallery/ev_car_side_white_1768921572922.png"},{id:5,category:"exterior",title:"Rear View",description:"Integrated LED light bar and diffuser",src:"/images/gallery/ev_car_rear_1768921622132.png"},{id:6,category:"interior",title:"Dashboard",description:"Minimalist digital cockpit with OLED displays",src:"/images/gallery/ev_car_interior_dashboard_1768921641324.png"},{id:7,category:"technology",title:"Front Design",description:"Advanced aerodynamics and LED technology",src:"/images/gallery/ev_car_front_1768921597944.png"},{id:8,category:"technology",title:"Rear Technology",description:"Active aero and thermal management",src:"/images/gallery/ev_car_rear_1768921622132.png"},{id:9,category:"interior",title:"Cockpit View",description:"Driver-focused interior design",src:"/images/gallery/ev_car_interior_dashboard_1768921641324.png"}];async function to(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
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
                    ${ga.map((n,r)=>`
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
    `;const e=document.querySelectorAll(".filter-btn"),a=document.querySelectorAll(".gallery-item"),s=document.getElementById("no-results");e.forEach(n=>{n.addEventListener("click",()=>{e.forEach(l=>{l.classList.remove("active","bg-pagani-gold","text-black"),l.classList.add("border-white/20")}),n.classList.add("active","bg-pagani-gold","text-black"),n.classList.remove("border-white/20");const r=n.getAttribute("data-filter");let o=0;a.forEach(l=>{const c=l.getAttribute("data-category");r==="all"||c===r?(l.classList.remove("hidden"),o++):l.classList.add("hidden")}),o===0?s?.classList.remove("hidden"):s?.classList.add("hidden")})}),a.forEach(n=>{n.addEventListener("click",()=>{const r=n.getAttribute("data-id"),o=ga.find(l=>l.id===parseInt(r||"0"));if(o){const l=`
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
                `;Dt.open(l)}})}),new Ve(.1).observeAll(".fade-in-section")}function Ss(t){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)}function Ts(t){return t.length>=8}async function ao(){const t=document.getElementById("app");if(t){if(!document.querySelector('link[href*="font-awesome"]')){const e=document.createElement("link");e.rel="stylesheet",e.href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",document.head.appendChild(e)}t.innerHTML=`
        <!-- Auth Page with Video Background - Ledgerly Inspired -->
        <style>
            .bg-video {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                z-index: -2;
                filter: brightness(0.3);
            }
            
            .auth-container {
                position: relative;
                width: 100%;
                max-width: 900px;
                min-height: 520px;
                background: linear-gradient(135deg, rgba(20, 20, 20, 0.95), rgba(10, 10, 10, 0.98));
                border-radius: 20px;
                box-shadow: 0 25px 80px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(212, 175, 55, 0.2);
                overflow: hidden;
                backdrop-filter: blur(20px);
            }
            
            .form-container {
                position: absolute;
                width: 50%;
                height: 100%;
                padding: 40px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                transition: all 0.6s ease-in-out;
            }
            
            .login-container {
                left: 0;
                opacity: 1;
                z-index: 2;
            }
            
            .register-container {
                left: 0;
                opacity: 0;
                z-index: 1;
            }
            
            .overlay-container {
                position: absolute;
                top: 0;
                left: 50%;
                width: 50%;
                height: 100%;
                overflow: hidden;
                transition: transform 0.6s ease-in-out;
                z-index: 10;
            }
            
            .overlay {
                position: relative;
                background: linear-gradient(135deg, #d4af37, #f5d67b, #d4af37);
                height: 100%;
                width: 200%;
                left: -100%;
                transform: translateX(0);
                transition: transform 0.6s ease-in-out;
            }
            
            .overlay-panel {
                position: absolute;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 40px;
                height: 100%;
                width: 50%;
                transform: translateX(0);
                transition: transform 0.6s ease-in-out;
            }
            
            .overlay-left {
                transform: translateX(-20%);
            }
            
            .overlay-right {
                right: 0;
                transform: translateX(0);
            }
            
            /* Active state - Register mode */
            .auth-container.right-panel-active .login-container {
                transform: translateX(100%);
                opacity: 0;
                z-index: 1;
            }
            
            .auth-container.right-panel-active .register-container {
                transform: translateX(100%);
                opacity: 1;
                z-index: 5;
            }
            
            .auth-container.right-panel-active .overlay-container {
                transform: translateX(-100%);
            }
            
            .auth-container.right-panel-active .overlay {
                transform: translateX(50%);
            }
            
            .auth-container.right-panel-active .overlay-left {
                transform: translateX(0);
            }
            
            .auth-container.right-panel-active .overlay-right {
                transform: translateX(20%);
            }
            
            .ghost-btn {
                background-color: transparent;
                border: 2px solid #000;
                color: #000;
                padding: 12px 45px;
                font-size: 12px;
                font-weight: bold;
                letter-spacing: 1px;
                text-transform: uppercase;
                transition: all 0.3s ease;
                cursor: pointer;
                border-radius: 8px;
            }
            
            .ghost-btn:hover {
                background-color: #000;
                color: #d4af37;
            }
            
            .form-input {
                width: 100%;
                padding: 14px 16px;
                background: rgba(40, 40, 40, 0.8);
                border: 1px solid rgba(212, 175, 55, 0.3);
                border-radius: 8px;
                color: white;
                font-size: 14px;
                transition: all 0.3s ease;
                outline: none;
            }
            
            .form-input:focus {
                border-color: #d4af37;
                box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
            }
            
            .form-input::placeholder {
                color: rgba(255, 255, 255, 0.4);
            }
            
            .submit-btn {
                width: 100%;
                padding: 14px;
                background: linear-gradient(135deg, #d4af37, #f5d67b);
                border: none;
                border-radius: 8px;
                color: #000;
                font-weight: bold;
                font-size: 14px;
                letter-spacing: 1px;
                text-transform: uppercase;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .submit-btn:hover {
                box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4);
                transform: translateY(-2px);
            }
            
            .form-control {
                position: relative;
                margin-bottom: 16px;
            }
            
            .form-control small {
                color: #ef4444;
                font-size: 11px;
                position: absolute;
                bottom: -18px;
                left: 0;
            }
            
            .form-hint {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.4);
                margin-top: 4px;
            }
            
            .form-status {
                padding: 12px;
                border-radius: 8px;
                font-size: 13px;
                margin-bottom: 16px;
                text-align: center;
                display: none;
            }
            
            .form-status.show {
                display: block;
            }
            
            .form-status.success {
                background: rgba(34, 197, 94, 0.2);
                border: 1px solid rgba(34, 197, 94, 0.5);
                color: #22c55e;
            }
            
            .form-status.error {
                background: rgba(239, 68, 68, 0.2);
                border: 1px solid rgba(239, 68, 68, 0.5);
                color: #ef4444;
            }
            
            /* Mobile styles */
            @media (max-width: 768px) {
                .auth-container {
                    max-width: 100%;
                    min-height: auto;
                    border-radius: 16px;
                    margin: 16px;
                }
                
                .form-container {
                    position: relative;
                    width: 100%;
                    padding: 30px 24px;
                }
                
                .register-container {
                    display: none;
                }
                
                .register-container.active {
                    display: flex;
                }
                
                .login-container.hidden {
                    display: none;
                }
                
                .overlay-container {
                    display: none;
                }
            }
        </style>
        
        <!-- Video Background -->
        <video autoplay muted loop playsinline class="bg-video" id="bgVideo">
            <source src="/videos/ev-background.mp4" type="video/mp4" />
        </video>
        
        <!-- Fallback animated background if video fails -->
        <div class="fixed inset-0 z-[-1]">
            <div class="absolute inset-0 bg-gradient-to-br from-pagani-black via-gray-900 to-pagani-black"></div>
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,175,55,0.15),transparent_50%)]"></div>
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(212,175,55,0.1),transparent_50%)]"></div>
            <div class="absolute top-20 left-20 w-72 h-72 bg-pagani-gold/5 rounded-full blur-3xl animate-pulse"></div>
            <div class="absolute bottom-20 right-20 w-96 h-96 bg-pagani-gold/5 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>
        </div>

        <div class="min-h-screen flex items-center justify-center px-4 py-12">
            <div class="auth-container" id="authContainer">
                <!-- Login Form -->
                <div class="form-container login-container" id="loginContainer">
                    <form id="loginForm" novalidate>
                        <h1 class="text-2xl font-orbitron font-bold text-white mb-2">Welcome Back</h1>
                        <p class="text-gray-400 text-sm mb-6">Sign in to access your EV dashboard</p>
                        
                        <div id="login-status" class="form-status"></div>
                        
                        <div class="form-control">
                            <input type="email" id="login-email" class="form-input" placeholder="Email or Username" required />
                            <small id="login-email-error"></small>
                        </div>
                        
                        <div class="form-control">
                            <div class="relative">
                                <input type="password" id="login-password" class="form-input pr-12" placeholder="Password (min 8 characters)" minlength="8" required />
                                <button type="button" class="toggle-password absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pagani-gold transition-colors">
                                    <i class="fa-solid fa-eye"></i>
                                </button>
                            </div>
                            <small id="login-password-error"></small>
                            <div class="form-hint">Use at least 8 characters.</div>
                        </div>
                        
                        <div class="flex items-center justify-between mb-6">
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" id="remember-me" class="w-4 h-4 accent-pagani-gold rounded" />
                                <span class="text-sm text-gray-400">Remember me</span>
                            </label>
                            <a href="#" class="text-sm text-pagani-gold hover:underline">Forgot password?</a>
                        </div>
                        
                        <button type="submit" class="submit-btn">
                            <i class="fa-solid fa-right-to-bracket mr-2"></i> Login
                        </button>
                        
                        <!-- Mobile Register Link -->
                        <div class="md:hidden text-center mt-6 pt-6 border-t border-pagani-gold/20">
                            <p class="text-gray-400 text-sm mb-2">Don't have an account?</p>
                            <button type="button" id="showRegisterMobile" class="text-pagani-gold font-orbitron font-bold uppercase text-sm">
                                Register <i class="fa-solid fa-arrow-right ml-1"></i>
                            </button>
                        </div>
                    </form>
                </div>
                
                <!-- Register Form -->
                <div class="form-container register-container" id="registerContainer">
                    <form id="registerForm" novalidate>
                        <h1 class="text-2xl font-orbitron font-bold text-white mb-2">Join EVBharat</h1>
                        <p class="text-gray-400 text-sm mb-6">Create your account to get started</p>
                        
                        <div id="register-status" class="form-status"></div>
                        
                        <div class="form-control">
                            <input type="text" id="register-name" class="form-input" placeholder="Full Name" required />
                            <small id="register-name-error"></small>
                        </div>
                        
                        <div class="form-control">
                            <input type="email" id="register-email" class="form-input" placeholder="Email" required />
                            <small id="register-email-error"></small>
                        </div>
                        
                        <div class="form-control">
                            <div class="relative">
                                <input type="password" id="register-password" class="form-input pr-12" placeholder="Password (min 8 characters)" minlength="8" required />
                                <button type="button" class="toggle-password absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pagani-gold transition-colors">
                                    <i class="fa-solid fa-eye"></i>
                                </button>
                            </div>
                            <small id="register-password-error"></small>
                            <!-- Password Strength -->
                            <div class="mt-2 flex items-center gap-2">
                                <div class="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden flex gap-1">
                                    <div class="strength-bar flex-1 h-full bg-gray-600 rounded-full transition-all"></div>
                                    <div class="strength-bar flex-1 h-full bg-gray-600 rounded-full transition-all"></div>
                                    <div class="strength-bar flex-1 h-full bg-gray-600 rounded-full transition-all"></div>
                                    <div class="strength-bar flex-1 h-full bg-gray-600 rounded-full transition-all"></div>
                                </div>
                                <span class="strength-text text-xs text-gray-400 w-14 text-right">Weak</span>
                            </div>
                        </div>
                        
                        <div class="form-control">
                            <input type="password" id="register-confirm" class="form-input" placeholder="Confirm Password" minlength="8" required />
                            <small id="register-confirm-error"></small>
                        </div>
                        
                        <label class="flex items-start gap-2 cursor-pointer mb-4">
                            <input type="checkbox" id="terms-checkbox" class="w-4 h-4 accent-pagani-gold rounded mt-1" required />
                            <span class="text-xs text-gray-400 leading-relaxed">
                                I agree to the <a href="#" class="text-pagani-gold hover:underline">Terms of Service</a> and <a href="#" class="text-pagani-gold hover:underline">Privacy Policy</a>
                            </span>
                        </label>
                        
                        <button type="submit" class="submit-btn">
                            <i class="fa-solid fa-user-plus mr-2"></i> Register
                        </button>
                        
                        <!-- Mobile Login Link -->
                        <div class="md:hidden text-center mt-6 pt-6 border-t border-pagani-gold/20">
                            <p class="text-gray-400 text-sm mb-2">Already have an account?</p>
                            <button type="button" id="showLoginMobile" class="text-pagani-gold font-orbitron font-bold uppercase text-sm">
                                <i class="fa-solid fa-arrow-left mr-1"></i> Login
                            </button>
                        </div>
                    </form>
                </div>
                
                <!-- Sliding Overlay -->
                <div class="overlay-container">
                    <div class="overlay">
                        <!-- Left Panel - Show on Register -->
                        <div class="overlay-panel overlay-left">
                            <h1 class="text-3xl font-orbitron font-bold text-black mb-2">
                                EV<span class="text-white">BHARAT</span>
                            </h1>
                            <p class="text-black/70 italic mb-4">AI-Powered EV Intelligence</p>
                            <p class="text-black/80 text-sm mb-6 max-w-xs">Already have an account? Login to access your EV dashboard and manage your vehicles.</p>
                            <button type="button" class="ghost-btn" id="showLogin">
                                <i class="fa-solid fa-arrow-left mr-2"></i> Login
                            </button>
                        </div>
                        
                        <!-- Right Panel - Show on Login -->
                        <div class="overlay-panel overlay-right">
                            <h1 class="text-3xl font-orbitron font-bold text-black mb-2">
                                EV<span class="text-white">BHARAT</span>
                            </h1>
                            <p class="text-black/70 italic mb-4">AI-Powered EV Intelligence</p>
                            <p class="text-black/80 text-sm mb-6 max-w-xs">Don't have an account? Join EVBharat and start your journey with intelligent EV management.</p>
                            <button type="button" class="ghost-btn" id="showRegister">
                                Register <i class="fa-solid fa-arrow-right ml-2"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Back to Home -->
        <a href="/" class="fixed top-24 left-4 md:left-8 text-sm text-gray-400 hover:text-pagani-gold transition-colors z-50">
            <i class="fa-solid fa-arrow-left mr-1"></i> Back to Home
        </a>
    `,setTimeout(()=>{so()},100)}}function so(){const t=document.getElementById("authContainer"),e=document.getElementById("showRegister"),a=document.getElementById("showLogin"),s=document.getElementById("showRegisterMobile"),i=document.getElementById("showLoginMobile"),n=document.getElementById("loginContainer"),r=document.getElementById("registerContainer");e?.addEventListener("click",()=>{t?.classList.add("right-panel-active")}),a?.addEventListener("click",()=>{t?.classList.remove("right-panel-active")}),s?.addEventListener("click",()=>{n?.classList.add("hidden"),r?.classList.add("active")}),i?.addEventListener("click",()=>{n?.classList.remove("hidden"),r?.classList.remove("active")}),document.getElementById("useDemoBtn")?.addEventListener("click",()=>{t?.classList.remove("right-panel-active"),n?.classList.remove("hidden"),r?.classList.remove("active");const u=H.getDefaultCredentials(),m=document.getElementById("login-email"),x=document.getElementById("login-password"),y=document.getElementById("login-status");if(!u){ce(y,"Demo account is not configured.","error");return}m&&x&&(m.value=u.email,x.value=u.password,m.classList.add("border-pagani-gold"),x.classList.add("border-pagani-gold"),setTimeout(()=>{m.classList.remove("border-pagani-gold"),x.classList.remove("border-pagani-gold")},1e3))}),document.querySelectorAll(".toggle-password").forEach(u=>{u.addEventListener("click",m=>{m.preventDefault();const x=u.parentElement;if(x){const y=x.querySelector("input");if(y){const v=y.type==="password";y.type=v?"text":"password";const w=u.querySelector("i");w&&(w.className=v?"fa-solid fa-eye-slash":"fa-solid fa-eye")}}})});const c=document.getElementById("register-password");c?.addEventListener("input",()=>{io(c.value)});const d=document.getElementById("loginForm"),p=document.getElementById("registerForm");d?.addEventListener("submit",u=>{u.preventDefault(),no()}),p?.addEventListener("submit",u=>{u.preventDefault(),ro()}),location.hash==="#register"&&(t?.classList.add("right-panel-active"),n?.classList.add("hidden"),r?.classList.add("active"))}function io(t){let e=0;t.length>=8&&e++,t.match(/[a-z]/)&&t.match(/[A-Z]/)&&e++,t.match(/\d/)&&e++,t.match(/[@$!%*?&#]/)&&e++;const a=document.querySelectorAll(".strength-bar"),s=document.querySelector(".strength-text"),i=["bg-red-500","bg-orange-500","bg-yellow-500","bg-green-500"],n=["Weak","Fair","Good","Strong"];a.forEach((r,o)=>{r.classList.remove("bg-red-500","bg-orange-500","bg-yellow-500","bg-green-500","bg-gray-600"),o<e?r.classList.add(i[e-1]):r.classList.add("bg-gray-600")}),s&&(s.textContent=e>0?n[e-1]:"Weak",s.className="strength-text text-xs w-14 text-right "+(e===0||e===1?"text-red-400":e===2?"text-orange-400":e===3?"text-yellow-400":"text-green-400"))}function U(t,e){t&&(t.textContent=e,t.style.display="block")}function ft(t){t&&(t.textContent="",t.style.display="none")}function ce(t,e,a){t&&(t.textContent=e,t.className=`form-status show ${a}`)}async function no(){const t=document.getElementById("login-email"),e=document.getElementById("login-password"),a=document.getElementById("login-email-error"),s=document.getElementById("login-password-error"),i=document.getElementById("login-status");let n=!0;if(ft(a),ft(s),i&&(i.className="form-status"),t.value.trim()?Ss(t.value)||(U(a,"Please enter a valid email"),n=!1):(U(a,"Email is required"),n=!1),e.value.trim()?Ts(e.value)||(U(s,"Password must be at least 8 characters"),n=!1):(U(s,"Password is required"),n=!1),!n)return;const r=await H.login(t.value,e.value);r.success?(ce(i,"Login successful! Redirecting...","success"),setTimeout(()=>{window.location.href="/dashboard"},1500)):ce(i,r.message,"error")}async function ro(){const t=document.getElementById("register-name"),e=document.getElementById("register-email"),a=document.getElementById("register-password"),s=document.getElementById("register-confirm"),i=document.getElementById("terms-checkbox"),n=document.getElementById("register-name-error"),r=document.getElementById("register-email-error"),o=document.getElementById("register-password-error"),l=document.getElementById("register-confirm-error"),c=document.getElementById("register-status");let d=!0;if([n,r,o,l].forEach(ft),c&&(c.className="form-status"),t.value.trim()||(U(n,"Name is required"),d=!1),e.value.trim()?Ss(e.value)||(U(r,"Please enter a valid email"),d=!1):(U(r,"Email is required"),d=!1),a.value.trim()?Ts(a.value)||(U(o,"Password must be at least 8 characters"),d=!1):(U(o,"Password is required"),d=!1),a.value!==s.value&&(U(l,"Passwords do not match"),d=!1),i.checked||(ce(c,"Please accept the Terms of Service","error"),d=!1),!d)return;const p=await H.signup(t.value,e.value,a.value);p.success?(ce(c,"Registration successful! Redirecting...","success"),setTimeout(()=>{window.location.href="/dashboard"},1500)):ce(c,p.message,"error")}async function oo(){if(!H.isAuthenticated()){window.location.href="/auth";return}const t=document.getElementById("app");if(!t)return;const e=H.getCurrentUser();if(!document.querySelector('link[href*="font-awesome"]')){const a=document.createElement("link");a.rel="stylesheet",a.href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",document.head.appendChild(a)}t.innerHTML=`
        <!-- Dashboard Page -->
        <div class="min-h-screen bg-pagani-black pt-24 pb-12">
            <!-- Header Section -->
            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 fade-in-section">
                    <div>
                        <p class="text-pagani-gold text-sm uppercase tracking-wider mb-1">Welcome back</p>
                        <h1 class="text-3xl md:text-4xl font-orbitron font-bold">${e?.name||"User"}</h1>
                        <p class="text-gray-400 mt-1">Your AI-Powered EV Intelligence Hub</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg">
                            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span class="text-sm text-green-400 font-orbitron">VEHICLE ONLINE</span>
                        </div>
                        <button id="refresh-dashboard" class="px-4 py-2 bg-pagani-gold/20 border border-pagani-gold/50 rounded-lg text-pagani-gold hover:bg-pagani-gold hover:text-black transition-all">
                            <i class="fa-solid fa-refresh"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Quick Stats -->
            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <!-- Battery Status -->
                    <a href="/battery" class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-5 fade-in-section hover:border-pagani-gold/50 transition-all group cursor-pointer">
                        <div class="flex items-center justify-between mb-3">
                            <i class="fa-solid fa-car-battery text-2xl text-green-400 group-hover:scale-110 transition-transform"></i>
                            <span class="text-xs text-gray-400 uppercase">Battery</span>
                        </div>
                        <p class="text-3xl font-orbitron font-bold text-green-400">87%</p>
                        <p class="text-xs text-gray-400 mt-1">State of Charge</p>
                        <div class="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div class="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style="width: 87%"></div>
                        </div>
                    </a>

                    <!-- Range -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-5 fade-in-section" style="animation-delay: 50ms">
                        <div class="flex items-center justify-between mb-3">
                            <i class="fa-solid fa-road text-2xl text-blue-400"></i>
                            <span class="text-xs text-gray-400 uppercase">Range</span>
                        </div>
                        <p class="text-3xl font-orbitron font-bold">285 <span class="text-lg">km</span></p>
                        <p class="text-xs text-gray-400 mt-1">Estimated Distance</p>
                        <p class="text-xs text-green-400 mt-3"><i class="fa-solid fa-arrow-up mr-1"></i>+12km from yesterday</p>
                    </div>

                    <!-- Active Alerts -->
                    <a href="/alerts" class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-5 fade-in-section hover:border-pagani-gold/50 transition-all group cursor-pointer" style="animation-delay: 100ms">
                        <div class="flex items-center justify-between mb-3">
                            <i class="fa-solid fa-bell text-2xl text-yellow-400 group-hover:scale-110 transition-transform"></i>
                            <span class="relative">
                                <span class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center">3</span>
                                <span class="text-xs text-gray-400 uppercase">Alerts</span>
                            </span>
                        </div>
                        <p class="text-3xl font-orbitron font-bold text-yellow-400">3</p>
                        <p class="text-xs text-gray-400 mt-1">Active Alerts</p>
                        <p class="text-xs text-red-400 mt-3"><i class="fa-solid fa-circle-exclamation mr-1"></i>1 Critical</p>
                    </a>

                    <!-- V2E Status -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-5 fade-in-section" style="animation-delay: 150ms">
                        <div class="flex items-center justify-between mb-3">
                            <i class="fa-solid fa-tower-broadcast text-2xl text-purple-400 animate-pulse"></i>
                            <span class="text-xs text-gray-400 uppercase">V2E</span>
                        </div>
                        <p class="text-3xl font-orbitron font-bold text-green-400">Active</p>
                        <p class="text-xs text-gray-400 mt-1">VLC Communication</p>
                        <p class="text-xs text-purple-400 mt-3"><i class="fa-solid fa-signal mr-1"></i>3 vehicles nearby</p>
                    </div>
                </div>
            </div>

            <!-- Main Dashboard Grid -->
            <div class="max-w-7xl mx-auto px-4 md:px-8">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    <!-- Left Column - Battery & Health -->
                    <div class="lg:col-span-2 space-y-6">
                        <!-- Battery Health Card -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                            <div class="flex items-center justify-between mb-6">
                                <h3 class="text-lg font-orbitron font-bold flex items-center gap-2">
                                    <i class="fa-solid fa-heart-pulse text-red-400"></i>
                                    Battery Health Prediction
                                </h3>
                                <a href="/battery" class="text-sm text-pagani-gold hover:underline">View Details <i class="fa-solid fa-arrow-right ml-1"></i></a>
                            </div>
                            
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div class="text-center p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                                    <p class="text-2xl font-orbitron font-bold text-green-400">94%</p>
                                    <p class="text-xs text-gray-400 mt-1">State of Health</p>
                                </div>
                                <div class="text-center p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                                    <p class="text-2xl font-orbitron font-bold">32°C</p>
                                    <p class="text-xs text-gray-400 mt-1">Temperature</p>
                                </div>
                                <div class="text-center p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                                    <p class="text-2xl font-orbitron font-bold">396V</p>
                                    <p class="text-xs text-gray-400 mt-1">Voltage</p>
                                </div>
                                <div class="text-center p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                                    <p class="text-2xl font-orbitron font-bold text-green-400">+32A</p>
                                    <p class="text-xs text-gray-400 mt-1">Current</p>
                                </div>
                            </div>
                            
                            <!-- AI Prediction -->
                            <div class="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
                                <div class="flex items-start gap-3">
                                    <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <i class="fa-solid fa-robot text-blue-400"></i>
                                    </div>
                                    <div>
                                        <p class="text-sm font-orbitron text-blue-400 mb-1">AI Battery Prediction</p>
                                        <p class="text-sm text-gray-300">Based on current usage patterns, your battery SoH is expected to remain above 90% for the next <strong class="text-pagani-gold">18 months</strong>. Recommended charging threshold: 80%.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Quick Route Planner -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                            <div class="flex items-center justify-between mb-6">
                                <h3 class="text-lg font-orbitron font-bold flex items-center gap-2">
                                    <i class="fa-solid fa-route text-pagani-gold"></i>
                                    Smart Route Planner
                                </h3>
                                <a href="/map" class="text-sm text-pagani-gold hover:underline">Open Map <i class="fa-solid fa-arrow-right ml-1"></i></a>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div class="relative">
                                    <div class="absolute left-3 top-1/2 -translate-y-1/2">
                                        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                                    </div>
                                    <input 
                                        type="text" 
                                        class="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pagani-gold transition-all" 
                                        placeholder="Current Location"
                                        value="New Delhi"
                                        readonly
                                    />
                                </div>
                                <div class="relative">
                                    <div class="absolute left-3 top-1/2 -translate-y-1/2">
                                        <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                                    </div>
                                    <input 
                                        type="text" 
                                        id="quick-destination"
                                        class="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pagani-gold transition-all" 
                                        placeholder="Enter destination..."
                                    />
                                </div>
                            </div>

                            <!-- Recent Destinations -->
                            <div class="flex flex-wrap gap-2 mb-4">
                                <span class="text-xs text-gray-400">Recent:</span>
                                <button class="px-3 py-1 bg-pagani-gold/10 border border-pagani-gold/20 rounded-full text-xs text-pagani-gold hover:bg-pagani-gold/20 transition-all">
                                    Mumbai <i class="fa-solid fa-clock ml-1"></i>
                                </button>
                                <button class="px-3 py-1 bg-pagani-gold/10 border border-pagani-gold/20 rounded-full text-xs text-pagani-gold hover:bg-pagani-gold/20 transition-all">
                                    Jaipur <i class="fa-solid fa-clock ml-1"></i>
                                </button>
                                <button class="px-3 py-1 bg-pagani-gold/10 border border-pagani-gold/20 rounded-full text-xs text-pagani-gold hover:bg-pagani-gold/20 transition-all">
                                    Agra <i class="fa-solid fa-clock ml-1"></i>
                                </button>
                            </div>

                            <a href="/map" class="w-full py-3 bg-gradient-to-r from-pagani-gold to-bright-gold text-black font-orbitron font-bold rounded-lg hover:shadow-lg hover:shadow-pagani-gold/50 transition-all uppercase tracking-wider text-sm flex items-center justify-center gap-2">
                                <i class="fa-solid fa-map-location-dot"></i> Plan Route
                            </a>
                        </div>

                        <!-- V2E Communication Status -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                            <div class="flex items-center justify-between mb-6">
                                <h3 class="text-lg font-orbitron font-bold flex items-center gap-2">
                                    <i class="fa-solid fa-tower-broadcast text-purple-400"></i>
                                    V2E Communication
                                </h3>
                                <div class="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full">
                                    <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span class="text-xs text-green-400">Active</span>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div class="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                    <i class="fa-solid fa-lightbulb text-2xl text-purple-400 mb-2"></i>
                                    <p class="text-sm font-orbitron">VLC</p>
                                    <p class="text-xs text-green-400">Connected</p>
                                </div>
                                <div class="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                    <i class="fa-solid fa-car text-2xl text-blue-400 mb-2"></i>
                                    <p class="text-sm font-orbitron">V2V</p>
                                    <p class="text-xs text-gray-400">3 Nearby</p>
                                </div>
                                <div class="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                    <i class="fa-solid fa-traffic-light text-2xl text-green-400 mb-2"></i>
                                    <p class="text-sm font-orbitron">V2I</p>
                                    <p class="text-xs text-green-400">Active</p>
                                </div>
                                <div class="text-center p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                    <i class="fa-solid fa-person-walking text-2xl text-orange-400 mb-2"></i>
                                    <p class="text-sm font-orbitron">V2P</p>
                                    <p class="text-xs text-green-400">Scanning</p>
                                </div>
                            </div>

                            <div class="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg">
                                <div class="flex items-center gap-3">
                                    <i class="fa-solid fa-shield-halved text-2xl text-purple-400"></i>
                                    <div>
                                        <p class="text-sm font-orbitron text-purple-400">Secure VLC Data Exchange</p>
                                        <p class="text-xs text-gray-400">Light-based communication prevents RF interference and enhances security</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column - Alerts & Emergency -->
                    <div class="space-y-6">
                        <!-- Emergency SOS -->
                        <div class="bg-gradient-to-br from-red-900/30 to-pagani-black border border-red-500/30 rounded-xl p-6 fade-in-section">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2 text-red-400">
                                <i class="fa-solid fa-truck-medical"></i>
                                Emergency SOS
                            </h3>
                            <p class="text-sm text-gray-400 mb-4">
                                Automatic crash detection with accelerometer sensors. Manual trigger for immediate assistance.
                            </p>
                            <button id="sos-btn" class="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-orbitron font-bold rounded-lg transition-all uppercase tracking-wider">
                                <i class="fa-solid fa-circle-exclamation mr-2 animate-pulse"></i> EMERGENCY SOS
                            </button>
                            <p class="text-xs text-gray-500 text-center mt-3">
                                <i class="fa-solid fa-info-circle mr-1"></i> Hold for 3 seconds to activate
                            </p>
                        </div>

                        <!-- Recent Alerts -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-orbitron font-bold flex items-center gap-2">
                                    <i class="fa-solid fa-bell text-yellow-400"></i>
                                    Recent Alerts
                                </h3>
                                <a href="/alerts" class="text-sm text-pagani-gold hover:underline">View All</a>
                            </div>

                            <div class="space-y-3">
                                <!-- Critical Alert -->
                                <div class="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                    <div class="flex items-start gap-3">
                                        <div class="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                            <i class="fa-solid fa-temperature-high text-red-400 text-sm"></i>
                                        </div>
                                        <div class="flex-1">
                                            <p class="text-sm font-bold text-red-400">High Temperature Warning</p>
                                            <p class="text-xs text-gray-400">Cell module 3 temp: 45°C</p>
                                            <p class="text-xs text-gray-500 mt-1">2 mins ago</p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Warning Alert -->
                                <div class="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                    <div class="flex items-start gap-3">
                                        <div class="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                            <i class="fa-solid fa-charging-station text-yellow-400 text-sm"></i>
                                        </div>
                                        <div class="flex-1">
                                            <p class="text-sm font-bold text-yellow-400">Charging Recommended</p>
                                            <p class="text-xs text-gray-400">Battery below optimal level</p>
                                            <p class="text-xs text-gray-500 mt-1">15 mins ago</p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Info Alert -->
                                <div class="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                    <div class="flex items-start gap-3">
                                        <div class="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                            <i class="fa-solid fa-route text-blue-400 text-sm"></i>
                                        </div>
                                        <div class="flex-1">
                                            <p class="text-sm font-bold text-blue-400">Route Updated</p>
                                            <p class="text-xs text-gray-400">Traffic detected, rerouting...</p>
                                            <p class="text-xs text-gray-500 mt-1">1 hour ago</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Nearby Charging Stations -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-orbitron font-bold flex items-center gap-2">
                                    <i class="fa-solid fa-charging-station text-green-400"></i>
                                    Nearby Stations
                                </h3>
                                <a href="/map" class="text-sm text-pagani-gold hover:underline">View Map</a>
                            </div>

                            <div class="space-y-3">
                                <div class="flex items-center justify-between p-3 bg-pagani-black/50 border border-pagani-gold/10 rounded-lg hover:border-pagani-gold/30 transition-all cursor-pointer">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                            <i class="fa-solid fa-bolt text-green-400"></i>
                                        </div>
                                        <div>
                                            <p class="text-sm font-bold">TATA Power Station</p>
                                            <p class="text-xs text-gray-400">1.2 km • 4/6 available</p>
                                        </div>
                                    </div>
                                    <span class="text-xs text-green-400">50kW</span>
                                </div>

                                <div class="flex items-center justify-between p-3 bg-pagani-black/50 border border-pagani-gold/10 rounded-lg hover:border-pagani-gold/30 transition-all cursor-pointer">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                            <i class="fa-solid fa-bolt text-blue-400"></i>
                                        </div>
                                        <div>
                                            <p class="text-sm font-bold">Ather Grid</p>
                                            <p class="text-xs text-gray-400">2.8 km • 2/4 available</p>
                                        </div>
                                    </div>
                                    <span class="text-xs text-blue-400">22kW</span>
                                </div>

                                <div class="flex items-center justify-between p-3 bg-pagani-black/50 border border-pagani-gold/10 rounded-lg hover:border-pagani-gold/30 transition-all cursor-pointer">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                            <i class="fa-solid fa-bolt text-yellow-400"></i>
                                        </div>
                                        <div>
                                            <p class="text-sm font-bold">ChargeZone</p>
                                            <p class="text-xs text-gray-400">4.5 km • 6/8 available</p>
                                        </div>
                                    </div>
                                    <span class="text-xs text-yellow-400">150kW</span>
                                </div>
                            </div>
                        </div>

                        <!-- Quick Actions -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-bolt text-pagani-gold"></i>
                                Quick Actions
                            </h3>
                            <div class="grid grid-cols-2 gap-3">
                                <a href="/battery" class="p-4 bg-pagani-black/50 border border-pagani-gold/20 rounded-lg text-center hover:border-pagani-gold/50 transition-all group">
                                    <i class="fa-solid fa-car-battery text-2xl text-green-400 mb-2 group-hover:scale-110 transition-transform"></i>
                                    <p class="text-xs font-orbitron">Battery</p>
                                </a>
                                <a href="/map" class="p-4 bg-pagani-black/50 border border-pagani-gold/20 rounded-lg text-center hover:border-pagani-gold/50 transition-all group">
                                    <i class="fa-solid fa-route text-2xl text-blue-400 mb-2 group-hover:scale-110 transition-transform"></i>
                                    <p class="text-xs font-orbitron">Route</p>
                                </a>
                                <a href="/alerts" class="p-4 bg-pagani-black/50 border border-pagani-gold/20 rounded-lg text-center hover:border-pagani-gold/50 transition-all group">
                                    <i class="fa-solid fa-bell text-2xl text-yellow-400 mb-2 group-hover:scale-110 transition-transform"></i>
                                    <p class="text-xs font-orbitron">Alerts</p>
                                </a>
                                <button id="vehicle-diagnostics" class="p-4 bg-pagani-black/50 border border-pagani-gold/20 rounded-lg text-center hover:border-pagani-gold/50 transition-all group">
                                    <i class="fa-solid fa-stethoscope text-2xl text-purple-400 mb-2 group-hover:scale-110 transition-transform"></i>
                                    <p class="text-xs font-orbitron">Diagnostics</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,setTimeout(()=>{lo()},100)}function lo(){const t=document.getElementById("refresh-dashboard");t?.addEventListener("click",()=>{t.classList.add("animate-spin"),setTimeout(()=>{t.classList.remove("animate-spin")},1e3)});const e=document.getElementById("sos-btn");let a;e?.addEventListener("mousedown",()=>{a=setTimeout(()=>{alert("Emergency SOS activated! Contacting emergency services...")},3e3)}),e?.addEventListener("mouseup",()=>{clearTimeout(a)}),e?.addEventListener("mouseleave",()=>{clearTimeout(a)}),document.getElementById("vehicle-diagnostics")?.addEventListener("click",()=>{alert("Running vehicle diagnostics... All systems operational!")});const i=document.querySelectorAll(".fade-in-section"),n=new IntersectionObserver(r=>{r.forEach(o=>{o.isIntersecting&&o.target.classList.add("animate-fadeInUp")})},{threshold:.1});i.forEach(r=>n.observe(r))}async function co(){if(!H.isAuthenticated()){window.location.href="/auth";return}const t=document.getElementById("app");if(t){if(!document.querySelector('link[href*="font-awesome"]')){const e=document.createElement("link");e.rel="stylesheet",e.href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",document.head.appendChild(e)}t.innerHTML=`
        <!-- Battery Management Page -->
        <div class="min-h-screen bg-pagani-black pt-24 pb-12">
            <!-- Header Section -->
            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 fade-in-section">
                    <div>
                        <div class="flex items-center gap-3 mb-2">
                            <i class="fa-solid fa-car-battery text-3xl text-pagani-gold"></i>
                            <h1 class="text-3xl md:text-4xl font-orbitron font-bold">Battery Management</h1>
                        </div>
                        <p class="text-gray-400">AI-Powered Battery Health Monitoring & Prediction</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <a href="/battery-analytics" class="px-4 py-2 bg-gradient-to-r from-pagani-gold to-yellow-500 text-black font-orbitron font-bold rounded-lg hover:shadow-lg hover:shadow-pagani-gold/20 transition-all text-sm">
                            <i class="fa-solid fa-brain mr-2"></i>ML ANALYTICS
                        </a>
                        <select id="vehicle-selector" class="px-4 py-2 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white font-orbitron text-sm focus:outline-none focus:border-pagani-gold">
                            <option value="1">EVBharat X-1 (DL-01-AB-1234)</option>
                            <option value="2">EVBharat X-1 (MH-02-CD-5678)</option>
                            <option value="3">EVBharat X-1 Premium (KA-03-EF-9012)</option>
                        </select>
                        <button id="refresh-btn" class="px-4 py-2 bg-pagani-gold/20 border border-pagani-gold/50 rounded-lg text-pagani-gold hover:bg-pagani-gold hover:text-black transition-all">
                            <i class="fa-solid fa-refresh"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Main Battery Status -->
            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Battery Visual -->
                    <div class="lg:col-span-1 bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                        <h3 class="text-lg font-orbitron font-bold mb-6 text-center">Battery Status</h3>
                        <div class="relative flex justify-center">
                            <!-- Battery Container -->
                            <div class="relative w-32 h-64">
                                <!-- Battery Cap -->
                                <div class="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-gray-700 rounded-t-lg"></div>
                                <!-- Battery Body -->
                                <div class="absolute top-2 w-full h-60 bg-gray-800 border-4 border-gray-600 rounded-xl overflow-hidden">
                                    <!-- Battery Fill -->
                                    <div id="battery-fill" class="absolute bottom-0 w-full bg-gradient-to-t from-green-500 to-green-400 transition-all duration-1000" style="height: 87%;">
                                        <div class="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10"></div>
                                    </div>
                                    <!-- Charging Animation -->
                                    <div id="charging-indicator" class="absolute inset-0 flex items-center justify-center">
                                        <i class="fa-solid fa-bolt text-4xl text-yellow-400 animate-pulse"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="text-center mt-6">
                            <p class="text-5xl font-orbitron font-bold text-pagani-gold" id="soc-display">87%</p>
                            <p class="text-sm text-gray-400 mt-2">State of Charge</p>
                            <div class="flex items-center justify-center gap-2 mt-4 text-green-400">
                                <i class="fa-solid fa-plug-circle-bolt"></i>
                                <span id="charging-status" class="text-sm font-orbitron">CHARGING</span>
                            </div>
                            <p class="text-xs text-gray-500 mt-2" id="time-to-full">Est. 45 min to full</p>
                        </div>
                    </div>

                    <!-- Key Metrics -->
                    <div class="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                        <!-- State of Health -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-5 fade-in-section" style="animation-delay: 100ms">
                            <div class="flex items-center justify-between mb-3">
                                <i class="fa-solid fa-heart-pulse text-2xl text-red-400"></i>
                                <span class="text-xs text-gray-400 uppercase">SoH</span>
                            </div>
                            <p class="text-3xl font-orbitron font-bold text-green-400" id="soh-value">94%</p>
                            <p class="text-xs text-gray-400 mt-1">State of Health</p>
                            <div class="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div class="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" id="soh-bar" style="width: 94%"></div>
                            </div>
                        </div>

                        <!-- Temperature -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-5 fade-in-section" style="animation-delay: 150ms">
                            <div class="flex items-center justify-between mb-3">
                                <i class="fa-solid fa-temperature-half text-2xl text-orange-400"></i>
                                <span class="text-xs text-gray-400 uppercase">TEMP</span>
                            </div>
                            <p class="text-3xl font-orbitron font-bold" id="temp-value">32°C</p>
                            <p class="text-xs text-gray-400 mt-1">Battery Temp</p>
                            <p class="text-xs text-green-400 mt-3"><i class="fa-solid fa-check-circle mr-1"></i>Optimal Range</p>
                        </div>

                        <!-- Voltage -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-5 fade-in-section" style="animation-delay: 200ms">
                            <div class="flex items-center justify-between mb-3">
                                <i class="fa-solid fa-bolt text-2xl text-yellow-400"></i>
                                <span class="text-xs text-gray-400 uppercase">VOLT</span>
                            </div>
                            <p class="text-3xl font-orbitron font-bold" id="voltage-value">396V</p>
                            <p class="text-xs text-gray-400 mt-1">Pack Voltage</p>
                            <p class="text-xs text-gray-500 mt-3">Nominal: 400V</p>
                        </div>

                        <!-- Current -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-5 fade-in-section" style="animation-delay: 250ms">
                            <div class="flex items-center justify-between mb-3">
                                <i class="fa-solid fa-gauge-high text-2xl text-blue-400"></i>
                                <span class="text-xs text-gray-400 uppercase">AMP</span>
                            </div>
                            <p class="text-3xl font-orbitron font-bold text-green-400" id="current-value">+32A</p>
                            <p class="text-xs text-gray-400 mt-1">Charging Current</p>
                            <p class="text-xs text-gray-500 mt-3">Max: 150A</p>
                        </div>

                        <!-- Power -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-5 fade-in-section" style="animation-delay: 300ms">
                            <div class="flex items-center justify-between mb-3">
                                <i class="fa-solid fa-plug text-2xl text-purple-400"></i>
                                <span class="text-xs text-gray-400 uppercase">PWR</span>
                            </div>
                            <p class="text-3xl font-orbitron font-bold" id="power-value">12.7kW</p>
                            <p class="text-xs text-gray-400 mt-1">Charging Power</p>
                            <p class="text-xs text-gray-500 mt-3">DC Fast Charging</p>
                        </div>

                        <!-- Estimated Range -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-5 fade-in-section" style="animation-delay: 350ms">
                            <div class="flex items-center justify-between mb-3">
                                <i class="fa-solid fa-road text-2xl text-pagani-gold"></i>
                                <span class="text-xs text-gray-400 uppercase">RANGE</span>
                            </div>
                            <p class="text-3xl font-orbitron font-bold text-pagani-gold" id="range-value">392km</p>
                            <p class="text-xs text-gray-400 mt-1">Est. Range</p>
                            <p class="text-xs text-gray-500 mt-3">Avg: 156Wh/km</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Battery Health Prediction -->
            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h3 class="text-xl font-orbitron font-bold flex items-center gap-3">
                                <i class="fa-solid fa-brain text-pagani-gold"></i>
                                AI Battery Health Prediction
                            </h3>
                            <p class="text-sm text-gray-400 mt-1">ML-based degradation analysis and life prediction</p>
                        </div>
                        <div class="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg">
                            <i class="fa-solid fa-check-circle text-green-400"></i>
                            <span class="text-sm text-green-400 font-orbitron">HEALTHY</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <!-- Predicted Lifespan -->
                        <div class="text-center p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                            <p class="text-4xl font-orbitron font-bold text-pagani-gold">8.5</p>
                            <p class="text-xs text-gray-400 mt-2 uppercase">Years Remaining</p>
                            <p class="text-xs text-gray-500 mt-1">Based on current usage</p>
                        </div>

                        <!-- Cycle Count -->
                        <div class="text-center p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                            <p class="text-4xl font-orbitron font-bold">245</p>
                            <p class="text-xs text-gray-400 mt-2 uppercase">Charge Cycles</p>
                            <p class="text-xs text-gray-500 mt-1">Max: ~2000 cycles</p>
                        </div>

                        <!-- Degradation Rate -->
                        <div class="text-center p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                            <p class="text-4xl font-orbitron font-bold text-green-400">0.8%</p>
                            <p class="text-xs text-gray-400 mt-2 uppercase">Degradation/Year</p>
                            <p class="text-xs text-gray-500 mt-1">Below average</p>
                        </div>

                        <!-- Next Service -->
                        <div class="text-center p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                            <p class="text-4xl font-orbitron font-bold text-orange-400">45</p>
                            <p class="text-xs text-gray-400 mt-2 uppercase">Days to Service</p>
                            <p class="text-xs text-gray-500 mt-1">Battery check-up</p>
                        </div>
                    </div>

                    <!-- Health Timeline -->
                    <div class="mt-6 p-4 bg-pagani-black/30 rounded-lg">
                        <h4 class="text-sm font-orbitron text-pagani-gold mb-4">Predicted Health Timeline</h4>
                        <div class="flex items-center justify-between gap-2">
                            <div class="text-center">
                                <div class="w-12 h-12 mx-auto rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                                    <span class="text-xs font-bold text-green-400">94%</span>
                                </div>
                                <p class="text-xs text-gray-400 mt-2">Now</p>
                            </div>
                            <div class="flex-1 h-1 bg-gradient-to-r from-green-500 via-yellow-500 to-orange-500 rounded-full"></div>
                            <div class="text-center">
                                <div class="w-12 h-12 mx-auto rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center">
                                    <span class="text-xs font-bold text-green-400">90%</span>
                                </div>
                                <p class="text-xs text-gray-400 mt-2">2027</p>
                            </div>
                            <div class="flex-1 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"></div>
                            <div class="text-center">
                                <div class="w-12 h-12 mx-auto rounded-full bg-yellow-500/20 border-2 border-yellow-500/50 flex items-center justify-center">
                                    <span class="text-xs font-bold text-yellow-400">85%</span>
                                </div>
                                <p class="text-xs text-gray-400 mt-2">2029</p>
                            </div>
                            <div class="flex-1 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                            <div class="text-center">
                                <div class="w-12 h-12 mx-auto rounded-full bg-orange-500/20 border-2 border-orange-500/50 flex items-center justify-center">
                                    <span class="text-xs font-bold text-orange-400">80%</span>
                                </div>
                                <p class="text-xs text-gray-400 mt-2">2031</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cell Monitoring -->
            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                    <h3 class="text-xl font-orbitron font-bold mb-6 flex items-center gap-3">
                        <i class="fa-solid fa-grid-4 text-pagani-gold"></i>
                        Cell-Level Monitoring
                    </h3>
                    <div class="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-2" id="cell-grid">
                        <!-- Cells will be populated by JS -->
                    </div>
                    <div class="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
                        <div class="flex items-center gap-2">
                            <div class="w-4 h-4 bg-green-500 rounded"></div>
                            <span>Healthy (95-100%)</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-4 h-4 bg-yellow-500 rounded"></div>
                            <span>Fair (85-94%)</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-4 h-4 bg-orange-500 rounded"></div>
                            <span>Degraded (75-84%)</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-4 h-4 bg-red-500 rounded"></div>
                            <span>Critical (&lt;75%)</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charging History & Tips -->
            <div class="max-w-7xl mx-auto px-4 md:px-8">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Recent Charging Sessions -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                        <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-3">
                            <i class="fa-solid fa-clock-rotate-left text-pagani-gold"></i>
                            Recent Charging Sessions
                        </h3>
                        <div class="space-y-3" id="charging-history">
                            <!-- Sessions will be populated by JS -->
                        </div>
                    </div>

                    <!-- Battery Care Tips -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                        <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-3">
                            <i class="fa-solid fa-lightbulb text-pagani-gold"></i>
                            AI Battery Care Tips
                        </h3>
                        <div class="space-y-4">
                            <div class="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                                <i class="fa-solid fa-check-circle text-green-400 mt-1"></i>
                                <div>
                                    <p class="text-sm font-semibold text-green-400">Optimal Charging</p>
                                    <p class="text-xs text-gray-400 mt-1">Your average charging level is 80%, which is ideal for battery longevity.</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <i class="fa-solid fa-exclamation-triangle text-yellow-400 mt-1"></i>
                                <div>
                                    <p class="text-sm font-semibold text-yellow-400">Avoid Deep Discharge</p>
                                    <p class="text-xs text-gray-400 mt-1">Try not to let the battery drop below 20% regularly.</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                <i class="fa-solid fa-snowflake text-blue-400 mt-1"></i>
                                <div>
                                    <p class="text-sm font-semibold text-blue-400">Temperature Management</p>
                                    <p class="text-xs text-gray-400 mt-1">Pre-condition your battery before fast charging in cold weather.</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-3 p-3 bg-pagani-gold/10 border border-pagani-gold/30 rounded-lg">
                                <i class="fa-solid fa-bolt text-pagani-gold mt-1"></i>
                                <div>
                                    <p class="text-sm font-semibold text-pagani-gold">Smart Charging</p>
                                    <p class="text-xs text-gray-400 mt-1">Use scheduled charging to charge during off-peak hours.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,setTimeout(()=>{po()},100)}}function po(){const t=document.getElementById("cell-grid");if(t){const s=go(96);t.innerHTML=s.map(i=>{const n=i.health>=95?"bg-green-500":i.health>=85?"bg-yellow-500":i.health>=75?"bg-orange-500":"bg-red-500";return`
                <div class="cell-item group relative">
                    <div class="w-full aspect-square ${n} rounded-lg opacity-80 hover:opacity-100 cursor-pointer transition-all hover:scale-110 hover:z-10"></div>
                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-pagani-black border border-pagani-gold/30 rounded px-2 py-1 whitespace-nowrap z-20">
                        <p class="text-xs text-gray-400">Cell ${i.id}</p>
                        <p class="text-xs text-white">${i.voltage}V | ${i.temperature}°C</p>
                        <p class="text-xs ${n.replace("bg-","text-")}">${i.health}% Health</p>
                    </div>
                </div>
            `}).join("")}const e=document.getElementById("charging-history");if(e){const s=[{date:"Today, 10:30 AM",type:"DC Fast",from:"25%",to:"87%",duration:"35 min",energy:"42 kWh"},{date:"Yesterday, 8:15 PM",type:"Home AC",from:"45%",to:"80%",duration:"2h 30m",energy:"28 kWh"},{date:"Feb 12, 3:45 PM",type:"DC Fast",from:"18%",to:"90%",duration:"48 min",energy:"58 kWh"},{date:"Feb 10, 11:00 AM",type:"Public AC",from:"60%",to:"100%",duration:"3h 10m",energy:"32 kWh"}];e.innerHTML=s.map(i=>`
            <div class="flex items-center justify-between p-3 bg-pagani-black/50 rounded-lg border border-pagani-gold/10 hover:border-pagani-gold/30 transition-all">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full ${i.type.includes("DC")?"bg-yellow-500/20 text-yellow-400":"bg-blue-500/20 text-blue-400"} flex items-center justify-center">
                        <i class="fa-solid ${i.type.includes("DC")?"fa-bolt":"fa-plug"}"></i>
                    </div>
                    <div>
                        <p class="text-sm font-semibold">${i.type} Charging</p>
                        <p class="text-xs text-gray-400">${i.date}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-sm font-orbitron text-pagani-gold">${i.from} → ${i.to}</p>
                    <p class="text-xs text-gray-400">${i.duration} | ${i.energy}</p>
                </div>
            </div>
        `).join("")}const a=document.getElementById("refresh-btn");a?.addEventListener("click",()=>{a.classList.add("animate-spin"),setTimeout(()=>{a.classList.remove("animate-spin"),fo("Battery data refreshed")},1e3)}),uo()}function go(t){const e=[];for(let a=1;a<=t;a++)e.push({id:a,voltage:3.6+Math.random()*.5,temperature:28+Math.random()*10,health:85+Math.random()*15});return e[23].health=78,e[45].health=82,e[67].health=72,e}function uo(){setInterval(()=>{const t=document.getElementById("soc-display"),e=document.getElementById("battery-fill");if(t&&e){const a=parseInt(t.textContent||"87");if(a<100){const s=Math.min(a+1,100);t.textContent=`${s}%`,e.style.height=`${s}%`;const i=document.getElementById("range-value");i&&(i.textContent=`${Math.round(s*4.5)}km`)}}},5e3)}function fo(t,e){const a=document.createElement("div");a.className="fixed top-24 right-8 px-6 py-4 rounded-lg backdrop-blur-sm z-50 font-orbitron text-sm fade-in-section bg-green-500/20 border border-green-500/50 text-green-400",a.innerHTML=`<i class="fa-solid fa-check-circle mr-2"></i>${t}`,document.body.appendChild(a),setTimeout(()=>a.remove(),3e3)}async function mo(){if(!H.isAuthenticated()){window.location.href="/auth";return}const t=document.getElementById("app");t&&(t.innerHTML=`
        <div class="min-h-screen bg-pagani-black pt-24 pb-12">
            <!-- Header Section -->
            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 fade-in-section">
                    <div>
                        <div class="flex items-center gap-3 mb-2">
                            <i class="fa-solid fa-brain text-3xl text-pagani-gold"></i>
                            <h1 class="text-3xl md:text-4xl font-orbitron font-bold">AI Battery Analytics</h1>
                        </div>
                        <p class="text-gray-400">Machine Learning Powered Battery Intelligence System</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg">
                            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span class="text-sm text-green-400 font-orbitron">ML MODEL ACTIVE</span>
                        </div>
                        <button id="refresh-ml-btn" class="px-4 py-2 bg-pagani-gold/20 border border-pagani-gold/50 rounded-lg text-pagani-gold hover:bg-pagani-gold hover:text-black transition-all">
                            <i class="fa-solid fa-refresh"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Real-time Input Section -->
            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Manual Input Panel -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                        <h3 class="text-xl font-orbitron font-bold mb-6 flex items-center gap-3">
                            <i class="fa-solid fa-sliders text-pagani-gold"></i>
                            Manual Testing Input
                        </h3>
                        <form id="battery-input-form" class="space-y-4">
                            <!-- Voltage Input -->
                            <div>
                                <label class="block text-sm font-orbitron text-gray-300 mb-2">Battery Voltage (V)</label>
                                <div class="relative">
                                    <input 
                                        type="number" 
                                        id="voltage-input" 
                                        name="voltage"
                                        step="0.1" 
                                        min="2.5" 
                                        max="4.2" 
                                        value="3.7"
                                        class="w-full px-4 py-3 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white font-orbitron focus:outline-none focus:border-pagani-gold focus:bg-gray-800"
                                        placeholder="3.7"
                                    >
                                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">V</span>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">Typical range: 2.5V - 4.2V per cell</p>
                            </div>

                            <!-- Current Input -->
                            <div>
                                <label class="block text-sm font-orbitron text-gray-300 mb-2">Current (A)</label>
                                <div class="relative">
                                    <input 
                                        type="number" 
                                        id="current-input" 
                                        name="current"
                                        step="0.1" 
                                        min="-100" 
                                        max="100" 
                                        value="-5"
                                        class="w-full px-4 py-3 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white font-orbitron focus:outline-none focus:border-pagani-gold focus:bg-gray-800"
                                        placeholder="-5.0"
                                    >
                                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">A</span>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">Negative = Discharge, Positive = Charge</p>
                            </div>

                            <!-- Temperature Input -->
                            <div>
                                <label class="block text-sm font-orbitron text-gray-300 mb-2">Temperature (°C)</label>
                                <div class="relative">
                                    <input 
                                        type="number" 
                                        id="temperature-input" 
                                        name="temperature"
                                        step="1" 
                                        min="-20" 
                                        max="60" 
                                        value="25"
                                        class="w-full px-4 py-3 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white font-orbitron focus:outline-none focus:border-pagani-gold focus:bg-gray-800"
                                        placeholder="25"
                                    >
                                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">°C</span>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">Optimal: 15°C - 35°C</p>
                            </div>

                            <!-- Cell Age Selection -->
                            <div>
                                <label class="block text-sm font-orbitron text-gray-300 mb-2">Battery Age</label>
                                <select 
                                    id="cell-age-input" 
                                    name="cell_age"
                                    class="w-full px-4 py-3 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white font-orbitron focus:outline-none focus:border-pagani-gold"
                                >
                                    <option value="fresh">Fresh Battery (0-6 months)</option>
                                    <option value="aged">Aged Battery (6+ months)</option>
                                </select>
                            </div>

                            <!-- Cycle Count Input -->
                            <div>
                                <label class="block text-sm font-orbitron text-gray-300 mb-2">Cycle Count</label>
                                <div class="relative">
                                    <input 
                                        type="number" 
                                        id="cycle-count-input" 
                                        name="cycle_count"
                                        min="0" 
                                        max="5000" 
                                        value="150"
                                        class="w-full px-4 py-3 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white font-orbitron focus:outline-none focus:border-pagani-gold focus:bg-gray-800"
                                        placeholder="150"
                                    >
                                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">cycles</span>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">Full charge-discharge cycles completed</p>
                            </div>

                            <!-- Age in Days Input -->
                            <div>
                                <label class="block text-sm font-orbitron text-gray-300 mb-2">Age in Days</label>
                                <div class="relative">
                                    <input 
                                        type="number" 
                                        id="age-days-input" 
                                        name="age_days"
                                        min="1" 
                                        max="3650" 
                                        value="400"
                                        class="w-full px-4 py-3 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white font-orbitron focus:outline-none focus:border-pagani-gold focus:bg-gray-800"
                                        placeholder="400"
                                    >
                                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">days</span>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">Calendar days since first use (1-3650)</p>
                            </div>

                            <!-- Quick Scenario Buttons -->
                            <div class="grid grid-cols-2 gap-3 mt-6">
                                <button type="button" id="scenario-normal" class="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 hover:bg-green-500/30 transition-all text-sm font-orbitron">
                                    Normal Drive
                                </button>
                                <button type="button" id="scenario-charging" class="px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-all text-sm font-orbitron">
                                    Fast Charging
                                </button>
                                <button type="button" id="scenario-cold" class="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-all text-sm font-orbitron">
                                    Cold Weather
                                </button>
                                <button type="button" id="scenario-critical" class="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 hover:bg-red-500/30 transition-all text-sm font-orbitron">
                                    Low Battery
                                </button>
                            </div>

                            <!-- Predict Button -->
                            <button 
                                type="submit" 
                                id="predict-btn"
                                class="w-full px-6 py-4 bg-gradient-to-r from-pagani-gold to-yellow-500 text-black font-orbitron font-bold rounded-lg hover:shadow-lg hover:shadow-pagani-gold/20 transition-all mt-6"
                            >
                                <i class="fa-solid fa-brain mr-2"></i>
                                PREDICT WITH AI
                            </button>
                        </form>
                    </div>

                    <!-- Real-time Results Panel -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                        <h3 class="text-xl font-orbitron font-bold mb-6 flex items-center gap-3">
                            <i class="fa-solid fa-chart-line text-pagani-gold"></i>
                            AI Predictions & Analysis
                        </h3>

                        <!-- Loading State -->
                        <div id="prediction-loading" class="hidden text-center py-8">
                            <div class="animate-spin w-8 h-8 border-2 border-pagani-gold border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p class="text-gray-400">AI Model Processing...</p>
                        </div>

                        <!-- Prediction Results -->
                        <div id="prediction-results" class="space-y-4">
                            <div class="text-center py-8 text-gray-500">
                                <i class="fa-solid fa-robot text-4xl mb-4"></i>
                                <p>Enter battery parameters and click "PREDICT WITH AI" to see intelligent analysis</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Historical Predictions Chart -->
            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                    <h3 class="text-xl font-orbitron font-bold mb-6 flex items-center gap-3">
                        <i class="fa-solid fa-chart-area text-pagani-gold"></i>
                        Real-time Prediction Timeline
                    </h3>
                    <div id="prediction-chart" class="h-64 flex items-center justify-center text-gray-500">
                        <p>Prediction history will appear here after running AI analysis</p>
                    </div>
                </div>
            </div>

            <!-- ML Model Information -->
            <div class="max-w-7xl mx-auto px-4 md:px-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Model Performance -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                        <h4 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-3">
                            <i class="fa-solid fa-trophy text-pagani-gold"></i>
                            Model Performance
                        </h4>
                        <div class="space-y-3">
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-400">SOC Accuracy</span>
                                <span class="text-green-400 font-orbitron">94.2%</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-400">SOH Accuracy</span>
                                <span class="text-green-400 font-orbitron">91.8%</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-400">RUL Accuracy</span>
                                <span class="text-green-400 font-orbitron">89.5%</span>
                            </div>
                            <div class="flex justify-between items-center border-t border-gray-700 pt-3">
                                <span class="text-sm text-gray-400">Model Version</span>
                                <span class="text-pagani-gold font-orbitron">v2.1.0</span>
                            </div>
                        </div>
                    </div>

                    <!-- Feature Importance -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                        <h4 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-3">
                            <i class="fa-solid fa-bullseye text-pagani-gold"></i>
                            Key Factors
                        </h4>
                        <div class="space-y-3">
                            <div>
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-sm text-gray-400">Temperature</span>
                                    <span class="text-red-400 text-sm">High</span>
                                </div>
                                <div class="w-full bg-gray-700 rounded-full h-2">
                                    <div class="bg-red-500 h-2 rounded-full" style="width: 78%"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-sm text-gray-400">Voltage Level</span>
                                    <span class="text-yellow-400 text-sm">Medium</span>
                                </div>
                                <div class="w-full bg-gray-700 rounded-full h-2">
                                    <div class="bg-yellow-500 h-2 rounded-full" style="width: 65%"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-sm text-gray-400">Current Rate</span>
                                    <span class="text-green-400 text-sm">Medium</span>
                                </div>
                                <div class="w-full bg-gray-700 rounded-full h-2">
                                    <div class="bg-green-500 h-2 rounded-full" style="width: 52%"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- System Status -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                        <h4 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-3">
                            <i class="fa-solid fa-server text-pagani-gold"></i>
                            System Status
                        </h4>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-gray-400">ML Backend</span>
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span class="text-green-400 text-sm font-orbitron">ONLINE</span>
                                </div>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-gray-400">Data Pipeline</span>
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span class="text-green-400 text-sm font-orbitron">ACTIVE</span>
                                </div>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-gray-400">Last Update</span>
                                <span class="text-gray-400 text-sm font-orbitron" id="last-update">Just now</span>
                            </div>
                            <button class="w-full px-4 py-2 bg-pagani-gold/20 border border-pagani-gold/50 rounded-lg text-pagani-gold hover:bg-pagani-gold hover:text-black transition-all text-sm font-orbitron">
                                <i class="fa-solid fa-download mr-2"></i>
                                EXPORT REPORT
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,ho())}function ho(){const t=document.getElementById("battery-input-form"),e=new Es;e.addRule("voltage",{required:!0,custom:l=>parseFloat(l)>=2.5&&parseFloat(l)<=4.2}),e.addRule("current",{required:!0,custom:l=>parseFloat(l)>=-100&&parseFloat(l)<=100}),e.addRule("temperature",{required:!0,custom:l=>parseFloat(l)>=-20&&parseFloat(l)<=60});const a=[];s(),t?.addEventListener("submit",async l=>{l.preventDefault();const c=new FormData(t),d=e.validate(c);if(!d.isValid){Oe(d.errors[0],"error");return}await i(c)});function s(){Object.entries({"scenario-normal":{voltage:3.7,current:-5,temperature:25,cell_age:"fresh",cycle_count:75,age_days:200},"scenario-charging":{voltage:4,current:15,temperature:35,cell_age:"fresh",cycle_count:120,age_days:150},"scenario-cold":{voltage:3.5,current:-3,temperature:-5,cell_age:"fresh",cycle_count:90,age_days:180},"scenario-critical":{voltage:3.1,current:-1,temperature:20,cell_age:"aged",cycle_count:800,age_days:1200}}).forEach(([c,d])=>{document.getElementById(c)?.addEventListener("click",()=>{document.getElementById("voltage-input").value=d.voltage.toString(),document.getElementById("current-input").value=d.current.toString(),document.getElementById("temperature-input").value=d.temperature.toString(),document.getElementById("cell-age-input").value=d.cell_age,document.getElementById("cycle-count-input").value=d.cycle_count.toString(),document.getElementById("age-days-input").value=d.age_days.toString(),Oe(`Applied ${c.split("-")[1]} scenario`,"success")})})}async function i(l){const c=document.getElementById("prediction-loading"),d=document.getElementById("prediction-results");if(!(!c||!d)){c.classList.remove("hidden"),d.innerHTML="";try{const p=await bo({voltage:parseFloat(l.get("voltage")),current:parseFloat(l.get("current")),temperature:parseFloat(l.get("temperature")),cell_age:l.get("cell_age"),cycle_count:parseInt(l.get("cycle_count"))||150,age_days:parseInt(l.get("age_days"))||400});c.classList.add("hidden"),p.status==="success"?(n(p,d),r(p),o()):Oe(p.error||"Prediction failed","error")}catch{c.classList.add("hidden"),Oe("ML model communication error","error")}}}function n(l,c){if(!l.predictions||!l.analysis)return;const{predictions:d,analysis:p}=l,m={LOW:{bg:"bg-green-500/20",border:"border-green-500/50",text:"text-green-400"},MEDIUM:{bg:"bg-yellow-500/20",border:"border-yellow-500/50",text:"text-yellow-400"},CRITICAL:{bg:"bg-red-500/20",border:"border-red-500/50",text:"text-red-400"}}[p.risk_level];c.innerHTML=`
            <!-- Main Predictions -->
            <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="text-center p-4 ${m.bg} ${m.border} border rounded-lg">
                    <p class="text-2xl font-orbitron font-bold ${m.text}">${d.SOC.toFixed(1)}%</p>
                    <p class="text-xs text-gray-400 mt-1">STATE OF CHARGE</p>
                </div>
                <div class="text-center p-4 ${m.bg} ${m.border} border rounded-lg">
                    <p class="text-2xl font-orbitron font-bold ${m.text}">${d.SOH.toFixed(1)}%</p>
                    <p class="text-xs text-gray-400 mt-1">STATE OF HEALTH</p>
                </div>
                <div class="text-center p-4 ${m.bg} ${m.border} border rounded-lg">
                    <p class="text-2xl font-orbitron font-bold ${m.text}">${Math.round(d.RUL)}</p>
                    <p class="text-xs text-gray-400 mt-1">REMAINING DAYS</p>
                </div>
            </div>

            <!-- RUL Detailed Information -->
            <div class="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-hourglass-half text-blue-400"></i>
                        <span class="text-sm font-orbitron text-gray-300">Remaining Useful Life Analysis</span>
                    </div>
                    <span class="text-lg font-bold text-blue-400">${Math.round(d.RUL)} days</span>
                </div>
                <div class="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p class="text-xs text-gray-400">Weeks</p>
                        <p class="text-lg font-orbitron text-blue-400">${Math.round(d.RUL/7)}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-400">Months</p>
                        <p class="text-lg font-orbitron text-blue-400">${Math.round(d.RUL/30)}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-400">Est. Years</p>
                        <p class="text-lg font-orbitron text-blue-400">${(d.RUL/365).toFixed(1)}</p>
                    </div>
                </div>
                <div class="mt-3 text-xs text-gray-400 text-center">
                    ${d.RUL<90?"⚠️ Replacement recommended soon":d.RUL<365?"📋 Plan for replacement within a year":"✅ Battery has good remaining lifespan"}
                </div>
            </div>

            <!-- Battery Intelligence System Info -->
            <div class="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-brain text-purple-400"></i>
                        <span class="text-sm font-orbitron text-gray-300">Battery Intelligence System</span>
                    </div>
                    <span class="text-sm font-orbitron text-purple-400">
                        v${p.intelligence_version||"2.0.0"}
                    </span>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="text-center p-3 bg-purple-500/5 rounded-lg">
                        <p class="text-lg font-orbitron text-purple-400">${((p.assessment_confidence||.85)*100).toFixed(1)}%</p>
                        <p class="text-xs text-gray-400">Assessment Confidence</p>
                    </div>
                    <div class="text-center p-3 bg-purple-500/5 rounded-lg">
                        <p class="text-lg font-orbitron text-purple-400">${p.risk_level}</p>
                        <p class="text-xs text-gray-400">Risk Classification</p>
                    </div>
                </div>
                <div class="mt-3 text-xs text-gray-400 text-center">
                    🧠 Enhanced ML predictions with battery intelligence factors
                </div>
            </div>

            <!-- Overall Health Score -->
            <div class="mb-6 p-4 ${m.bg} ${m.border} border rounded-lg">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-sm font-orbitron text-gray-300">Overall Health Score</span>
                    <span class="text-lg font-bold ${m.text}">${p.overall_health.toFixed(1)}/100</span>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-3">
                    <div class="${p.risk_level==="LOW"?"bg-green-500":p.risk_level==="MEDIUM"?"bg-yellow-500":"bg-red-500"} h-3 rounded-full transition-all duration-1000" style="width: ${p.overall_health}%"></div>
                </div>
                <div class="flex justify-between items-center mt-3">
                    <span class="text-xs text-gray-400">Risk Level</span>
                    <span class="text-sm font-orbitron ${m.text}">${p.risk_level}</span>
                </div>
            </div>

            <!-- AI Alerts & Recommendations -->
            <div class="space-y-3">
                <h4 class="text-sm font-orbitron font-bold text-pagani-gold mb-3">
                    <i class="fa-solid fa-lightbulb mr-2"></i>AI Insights & Recommendations
                </h4>
                ${p.alerts.map(x=>{const v={INFO:{bg:"bg-blue-500/10",border:"border-blue-500/30",text:"text-blue-400",icon:"fa-info-circle"},WARNING:{bg:"bg-yellow-500/10",border:"border-yellow-500/30",text:"text-yellow-400",icon:"fa-exclamation-triangle"},CRITICAL:{bg:"bg-red-500/10",border:"border-red-500/30",text:"text-red-400",icon:"fa-exclamation-circle"}}[x.level];return`
                        <div class="p-3 ${v.bg} ${v.border} border rounded-lg">
                            <div class="flex items-start gap-3">
                                <i class="fa-solid ${v.icon} ${v.text} mt-1"></i>
                                <div class="flex-1">
                                    <p class="text-sm font-semibold ${v.text}">${x.type}</p>
                                    <p class="text-xs text-gray-400 mt-1">${x.message}</p>
                                    <p class="text-xs text-gray-300 mt-2 font-semibold">💡 ${x.recommendation}</p>
                                </div>
                            </div>
                        </div>
                    `}).join("")}
            </div>

            <!-- Confidence Score -->
            <div class="mt-6 p-3 bg-pagani-black/50 rounded-lg border border-pagani-gold/20">
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-400">ML Model Confidence</span>
                    <span class="text-pagani-gold font-orbitron">${(d.confidence*100).toFixed(1)}%</span>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div class="bg-pagani-gold h-2 rounded-full transition-all duration-1000" style="width: ${d.confidence*100}%"></div>
                </div>
                <div class="mt-2 text-xs text-gray-400 text-center">
                    ${d.confidence>.9?" Very High Confidence":d.confidence>.8?" High Confidence":d.confidence>.7?" Medium Confidence":"🔄 Low Confidence - Consider retesting"}
                </div>
            </div>
        `}function r(l){if(!l.predictions)return;const c={timestamp:new Date().toISOString(),voltage:parseFloat(document.getElementById("voltage-input").value),current:parseFloat(document.getElementById("current-input").value),temperature:parseFloat(document.getElementById("temperature-input").value),soc:l.predictions.SOC,soh:l.predictions.SOH,rul:l.predictions.RUL};a.push(c),a.length>20&&a.shift()}function o(){const l=document.getElementById("prediction-chart");if(!l||a.length===0)return;const c=a.slice(-5);l.innerHTML=`
            <div class="w-full">
                <div class="flex justify-between items-end h-40 border-l border-b border-gray-600 pl-4 pb-4">
                    ${c.map(d=>`
                        <div class="flex-1 flex flex-col items-center gap-2">
                            <div class="flex flex-col gap-1">
                                <div class="w-8 bg-green-500 rounded-t" style="height: ${d.soc}px" title="SOC: ${d.soc.toFixed(1)}%"></div>
                                <div class="w-8 bg-yellow-500 rounded-t" style="height: ${d.soh}px" title="SOH: ${d.soh.toFixed(1)}%"></div>
                            </div>
                            <p class="text-xs text-gray-400 transform rotate-45 origin-center">${new Date(d.timestamp).toLocaleTimeString().slice(0,5)}</p>
                        </div>
                    `).join("")}
                </div>
                <div class="flex items-center gap-4 mt-4 text-xs">
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bg-green-500 rounded"></div>
                        <span class="text-gray-400">SOC %</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bg-yellow-500 rounded"></div>
                        <span class="text-gray-400">SOH %</span>
                    </div>
                </div>
            </div>
        `}setInterval(()=>{const l=document.getElementById("last-update");l&&(l.textContent=new Date().toLocaleTimeString())},3e4)}async function bo(t){try{const e="http://localhost:8000",a={voltage:t.voltage,current:t.current,temperature:t.temperature,cycle_count:t.cycle_count||150,age_days:t.age_days||(t.cell_age==="fresh"?200:800)},s=await fetch(`${e}/predict`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)});if(s.ok){const i=await s.json();return{status:i.status,predictions:i.predictions,analysis:i.analysis,error:i.error}}else throw new Error(`ML API returned ${s.status}`)}catch(e){console.warn("ML API not available, using fallback simulation:",e),await new Promise(w=>setTimeout(w,2e3));const{voltage:a,current:s,temperature:i,cycle_count:n=150,age_days:r=400}=t;let o=Math.max(0,Math.min(100,(a-2.5)/(4.2-2.5)*100)),l=Math.min(30,n/100),c=Math.min(20,r/365*5),d=Math.abs(i-25)*.3,p=100-l-c-d;p=Math.max(50,Math.min(100,p));const u=(l+c)/(n+r/7);let m=Math.max(50,(p-80)/(u+.001)*7);m=Math.max(100,Math.min(3e3,m));const x=(o+p)/2;let y;const v=[];return x>=80?(y="LOW",v.push({type:"Battery Health Excellent",message:"Your battery is operating within optimal parameters.",level:"INFO",recommendation:"Continue current charging habits for maximum lifespan."})):x>=65?(y="MEDIUM",v.push({type:"Moderate Degradation Detected",message:"Battery showing signs of aging but still functional.",level:"WARNING",recommendation:"Avoid extreme temperatures and deep discharge cycles."})):(y="CRITICAL",v.push({type:"Battery Health Critical",message:"Significant degradation detected. Consider replacement.",level:"CRITICAL",recommendation:"Schedule immediate battery inspection and replacement planning."})),i>40?v.push({type:"High Temperature Warning",message:"Battery temperature exceeds safe operating range.",level:"WARNING",recommendation:"Allow battery to cool before charging or heavy usage."}):i<0&&v.push({type:"Cold Temperature Alert",message:"Low temperature may reduce battery performance.",level:"INFO",recommendation:"Pre-condition battery before use in cold weather."}),Math.abs(s)>50&&v.push({type:"High Current Draw",message:"Excessive current may accelerate battery degradation.",level:"WARNING",recommendation:"Reduce power demand or use more conservative driving mode."}),{status:"success",predictions:{SOC:o,SOH:p,RUL:m,confidence:.85+Math.random()*.1},analysis:{overall_health:x,risk_level:y,alerts:v,intelligence_version:"EVBharat AI v2.1",assessment_confidence:Math.round((.85+Math.random()*.1)*100)}}}}function Oe(t,e){const a=document.createElement("div");a.className=`fixed top-24 right-8 px-6 py-4 rounded-lg backdrop-blur-sm z-50 font-orbitron text-sm fade-in-section ${e==="success"?"bg-green-500/20 border border-green-500/50 text-green-400":"bg-red-500/20 border border-red-500/50 text-red-400"}`,a.innerHTML=`<i class="fa-solid ${e==="success"?"fa-check-circle":"fa-exclamation-circle"} mr-2"></i>${t}`,document.body.appendChild(a),setTimeout(()=>a.remove(),3e3)}class xo{baseUrl;constructor(){this.baseUrl="/api/rag",console.log("🔗 Backend via Vite proxy:",this.baseUrl)}async healthCheck(){return(await this.fetchR(`${this.baseUrl}/health`,{method:"GET"})).json()}async freeChat(e){const a=await this.fetchR(`${this.baseUrl}/free-chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:e})});if(!a.ok){const s=await a.json().catch(()=>({detail:"Network error"}));throw new Error(s.detail||"Chat failed")}return a.json()}async uploadPDF(e){const a=new FormData;a.append("file",e);const s=await this.fetchR(`${this.baseUrl}/upload`,{method:"POST",body:a},3);if(!s.ok){const i=await s.json().catch(()=>({detail:"Upload failed"}));throw new Error(i.detail||"Upload failed")}return s.json()}async docChat(e,a){const s=await this.fetchR(`${this.baseUrl}/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:e,session_id:a})});if(!s.ok){const i=await s.json().catch(()=>({detail:"Chat failed"}));throw new Error(i.detail||"Chat failed")}return s.json()}async sessionStatus(e){return(await fetch(`${this.baseUrl}/sessions/${e}/status`)).json()}async deleteSession(e){await fetch(`${this.baseUrl}/sessions/${e}`,{method:"DELETE"})}async fetchR(e,a,s=2){let i=null;for(let n=0;n<=s;n++)try{const r=new AbortController,o=setTimeout(()=>r.abort(),3e4),l=await fetch(e,{...a,signal:r.signal});if(clearTimeout(o),(l.status===429||l.status===503)&&n<s){await this.wait(2**n*1e3);continue}return l}catch(r){i=r,n<s&&await this.wait(2**n*1e3)}throw i||new Error("Request failed after all retries")}wait(e){return new Promise(a=>setTimeout(a,e))}}const oe=new xo,ua=[{icon:"fa-hand-holding-dollar",emoji:"💰",q:"What subsidies are available under FAME II for e-2W buyers?",color:"rgba(34, 197, 94, 0.15)"},{icon:"fa-file-invoice",emoji:"📋",q:"List the EV registration & road-tax exemptions in Maharashtra.",color:"rgba(59, 130, 246, 0.15)"},{icon:"fa-battery-full",emoji:"🔋",q:"Explain BIS AIS-156 battery safety standards.",color:"rgba(168, 85, 247, 0.15)"},{icon:"fa-percent",emoji:"📊",q:"What are the GST rates on EVs vs ICE vehicles?",color:"rgba(245, 158, 11, 0.15)"},{icon:"fa-charging-station",emoji:"⚡",q:"How to get approval for setting up a public EV charging station?",color:"rgba(20, 184, 166, 0.15)"},{icon:"fa-landmark",emoji:"🏛️",q:"What is Section 80EEB income-tax benefit on EV loans?",color:"rgba(236, 72, 153, 0.15)"}],jt="evbharat_chat_history";function fa(t){try{localStorage.setItem(jt,JSON.stringify(t.map(e=>({...e,timestamp:e.timestamp.toISOString()}))))}catch{}}function vo(){try{const t=localStorage.getItem(jt);return t?JSON.parse(t).map(e=>({...e,timestamp:new Date(e.timestamp)})):[]}catch{return[]}}function yo(){localStorage.removeItem(jt)}const ma=()=>Math.random().toString(36).slice(2,10),ke=t=>t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),ha=t=>t.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});function wo(t){let e=ke(t);return e=e.replace(/```(\w*)\n?([\s\S]*?)```/g,(a,s,i)=>`<div style="position:relative;margin:8px 0"><pre style="background:rgba(0,0,0,.45);border:1px solid rgba(75,85,99,.3);border-radius:8px;padding:12px 14px;overflow-x:auto;font-size:12px;line-height:1.6"><code>${s?`<span style="position:absolute;top:4px;right:8px;font-size:9px;color:#6b7280;text-transform:uppercase">${s}</span>`:""}${i.trim()}</code></pre></div>`),e=e.replace(/`([^`]+)`/g,'<code style="background:rgba(55,65,81,.6);color:rgba(212,175,55,.85);padding:1px 6px;border-radius:4px;font-size:12px">$1</code>'),e=e.replace(/\*\*(.+?)\*\*/g,'<strong style="color:#e5e7eb;font-weight:600">$1</strong>'),e=e.replace(/\*(.+?)\*/g,"<em>$1</em>"),e=e.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener" style="color:#D4AF37;text-decoration:underline">$1</a>'),e=e.replace(/^####\s+(.+)$/gm,'<h5 style="font-weight:600;color:rgba(212,175,55,.8);margin-top:8px;font-size:11px;text-transform:uppercase;letter-spacing:.5px">$1</h5>'),e=e.replace(/^###\s+(.+)$/gm,'<h4 style="font-weight:600;color:#D4AF37;margin-top:10px;font-size:14px">$1</h4>'),e=e.replace(/^##\s+(.+)$/gm,'<h3 style="font-weight:700;color:#D4AF37;margin-top:12px;font-size:16px">$1</h3>'),e=e.replace(/^#\s+(.+)$/gm,'<h2 style="font-weight:700;color:#D4AF37;margin-top:12px;font-size:18px">$1</h2>'),e=e.replace(/^[\-\*]\s+(.+)$/gm,'<li style="margin-left:16px;list-style:disc;color:#d1d5db">$1</li>'),e=e.replace(/^\d+\.\s+(.+)$/gm,'<li style="margin-left:16px;list-style:decimal;color:#d1d5db">$1</li>'),e=e.replace(/^---$/gm,'<hr style="border-color:rgba(75,85,99,.3);margin:12px 0">'),e=e.replace(/\n/g,"<br>"),e}async function ko(){if(!H.isAuthenticated()){window.location.href="/auth";return}const t=document.getElementById("app");if(!t)return;const e=vo();let a="free",s=null,i=!1,n=!1,r=null,o=!1;async function l(){try{const g=await oe.healthCheck();return o=g.status==="healthy",c(o,g.active_sessions),o}catch{return o=!1,c(!1,0),!1}}function c(g,f){document.querySelectorAll(".ev-health-dot").forEach(I=>{I.style.background=g?"linear-gradient(135deg, #10b981, #34d399)":"linear-gradient(135deg, #ef4444, #f87171)",I.style.boxShadow=g?"0 0 12px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)":"0 0 12px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",I.style.animation=g?"evPulse 2s infinite":"none"}),document.querySelectorAll(".ev-health-text").forEach(I=>{I.textContent=g?"🟢 Online":"🔴 Offline",I.style.color=g?"#10b981":"#ef4444",I.style.fontWeight="600"});const S=document.getElementById("ev-sessions");S&&(S.textContent=g?`⚡ ${f} active session${f!==1?"s":""}`:"⚠️ Backend unreachable")}function d(){const g=document.getElementById("ev-messages");if(g){if(!e.length){g.innerHTML=p(),u();return}g.innerHTML=e.map(f=>{if(f.role==="system")return`<div style="display:flex;justify-content:center;margin:12px 0"><span style="font-size:11px;color:#6b7280;background:rgba(31,41,55,.6);padding:6px 14px;border-radius:999px;border:1px solid rgba(75,85,99,.2)"><i class="fa-solid fa-info-circle" style="margin-right:6px;color:#3b82f6"></i>ℹ️ ${ke(f.content)}</span></div>`;const S=f.role==="user";return`
            <div style="display:flex;justify-content:${S?"flex-end":"flex-start"};margin-bottom:16px" class="ev-msg-row">
                ${S?"":'<div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,rgba(212,175,55,.3),rgba(212,175,55,.1));display:flex;align-items:center;justify-content:center;margin-right:12px;margin-top:2px;flex-shrink:0;border:1.5px solid rgba(212,175,55,.2);box-shadow:0 2px 8px rgba(212,175,55,.08)"><span style="font-size:16px">🤖</span></div>'}
                <div style="max-width:78%;padding:14px 18px;border-radius:18px;${S?"border-bottom-right-radius:6px;background:linear-gradient(135deg,rgba(212,175,55,.12),rgba(212,175,55,.05));border:1.5px solid rgba(212,175,55,.2)":"border-bottom-left-radius:6px;background:rgba(31,41,55,.5);border:1.5px solid rgba(55,65,81,.5)"};box-shadow:0 2px 10px rgba(0,0,0,.2)">
                    <div style="font-size:13px;line-height:1.65;color:${S?"#e5e7eb":"#d1d5db"};word-wrap:break-word">${S?ke(f.content):wo(f.content)}</div>
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;padding-top:8px;border-top:1.5px solid rgba(55,65,81,.3);gap:8px">
                        <span style="font-size:10px;color:#5a6372;font-weight:500">🕐 ${ha(f.timestamp)}</span>
                        <div style="display:flex;align-items:center;gap:8px">
                            ${f.processingTime!=null?`<span style="font-size:10px;color:#7a8794;display:flex;align-items:center;gap:3px"><i class="fa-solid fa-hourglass-end" style="color:#8b5cf6;font-size:9px"></i>⏱️ ${f.processingTime.toFixed(2)}s</span>`:""}
                            ${S?"":`<button data-copy="${f.id}" class="ev-copy" style="opacity:0;font-size:11px;color:#6b7280;cursor:pointer;background:none;border:none;transition:all .15s;padding:2px 6px;border-radius:4px;display:flex;align-items:center;gap:4px" title="📋 Copy to clipboard"><i class="fa-regular fa-copy"></i>Copy</button>`}
                        </div>
                    </div>
                </div>
                ${S?'<div style="width:36px;height:36px;border-radius:10px;background:rgba(212,175,55,.12);display:flex;align-items:center;justify-content:center;margin-left:12px;margin-top:2px;flex-shrink:0;border:1.5px solid rgba(212,175,55,.15)"><span style="font-size:16px">👤</span></div>':""}
            </div>`}).join(""),document.querySelectorAll(".ev-copy").forEach(f=>{f.addEventListener("click",()=>{const S=e.find(I=>I.id===f.dataset.copy);S&&navigator.clipboard.writeText(S.content).then(()=>{f.innerHTML='<i class="fa-solid fa-check"></i>Copied!',f.style.color="#34d399",setTimeout(()=>{f.innerHTML='<i class="fa-regular fa-copy"></i>Copy',f.style.color="#6b7280"},1500)})})}),m()}}function p(){return`
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:40px 20px;text-align:center">
            <div style="width:80px;height:80px;border-radius:20px;background:linear-gradient(135deg, #D4AF37, rgba(212,175,55,.6));border:2px solid rgba(212,175,55,.25);display:flex;align-items:center;justify-content:center;margin-bottom:32px;box-shadow:0 8px 32px rgba(212,175,55,.15), inset 0 2px 0 rgba(255,255,255,.1);position:relative;overflow:hidden" class="ev-logo-animate">
                <i class="fa-solid fa-bolt" style="color:#000;font-size:32px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))"></i>
                <div style="position:absolute;inset:0;background:linear-gradient(45deg, transparent 30%, rgba(255,255,255,.1) 50%, transparent 70%);animation:evShimmer 3s infinite"></div>
            </div>
            <h3 style="font-family:'Orbitron',sans-serif;font-size:24px;font-weight:800;margin-bottom:12px;letter-spacing:.5px;background:linear-gradient(135deg, #D4AF37, #FFD700);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 2px 8px rgba(212,175,55,.3)">🚗⚡ EV Compliance Advisor 🏆</h3>
            <p style="font-size:15px;color:#c1c7cd;max-width:480px;margin-bottom:8px;line-height:1.5;font-weight:400">🔍 Ask any question about Indian EV regulations, subsidies, licensing, or upload a document for in-depth analysis.</p>
            <p style="font-size:12px;color:#64748b;max-width:420px;margin-bottom:40px;line-height:1.4">🚀 Powered by Google Gemini │ 📊 Knowledge covers FAME II, PM E-DRIVE, PLI, state policies & more</p>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;width:100%;max-width:640px">
                ${ua.map((g,f)=>`
                <button data-chip="${f}" class="ev-chip" style="display:flex;align-items:flex-start;gap:12px;text-align:left;font-size:13px;padding:16px 18px;border-radius:16px;border:1px solid rgba(55,65,81,.3);background:linear-gradient(135deg, rgba(31,41,55,.4), rgba(17,24,39,.6));color:#d1d5db;cursor:pointer;transition:all .3s cubic-bezier(0.4, 0, 0.2, 1);line-height:1.5;position:relative;overflow:hidden;backdrop-filter:blur(8px);box-shadow:0 2px 8px rgba(0,0,0,.1)">
                    <div style="width:32px;height:32px;border-radius:8px;background:${g.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.1);font-size:18px">${g.emoji}</div>
                    <span style="font-weight:500">${ke(g.q)}</span>
                    <div style="position:absolute;inset:0;background:linear-gradient(135deg, transparent, rgba(212,175,55,.05));opacity:0;transition:opacity .3s"></div>
                </button>`).join("")}
            </div>
        </div>`}function u(){document.querySelectorAll(".ev-chip").forEach(g=>{g.addEventListener("click",()=>{g.style.transform="scale(0.98)",setTimeout(()=>{g.style.transform=""},150),v(ua[+(g.dataset.chip||"0")].q)}),g.addEventListener("mouseenter",()=>{g.style.borderColor="rgba(212,175,55,.4)",g.style.background="linear-gradient(135deg, rgba(212,175,55,.08), rgba(31,41,55,.6))",g.style.color="#f1f5f9",g.style.transform="translateY(-2px)",g.style.boxShadow="0 8px 25px rgba(212,175,55,.15), 0 2px 8px rgba(0,0,0,.1)";const f=g.querySelector("div:last-child");f&&(f.style.opacity="1")}),g.addEventListener("mouseleave",()=>{g.style.borderColor="rgba(55,65,81,.3)",g.style.background="linear-gradient(135deg, rgba(31,41,55,.4), rgba(17,24,39,.6))",g.style.color="#d1d5db",g.style.transform="",g.style.boxShadow="0 2px 8px rgba(0,0,0,.1)";const f=g.querySelector("div:last-child");f&&(f.style.opacity="0")})})}function m(){const g=document.getElementById("ev-messages");g&&requestAnimationFrame(()=>{g.scrollTop=g.scrollHeight})}function x(){const g=document.getElementById("ev-messages");if(!g)return;const f=a==="document"?"🔍 Searching document & analysing…":"🧠 Thinking…";g.insertAdjacentHTML("beforeend",`
        <div id="ev-thinking" style="display:flex;justify-content:flex-start;margin-bottom:16px;animation:evFadeIn .25s ease-out">
            <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,rgba(212,175,55,.3),rgba(212,175,55,.1));display:flex;align-items:center;justify-content:center;margin-right:12px;margin-top:2px;flex-shrink:0;border:1.5px solid rgba(212,175,55,.2);box-shadow:0 2px 8px rgba(212,175,55,.08)">
                <span style="font-size:16px">🤖</span>
            </div>
            <div style="background:rgba(31,41,55,.5);border:1.5px solid rgba(55,65,81,.5);border-radius:18px;border-bottom-left-radius:6px;padding:14px 18px;box-shadow:0 2px 10px rgba(0,0,0,.2)">
                <div style="display:flex;align-items:center;gap:12px">
                    <div style="display:flex;gap:4px">
                        <span style="width:6px;height:6px;background:rgba(212,175,55,.7);border-radius:50%;animation:evBounce .6s infinite alternate"></span>
                        <span style="width:6px;height:6px;background:rgba(212,175,55,.7);border-radius:50%;animation:evBounce .6s .15s infinite alternate"></span>
                        <span style="width:6px;height:6px;background:rgba(212,175,55,.7);border-radius:50%;animation:evBounce .6s .3s infinite alternate"></span>
                    </div>
                    <span style="font-size:12px;color:#7a8794;font-weight:500">${f}</span>
                </div>
            </div>
        </div>`),m()}function y(){document.getElementById("ev-thinking")?.remove()}async function v(g){if(i||!g.trim())return;if(!o&&!await l()){w("assistant","🚨 Backend server is offline. Please check if the API is running on port 8001 and try again. (Connection timeout after 30s)");return}const f=document.getElementById("ev-input");f&&(f.value=""),i=!0,C(!1),w("user",g,!1),d(),x();try{const S=a==="document"&&s?await oe.docChat(g,s):await oe.freeChat(g);y(),e.push({id:ma(),role:"assistant",content:S.response,timestamp:new Date,processingTime:S.processing_time})}catch(S){y();const I=S.message,j=I.includes("Failed to fetch")||I.includes("aborted");w("assistant",j?"🌐 Network error: Unable to reach the backend. Check port 8001 is running.":`⚠️ Error: ${I}`,!1),j&&(o=!1,c(!1,0))}finally{i=!1,C(!0),d(),fa(e)}}function w(g,f,S=!0){e.push({id:ma(),role:g,content:f,timestamp:new Date}),S&&(d(),fa(e))}function C(g){const f=document.getElementById("ev-send");f&&(f.disabled=!g,f.style.opacity=g?"1":".35")}async function T(g){if(!n){if(!g.name.toLowerCase().endsWith(".pdf")){b("📄 Only PDF files (.pdf) accepted.","error");return}if(g.size>50*1024*1024){b(`📦 File too large (${(g.size/1024/1024).toFixed(1)} MB > 50 MB limit).`,"error");return}n=!0,b(`📥 Uploading ${g.name}…`,"info"),E(40);try{const f=await oe.uploadPDF(g);s=f.session_id,r=g.name,a="document",E(100),b(`✅ ${g.name} — ${f.document_count} chunks processed`,"success"),B();try{const S=await oe.sessionStatus(f.session_id);S.exists&&S.document_count&&A(S)}catch{}w("system",`🎯 Document loaded: ${g.name}. Switched to document mode.`,!1),w("assistant",`✅ I've processed **${g.name}** and extracted **${f.document_count}** content chunks.

🔍 You can now ask questions about this document. I'll cross-reference with Indian EV regulations.

📍 **File hash:** \`${f.file_hash.slice(0,12)}…\` │ **Size:** ${(g.size/1024).toFixed(1)} KB`)}catch(f){E(0),b(`❌ Upload failed: ${f.message}`,"error")}finally{n=!1}}}function E(g){const f=document.getElementById("ev-upload-bar");f&&(f.style.width=`${g}%`,f.style.opacity=g>0?"1":"0")}function b(g,f){const S=document.getElementById("ev-upload-status");if(!S)return;const j={error:{color:"#f87171",icon:"fa-circle-xmark",symbol:"❌",bg:"rgba(239, 68, 68, 0.1)",border:"rgba(239, 68, 68, 0.2)"},success:{color:"#34d399",icon:"fa-circle-check",symbol:"✅",bg:"rgba(52, 211, 153, 0.1)",border:"rgba(52, 211, 153, 0.2)"},info:{color:"#D4AF37",icon:"fa-spinner fa-spin",symbol:"⏳",bg:"rgba(212, 175, 55, 0.08)",border:"rgba(212, 175, 55, 0.2)"}}[f];S.innerHTML=`<div style="display:flex;align-items:center;gap:8px;color:${j.color};background:${j.bg};border:1px solid ${j.border};padding:8px 12px;border-radius:8px;font-size:12px;font-weight:500"><span style="font-size:13px">${j.symbol}</span><i class="fa-solid ${j.icon}" style="font-size:11px"></i><span>${g}</span></div>`}function A(g){const f=document.getElementById("ev-doc-stats");!f||!g.exists||(f.innerHTML=`<div style="font-size:11px;color:#6b7280;margin-top:8px;padding:8px 12px;border-top:1.5px solid rgba(55,65,81,.3);background:rgba(31,41,55,.3);border-radius:8px;display:flex;align-items:center;gap:8px">🧩 <i class="fa-solid fa-puzzle-piece" style="color:rgba(212,175,55,.5);font-size:12px"></i><span><strong>${g.document_count} chunks</strong>${g.processed_at?` │ ⏰ ${new Date(g.processed_at*1e3).toLocaleTimeString("en-IN")}`:""}</span></div>`)}function B(){const g=document.getElementById("ev-mode");g&&(a==="document"&&r?(g.innerHTML=`<div style="display:flex;align-items:center;gap:8px;background:rgba(52,211,153,.1);border:1.5px solid rgba(52,211,153,.2);border-radius:10px;padding:6px 12px;font-size:12px;font-weight:500;color:#6ee7b7">
                📄 <i class="fa-solid fa-file-pdf" style="color:#34d399;font-size:12px"></i>
                <span style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${ke(r)}</span>
                <button id="ev-rm-doc" style="color:#6b7280;cursor:pointer;background:none;border:none;transition:color .15s;margin-left:auto;padding:2px 6px;border-radius:4px" title="🗑️ Remove document"><i class="fa-solid fa-trash" style="font-size:11px"></i></button>
            </div>`,document.getElementById("ev-rm-doc")?.addEventListener("click",k)):g.innerHTML=`<div style="display:flex;align-items:center;gap:8px;background:rgba(212,175,55,.08);border:1.5px solid rgba(212,175,55,.15);border-radius:10px;padding:6px 12px;font-size:12px;font-weight:500;color:#a1a5af">
                💬 <i class="fa-solid fa-comments" style="color:#D4AF37;font-size:12px"></i>
                <span>Free advisory mode</span>
            </div>`)}function k(){s&&oe.deleteSession(s).catch(()=>{}),s=null,r=null,a="free",B(),b("","info"),E(0);const g=document.getElementById("ev-doc-stats");g&&(g.innerHTML=""),w("system","🔄 Document removed. Switched back to free advisory mode.")}function M(){if(!e.length)return;const g=e.filter(I=>I.role!=="system").map(I=>`[${ha(I.timestamp)}] ${I.role==="user"?"You 👤":"EV Advisor 🤖"}:
${I.content}
`),f=`EVBharat EV Compliance Advisor — Chat Export 📋
${"=".repeat(60)}
⏰ Exported: ${new Date().toLocaleString("en-IN")}
📊 Total Messages: ${g.length}
${"=".repeat(60)}

${g.join(`
`)}`,S=document.createElement("a");S.href=URL.createObjectURL(new Blob([f],{type:"text/plain"})),S.download=`evbharat-chat-${Date.now()}.txt`,S.click(),URL.revokeObjectURL(S.href)}function P(){confirm("🗑️ Clear all messages? This cannot be undone.")&&(e.length=0,yo(),d(),w("system","✨ Chat cleared. Starting fresh...",!1))}t.innerHTML=`
    <style>
    @keyframes evFadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
    @keyframes evBounce { from { transform:translateY(0) } to { transform:translateY(-6px) } }
    @keyframes evPulse { 0%, 100% { opacity:1 } 50% { opacity:.7 } }
    @keyframes evShimmer { 0% { transform:translateX(-100%) } 100% { transform:translateX(100%) } }
    @keyframes evGlow { 0%, 100% { box-shadow:0 0 20px rgba(212,175,55,.2) } 50% { box-shadow:0 0 30px rgba(212,175,55,.4), 0 0 40px rgba(212,175,55,.2) } }
    .ev-logo-animate { animation:evGlow 4s infinite }
    .ev-msg-row { animation:evFadeIn .4s cubic-bezier(0.4, 0, 0.2, 1) }
    .ev-msg-row:hover .ev-copy { opacity:1 !important }
    #ev-messages::-webkit-scrollbar { width:6px }
    #ev-messages::-webkit-scrollbar-track { background:rgba(17,24,39,.3); border-radius:3px }
    #ev-messages::-webkit-scrollbar-thumb { background:linear-gradient(180deg, rgba(212,175,55,.4), rgba(212,175,55,.2)); border-radius:3px; border:1px solid rgba(55,65,81,.2) }
    #ev-messages::-webkit-scrollbar-thumb:hover { background:linear-gradient(180deg, rgba(212,175,55,.6), rgba(212,175,55,.3)) }
    .ev-sidebar::-webkit-scrollbar { width:4px }
    .ev-sidebar::-webkit-scrollbar-track { background:transparent }
    .ev-sidebar::-webkit-scrollbar-thumb { background:linear-gradient(180deg, rgba(75,85,99,.4), rgba(75,85,99,.2)); border-radius:2px }

    /* Mobile sidebar */
    @media (max-width: 767px) {
        .ev-sidebar { position:fixed !important; top:0 !important; left:0; bottom:0; z-index:50; width:280px !important; transform:translateX(-100%); transition:transform .3s ease; background:rgba(26,26,26,.98) !important; backdrop-filter:blur(12px); padding:20px !important; }
        .ev-sidebar.open { transform:translateX(0) }
        .ev-mobile-show { display:flex !important }
        .ev-mobile-hide { display:none !important }
    }
    @media (min-width: 768px) {
        .ev-mobile-show { display:none !important }
        .ev-mobile-close { display:none !important }
    }
    </style>

    <div style="min-height:100vh;background:#1a1a1a;padding-top:80px;padding-bottom:24px">
        <div style="max-width:1200px;margin:0 auto;padding:0 16px">

            <!-- Mobile toggle -->
            <button id="ev-sb-toggle" class="ev-mobile-show" style="display:none;align-items:center;gap:6px;font-size:12px;color:#9ca3af;margin-bottom:12px;cursor:pointer;background:none;border:none;font-weight:600">
                <i class="fa-solid fa-bars"></i> 📱 Menu & Upload
            </button>

            <!-- Mobile overlay -->
            <div id="ev-overlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(2px);z-index:45"></div>

            <div style="display:flex;gap:20px;align-items:flex-start">

                <!-- ═══ SIDEBAR ═══ -->
                <div id="ev-sidebar" class="ev-sidebar" style="width:240px;flex-shrink:0;position:sticky;top:100px;max-height:calc(100vh - 120px);overflow-y:auto;display:flex;flex-direction:column;gap:14px">

                    <!-- Close (mobile) -->
                    <button id="ev-sb-close" class="ev-mobile-close" style="position:absolute;top:12px;right:12px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:rgba(31,41,55,.5);color:#9ca3af;border:none;cursor:pointer;z-index:51">
                        <i class="fa-solid fa-xmark" style="font-size:13px"></i>
                    </button>

                    <!-- Brand -->
                    <div style="text-align:center;padding:12px 0;border-bottom:1.5px solid rgba(75,85,99,.2);margin-bottom:8px">
                        <h1 style="font-family:'Orbitron',sans-serif;font-size:18px;font-weight:800;line-height:1.2;margin:0;background:linear-gradient(135deg, #D4AF37, #FFD700);-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 2px 4px rgba(212,175,55,.15))">⚡ EV <span style="background:linear-gradient(135deg, #FFD700, #D4AF37);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Compliance</span> ✅</h1>
                        <p style="font-size:9px;color:#8b95a5;margin-top:4px;text-transform:uppercase;letter-spacing:2px;font-weight:700">🤖 AI-Powered Advisory Desk</p>
                    </div>

                    <!-- Status -->
                    <div style="background:linear-gradient(135deg, rgba(17,24,39,.7), rgba(31,41,55,.5));border:1px solid rgba(75,85,99,.3);border-radius:12px;padding:12px 14px;backdrop-filter:blur(8px);box-shadow:0 2px 8px rgba(0,0,0,.1)">
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                            <span class="ev-health-dot" style="width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg, #6b7280, #9ca3af);flex-shrink:0;border:1px solid rgba(255,255,255,.1)"></span>
                            <span class="ev-health-text" style="font-size:12px;color:#c1c7cd;font-weight:600">Checking…</span>
                        </div>
                        <p id="ev-sessions" style="font-size:11px;color:#7a8794;margin:0;margin-left:16px;font-weight:500;display:flex;align-items:center;gap:4px"></p>
                    </div>

                    <!-- Upload -->
                    <div style="background:linear-gradient(135deg, rgba(17,24,39,.7), rgba(31,41,55,.5));border:1px solid rgba(75,85,99,.3);border-radius:12px;padding:14px;backdrop-filter:blur(8px);box-shadow:0 2px 8px rgba(0,0,0,.1)">
                        <h4 style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#9ca3af;margin-bottom:10px;display:flex;align-items:center;gap:6px"><i class="fa-solid fa-file-pdf" style="color:#D4AF37;font-size:12px"></i>📄 PDF Analysis</h4>
                        <div id="ev-upload-area" style="position:relative;border:2px dashed rgba(212,175,55,.25);border-radius:12px;padding:20px 16px;text-align:center;cursor:pointer;transition:all .3s cubic-bezier(0.4, 0, 0.2, 1);overflow:hidden;background:linear-gradient(135deg, rgba(212,175,55,.03), rgba(17,24,39,.3))">
                            <input type="file" id="ev-file-input" accept=".pdf" style="display:none">
                            <i class="fa-solid fa-cloud-arrow-up" style="font-size:28px;color:#64748b;margin-bottom:8px;display:block;transition:all .3s"></i>
                            <p style="font-size:12px;color:#9ca3af;font-weight:500">📥 Drop PDF or <span style="color:#D4AF37;text-decoration:underline;cursor:pointer;font-weight:600">browse</span></p>
                            <p style="font-size:10px;color:#64748b;margin-top:4px">📦 Max 50 MB</p>
                            <div id="ev-upload-bar" style="position:absolute;bottom:0;left:0;height:3px;background:linear-gradient(90deg,#D4AF37,#FFD700);transition:width .8s cubic-bezier(0.4, 0, 0.2, 1);opacity:0;width:0;border-radius:0 0 12px 12px"></div>
                        </div>
                        <div id="ev-upload-status" style="margin-top:8px"></div>
                        <div id="ev-doc-stats"></div>
                    </div>

                    <!-- Capabilities -->
                    <div style="background:linear-gradient(135deg, rgba(17,24,39,.7), rgba(31,41,55,.5));border:1px solid rgba(75,85,99,.3);border-radius:12px;padding:14px;backdrop-filter:blur(8px);box-shadow:0 2px 8px rgba(0,0,0,.1)">
                        <h4 style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#9ca3af;margin-bottom:12px;display:flex;align-items:center;gap:6px"><i class="fa-solid fa-star" style="color:#FFD700;font-size:12px"></i>🎯 AI Capabilities</h4>
                        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px">
                            ${["💰 FAME II / PM E-DRIVE subsidy guidance","🗺️ State-wise EV policy analysis","🛡️ BIS / AIS safety standards","💵 GST, tax & import duty rules","🔌 Charging infra & approvals","📄 PDF document analysis"].map(g=>`<li style="display:flex;align-items:flex-start;gap:8px;font-size:11px;color:#b5bcc4;padding:6px 8px;border-radius:6px;background:rgba(212,175,55,.04);border:1px solid rgba(212,175,55,.1);transition:all .2s;cursor:default"><div style="width:16px;height:16px;border-radius:4px;background:linear-gradient(135deg, rgba(16,185,129,.25), rgba(52,211,153,.15));display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px"><i class="fa-solid fa-check" style="color:#10b981;font-size:8px;font-weight:700"></i></div><span style="line-height:1.4;font-weight:400">${g}</span></li>`).join("")}
                        </ul>
                    </div>

                    <!-- Actions -->
                    <div style="display:flex;gap:6px">
                        <button id="ev-export" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;font-size:11px;color:#a1a5af;padding:10px 12px;border-radius:8px;cursor:pointer;background:linear-gradient(135deg, rgba(31,41,55,.6), rgba(17,24,39,.4));border:1px solid rgba(75,85,99,.25);transition:all .3s;font-weight:600;text-transform:uppercase;letter-spacing:.5px" title="📥 Export this conversation">
                            <i class="fa-solid fa-download" style="font-size:10px"></i>📥 Export
                        </button>
                        <button id="ev-test-connection" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;font-size:11px;color:#a1a5af;padding:10px 12px;border-radius:8px;cursor:pointer;background:linear-gradient(135deg, rgba(31,41,55,.6), rgba(17,24,39,.4));border:1px solid rgba(75,85,99,.25);transition:all .3s;font-weight:600;text-transform:uppercase;letter-spacing:.5px" title="🔍 Ping backend API">
                            <i class="fa-solid fa-wifi" style="font-size:10px"></i>🔗 Connect
                        </button>
                        <button id="ev-clear" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;font-size:11px;color:#a1a5af;padding:10px 12px;border-radius:8px;cursor:pointer;background:linear-gradient(135deg, rgba(31,41,55,.6), rgba(17,24,39,.4));border:1px solid rgba(75,85,99,.25);transition:all .3s;font-weight:600;text-transform:uppercase;letter-spacing:.5px" title="🧹 Clear all messages">
                            <i class="fa-solid fa-trash-can" style="font-size:10px"></i>🧹 Clear
                        </button>
                    </div>

                    <p style="font-size:9px;color:#64748b;line-height:1.5;padding:8px;background:rgba(17,24,39,.3);border-radius:6px;border-left:3px solid rgba(212,175,55,.3)"><i class="fa-solid fa-triangle-exclamation" style="color:rgba(212,175,55,.6);margin-right:4px;font-size:8px"></i>AI-generated responses. Verify with official government notifications before making compliance decisions.</p>
                </div>

                <!-- ═══ MAIN CHAT ═══ -->
                <div style="flex:1;min-width:0">
                    <div style="background:linear-gradient(135deg, rgba(17,24,39,.4), rgba(31,41,55,.3));border:1px solid rgba(75,85,99,.3);border-radius:20px;display:flex;flex-direction:column;height:calc(100vh - 120px);min-height:500px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.15);backdrop-filter:blur(16px)">

                        <!-- Header -->
                        <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid rgba(75,85,99,.25);background:linear-gradient(135deg, rgba(17,24,39,.6), rgba(31,41,55,.4));backdrop-filter:blur(8px)">
                            <div style="display:flex;align-items:center;gap:12px">
                                <div style="width:36px;height:36px;border-radius:12px;background:linear-gradient(135deg, rgba(212,175,55,.25), rgba(212,175,55,.1));display:flex;align-items:center;justify-content:center;border:1px solid rgba(212,175,55,.2);box-shadow:0 4px 12px rgba(212,175,55,.1)">
                                    <i class="fa-solid fa-bolt" style="color:#D4AF37;font-size:14px"></i>
                                </div>
                                <div>
                                    <h3 style="font-family:'Orbitron',sans-serif;font-size:15px;font-weight:800;line-height:1.2;margin:0;background:linear-gradient(135deg, #D4AF37, #FFD700);-webkit-background-clip:text;-webkit-text-fill-color:transparent">EV Compliance Advisor</h3>
                                    <p style="font-size:10px;color:#9ca3af;margin:0;font-weight:500">Indian Government EV Rules & Regulations</p>
                                </div>
                            </div>
                            <div style="display:flex;align-items:center;gap:12px">
                                <div id="ev-mode"></div>
                                <div style="display:flex;align-items:center;gap:6px;background:rgba(31,41,55,.4);padding:4px 10px;border-radius:8px;border:1px solid rgba(75,85,99,.2)">
                                    <span class="ev-health-dot" style="width:6px;height:6px;border-radius:50%;background:linear-gradient(135deg, #6b7280, #9ca3af);flex-shrink:0;border:1px solid rgba(255,255,255,.05)"></span>
                                    <span class="ev-health-text" style="font-size:10px;color:#9ca3af;font-weight:500">…</span>
                                </div>
                            </div>
                        </div>

                        <!-- Messages area -->
                        <div id="ev-messages" style="flex:1;overflow-y:auto;padding:20px;background:linear-gradient(180deg, rgba(17,24,39,.15), rgba(31,41,55,.1))"></div>

                        <!-- Input bar -->
                        <div style="border-top:1px solid rgba(75,85,99,.25);padding:16px 20px;background:linear-gradient(135deg, rgba(17,24,39,.7), rgba(31,41,55,.5));backdrop-filter:blur(8px)">
                            <div style="display:flex;gap:10px">
                                <input
                                    type="text"
                                    id="ev-input"
                                    placeholder="💬 Ask about subsidies, compliance, charging, state policies…"
                                    maxlength="2000"
                                    autocomplete="off"
                                    style="flex:1;padding:12px 16px;background:rgba(31,41,55,.5);border:1.5px solid rgba(75,85,99,.3);border-radius:16px;font-size:14px;color:#f1f5f9;outline:none;transition:all .3s;font-weight:400;backdrop-filter:blur(4px)"
                                    onfocus="this.style.borderColor='rgba(212,175,55,.5)';this.style.boxShadow='0 0 0 3px rgba(212,175,55,.12)';this.style.background='rgba(31,41,55,.6)'"
                                    onblur="this.style.borderColor='rgba(75,85,99,.3)';this.style.boxShadow='none';this.style.background='rgba(31,41,55,.5)'"
                                >
                                <button
                                    id="ev-send"
                                    style="padding:12px 24px;background:linear-gradient(135deg, #D4AF37, #FFD700);border:none;border-radius:16px;color:#000;cursor:pointer;transition:all .3s;font-size:14px;font-weight:700;box-shadow:0 4px 12px rgba(212,175,55,.25);display:flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap"
                                    title="🚀 Send message (Enter)"
                                    onmouseenter="this.style.transform='translateY(-2px) scale(1.02)';this.style.boxShadow='0 8px 24px rgba(212,175,55,.35)'"
                                    onmouseleave="this.style.transform='';this.style.boxShadow='0 4px 12px rgba(212,175,55,.25)'"
                                >
                                    <i class="fa-solid fa-paper-plane"></i><span>Send</span>
                                </button>
                            </div>
                            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;padding:0 4px">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;const L=document.getElementById("ev-upload-area"),Z=document.getElementById("ev-file-input"),Q=document.getElementById("ev-input"),Ht=document.getElementById("ev-send");L.addEventListener("click",()=>Z.click()),L.addEventListener("dragover",g=>{g.preventDefault(),L.style.borderColor="rgba(212,175,55,.5)",L.style.background="linear-gradient(135deg, rgba(212,175,55,.08), rgba(255,215,0,.04))",L.style.transform="scale(1.02)";const f=L.querySelector("i");f&&(f.style.color="#D4AF37",f.style.transform="scale(1.1)")}),L.addEventListener("dragleave",g=>{g.preventDefault(),L.style.borderColor="rgba(212,175,55,.25)",L.style.background="linear-gradient(135deg, rgba(212,175,55,.03), rgba(17,24,39,.3))",L.style.transform="";const f=L.querySelector("i");f&&(f.style.color="#64748b",f.style.transform="")}),L.addEventListener("drop",g=>{g.preventDefault(),L.style.borderColor="rgba(212,175,55,.25)",L.style.background="linear-gradient(135deg, rgba(212,175,55,.03), rgba(17,24,39,.3))",L.style.transform="";const f=L.querySelector("i");f&&(f.style.color="#64748b",f.style.transform=""),g.dataTransfer?.files[0]&&T(g.dataTransfer.files[0])}),Z.addEventListener("change",()=>{Z.files?.[0]&&T(Z.files[0])}),Ht.addEventListener("click",()=>v(Q.value.trim())),Q.addEventListener("keydown",g=>{g.key==="Enter"&&!g.shiftKey&&(g.preventDefault(),v(Q.value.trim()))});const qe=document.getElementById("ev-sidebar"),he=document.getElementById("ev-overlay"),q=()=>{qe.classList.add("open"),he.style.display="block"},N=()=>{qe.classList.remove("open"),he.style.display="none"};document.getElementById("ev-sb-toggle")?.addEventListener("click",q),document.getElementById("ev-sb-close")?.addEventListener("click",N),he.addEventListener("click",N),document.getElementById("ev-export")?.addEventListener("click",M),document.getElementById("ev-clear")?.addEventListener("click",P),document.getElementById("ev-test-connection")?.addEventListener("click",async()=>{w("system","🔍 Testing backend connection..."),await l()?w("system",`✅ Backend is healthy! API running on port 8001 │ ${new Date().toLocaleTimeString("en-IN")}`):w("system","❌ Connection failed – verify backend is running (port 8001). Check console (F12) for details.")}),["ev-export","ev-clear","ev-test-connection"].forEach(g=>{const f=document.getElementById(g);if(f){const S=g==="ev-clear"?"#f87171":g==="ev-test-connection"?"#60a5fa":"#D4AF37",I=g==="ev-clear"?"248,113,113":g==="ev-test-connection"?"96,165,250":"212,175,55";f.addEventListener("mouseenter",()=>{f.style.color=S,f.style.background=`linear-gradient(135deg, rgba(${I},.12), rgba(${I},.06))`,f.style.borderColor=`rgba(${I},.35)`,f.style.transform="translateY(-2px)",f.style.boxShadow=`0 6px 16px rgba(${I},.2)`}),f.addEventListener("mouseleave",()=>{f.style.color="#a1a5af",f.style.background="linear-gradient(135deg, rgba(31,41,55,.6), rgba(17,24,39,.4))",f.style.borderColor="rgba(75,85,99,.25)",f.style.transform="",f.style.boxShadow="none"})}}),B(),d(),l();const Re=setInterval(l,3e4),be=new MutationObserver(()=>{document.getElementById("ev-messages")||(clearInterval(Re),be.disconnect())});be.observe(t,{childList:!0})}async function Eo(){if(!H.isAuthenticated()){window.location.href="/auth";return}const t=document.getElementById("app");if(t){if(!document.querySelector('link[href*="font-awesome"]')){const e=document.createElement("link");e.rel="stylesheet",e.href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",document.head.appendChild(e)}t.innerHTML=`
        <!-- Map & Route Planner Page -->
        <div class="min-h-screen bg-pagani-black pt-24 pb-12">
            <!-- Header Section -->
            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-6">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 fade-in-section">
                    <div>
                        <div class="flex items-center gap-3 mb-2">
                            <i class="fa-solid fa-route text-3xl text-pagani-gold"></i>
                            <h1 class="text-3xl md:text-4xl font-orbitron font-bold">Smart Route Planner</h1>
                        </div>
                        <p class="text-gray-400">AI-Optimized Routes with Battery & Traffic Awareness</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg">
                            <i class="fa-solid fa-satellite-dish text-green-400 animate-pulse"></i>
                            <span class="text-sm text-green-400 font-orbitron">GPS ACTIVE</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="max-w-7xl mx-auto px-4 md:px-8">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Left Panel - Route Planning -->
                    <div class="lg:col-span-1 space-y-6">
                        <!-- Route Input -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-location-dot text-pagani-gold"></i>
                                Plan Your Route
                            </h3>
                            
                            <div class="space-y-4">
                                <div class="relative">
                                    <div class="absolute left-3 top-1/2 -translate-y-1/2">
                                        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                                    </div>
                                    <input 
                                        type="text" 
                                        id="start-location"
                                        class="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pagani-gold transition-all" 
                                        placeholder="Enter starting point"
                                    />
                                </div>

                                <div class="relative">
                                    <div class="absolute left-3 top-1/2 -translate-y-1/2">
                                        <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                                    </div>
                                    <input 
                                        type="text" 
                                        id="end-location"
                                        class="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pagani-gold transition-all" 
                                        placeholder="Enter destination"
                                    />
                                </div>

                                <button 
                                    id="calculate-route-btn"
                                    class="w-full py-3 bg-gradient-to-r from-pagani-gold to-bright-gold text-black font-orbitron font-bold rounded-lg hover:shadow-lg hover:shadow-pagani-gold/50 transition-all uppercase tracking-wider text-sm"
                                >
                                    <i class="fa-solid fa-magnifying-glass-location mr-2"></i> Calculate Route
                                </button>
                            </div>
                        </div>

                        <!-- Current Battery Status -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section" style="animation-delay: 100ms">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-car-battery text-pagani-gold"></i>
                                Vehicle Status
                            </h3>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="text-center p-3 bg-pagani-black/50 rounded-lg">
                                    <p class="text-2xl font-orbitron font-bold text-green-400">87%</p>
                                    <p class="text-xs text-gray-400 mt-1">Battery</p>
                                </div>
                                <div class="text-center p-3 bg-pagani-black/50 rounded-lg">
                                    <p class="text-2xl font-orbitron font-bold text-pagani-gold">392km</p>
                                    <p class="text-xs text-gray-400 mt-1">Range</p>
                                </div>
                            </div>
                            <div class="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                <p class="text-xs text-blue-400">
                                    <i class="fa-solid fa-info-circle mr-1"></i>
                                    Enter route details to calculate optimal charging strategy.
                                </p>
                            </div>
                        </div>

                        <!-- Route Options -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section" style="animation-delay: 200ms">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-signs-post text-pagani-gold"></i>
                                Route Options
                            </h3>
                            <div class="space-y-3" id="route-options">
                                <!-- Routes will be populated by JS -->
                            </div>
                        </div>
                    </div>

                    <!-- Right Panel - Map & Details -->
                    <div class="lg:col-span-2 space-y-6">
                        <!-- Map Container -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl overflow-hidden fade-in-section" style="animation-delay: 150ms">
                            <div class="relative h-[400px] lg:h-[450px] bg-gray-800">
                                <!-- Real Google Map -->
                                <div id="google-map" class="absolute inset-0"></div>
                                <!-- Loading overlay (shown until map loads) -->
                                <div id="map-loading" class="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
                                    <div class="text-center">
                                        <i class="fa-solid fa-spinner animate-spin text-pagani-gold text-3xl mb-3"></i>
                                        <p class="text-gray-400 text-sm font-orbitron">Loading Map...</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Trip Summary -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section" style="animation-delay: 250ms">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-chart-pie text-pagani-gold"></i>
                                Trip Analysis
                            </h3>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div class="text-center p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                                    <i class="fa-solid fa-road text-2xl text-pagani-gold mb-2"></i>
                                    <p class="text-2xl font-orbitron font-bold" data-trip="km">--</p>
                                    <p class="text-xs text-gray-400 mt-1">Kilometers</p>
                                </div>
                                <div class="text-center p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                                    <i class="fa-solid fa-clock text-2xl text-blue-400 mb-2"></i>
                                    <p class="text-2xl font-orbitron font-bold" data-trip="dur">--</p>
                                    <p class="text-xs text-gray-400 mt-1">Duration</p>
                                </div>
                                <div class="text-center p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                                    <i class="fa-solid fa-bolt text-2xl text-yellow-400 mb-2"></i>
                                    <p class="text-2xl font-orbitron font-bold" data-trip="energy">-- kWh</p>
                                    <p class="text-xs text-gray-400 mt-1">Energy Needed</p>
                                </div>
                                <div class="text-center p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                                    <i class="fa-solid fa-charging-station text-2xl text-green-400 mb-2"></i>
                                    <p class="text-2xl font-orbitron font-bold" data-trip="stops">--</p>
                                    <p class="text-xs text-gray-400 mt-1">Charging Stops</p>
                                </div>
                            </div>
                        </div>

                        <!-- Charging Stations Along Route -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section" style="animation-delay: 300ms">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center justify-between">
                                <span class="flex items-center gap-2">
                                    <i class="fa-solid fa-charging-station text-pagani-gold"></i>
                                    Charging Stations
                                </span>
                                <span class="text-sm text-gray-400 font-normal">5 stations found</span>
                            </h3>
                            <div class="space-y-3" id="charging-stations">
                                <!-- Stations will be populated by JS -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,setTimeout(()=>{Mo(),Ao()},100)}}let $=null,W=null,mt=null,K=null,G=null,Xe=null,Je=null;const So=[{lat:27.9878,lng:76.3867,name:"Tata Power EV Station",address:"NH-48, Neemrana"},{lat:27.875,lng:76.2795,name:"EESL Charging Hub",address:"Behror Service Area"},{lat:27.399,lng:75.971,name:"Fortum Charge Station",address:"Shahpura, NH-48"},{lat:27.0505,lng:75.857,name:"ChargeZone Ultra",address:"Near Jaipur Toll"},{lat:26.945,lng:75.7625,name:"Statiq Hypercharger",address:"Jaipur Ring Road"}],To=[{featureType:"poi.business",stylers:[{visibility:"off"}]},{featureType:"poi.medical",stylers:[{visibility:"off"}]},{featureType:"poi.school",stylers:[{visibility:"off"}]},{featureType:"road.highway",elementType:"geometry",stylers:[{color:"#4285f4"},{weight:1}]},{featureType:"road.arterial",elementType:"geometry",stylers:[{color:"#34a853"}]}];async function Ao(){try{const e=await fetch("/api/maps/key");if(!e.ok)throw new Error(`Key endpoint returned ${e.status}`);const a=await e.json();if(!a.key)throw new Error("No key in response");const s=a.key;if(typeof google>"u"||!google.maps){document.querySelectorAll('script[src*="maps.googleapis.com"]').forEach(n=>n.remove());const i="__evbInitMap_"+Date.now();await new Promise((n,r)=>{window[i]=()=>{delete window[i],n()};const o=document.createElement("script");o.src=`https://maps.googleapis.com/maps/api/js?key=${s}&libraries=places&callback=${i}`,o.async=!0,o.onerror=()=>{delete window[i],r(new Error("Google Maps script failed to load"))},document.head.appendChild(o),setTimeout(()=>r(new Error("Google Maps load timed out")),15e3)})}Co()}catch(e){console.error("[EVBharat] Google Maps load error:",e),As(String(e))}}function As(t){const e=document.getElementById("map-loading");e&&(e.innerHTML=`
            <div class="text-center">
                <i class="fa-solid fa-triangle-exclamation text-red-400 text-3xl mb-3"></i>
                <p class="text-red-400 text-sm font-orbitron mb-1">Failed to load map</p>
                <p class="text-gray-500 text-xs">${t}</p>
            </div>`)}function Co(){const t=document.getElementById("google-map");if(!t){console.error("[EVBharat] #google-map container not found");return}if(typeof google>"u"){console.error("[EVBharat] google is undefined");return}try{$=new google.maps.Map(t,{center:{lat:27.5,lng:76.5},zoom:7,mapTypeId:google.maps.MapTypeId.ROADMAP,styles:To,disableDefaultUI:!1,zoomControl:!0,zoomControlOptions:{position:google.maps.ControlPosition.RIGHT_TOP},mapTypeControl:!0,mapTypeControlOptions:{style:google.maps.MapTypeControlStyle.HORIZONTAL_BAR,position:google.maps.ControlPosition.TOP_CENTER,mapTypeIds:[google.maps.MapTypeId.ROADMAP,google.maps.MapTypeId.SATELLITE,google.maps.MapTypeId.HYBRID,google.maps.MapTypeId.TERRAIN]},streetViewControl:!0,streetViewControlOptions:{position:google.maps.ControlPosition.RIGHT_TOP},fullscreenControl:!0,fullscreenControlOptions:{position:google.maps.ControlPosition.RIGHT_TOP},scaleControl:!0,gestureHandling:"greedy"}),mt=new google.maps.StreetViewService,W=new google.maps.DirectionsRenderer({map:$,suppressMarkers:!0,polylineOptions:{strokeColor:"#22c55e",strokeWeight:5,strokeOpacity:.9}}),So.forEach((a,s)=>{const i=new google.maps.Marker({position:{lat:a.lat,lng:a.lng},map:$,title:`${a.name} - Right-click for Street View`,icon:{path:google.maps.SymbolPath.CIRCLE,scale:s===0?10:8,fillColor:s===0?"#eab308":"#3b82f6",fillOpacity:.95,strokeColor:"#000000",strokeWeight:2}}),n=`
                <div style="color:#000;font-family:sans-serif;padding:4px 0">
                    <strong style="font-size:14px">${a.name}</strong><br>
                    <span style="color:#555;font-size:12px">${a.address}</span>
                    ${s===0?'<br><span style="background:#eab308;color:#000;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:bold;margin-top:4px;display:inline-block">RECOMMENDED STOP</span>':""}
                    <br><small style="color:#888;font-size:10px">Right-click for Street View</small>
                </div>`,r=new google.maps.InfoWindow({content:n});i.addListener("click",()=>r.open($,i)),Ft(i,{lat:a.lat,lng:a.lng})});const e=document.getElementById("map-loading");e&&(e.style.display="none"),console.log("[EVBharat] Google Map initialized successfully")}catch(e){console.error("[EVBharat] initGoogleMap error:",e),As(String(e))}}function Cs(t,e){if(!$)return;const a=new google.maps.OverlayView;a.onAdd=function(){const s=document.createElement("div");s.style.cssText="position:absolute;background:#ffffff;color:#1565c0;padding:2px 8px;border-radius:4px;font-size:11px;font-family:Orbitron,sans-serif;white-space:nowrap;border:1px solid rgba(21,101,192,0.3);pointer-events:none;transform:translate(-50%,8px);box-shadow:0 2px 4px rgba(0,0,0,0.1)",s.textContent=e,this.getPanes()?.overlayLayer.appendChild(s),a.draw=function(){const n=this.getProjection().fromLatLngToDivPixel(t.getPosition());n&&(s.style.left=n.x+"px",s.style.top=n.y+"px")}},a.setMap($)}function Mo(){Io();const t=document.getElementById("route-options");if(t){const i=[{id:"1",name:"Energy Efficient",distance:268,duration:"4h 15m",energyConsumption:42,chargingStops:1,traffic:"low",recommended:!0},{id:"2",name:"Fastest Route",distance:255,duration:"3h 45m",energyConsumption:48,chargingStops:1,traffic:"high",recommended:!1},{id:"3",name:"Scenic Route",distance:295,duration:"5h 00m",energyConsumption:52,chargingStops:2,traffic:"low",recommended:!1}];t.innerHTML=i.map(n=>`
            <div class="route-option p-4 bg-pagani-black/50 border ${n.recommended?"border-pagani-gold":"border-pagani-gold/20"} rounded-lg cursor-pointer hover:border-pagani-gold transition-all ${n.recommended?"ring-2 ring-pagani-gold/30":""}">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                        ${n.recommended?'<span class="px-2 py-0.5 bg-pagani-gold text-black text-xs font-bold rounded">AI PICK</span>':""}
                        <span class="font-orbitron font-bold">${n.name}</span>
                    </div>
                    <span class="text-sm text-gray-400">${n.distance} km</span>
                </div>
                <div class="flex items-center gap-4 text-xs text-gray-400">
                    <span><i class="fa-solid fa-clock mr-1"></i>${n.duration}</span>
                    <span><i class="fa-solid fa-bolt mr-1"></i>${n.energyConsumption} kWh</span>
                    <span><i class="fa-solid fa-charging-station mr-1"></i>${n.chargingStops} stops</span>
                    <span class="${n.traffic==="low"?"text-green-400":n.traffic==="medium"?"text-yellow-400":"text-red-400"}">
                        <i class="fa-solid fa-traffic-light mr-1"></i>${n.traffic}
                    </span>
                </div>
            </div>
        `).join("")}const e=document.getElementById("charging-stations");if(e){const i=[{id:"1",name:"Tata Power EV Station",address:"NH-48, Neemrana",distance:125,connectors:["CCS2","CHAdeMO"],available:3,total:4,power:"50kW DC",price:"₹18/kWh",rating:4.5,amenities:["Restroom","Café","WiFi"]},{id:"2",name:"EESL Charging Hub",address:"Behror Service Area",distance:148,connectors:["CCS2","Type 2"],available:2,total:6,power:"22kW AC",price:"₹12/kWh",rating:4.2,amenities:["Restroom","Food Court"]},{id:"3",name:"Fortum Charge Station",address:"Shahpura, NH-48",distance:185,connectors:["CCS2"],available:4,total:4,power:"150kW DC",price:"₹22/kWh",rating:4.8,amenities:["Lounge","Restroom","Café","WiFi"]},{id:"4",name:"ChargeZone Ultra",address:"Near Jaipur Toll",distance:230,connectors:["CCS2","CHAdeMO","Type 2"],available:5,total:8,power:"60kW DC",price:"₹16/kWh",rating:4.3,amenities:["Restroom","Parking"]},{id:"5",name:"Statiq Hypercharger",address:"Jaipur Ring Road",distance:262,connectors:["CCS2"],available:2,total:3,power:"120kW DC",price:"₹20/kWh",rating:4.6,amenities:["Mall","Restroom","Food"]}];e.innerHTML=i.map((n,r)=>`
            <div class="p-4 bg-pagani-black/50 border border-pagani-gold/10 rounded-lg hover:border-pagani-gold/30 transition-all ${r===0?"ring-2 ring-yellow-500/30 border-yellow-500/50":""}">
                <div class="flex items-start justify-between gap-4">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            ${r===0?'<span class="px-2 py-0.5 bg-yellow-500 text-black text-xs font-bold rounded">RECOMMENDED</span>':""}
                            <h4 class="font-orbitron font-bold">${n.name}</h4>
                        </div>
                        <p class="text-xs text-gray-400 mb-2">${n.address}</p>
                        <div class="flex flex-wrap gap-2 mb-2">
                            ${n.connectors.map(o=>`<span class="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">${o}</span>`).join("")}
                            <span class="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">${n.power}</span>
                        </div>
                        <div class="flex items-center gap-3 text-xs text-gray-400">
                            <span><i class="fa-solid fa-location-dot mr-1"></i>${n.distance} km</span>
                            <span class="${n.available>0?"text-green-400":"text-red-400"}">
                                <i class="fa-solid fa-plug mr-1"></i>${n.available}/${n.total} available
                            </span>
                            <span><i class="fa-solid fa-indian-rupee-sign mr-1"></i>${n.price}</span>
                            <span class="text-yellow-400"><i class="fa-solid fa-star mr-1"></i>${n.rating}</span>
                        </div>
                    </div>
                    <button class="px-4 py-2 bg-pagani-gold/20 border border-pagani-gold/50 rounded-lg text-pagani-gold text-xs font-orbitron hover:bg-pagani-gold hover:text-black transition-all whitespace-nowrap">
                        Navigate
                    </button>
                </div>
            </div>
        `).join("")}document.getElementById("calculate-route-btn")?.addEventListener("click",()=>{Lo()}),Vo();const s=document.querySelectorAll(".route-option");s.forEach(i=>{i.addEventListener("click",()=>{s.forEach(n=>{n.classList.remove("border-pagani-gold","ring-2","ring-pagani-gold/30"),n.classList.add("border-pagani-gold/20")}),i.classList.remove("border-pagani-gold/20"),i.classList.add("border-pagani-gold","ring-2","ring-pagani-gold/30")})})}function _(t,e){const a=document.createElement("div");a.className=`fixed top-24 right-8 px-6 py-4 rounded-lg backdrop-blur-sm z-50 font-orbitron text-sm fade-in-section ${e==="success"?"bg-green-500/20 border border-green-500/50 text-green-400":"bg-red-500/20 border border-red-500/50 text-red-400"}`,a.innerHTML=`<i class="fa-solid ${e==="success"?"fa-check-circle":"fa-exclamation-circle"} mr-2"></i>${t}`,document.body.appendChild(a),setTimeout(()=>a.remove(),3e3)}function Io(){setTimeout(()=>{if(typeof google>"u"||!google.maps.places)return;const t=document.getElementById("start-location"),e=document.getElementById("end-location");if(t&&e){const a={componentRestrictions:{country:"IN"},fields:["place_id","geometry","name","formatted_address"],types:["(cities)"]};Xe=new google.maps.places.Autocomplete(t,a),Je=new google.maps.places.Autocomplete(e,a),Xe.addListener("place_changed",()=>{const s=Xe.getPlace();s.geometry?.location&&Ot(s.geometry.location,s.name||s.formatted_address||"Origin")}),Je.addListener("place_changed",()=>{const s=Je.getPlace();s.geometry?.location&&Ms(s.geometry.location,s.name||s.formatted_address||"Destination")}),t.addEventListener("input",s=>{s.target.value.trim()||(K&&(K.setMap(null),K=null),W&&(W.setMap(null),W.setMap($)),_e())}),e.addEventListener("input",s=>{s.target.value.trim()||(G&&(G.setMap(null),G=null),W&&(W.setMap(null),W.setMap($)),_e())})}},1e3)}function Ot(t,e){if(!$)return;const a={lat:t.lat(),lng:t.lng()};K?(K.setPosition(a),K.setTitle(`${e} - Right-click for Street View`)):(K=new google.maps.Marker({position:a,map:$,title:`${e} - Right-click for Street View`,icon:{path:google.maps.SymbolPath.CIRCLE,scale:12,fillColor:"#22c55e",fillOpacity:1,strokeColor:"#000000",strokeWeight:3}}),Ft(K)),Cs(K,e)}function Ms(t,e){if(!$)return;const a={lat:t.lat(),lng:t.lng()};G?(G.setPosition(a),G.setTitle(`${e} - Right-click for Street View`)):(G=new google.maps.Marker({position:a,map:$,title:`${e} - Right-click for Street View`,icon:{path:google.maps.SymbolPath.CIRCLE,scale:12,fillColor:"#ef4444",fillOpacity:1,strokeColor:"#000000",strokeWeight:3}}),Ft(G)),Cs(G,e)}function Lo(){const t=document.getElementById("calculate-route-btn"),e=document.getElementById("start-location"),a=document.getElementById("end-location");if(!t||!e||!a)return;const s=e.value.trim(),i=a.value.trim();if(!s||!i){_("Please enter both origin and destination","error");return}if(t.innerHTML='<i class="fa-solid fa-spinner animate-spin mr-2"></i> Calculating...',typeof google<"u"&&$&&W){const n=new google.maps.DirectionsService,r=new google.maps.Geocoder;Promise.all([ba(r,s),ba(r,i)]).then(([o,l])=>{o&&l?(Ot(o.geometry.location,o.formatted_address),Ms(l.geometry.location,l.formatted_address),n.route({origin:o.geometry.location,destination:l.geometry.location,travelMode:google.maps.TravelMode.DRIVING,unitSystem:google.maps.UnitSystem.METRIC},(c,d)=>{if(d===google.maps.DirectionsStatus.OK&&c){W.setDirections(c);const p=c.routes[0]?.legs[0];if(p){const m=Math.round((p.distance?.value??0)/1e3),x=document.querySelector('[data-trip="km"]'),y=document.querySelector('[data-trip="dur"]'),v=document.querySelector('[data-trip="energy"]'),w=document.querySelector('[data-trip="stops"]');x&&(x.textContent=String(m)),y&&(y.textContent=p.duration?.text??"");const C=Math.round(m*.2);v&&(v.textContent=`${C} kWh`);const T=392,E=m>T?Math.ceil((m-T)/300):0;w&&(w.textContent=String(E));const b=document.querySelector(".bg-blue-500\\/10 p");b&&(E===0?(b.innerHTML=`
                                        <i class="fa-solid fa-check-circle mr-1"></i>
                                        Your current range covers this ${m}km trip without charging stops needed.
                                    `,b.parentElement.className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg",b.className="text-xs text-green-400"):(b.innerHTML=`
                                        <i class="fa-solid fa-lightbulb mr-1"></i>
                                        Your ${m}km trip will need ${E} charging stop${E>1?"s":""}.
                                    `,b.parentElement.className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg",b.className="text-xs text-yellow-400"))}const u=new google.maps.LatLngBounds;u.extend(o.geometry.location),u.extend(l.geometry.location),$.fitBounds(u,{top:40,right:40,bottom:40,left:40}),t.innerHTML='<i class="fa-solid fa-check mr-2"></i> Route Calculated!',_(`Route from ${o.address_components?.[0]?.long_name} to ${l.address_components?.[0]?.long_name} calculated`,"success")}else Bo(d);setTimeout(()=>{t.innerHTML='<i class="fa-solid fa-magnifying-glass-location mr-2"></i> Calculate Route'},3e3)})):(t.innerHTML='<i class="fa-solid fa-exclamation-triangle mr-2"></i> Invalid Locations',_("Could not find one or both locations. Please check spelling.","error"),_e(),setTimeout(()=>{t.innerHTML='<i class="fa-solid fa-magnifying-glass-location mr-2"></i> Calculate Route'},3e3))})}else setTimeout(()=>{t.innerHTML='<i class="fa-solid fa-check mr-2"></i> Route Calculated!',_("Route calculated with fallback method","success"),setTimeout(()=>{t.innerHTML='<i class="fa-solid fa-magnifying-glass-location mr-2"></i> Calculate Route'},2e3)},1500)}function ba(t,e){return new Promise(a=>{t.geocode({address:e,componentRestrictions:{country:"IN"}},(s,i)=>{i===google.maps.GeocoderStatus.OK&&s?.[0]?a(s[0]):a(null)})})}function Bo(t){const e=document.getElementById("calculate-route-btn");if(!e)return;let a="Could not calculate route";switch(t){case google.maps.DirectionsStatus.NOT_FOUND:a="One or both locations not found";break;case google.maps.DirectionsStatus.ZERO_RESULTS:a="No route found between these locations";break;case google.maps.DirectionsStatus.OVER_QUERY_LIMIT:a="Too many requests. Please try again later.";break;case google.maps.DirectionsStatus.REQUEST_DENIED:a="Directions request denied";break}e.innerHTML='<i class="fa-solid fa-exclamation-triangle mr-2"></i> Route Failed',_(a,"error"),_e()}function _e(){const t=document.querySelector('[data-trip="km"]'),e=document.querySelector('[data-trip="dur"]'),a=document.querySelector('[data-trip="energy"]'),s=document.querySelector('[data-trip="stops"]');t&&(t.textContent="--"),e&&(e.textContent="--"),a&&(a.textContent="-- kWh"),s&&(s.textContent="--");const i=document.querySelector(".bg-green-500\\/10 p, .bg-yellow-500\\/10 p, .bg-blue-500\\/10 p");i&&(i.innerHTML=`
            <i class="fa-solid fa-info-circle mr-1"></i>
            Enter route details to calculate optimal charging strategy.
        `,i.parentElement.className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg",i.className="text-xs text-blue-400")}function Vo(){const t=document.getElementById("start-location");if(t&&!document.getElementById("current-location-btn")){const e=t.parentElement;if(e){const a=document.createElement("button");a.id="current-location-btn",a.type="button",a.className="absolute right-3 top-1/2 -translate-y-1/2 text-pagani-gold hover:text-bright-gold transition-colors",a.innerHTML='<i class="fa-solid fa-location-crosshairs text-sm"></i>',a.title="Use current location",a.addEventListener("click",()=>{"geolocation"in navigator?(a.innerHTML='<i class="fa-solid fa-spinner animate-spin text-sm"></i>',navigator.geolocation.getCurrentPosition(s=>{const i=s.coords.latitude,n=s.coords.longitude;typeof google<"u"&&new google.maps.Geocoder().geocode({location:{lat:i,lng:n}},(o,l)=>{a.innerHTML='<i class="fa-solid fa-location-crosshairs text-sm"></i>',l===google.maps.GeocoderStatus.OK&&o?.[0]?(t.value=o[0].formatted_address,Ot(new google.maps.LatLng(i,n),"Current Location"),_("Current location detected","success")):_("Could not determine address from location","error")})},s=>{a.innerHTML='<i class="fa-solid fa-location-crosshairs text-sm"></i>',_("Location access denied or unavailable","error")})):_("Geolocation not supported by this browser","error")}),e.appendChild(a)}}}function Ft(t,e){t.addListener("rightclick",()=>{const a=t.getPosition();a&&xa({lat:a.lat(),lng:a.lng()})}),t.addListener("dblclick",()=>{const a=t.getPosition();a&&xa({lat:a.lat(),lng:a.lng()})})}function xa(t){!mt||!$||mt.getPanorama({location:t,radius:1e3,source:google.maps.StreetViewSource.DEFAULT},(e,a)=>{if(a===google.maps.StreetViewStatus.OK&&e?.location?.latLng){const s=$.getStreetView();s.setPosition(e.location.latLng),s.setPov({heading:0,pitch:0}),s.setVisible(!0),_("Street View opened. Click the X or press Esc to return.","success")}else _("No Street View coverage at this location.","error")})}async function Ro(){if(!H.isAuthenticated()){window.location.href="/auth";return}const t=document.getElementById("app");if(t){if(!document.querySelector('link[href*="font-awesome"]')){const e=document.createElement("link");e.rel="stylesheet",e.href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",document.head.appendChild(e)}t.innerHTML=`
        <!-- Alerts Page -->
        <div class="min-h-screen bg-pagani-black pt-24 pb-12">
            <!-- Header Section -->
            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 fade-in-section">
                    <div>
                        <div class="flex items-center gap-3 mb-2">
                            <i class="fa-solid fa-bell text-3xl text-pagani-gold"></i>
                            <h1 class="text-3xl md:text-4xl font-orbitron font-bold">Alert Center</h1>
                        </div>
                        <p class="text-gray-400">Real-time Alerts, Safety Notifications & Emergency Response</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <button id="mark-all-read" class="px-4 py-2 bg-pagani-gold/20 border border-pagani-gold/50 rounded-lg text-pagani-gold text-sm font-orbitron hover:bg-pagani-gold hover:text-black transition-all">
                            <i class="fa-solid fa-check-double mr-2"></i>Mark All Read
                        </button>
                        <button id="alert-settings" class="px-4 py-2 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white text-sm hover:border-pagani-gold transition-all">
                            <i class="fa-solid fa-gear"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Alert Stats -->
            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-gradient-to-br from-red-500/20 to-red-900/10 border border-red-500/30 rounded-xl p-4 fade-in-section">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-xs text-red-400 uppercase tracking-wider">Critical</p>
                                <p class="text-3xl font-orbitron font-bold text-red-400" id="critical-count">1</p>
                            </div>
                            <i class="fa-solid fa-circle-exclamation text-3xl text-red-500/50"></i>
                        </div>
                    </div>
                    <div class="bg-gradient-to-br from-yellow-500/20 to-yellow-900/10 border border-yellow-500/30 rounded-xl p-4 fade-in-section" style="animation-delay: 50ms">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-xs text-yellow-400 uppercase tracking-wider">Warnings</p>
                                <p class="text-3xl font-orbitron font-bold text-yellow-400" id="warning-count">3</p>
                            </div>
                            <i class="fa-solid fa-triangle-exclamation text-3xl text-yellow-500/50"></i>
                        </div>
                    </div>
                    <div class="bg-gradient-to-br from-blue-500/20 to-blue-900/10 border border-blue-500/30 rounded-xl p-4 fade-in-section" style="animation-delay: 100ms">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-xs text-blue-400 uppercase tracking-wider">Info</p>
                                <p class="text-3xl font-orbitron font-bold text-blue-400" id="info-count">5</p>
                            </div>
                            <i class="fa-solid fa-circle-info text-3xl text-blue-500/50"></i>
                        </div>
                    </div>
                    <div class="bg-gradient-to-br from-green-500/20 to-green-900/10 border border-green-500/30 rounded-xl p-4 fade-in-section" style="animation-delay: 150ms">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-xs text-green-400 uppercase tracking-wider">Resolved</p>
                                <p class="text-3xl font-orbitron font-bold text-green-400" id="resolved-count">12</p>
                            </div>
                            <i class="fa-solid fa-circle-check text-3xl text-green-500/50"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div class="max-w-7xl mx-auto px-4 md:px-8">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Main Alerts List -->
                    <div class="lg:col-span-2 space-y-6">
                        <!-- Filter Tabs -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-4 fade-in-section">
                            <div class="flex flex-wrap gap-2">
                                <button class="alert-filter active px-4 py-2 bg-pagani-gold text-black text-sm font-orbitron rounded-lg transition-all" data-filter="all">
                                    All Alerts
                                </button>
                                <button class="alert-filter px-4 py-2 bg-pagani-black/50 border border-pagani-gold/20 text-white text-sm font-orbitron rounded-lg hover:border-pagani-gold transition-all" data-filter="battery">
                                    <i class="fa-solid fa-car-battery mr-1"></i> Battery
                                </button>
                                <button class="alert-filter px-4 py-2 bg-pagani-black/50 border border-pagani-gold/20 text-white text-sm font-orbitron rounded-lg hover:border-pagani-gold transition-all" data-filter="safety">
                                    <i class="fa-solid fa-shield-halved mr-1"></i> Safety
                                </button>
                                <button class="alert-filter px-4 py-2 bg-pagani-black/50 border border-pagani-gold/20 text-white text-sm font-orbitron rounded-lg hover:border-pagani-gold transition-all" data-filter="v2e">
                                    <i class="fa-solid fa-tower-broadcast mr-1"></i> V2E
                                </button>
                                <button class="alert-filter px-4 py-2 bg-pagani-black/50 border border-pagani-gold/20 text-white text-sm font-orbitron rounded-lg hover:border-pagani-gold transition-all" data-filter="emergency">
                                    <i class="fa-solid fa-truck-medical mr-1"></i> Emergency
                                </button>
                            </div>
                        </div>

                        <!-- Alerts List -->
                        <div class="space-y-4" id="alerts-list">
                            <!-- Alerts will be populated by JS -->
                        </div>
                    </div>

                    <!-- Right Sidebar -->
                    <div class="lg:col-span-1 space-y-6">
                        <!-- Emergency SOS Panel -->
                        <div class="bg-gradient-to-br from-red-900/30 to-pagani-black border border-red-500/30 rounded-xl p-6 fade-in-section">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2 text-red-400">
                                <i class="fa-solid fa-truck-medical"></i>
                                Emergency SOS
                            </h3>
                            <p class="text-sm text-gray-400 mb-4">
                                Automatic emergency detection with crash sensors. Manual trigger available for immediate assistance.
                            </p>
                            <button id="sos-btn" class="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-orbitron font-bold rounded-lg transition-all uppercase tracking-wider animate-pulse">
                                <i class="fa-solid fa-circle-exclamation mr-2"></i> EMERGENCY SOS
                            </button>
                            <p class="text-xs text-gray-500 text-center mt-3">
                                <i class="fa-solid fa-info-circle mr-1"></i>
                                Press and hold for 3 seconds to activate
                            </p>
                        </div>

                        <!-- V2E Communication Status -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section" style="animation-delay: 100ms">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-tower-broadcast text-pagani-gold"></i>
                                V2E Communication
                            </h3>
                            <div class="space-y-4">
                                <div class="flex items-center justify-between p-3 bg-pagani-black/50 rounded-lg">
                                    <div class="flex items-center gap-2">
                                        <i class="fa-solid fa-lightbulb text-yellow-400"></i>
                                        <span class="text-sm">VLC Module</span>
                                    </div>
                                    <span class="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Active</span>
                                </div>
                                <div class="flex items-center justify-between p-3 bg-pagani-black/50 rounded-lg">
                                    <div class="flex items-center gap-2">
                                        <i class="fa-solid fa-car text-blue-400"></i>
                                        <span class="text-sm">Nearby Vehicles</span>
                                    </div>
                                    <span class="text-sm font-orbitron text-pagani-gold">3</span>
                                </div>
                                <div class="flex items-center justify-between p-3 bg-pagani-black/50 rounded-lg">
                                    <div class="flex items-center gap-2">
                                        <i class="fa-solid fa-traffic-light text-red-400"></i>
                                        <span class="text-sm">Traffic Signals</span>
                                    </div>
                                    <span class="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Connected</span>
                                </div>
                                <div class="flex items-center justify-between p-3 bg-pagani-black/50 rounded-lg">
                                    <div class="flex items-center gap-2">
                                        <i class="fa-solid fa-road text-purple-400"></i>
                                        <span class="text-sm">Road Sensors</span>
                                    </div>
                                    <span class="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">Partial</span>
                                </div>
                            </div>
                        </div>

                        <!-- Sensor Status -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section" style="animation-delay: 150ms">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-microchip text-pagani-gold"></i>
                                Safety Sensors
                            </h3>
                            <div class="space-y-3">
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-gray-400">Accelerometer</span>
                                    <div class="flex items-center gap-2">
                                        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span class="text-xs text-green-400">Online</span>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-gray-400">Vibration Sensor</span>
                                    <div class="flex items-center gap-2">
                                        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span class="text-xs text-green-400">Online</span>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-gray-400">Impact Detector</span>
                                    <div class="flex items-center gap-2">
                                        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span class="text-xs text-green-400">Online</span>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-gray-400">Obstacle Radar</span>
                                    <div class="flex items-center gap-2">
                                        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span class="text-xs text-green-400">Online</span>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-gray-400">Temperature Monitor</span>
                                    <div class="flex items-center gap-2">
                                        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span class="text-xs text-green-400">Online</span>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                                <p class="text-xs text-green-400">
                                    <i class="fa-solid fa-shield-check mr-1"></i>
                                    All safety systems operational
                                </p>
                            </div>
                        </div>

                        <!-- Quick Actions -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section" style="animation-delay: 200ms">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-bolt text-pagani-gold"></i>
                                Quick Actions
                            </h3>
                            <div class="grid grid-cols-2 gap-3">
                                <button class="p-3 bg-pagani-black/50 border border-pagani-gold/20 rounded-lg text-center hover:border-pagani-gold transition-all">
                                    <i class="fa-solid fa-phone text-green-400 text-xl mb-2"></i>
                                    <p class="text-xs text-gray-400">Call Support</p>
                                </button>
                                <button class="p-3 bg-pagani-black/50 border border-pagani-gold/20 rounded-lg text-center hover:border-pagani-gold transition-all">
                                    <i class="fa-solid fa-location-crosshairs text-blue-400 text-xl mb-2"></i>
                                    <p class="text-xs text-gray-400">Share Location</p>
                                </button>
                                <button class="p-3 bg-pagani-black/50 border border-pagani-gold/20 rounded-lg text-center hover:border-pagani-gold transition-all">
                                    <i class="fa-solid fa-car-burst text-red-400 text-xl mb-2"></i>
                                    <p class="text-xs text-gray-400">Report Accident</p>
                                </button>
                                <button class="p-3 bg-pagani-black/50 border border-pagani-gold/20 rounded-lg text-center hover:border-pagani-gold transition-all">
                                    <i class="fa-solid fa-wrench text-yellow-400 text-xl mb-2"></i>
                                    <p class="text-xs text-gray-400">Request Help</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,setTimeout(()=>{$o()},100)}}function $o(){const t=[{id:"1",type:"critical",category:"battery",title:"Battery Cell Degradation Detected",message:"Cell #67 showing abnormal degradation (72% health). Recommend immediate inspection to prevent further battery pack damage.",timestamp:"10 minutes ago",read:!1,actionable:!0,action:"Schedule Service"},{id:"2",type:"warning",category:"battery",title:"High Battery Temperature",message:"Battery temperature reached 42°C during fast charging. Reduced charging speed to protect battery longevity.",timestamp:"25 minutes ago",read:!1,actionable:!1},{id:"3",type:"warning",category:"safety",title:"Lane Departure Warning",message:"Multiple lane departures detected in the last trip. Driver attention monitoring activated.",timestamp:"1 hour ago",read:!1,actionable:!1},{id:"4",type:"info",category:"v2e",title:"V2E Connection Established",message:"Successfully connected to nearby traffic infrastructure via VLC. Real-time traffic signal data now available.",timestamp:"1 hour ago",read:!0,actionable:!1},{id:"5",type:"warning",category:"safety",title:"Obstacle Detected Ahead",message:"Stationary vehicle detected 200m ahead on NH-48. Proceed with caution.",timestamp:"2 hours ago",read:!0,actionable:!1},{id:"6",type:"info",category:"v2e",title:"Emergency Vehicle Approaching",message:"V2E alert: Ambulance approaching from rear. Please make way.",timestamp:"3 hours ago",read:!0,actionable:!1},{id:"7",type:"success",category:"battery",title:"Charging Complete",message:"Battery fully charged to 100%. Total energy added: 58 kWh. Ready for 450 km range.",timestamp:"4 hours ago",read:!0,actionable:!1},{id:"8",type:"info",category:"maintenance",title:"Scheduled Maintenance Reminder",message:"Your vehicle is due for scheduled maintenance in 45 days. Book your service appointment.",timestamp:"1 day ago",read:!0,actionable:!0,action:"Book Now"},{id:"9",type:"info",category:"system",title:"Software Update Available",message:"EVBharat OS v3.2.1 is available. Includes improved battery management and new V2E features.",timestamp:"2 days ago",read:!0,actionable:!0,action:"Update Now"}];Po(t),Do(),jo(),Fo(t)}function Po(t){const e=document.getElementById("alerts-list");if(!e)return;const a=i=>{switch(i){case"critical":return{bg:"from-red-900/30 to-red-900/10",border:"border-red-500/50",icon:"fa-circle-exclamation",iconColor:"text-red-400"};case"warning":return{bg:"from-yellow-900/30 to-yellow-900/10",border:"border-yellow-500/50",icon:"fa-triangle-exclamation",iconColor:"text-yellow-400"};case"info":return{bg:"from-blue-900/30 to-blue-900/10",border:"border-blue-500/50",icon:"fa-circle-info",iconColor:"text-blue-400"};case"success":return{bg:"from-green-900/30 to-green-900/10",border:"border-green-500/50",icon:"fa-circle-check",iconColor:"text-green-400"}}},s=i=>{switch(i){case"battery":return"fa-car-battery";case"safety":return"fa-shield-halved";case"v2e":return"fa-tower-broadcast";case"emergency":return"fa-truck-medical";case"maintenance":return"fa-wrench";case"system":return"fa-gear"}};e.innerHTML=t.map((i,n)=>{const r=a(i.type),o=s(i.category);return`
            <div class="alert-item bg-gradient-to-br ${r.bg} border ${r.border} rounded-xl p-5 fade-in-section ${i.read?"":"ring-2 ring-white/10"}" 
                 data-category="${i.category}" style="animation-delay: ${n*50}ms">
                <div class="flex items-start gap-4">
                    <div class="flex-shrink-0">
                        <div class="w-12 h-12 rounded-full ${r.bg} border ${r.border} flex items-center justify-center">
                            <i class="fa-solid ${r.icon} text-xl ${r.iconColor}"></i>
                        </div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="px-2 py-0.5 bg-pagani-black/50 text-gray-400 text-xs rounded flex items-center gap-1">
                                <i class="fa-solid ${o}"></i>
                                ${i.category.toUpperCase()}
                            </span>
                            ${i.read?"":'<span class="w-2 h-2 bg-pagani-gold rounded-full"></span>'}
                        </div>
                        <h4 class="font-orbitron font-bold text-white mb-2">${i.title}</h4>
                        <p class="text-sm text-gray-400 mb-3">${i.message}</p>
                        <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-500">
                                <i class="fa-solid fa-clock mr-1"></i>
                                ${i.timestamp}
                            </span>
                            ${i.actionable?`
                                <button class="px-4 py-2 bg-pagani-gold/20 border border-pagani-gold/50 rounded-lg text-pagani-gold text-xs font-orbitron hover:bg-pagani-gold hover:text-black transition-all">
                                    ${i.action}
                                </button>
                            `:""}
                        </div>
                    </div>
                    <button class="flex-shrink-0 p-2 text-gray-500 hover:text-white transition-all" title="Dismiss">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
        `}).join("")}function Do(){const t=document.querySelectorAll(".alert-filter");t.forEach(e=>{e.addEventListener("click",()=>{t.forEach(i=>{i.classList.remove("active","bg-pagani-gold","text-black"),i.classList.add("bg-pagani-black/50","text-white")}),e.classList.add("active","bg-pagani-gold","text-black"),e.classList.remove("bg-pagani-black/50","text-white");const a=e.getAttribute("data-filter");document.querySelectorAll(".alert-item").forEach(i=>{const n=i.getAttribute("data-category");a==="all"||n===a?i.style.display="block":i.style.display="none"})})})}function jo(){const t=document.getElementById("sos-btn");if(!t)return;let e=null,a=!1;t.addEventListener("mousedown",()=>{a=!0,t.innerHTML='<i class="fa-solid fa-spinner animate-spin mr-2"></i> HOLD 3 SECONDS...',e=setTimeout(()=>{a&&(t.innerHTML='<i class="fa-solid fa-check mr-2"></i> SOS ACTIVATED!',t.classList.remove("bg-red-600","hover:bg-red-500","animate-pulse"),t.classList.add("bg-green-600"),Oo())},3e3)}),t.addEventListener("mouseup",()=>{a=!1,e&&(clearTimeout(e),t.innerHTML='<i class="fa-solid fa-circle-exclamation mr-2"></i> EMERGENCY SOS')}),t.addEventListener("mouseleave",()=>{a=!1,e&&(clearTimeout(e),t.innerHTML='<i class="fa-solid fa-circle-exclamation mr-2"></i> EMERGENCY SOS')})}function Oo(){const t=document.createElement("div");t.className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4 fade-in-section",t.innerHTML=`
        <div class="bg-gradient-to-br from-red-900/50 to-pagani-black border border-red-500/50 rounded-xl p-8 max-w-md w-full text-center">
            <div class="w-20 h-20 mx-auto bg-red-500/20 border-4 border-red-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <i class="fa-solid fa-truck-medical text-4xl text-red-400"></i>
            </div>
            <h2 class="text-2xl font-orbitron font-bold text-red-400 mb-4">Emergency SOS Activated</h2>
            <p class="text-gray-400 mb-6">
                Your location has been shared with emergency services. Help is on the way.
            </p>
            <div class="space-y-3 mb-6">
                <div class="flex items-center justify-between p-3 bg-pagani-black/50 rounded-lg">
                    <span class="text-sm text-gray-400">Location Shared</span>
                    <span class="text-green-400"><i class="fa-solid fa-check"></i></span>
                </div>
                <div class="flex items-center justify-between p-3 bg-pagani-black/50 rounded-lg">
                    <span class="text-sm text-gray-400">Emergency Contacts Notified</span>
                    <span class="text-green-400"><i class="fa-solid fa-check"></i></span>
                </div>
                <div class="flex items-center justify-between p-3 bg-pagani-black/50 rounded-lg">
                    <span class="text-sm text-gray-400">Nearby Vehicles Alerted (V2E)</span>
                    <span class="text-green-400"><i class="fa-solid fa-check"></i></span>
                </div>
            </div>
            <button id="cancel-sos" class="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-orbitron rounded-lg transition-all">
                Cancel SOS
            </button>
        </div>
    `,document.body.appendChild(t),t.querySelector("#cancel-sos")?.addEventListener("click",()=>{t.remove();const a=document.getElementById("sos-btn");a&&(a.innerHTML='<i class="fa-solid fa-circle-exclamation mr-2"></i> EMERGENCY SOS',a.classList.remove("bg-green-600"),a.classList.add("bg-red-600","hover:bg-red-500","animate-pulse"))})}function Fo(t){document.getElementById("mark-all-read")?.addEventListener("click",()=>{t.forEach(a=>a.read=!0),document.querySelectorAll(".alert-item").forEach(a=>{a.classList.remove("ring-2","ring-white/10")}),document.querySelectorAll(".alert-item .w-2.h-2.bg-pagani-gold").forEach(a=>{a.remove()}),Ho("All alerts marked as read")})}function Ho(t,e){const a=document.createElement("div");a.className="fixed top-24 right-8 px-6 py-4 rounded-lg backdrop-blur-sm z-50 font-orbitron text-sm fade-in-section bg-green-500/20 border border-green-500/50 text-green-400",a.innerHTML=`<i class="fa-solid fa-check-circle mr-2"></i>${t}`,document.body.appendChild(a),setTimeout(()=>a.remove(),3e3)}async function No(){const t=document.getElementById("app");t&&(t.innerHTML=`
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
    `)}const zo=new Rs;document.addEventListener("DOMContentLoaded",async()=>{new Bs,new Vs,O.register("/","EVBharat | AI-Powered EV Intelligence",Gr),O.register("/about","About Us | EVBharat",Xr),O.register("/technology","Technology | EVBharat",Zr),O.register("/contact","Contact Us | EVBharat",eo),O.register("/gallery","Gallery | EVBharat",to),O.register("/auth","Login | EVBharat",ao),O.register("/dashboard","Dashboard | EVBharat",oo),O.register("/battery","Battery Management | EVBharat",co),O.register("/battery-analytics","AI Battery Analytics | EVBharat",mo),O.register("/rag-chat","AI Assistant | EVBharat",ko),O.register("/map","Route Planner | EVBharat",Eo),O.register("/alerts","Alerts | EVBharat",Ro),O.register("/404","404 Not Found | EVBharat",No),O.init(),setTimeout(()=>{zo.hide()},1500)});
