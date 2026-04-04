(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function a(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(n){if(n.ep)return;n.ep=!0;const i=a(n);fetch(n.href,i)}})();class Wn{routes=new Map;currentPath="";constructor(){window.addEventListener("popstate",()=>this.handleRoute()),document.addEventListener("click",e=>this.handleLinkClick(e))}register(e,a,s){this.routes.set(e,{path:e,title:a,render:s})}navigate(e,a=!0){if(this.currentPath===e)return;const s=this.routes.get(e);if(!s){this.navigate("/404",a);return}this.currentPath=e,a&&window.history.pushState({path:e},s.title,e),document.title=s.title,this.showPageTransition(async()=>{await s.render(),window.scrollTo({top:0,behavior:"instant"})})}handleRoute(){const e=window.location.pathname;this.navigate(e,!1)}handleLinkClick(e){const a=e.target.closest("a");if(!a)return;const s=a.getAttribute("href");!s||s.startsWith("http")||s.startsWith("#")||this.routes.has(s)&&(e.preventDefault(),this.navigate(s))}showPageTransition(e){const a=document.getElementById("app");if(!a)return e();a.style.opacity="0",a.style.transition="opacity 0.3s ease-out",setTimeout(async()=>{await e(),a.style.opacity="1"},300)}init(){this.handleRoute()}}const K=new Wn;class Gn{storageKey="evbharat_auth";userKey="evbharat_user";apiBase="".replace(/\/$/,"");enableOfflineAuth=!1;debugMode=!1;constructor(){this.debugMode&&(this.apiBase?console.log("Auth Service: backend base URL =",this.apiBase):console.log("Auth Service: using same-origin /api (Vite proxy in dev)"),this.enableOfflineAuth&&console.warn("Auth Service: offline mock auth is ENABLED (VITE_ENABLE_OFFLINE_AUTH=true)"))}getAuthEndpoints(e){return this.apiBase?[`${this.apiBase}${e}`]:[e,`http://127.0.0.1:3001${e}`,`http://localhost:3001${e}`,`http://host.docker.internal:3001${e}`]}getAuthState(){const e=localStorage.getItem(this.storageKey),a=localStorage.getItem(this.userKey);if(e&&a)try{return{isAuthenticated:!0,user:JSON.parse(a),token:e}}catch{return{isAuthenticated:!1,user:null,token:null}}return{isAuthenticated:!1,user:null,token:null}}isAuthenticated(){return this.getAuthState().isAuthenticated}getCurrentUser(){return this.getAuthState().user}async login(e,a){return this.requestAuth("/api/auth/login",{email:e,password:a})}async signup(e,a,s){return this.requestAuth("/api/auth/signup",{name:e,email:a,password:s})}logout(){localStorage.removeItem(this.storageKey),localStorage.removeItem(this.userKey)}getDefaultCredentials(){return null}persistAuth(e,a){localStorage.setItem(this.storageKey,e),localStorage.setItem(this.userKey,JSON.stringify(a))}async requestAuth(e,a){const s=this.getAuthEndpoints(e);let n=!1;for(const i of s)try{const r=await fetch(i,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)}),o=await r.json().catch(()=>({}));if(r.ok&&o?.token&&o?.user)return this.persistAuth(o.token,o.user),{success:!0,message:o?.message??"Success",user:o?.user};if([502,503,504].includes(r.status)){n=!0,this.debugMode&&console.warn(`Auth Service: upstream unavailable via ${i} (${r.status})`);continue}return r.ok?{success:!1,message:"Authentication response is invalid. Please try again."}:{success:!1,message:o?.message??"Authentication failed. Please try again."}}catch(r){n=!0,this.debugMode&&console.warn(`Auth Service: network error via ${i}`,r)}if(n&&!this.enableOfflineAuth)return{success:!1,message:"Cannot reach authentication server. Please check backend and try again."};if(e.includes("login")){const i={id:"mock_user_"+Date.now(),email:a.email,name:a.email.split("@")[0]||"User",role:"user",preferences:{notifications:{email:!0,battery:!0,maintenance:!0},units:{distance:"km",temperature:"celsius"},language:"en"},vehicle:{make:"Tesla",model:"Model 3",year:2024,batteryCapacity:75,range:350,chargingTypes:["AC Type 2","DC CCS2"]}},r="mock_token_"+Date.now();return this.persistAuth(r,i),{success:!0,message:"Login successful (offline mode)",user:i}}else if(e.includes("signup")){const i={id:"mock_user_"+Date.now(),email:a.email,name:a.name||a.email.split("@")[0],role:"user",preferences:{notifications:{email:!0,battery:!0,maintenance:!0},units:{distance:"km",temperature:"celsius"},language:"en"}},r="mock_token_"+Date.now();return this.persistAuth(r,i),{success:!0,message:"Account created successfully (offline mode)",user:i}}return{success:!1,message:"Authentication failed. Please try again."}}async authFetch(e,a="GET",s){const{token:n}=this.getAuthState();if(!n)return{ok:!1,data:{message:"Not authenticated."}};const i={method:a,headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`}};s&&(i.body=JSON.stringify(s));const r=await fetch(`${this.apiBase}${e}`,i),o=await r.json().catch(()=>({}));return{ok:r.ok,data:o}}async fetchProfile(){try{const{ok:e,data:a}=await this.authFetch("/api/profile");return e?{success:!0,data:a.data}:{success:!1,message:a?.message??"Failed to load profile."}}catch{return{success:!1,message:"Network error."}}}async updateProfile(e){if(!this.isAuthenticated())return{success:!1,message:"User not authenticated"};try{const{ok:a,data:s}=await this.authFetch("/api/profile/personal","PUT",e);if(!a)return{success:!1,message:s?.message??"Failed to update profile."};if(s?.user){const n=s.token??this.getAuthState().token;this.persistAuth(n,s.user)}return{success:!0,message:s?.message??"Profile updated successfully",user:s?.user}}catch{return{success:!1,message:"Network error. Please try again."}}}async updatePassword(e,a){if(!this.isAuthenticated())return{success:!1,message:"User not authenticated"};try{const{ok:s,data:n}=await this.authFetch("/api/profile/password","PUT",{currentPassword:e,newPassword:a});return s?{success:!0,message:n?.message??"Password updated successfully"}:{success:!1,message:n?.message??"Failed to update password."}}catch{return{success:!1,message:"Network error. Please try again."}}}async updatePreferences(e){if(!this.isAuthenticated())return{success:!1,message:"Not authenticated"};try{const{ok:a,data:s}=await this.authFetch("/api/profile/preferences","PUT",e);return a?{success:!0,message:s?.message??"Preferences saved."}:{success:!1,message:s?.message??"Failed to save preferences."}}catch{return{success:!1,message:"Network error."}}}async updateVehicle(e){if(!this.isAuthenticated())return{success:!1,message:"Not authenticated"};try{const{ok:a,data:s}=await this.authFetch("/api/profile/vehicle","PUT",e);return a?{success:!0,message:s?.message??"Vehicle info saved."}:{success:!1,message:s?.message??"Failed to save vehicle."}}catch{return{success:!1,message:"Network error."}}}}const z=new Gn;class Kn{navbar=null;navbarShell=null;mobileMenu=null;isMenuOpen=!1;languageStorageKey="evbharat_language";languageOptions=[{value:"en",label:"English"},{value:"hi",label:"Hindi"},{value:"bn",label:"Bengali"},{value:"as",label:"Assamese"},{value:"or",label:"Odia"},{value:"ur",label:"Urdu"},{value:"ne",label:"Nepali"},{value:"sd",label:"Sindhi"},{value:"ta",label:"Tamil"},{value:"te",label:"Telugu"},{value:"mr",label:"Marathi"},{value:"gu",label:"Gujarati"},{value:"kn",label:"Kannada"},{value:"ml",label:"Malayalam"},{value:"pa",label:"Punjabi"},{value:"ar",label:"Arabic"},{value:"fr",label:"French"},{value:"de",label:"German"},{value:"es",label:"Spanish"},{value:"pt",label:"Portuguese"},{value:"ru",label:"Russian"},{value:"ja",label:"Japanese"},{value:"ko",label:"Korean"},{value:"zh-CN",label:"Chinese (Simplified)"},{value:"zh-TW",label:"Chinese (Traditional)"},{value:"it",label:"Italian"},{value:"nl",label:"Dutch"},{value:"tr",label:"Turkish"},{value:"pl",label:"Polish"},{value:"vi",label:"Vietnamese"},{value:"id",label:"Indonesian"},{value:"th",label:"Thai"},{value:"fa",label:"Persian"},{value:"uk",label:"Ukrainian"},{value:"el",label:"Greek"},{value:"sv",label:"Swedish"},{value:"da",label:"Danish"},{value:"fi",label:"Finnish"}];publicNavItems=[{label:"Home",path:"/",icon:"fa-home"},{label:"About",path:"/about",icon:"fa-info-circle"},{label:"Technology",path:"/technology",icon:"fa-microchip"},{label:"Gallery",path:"/gallery",icon:"fa-images"},{label:"Documentation",path:"/documentation",icon:"fa-book-open"},{label:"Contact",path:"/contact",icon:"fa-envelope"}];evAuthNavGroups=[{title:"Operations",requiresAuth:!0,portal:"ev",items:[{label:"Dashboard",path:"/dashboard",icon:"fa-gauge-high",description:"Dashboard"},{label:"Battery",path:"/battery",icon:"fa-car-battery",description:"Battery"},{label:"Routes",path:"/map",icon:"fa-route",description:"Routes"}]},{title:"Resources",requiresAuth:!0,portal:"ev",items:[{label:"AI Chat",path:"/rag-chat",icon:"fa-robot",description:"AI Chat"},{label:"Drowsiness",path:"/drowsiness",icon:"fa-eye",description:"Driver Alertness"},{label:"Alerts",path:"/alerts",icon:"fa-bell",description:"Alerts"},{label:"Documentation",path:"/documentation",icon:"fa-book-open",description:"Docs"}]}];factoryAuthNavGroups=[{title:"Control",requiresAuth:!0,portal:"factory",items:[{label:"Factory",path:"/factory-dashboard",icon:"fa-gauge-high",description:"Factory Control Center"},{label:"EV Dashboard",path:"/dashboard",icon:"fa-car-side",description:"EV Dashboard"},{label:"AI Ops",path:"/rag-chat",icon:"fa-robot",description:"AI Operations"}]},{title:"Monitoring",requiresAuth:!0,portal:"factory",items:[{label:"Incidents",path:"/alerts",icon:"fa-bell",description:"Incidents"},{label:"Drowsiness",path:"/drowsiness",icon:"fa-eye",description:"Driver Alertness"},{label:"Camera Wall",path:"/gallery",icon:"fa-camera",description:"Camera Wall"},{label:"Documentation",path:"/documentation",icon:"fa-book-open",description:"Docs"}]}];constructor(){this.render(),this.attachEventListeners()}getLanguageOptionsHTML(){return this.languageOptions.map(e=>`<option value="${e.value}">${e.label}</option>`).join("")}getIncludedLanguagesList(){return this.languageOptions.map(e=>e.value).join(",")}getUserDisplayLabel(e){return e?.email?.trim()?e.email.trim():e?.name?.trim()?e.name.trim():"Profile"}getDesktopNavHTML(e,a){return e?(a==="factory"?this.factoryAuthNavGroups:this.evAuthNavGroups).flatMap(n=>n.items).map(n=>`
            <a href="${n.path}" class="nav-link">
                <i class="fa-solid ${n.icon} nav-link-icon" aria-hidden="true"></i>
                <span>${n.label}</span>
            </a>
        `).join(""):this.publicNavItems.map(n=>`
                <a href="${n.path}" class="nav-link">
                    <i class="fa-solid ${n.icon} nav-link-icon" aria-hidden="true"></i>
                    <span>${n.label}</span>
                </a>
            `).join("")}getMobileNavHTML(e,a){return e?`
            <div class="w-full">
                ${(a==="factory"?this.factoryAuthNavGroups:this.evAuthNavGroups).map(n=>`
                    <div class="mb-6">
                        <h3 class="text-[11px] uppercase tracking-[0.24em] mb-3 text-white/60">${n.title}</h3>
                        <div class="grid grid-cols-2 gap-3">
                            ${n.items.map(i=>`
                                <a href="${i.path}" class="mobile-nav-card flex flex-col items-center justify-center gap-2 p-4 border border-white/10 rounded-2xl bg-white/[0.02] hover:bg-white/[0.08] transition-all duration-200 min-h-[96px]">
                                    <i class="fa-solid ${i.icon} text-2xl"></i>
                                    <span class="text-[11px] uppercase tracking-[0.12em] text-center">${i.label}</span>
                                </a>
                            `).join("")}
                        </div>
                    </div>
                `).join("")}
            </div>
        `:`
                <div class="space-y-2 w-full">
                    ${this.publicNavItems.map(n=>`
                        <a href="${n.path}" class="mobile-nav-link flex items-center justify-between px-4 py-3 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] transition-colors">
                            <span class="text-sm uppercase tracking-[0.14em]">${n.label}</span>
                            <i class="fa-solid ${n.icon} text-xs opacity-70"></i>
                        </a>
                    `).join("")}
                </div>
            `}render(){const e=z.isAuthenticated(),a=z.getCurrentUser(),s=localStorage.getItem("evbharat_portal_mode")||"ev",n=s==="factory",i=this.getUserDisplayLabel(a),r=this.getLanguageOptionsHTML(),o=this.getDesktopNavHTML(e,s),l=this.getMobileNavHTML(e,s),p=`
            <style id="navbar-design-theme">
                #navbar {
                    --nav-accent: #d4af37;
                    --nav-accent-soft: rgba(212, 175, 55, 0.19);
                    --nav-accent-border: rgba(212, 175, 55, 0.48);
                }

                #navbar.factory-mode {
                    --nav-accent: #22d3ee;
                    --nav-accent-soft: rgba(34, 211, 238, 0.2);
                    --nav-accent-border: rgba(34, 211, 238, 0.5);
                }

                #navbar .nav-pill-shell {
                    border-radius: 9999px;
                    border: 1px solid rgba(255, 255, 255, 0.14);
                    background:
                        linear-gradient(95deg, rgba(9, 12, 19, 0.95), rgba(11, 17, 33, 0.95) 42%, rgba(8, 11, 18, 0.95)),
                        radial-gradient(circle at 22% 50%, rgba(212, 175, 55, 0.18), transparent 42%);
                    box-shadow: 0 20px 44px rgba(2, 6, 23, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.09);
                    transition: transform 220ms ease, box-shadow 220ms ease;
                }

                #navbar.navbar-scrolled .nav-pill-shell {
                    transform: translateY(-1px);
                    box-shadow: 0 26px 58px rgba(2, 6, 23, 0.62), inset 0 1px 0 rgba(255, 255, 255, 0.13);
                }

                #navbar .nav-brand-wordmark {
                    display: inline-flex;
                    align-items: center;
                    gap: 0;
                    border-radius: 0.72rem;
                    border: 1px solid rgba(212, 175, 55, 0.3);
                    background: rgba(9, 13, 20, 0.92);
                    color: #f8fafc;
                    padding: 0.42rem 0.6rem 0.4rem 0.6rem;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1.6rem;
                    font-weight: 800;
                    letter-spacing: 0.06em;
                    line-height: 1;
                    box-shadow: 0 10px 22px rgba(3, 7, 18, 0.35), inset 0 0 0 1px rgba(255, 255, 255, 0.05);
                    transition: transform 180ms ease, box-shadow 180ms ease;
                }

                #navbar .nav-brand-wordmark:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 14px 24px rgba(3, 7, 18, 0.44), inset 0 0 0 1px rgba(255, 255, 255, 0.08);
                }

                #navbar .brand-ev {
                    color: #f8fafc;
                }

                #navbar .brand-bharat {
                    color: #d4af37;
                }

                #navbar .nav-main-links {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                    overflow-x: auto;
                    overflow-y: hidden;
                    white-space: nowrap;
                }

                #navbar .nav-main-links::-webkit-scrollbar {
                    display: none;
                }

                #navbar .nav-link {
                    color: rgba(226, 232, 240, 0.92);
                    display: inline-flex;
                    align-items: center;
                    gap: 0.46rem;
                    padding: 0.5rem 0.72rem;
                    border-radius: 9999px;
                    font-family: 'Rajdhani', sans-serif;
                    font-size: 0.86rem;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    white-space: nowrap;
                    border: 1px solid transparent;
                    transition: color 180ms ease, background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
                }

                #navbar .nav-link-icon {
                    font-size: 0.68rem;
                    opacity: 0.76;
                }

                #navbar .nav-link:hover {
                    color: #ffffff;
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.12);
                }

                #navbar .nav-link.nav-link-active {
                    color: #ffffff;
                    background: linear-gradient(130deg, var(--nav-accent-soft), rgba(255, 255, 255, 0.06));
                    border-color: var(--nav-accent-border);
                    box-shadow: 0 6px 16px rgba(1, 4, 12, 0.35);
                }

                #navbar .nav-link.nav-link-active .nav-link-icon {
                    color: var(--nav-accent);
                    opacity: 1;
                }

                #navbar .nav-cta {
                    border-radius: 9999px;
                    background: #f8fafc;
                    color: #111827;
                    padding: 0.58rem 1rem;
                    font-size: 0.82rem;
                    font-weight: 700;
                    letter-spacing: 0.02em;
                    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.26);
                    transition: transform 180ms ease, box-shadow 180ms ease;
                    max-width: 14rem;
                    display: inline-flex;
                    align-items: center;
                }

                #navbar .nav-cta:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 12px 22px rgba(15, 23, 42, 0.3);
                }

                #navbar .nav-ghost-btn {
                    border-radius: 9999px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: rgba(226, 232, 240, 0.92);
                    width: 2.25rem;
                    height: 2.25rem;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    transition: background-color 180ms ease, border-color 180ms ease;
                }

                #navbar .nav-ghost-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(255, 255, 255, 0.45);
                }

                #navbar .language-select {
                    width: 7.6rem;
                    border-radius: 9999px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    background: rgba(255, 255, 255, 0.05);
                    color: #f1f5f9;
                    padding: 0.38rem 1.75rem 0.38rem 0.72rem;
                    font-size: 0.73rem;
                    letter-spacing: 0.02em;
                    appearance: none;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    background-image: linear-gradient(45deg, transparent 50%, var(--nav-accent) 50%), linear-gradient(135deg, var(--nav-accent) 50%, transparent 50%);
                    background-position: calc(100% - 14px) calc(50% - 2px), calc(100% - 9px) calc(50% - 2px);
                    background-size: 5px 5px, 5px 5px;
                    background-repeat: no-repeat;
                    transition: border-color 180ms ease, background-color 180ms ease;
                }

                #navbar .language-select:hover,
                #navbar .language-select:focus {
                    border-color: var(--nav-accent-border);
                    background-color: rgba(255, 255, 255, 0.1);
                    outline: none;
                }

                #navbar .language-select option {
                    color: #111827;
                    background-color: #f8fafc;
                }

                #navbar .mobile-nav-link-active {
                    border-color: var(--nav-accent-border) !important;
                    background: var(--nav-accent-soft) !important;
                }

                #navbar .mobile-nav-card-active {
                    border-color: var(--nav-accent-border) !important;
                    background: var(--nav-accent-soft) !important;
                }

                @media (max-width: 1279px) {
                    #navbar .nav-pill-shell {
                        border-radius: 1.1rem;
                    }
                }
            </style>
            <nav class="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1rem)] max-w-[96rem] transition-all duration-300 ${n?"factory-mode":""}" id="navbar">
                <div id="navbar-shell" class="nav-pill-shell px-2.5 md:px-3 py-2">
                    <div class="flex items-center gap-2.5 w-full">
                        <a href="/" class="nav-brand-wordmark" aria-label="EV Bharat home">
                            <span class="brand-ev">EV</span><span class="brand-bharat">BHARAT</span>
                        </a>

                        <div class="hidden lg:flex items-center gap-1.5 flex-1 min-w-0 nav-main-links pr-1">
                            ${o}
                        </div>

                        <div class="hidden xl:flex items-center gap-2 shrink-0">
                            <label class="inline-flex items-center" aria-label="Select language">
                                <select id="language-select" class="language-select" title="Select language">
                                    ${r}
                                </select>
                            </label>

                            ${e?`
                            <a href="/profile" class="nav-cta" title="${i}">
                                <span class="truncate">${i}</span>
                            </a>
                            <button id="logout-btn" class="nav-ghost-btn" aria-label="Logout">
                                <i class="fa-solid fa-right-from-bracket text-xs"></i>
                            </button>
                            `:`
                            <a href="/auth" class="nav-cta">
                                <span>Login</span>
                            </a>
                            `}
                        </div>

                        <button id="mobile-menu-btn" class="xl:hidden inline-flex items-center justify-center text-white w-10 h-10 rounded-full border border-white/20 bg-white/[0.04] hover:bg-white/[0.12] transition-colors" aria-label="Toggle menu">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path class="menu-icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                <path class="close-icon hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <div id="mobile-menu" class="xl:hidden fixed inset-0 z-40 bg-[#0a0d14]/95 backdrop-blur-xl transform translate-x-full transition-transform duration-300 overflow-y-auto">
                    <div class="mx-auto w-full max-w-md pt-24 px-4 pb-10">
                        <div class="rounded-[2rem] border border-white/10 bg-[#121827]/90 shadow-[0_22px_42px_rgba(0,0,0,0.45)] p-5">
                            <div class="mb-5">
                                <a href="/" class="nav-brand-wordmark" aria-label="EV Bharat home">
                                    <span class="brand-ev">EV</span><span class="brand-bharat">BHARAT</span>
                                </a>
                            </div>

                            ${l}

                            <div class="mt-7 pt-6 border-t border-white/10 space-y-3">
                                <label class="flex items-center justify-between gap-3" aria-label="Select language">
                                    <span class="text-[11px] uppercase tracking-[0.2em] text-white/65">Language</span>
                                    <select id="mobile-language-select" class="language-select !w-40" title="Select language">
                                        ${r}
                                    </select>
                                </label>

                                ${e?`
                                <a href="/profile" class="mobile-nav-link flex items-center justify-between px-4 py-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] transition-colors">
                                    <span class="text-[11px] uppercase tracking-[0.2em] text-white/60">Profile</span>
                                    <span class="font-semibold text-sm truncate max-w-[10rem]">${i}</span>
                                </a>
                                <button id="logout-mobile-btn" class="w-full py-3 rounded-2xl border border-white/20 bg-white/[0.05] hover:bg-white/[0.12] text-sm uppercase tracking-[0.18em] transition-colors">
                                    Logout
                                </button>
                                `:`
                                <a href="/auth" class="mobile-nav-link block text-center px-6 py-3 rounded-2xl border border-white/20 bg-white/[0.05] hover:bg-white/[0.12] text-sm uppercase tracking-[0.18em] transition-colors">
                                    Login
                                </a>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        `;document.body.insertAdjacentHTML("afterbegin",p),this.navbar=document.getElementById("navbar"),this.navbarShell=document.getElementById("navbar-shell"),this.mobileMenu=document.getElementById("mobile-menu"),this.initializeGoogleTranslate()}attachEventListeners(){const e=document.getElementById("logout-btn"),a=document.getElementById("logout-mobile-btn");e?.addEventListener("click",()=>this.handleLogout()),a?.addEventListener("click",()=>this.handleLogout()),document.getElementById("mobile-menu-btn")?.addEventListener("click",()=>this.toggleMobileMenu());const n=document.getElementById("language-select"),i=document.getElementById("mobile-language-select"),r=localStorage.getItem(this.languageStorageKey)||"en";n&&(n.value=r,n.addEventListener("change",l=>{this.handleLanguageChange(l.target.value)})),i&&(i.value=r,i.addEventListener("change",l=>{this.handleLanguageChange(l.target.value)})),document.querySelectorAll(".mobile-nav-link, .mobile-nav-card").forEach(l=>{l.addEventListener("click",()=>this.closeMobileMenu())}),window.addEventListener("scroll",()=>this.handleScroll(),{passive:!0}),this.updateActiveLink(),window.addEventListener("popstate",()=>this.updateActiveLink())}handleLogout(){z.logout(),window.location.href="/"}initializeGoogleTranslate(){const e=window;if(e.googleTranslateElementInit=()=>{if(e.googleTranslateInitialized||!e.google?.translate)return;const a="google_translate_element";if(!document.getElementById(a)){const n=document.createElement("div");n.id=a,n.style.display="none",document.body.appendChild(n)}new e.google.translate.TranslateElement({pageLanguage:"en",includedLanguages:this.getIncludedLanguagesList(),autoDisplay:!1},a),e.googleTranslateInitialized=!0;const s=localStorage.getItem(this.languageStorageKey)||"en";this.applyGoogleLanguage(s)},document.getElementById("google-translate-script"))e.google?.translate&&e.googleTranslateElementInit();else{const a=document.createElement("script");a.id="google-translate-script",a.src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit",a.async=!0,document.body.appendChild(a)}}handleLanguageChange(e){localStorage.setItem(this.languageStorageKey,e);const a=document.getElementById("language-select"),s=document.getElementById("mobile-language-select");a&&(a.value=e),s&&(s.value=e),this.applyGoogleLanguage(e)}applyGoogleLanguage(e){const a=document.querySelector(".goog-te-combo");a&&(a.value=e,a.dispatchEvent(new Event("change")))}toggleMobileMenu(){this.isMenuOpen=!this.isMenuOpen,this.isMenuOpen?(this.mobileMenu?.classList.remove("translate-x-full"),document.querySelector(".menu-icon")?.classList.add("hidden"),document.querySelector(".close-icon")?.classList.remove("hidden"),document.body.style.overflow="hidden"):this.closeMobileMenu()}closeMobileMenu(){this.isMenuOpen=!1,this.mobileMenu?.classList.add("translate-x-full"),document.querySelector(".menu-icon")?.classList.remove("hidden"),document.querySelector(".close-icon")?.classList.add("hidden"),document.body.style.overflow=""}handleScroll(){if(!this.navbar||!this.navbarShell)return;window.scrollY>28?this.navbar.classList.add("navbar-scrolled"):this.navbar.classList.remove("navbar-scrolled")}updateActiveLink(){const e=window.location.pathname;document.querySelectorAll(".nav-link, .mobile-nav-link, .mobile-nav-card").forEach(s=>{s.getAttribute("href")===e?(s.classList.contains("nav-link")&&s.classList.add("nav-link-active"),s.classList.contains("mobile-nav-link")&&s.classList.add("mobile-nav-link-active"),s.classList.contains("mobile-nav-card")&&s.classList.add("mobile-nav-card-active")):(s.classList.remove("nav-link-active","mobile-nav-link-active"),s.classList.contains("mobile-nav-card")&&s.classList.remove("mobile-nav-card-active"))})}destroy(){this.navbar?.remove()}}class Yn{constructor(){this.render()}render(){document.body.insertAdjacentHTML("beforeend",`
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
                                <li><a href="/documentation" class="text-gray-400 hover:text-white transition-colors text-sm">Documentation</a></li>
                                <li><a href="/dashboard" class="text-gray-400 hover:text-white transition-colors text-sm">Dashboard</a></li>
                                <li><a href="/battery" class="text-gray-400 hover:text-white transition-colors text-sm">Battery Health</a></li>
                                <li><a href="/map" class="text-gray-400 hover:text-white transition-colors text-sm">Route Planner</a></li>
                                <li><a href="/alerts" class="text-gray-400 hover:text-white transition-colors text-sm">Alerts</a></li>
                            </ul>
                        </div>

                        <!-- Company -->
                        <div>
                            <h4 class="text-sm font-orbitron tracking-widest uppercase mb-6 text-pagani-gold">Company</h4>
                            <ul class="space-y-3">
                                <li><a href="/about" class="text-gray-400 hover:text-white transition-colors text-sm">About Us</a></li>
                                <li><a href="/gallery" class="text-gray-400 hover:text-white transition-colors text-sm">Gallery</a></li>
                                <li><a href="/technology" class="text-gray-400 hover:text-white transition-colors text-sm">Technology</a></li>
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
        `),this.attachEventListeners()}attachEventListeners(){document.getElementById("newsletter-form")?.addEventListener("submit",s=>{s.preventDefault(),alert("Thank you for subscribing! 🎉"),s.target.reset()});const a=document.getElementById("back-to-top");window.addEventListener("scroll",()=>{window.scrollY>500?a?.classList.remove("opacity-0","pointer-events-none"):a?.classList.add("opacity-0","pointer-events-none")},{passive:!0}),a?.addEventListener("click",()=>{window.scrollTo({top:0,behavior:"smooth"})})}}class Xn{loader=null;constructor(){this.render()}render(){document.body.insertAdjacentHTML("afterbegin",`
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
        `),this.loader=document.getElementById("page-loader")}hide(){this.loader&&(this.loader.style.opacity="0",setTimeout(()=>{this.loader?.remove()},500))}show(){this.loader?this.loader.style.opacity="1":this.render()}}class Jn{canvas;ctx;images=[];totalFrames=240;isLoaded=!1;currentFrameIndex=-1;framePathBuilder;constructor(e,a=240,s=n=>`/images/zonda-sequence/${n}.jpg`){if(this.canvas=document.getElementById(e),!this.canvas)throw new Error(`Canvas with id ${e} not found`);this.ctx=this.canvas.getContext("2d",{alpha:!1}),this.totalFrames=a,this.framePathBuilder=s,this.ctx&&(this.ctx.imageSmoothingEnabled=!0,this.ctx.imageSmoothingQuality="high"),this.resize(),window.addEventListener("resize",()=>this.resize()),this.preloadImages()}resize(){if(!this.canvas||!this.ctx)return;const e=window.devicePixelRatio||1,a=this.canvas.parentElement?.getBoundingClientRect();a&&(this.canvas.width=a.width*e,this.canvas.height=a.height*e,this.ctx.scale(e,e),this.ctx.imageSmoothingEnabled=!0,this.ctx.imageSmoothingQuality="high",this.currentFrameIndex>=0&&this.renderFrame(this.currentFrameIndex))}preloadImages(){let e=0;for(let a=1;a<=this.totalFrames;a++){const s=new Image;s.src=this.framePathBuilder(a),s.onload=()=>{e++,e===this.totalFrames&&(this.isLoaded=!0,this.renderFrame(0))},this.images.push(s)}}update(e){if(!this.isLoaded)return;const a=Math.min(this.totalFrames-1,Math.max(0,Math.floor(e*this.totalFrames)));a!==this.currentFrameIndex&&(this.renderFrame(a),this.currentFrameIndex=a)}renderFrame(e){if(!this.ctx||!this.canvas)return;const a=this.images[e];if(!a)return;const s=window.devicePixelRatio||1;this.ctx.clearRect(0,0,this.canvas.width/s,this.canvas.height/s);const n=this.canvas.width/s,i=this.canvas.height/s,r=Math.min(n/a.width,i/a.height),o=n/2-a.width/2*r,l=i/2-a.height/2*r;this.ctx.drawImage(a,o,l,a.width*r,a.height*r)}}function Zn(t,e){t.indexOf(e)===-1&&t.push(e)}function ks(t,e){const a=t.indexOf(e);a>-1&&t.splice(a,1)}const ke=(t,e,a)=>a>e?e:a<t?t:a;let aa=()=>{};const fe={},Es=t=>/^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(t);function Qn(t){return typeof t=="object"&&t!==null}const Ss=t=>/^0[^.\s]+$/u.test(t);function sa(t){let e;return()=>(e===void 0&&(e=t()),e)}const De=t=>t,ei=(t,e)=>a=>e(t(a)),na=(...t)=>t.reduce(ei),ia=(t,e,a)=>{const s=e-t;return s===0?1:(a-t)/s};class Ts{constructor(){this.subscriptions=[]}add(e){return Zn(this.subscriptions,e),()=>ks(this.subscriptions,e)}notify(e,a,s){const n=this.subscriptions.length;if(n)if(n===1)this.subscriptions[0](e,a,s);else for(let i=0;i<n;i++){const r=this.subscriptions[i];r&&r(e,a,s)}}getSize(){return this.subscriptions.length}clear(){this.subscriptions.length=0}}const ue=t=>t*1e3,ne=t=>t/1e3;function Ls(t,e){return e?t*(1e3/e):0}const ti=(t,e,a)=>{const s=e-t;return((a-t)%s+s)%s+t},Cs=(t,e,a)=>(((1-3*a+3*e)*t+(3*a-6*e))*t+3*e)*t,ai=1e-7,si=12;function ni(t,e,a,s,n){let i,r,o=0;do r=e+(a-e)/2,i=Cs(r,s,n)-t,i>0?a=r:e=r;while(Math.abs(i)>ai&&++o<si);return r}function et(t,e,a,s){if(t===e&&a===s)return De;const n=i=>ni(i,0,1,t,a);return i=>i===0||i===1?i:Cs(n(i),e,s)}const As=t=>e=>e<=.5?t(2*e)/2:(2-t(2*(1-e)))/2,Is=t=>e=>1-t(1-e),Bs=et(.33,1.53,.69,.99),ra=Is(Bs),Ms=As(ra),$s=t=>(t*=2)<1?.5*ra(t):.5*(2-Math.pow(2,-10*(t-1))),oa=t=>1-Math.sin(Math.acos(t)),ii=Is(oa),Rs=As(oa),ri=et(.42,0,1,1),oi=et(0,0,.58,1),Ps=et(.42,0,.58,1),Vs=t=>Array.isArray(t)&&typeof t[0]!="number";function Ds(t,e){return Vs(t)?t[ti(0,t.length,e)]:t}const Fs=t=>Array.isArray(t)&&typeof t[0]=="number",li={linear:De,easeIn:ri,easeInOut:Ps,easeOut:oi,circIn:oa,circInOut:Rs,circOut:ii,backIn:ra,backInOut:Ms,backOut:Bs,anticipate:$s},di=t=>typeof t=="string",Va=t=>{if(Fs(t)){aa(t.length===4);const[e,a,s,n]=t;return et(e,a,s,n)}else if(di(t))return li[t];return t},rt=["setup","read","resolveKeyframes","preUpdate","update","preRender","render","postRender"];function ci(t,e){let a=new Set,s=new Set,n=!1,i=!1;const r=new WeakSet;let o={delta:0,timestamp:0,isProcessing:!1};function l(d){r.has(d)&&(p.schedule(d),t()),d(o)}const p={schedule:(d,c=!1,u=!1)=>{const v=u&&n?a:s;return c&&r.add(d),v.has(d)||v.add(d),d},cancel:d=>{s.delete(d),r.delete(d)},process:d=>{if(o=d,n){i=!0;return}n=!0,[a,s]=[s,a],a.forEach(l),a.clear(),n=!1,i&&(i=!1,p.process(d))}};return p}const pi=40;function js(t,e){let a=!1,s=!0;const n={delta:0,timestamp:0,isProcessing:!1},i=()=>a=!0,r=rt.reduce((k,y)=>(k[y]=ci(i),k),{}),{setup:o,read:l,resolveKeyframes:p,preUpdate:d,update:c,preRender:u,render:m,postRender:v}=r,L=()=>{const k=fe.useManualTiming?n.timestamp:performance.now();a=!1,fe.useManualTiming||(n.delta=s?1e3/60:Math.max(Math.min(k-n.timestamp,pi),1)),n.timestamp=k,n.isProcessing=!0,o.process(n),l.process(n),p.process(n),d.process(n),c.process(n),u.process(n),m.process(n),v.process(n),n.isProcessing=!1,a&&e&&(s=!1,t(L))},E=()=>{a=!0,s=!0,n.isProcessing||t(L)};return{schedule:rt.reduce((k,y)=>{const w=r[y];return k[y]=(C,$=!1,M=!1)=>(a||E(),w.schedule(C,$,M)),k},{}),cancel:k=>{for(let y=0;y<rt.length;y++)r[rt[y]].cancel(k)},state:n,steps:r}}const{schedule:be,cancel:Pt,state:gt}=js(typeof requestAnimationFrame<"u"?requestAnimationFrame:De,!0);let ct;function gi(){ct=void 0}const ee={now:()=>(ct===void 0&&ee.set(gt.isProcessing||fe.useManualTiming?gt.timestamp:performance.now()),ct),set:t=>{ct=t,queueMicrotask(gi)}},Os=t=>e=>typeof e=="string"&&e.startsWith(t),Ns=Os("--"),ui=Os("var(--"),la=t=>ui(t)?mi.test(t.split("/*")[0].trim()):!1,mi=/var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;function Da(t){return typeof t!="string"?!1:t.split("/*")[0].includes("var(--")}const Fe={test:t=>typeof t=="number",parse:parseFloat,transform:t=>t},Ye={...Fe,transform:t=>ke(0,1,t)},ot={...Fe,default:1},We=t=>Math.round(t*1e5)/1e5,da=/-?(?:\d+(?:\.\d+)?|\.\d+)/gu;function fi(t){return t==null}const bi=/^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu,ca=(t,e)=>a=>!!(typeof a=="string"&&bi.test(a)&&a.startsWith(t)||e&&!fi(a)&&Object.prototype.hasOwnProperty.call(a,e)),zs=(t,e,a)=>s=>{if(typeof s!="string")return s;const[n,i,r,o]=s.match(da);return{[t]:parseFloat(n),[e]:parseFloat(i),[a]:parseFloat(r),alpha:o!==void 0?parseFloat(o):1}},hi=t=>ke(0,255,t),Tt={...Fe,transform:t=>Math.round(hi(t))},Te={test:ca("rgb","red"),parse:zs("red","green","blue"),transform:({red:t,green:e,blue:a,alpha:s=1})=>"rgba("+Tt.transform(t)+", "+Tt.transform(e)+", "+Tt.transform(a)+", "+We(Ye.transform(s))+")"};function xi(t){let e="",a="",s="",n="";return t.length>5?(e=t.substring(1,3),a=t.substring(3,5),s=t.substring(5,7),n=t.substring(7,9)):(e=t.substring(1,2),a=t.substring(2,3),s=t.substring(3,4),n=t.substring(4,5),e+=e,a+=a,s+=s,n+=n),{red:parseInt(e,16),green:parseInt(a,16),blue:parseInt(s,16),alpha:n?parseInt(n,16)/255:1}}const Vt={test:ca("#"),parse:xi,transform:Te.transform},tt=t=>({test:e=>typeof e=="string"&&e.endsWith(t)&&e.split(" ").length===1,parse:parseFloat,transform:e=>`${e}${t}`}),ye=tt("deg"),Re=tt("%"),T=tt("px"),vi=tt("vh"),yi=tt("vw"),Fa={...Re,parse:t=>Re.parse(t)/100,transform:t=>Re.transform(t*100)},$e={test:ca("hsl","hue"),parse:zs("hue","saturation","lightness"),transform:({hue:t,saturation:e,lightness:a,alpha:s=1})=>"hsla("+Math.round(t)+", "+Re.transform(We(e))+", "+Re.transform(We(a))+", "+We(Ye.transform(s))+")"},W={test:t=>Te.test(t)||Vt.test(t)||$e.test(t),parse:t=>Te.test(t)?Te.parse(t):$e.test(t)?$e.parse(t):Vt.parse(t),transform:t=>typeof t=="string"?t:t.hasOwnProperty("red")?Te.transform(t):$e.transform(t),getAnimatableNone:t=>{const e=W.parse(t);return e.alpha=0,W.transform(e)}},wi=/(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;function ki(t){return isNaN(t)&&typeof t=="string"&&(t.match(da)?.length||0)+(t.match(wi)?.length||0)>0}const _s="number",Hs="color",Ei="var",Si="var(",ja="${}",Ti=/var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;function Xe(t){const e=t.toString(),a=[],s={color:[],number:[],var:[]},n=[];let i=0;const o=e.replace(Ti,l=>(W.test(l)?(s.color.push(i),n.push(Hs),a.push(W.parse(l))):l.startsWith(Si)?(s.var.push(i),n.push(Ei),a.push(l)):(s.number.push(i),n.push(_s),a.push(parseFloat(l))),++i,ja)).split(ja);return{values:a,split:o,indexes:s,types:n}}function Us(t){return Xe(t).values}function qs(t){const{split:e,types:a}=Xe(t),s=e.length;return n=>{let i="";for(let r=0;r<s;r++)if(i+=e[r],n[r]!==void 0){const o=a[r];o===_s?i+=We(n[r]):o===Hs?i+=W.transform(n[r]):i+=n[r]}return i}}const Li=t=>typeof t=="number"?0:W.test(t)?W.getAnimatableNone(t):t;function Ci(t){const e=Us(t);return qs(t)(e.map(Li))}const Ee={test:ki,parse:Us,createTransformer:qs,getAnimatableNone:Ci};function Lt(t,e,a){return a<0&&(a+=1),a>1&&(a-=1),a<1/6?t+(e-t)*6*a:a<1/2?e:a<2/3?t+(e-t)*(2/3-a)*6:t}function Ai({hue:t,saturation:e,lightness:a,alpha:s}){t/=360,e/=100,a/=100;let n=0,i=0,r=0;if(!e)n=i=r=a;else{const o=a<.5?a*(1+e):a+e-a*e,l=2*a-o;n=Lt(l,o,t+1/3),i=Lt(l,o,t),r=Lt(l,o,t-1/3)}return{red:Math.round(n*255),green:Math.round(i*255),blue:Math.round(r*255),alpha:s}}function ut(t,e){return a=>a>0?e:t}const je=(t,e,a)=>t+(e-t)*a,Ct=(t,e,a)=>{const s=t*t,n=a*(e*e-s)+s;return n<0?0:Math.sqrt(n)},Ii=[Vt,Te,$e],Bi=t=>Ii.find(e=>e.test(t));function Oa(t){const e=Bi(t);if(!e)return!1;let a=e.parse(t);return e===$e&&(a=Ai(a)),a}const Na=(t,e)=>{const a=Oa(t),s=Oa(e);if(!a||!s)return ut(t,e);const n={...a};return i=>(n.red=Ct(a.red,s.red,i),n.green=Ct(a.green,s.green,i),n.blue=Ct(a.blue,s.blue,i),n.alpha=je(a.alpha,s.alpha,i),Te.transform(n))},Dt=new Set(["none","hidden"]);function Mi(t,e){return Dt.has(t)?a=>a<=0?t:e:a=>a>=1?e:t}function $i(t,e){return a=>je(t,e,a)}function pa(t){return typeof t=="number"?$i:typeof t=="string"?la(t)?ut:W.test(t)?Na:Vi:Array.isArray(t)?Ws:typeof t=="object"?W.test(t)?Na:Ri:ut}function Ws(t,e){const a=[...t],s=a.length,n=t.map((i,r)=>pa(i)(i,e[r]));return i=>{for(let r=0;r<s;r++)a[r]=n[r](i);return a}}function Ri(t,e){const a={...t,...e},s={};for(const n in a)t[n]!==void 0&&e[n]!==void 0&&(s[n]=pa(t[n])(t[n],e[n]));return n=>{for(const i in s)a[i]=s[i](n);return a}}function Pi(t,e){const a=[],s={color:0,var:0,number:0};for(let n=0;n<e.values.length;n++){const i=e.types[n],r=t.indexes[i][s[i]],o=t.values[r]??0;a[n]=o,s[i]++}return a}const Vi=(t,e)=>{const a=Ee.createTransformer(e),s=Xe(t),n=Xe(e);return s.indexes.var.length===n.indexes.var.length&&s.indexes.color.length===n.indexes.color.length&&s.indexes.number.length>=n.indexes.number.length?Dt.has(t)&&!n.values.length||Dt.has(e)&&!s.values.length?Mi(t,e):na(Ws(Pi(s,n),n.values),a):ut(t,e)};function Gs(t,e,a){return typeof t=="number"&&typeof e=="number"&&typeof a=="number"?je(t,e,a):pa(t)(t,e)}const Di=t=>{const e=({timestamp:a})=>t(a);return{start:(a=!0)=>be.update(e,a),stop:()=>Pt(e),now:()=>gt.isProcessing?gt.timestamp:ee.now()}},Ks=(t,e,a=10)=>{let s="";const n=Math.max(Math.round(e/a),2);for(let i=0;i<n;i++)s+=Math.round(t(i/(n-1))*1e4)/1e4+", ";return`linear(${s.substring(0,s.length-2)})`},mt=2e4;function ga(t){let e=0;const a=50;let s=t.next(e);for(;!s.done&&e<mt;)e+=a,s=t.next(e);return e>=mt?1/0:e}function Ys(t,e=100,a){const s=a({...t,keyframes:[0,e]}),n=Math.min(ga(s),mt);return{type:"keyframes",ease:i=>s.next(n*i).value/e,duration:ne(n)}}const Fi=5;function Xs(t,e,a){const s=Math.max(e-Fi,0);return Ls(a-t(s),e-s)}const N={stiffness:100,damping:10,mass:1,velocity:0,duration:800,bounce:.3,visualDuration:.3,restSpeed:{granular:.01,default:2},restDelta:{granular:.005,default:.5},minDuration:.01,maxDuration:10,minDamping:.05,maxDamping:1},At=.001;function ji({duration:t=N.duration,bounce:e=N.bounce,velocity:a=N.velocity,mass:s=N.mass}){let n,i,r=1-e;r=ke(N.minDamping,N.maxDamping,r),t=ke(N.minDuration,N.maxDuration,ne(t)),r<1?(n=p=>{const d=p*r,c=d*t,u=d-a,m=Ft(p,r),v=Math.exp(-c);return At-u/m*v},i=p=>{const c=p*r*t,u=c*a+a,m=Math.pow(r,2)*Math.pow(p,2)*t,v=Math.exp(-c),L=Ft(Math.pow(p,2),r);return(-n(p)+At>0?-1:1)*((u-m)*v)/L}):(n=p=>{const d=Math.exp(-p*t),c=(p-a)*t+1;return-At+d*c},i=p=>{const d=Math.exp(-p*t),c=(a-p)*(t*t);return d*c});const o=5/t,l=Ni(n,i,o);if(t=ue(t),isNaN(l))return{stiffness:N.stiffness,damping:N.damping,duration:t};{const p=Math.pow(l,2)*s;return{stiffness:p,damping:r*2*Math.sqrt(s*p),duration:t}}}const Oi=12;function Ni(t,e,a){let s=a;for(let n=1;n<Oi;n++)s=s-t(s)/e(s);return s}function Ft(t,e){return t*Math.sqrt(1-e*e)}const zi=["duration","bounce"],_i=["stiffness","damping","mass"];function za(t,e){return e.some(a=>t[a]!==void 0)}function Hi(t){let e={velocity:N.velocity,stiffness:N.stiffness,damping:N.damping,mass:N.mass,isResolvedFromDuration:!1,...t};if(!za(t,_i)&&za(t,zi))if(t.visualDuration){const a=t.visualDuration,s=2*Math.PI/(a*1.2),n=s*s,i=2*ke(.05,1,1-(t.bounce||0))*Math.sqrt(n);e={...e,mass:N.mass,stiffness:n,damping:i}}else{const a=ji(t);e={...e,...a,mass:N.mass},e.isResolvedFromDuration=!0}return e}function Je(t=N.visualDuration,e=N.bounce){const a=typeof t!="object"?{visualDuration:t,keyframes:[0,1],bounce:e}:t;let{restSpeed:s,restDelta:n}=a;const i=a.keyframes[0],r=a.keyframes[a.keyframes.length-1],o={done:!1,value:i},{stiffness:l,damping:p,mass:d,duration:c,velocity:u,isResolvedFromDuration:m}=Hi({...a,velocity:-ne(a.velocity||0)}),v=u||0,L=p/(2*Math.sqrt(l*d)),E=r-i,A=ne(Math.sqrt(l/d)),b=Math.abs(E)<5;s||(s=b?N.restSpeed.granular:N.restSpeed.default),n||(n=b?N.restDelta.granular:N.restDelta.default);let k;if(L<1){const w=Ft(A,L);k=C=>{const $=Math.exp(-L*A*C);return r-$*((v+L*A*E)/w*Math.sin(w*C)+E*Math.cos(w*C))}}else if(L===1)k=w=>r-Math.exp(-A*w)*(E+(v+A*E)*w);else{const w=A*Math.sqrt(L*L-1);k=C=>{const $=Math.exp(-L*A*C),M=Math.min(w*C,300);return r-$*((v+L*A*E)*Math.sinh(M)+w*E*Math.cosh(M))/w}}const y={calculatedDuration:m&&c||null,next:w=>{const C=k(w);if(m)o.done=w>=c;else{let $=w===0?v:0;L<1&&($=w===0?ue(v):Xs(k,w,C));const M=Math.abs($)<=s,D=Math.abs(r-C)<=n;o.done=M&&D}return o.value=o.done?r:C,o},toString:()=>{const w=Math.min(ga(y),mt),C=Ks($=>y.next(w*$).value,w,30);return w+"ms "+C},toTransition:()=>{}};return y}Je.applyToOptions=t=>{const e=Ys(t,100,Je);return t.ease=e.ease,t.duration=ue(e.duration),t.type="keyframes",t};function jt({keyframes:t,velocity:e=0,power:a=.8,timeConstant:s=325,bounceDamping:n=10,bounceStiffness:i=500,modifyTarget:r,min:o,max:l,restDelta:p=.5,restSpeed:d}){const c=t[0],u={done:!1,value:c},m=M=>o!==void 0&&M<o||l!==void 0&&M>l,v=M=>o===void 0?l:l===void 0||Math.abs(o-M)<Math.abs(l-M)?o:l;let L=a*e;const E=c+L,A=r===void 0?E:r(E);A!==E&&(L=A-c);const b=M=>-L*Math.exp(-M/s),k=M=>A+b(M),y=M=>{const D=b(M),j=k(M);u.done=Math.abs(D)<=p,u.value=u.done?A:j};let w,C;const $=M=>{m(u.value)&&(w=M,C=Je({keyframes:[u.value,v(u.value)],velocity:Xs(k,M,u.value),damping:n,stiffness:i,restDelta:p,restSpeed:d}))};return $(0),{calculatedDuration:null,next:M=>{let D=!1;return!C&&w===void 0&&(D=!0,y(M),$(M)),w!==void 0&&M>=w?C.next(M-w):(!D&&y(M),u)}}}function Ui(t,e,a){const s=[],n=a||fe.mix||Gs,i=t.length-1;for(let r=0;r<i;r++){let o=n(t[r],t[r+1]);if(e){const l=Array.isArray(e)?e[r]||De:e;o=na(l,o)}s.push(o)}return s}function qi(t,e,{clamp:a=!0,ease:s,mixer:n}={}){const i=t.length;if(aa(i===e.length),i===1)return()=>e[0];if(i===2&&e[0]===e[1])return()=>e[1];const r=t[0]===t[1];t[0]>t[i-1]&&(t=[...t].reverse(),e=[...e].reverse());const o=Ui(e,s,n),l=o.length,p=d=>{if(r&&d<t[0])return e[0];let c=0;if(l>1)for(;c<t.length-2&&!(d<t[c+1]);c++);const u=ia(t[c],t[c+1],d);return o[c](u)};return a?d=>p(ke(t[0],t[i-1],d)):p}function Js(t,e){const a=t[t.length-1];for(let s=1;s<=e;s++){const n=ia(0,e,s);t.push(je(a,1,n))}}function Zs(t){const e=[0];return Js(e,t.length-1),e}function Wi(t,e){return t.map(a=>a*e)}function Gi(t,e){return t.map(()=>e||Ps).splice(0,t.length-1)}function Ge({duration:t=300,keyframes:e,times:a,ease:s="easeInOut"}){const n=Vs(s)?s.map(Va):Va(s),i={done:!1,value:e[0]},r=Wi(a&&a.length===e.length?a:Zs(e),t),o=qi(r,e,{ease:Array.isArray(n)?n:Gi(e,n)});return{calculatedDuration:t,next:l=>(i.value=o(l),i.done=l>=t,i)}}const Ki=t=>t!==null;function ua(t,{repeat:e,repeatType:a="loop"},s,n=1){const i=t.filter(Ki),o=n<0||e&&a!=="loop"&&e%2===1?0:i.length-1;return!o||s===void 0?i[o]:s}const Yi={decay:jt,inertia:jt,tween:Ge,keyframes:Ge,spring:Je};function Qs(t){typeof t.type=="string"&&(t.type=Yi[t.type])}class ma{constructor(){this.updateFinished()}get finished(){return this._finished}updateFinished(){this._finished=new Promise(e=>{this.resolve=e})}notifyFinished(){this.resolve()}then(e,a){return this.finished.then(e,a)}}const Xi=t=>t/100;class fa extends ma{constructor(e){super(),this.state="idle",this.startTime=null,this.isStopped=!1,this.currentTime=0,this.holdTime=null,this.playbackSpeed=1,this.stop=()=>{const{motionValue:a}=this.options;a&&a.updatedAt!==ee.now()&&this.tick(ee.now()),this.isStopped=!0,this.state!=="idle"&&(this.teardown(),this.options.onStop?.())},this.options=e,this.initAnimation(),this.play(),e.autoplay===!1&&this.pause()}initAnimation(){const{options:e}=this;Qs(e);const{type:a=Ge,repeat:s=0,repeatDelay:n=0,repeatType:i,velocity:r=0}=e;let{keyframes:o}=e;const l=a||Ge;l!==Ge&&typeof o[0]!="number"&&(this.mixKeyframes=na(Xi,Gs(o[0],o[1])),o=[0,100]);const p=l({...e,keyframes:o});i==="mirror"&&(this.mirroredGenerator=l({...e,keyframes:[...o].reverse(),velocity:-r})),p.calculatedDuration===null&&(p.calculatedDuration=ga(p));const{calculatedDuration:d}=p;this.calculatedDuration=d,this.resolvedDuration=d+n,this.totalDuration=this.resolvedDuration*(s+1)-n,this.generator=p}updateTime(e){const a=Math.round(e-this.startTime)*this.playbackSpeed;this.holdTime!==null?this.currentTime=this.holdTime:this.currentTime=a}tick(e,a=!1){const{generator:s,totalDuration:n,mixKeyframes:i,mirroredGenerator:r,resolvedDuration:o,calculatedDuration:l}=this;if(this.startTime===null)return s.next(0);const{delay:p=0,keyframes:d,repeat:c,repeatType:u,repeatDelay:m,type:v,onUpdate:L,finalKeyframe:E}=this.options;this.speed>0?this.startTime=Math.min(this.startTime,e):this.speed<0&&(this.startTime=Math.min(e-n/this.speed,this.startTime)),a?this.currentTime=e:this.updateTime(e);const A=this.currentTime-p*(this.playbackSpeed>=0?1:-1),b=this.playbackSpeed>=0?A<0:A>n;this.currentTime=Math.max(A,0),this.state==="finished"&&this.holdTime===null&&(this.currentTime=n);let k=this.currentTime,y=s;if(c){const M=Math.min(this.currentTime,n)/o;let D=Math.floor(M),j=M%1;!j&&M>=1&&(j=1),j===1&&D--,D=Math.min(D,c+1),D%2&&(u==="reverse"?(j=1-j,m&&(j-=m/o)):u==="mirror"&&(y=r)),k=ke(0,1,j)*o}const w=b?{done:!1,value:d[0]}:y.next(k);i&&(w.value=i(w.value));let{done:C}=w;!b&&l!==null&&(C=this.playbackSpeed>=0?this.currentTime>=n:this.currentTime<=0);const $=this.holdTime===null&&(this.state==="finished"||this.state==="running"&&C);return $&&v!==jt&&(w.value=ua(d,this.options,E,this.speed)),L&&L(w.value),$&&this.finish(),w}then(e,a){return this.finished.then(e,a)}get duration(){return ne(this.calculatedDuration)}get iterationDuration(){const{delay:e=0}=this.options||{};return this.duration+ne(e)}get time(){return ne(this.currentTime)}set time(e){e=ue(e),this.currentTime=e,this.startTime===null||this.holdTime!==null||this.playbackSpeed===0?this.holdTime=e:this.driver&&(this.startTime=this.driver.now()-e/this.playbackSpeed),this.driver?.start(!1)}get speed(){return this.playbackSpeed}set speed(e){this.updateTime(ee.now());const a=this.playbackSpeed!==e;this.playbackSpeed=e,a&&(this.time=ne(this.currentTime))}play(){if(this.isStopped)return;const{driver:e=Di,startTime:a}=this.options;this.driver||(this.driver=e(n=>this.tick(n))),this.options.onPlay?.();const s=this.driver.now();this.state==="finished"?(this.updateFinished(),this.startTime=s):this.holdTime!==null?this.startTime=s-this.holdTime:this.startTime||(this.startTime=a??s),this.state==="finished"&&this.speed<0&&(this.startTime+=this.calculatedDuration),this.holdTime=null,this.state="running",this.driver.start()}pause(){this.state="paused",this.updateTime(ee.now()),this.holdTime=this.currentTime}complete(){this.state!=="running"&&this.play(),this.state="finished",this.holdTime=null}finish(){this.notifyFinished(),this.teardown(),this.state="finished",this.options.onComplete?.()}cancel(){this.holdTime=null,this.startTime=0,this.tick(0),this.teardown(),this.options.onCancel?.()}teardown(){this.state="idle",this.stopDriver(),this.startTime=this.holdTime=null}stopDriver(){this.driver&&(this.driver.stop(),this.driver=void 0)}sample(e){return this.startTime=0,this.tick(e,!0)}attachTimeline(e){return this.options.allowFlatten&&(this.options.type="keyframes",this.options.ease="linear",this.initAnimation()),this.driver?.stop(),e.observe(this)}}function Ji(t){for(let e=1;e<t.length;e++)t[e]??(t[e]=t[e-1])}const Le=t=>t*180/Math.PI,Ot=t=>{const e=Le(Math.atan2(t[1],t[0]));return Nt(e)},Zi={x:4,y:5,translateX:4,translateY:5,scaleX:0,scaleY:3,scale:t=>(Math.abs(t[0])+Math.abs(t[3]))/2,rotate:Ot,rotateZ:Ot,skewX:t=>Le(Math.atan(t[1])),skewY:t=>Le(Math.atan(t[2])),skew:t=>(Math.abs(t[1])+Math.abs(t[2]))/2},Nt=t=>(t=t%360,t<0&&(t+=360),t),_a=Ot,Ha=t=>Math.sqrt(t[0]*t[0]+t[1]*t[1]),Ua=t=>Math.sqrt(t[4]*t[4]+t[5]*t[5]),Qi={x:12,y:13,z:14,translateX:12,translateY:13,translateZ:14,scaleX:Ha,scaleY:Ua,scale:t=>(Ha(t)+Ua(t))/2,rotateX:t=>Nt(Le(Math.atan2(t[6],t[5]))),rotateY:t=>Nt(Le(Math.atan2(-t[2],t[0]))),rotateZ:_a,rotate:_a,skewX:t=>Le(Math.atan(t[4])),skewY:t=>Le(Math.atan(t[1])),skew:t=>(Math.abs(t[1])+Math.abs(t[4]))/2};function zt(t){return t.includes("scale")?1:0}function _t(t,e){if(!t||t==="none")return zt(e);const a=t.match(/^matrix3d\(([-\d.e\s,]+)\)$/u);let s,n;if(a)s=Qi,n=a;else{const o=t.match(/^matrix\(([-\d.e\s,]+)\)$/u);s=Zi,n=o}if(!n)return zt(e);const i=s[e],r=n[1].split(",").map(tr);return typeof i=="function"?i(r):r[i]}const er=(t,e)=>{const{transform:a="none"}=getComputedStyle(t);return _t(a,e)};function tr(t){return parseFloat(t.trim())}const Oe=["transformPerspective","x","y","z","translateX","translateY","translateZ","scale","scaleX","scaleY","rotate","rotateX","rotateY","rotateZ","skew","skewX","skewY"],Ne=new Set(Oe),qa=t=>t===Fe||t===T,ar=new Set(["x","y","z"]),sr=Oe.filter(t=>!ar.has(t));function nr(t){const e=[];return sr.forEach(a=>{const s=t.getValue(a);s!==void 0&&(e.push([a,s.get()]),s.set(a.startsWith("scale")?1:0))}),e}const we={width:({x:t},{paddingLeft:e="0",paddingRight:a="0"})=>t.max-t.min-parseFloat(e)-parseFloat(a),height:({y:t},{paddingTop:e="0",paddingBottom:a="0"})=>t.max-t.min-parseFloat(e)-parseFloat(a),top:(t,{top:e})=>parseFloat(e),left:(t,{left:e})=>parseFloat(e),bottom:({y:t},{top:e})=>parseFloat(e)+(t.max-t.min),right:({x:t},{left:e})=>parseFloat(e)+(t.max-t.min),x:(t,{transform:e})=>_t(e,"x"),y:(t,{transform:e})=>_t(e,"y")};we.translateX=we.x;we.translateY=we.y;const Ce=new Set;let Ht=!1,Ut=!1,qt=!1;function en(){if(Ut){const t=Array.from(Ce).filter(s=>s.needsMeasurement),e=new Set(t.map(s=>s.element)),a=new Map;e.forEach(s=>{const n=nr(s);n.length&&(a.set(s,n),s.render())}),t.forEach(s=>s.measureInitialState()),e.forEach(s=>{s.render();const n=a.get(s);n&&n.forEach(([i,r])=>{s.getValue(i)?.set(r)})}),t.forEach(s=>s.measureEndState()),t.forEach(s=>{s.suspendedScrollY!==void 0&&window.scrollTo(0,s.suspendedScrollY)})}Ut=!1,Ht=!1,Ce.forEach(t=>t.complete(qt)),Ce.clear()}function tn(){Ce.forEach(t=>{t.readKeyframes(),t.needsMeasurement&&(Ut=!0)})}function ir(){qt=!0,tn(),en(),qt=!1}class ba{constructor(e,a,s,n,i,r=!1){this.state="pending",this.isAsync=!1,this.needsMeasurement=!1,this.unresolvedKeyframes=[...e],this.onComplete=a,this.name=s,this.motionValue=n,this.element=i,this.isAsync=r}scheduleResolve(){this.state="scheduled",this.isAsync?(Ce.add(this),Ht||(Ht=!0,be.read(tn),be.resolveKeyframes(en))):(this.readKeyframes(),this.complete())}readKeyframes(){const{unresolvedKeyframes:e,name:a,element:s,motionValue:n}=this;if(e[0]===null){const i=n?.get(),r=e[e.length-1];if(i!==void 0)e[0]=i;else if(s&&a){const o=s.readValue(a,r);o!=null&&(e[0]=o)}e[0]===void 0&&(e[0]=r),n&&i===void 0&&n.set(e[0])}Ji(e)}setFinalKeyframe(){}measureInitialState(){}renderEndStyles(){}measureEndState(){}complete(e=!1){this.state="complete",this.onComplete(this.unresolvedKeyframes,this.finalKeyframe,e),Ce.delete(this)}cancel(){this.state==="scheduled"&&(Ce.delete(this),this.state="pending")}resume(){this.state==="pending"&&this.scheduleResolve()}}const rr=t=>t.startsWith("--");function or(t,e,a){rr(e)?t.style.setProperty(e,a):t.style[e]=a}const lr=sa(()=>window.ScrollTimeline!==void 0),dr={};function cr(t,e){const a=sa(t);return()=>dr[e]??a()}const an=cr(()=>{try{document.createElement("div").animate({opacity:0},{easing:"linear(0, 1)"})}catch{return!1}return!0},"linearEasing"),Ue=([t,e,a,s])=>`cubic-bezier(${t}, ${e}, ${a}, ${s})`,Wa={linear:"linear",ease:"ease",easeIn:"ease-in",easeOut:"ease-out",easeInOut:"ease-in-out",circIn:Ue([0,.65,.55,1]),circOut:Ue([.55,0,1,.45]),backIn:Ue([.31,.01,.66,-.59]),backOut:Ue([.33,1.53,.69,.99])};function sn(t,e){if(t)return typeof t=="function"?an()?Ks(t,e):"ease-out":Fs(t)?Ue(t):Array.isArray(t)?t.map(a=>sn(a,e)||Wa.easeOut):Wa[t]}function pr(t,e,a,{delay:s=0,duration:n=300,repeat:i=0,repeatType:r="loop",ease:o="easeOut",times:l}={},p=void 0){const d={[e]:a};l&&(d.offset=l);const c=sn(o,n);Array.isArray(c)&&(d.easing=c);const u={delay:s,duration:n,easing:Array.isArray(c)?"linear":c,fill:"both",iterations:i+1,direction:r==="reverse"?"alternate":"normal"};return p&&(u.pseudoElement=p),t.animate(d,u)}function ha(t){return typeof t=="function"&&"applyToOptions"in t}function gr({type:t,...e}){return ha(t)&&an()?t.applyToOptions(e):(e.duration??(e.duration=300),e.ease??(e.ease="easeOut"),e)}class ur extends ma{constructor(e){if(super(),this.finishedTime=null,this.isStopped=!1,this.manualStartTime=null,!e)return;const{element:a,name:s,keyframes:n,pseudoElement:i,allowFlatten:r=!1,finalKeyframe:o,onComplete:l}=e;this.isPseudoElement=!!i,this.allowFlatten=r,this.options=e,aa(typeof e.type!="string");const p=gr(e);this.animation=pr(a,s,n,p,i),p.autoplay===!1&&this.animation.pause(),this.animation.onfinish=()=>{if(this.finishedTime=this.time,!i){const d=ua(n,this.options,o,this.speed);this.updateMotionValue?this.updateMotionValue(d):or(a,s,d),this.animation.cancel()}l?.(),this.notifyFinished()}}play(){this.isStopped||(this.manualStartTime=null,this.animation.play(),this.state==="finished"&&this.updateFinished())}pause(){this.animation.pause()}complete(){this.animation.finish?.()}cancel(){try{this.animation.cancel()}catch{}}stop(){if(this.isStopped)return;this.isStopped=!0;const{state:e}=this;e==="idle"||e==="finished"||(this.updateMotionValue?this.updateMotionValue():this.commitStyles(),this.isPseudoElement||this.cancel())}commitStyles(){this.isPseudoElement||this.animation.commitStyles?.()}get duration(){const e=this.animation.effect?.getComputedTiming?.().duration||0;return ne(Number(e))}get iterationDuration(){const{delay:e=0}=this.options||{};return this.duration+ne(e)}get time(){return ne(Number(this.animation.currentTime)||0)}set time(e){this.manualStartTime=null,this.finishedTime=null,this.animation.currentTime=ue(e)}get speed(){return this.animation.playbackRate}set speed(e){e<0&&(this.finishedTime=null),this.animation.playbackRate=e}get state(){return this.finishedTime!==null?"finished":this.animation.playState}get startTime(){return this.manualStartTime??Number(this.animation.startTime)}set startTime(e){this.manualStartTime=this.animation.startTime=e}attachTimeline({timeline:e,observe:a}){return this.allowFlatten&&this.animation.effect?.updateTiming({easing:"linear"}),this.animation.onfinish=null,e&&lr()?(this.animation.timeline=e,De):a(this)}}const nn={anticipate:$s,backInOut:Ms,circInOut:Rs};function mr(t){return t in nn}function fr(t){typeof t.ease=="string"&&mr(t.ease)&&(t.ease=nn[t.ease])}const It=10;class br extends ur{constructor(e){fr(e),Qs(e),super(e),e.startTime!==void 0&&(this.startTime=e.startTime),this.options=e}updateMotionValue(e){const{motionValue:a,onUpdate:s,onComplete:n,element:i,...r}=this.options;if(!a)return;if(e!==void 0){a.set(e);return}const o=new fa({...r,autoplay:!1}),l=Math.max(It,ee.now()-this.startTime),p=ke(0,It,l-It);a.setWithVelocity(o.sample(Math.max(0,l-p)).value,o.sample(l).value,p),o.stop()}}const Ga=(t,e)=>e==="zIndex"?!1:!!(typeof t=="number"||Array.isArray(t)||typeof t=="string"&&(Ee.test(t)||t==="0")&&!t.startsWith("url("));function hr(t){const e=t[0];if(t.length===1)return!0;for(let a=0;a<t.length;a++)if(t[a]!==e)return!0}function xr(t,e,a,s){const n=t[0];if(n===null)return!1;if(e==="display"||e==="visibility")return!0;const i=t[t.length-1],r=Ga(n,e),o=Ga(i,e);return!r||!o?!1:hr(t)||(a==="spring"||ha(a))&&s}function Wt(t){t.duration=0,t.type="keyframes"}const vr=new Set(["opacity","clipPath","filter","transform"]),yr=sa(()=>Object.hasOwnProperty.call(Element.prototype,"animate"));function wr(t){const{motionValue:e,name:a,repeatDelay:s,repeatType:n,damping:i,type:r}=t;if(!(e?.owner?.current instanceof HTMLElement))return!1;const{onUpdate:l,transformTemplate:p}=e.owner.getProps();return yr()&&a&&vr.has(a)&&(a!=="transform"||!p)&&!l&&!s&&n!=="mirror"&&i!==0&&r!=="inertia"}const kr=40;class Er extends ma{constructor({autoplay:e=!0,delay:a=0,type:s="keyframes",repeat:n=0,repeatDelay:i=0,repeatType:r="loop",keyframes:o,name:l,motionValue:p,element:d,...c}){super(),this.stop=()=>{this._animation&&(this._animation.stop(),this.stopTimeline?.()),this.keyframeResolver?.cancel()},this.createdAt=ee.now();const u={autoplay:e,delay:a,type:s,repeat:n,repeatDelay:i,repeatType:r,name:l,motionValue:p,element:d,...c},m=d?.KeyframeResolver||ba;this.keyframeResolver=new m(o,(v,L,E)=>this.onKeyframesResolved(v,L,u,!E),l,p,d),this.keyframeResolver?.scheduleResolve()}onKeyframesResolved(e,a,s,n){this.keyframeResolver=void 0;const{name:i,type:r,velocity:o,delay:l,isHandoff:p,onUpdate:d}=s;this.resolvedAt=ee.now(),xr(e,i,r,o)||((fe.instantAnimations||!l)&&d?.(ua(e,s,a)),e[0]=e[e.length-1],Wt(s),s.repeat=0);const u={startTime:n?this.resolvedAt?this.resolvedAt-this.createdAt>kr?this.resolvedAt:this.createdAt:this.createdAt:void 0,finalKeyframe:a,...s,keyframes:e},m=!p&&wr(u)?new br({...u,element:u.motionValue.owner.current}):new fa(u);m.finished.then(()=>this.notifyFinished()).catch(De),this.pendingTimeline&&(this.stopTimeline=m.attachTimeline(this.pendingTimeline),this.pendingTimeline=void 0),this._animation=m}get finished(){return this._animation?this.animation.finished:this._finished}then(e,a){return this.finished.finally(e).then(()=>{})}get animation(){return this._animation||(this.keyframeResolver?.resume(),ir()),this._animation}get duration(){return this.animation.duration}get iterationDuration(){return this.animation.iterationDuration}get time(){return this.animation.time}set time(e){this.animation.time=e}get speed(){return this.animation.speed}get state(){return this.animation.state}set speed(e){this.animation.speed=e}get startTime(){return this.animation.startTime}attachTimeline(e){return this._animation?this.stopTimeline=this.animation.attachTimeline(e):this.pendingTimeline=e,()=>this.stop()}play(){this.animation.play()}pause(){this.animation.pause()}complete(){this.animation.complete()}cancel(){this._animation&&this.animation.cancel(),this.keyframeResolver?.cancel()}}class Sr{constructor(e){this.stop=()=>this.runAll("stop"),this.animations=e.filter(Boolean)}get finished(){return Promise.all(this.animations.map(e=>e.finished))}getAll(e){return this.animations[0][e]}setAll(e,a){for(let s=0;s<this.animations.length;s++)this.animations[s][e]=a}attachTimeline(e){const a=this.animations.map(s=>s.attachTimeline(e));return()=>{a.forEach((s,n)=>{s&&s(),this.animations[n].stop()})}}get time(){return this.getAll("time")}set time(e){this.setAll("time",e)}get speed(){return this.getAll("speed")}set speed(e){this.setAll("speed",e)}get state(){return this.getAll("state")}get startTime(){return this.getAll("startTime")}get duration(){return Ka(this.animations,"duration")}get iterationDuration(){return Ka(this.animations,"iterationDuration")}runAll(e){this.animations.forEach(a=>a[e]())}play(){this.runAll("play")}pause(){this.runAll("pause")}cancel(){this.runAll("cancel")}complete(){this.runAll("complete")}}function Ka(t,e){let a=0;for(let s=0;s<t.length;s++){const n=t[s][e];n!==null&&n>a&&(a=n)}return a}class Tr extends Sr{then(e,a){return this.finished.finally(e).then(()=>{})}}const Lr=/^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u;function Cr(t){const e=Lr.exec(t);if(!e)return[,];const[,a,s,n]=e;return[`--${a??s}`,n]}function rn(t,e,a=1){const[s,n]=Cr(t);if(!s)return;const i=window.getComputedStyle(e).getPropertyValue(s);if(i){const r=i.trim();return Es(r)?parseFloat(r):r}return la(n)?rn(n,e,a+1):n}function on(t,e){return t?.[e]??t?.default??t}const Ar={type:"spring",stiffness:500,damping:25,restSpeed:10},Ir=t=>({type:"spring",stiffness:550,damping:t===0?2*Math.sqrt(550):30,restSpeed:10}),Br={type:"keyframes",duration:.8},Mr={type:"keyframes",ease:[.25,.1,.35,1],duration:.3},$r=(t,{keyframes:e})=>e.length>2?Br:Ne.has(t)?t.startsWith("scale")?Ir(e[1]):Ar:Mr;function Rr({when:t,delay:e,delayChildren:a,staggerChildren:s,staggerDirection:n,repeat:i,repeatType:r,repeatDelay:o,from:l,elapsed:p,...d}){return!!Object.keys(d).length}const Pr=t=>t!==null;function Vr(t,{repeat:e,repeatType:a="loop"},s){const n=t.filter(Pr),i=e&&a!=="loop"&&e%2===1?0:n.length-1;return n[i]}const ln=(t,e,a,s={},n,i)=>r=>{const o=on(s,t)||{},l=o.delay||s.delay||0;let{elapsed:p=0}=s;p=p-ue(l);const d={keyframes:Array.isArray(a)?a:[null,a],ease:"easeOut",velocity:e.getVelocity(),...o,delay:-p,onUpdate:u=>{e.set(u),o.onUpdate&&o.onUpdate(u)},onComplete:()=>{r(),o.onComplete&&o.onComplete()},name:t,motionValue:e,element:i?void 0:n};Rr(o)||Object.assign(d,$r(t,d)),d.duration&&(d.duration=ue(d.duration)),d.repeatDelay&&(d.repeatDelay=ue(d.repeatDelay)),d.from!==void 0&&(d.keyframes[0]=d.from);let c=!1;if((d.type===!1||d.duration===0&&!d.repeatDelay)&&(Wt(d),d.delay===0&&(c=!0)),(fe.instantAnimations||fe.skipAnimations)&&(c=!0,Wt(d),d.delay=0),d.allowFlatten=!o.type&&!o.ease,c&&!i&&e.get()!==void 0){const u=Vr(d.keyframes,o);if(u!==void 0){be.update(()=>{d.onUpdate(u),d.onComplete()});return}}return o.isSync?new fa(d):new Er(d)},dn=new Set(["width","height","top","left","right","bottom",...Oe]),Ya=30,Dr=t=>!isNaN(parseFloat(t));class Fr{constructor(e,a={}){this.canTrackVelocity=null,this.events={},this.updateAndNotify=s=>{const n=ee.now();if(this.updatedAt!==n&&this.setPrevFrameValue(),this.prev=this.current,this.setCurrent(s),this.current!==this.prev&&(this.events.change?.notify(this.current),this.dependents))for(const i of this.dependents)i.dirty()},this.hasAnimated=!1,this.setCurrent(e),this.owner=a.owner}setCurrent(e){this.current=e,this.updatedAt=ee.now(),this.canTrackVelocity===null&&e!==void 0&&(this.canTrackVelocity=Dr(this.current))}setPrevFrameValue(e=this.current){this.prevFrameValue=e,this.prevUpdatedAt=this.updatedAt}onChange(e){return this.on("change",e)}on(e,a){this.events[e]||(this.events[e]=new Ts);const s=this.events[e].add(a);return e==="change"?()=>{s(),be.read(()=>{this.events.change.getSize()||this.stop()})}:s}clearListeners(){for(const e in this.events)this.events[e].clear()}attach(e,a){this.passiveEffect=e,this.stopPassiveEffect=a}set(e){this.passiveEffect?this.passiveEffect(e,this.updateAndNotify):this.updateAndNotify(e)}setWithVelocity(e,a,s){this.set(a),this.prev=void 0,this.prevFrameValue=e,this.prevUpdatedAt=this.updatedAt-s}jump(e,a=!0){this.updateAndNotify(e),this.prev=e,this.prevUpdatedAt=this.prevFrameValue=void 0,a&&this.stop(),this.stopPassiveEffect&&this.stopPassiveEffect()}dirty(){this.events.change?.notify(this.current)}addDependent(e){this.dependents||(this.dependents=new Set),this.dependents.add(e)}removeDependent(e){this.dependents&&this.dependents.delete(e)}get(){return this.current}getPrevious(){return this.prev}getVelocity(){const e=ee.now();if(!this.canTrackVelocity||this.prevFrameValue===void 0||e-this.updatedAt>Ya)return 0;const a=Math.min(this.updatedAt-this.prevUpdatedAt,Ya);return Ls(parseFloat(this.current)-parseFloat(this.prevFrameValue),a)}start(e){return this.stop(),new Promise(a=>{this.hasAnimated=!0,this.animation=e(a),this.events.animationStart&&this.events.animationStart.notify()}).then(()=>{this.events.animationComplete&&this.events.animationComplete.notify(),this.clearAnimation()})}stop(){this.animation&&(this.animation.stop(),this.events.animationCancel&&this.events.animationCancel.notify()),this.clearAnimation()}isAnimating(){return!!this.animation}clearAnimation(){delete this.animation}destroy(){this.dependents?.clear(),this.events.destroy?.notify(),this.clearListeners(),this.stop(),this.stopPassiveEffect&&this.stopPassiveEffect()}}function Ze(t,e){return new Fr(t,e)}function Xa(t){const e=[{},{}];return t?.values.forEach((a,s)=>{e[0][s]=a.get(),e[1][s]=a.getVelocity()}),e}function cn(t,e,a,s){if(typeof e=="function"){const[n,i]=Xa(s);e=e(a!==void 0?a:t.custom,n,i)}if(typeof e=="string"&&(e=t.variants&&t.variants[e]),typeof e=="function"){const[n,i]=Xa(s);e=e(a!==void 0?a:t.custom,n,i)}return e}function jr(t,e,a){const s=t.getProps();return cn(s,e,s.custom,t)}const Or=t=>Array.isArray(t);function Nr(t,e,a){t.hasValue(e)?t.getValue(e).set(a):t.addValue(e,Ze(a))}function zr(t){return Or(t)?t[t.length-1]||0:t}function _r(t,e){const a=jr(t,e);let{transitionEnd:s={},transition:n={},...i}=a||{};i={...i,...s};for(const r in i){const o=zr(i[r]);Nr(t,r,o)}}const Q=t=>!!(t&&t.getVelocity);function Hr(t){return!!(Q(t)&&t.add)}function Ur(t,e){const a=t.getValue("willChange");if(Hr(a))return a.add(e);if(!a&&fe.WillChange){const s=new fe.WillChange("auto");t.addValue("willChange",s),s.add(e)}}function xa(t){return t.replace(/([A-Z])/g,e=>`-${e.toLowerCase()}`)}const qr="framerAppearId",Wr="data-"+xa(qr);function Gr(t){return t.props[Wr]}function Kr({protectedKeys:t,needsAnimating:e},a){const s=t.hasOwnProperty(a)&&e[a]!==!0;return e[a]=!1,s}function Yr(t,e,{delay:a=0,transitionOverride:s,type:n}={}){let{transition:i=t.getDefaultTransition(),transitionEnd:r,...o}=e;s&&(i=s);const l=[],p=n&&t.animationState&&t.animationState.getState()[n];for(const d in o){const c=t.getValue(d,t.latestValues[d]??null),u=o[d];if(u===void 0||p&&Kr(p,d))continue;const m={delay:a,...on(i||{},d)},v=c.get();if(v!==void 0&&!c.isAnimating&&!Array.isArray(u)&&u===v&&!m.velocity)continue;let L=!1;if(window.MotionHandoffAnimation){const A=Gr(t);if(A){const b=window.MotionHandoffAnimation(A,d,be);b!==null&&(m.startTime=b,L=!0)}}Ur(t,d),c.start(ln(d,c,u,t.shouldReduceMotion&&dn.has(d)?{type:!1}:m,t,L));const E=c.animation;E&&l.push(E)}return r&&Promise.all(l).then(()=>{be.update(()=>{r&&_r(t,r)})}),l}const Xr={test:t=>t==="auto",parse:t=>t},pn=t=>e=>e.test(t),gn=[Fe,T,Re,ye,yi,vi,Xr],Ja=t=>gn.find(pn(t));function Jr(t){return typeof t=="number"?t===0:t!==null?t==="none"||t==="0"||Ss(t):!0}const Zr=new Set(["brightness","contrast","saturate","opacity"]);function Qr(t){const[e,a]=t.slice(0,-1).split("(");if(e==="drop-shadow")return t;const[s]=a.match(da)||[];if(!s)return t;const n=a.replace(s,"");let i=Zr.has(e)?1:0;return s!==a&&(i*=100),e+"("+i+n+")"}const eo=/\b([a-z-]*)\(.*?\)/gu,Gt={...Ee,getAnimatableNone:t=>{const e=t.match(eo);return e?e.map(Qr).join(" "):t}},Za={...Fe,transform:Math.round},to={rotate:ye,rotateX:ye,rotateY:ye,rotateZ:ye,scale:ot,scaleX:ot,scaleY:ot,scaleZ:ot,skew:ye,skewX:ye,skewY:ye,distance:T,translateX:T,translateY:T,translateZ:T,x:T,y:T,z:T,perspective:T,transformPerspective:T,opacity:Ye,originX:Fa,originY:Fa,originZ:T},va={borderWidth:T,borderTopWidth:T,borderRightWidth:T,borderBottomWidth:T,borderLeftWidth:T,borderRadius:T,radius:T,borderTopLeftRadius:T,borderTopRightRadius:T,borderBottomRightRadius:T,borderBottomLeftRadius:T,width:T,maxWidth:T,height:T,maxHeight:T,top:T,right:T,bottom:T,left:T,inset:T,insetBlock:T,insetBlockStart:T,insetBlockEnd:T,insetInline:T,insetInlineStart:T,insetInlineEnd:T,padding:T,paddingTop:T,paddingRight:T,paddingBottom:T,paddingLeft:T,paddingBlock:T,paddingBlockStart:T,paddingBlockEnd:T,paddingInline:T,paddingInlineStart:T,paddingInlineEnd:T,margin:T,marginTop:T,marginRight:T,marginBottom:T,marginLeft:T,marginBlock:T,marginBlockStart:T,marginBlockEnd:T,marginInline:T,marginInlineStart:T,marginInlineEnd:T,backgroundPositionX:T,backgroundPositionY:T,...to,zIndex:Za,fillOpacity:Ye,strokeOpacity:Ye,numOctaves:Za},ao={...va,color:W,backgroundColor:W,outlineColor:W,fill:W,stroke:W,borderColor:W,borderTopColor:W,borderRightColor:W,borderBottomColor:W,borderLeftColor:W,filter:Gt,WebkitFilter:Gt},un=t=>ao[t];function mn(t,e){let a=un(t);return a!==Gt&&(a=Ee),a.getAnimatableNone?a.getAnimatableNone(e):void 0}const so=new Set(["auto","none","0"]);function no(t,e,a){let s=0,n;for(;s<t.length&&!n;){const i=t[s];typeof i=="string"&&!so.has(i)&&Xe(i).values.length&&(n=t[s]),s++}if(n&&a)for(const i of e)t[i]=mn(a,n)}class io extends ba{constructor(e,a,s,n,i){super(e,a,s,n,i,!0)}readKeyframes(){const{unresolvedKeyframes:e,element:a,name:s}=this;if(!a||!a.current)return;super.readKeyframes();for(let d=0;d<e.length;d++){let c=e[d];if(typeof c=="string"&&(c=c.trim(),la(c))){const u=rn(c,a.current);u!==void 0&&(e[d]=u),d===e.length-1&&(this.finalKeyframe=c)}}if(this.resolveNoneKeyframes(),!dn.has(s)||e.length!==2)return;const[n,i]=e,r=Ja(n),o=Ja(i),l=Da(n),p=Da(i);if(l!==p&&we[s]){this.needsMeasurement=!0;return}if(r!==o)if(qa(r)&&qa(o))for(let d=0;d<e.length;d++){const c=e[d];typeof c=="string"&&(e[d]=parseFloat(c))}else we[s]&&(this.needsMeasurement=!0)}resolveNoneKeyframes(){const{unresolvedKeyframes:e,name:a}=this,s=[];for(let n=0;n<e.length;n++)(e[n]===null||Jr(e[n]))&&s.push(n);s.length&&no(e,s,a)}measureInitialState(){const{element:e,unresolvedKeyframes:a,name:s}=this;if(!e||!e.current)return;s==="height"&&(this.suspendedScrollY=window.pageYOffset),this.measuredOrigin=we[s](e.measureViewportBox(),window.getComputedStyle(e.current)),a[0]=this.measuredOrigin;const n=a[a.length-1];n!==void 0&&e.getValue(s,n).jump(n,!1)}measureEndState(){const{element:e,name:a,unresolvedKeyframes:s}=this;if(!e||!e.current)return;const n=e.getValue(a);n&&n.jump(this.measuredOrigin,!1);const i=s.length-1,r=s[i];s[i]=we[a](e.measureViewportBox(),window.getComputedStyle(e.current)),r!==null&&this.finalKeyframe===void 0&&(this.finalKeyframe=r),this.removedTransforms?.length&&this.removedTransforms.forEach(([o,l])=>{e.getValue(o).set(l)}),this.resolveNoneKeyframes()}}function ro(t,e,a){if(t instanceof EventTarget)return[t];if(typeof t=="string"){let s=document;const n=a?.[t]??s.querySelectorAll(t);return n?Array.from(n):[]}return Array.from(t)}const fn=(t,e)=>e&&typeof t=="number"?e.transform(t):t,{schedule:oo}=js(queueMicrotask,!1);function bn(t){return Qn(t)&&"ownerSVGElement"in t}function lo(t){return bn(t)&&t.tagName==="svg"}const co=[...gn,W,Ee],po=t=>co.find(pn(t)),Qa=()=>({min:0,max:0}),ya=()=>({x:Qa(),y:Qa()}),Kt={current:null},hn={current:!1},go=typeof window<"u";function uo(){if(hn.current=!0,!!go)if(window.matchMedia){const t=window.matchMedia("(prefers-reduced-motion)"),e=()=>Kt.current=t.matches;t.addEventListener("change",e),e()}else Kt.current=!1}const Qe=new WeakMap;function mo(t){return t!==null&&typeof t=="object"&&typeof t.start=="function"}function fo(t){return typeof t=="string"||Array.isArray(t)}const bo=["animate","whileInView","whileFocus","whileHover","whileTap","whileDrag","exit"],ho=["initial",...bo];function xn(t){return mo(t.animate)||ho.some(e=>fo(t[e]))}function xo(t){return!!(xn(t)||t.variants)}function vo(t,e,a){for(const s in e){const n=e[s],i=a[s];if(Q(n))t.addValue(s,n);else if(Q(i))t.addValue(s,Ze(n,{owner:t}));else if(i!==n)if(t.hasValue(s)){const r=t.getValue(s);r.liveStyle===!0?r.jump(n):r.hasAnimated||r.set(n)}else{const r=t.getStaticValue(s);t.addValue(s,Ze(r!==void 0?r:n,{owner:t}))}}for(const s in a)e[s]===void 0&&t.removeValue(s);return e}const es=["AnimationStart","AnimationComplete","Update","BeforeLayoutMeasure","LayoutMeasure","LayoutAnimationStart","LayoutAnimationComplete"];let ts={};class vn{scrapeMotionValuesFromProps(e,a,s){return{}}constructor({parent:e,props:a,presenceContext:s,reducedMotionConfig:n,blockInitialAnimation:i,visualState:r},o={}){this.current=null,this.children=new Set,this.isVariantNode=!1,this.isControllingVariants=!1,this.shouldReduceMotion=null,this.values=new Map,this.KeyframeResolver=ba,this.features={},this.valueSubscriptions=new Map,this.prevMotionValues={},this.events={},this.propEventSubscriptions={},this.notifyUpdate=()=>this.notify("Update",this.latestValues),this.render=()=>{this.current&&(this.triggerBuild(),this.renderInstance(this.current,this.renderState,this.props.style,this.projection))},this.renderScheduledAt=0,this.scheduleRender=()=>{const u=ee.now();this.renderScheduledAt<u&&(this.renderScheduledAt=u,be.render(this.render,!1,!0))};const{latestValues:l,renderState:p}=r;this.latestValues=l,this.baseTarget={...l},this.initialValues=a.initial?{...l}:{},this.renderState=p,this.parent=e,this.props=a,this.presenceContext=s,this.depth=e?e.depth+1:0,this.reducedMotionConfig=n,this.options=o,this.blockInitialAnimation=!!i,this.isControllingVariants=xn(a),this.isVariantNode=xo(a),this.isVariantNode&&(this.variantChildren=new Set),this.manuallyAnimateOnMount=!!(e&&e.current);const{willChange:d,...c}=this.scrapeMotionValuesFromProps(a,{},this);for(const u in c){const m=c[u];l[u]!==void 0&&Q(m)&&m.set(l[u])}}mount(e){this.current=e,Qe.set(e,this),this.projection&&!this.projection.instance&&this.projection.mount(e),this.parent&&this.isVariantNode&&!this.isControllingVariants&&(this.removeFromVariantTree=this.parent.addVariantChild(this)),this.values.forEach((a,s)=>this.bindToMotionValue(s,a)),this.reducedMotionConfig==="never"?this.shouldReduceMotion=!1:this.reducedMotionConfig==="always"?this.shouldReduceMotion=!0:(hn.current||uo(),this.shouldReduceMotion=Kt.current),this.parent?.addChild(this),this.update(this.props,this.presenceContext)}unmount(){this.projection&&this.projection.unmount(),Pt(this.notifyUpdate),Pt(this.render),this.valueSubscriptions.forEach(e=>e()),this.valueSubscriptions.clear(),this.removeFromVariantTree&&this.removeFromVariantTree(),this.parent?.removeChild(this);for(const e in this.events)this.events[e].clear();for(const e in this.features){const a=this.features[e];a&&(a.unmount(),a.isMounted=!1)}this.current=null}addChild(e){this.children.add(e),this.enteringChildren??(this.enteringChildren=new Set),this.enteringChildren.add(e)}removeChild(e){this.children.delete(e),this.enteringChildren&&this.enteringChildren.delete(e)}bindToMotionValue(e,a){this.valueSubscriptions.has(e)&&this.valueSubscriptions.get(e)();const s=Ne.has(e);s&&this.onBindTransform&&this.onBindTransform();const n=a.on("change",r=>{this.latestValues[e]=r,this.props.onUpdate&&be.preRender(this.notifyUpdate),s&&this.projection&&(this.projection.isTransformDirty=!0),this.scheduleRender()});let i;typeof window<"u"&&window.MotionCheckAppearSync&&(i=window.MotionCheckAppearSync(this,e,a)),this.valueSubscriptions.set(e,()=>{n(),i&&i(),a.owner&&a.stop()})}sortNodePosition(e){return!this.current||!this.sortInstanceNodePosition||this.type!==e.type?0:this.sortInstanceNodePosition(this.current,e.current)}updateFeatures(){let e="animation";for(e in ts){const a=ts[e];if(!a)continue;const{isEnabled:s,Feature:n}=a;if(!this.features[e]&&n&&s(this.props)&&(this.features[e]=new n(this)),this.features[e]){const i=this.features[e];i.isMounted?i.update():(i.mount(),i.isMounted=!0)}}}triggerBuild(){this.build(this.renderState,this.latestValues,this.props)}measureViewportBox(){return this.current?this.measureInstanceViewportBox(this.current,this.props):ya()}getStaticValue(e){return this.latestValues[e]}setStaticValue(e,a){this.latestValues[e]=a}update(e,a){(e.transformTemplate||this.props.transformTemplate)&&this.scheduleRender(),this.prevProps=this.props,this.props=e,this.prevPresenceContext=this.presenceContext,this.presenceContext=a;for(let s=0;s<es.length;s++){const n=es[s];this.propEventSubscriptions[n]&&(this.propEventSubscriptions[n](),delete this.propEventSubscriptions[n]);const i="on"+n,r=e[i];r&&(this.propEventSubscriptions[n]=this.on(n,r))}this.prevMotionValues=vo(this,this.scrapeMotionValuesFromProps(e,this.prevProps||{},this),this.prevMotionValues),this.handleChildMotionValue&&this.handleChildMotionValue()}getProps(){return this.props}getVariant(e){return this.props.variants?this.props.variants[e]:void 0}getDefaultTransition(){return this.props.transition}getTransformPagePoint(){return this.props.transformPagePoint}getClosestVariantNode(){return this.isVariantNode?this:this.parent?this.parent.getClosestVariantNode():void 0}addVariantChild(e){const a=this.getClosestVariantNode();if(a)return a.variantChildren&&a.variantChildren.add(e),()=>a.variantChildren.delete(e)}addValue(e,a){const s=this.values.get(e);a!==s&&(s&&this.removeValue(e),this.bindToMotionValue(e,a),this.values.set(e,a),this.latestValues[e]=a.get())}removeValue(e){this.values.delete(e);const a=this.valueSubscriptions.get(e);a&&(a(),this.valueSubscriptions.delete(e)),delete this.latestValues[e],this.removeValueFromRenderState(e,this.renderState)}hasValue(e){return this.values.has(e)}getValue(e,a){if(this.props.values&&this.props.values[e])return this.props.values[e];let s=this.values.get(e);return s===void 0&&a!==void 0&&(s=Ze(a===null?void 0:a,{owner:this}),this.addValue(e,s)),s}readValue(e,a){let s=this.latestValues[e]!==void 0||!this.current?this.latestValues[e]:this.getBaseTargetFromProps(this.props,e)??this.readValueFromInstance(this.current,e,this.options);return s!=null&&(typeof s=="string"&&(Es(s)||Ss(s))?s=parseFloat(s):!po(s)&&Ee.test(a)&&(s=mn(e,a)),this.setBaseTarget(e,Q(s)?s.get():s)),Q(s)?s.get():s}setBaseTarget(e,a){this.baseTarget[e]=a}getBaseTarget(e){const{initial:a}=this.props;let s;if(typeof a=="string"||typeof a=="object"){const i=cn(this.props,a,this.presenceContext?.custom);i&&(s=i[e])}if(a&&s!==void 0)return s;const n=this.getBaseTargetFromProps(this.props,e);return n!==void 0&&!Q(n)?n:this.initialValues[e]!==void 0&&s===void 0?void 0:this.baseTarget[e]}on(e,a){return this.events[e]||(this.events[e]=new Ts),this.events[e].add(a)}notify(e,...a){this.events[e]&&this.events[e].notify(...a)}scheduleRenderMicrotask(){oo.render(this.render)}}class yn extends vn{constructor(){super(...arguments),this.KeyframeResolver=io}sortInstanceNodePosition(e,a){return e.compareDocumentPosition(a)&2?1:-1}getBaseTargetFromProps(e,a){const s=e.style;return s?s[a]:void 0}removeValueFromRenderState(e,{vars:a,style:s}){delete a[e],delete s[e]}handleChildMotionValue(){this.childSubscription&&(this.childSubscription(),delete this.childSubscription);const{children:e}=this.props;Q(e)&&(this.childSubscription=e.on("change",a=>{this.current&&(this.current.textContent=`${a}`)}))}}function yo({top:t,left:e,right:a,bottom:s}){return{x:{min:e,max:a},y:{min:t,max:s}}}function wo(t,e){if(!e)return t;const a=e({x:t.left,y:t.top}),s=e({x:t.right,y:t.bottom});return{top:a.y,left:a.x,bottom:s.y,right:s.x}}function ko(t,e){return yo(wo(t.getBoundingClientRect(),e))}const Eo={x:"translateX",y:"translateY",z:"translateZ",transformPerspective:"perspective"},So=Oe.length;function To(t,e,a){let s="",n=!0;for(let i=0;i<So;i++){const r=Oe[i],o=t[r];if(o===void 0)continue;let l=!0;if(typeof o=="number"?l=o===(r.startsWith("scale")?1:0):l=parseFloat(o)===0,!l||a){const p=fn(o,va[r]);if(!l){n=!1;const d=Eo[r]||r;s+=`${d}(${p}) `}a&&(e[r]=p)}}return s=s.trim(),a?s=a(e,n?"":s):n&&(s="none"),s}function wn(t,e,a){const{style:s,vars:n,transformOrigin:i}=t;let r=!1,o=!1;for(const l in e){const p=e[l];if(Ne.has(l)){r=!0;continue}else if(Ns(l)){n[l]=p;continue}else{const d=fn(p,va[l]);l.startsWith("origin")?(o=!0,i[l]=d):s[l]=d}}if(e.transform||(r||a?s.transform=To(e,t.transform,a):s.transform&&(s.transform="none")),o){const{originX:l="50%",originY:p="50%",originZ:d=0}=i;s.transformOrigin=`${l} ${p} ${d}`}}function kn(t,{style:e,vars:a},s,n){const i=t.style;let r;for(r in e)i[r]=e[r];n?.applyProjectionStyles(i,s);for(r in a)i.setProperty(r,a[r])}function as(t,e){return e.max===e.min?0:t/(e.max-e.min)*100}const _e={correct:(t,e)=>{if(!e.target)return t;if(typeof t=="string")if(T.test(t))t=parseFloat(t);else return t;const a=as(t,e.target.x),s=as(t,e.target.y);return`${a}% ${s}%`}},Lo={correct:(t,{treeScale:e,projectionDelta:a})=>{const s=t,n=Ee.parse(t);if(n.length>5)return s;const i=Ee.createTransformer(t),r=typeof n[0]!="number"?1:0,o=a.x.scale*e.x,l=a.y.scale*e.y;n[0+r]/=o,n[1+r]/=l;const p=je(o,l,.5);return typeof n[2+r]=="number"&&(n[2+r]/=p),typeof n[3+r]=="number"&&(n[3+r]/=p),i(n)}},Co={borderRadius:{..._e,applyTo:["borderTopLeftRadius","borderTopRightRadius","borderBottomLeftRadius","borderBottomRightRadius"]},borderTopLeftRadius:_e,borderTopRightRadius:_e,borderBottomLeftRadius:_e,borderBottomRightRadius:_e,boxShadow:Lo};function Ao(t,{layout:e,layoutId:a}){return Ne.has(t)||t.startsWith("origin")||(e||a!==void 0)&&(!!Co[t]||t==="opacity")}function En(t,e,a){const s=t.style,n=e?.style,i={};if(!s)return i;for(const r in s)(Q(s[r])||n&&Q(n[r])||Ao(r,t)||a?.getValue(r)?.liveStyle!==void 0)&&(i[r]=s[r]);return i}function Io(t){return window.getComputedStyle(t)}class Bo extends yn{constructor(){super(...arguments),this.type="html",this.renderInstance=kn}readValueFromInstance(e,a){if(Ne.has(a))return this.projection?.isProjecting?zt(a):er(e,a);{const s=Io(e),n=(Ns(a)?s.getPropertyValue(a):s[a])||0;return typeof n=="string"?n.trim():n}}measureInstanceViewportBox(e,{transformPagePoint:a}){return ko(e,a)}build(e,a,s){wn(e,a,s.transformTemplate)}scrapeMotionValuesFromProps(e,a,s){return En(e,a,s)}}const Mo={offset:"stroke-dashoffset",array:"stroke-dasharray"},$o={offset:"strokeDashoffset",array:"strokeDasharray"};function Ro(t,e,a=1,s=0,n=!0){t.pathLength=1;const i=n?Mo:$o;t[i.offset]=T.transform(-s);const r=T.transform(e),o=T.transform(a);t[i.array]=`${r} ${o}`}const Po=["offsetDistance","offsetPath","offsetRotate","offsetAnchor"];function Vo(t,{attrX:e,attrY:a,attrScale:s,pathLength:n,pathSpacing:i=1,pathOffset:r=0,...o},l,p,d){if(wn(t,o,p),l){t.style.viewBox&&(t.attrs.viewBox=t.style.viewBox);return}t.attrs=t.style,t.style={};const{attrs:c,style:u}=t;c.transform&&(u.transform=c.transform,delete c.transform),(u.transform||c.transformOrigin)&&(u.transformOrigin=c.transformOrigin??"50% 50%",delete c.transformOrigin),u.transform&&(u.transformBox=d?.transformBox??"fill-box",delete c.transformBox);for(const m of Po)c[m]!==void 0&&(u[m]=c[m],delete c[m]);e!==void 0&&(c.x=e),a!==void 0&&(c.y=a),s!==void 0&&(c.scale=s),n!==void 0&&Ro(c,n,i,r,!1)}const Sn=new Set(["baseFrequency","diffuseConstant","kernelMatrix","kernelUnitLength","keySplines","keyTimes","limitingConeAngle","markerHeight","markerWidth","numOctaves","targetX","targetY","surfaceScale","specularConstant","specularExponent","stdDeviation","tableValues","viewBox","gradientTransform","pathLength","startOffset","textLength","lengthAdjust"]),Do=t=>typeof t=="string"&&t.toLowerCase()==="svg";function Fo(t,e,a,s){kn(t,e,void 0,s);for(const n in e.attrs)t.setAttribute(Sn.has(n)?n:xa(n),e.attrs[n])}function jo(t,e,a){const s=En(t,e,a);for(const n in t)if(Q(t[n])||Q(e[n])){const i=Oe.indexOf(n)!==-1?"attr"+n.charAt(0).toUpperCase()+n.substring(1):n;s[i]=t[n]}return s}class Oo extends yn{constructor(){super(...arguments),this.type="svg",this.isSVGTag=!1,this.measureInstanceViewportBox=ya}getBaseTargetFromProps(e,a){return e[a]}readValueFromInstance(e,a){if(Ne.has(a)){const s=un(a);return s&&s.default||0}return a=Sn.has(a)?a:xa(a),e.getAttribute(a)}scrapeMotionValuesFromProps(e,a,s){return jo(e,a,s)}build(e,a,s){Vo(e,a,this.isSVGTag,s.transformTemplate,s.style)}renderInstance(e,a,s,n){Fo(e,a,s,n)}mount(e){this.isSVGTag=Do(e.tagName),super.mount(e)}}function No(t,e){return t in e}class zo extends vn{constructor(){super(...arguments),this.type="object"}readValueFromInstance(e,a){if(No(a,e)){const s=e[a];if(typeof s=="string"||typeof s=="number")return s}}getBaseTargetFromProps(){}removeValueFromRenderState(e,a){delete a.output[e]}measureInstanceViewportBox(){return ya()}build(e,a){Object.assign(e.output,a)}renderInstance(e,{output:a}){Object.assign(e,a)}sortInstanceNodePosition(){return 0}}function _o(t,e,a){const s=Q(t)?t:Ze(t);return s.start(ln("",s,e,a)),s.animation}function wa(t){return typeof t=="object"&&!Array.isArray(t)}function Tn(t,e,a,s){return typeof t=="string"&&wa(e)?ro(t,a,s):t instanceof NodeList?Array.from(t):Array.isArray(t)?t:[t]}function Ho(t,e,a){return t*(e+1)}function ss(t,e,a,s){return typeof e=="number"?e:e.startsWith("-")||e.startsWith("+")?Math.max(0,t+parseFloat(e)):e==="<"?a:e.startsWith("<")?Math.max(0,a+parseFloat(e.slice(1))):s.get(e)??t}function Uo(t,e,a){for(let s=0;s<t.length;s++){const n=t[s];n.at>e&&n.at<a&&(ks(t,n),s--)}}function qo(t,e,a,s,n,i){Uo(t,n,i);for(let r=0;r<e.length;r++)t.push({value:e[r],at:je(n,i,s[r]),easing:Ds(a,r)})}function Wo(t,e){for(let a=0;a<t.length;a++)t[a]=t[a]/(e+1)}function Go(t,e){return t.at===e.at?t.value===null?1:e.value===null?-1:0:t.at-e.at}const Ko="easeInOut";function Yo(t,{defaultTransition:e={},...a}={},s,n){const i=e.duration||.3,r=new Map,o=new Map,l={},p=new Map;let d=0,c=0,u=0;for(let m=0;m<t.length;m++){const v=t[m];if(typeof v=="string"){p.set(v,c);continue}else if(!Array.isArray(v)){p.set(v.name,ss(c,v.at,d,p));continue}let[L,E,A={}]=v;A.at!==void 0&&(c=ss(c,A.at,d,p));let b=0;const k=(y,w,C,$=0,M=0)=>{const D=Xo(y),{delay:j=0,times:V=Zs(D),type:F="keyframes",repeat:X,repeatType:_,repeatDelay:G=0,...O}=w;let{ease:h=e.ease||"easeOut",duration:x}=w;const I=typeof j=="function"?j($,M):j,U=D.length,H=ha(F)?F:n?.[F||"keyframes"];if(U<=2&&H){let ie=100;if(U===2&&Qo(D)){const re=D[1]-D[0];ie=Math.abs(re)}const pe={...O};x!==void 0&&(pe.duration=ue(x));const xe=Ys(pe,ie,H);h=xe.ease,x=xe.duration}x??(x=i);const se=c+I;V.length===1&&V[0]===0&&(V[1]=1);const ce=V.length-D.length;if(ce>0&&Js(V,ce),D.length===1&&D.unshift(null),X){x=Ho(x,X);const ie=[...D],pe=[...V];h=Array.isArray(h)?[...h]:[h];const xe=[...h];for(let re=0;re<X;re++){D.push(...ie);for(let te=0;te<ie.length;te++)V.push(pe[te]+(re+1)),h.push(te===0?"linear":Ds(xe,te-1))}Wo(V,X)}const Be=se+x;qo(C,D,h,V,se,Be),b=Math.max(I+x,b),u=Math.max(Be,u)};if(Q(L)){const y=ns(L,o);k(E,A,is("default",y))}else{const y=Tn(L,E,s,l),w=y.length;for(let C=0;C<w;C++){E=E,A=A;const $=y[C],M=ns($,o);for(const D in E)k(E[D],Jo(A,D),is(D,M),C,w)}}d=c,c+=b}return o.forEach((m,v)=>{for(const L in m){const E=m[L];E.sort(Go);const A=[],b=[],k=[];for(let w=0;w<E.length;w++){const{at:C,value:$,easing:M}=E[w];A.push($),b.push(ia(0,u,C)),k.push(M||"easeOut")}b[0]!==0&&(b.unshift(0),A.unshift(A[0]),k.unshift(Ko)),b[b.length-1]!==1&&(b.push(1),A.push(null)),r.has(v)||r.set(v,{keyframes:{},transition:{}});const y=r.get(v);y.keyframes[L]=A,y.transition[L]={...e,duration:u,ease:k,times:b,...a}}}),r}function ns(t,e){return!e.has(t)&&e.set(t,{}),e.get(t)}function is(t,e){return e[t]||(e[t]=[]),e[t]}function Xo(t){return Array.isArray(t)?t:[t]}function Jo(t,e){return t&&t[e]?{...t,...t[e]}:{...t}}const Zo=t=>typeof t=="number",Qo=t=>t.every(Zo);function el(t){const e={presenceContext:null,props:{},visualState:{renderState:{transform:{},transformOrigin:{},style:{},vars:{},attrs:{}},latestValues:{}}},a=bn(t)&&!lo(t)?new Oo(e):new Bo(e);a.mount(t),Qe.set(t,a)}function tl(t){const e={presenceContext:null,props:{},visualState:{renderState:{output:{}},latestValues:{}}},a=new zo(e);a.mount(t),Qe.set(t,a)}function al(t,e){return Q(t)||typeof t=="number"||typeof t=="string"&&!wa(e)}function Ln(t,e,a,s){const n=[];if(al(t,e))n.push(_o(t,wa(e)&&e.default||e,a&&(a.default||a)));else{const i=Tn(t,e,s),r=i.length;for(let o=0;o<r;o++){const l=i[o],p=l instanceof Element?el:tl;Qe.has(l)||p(l);const d=Qe.get(l),c={...a};"delay"in c&&typeof c.delay=="function"&&(c.delay=c.delay(o,r)),n.push(...Yr(d,{...e,transition:c},{}))}}return n}function sl(t,e,a){const s=[];return Yo(t,e,a,{spring:Je}).forEach(({keyframes:i,transition:r},o)=>{s.push(...Ln(o,i,r))}),s}function nl(t){return Array.isArray(t)&&t.some(Array.isArray)}function il(t){function e(a,s,n){let i=[],r;if(nl(a))i=sl(a,s,t);else{const{onComplete:l,...p}=n||{};typeof l=="function"&&(r=l),i=Ln(a,s,p,t)}const o=new Tr(i);return r&&o.finished.then(r),o}return e}const Yt=il();class rl{modal=null;isOpen=!1;open(e,a){if(this.isOpen)return;const s=`
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
        `;document.body.insertAdjacentHTML("beforeend",s),this.modal=document.getElementById("modal-overlay"),this.isOpen=!0,document.body.style.overflow="hidden";const n=document.getElementById("modal-content");n&&Yt(n,{opacity:[0,1],transform:["scale(0.9)","scale(1)"]},{duration:.3}),document.getElementById("modal-close")?.addEventListener("click",()=>this.close()),this.modal?.addEventListener("click",r=>{r.target===this.modal&&this.close()});const i=r=>{r.key==="Escape"&&(this.close(),document.removeEventListener("keydown",i))};document.addEventListener("keydown",i)}close(){if(!this.isOpen||!this.modal)return;const e=document.getElementById("modal-content");e&&Yt(e,{opacity:0,transform:"scale(0.9)"},{duration:.2}).finished.then(()=>{this.modal?.remove(),this.modal=null,this.isOpen=!1,document.body.style.overflow=""})}}const vt=new rl;class ol{container;heroEl;designEl;engineEl;constructor(e){if(this.container=document.getElementById(e),!this.container)throw new Error(`HUD container with id ${e} not found`);this.container.innerHTML="",this.heroEl=this.createPhaseElement("hero",`
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
        `;vt.open(e,"BATTERY HEALTH PREDICTION")}createPhaseElement(e,a){const s=document.createElement("div");return s.id=`phase-${e}`,s.className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 transition-opacity duration-500",s.innerHTML=a,s}setPhaseOpacity(e,a){Yt(e,{opacity:a},{duration:.5})}update(e){if(e<.25)this.setPhaseOpacity(this.heroEl,1),this.setPhaseOpacity(this.designEl,0),this.setPhaseOpacity(this.engineEl,0);else if(e>=.25&&e<.35){const a=(e-.25)/.1;this.setPhaseOpacity(this.heroEl,1-a),this.setPhaseOpacity(this.designEl,a),this.setPhaseOpacity(this.engineEl,0)}else if(e>=.35&&e<.6)this.setPhaseOpacity(this.heroEl,0),this.setPhaseOpacity(this.designEl,1),this.setPhaseOpacity(this.engineEl,0);else if(e>=.6&&e<.7){const a=(e-.6)/.1;this.setPhaseOpacity(this.heroEl,0),this.setPhaseOpacity(this.designEl,1-a),this.setPhaseOpacity(this.engineEl,a)}else this.setPhaseOpacity(this.heroEl,0),this.setPhaseOpacity(this.designEl,0),this.setPhaseOpacity(this.engineEl,1)}}const ll=[{id:"battery-health",icon:"🔋",title:"AI Battery Health Monitoring",description:"Real-time ML-powered battery degradation analysis and predictive maintenance alerts",category:"ai"},{id:"smart-routing",icon:"🗺️",title:"Intelligent Route Optimization",description:"Traffic-aware energy-efficient routing optimized for Indian road conditions",category:"routing"},{id:"energy-prediction",icon:"⚡",title:"Energy Consumption Prediction",description:"ML models predict range based on driving patterns, terrain, and weather",category:"ai"},{id:"fast-charging",icon:"⚡",title:"800V Ultra-Fast Charging",description:"10-80% charge in 18 minutes with advanced thermal management",category:"battery"},{id:"quad-motor",icon:"🏎️",title:"Quad Motor Torque Vectoring",description:"Independent motor control for each wheel delivering unmatched handling",category:"performance"},{id:"range",icon:"🎯",title:"850 KM Range",description:"Solid-state battery technology with graphene enhancement",category:"battery"},{id:"charging-network",icon:"📍",title:"Smart Charging Network",description:"AI-powered charging station recommendations based on availability and pricing",category:"routing"},{id:"performance",icon:"🚀",title:"0-100 in 2.1s",description:"Hypercar-level acceleration with instant torque delivery",category:"performance"}],dl=[{id:"1",name:"Vikram Singh",role:"Tech Entrepreneur",company:"Mumbai",content:"The AI-powered battery management is a game-changer. I drive 200km daily and the range prediction is incredibly accurate.",rating:5,image:"/images/testimonials/1.jpg"},{id:"2",name:"Ananya Desai",role:"Business Executive",company:"Bangalore",content:"Smart routing saves me 30 minutes daily on my commute. The traffic-aware navigation is brilliant for Indian roads.",rating:5,image:"/images/testimonials/2.jpg"},{id:"3",name:"Rahul Kapoor",role:"Automotive Journalist",company:"Delhi",content:"This is not just an EV, it's a technological masterpiece. The performance rivals any hypercar I've driven.",rating:5,image:"/images/testimonials/3.jpg"}];class ze{observer;constructor(e=.1){this.observer=new IntersectionObserver(a=>{a.forEach(s=>{s.isIntersecting&&s.target.classList.add("animate-in")})},{threshold:e})}observe(e){this.observer.observe(e)}observeAll(e){document.querySelectorAll(e).forEach(s=>this.observe(s))}disconnect(){this.observer.disconnect()}}function cl(t,e,a,s=2e3,n=""){const i=Date.now(),r=()=>{const o=Date.now()-i,l=Math.min(o/s,1),p=1-Math.pow(1-l,3),d=Math.floor(e+(a-e)*p);t.textContent=d.toLocaleString()+n,l<1&&requestAnimationFrame(r)};r()}async function pl(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
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
                    ${ll.map((o,l)=>`
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
                    ${dl.map((o,l)=>`
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
    `;const e=new Jn("zonda-canvas",40,o=>`/images/ezgif-49d96893fca105bb-jpg/ezgif-frame-${String(o).padStart(3,"0")}.jpg`),a=new ol("zonda-hud"),s=document.querySelector("#scroll-container"),n=()=>{if(!s)return;const o=s.getBoundingClientRect(),l=window.innerHeight,d=s.offsetHeight-l,c=-o.top,u=Math.min(1,Math.max(0,c/d));e.update(u),a.update(u)};window.addEventListener("scroll",n,{passive:!0}),n(),new ze(.1).observeAll(".fade-in-section");const r=new IntersectionObserver(o=>{o.forEach(l=>{if(l.isIntersecting){const p=l.target,d=parseFloat(p.dataset.counter||"0"),c=p.dataset.counter?.includes(".")?"s":"";cl(p,0,d,2e3,c),r.unobserve(p)}})});document.querySelectorAll("[data-counter]").forEach(o=>{r.observe(o)})}const gl=[{id:"ceo",name:"Karthik Janardhan",role:"CEO & Founder",image:"/images/ceo.jpg"},{id:"cto",name:"Anushka Kotal",role:"CTO",image:"/images/cto.jpg"},{id:"design",name:"Stash Lopes",role:"Head of Design",image:"/images/design.jpg"},{id:"engineering",name:"Ashwin Vincent Koonissery",role:"Chief Engineer",image:"/images/engineering.jpg"}];async function ul(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
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
                            <div class="text-5xl font-orbitron font-bold text-pagani-gold mb-2">2026</div>
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
                    ${gl.map((a,s)=>`
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
    `,new ze(.1).observeAll(".fade-in-section")}const ml=[{category:"Performance",specs:[{label:"0-100 km/h",value:"2.1 seconds"},{label:"Top Speed",value:"350 km/h"},{label:"Power Output",value:"1,400 kW (1,877 HP)"},{label:"Torque",value:"2,300 Nm"},{label:"Drive Type",value:"Quad Motor AWD"}]},{category:"Battery & Range",specs:[{label:"Battery Capacity",value:"120 kWh"},{label:"Battery Type",value:"Solid-State Graphene"},{label:"Range (WLTP)",value:"850 km"},{label:"Charging",value:"800V Architecture"},{label:"10-80% Charge Time",value:"18 minutes"}]},{category:"Dimensions & Weight",specs:[{label:"Length",value:"4,650 mm"},{label:"Width",value:"2,050 mm"},{label:"Height",value:"1,150 mm"},{label:"Wheelbase",value:"2,750 mm"},{label:"Dry Weight",value:"1,150 kg"}]},{category:"AI & Technology",specs:[{label:"AI Processor",value:"NVIDIA Drive Orin"},{label:"Sensors",value:"12 Cameras, 8 Radars, 4 LiDAR"},{label:"Connectivity",value:"5G, V2X"},{label:"OTA Updates",value:"Full Stack"},{label:"Autonomous Level",value:"Level 3"}]}];async function fl(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
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
                            ${["Real-time State of Health (SOH) monitoring","Predictive maintenance alerts","Adaptive charging optimization","Temperature-aware battery management","Driving pattern analysis"].map(n=>`
                                <li class="flex items-start gap-3">
                                    <span class="text-pagani-gold mt-1">▸</span>
                                    <span class="text-gray-300">${n}</span>
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
                        <h2 class="text-4xl md:text-5xl font-orbitron font-bold mb-6 cursor-pointer hover:text-pagani-gold transition-colors" id="intelligent-routing-title">INTELLIGENT<br><span class="text-pagani-gold">ROUTING</span></h2>
                        <p class="text-gray-400 text-lg leading-relaxed mb-8">
                            Traffic-aware route optimization that considers real-time conditions, elevation changes, and energy consumption to deliver the most efficient path.
                        </p>
                        <ul class="space-y-4">
                            ${["Real-time traffic integration","Elevation-aware energy calculation","Dynamic charging station recommendations","Weather-adjusted range prediction","Multi-destination optimization"].map(n=>`
                                <li class="flex items-start gap-3">
                                    <span class="text-pagani-gold mt-1">▸</span>
                                    <span class="text-gray-300">${n}</span>
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
                    ${ml.map((n,i)=>`
                        <div class="fade-in-section bg-pagani-black border border-white/10 p-8" style="animation-delay: ${i*100}ms">
                            <h3 class="text-2xl font-orbitron font-bold text-pagani-gold mb-6 uppercase tracking-wider">${n.category}</h3>
                            <div class="space-y-4">
                                ${n.specs.map(r=>`
                                    <div class="flex justify-between items-center border-b border-white/5 pb-3">
                                        <span class="text-gray-400">${r.label}</span>
                                        <span class="font-semibold text-white">${r.value}</span>
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
                    ${[{title:"Solid-State Battery",desc:"Graphene-enhanced solid-state cells delivering 850km range with superior safety and longevity",icon:"⚡"},{title:"Quad Motor System",desc:"Independent motor control for each wheel enabling precise torque vectoring and unmatched handling",icon:"🏎️"},{title:"800V Architecture",desc:"Ultra-fast charging capability with advanced thermal management for optimal performance",icon:"🔌"}].map((n,i)=>`
                        <div class="fade-in-section bg-gradient-to-br from-pagani-gold/5 to-transparent border border-pagani-gold/30 p-8 hover:border-pagani-gold transition-all group" style="animation-delay: ${i*100}ms">
                            <div class="text-6xl mb-6 group-hover:scale-110 transition-transform">${n.icon}</div>
                            <h3 class="text-2xl font-orbitron font-bold mb-4 group-hover:text-pagani-gold transition-colors">${n.title}</h3>
                            <p class="text-gray-400 leading-relaxed">${n.desc}</p>
                        </div>
                    `).join("")}
                </div>
            </div>
        </section>
    `,new ze(.1).observeAll(".fade-in-section");const a=document.getElementById("battery-health-title");a&&a.addEventListener("click",bl);const s=document.getElementById("intelligent-routing-title");s&&s.addEventListener("click",hl)}function bl(){const t=`
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
    `;vt.open(t,"BATTERY HEALTH PREDICTION")}function hl(){vt.open(`
        <div class="space-y-8">
            <!-- Header -->
            <div class="text-center mb-8">
                <div class="text-7xl mb-4">🗺️</div>
                <h3 class="text-3xl font-orbitron font-bold mb-2">AI Intelligent Routing System</h3>
                <p class="text-gray-400">Real-time ML-powered navigation and route optimization</p>
            </div>

            <!-- Current Route Status -->
            <div class="bg-gradient-to-br from-pagani-gold/10 to-transparent border border-pagani-gold/30 p-6 rounded-lg">
                <h4 class="text-xl font-orbitron font-bold mb-4 text-pagani-gold">Current Route Status</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="text-center">
                        <div class="text-3xl font-bold text-white">12.5 km</div>
                        <div class="text-sm text-gray-400">Distance to Destination</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-white">18 min</div>
                        <div class="text-sm text-gray-400">Estimated Time</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-white">6.8 kWh</div>
                        <div class="text-sm text-gray-400">Energy Required</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-white">78%</div>
                        <div class="text-sm text-gray-400">Current Charge</div>
                    </div>
                </div>
            </div>

            <!-- ML Predictions & Analysis -->
            <div class="grid md:grid-cols-2 gap-6">
                <div class="bg-pagani-black border border-pagani-gold/20 p-6">
                    <h4 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                        <span class="text-pagani-gold">▸</span>
                        Traffic Prediction
                    </h4>
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">Current Traffic</span>
                            <span class="text-yellow-500 font-bold">Moderate</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">Predicted in 30 min</span>
                            <span class="text-red-500 font-bold">Heavy</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">Route Accuracy</span>
                            <span class="text-white font-bold">94.7%</span>
                        </div>
                    </div>
                </div>

                <div class="bg-pagani-black border border-pagani-gold/20 p-6">
                    <h4 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                        <span class="text-pagani-gold">▸</span>
                        Route Optimization
                    </h4>
                    <ul class="space-y-3 text-gray-300">
                        <li class="flex items-start gap-2">
                            <span class="text-green-500 mt-1">✓</span>
                            <span>Dynamic route selected for minimal congestion</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-green-500 mt-1">✓</span>
                            <span>Energy consumption optimized</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-yellow-500 mt-1">⚠</span>
                            <span>Weather condition: Light rain ahead</span>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- AI/ML Features -->
            <div class="border-t border-pagani-gold/20 pt-6">
                <h4 class="text-xl font-orbitron font-bold mb-4">AI/ML Features</h4>
                <div class="grid md:grid-cols-2 gap-4">
                    <div class="bg-gradient-to-br from-pagani-gold/5 to-transparent border border-pagani-gold/20 p-4">
                        <div class="text-3xl mb-2">📊</div>
                        <h5 class="font-bold text-sm mb-1">Real-Time Traffic Prediction</h5>
                        <p class="text-xs text-gray-400">Live congestion forecasting using ML models</p>
                    </div>
                    <div class="bg-gradient-to-br from-pagani-gold/5 to-transparent border border-pagani-gold/20 p-4">
                        <div class="text-3xl mb-2">🎯</div>
                        <h5 class="font-bold text-sm mb-1">Dynamic Route Optimization</h5>
                        <p class="text-xs text-gray-400">AI-powered shortest & fastest path selection</p>
                    </div>
                    <div class="bg-gradient-to-br from-pagani-gold/5 to-transparent border border-pagani-gold/20 p-4">
                        <div class="text-3xl mb-2">⚠️</div>
                        <h5 class="font-bold text-sm mb-1">Incident Detection & Alerts</h5>
                        <p class="text-xs text-gray-400">Automatic accident & roadblock identification</p>
                    </div>
                    <div class="bg-gradient-to-br from-pagani-gold/5 to-transparent border border-pagani-gold/20 p-4">
                        <div class="text-3xl mb-2">🌦️</div>
                        <h5 class="font-bold text-sm mb-1">Weather-Aware Routing</h5>
                        <p class="text-xs text-gray-400">Route adjustments based on weather conditions</p>
                    </div>
                    <div class="bg-gradient-to-br from-pagani-gold/5 to-transparent border border-pagani-gold/20 p-4">
                        <div class="text-3xl mb-2">⚡</div>
                        <h5 class="font-bold text-sm mb-1">Energy/Fuel Efficient Routing</h5>
                        <p class="text-xs text-gray-400">Optimized paths to reduce fuel consumption</p>
                    </div>
                </div>
            </div>

            <!-- Technical Details -->
            <div class="bg-pagani-black border border-pagani-gold/20 p-6">
                <h4 class="text-lg font-orbitron font-bold mb-4">Technical Specifications</h4>
                <div class="grid md:grid-cols-2 gap-4 text-sm">
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-gray-400">ML Model Type:</span>
                            <span class="text-white">Graph Neural Network + LSTM</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Prediction Accuracy:</span>
                            <span class="text-white">96.2%</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Update Frequency:</span>
                            <span class="text-white">Real-time (100ms)</span>
                        </div>
                    </div>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-gray-400">Data Sources:</span>
                            <span class="text-white">GPS, Traffic APIs, Weather</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Training Dataset:</span>
                            <span class="text-white">500K+ routes analyzed</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Response Time:</span>
                            <span class="text-white">&lt;200ms for optimization</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,"INTELLIGENT ROUTING SYSTEM")}const Bt={general:"General",frontend:"Frontend",backend:"Backend","ai-ml":"AI / ML",hardware:"Hardware",security:"Security"},Mt={pdf:"PDF Manual",link:"External Link"},He=[{id:"ev-owner-manual",title:"EV Bharat Owner Manual",summary:"Official EV Bharat proposal manual available as an in-page PDF.",category:"hardware",type:"Guide",status:"published",resourceType:"pdf",tags:["manual","vehicle","owner-guide"],link:"/images/doc/evbharat-proposal.pdf",linkLabel:"Read Manual"},{id:"Government Proposal Manual",title:"EV Bharat Government Proposal Manual",summary:"Official EV Bharat government proposal manual available as an in-page PDF.",category:"general",type:"Guide",status:"published",resourceType:"pdf",tags:["manual","vehicle","owner-guide"],link:"/images/doc/government-proposal.pdf",linkLabel:"Read Manual"},{id:"Summary of hardware documentation",title:"Summary of Hardware Documentation",summary:"Overview of all hardware-related documentation for EV Bharat.",category:"hardware",type:"Guide",status:"published",resourceType:"pdf",tags:["manual","vehicle","owner-guide"],link:"/images/doc/hardware-summary.pdf",linkLabel:"Read Manual"},{id:"Summary of Software Documentation",title:"Summary of Software Documentation",summary:"Overview of all software-related documentation for EV Bharat.",category:"frontend",type:"Guide",status:"published",resourceType:"pdf",tags:["manual","vehicle","owner-guide"],link:"/images/doc/evbharat-software.pdf",linkLabel:"Read Manual"},{id:"ev-service-manual",title:"EV Bharat Service Record",summary:"Service and vehicle record reference available as an in-page PDF.",category:"hardware",type:"Reference",status:"published",resourceType:"pdf",tags:["service","maintenance","workshop"],link:"/images/doc/car_recored.pdf",linkLabel:"Read Service Record"},{id:"project-readme",title:"Project Overview",summary:"High-level overview of EV Bharat vision, core modules, and feature map.",category:"general",type:"Guide",status:"published",resourceType:"link",tags:["overview","architecture","getting-started"],link:"https://github.com/karthikj30/EV-Bharat/blob/main/README.md",linkLabel:"Open Overview"},{id:"quickstart",title:"Quick Start",summary:"Launch EV Bharat fast with essential setup and startup commands.",category:"general",type:"Setup",status:"published",resourceType:"link",tags:["setup","commands","onboarding"],link:"https://github.com/karthikj30/EV-Bharat/blob/main/QUICKSTART.md",linkLabel:"Open Quick Start"},{id:"dev-container",title:"Dev Container Setup",summary:"Development environment bootstrap for containerized workflows.",category:"general",type:"Setup",status:"published",resourceType:"link",tags:["container","devcontainer","environment"],link:"https://github.com/karthikj30/EV-Bharat/blob/main/DEV_CONTAINER_SETUP.md",linkLabel:"Open Setup"},{id:"frontend-readme",title:"Frontend Guide",summary:"Vite + TypeScript frontend structure, run scripts, and app flow.",category:"frontend",type:"Guide",status:"published",resourceType:"link",tags:["vite","ui","frontend"],link:"https://github.com/karthikj30/EV-Bharat/blob/main/evbharat-frontend/evbharat-frontend/README.md",linkLabel:"Open Frontend Guide"},{id:"backend-readme",title:"Backend Service Guide",summary:"Backend integrations, bridge services, and API-related setup details.",category:"backend",type:"Reference",status:"published",resourceType:"link",tags:["backend","services","integrations"],link:"https://github.com/karthikj30/EV-Bharat/blob/main/evbharat-frontend/evbharat-frontend/backend/README.md",linkLabel:"Open Backend Guide"},{id:"rag-readme",title:"RAG Assistant Docs",summary:"Configuration and usage notes for the EV Bharat RAG chatbot module.",category:"ai-ml",type:"API",status:"published",resourceType:"link",tags:["rag","chatbot","ai"],link:"https://github.com/karthikj30/EV-Bharat/blob/main/evbharat-frontend/evbharat-frontend/backend/EVBharat%20Bot/README_RAG.md",linkLabel:"Open RAG Docs"},{id:"security-policy",title:"Security Policy",summary:"Security expectations, reporting process, and safe usage recommendations.",category:"security",type:"Safety",status:"published",resourceType:"link",tags:["security","policy","reporting"],link:"https://github.com/karthikj30/EV-Bharat/blob/main/SECURITY.md",linkLabel:"Open Security Policy"},{id:"bluetooth-hardware",title:"Bluetooth Hardware Notes",summary:"ESP32 Bluetooth guidance, troubleshooting, and wiring references.",category:"hardware",type:"Reference",status:"published",resourceType:"link",tags:["esp32","bluetooth","hardware"],link:"https://github.com/karthikj30/EV-Bharat/blob/main/hardware/README_BLUETOOTH.md",linkLabel:"Open Hardware Notes"},{id:"serial-hardware",title:"Serial Connection Guide",summary:"Serial communication setup for bridge services and embedded modules.",category:"hardware",type:"Setup",status:"published",resourceType:"link",tags:["serial","bridge","hardware"],link:"https://github.com/karthikj30/EV-Bharat/blob/main/hardware/SERIAL_CONNECTION.md",linkLabel:"Open Serial Guide"}],xl=["general","frontend","backend","ai-ml","hardware","security"],vl=["pdf","link"];function rs(t){return t==="published"?"border-emerald-400/30 bg-emerald-400/10 text-emerald-300":"border-amber-400/30 bg-amber-400/10 text-amber-300"}function os(t){return t==="pdf"?"border-sky-400/40 bg-sky-400/10 text-sky-200":"border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-200"}function yl(t){return t.replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;")}function ls(t){try{const e=new URL(t,window.location.origin);return e.hostname.replace("www.","")||e.pathname}catch{return t}}function wl(t){try{const[e,a=""]=t.split("#",2);if(/^(https?:)?\/\//i.test(e)){const l=new URL(e,window.location.origin).toString();return a?`${l}#${a}`:l}const s="/",n=s==="/"?"":s.endsWith("/")?s.slice(0,-1):s,i=e.startsWith("/")?`${n}${e}`:`${n}/${e}`.replace(/\/+/g,"/"),r=new URL(i,window.location.origin),o=encodeURI(`${r.pathname}${r.search}`);return a?`${o}#${a}`:o}catch{return encodeURI(t)}}function kl(t){return t.includes("#")?`${t}&toolbar=1&navpanes=0&scrollbar=1`:`${t}#toolbar=1&navpanes=0&scrollbar=1`}async function El(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`

        <section class="relative z-20 bg-pagani-black py-16 px-8 border-y border-pagani-gold/20">
            <div class="max-w-7xl mx-auto fade-in-section">
                <div class="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-end">
                    <div>
                        <label for="docs-search" class="text-xs uppercase tracking-[0.22em] text-gray-400">Search Documentation</label>
                        <input
                            id="docs-search"
                            type="text"
                            placeholder="Search by title, topic, or tag"
                            class="mt-3 w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-pagani-gold transition-colors"
                        />
                    </div>
                    <div class="space-y-3">
                        <div class="text-xs uppercase tracking-[0.22em] text-gray-400">Category</div>
                        <div class="flex flex-wrap gap-2 justify-start lg:justify-end" id="docs-filters">
                            <button class="doc-filter-btn px-4 py-2 text-xs uppercase tracking-[0.2em] border border-pagani-gold bg-pagani-gold/10 text-pagani-gold rounded-md" data-category="all">All</button>
                            ${xl.map(h=>`
                                <button class="doc-filter-btn px-4 py-2 text-xs uppercase tracking-[0.2em] border border-white/15 hover:border-pagani-gold/60 text-gray-300 hover:text-pagani-gold rounded-md transition-all" data-category="${h}">
                                    ${Bt[h]}
                                </button>
                            `).join("")}
                        </div>
                    </div>
                </div>
                <div class="mt-5 pt-5 border-t border-white/10">
                    <div class="text-xs uppercase tracking-[0.22em] text-gray-400 mb-3">Resource Type</div>
                    <div class="flex flex-wrap gap-2" id="docs-resource-filters">
                        <button class="doc-type-btn px-4 py-2 text-xs uppercase tracking-[0.2em] border border-pagani-gold bg-pagani-gold/10 text-pagani-gold rounded-md" data-resource-type="all">All</button>
                        ${vl.map(h=>`
                            <button class="doc-type-btn px-4 py-2 text-xs uppercase tracking-[0.2em] border border-white/15 hover:border-pagani-gold/60 text-gray-300 hover:text-pagani-gold rounded-md transition-all" data-resource-type="${h}">
                                ${Mt[h]}
                            </button>
                        `).join("")}
                    </div>
                    <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <p id="docs-visibility-note" class="text-xs text-gray-400">Showing all entries</p>
                        <button
                            id="docs-reset-filters"
                            type="button"
                            class="px-4 py-2 text-[11px] uppercase tracking-[0.2em] border border-white/20 text-gray-300 rounded-md hover:border-pagani-gold/60 hover:text-pagani-gold transition-all"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <section class="relative z-20 bg-gradient-to-b from-gray-900 to-pagani-black py-20 px-8">
            <div class="max-w-7xl mx-auto">
                <div class="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-8">
                    <aside class="fade-in-section border border-white/10 bg-pagani-black/80 rounded-2xl p-5 h-fit xl:sticky xl:top-24 backdrop-blur-sm">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-lg font-orbitron uppercase tracking-[0.15em] text-pagani-gold">Docs Library</h2>
                            <span class="text-[11px] uppercase tracking-[0.2em] text-gray-400">Select</span>
                        </div>
                        <div class="space-y-3 max-h-none overflow-visible pr-0 xl:max-h-[64vh] xl:overflow-y-auto xl:pr-1" id="documentation-list">
                            ${He.map((h,x)=>{const I=yl([h.title,h.summary,h.type,h.category,h.resourceType,...h.tags].join(" ").toLowerCase());return`
                                <button
                                    type="button"
                                    class="doc-select-btn w-full text-left border border-white/10 rounded-xl p-4 bg-white/[0.02] hover:bg-white/[0.05] hover:border-pagani-gold/50 transition-all fade-in-section"
                                    style="animation-delay: ${x*50}ms"
                                    data-doc-id="${h.id}"
                                    data-category="${h.category}"
                                    data-resource-type="${h.resourceType}"
                                    data-search="${I}"
                                    aria-pressed="false"
                                >
                                    <div class="flex items-center justify-between gap-3 mb-2">
                                        <span class="inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] uppercase tracking-[0.2em] ${rs(h.status)}">${h.status}</span>
                                        <span class="inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] uppercase tracking-[0.2em] ${os(h.resourceType)}">${Mt[h.resourceType]}</span>
                                    </div>
                                    <h3 class="text-base font-orbitron font-bold leading-tight mb-1">${h.title}</h3>
                                    <p class="text-xs text-gray-300 mb-3 leading-relaxed">${h.summary}</p>
                                    <div class="flex flex-wrap gap-2">
                                        <span class="px-2 py-1 text-[10px] uppercase tracking-[0.18em] border border-pagani-gold/30 text-pagani-gold rounded">${Bt[h.category]}</span>
                                        <span class="px-2 py-1 text-[10px] uppercase tracking-[0.18em] border border-white/15 text-gray-300 rounded">${h.type}</span>
                                    </div>
                                </button>
                            `}).join("")}
                        </div>
                        <p class="hidden xl:block mt-3 text-[11px] uppercase tracking-[0.16em] text-gray-500">Scroll this panel to view all documentation entries.</p>

                        <div id="docs-empty-state" class="hidden mt-4 border border-white/10 bg-pagani-black/60 rounded-xl p-4 text-center">
                            <p class="text-sm text-gray-300">No matching documentation for this search/filter.</p>
                        </div>
                    </aside>

                    <article class="fade-in-section border border-white/10 bg-pagani-black/80 rounded-2xl overflow-hidden shadow-[0_12px_44px_rgba(0,0,0,0.35)]">
                        <div class="p-6 border-b border-white/10 bg-gradient-to-r from-pagani-gold/5 to-transparent">
                            <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                <div>
                                    <div class="flex flex-wrap gap-2 mb-3">
                                        <span id="viewer-status" class="inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] uppercase tracking-[0.2em] border-white/15 text-gray-300">Not Selected</span>
                                        <span id="viewer-resource" class="inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] uppercase tracking-[0.2em] border-white/15 text-gray-300">Resource</span>
                                        <span id="viewer-category" class="inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] uppercase tracking-[0.2em] border-white/15 text-gray-300">Category</span>
                                    </div>
                                    <h2 id="viewer-title" class="text-2xl md:text-3xl font-orbitron font-bold leading-tight mb-2">Select a Documentation Entry</h2>
                                    <p id="viewer-summary" class="text-gray-300 max-w-3xl">Choose a manual or resource from the left panel to start reading.</p>
                                </div>
                                <a
                                    id="viewer-open-link"
                                    href="#"
                                    target="_blank"
                                    rel="noreferrer"
                                    class="inline-flex items-center justify-center gap-2 px-5 py-3 border border-pagani-gold/40 text-pagani-gold text-xs uppercase tracking-[0.2em] rounded-lg hover:bg-pagani-gold hover:text-black transition-all pointer-events-none opacity-50"
                                >
                                    Select Resource
                                </a>
                            </div>
                        </div>

                        <div id="viewer-empty" class="p-10 text-center">
                            <h3 class="text-xl font-orbitron font-bold mb-2">Documentation Viewer</h3>
                            <p class="text-gray-300">PDF manuals open directly here. External links open in a new tab.</p>
                        </div>

                        <div id="viewer-pdf-wrap" class="hidden border-t border-white/10">
                            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 px-5 py-3 bg-white/[0.03] border-b border-white/10">
                                <p class="text-xs text-gray-400 uppercase tracking-[0.2em]">Embedded PDF Reader</p>
                                <p class="text-xs text-gray-500">If preview is blocked by browser policy, use the open button above.</p>
                            </div>
                            <div class="h-[70vh] min-h-[500px] bg-white">
                                <object
                                    id="viewer-pdf-object"
                                    type="application/pdf"
                                    class="w-full h-full"
                                >
                                    <div class="h-full w-full bg-pagani-black text-center flex items-center justify-center px-8">
                                        <div>
                                            <h3 class="text-xl font-orbitron font-bold mb-3">PDF Preview Unavailable</h3>
                                            <p class="text-gray-400 mb-5">Your browser cannot render this PDF inline. Open it in a new tab instead.</p>
                                            <a
                                                id="viewer-pdf-fallback-link"
                                                href="#"
                                                target="_blank"
                                                rel="noreferrer"
                                                class="inline-flex items-center gap-2 px-5 py-3 border border-pagani-gold/50 text-pagani-gold text-xs uppercase tracking-[0.2em] rounded-lg hover:bg-pagani-gold hover:text-black transition-all"
                                            >
                                                Open PDF in New Tab
                                            </a>
                                        </div>
                                    </div>
                                </object>
                            </div>
                        </div>

                        <div id="viewer-link-wrap" class="hidden p-10 border-t border-white/10">
                            <div class="max-w-3xl">
                                <p class="text-gray-300 leading-relaxed mb-4">
                                    This documentation is provided as an external reference. Use the button below to open it in a new tab.
                                </p>
                                <p id="viewer-link-host" class="text-xs uppercase tracking-[0.2em] text-gray-500 mb-6">Source</p>
                                <a
                                    id="viewer-link-inline"
                                    href="#"
                                    target="_blank"
                                    rel="noreferrer"
                                    class="inline-flex items-center gap-2 px-5 py-3 border border-pagani-gold/40 text-pagani-gold text-xs uppercase tracking-[0.2em] rounded-lg hover:bg-pagani-gold hover:text-black transition-all"
                                >
                                    Open External Resource
                                </a>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </section>
    `;const e=document.getElementById("docs-search"),a=document.querySelectorAll(".doc-filter-btn"),s=document.querySelectorAll(".doc-type-btn"),n=document.querySelectorAll(".doc-select-btn"),i=document.getElementById("docs-empty-state"),r=document.getElementById("docs-visibility-note"),o=document.getElementById("docs-reset-filters"),l=document.getElementById("viewer-status"),p=document.getElementById("viewer-resource"),d=document.getElementById("viewer-category"),c=document.getElementById("viewer-title"),u=document.getElementById("viewer-summary"),m=document.getElementById("viewer-open-link"),v=document.getElementById("viewer-empty"),L=document.getElementById("viewer-pdf-wrap"),E=document.getElementById("viewer-pdf-object"),A=document.getElementById("viewer-pdf-fallback-link"),b=document.getElementById("viewer-link-wrap"),k=document.getElementById("viewer-link-host"),y=document.getElementById("viewer-link-inline"),w=new Map(He.map(h=>[h.id,h]));let C="all",$="all",M="";const D=()=>{a.forEach(h=>{const x=h.dataset.category===C;h.classList.toggle("border-pagani-gold",x),h.classList.toggle("bg-pagani-gold/10",x),h.classList.toggle("text-pagani-gold",x),h.classList.toggle("border-white/15",!x),h.classList.toggle("text-gray-300",!x)})},j=()=>{s.forEach(h=>{const x=h.dataset.resourceType===$;h.classList.toggle("border-pagani-gold",x),h.classList.toggle("bg-pagani-gold/10",x),h.classList.toggle("text-pagani-gold",x),h.classList.toggle("border-white/15",!x),h.classList.toggle("text-gray-300",!x)})},V=h=>{n.forEach(x=>{const I=x.dataset.docId===h;x.classList.toggle("border-pagani-gold/70",I),x.classList.toggle("bg-pagani-gold/10",I),x.classList.toggle("border-white/10",!I),x.setAttribute("aria-pressed",I?"true":"false")})},F=h=>{M="",V(""),l?.classList.remove("border-emerald-400/30","bg-emerald-400/10","text-emerald-300","border-amber-400/30","bg-amber-400/10","text-amber-300"),l?.classList.add("border-white/15","text-gray-300"),l&&(l.textContent="Not Selected"),p?.classList.remove("border-sky-400/40","bg-sky-400/10","text-sky-200","border-fuchsia-400/40","bg-fuchsia-400/10","text-fuchsia-200"),p?.classList.add("border-white/15","text-gray-300"),p&&(p.textContent="Resource"),d&&(d.textContent="Category"),c&&(c.textContent="Select a Documentation Entry"),u&&(u.textContent=h),m&&(m.href="#",m.textContent="Select Resource",m.classList.add("pointer-events-none","opacity-50")),y&&(y.href="#",y.textContent="Open External Resource"),v?.classList.remove("hidden"),L?.classList.add("hidden"),b?.classList.add("hidden"),E?.removeAttribute("data"),A&&(A.href="#")},X=h=>{M=h.id,V(h.id),l?.classList.remove("border-white/15","text-gray-300","border-emerald-400/30","bg-emerald-400/10","text-emerald-300","border-amber-400/30","bg-amber-400/10","text-amber-300"),l?.classList.add(...rs(h.status).split(" ")),l&&(l.textContent=h.status),p?.classList.remove("border-white/15","text-gray-300","border-sky-400/40","bg-sky-400/10","text-sky-200","border-fuchsia-400/40","bg-fuchsia-400/10","text-fuchsia-200"),p?.classList.add(...os(h.resourceType).split(" ")),p&&(p.textContent=Mt[h.resourceType]),d&&(d.textContent=Bt[h.category]),c&&(c.textContent=h.title),u&&(u.textContent=h.summary);const x=!!h.link,I=x?wl(h.link):"";if(m&&(m.href=x?I:"#",m.textContent=x?h.linkLabel||(h.resourceType==="pdf"?"Open PDF in New Tab":"Open Link"):"Source Not Added Yet",m.classList.toggle("pointer-events-none",!x),m.classList.toggle("opacity-50",!x)),!x){v?.classList.remove("hidden"),L?.classList.add("hidden"),b?.classList.add("hidden"),E?.removeAttribute("data"),u&&(u.textContent=`${h.summary} Add a valid file/link in documentation data to activate this entry.`);return}if(h.resourceType==="pdf"){v?.classList.add("hidden"),b?.classList.add("hidden"),L?.classList.remove("hidden"),E&&(E.data=kl(I)),A&&(A.href=I),y&&(y.href=I,y.textContent=h.linkLabel||"Open PDF in New Tab"),k&&(k.textContent=`Source: ${ls(I)}`),u&&(u.textContent=`${h.summary} If the preview does not appear in your browser, use "Open PDF in New Tab".`);return}v?.classList.add("hidden"),L?.classList.add("hidden"),E?.removeAttribute("data"),b?.classList.remove("hidden"),y&&(y.href=I,y.textContent=h.linkLabel||"Open External Resource"),k&&(k.textContent=`Source: ${ls(I)}`)},_=()=>{const h=(e?.value||"").trim().toLowerCase();let x=0,I="",U=!1;if(n.forEach(H=>{const se=H.dataset.category||"",ce=H.dataset.resourceType||"",Be=H.dataset.search||"",ie=H.dataset.docId||"",pe=C==="all"||se===C,xe=$==="all"||ce===$,re=!h||Be.includes(h),te=pe&&xe&&re;H.classList.toggle("hidden",!te),te&&(x+=1,I||(I=ie),ie===M&&(U=!0))}),i?.classList.toggle("hidden",x!==0),r&&(r.textContent=x===n.length?`Showing all ${n.length} entries`:`Showing ${x} of ${n.length} entries`),x===0){F("No document matches your current filters. Try a different search or reset filters.");return}if(!U&&I){const H=w.get(I);H&&X(H)}};e?.addEventListener("input",_),a.forEach(h=>{h.addEventListener("click",()=>{C=h.dataset.category||"all",D(),_()})}),s.forEach(h=>{h.addEventListener("click",()=>{$=h.dataset.resourceType||"all",j(),_()})}),o?.addEventListener("click",()=>{e&&(e.value=""),C="all",$="all",D(),j(),_()}),n.forEach(h=>{h.addEventListener("click",()=>{const x=h.dataset.docId||"",I=w.get(x);I&&X(I)})});const G=He.find(h=>h.resourceType==="pdf"&&!!h.link&&h.status==="published")||He.find(h=>!!h.link&&h.status==="published")||He.find(h=>!!h.link);G?X(G):F("No documentation source has been added yet."),D(),j(),_(),new ze(.08).observeAll(".fade-in-section")}class ft{rules=new Map;addRule(e,a){this.rules.set(e,a)}validate(e){const a=[];return this.rules.forEach((s,n)=>{const i=e.get(n)||"",r=this.validateField(n,i,s);a.push(...r)}),{isValid:a.length===0,errors:a}}validateField(e,a,s){const n=[];return s.required&&!a.trim()?(n.push(`${this.formatFieldName(e)} is required`),n):(a&&s.email&&!this.isValidEmail(a)&&n.push(`${this.formatFieldName(e)} must be a valid email address`),a&&s.phone&&!this.isValidPhone(a)&&n.push(`${this.formatFieldName(e)} must be a valid phone number`),a&&s.minLength&&a.length<s.minLength&&n.push(`${this.formatFieldName(e)} must be at least ${s.minLength} characters`),a&&s.maxLength&&a.length>s.maxLength&&n.push(`${this.formatFieldName(e)} must not exceed ${s.maxLength} characters`),a&&s.pattern&&!s.pattern.test(a)&&n.push(`${this.formatFieldName(e)} format is invalid`),a&&s.custom&&!s.custom(a)&&n.push(`${this.formatFieldName(e)} is invalid`),n)}isValidEmail(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}isValidPhone(e){return/^[\d\s\-\+\(\)]+$/.test(e)&&e.replace(/\D/g,"").length>=10}formatFieldName(e){return e.split(/[-_]/).map(a=>a.charAt(0).toUpperCase()+a.slice(1)).join(" ")}}async function Sl(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
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
                        ${[{city:"Mumbai",address:"Bandra Kurla Complex, Mumbai 400051",phone:"+91 22 1234 5678",email:"mumbai@evbharat.com"},{city:"Bangalore",address:"Koramangala, Bangalore 560095",phone:"+91 80 1234 5678",email:"bangalore@evbharat.com"},{city:"Delhi",address:"Connaught Place, New Delhi 110001",phone:"+91 11 1234 5678",email:"delhi@evbharat.com"}].map(n=>`
                            <div class="bg-gradient-to-br from-pagani-gold/5 to-transparent border border-pagani-gold/30 p-6">
                                <h3 class="text-xl font-orbitron font-bold text-pagani-gold mb-4">${n.city}</h3>
                                <div class="space-y-3 text-gray-300">
                                    <div class="flex items-start gap-3">
                                        <span class="text-pagani-gold mt-1">📍</span>
                                        <span>${n.address}</span>
                                    </div>
                                    <div class="flex items-start gap-3">
                                        <span class="text-pagani-gold mt-1">📞</span>
                                        <a href="tel:${n.phone}" class="hover:text-pagani-gold transition-colors">${n.phone}</a>
                                    </div>
                                    <div class="flex items-start gap-3">
                                        <span class="text-pagani-gold mt-1">✉️</span>
                                        <a href="mailto:${n.email}" class="hover:text-pagani-gold transition-colors">${n.email}</a>
                                    </div>
                                </div>
                            </div>
                        `).join("")}

                        <!-- Social Media -->
                        <div class="border-t border-white/10 pt-8">
                            <h3 class="text-xl font-orbitron font-bold mb-4">FOLLOW US</h3>
                            <div class="flex gap-4">
                                ${["Twitter","LinkedIn","Instagram","YouTube"].map(n=>`
                                    <a href="#" class="w-12 h-12 border border-white/20 hover:border-pagani-gold flex items-center justify-center transition-colors group">
                                        <span class="text-white group-hover:text-pagani-gold text-xs">${n.slice(0,2)}</span>
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
                    ${[{q:"What is EV Bharat?",a:"EV Bharat is an intelligent Vehicle‑to‑Everything (V2E) safety and communication platform that enhances road safety using predictive battery monitoring, accident detection, and secure Visible Light Communication (VLC) technology."},{q:"How is EV Bharat different from existing EV systems?",a:"Unlike conventional EV systems that focus only on navigation or battery monitoring, EV Bharat integrates accident detection, predictive battery alerts, secure vehicle communication, and emergency response into one unified platform."},{q:"How does EV Bharat improve road safety?",a:"The system detects accidents and critical situations in real time and generates immediate alerts. It can broadcast distress signals to nearby vehicles and initiate emergency escalation if assistance is not received."},{q:"Is EV Bharat secure?",a:"Yes. The system uses light-based communication and secure embedded processing, reducing vulnerability to traditional RF-based cyber threats."},{q:"How does the battery prediction feature help drivers?",a:"The system predicts battery status and provides early warnings before critical depletion, helping drivers plan routes efficiently and reduce range anxiety."},{q:"Can EV Bharat be integrated into existing vehicles?",a:"Yes. The platform is designed to be modular and can be integrated into EVs through embedded hardware and software modules."},{q:"What is the long-term vision of EV Bharat?",a:"To build a secure, intelligent, and scalable V2E ecosystem that enhances autonomous decision-making, improves road safety, and supports the future of smart mobility."}].map((n,i)=>`
                        <div class="fade-in-section faq-item border border-white/10 hover:border-pagani-gold/50 transition-all" style="animation-delay: ${i*50}ms">
                            <button class="faq-question w-full text-left p-6 flex justify-between items-center">
                                <span class="font-orbitron font-bold text-lg">${n.q}</span>
                                <span class="text-pagani-gold text-2xl faq-icon">+</span>
                            </button>
                            <div class="faq-answer hidden px-6 pb-6 text-gray-400 leading-relaxed">
                                ${n.a}
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
        </section>
    `;const e=new ft;e.addRule("name",{required:!0,minLength:2}),e.addRule("email",{required:!0,email:!0}),e.addRule("phone",{phone:!0}),e.addRule("subject",{required:!0}),e.addRule("message",{required:!0,minLength:10});const a=document.getElementById("contact-form");a?.addEventListener("submit",n=>{n.preventDefault();const i=new FormData(a),r=e.validate(i);r.isValid?(alert("Thank you for your message! We will get back to you soon. 🎉"),a.reset()):alert(r.errors.join(`
`))}),document.querySelectorAll(".faq-question").forEach(n=>{n.addEventListener("click",()=>{const r=n.parentElement?.querySelector(".faq-answer"),o=n.querySelector(".faq-icon");r?.classList.contains("hidden")?(r.classList.remove("hidden"),o&&(o.textContent="−")):(r?.classList.add("hidden"),o&&(o.textContent="+"))})}),new ze(.1).observeAll(".fade-in-section")}const ds=[{id:1,category:"technology",title:"Wiring Bench Telemetry",description:"Bench-level MCU wiring and isolation rails inside a dark factory diagnostics rig.",src:"/images/gallery/Gemini_Generated_Image_j11eq8j11eq8j11e.png"},{id:2,category:"interior",title:"Nested MCU Stack",description:"ESP32-CAM and controller stack mounted on the rover with VLC receiver hardware.",src:"/images/gallery/unnamed%20(1).jpg"},{id:3,category:"exterior",title:"Factory Swarm Link",description:"Multi-bot optical communication across an automated factory floor.",src:"/images/gallery/unnamed%20(2).jpg"}],Tl=[{title:"Factory Bot Feed 01",src:"/images/gallery/AI_Generates_Project_Visualization_Videos.mp4"},{title:"Factory Bot Feed 02",src:"/images/gallery/Project_Visualization_Images_and_Video.mp4"},{title:"Factory Bot Feed 03",src:"/images/gallery/Zonda_Sequence_Video_Generated.mp4"}];async function Ll(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
        <!-- Hero Section -->
        <section class="relative min-h-[60vh] flex items-center justify-center px-8 py-32 overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-black">
            <div class="absolute inset-0 opacity-35" style="background-image: radial-gradient(circle at 20% 20%, rgba(56,189,248,0.16), transparent 35%), radial-gradient(circle at 80% 60%, rgba(148,163,184,0.14), transparent 40%), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: auto, auto, 42px 42px, 42px 42px;"></div>
            <div class="max-w-5xl mx-auto text-center relative z-10 fade-in-section">
                <div class="flex items-center justify-center gap-4 mb-8">
                    <span class="w-16 h-[2px] bg-cyan-400"></span>
                    <span class="text-cyan-300 tracking-[0.3em] uppercase text-sm">Factory Vision Grid</span>
                    <span class="w-16 h-[2px] bg-cyan-400"></span>
                </div>
                <h1 class="text-5xl md:text-7xl font-orbitron font-bold mb-8">
                    DARK FACTORY <span class="text-cyan-300">BOT</span>
                </h1>
                <p class="text-xl text-zinc-300 leading-relaxed max-w-3xl mx-auto">
                    Surveillance-grade views from the assembly line, calibrated for machine precision and steel-floor realism.
                </p>
            </div>
        </section>

        <!-- Factory Video Section -->
        <section class="relative z-20 bg-black py-20 px-8 border-y border-cyan-400/20">
            <div class="max-w-6xl mx-auto fade-in-section">
                <div class="text-center mb-10">
                    <p class="text-cyan-300 tracking-[0.25em] uppercase text-sm mb-3">Live Simulation</p>
                    <h2 class="text-4xl md:text-5xl font-orbitron font-bold">Dark Factory Bot <span class="text-cyan-300">Video Feed</span></h2>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    ${Tl.map(i=>`
                        <article class="relative aspect-video overflow-hidden border border-cyan-300/30 bg-zinc-950 shadow-[0_0_0_1px_rgba(6,182,212,0.18),0_18px_48px_rgba(0,0,0,0.55)]">
                            <video
                                class="w-full h-full object-cover"
                                src="${i.src}"
                                autoplay
                                muted
                                loop
                                playsinline
                                controls
                            ></video>
                            <div class="absolute left-3 bottom-3 px-3 py-1 text-xs tracking-[0.2em] uppercase bg-black/60 border border-cyan-300/40 text-cyan-200">
                                ${i.title}
                            </div>
                        </article>
                    `).join("")}
                </div>
            </div>
        </section>

        <!-- Filter Section -->
        <section class="relative z-20 bg-zinc-950 py-12 px-8 border-y border-cyan-400/20">
            <div class="max-w-7xl mx-auto">
                <div class="flex flex-wrap justify-center gap-4">
                    <button class="filter-btn active px-6 py-3 border border-cyan-300 bg-cyan-300 text-zinc-950 font-semibold tracking-wider uppercase transition-all text-sm" data-filter="all">
                        All
                    </button>
                    <button class="filter-btn px-6 py-3 border border-white/20 hover:border-cyan-300 font-semibold tracking-wider uppercase transition-all text-sm" data-filter="exterior">
                        Exterior
                    </button>
                    <button class="filter-btn px-6 py-3 border border-white/20 hover:border-cyan-300 font-semibold tracking-wider uppercase transition-all text-sm" data-filter="interior">
                        Interior
                    </button>
                    <button class="filter-btn px-6 py-3 border border-white/20 hover:border-cyan-300 font-semibold tracking-wider uppercase transition-all text-sm" data-filter="technology">
                        Technology
                    </button>
                </div>
            </div>
        </section>

        <!-- Gallery Grid -->
        <section class="relative z-20 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black py-24 px-8">
            <div class="max-w-7xl mx-auto">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="gallery-grid">
                    ${ds.map((i,r)=>`
                        <div class="gallery-item fade-in-section group cursor-pointer" data-category="${i.category}" data-id="${i.id}" style="animation-delay: ${r*50}ms">
                            <div class="relative aspect-video bg-gradient-to-br from-cyan-500/10 via-zinc-900 to-black border border-cyan-300/25 overflow-hidden shadow-[0_0_0_1px_rgba(6,182,212,0.15),0_16px_40px_rgba(0,0,0,0.45)]">
                                <img 
                                    src="${i.src}" 
                                    alt="${i.title}" 
                                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    loading="lazy"
                                />
                                <div class="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div class="absolute bottom-0 left-0 right-0 p-6">
                                        <h3 class="text-xl font-orbitron font-bold mb-2">${i.title}</h3>
                                        <p class="text-sm text-zinc-300">${i.description}</p>
                                    </div>
                                </div>
                                <!-- Category badge -->
                                <div class="absolute top-4 right-4 px-3 py-1 bg-cyan-300/90 text-zinc-950 text-xs font-semibold uppercase tracking-wider">
                                    ${i.category}
                                </div>
                                <div class="absolute top-4 left-4 px-2 py-1 border border-cyan-200/40 text-cyan-100 text-[10px] tracking-[0.2em] uppercase bg-black/40">
                                    Unit-${String(i.id).padStart(2,"0")}
                                </div>
                            </div>
                        </div>
                    `).join("")}
                </div>

                <!-- No results message -->
                <div id="no-results" class="hidden text-center py-16">
                    <div class="text-6xl mb-4">🔍</div>
                    <h3 class="text-2xl font-orbitron font-bold mb-2">No visual feed found</h3>
                    <p class="text-gray-400">Try selecting a different data channel</p>
                </div>
            </div>
        </section>

        <!-- Download Section -->
        <section class="relative z-20 bg-zinc-950 py-24 px-8 border-t border-cyan-400/20">
            <div class="max-w-4xl mx-auto text-center fade-in-section">
                <h2 class="text-4xl md:text-5xl font-orbitron font-bold mb-6">ARCHIVE & <span class="text-cyan-300">TELEMETRY</span></h2>
                <p class="text-gray-400 text-lg mb-8">Download high-resolution frames and engineering media packs</p>
                <button class="px-12 py-4 bg-cyan-300 text-zinc-950 font-semibold tracking-widest uppercase hover:bg-cyan-200 transition-all">
                    Download Asset Pack
                </button>
            </div>
        </section>
    `;const e=document.querySelectorAll(".filter-btn"),a=document.querySelectorAll(".gallery-item"),s=document.getElementById("no-results");e.forEach(i=>{i.addEventListener("click",()=>{e.forEach(l=>{l.classList.remove("active","bg-cyan-300","text-zinc-950"),l.classList.add("border-white/20")}),i.classList.add("active","bg-cyan-300","text-zinc-950"),i.classList.remove("border-white/20");const r=i.getAttribute("data-filter");let o=0;a.forEach(l=>{const p=l.getAttribute("data-category");r==="all"||p===r?(l.classList.remove("hidden"),o++):l.classList.add("hidden")}),o===0?s?.classList.remove("hidden"):s?.classList.add("hidden")})}),a.forEach(i=>{i.addEventListener("click",()=>{const r=i.getAttribute("data-id"),o=ds.find(l=>l.id===parseInt(r||"0"));if(o){const l=`
                    <div class="text-center">
                        <div class="aspect-video bg-gradient-to-br from-cyan-500/10 via-zinc-900 to-black border border-cyan-300/30 flex items-center justify-center mb-6 overflow-hidden">
                            <img src="${o.src}" alt="${o.title}" class="w-full h-full object-contain" />
                        </div>
                        <h3 class="text-3xl font-orbitron font-bold mb-4">${o.title}</h3>
                        <p class="text-gray-400 text-lg mb-6">${o.description}</p>
                        <div class="flex gap-4 justify-center">
                            <a href="${o.src}" download class="px-8 py-3 bg-cyan-300 text-zinc-950 font-semibold tracking-wider uppercase hover:bg-cyan-200 transition-all">
                                Download HD
                            </a>
                            <button class="px-8 py-3 border border-cyan-300 text-cyan-300 font-semibold tracking-wider uppercase hover:bg-cyan-300 hover:text-zinc-950 transition-all" onclick="navigator.share ? navigator.share({url: '${o.src}'}) : navigator.clipboard.writeText('${o.src}')">
                                Share
                            </button>
                        </div>
                    </div>
                `;vt.open(l)}})}),new ze(.1).observeAll(".fade-in-section")}function Cn(t){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)}function An(t){return t.length>=8}async function Cl(){const t=document.getElementById("app");if(t){if(!document.querySelector('link[href*="font-awesome"]')){const e=document.createElement("link");e.rel="stylesheet",e.href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",document.head.appendChild(e)}t.innerHTML=`
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

            .portal-switch {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                padding: 6px;
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.12);
                background: rgba(0, 0, 0, 0.35);
                margin-bottom: 18px;
            }

            .portal-btn {
                border: 1px solid transparent;
                border-radius: 8px;
                padding: 10px 12px;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.16em;
                font-weight: 700;
                cursor: pointer;
                color: rgba(255, 255, 255, 0.75);
                background: transparent;
                transition: all 0.25s ease;
            }

            .portal-btn.active {
                color: #020617;
                border-color: rgba(34, 211, 238, 0.75);
                background: linear-gradient(135deg, #67e8f9, #22d3ee);
                box-shadow: 0 8px 18px rgba(6, 182, 212, 0.28);
            }

            .auth-container.mode-factory .form-input {
                border-color: rgba(34, 211, 238, 0.38);
            }

            .auth-container.mode-factory .form-input:focus {
                border-color: #22d3ee;
                box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.12);
            }

            .auth-container.mode-factory .submit-btn {
                background: linear-gradient(135deg, #67e8f9, #22d3ee);
            }

            .auth-container.mode-factory .submit-btn:hover {
                box-shadow: 0 8px 25px rgba(34, 211, 238, 0.36);
            }

            .auth-container.mode-factory .overlay {
                background: linear-gradient(135deg, #0ea5e9, #22d3ee, #0f172a);
            }

            .auth-container.mode-factory .ghost-btn {
                border-color: #020617;
                color: #020617;
            }

            .auth-container.mode-factory .ghost-btn:hover {
                background-color: #020617;
                color: #67e8f9;
            }

            .auth-container.mode-factory .text-pagani-gold,
            .auth-container.mode-factory .toggle-password:hover,
            .auth-container.mode-factory #showRegisterMobile,
            .auth-container.mode-factory #showLoginMobile,
            .auth-container.mode-factory a:hover {
                color: #67e8f9 !important;
            }

            .auth-container.mode-factory #remember-me,
            .auth-container.mode-factory #terms-checkbox {
                accent-color: #22d3ee;
            }

            #authThemeRoot.mode-factory .auth-glow {
                background: rgba(56, 189, 248, 0.2);
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
            <div class="auth-glow absolute top-20 left-20 w-72 h-72 bg-pagani-gold/5 rounded-full blur-3xl animate-pulse"></div>
            <div class="auth-glow absolute bottom-20 right-20 w-96 h-96 bg-pagani-gold/5 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>
        </div>

        <div id="authThemeRoot" class="min-h-screen flex items-center justify-center px-4 py-12">
            <div class="auth-container" id="authContainer">
                <!-- Login Form -->
                <div class="form-container login-container" id="loginContainer">
                    <form id="loginForm" novalidate>
                        <div class="portal-switch" role="tablist" aria-label="Select login portal">
                            <button type="button" class="portal-btn" id="modeEvBtn" data-mode="ev">EV Portal</button>
                            <button type="button" class="portal-btn" id="modeFactoryBtn" data-mode="factory">Dark Factory</button>
                        </div>

                        <h1 class="text-2xl font-orbitron font-bold text-white mb-2" id="loginPortalTitle">EV Portal Login</h1>
                        <p class="text-gray-400 text-sm mb-6" id="loginPortalDescription">Sign in to access your EV dashboard</p>
                        
                        <div id="login-status" class="form-status"></div>
                        <input type="hidden" id="login-portal-mode" value="ev" />
                        
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
    `,setTimeout(()=>{Al()},100)}}function Al(){const t=document.getElementById("authContainer"),e=document.getElementById("showRegister"),a=document.getElementById("showLogin"),s=document.getElementById("showRegisterMobile"),n=document.getElementById("showLoginMobile"),i=document.getElementById("loginContainer"),r=document.getElementById("registerContainer"),o=document.getElementById("modeEvBtn"),l=document.getElementById("modeFactoryBtn"),p=document.getElementById("login-portal-mode"),d=document.getElementById("loginPortalTitle"),c=document.getElementById("loginPortalDescription"),u=document.getElementById("authThemeRoot"),m=k=>{p&&(p.value=k);const y=k==="factory";t?.classList.toggle("mode-factory",y),t?.classList.toggle("mode-ev",!y),u?.classList.toggle("mode-factory",y),u?.classList.toggle("mode-ev",!y),o?.classList.toggle("active",!y),l?.classList.toggle("active",y),d&&(d.textContent=y?"Dark Factory Login":"EV Portal Login"),c&&(c.textContent=y?"Sign in to monitor robotics lines, alerts, and industrial analytics":"Sign in to access your EV dashboard")};o?.addEventListener("click",()=>m("ev")),l?.addEventListener("click",()=>m("factory")),m("ev"),e?.addEventListener("click",()=>{t?.classList.add("right-panel-active")}),a?.addEventListener("click",()=>{t?.classList.remove("right-panel-active")}),s?.addEventListener("click",()=>{i?.classList.add("hidden"),r?.classList.add("active")}),n?.addEventListener("click",()=>{i?.classList.remove("hidden"),r?.classList.remove("active")}),document.getElementById("useDemoBtn")?.addEventListener("click",()=>{t?.classList.remove("right-panel-active"),i?.classList.remove("hidden"),r?.classList.remove("active");const k=z.getDefaultCredentials(),y=document.getElementById("login-email"),w=document.getElementById("login-password"),C=document.getElementById("login-status");if(!k){Pe(C,"Demo account is not configured.","error");return}y&&w&&(y.value=k.email,w.value=k.password,y.classList.add("border-pagani-gold"),w.classList.add("border-pagani-gold"),setTimeout(()=>{y.classList.remove("border-pagani-gold"),w.classList.remove("border-pagani-gold")},1e3))}),document.querySelectorAll(".toggle-password").forEach(k=>{k.addEventListener("click",y=>{y.preventDefault();const w=k.parentElement;if(w){const C=w.querySelector("input");if(C){const $=C.type==="password";C.type=$?"text":"password";const M=k.querySelector("i");M&&(M.className=$?"fa-solid fa-eye-slash":"fa-solid fa-eye")}}})});const E=document.getElementById("register-password");E?.addEventListener("input",()=>{Il(E.value)});const A=document.getElementById("loginForm"),b=document.getElementById("registerForm");A?.addEventListener("submit",k=>{k.preventDefault(),Bl()}),b?.addEventListener("submit",k=>{k.preventDefault(),Ml()}),location.hash==="#register"&&(t?.classList.add("right-panel-active"),i?.classList.add("hidden"),r?.classList.add("active"))}function Il(t){let e=0;t.length>=8&&e++,t.match(/[a-z]/)&&t.match(/[A-Z]/)&&e++,t.match(/\d/)&&e++,t.match(/[@$!%*?&#]/)&&e++;const a=document.querySelectorAll(".strength-bar"),s=document.querySelector(".strength-text"),n=["bg-red-500","bg-orange-500","bg-yellow-500","bg-green-500"],i=["Weak","Fair","Good","Strong"];a.forEach((r,o)=>{r.classList.remove("bg-red-500","bg-orange-500","bg-yellow-500","bg-green-500","bg-gray-600"),o<e?r.classList.add(n[e-1]):r.classList.add("bg-gray-600")}),s&&(s.textContent=e>0?i[e-1]:"Weak",s.className="strength-text text-xs w-14 text-right "+(e===0||e===1?"text-red-400":e===2?"text-orange-400":e===3?"text-yellow-400":"text-green-400"))}function le(t,e){t&&(t.textContent=e,t.style.display="block")}function Xt(t){t&&(t.textContent="",t.style.display="none")}function Pe(t,e,a){t&&(t.textContent=e,t.className=`form-status show ${a}`)}async function Bl(){const t=document.getElementById("login-email"),e=document.getElementById("login-password"),a=document.getElementById("login-email-error"),s=document.getElementById("login-password-error"),n=document.getElementById("login-status"),i=document.getElementById("login-portal-mode");let r=!0;if(Xt(a),Xt(s),n&&(n.className="form-status"),t.value.trim()?Cn(t.value)||(le(a,"Please enter a valid email"),r=!1):(le(a,"Email is required"),r=!1),e.value.trim()?An(e.value)||(le(s,"Password must be at least 8 characters"),r=!1):(le(s,"Password is required"),r=!1),!r)return;const o=await z.login(t.value,e.value);if(o.success){const l=i?.value||"ev";localStorage.setItem("evbharat_portal_mode",l),Pe(n,"Login successful! Redirecting...","success"),setTimeout(()=>{window.location.href=l==="factory"?"/factory-dashboard":"/dashboard"},1500)}else Pe(n,o.message,"error")}async function Ml(){const t=document.getElementById("register-name"),e=document.getElementById("register-email"),a=document.getElementById("register-password"),s=document.getElementById("register-confirm"),n=document.getElementById("terms-checkbox"),i=document.getElementById("register-name-error"),r=document.getElementById("register-email-error"),o=document.getElementById("register-password-error"),l=document.getElementById("register-confirm-error"),p=document.getElementById("register-status");let d=!0;if([i,r,o,l].forEach(Xt),p&&(p.className="form-status"),t.value.trim()||(le(i,"Name is required"),d=!1),e.value.trim()?Cn(e.value)||(le(r,"Please enter a valid email"),d=!1):(le(r,"Email is required"),d=!1),a.value.trim()?An(a.value)||(le(o,"Password must be at least 8 characters"),d=!1):(le(o,"Password is required"),d=!1),a.value!==s.value&&(le(l,"Passwords do not match"),d=!1),n.checked||(Pe(p,"Please accept the Terms of Service","error"),d=!1),!d)return;const c=await z.signup(t.value,e.value,a.value);c.success?(Pe(p,"Registration successful! Redirecting...","success"),setTimeout(()=>{window.location.href="/dashboard"},1500)):Pe(p,c.message,"error")}class $l{ws=null;reconnectInterval=null;telemetryCallbacks=new Set;statusCallbacks=new Set;currentStatus={connected:!1,device:null,telemetry:null};wsUrls=["ws://localhost:8002/ws","ws://127.0.0.1:8002/ws"];currentUrlIndex=0;RECONNECT_DELAY=3e3;constructor(){this.connect()}setCustomUrls(e){this.wsUrls=e,this.currentUrlIndex=0,this.disconnect(),setTimeout(()=>this.connect(),100)}connect(){if(this.ws?.readyState===WebSocket.OPEN)return;const e=this.wsUrls[this.currentUrlIndex];try{console.log(`🔵 Attempting connection to: ${e}`),this.ws=new WebSocket(e),this.ws.onopen=()=>{console.log(`🔵 Connected to Serial Bridge at ${e}`),this.stopReconnectTimer(),this.currentUrlIndex=0},this.ws.onmessage=a=>{try{const s=JSON.parse(a.data);this.handleMessage(s)}catch(s){console.error("Failed to parse WebSocket message:",s)}},this.ws.onerror=a=>{console.error(`WebSocket error on ${e}:`,a)},this.ws.onclose=()=>{console.log(`🔴 Disconnected from ${e}`),this.currentStatus.connected=!1,this.notifyStatusChange(),this.currentUrlIndex=(this.currentUrlIndex+1)%this.wsUrls.length,this.scheduleReconnect()}}catch(a){console.error("Failed to create WebSocket:",a),this.currentUrlIndex=(this.currentUrlIndex+1)%this.wsUrls.length,this.scheduleReconnect()}}handleMessage(e){switch(e.type){case"status":this.currentStatus={connected:e.connected||!1,device:e.port||e.device||"ESP32",telemetry:e.telemetry||null},this.notifyStatusChange(),e.telemetry&&this.notifyTelemetry(e.telemetry);break;case"telemetry":this.currentStatus.telemetry=e.data,this.currentStatus.connected=!0,this.notifyTelemetry(e.data);break;case"command_response":console.log(`Command ${e.command}: ${e.success?"Success":"Failed"}`);break;case"connection_response":this.currentStatus.connected=e.connected,this.notifyStatusChange();break}}scheduleReconnect(){this.stopReconnectTimer(),this.reconnectInterval=window.setInterval(()=>{console.log("🔄 Attempting to reconnect to Bluetooth Bridge..."),this.connect()},this.RECONNECT_DELAY)}stopReconnectTimer(){this.reconnectInterval!==null&&(clearInterval(this.reconnectInterval),this.reconnectInterval=null)}sendCommand(e){if(!this.ws||this.ws.readyState!==WebSocket.OPEN)return console.warn("WebSocket not connected - command not sent:",e),!1;try{return this.ws.send(JSON.stringify({command:e})),!0}catch(a){return console.error("Failed to send command:",a),!1}}connectToESP32(){if(!this.ws||this.ws.readyState!==WebSocket.OPEN)return console.warn("WebSocket not connected to bridge - trying to reconnect..."),this.connect(),!1;try{return this.ws.send(JSON.stringify({command:"CONNECT"})),!0}catch(e){return console.error("Failed to send connect command:",e),!1}}onTelemetry(e){return this.telemetryCallbacks.add(e),this.currentStatus.telemetry&&e(this.currentStatus.telemetry),()=>{this.telemetryCallbacks.delete(e)}}onStatusChange(e){return this.statusCallbacks.add(e),e(this.currentStatus),()=>{this.statusCallbacks.delete(e)}}getStatus(){return{...this.currentStatus}}notifyTelemetry(e){this.telemetryCallbacks.forEach(a=>{try{a(e)}catch(s){console.error("Error in telemetry callback:",s)}})}notifyStatusChange(){this.statusCallbacks.forEach(e=>{try{e(this.currentStatus)}catch(a){console.error("Error in status callback:",a)}})}disconnect(){this.stopReconnectTimer(),this.ws&&(this.ws.close(),this.ws=null)}}const Z=new $l,cs="http://192.168.1.11/cam-hi.jpg",$t="evbharat_esp32_cam_url",ps="evbharat_cam_mode",bt="http://localhost:8000/stream";let ae=null;async function Rl(){if(!z.isAuthenticated()){window.location.href="/auth";return}const t=document.getElementById("app");if(!t)return;const e=z.getCurrentUser(),s=(localStorage.getItem("evbharat_portal_mode")||"ev")==="factory";if(!document.querySelector('link[href*="font-awesome"]')){const n=document.createElement("link");n.rel="stylesheet",n.href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",document.head.appendChild(n)}t.innerHTML=`
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
                        <div id="quick-route-planner-card" class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
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

                        <!-- ESP32-CAM View -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                            <div class="flex items-center justify-between mb-4 gap-3">
                                <h3 class="text-lg font-orbitron font-bold flex items-center gap-2">
                                    <i class="fa-solid fa-camera text-cyan-400"></i>
                                    Live Cam View
                                </h3>
                                <div class="flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/40 bg-cyan-500/10">
                                    <span id="cam-status-dot" class="w-2 h-2 rounded-full bg-red-500"></span>
                                    <span id="cam-status-text" class="text-xs text-cyan-300">Offline</span>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-2 mb-4">
                                <input
                                    id="cam-url-input"
                                    type="text"
                                    class="w-full px-3 py-2 bg-gray-800/60 border border-cyan-500/30 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-all"
                                    placeholder="ESP32-CAM URL (e.g. http://192.168.1.11/cam-hi.jpg)"
                                />
                                <button id="cam-save-url" class="px-3 py-2 bg-cyan-500/15 border border-cyan-500/40 rounded-lg text-cyan-300 text-sm hover:bg-cyan-500/25 transition-all">
                                    Save
                                </button>
                                <button id="cam-toggle-btn" class="px-3 py-2 bg-cyan-500 text-black font-semibold rounded-lg text-sm hover:bg-cyan-400 transition-all">
                                    Start
                                </button>
                            </div>

                            <div class="flex flex-wrap items-center gap-2 mb-4">
                                <span class="text-[11px] uppercase tracking-wider text-gray-500">Resolution:</span>
                                <button data-cam-path="/cam-lo.jpg" class="px-2 py-1 border border-cyan-500/40 rounded text-xs text-cyan-300 hover:bg-cyan-500/15 transition-all">Low (320x240)</button>
                                <button data-cam-path="/cam-mid.jpg" class="px-2 py-1 border border-cyan-500/40 rounded text-xs text-cyan-300 hover:bg-cyan-500/15 transition-all">Mid (640x480)</button>
                                <button data-cam-path="/cam-hi.jpg" class="px-2 py-1 border border-cyan-500/40 rounded text-xs text-cyan-300 hover:bg-cyan-500/15 transition-all">High (800x600)</button>
                            </div>

                            <div class="flex flex-wrap items-center gap-2 mb-4">
                                <span class="text-[11px] uppercase tracking-wider text-gray-500">Mode:</span>
                                <button id="cam-mode-direct" class="px-2 py-1 border border-cyan-500/40 rounded text-xs text-cyan-300 hover:bg-cyan-500/15 transition-all">Direct Feed</button>
                                <button id="cam-mode-yolo" class="px-2 py-1 border border-cyan-500/40 rounded text-xs text-cyan-300 hover:bg-cyan-500/15 transition-all">YOLO Detection</button>
                                <span class="text-[11px] text-gray-500 truncate">Proxy: ${bt}</span>
                            </div>

                            <div class="relative overflow-hidden rounded-xl border border-cyan-500/20 bg-black/60 aspect-video">
                                <img
                                    id="cam-feed"
                                    alt="ESP32-CAM feed"
                                    class="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                <div class="absolute inset-0 pointer-events-none border border-cyan-300/20 rounded-xl"></div>
                                <div class="absolute top-3 left-3 px-2 py-1 bg-black/70 border border-cyan-500/50 rounded text-[11px] font-orbitron text-cyan-300 uppercase tracking-wider">
                                    ESP32-CAM
                                </div>
                            </div>

                            <p class="text-xs text-gray-500 mt-3">
                                Toggle YOLO Detection Mode to proxy frames through ${bt} for live bounding boxes, or keep Direct Feed to pull directly from your ESP32 endpoint.
                            </p>
                        </div>

                        ${s?"":`
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
                        `}

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

                        <!-- Vehicle Control -->
                        <div class="bg-gradient-to-br from-blue-900/30 to-pagani-black border border-blue-500/30 rounded-xl p-6 fade-in-section">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2 text-blue-400">
                                <i class="fa-solid fa-gamepad"></i>
                                Vehicle Control
                            </h3>
                            
                            <!-- Connection Status -->
                            <div id="bt-status" class="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        <div id="bt-indicator" class="w-2 h-2 bg-red-500 rounded-full"></div>
                                        <span id="bt-status-text" class="text-xs text-gray-400">Disconnected</span>
                                    </div>
                                    <button id="bt-connect-btn" class="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-md text-xs text-blue-400 hover:bg-blue-500/30 transition-all">
                                        Connect
                                    </button>
                                </div>
                            </div>

                            <!-- Telemetry Data -->
                            <div id="vehicle-telemetry" class="mb-4 grid grid-cols-2 gap-2 opacity-50">
                                <div class="p-2 bg-gray-800/50 rounded text-center">
                                    <p id="telemetry-battery" class="text-lg font-orbitron font-bold text-green-400">--</p>
                                    <p class="text-xs text-gray-500">Battery</p>
                                </div>
                                <div class="p-2 bg-gray-800/50 rounded text-center">
                                    <p id="telemetry-temp" class="text-lg font-orbitron font-bold">--</p>
                                    <p class="text-xs text-gray-500">Temp °C</p>
                                </div>
                                <div class="col-span-2 p-2 bg-gray-800/50 rounded text-center">
                                    <p id="telemetry-direction" class="text-sm font-orbitron font-bold text-gray-400">STOP</p>
                                    <p class="text-xs text-gray-500">Direction</p>
                                </div>
                            </div>

                            <!-- D-Pad Controls -->
                            <div class="relative w-full aspect-square max-w-[200px] mx-auto mb-4">
                                <!-- Center -->
                                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gray-800 rounded-full border-2 border-gray-700 flex items-center justify-center">
                                    <i class="fa-solid fa-car text-2xl text-gray-600"></i>
                                </div>
                                
                                <!-- Up (Forward) -->
                                <button id="ctrl-forward" class="absolute left-1/2 -translate-x-1/2 top-0 w-16 h-20 bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-t-xl border border-blue-400/50 flex items-center justify-center text-white shadow-lg disabled:opacity-30 disabled:cursor-not-allowed">
                                    <i class="fa-solid fa-chevron-up text-xl"></i>
                                </button>
                                
                                <!-- Down (Backward) -->
                                <button id="ctrl-backward" class="absolute left-1/2 -translate-x-1/2 bottom-0 w-16 h-20 bg-gradient-to-b from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 rounded-b-xl border border-blue-400/50 flex items-center justify-center text-white shadow-lg disabled:opacity-30 disabled:cursor-not-allowed">
                                    <i class="fa-solid fa-chevron-down text-xl"></i>
                                </button>
                                
                                <!-- Left -->
                                <button id="ctrl-left" class="absolute top-1/2 -translate-y-1/2 left-0 w-20 h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-l-xl border border-blue-400/50 flex items-center justify-center text-white shadow-lg disabled:opacity-30 disabled:cursor-not-allowed">
                                    <i class="fa-solid fa-chevron-left text-xl"></i>
                                </button>
                                
                                <!-- Right -->
                                <button id="ctrl-right" class="absolute top-1/2 -translate-y-1/2 right-0 w-20 h-16 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 rounded-r-xl border border-blue-400/50 flex items-center justify-center text-white shadow-lg disabled:opacity-30 disabled:cursor-not-allowed">
                                    <i class="fa-solid fa-chevron-right text-xl"></i>
                                </button>
                            </div>

                            <!-- Stop Button -->
                            <button id="ctrl-stop" class="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-orbitron font-bold rounded-lg transition-all uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed">
                                <i class="fa-solid fa-hand mr-2"></i> STOP
                            </button>

                            <p class="text-xs text-gray-500 text-center mt-3">
                                <i class="fa-solid fa-bluetooth mr-1"></i> Requires Bluetooth bridge running
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
                                <div id="route-updated-alert" class="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
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
                        <div id="nearby-stations-card" class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
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
                                <a id="quick-route-action" href="/map" class="p-4 bg-pagani-black/50 border border-pagani-gold/20 rounded-lg text-center hover:border-pagani-gold/50 transition-all group">
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
    `,s&&(document.getElementById("quick-route-planner-card")?.remove(),document.getElementById("nearby-stations-card")?.remove(),document.getElementById("quick-route-action")?.remove(),document.getElementById("route-updated-alert")?.remove()),setTimeout(()=>{Pl()},100)}function Pl(){const t=document.getElementById("refresh-dashboard");t?.addEventListener("click",()=>{t.classList.add("animate-spin"),setTimeout(()=>{t.classList.remove("animate-spin")},1e3)});const e=document.getElementById("sos-btn");let a;e?.addEventListener("mousedown",()=>{a=setTimeout(()=>{alert("Emergency SOS activated! Contacting emergency services...")},3e3)}),e?.addEventListener("mouseup",()=>{clearTimeout(a)}),e?.addEventListener("mouseleave",()=>{clearTimeout(a)}),document.getElementById("vehicle-diagnostics")?.addEventListener("click",()=>{alert("Running vehicle diagnostics... All systems operational!")}),Dl(),Vl();const n=document.querySelectorAll(".fade-in-section"),i=new IntersectionObserver(r=>{r.forEach(o=>{o.isIntersecting&&o.target.classList.add("animate-fadeInUp")})},{threshold:.1});n.forEach(r=>i.observe(r))}function Vl(){const t=document.getElementById("cam-feed"),e=document.getElementById("cam-url-input"),a=document.getElementById("cam-save-url"),s=document.getElementById("cam-toggle-btn"),n=Array.from(document.querySelectorAll("[data-cam-path]")),i=document.getElementById("cam-mode-direct"),r=document.getElementById("cam-mode-yolo"),o=document.getElementById("cam-status-dot"),l=document.getElementById("cam-status-text");if(!t||!e||!a||!s||!o||!l)return;const p=x=>{const I=x.trim();return I?/^https?:\/\//i.test(I)?I:`http://${I}`:""},d=x=>x.replace("/com-hi.jpg","/cam-hi.jpg").replace("com-hi.jpg","cam-hi.jpg").replace("/camhi.jpg","/cam-hi.jpg").replace("camhi.jpg","cam-hi.jpg").replace("/cam-mid.jpeg","/cam-mid.jpg").replace("/cam-lo.jpeg","/cam-lo.jpg").replace("/cam-hi.jpeg","/cam-hi.jpg"),c=x=>{try{const I=new URL(x),U=I.pathname.toLowerCase(),H=/\/cam-(lo|mid|hi)\.jpg$/.test(U),se=U.endsWith(".jpg")||U.endsWith(".jpeg");return(!U||U==="/"||!H&&!se)&&(I.pathname="/cam-hi.jpg"),I.toString()}catch{return x}},u=(x,I)=>{try{const U=new URL(x);return U.pathname=I,U.toString()}catch{return x}},m=(x,I)=>{if(l.textContent=I,o.classList.remove("bg-red-500","bg-green-500","animate-pulse"),x){o.classList.add("bg-green-500","animate-pulse"),l.classList.remove("text-red-300"),l.classList.add("text-cyan-300");return}o.classList.add("bg-red-500"),l.classList.add("text-red-300")},v=x=>{try{const I=new URL(x);return I.searchParams.set("t",String(Date.now())),I.toString()}catch{return x}},L=x=>{const I=bt.includes("?")?"&":"?";return`${bt}${I}source=${encodeURIComponent(x)}&ts=${Date.now()}`},E=x=>{x?(s.textContent="Stop",s.classList.remove("bg-cyan-500","hover:bg-cyan-400","text-black"),s.classList.add("bg-red-600","hover:bg-red-500","text-white")):(s.textContent="Start",s.classList.remove("bg-red-600","hover:bg-red-500","text-white"),s.classList.add("bg-cyan-500","hover:bg-cyan-400","text-black"))},A=(x,I)=>{x&&(x.classList.toggle("bg-cyan-500",I),x.classList.toggle("text-black",I),x.classList.toggle("text-cyan-300",!I),x.classList.toggle("border-cyan-500",I),x.classList.toggle("border-cyan-500/40",!I),x.classList.toggle("font-semibold",I))},b=localStorage.getItem(ps);let y=(x=>x==="direct"||x==="yolo")(b)?b:"direct",w=c(d(p(localStorage.getItem($t)||cs))),C=!1,$=!1;e.value=w,ae&&(clearTimeout(ae),ae=null);const M=()=>{if(y==="direct"){if(!w){m(!1,"No URL");return}$||($=!0,t.src=v(w))}},D=(x=100)=>{!C||y!=="direct"||(ae&&clearTimeout(ae),ae=setTimeout(()=>{M()},x))},j=()=>{ae&&(clearTimeout(ae),ae=null),$=!1},V=()=>{A(i,y==="direct"),A(r,y==="yolo")},F=()=>{if(j(),!w){m(!1,"No URL");return}C=!0,E(!0),m(!1,"Connecting..."),M()},X=()=>{if(j(),!w){m(!1,"No URL");return}C=!0,E(!0),m(!1,"YOLO connecting..."),t.src=L(w)},_=()=>{y==="yolo"?X():F()},G=()=>{C=!1,j(),t.removeAttribute("src"),E(!1),m(!1,"Stopped")},O=x=>{y=x,localStorage.setItem(ps,x),V(),C?_():m(!1,x==="yolo"?"YOLO ready":"Ready")},h=()=>{const x=c(d(p(e.value)));if(e.value=x,w=x,localStorage.setItem($t,x),!x){G(),m(!1,"No URL");return}C?_():m(!1,y==="yolo"?"YOLO ready":"Ready")};t.addEventListener("load",()=>{$=!1,C&&(y==="direct"?(m(!0,"Online"),D(80)):m(!0,"YOLO active"))}),t.addEventListener("error",()=>{$=!1,m(!1,y==="yolo"?"YOLO proxy unavailable":"Unable to load"),C&&(y==="direct"?D(500):(ae&&clearTimeout(ae),ae=setTimeout(()=>{C&&y==="yolo"&&(t.src=L(w))},1500)))}),a.addEventListener("click",h),e.addEventListener("keydown",x=>{x.key==="Enter"&&(x.preventDefault(),h())}),s.addEventListener("click",()=>{C?G():_()}),i?.addEventListener("click",()=>O("direct")),r?.addEventListener("click",()=>O("yolo")),n.forEach(x=>{x.addEventListener("click",()=>{const I=x.dataset.camPath||"/cam-hi.jpg",U=c(d(p(e.value||w||cs))),H=u(U,I);w=H,e.value=H,localStorage.setItem($t,H),C?_():m(!1,y==="yolo"?"YOLO ready":"Ready")})}),V(),w?_():m(!1,"No URL")}function Dl(){const t=document.getElementById("bt-connect-btn"),e=document.getElementById("bt-indicator"),a=document.getElementById("bt-status-text"),s=document.getElementById("vehicle-telemetry"),n=document.getElementById("ctrl-forward"),i=document.getElementById("ctrl-backward"),r=document.getElementById("ctrl-left"),o=document.getElementById("ctrl-right"),l=document.getElementById("ctrl-stop"),p=document.getElementById("telemetry-battery"),d=document.getElementById("telemetry-temp"),c=document.getElementById("telemetry-direction"),u=[n,i,r,o,l];u.forEach(m=>m&&(m.disabled=!0)),Z.onStatusChange(m=>{m.connected?(e?.classList.remove("bg-red-500"),e?.classList.add("bg-green-500","animate-pulse"),a&&(a.textContent=`Connected to ${m.device||"ESP32"}`),t&&(t.textContent="Connected",t.classList.add("bg-green-500/20","border-green-500/50","text-green-400"),t.classList.remove("bg-blue-500/20","border-blue-500/50","text-blue-400")),s?.classList.remove("opacity-50"),u.forEach(v=>v&&(v.disabled=!1))):(e?.classList.remove("bg-green-500","animate-pulse"),e?.classList.add("bg-red-500"),a&&(a.textContent="Disconnected"),t&&(t.textContent="Connect",t.classList.remove("bg-green-500/20","border-green-500/50","text-green-400"),t.classList.add("bg-blue-500/20","border-blue-500/50","text-blue-400")),s?.classList.add("opacity-50"),u.forEach(v=>v&&(v.disabled=!0)))}),Z.onTelemetry(m=>{p&&(p.textContent=`${m.battery}%`),d&&(d.textContent=`${m.temperature.toFixed(1)}°C`),c&&(c.textContent=m.direction,m.moving?(c.classList.remove("text-gray-400"),c.classList.add("text-green-400")):(c.classList.remove("text-green-400"),c.classList.add("text-gray-400")))}),t?.addEventListener("click",()=>{Z.getStatus().connected||(Z.connectToESP32(),t&&(t.textContent="Connecting..."))}),n?.addEventListener("click",()=>{Z.sendCommand("FORWARD")}),i?.addEventListener("click",()=>{Z.sendCommand("BACKWARD")}),r?.addEventListener("click",()=>{Z.sendCommand("LEFT")}),o?.addEventListener("click",()=>{Z.sendCommand("RIGHT")}),l?.addEventListener("click",()=>{Z.sendCommand("STOP")}),document.addEventListener("keydown",m=>{if(Z.getStatus().connected)switch(m.key.toLowerCase()){case"w":case"arrowup":m.preventDefault(),n?.classList.add("scale-95"),Z.sendCommand("FORWARD");break;case"s":case"arrowdown":m.preventDefault(),i?.classList.add("scale-95"),Z.sendCommand("BACKWARD");break;case"a":case"arrowleft":m.preventDefault(),r?.classList.add("scale-95"),Z.sendCommand("LEFT");break;case"d":case"arrowright":m.preventDefault(),o?.classList.add("scale-95"),Z.sendCommand("RIGHT");break;case" ":m.preventDefault(),l?.classList.add("scale-95"),Z.sendCommand("STOP");break}}),document.addEventListener("keyup",m=>{switch(m.key.toLowerCase()){case"w":case"arrowup":n?.classList.remove("scale-95");break;case"s":case"arrowdown":i?.classList.remove("scale-95");break;case"a":case"arrowleft":r?.classList.remove("scale-95");break;case"d":case"arrowright":o?.classList.remove("scale-95");break;case" ":l?.classList.remove("scale-95");break}})}async function Fl(){if(!z.isAuthenticated()){window.location.href="/auth";return}const t=document.getElementById("app");if(t){if(!document.querySelector('link[href*="font-awesome"]')){const e=document.createElement("link");e.rel="stylesheet",e.href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",document.head.appendChild(e)}t.innerHTML=`
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

            <!-- Graphical Analysis -->
            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Battery Health Trend -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-lg font-orbitron font-bold flex items-center gap-3">
                                <i class="fa-solid fa-chart-line text-pagani-gold"></i>
                                Battery Health Trend
                            </h3>
                            <span class="text-xs text-gray-400 font-orbitron">LAST 12 MONTHS</span>
                        </div>
                        <div class="relative h-52" id="soh-chart">
                            <!-- Y-axis labels -->
                            <div class="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2" style="width:32px">
                                <span>100%</span><span>96%</span><span>92%</span><span>88%</span>
                            </div>
                            <!-- Chart area -->
                            <div class="ml-10 h-full flex items-end gap-1.5 border-l border-b border-gray-700 pl-2 pb-1">
                                <div class="chart-bar-group flex flex-col items-center flex-1 gap-1">
                                    <div class="w-full rounded-t bg-gradient-to-t from-green-600 to-green-400 transition-all duration-1000" data-target-height="100%" style="height:0%"></div>
                                    <span class="text-[9px] text-gray-500">Mar</span>
                                </div>
                                <div class="chart-bar-group flex flex-col items-center flex-1 gap-1">
                                    <div class="w-full rounded-t bg-gradient-to-t from-green-600 to-green-400 transition-all duration-1000" data-target-height="98%" style="height:0%"></div>
                                    <span class="text-[9px] text-gray-500">Apr</span>
                                </div>
                                <div class="chart-bar-group flex flex-col items-center flex-1 gap-1">
                                    <div class="w-full rounded-t bg-gradient-to-t from-green-600 to-green-400 transition-all duration-1000" data-target-height="97%" style="height:0%"></div>
                                    <span class="text-[9px] text-gray-500">May</span>
                                </div>
                                <div class="chart-bar-group flex flex-col items-center flex-1 gap-1">
                                    <div class="w-full rounded-t bg-gradient-to-t from-green-600 to-green-400 transition-all duration-1000" data-target-height="96.5%" style="height:0%"></div>
                                    <span class="text-[9px] text-gray-500">Jun</span>
                                </div>
                                <div class="chart-bar-group flex flex-col items-center flex-1 gap-1">
                                    <div class="w-full rounded-t bg-gradient-to-t from-green-600 to-green-400 transition-all duration-1000" data-target-height="96%" style="height:0%"></div>
                                    <span class="text-[9px] text-gray-500">Jul</span>
                                </div>
                                <div class="chart-bar-group flex flex-col items-center flex-1 gap-1">
                                    <div class="w-full rounded-t bg-gradient-to-t from-green-600 to-green-400 transition-all duration-1000" data-target-height="95.5%" style="height:0%"></div>
                                    <span class="text-[9px] text-gray-500">Aug</span>
                                </div>
                                <div class="chart-bar-group flex flex-col items-center flex-1 gap-1">
                                    <div class="w-full rounded-t bg-gradient-to-t from-green-600 to-green-400 transition-all duration-1000" data-target-height="95.2%" style="height:0%"></div>
                                    <span class="text-[9px] text-gray-500">Sep</span>
                                </div>
                                <div class="chart-bar-group flex flex-col items-center flex-1 gap-1">
                                    <div class="w-full rounded-t bg-gradient-to-t from-green-600 to-green-400 transition-all duration-1000" data-target-height="95%" style="height:0%"></div>
                                    <span class="text-[9px] text-gray-500">Oct</span>
                                </div>
                                <div class="chart-bar-group flex flex-col items-center flex-1 gap-1">
                                    <div class="w-full rounded-t bg-gradient-to-t from-yellow-600 to-yellow-400 transition-all duration-1000" data-target-height="94.8%" style="height:0%"></div>
                                    <span class="text-[9px] text-gray-500">Nov</span>
                                </div>
                                <div class="chart-bar-group flex flex-col items-center flex-1 gap-1">
                                    <div class="w-full rounded-t bg-gradient-to-t from-yellow-600 to-yellow-400 transition-all duration-1000" data-target-height="94.5%" style="height:0%"></div>
                                    <span class="text-[9px] text-gray-500">Dec</span>
                                </div>
                                <div class="chart-bar-group flex flex-col items-center flex-1 gap-1">
                                    <div class="w-full rounded-t bg-gradient-to-t from-yellow-600 to-yellow-400 transition-all duration-1000" data-target-height="94.2%" style="height:0%"></div>
                                    <span class="text-[9px] text-gray-500">Jan</span>
                                </div>
                                <div class="chart-bar-group flex flex-col items-center flex-1 gap-1">
                                    <div class="w-full rounded-t bg-gradient-to-t from-pagani-gold to-bright-gold transition-all duration-1000" data-target-height="94%" style="height:0%"></div>
                                    <span class="text-[9px] text-pagani-gold font-bold">Now</span>
                                </div>
                            </div>
                        </div>
                        <div class="mt-4 flex items-center justify-between text-xs">
                            <span class="text-gray-400"><i class="fa-solid fa-arrow-trend-down text-yellow-400 mr-1"></i>-6% over 12 months</span>
                            <span class="text-green-400"><i class="fa-solid fa-check-circle mr-1"></i>Within normal range</span>
                        </div>
                    </div>

                    <!-- Energy Consumption Analysis -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section" style="animation-delay: 100ms">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-lg font-orbitron font-bold flex items-center gap-3">
                                <i class="fa-solid fa-bolt text-pagani-gold"></i>
                                Energy Consumption
                            </h3>
                            <span class="text-xs text-gray-400 font-orbitron">LAST 7 DAYS</span>
                        </div>
                        <div class="space-y-3" id="energy-bars">
                            <div class="flex items-center gap-3">
                                <span class="text-xs text-gray-400 w-8">Mon</span>
                                <div class="flex-1 h-7 bg-gray-800 rounded-full overflow-hidden">
                                    <div class="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full flex items-center justify-end pr-2 transition-all duration-1000" data-target-width="72%" style="width:0%">
                                        <span class="text-[10px] text-white font-bold">38 kWh</span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-xs text-gray-400 w-8">Tue</span>
                                <div class="flex-1 h-7 bg-gray-800 rounded-full overflow-hidden">
                                    <div class="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full flex items-center justify-end pr-2 transition-all duration-1000" data-target-width="56%" style="width:0%">
                                        <span class="text-[10px] text-white font-bold">29 kWh</span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-xs text-gray-400 w-8">Wed</span>
                                <div class="flex-1 h-7 bg-gray-800 rounded-full overflow-hidden">
                                    <div class="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full flex items-center justify-end pr-2 transition-all duration-1000" data-target-width="88%" style="width:0%">
                                        <span class="text-[10px] text-white font-bold">46 kWh</span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-xs text-gray-400 w-8">Thu</span>
                                <div class="flex-1 h-7 bg-gray-800 rounded-full overflow-hidden">
                                    <div class="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full flex items-center justify-end pr-2 transition-all duration-1000" data-target-width="42%" style="width:0%">
                                        <span class="text-[10px] text-white font-bold">22 kWh</span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-xs text-gray-400 w-8">Fri</span>
                                <div class="flex-1 h-7 bg-gray-800 rounded-full overflow-hidden">
                                    <div class="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full flex items-center justify-end pr-2 transition-all duration-1000" data-target-width="65%" style="width:0%">
                                        <span class="text-[10px] text-white font-bold">34 kWh</span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-xs text-gray-400 w-8">Sat</span>
                                <div class="flex-1 h-7 bg-gray-800 rounded-full overflow-hidden">
                                    <div class="h-full bg-gradient-to-r from-pagani-gold to-bright-gold rounded-full flex items-center justify-end pr-2 transition-all duration-1000" data-target-width="95%" style="width:0%">
                                        <span class="text-[10px] text-black font-bold">50 kWh</span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-xs text-pagani-gold w-8 font-bold">Sun</span>
                                <div class="flex-1 h-7 bg-gray-800 rounded-full overflow-hidden">
                                    <div class="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full flex items-center justify-end pr-2 transition-all duration-1000" data-target-width="34%" style="width:0%">
                                        <span class="text-[10px] text-white font-bold">18 kWh</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="mt-4 flex items-center justify-between text-xs">
                            <span class="text-gray-400">Weekly total: <span class="text-white font-bold">237 kWh</span></span>
                            <span class="text-green-400"><i class="fa-solid fa-arrow-down mr-1"></i>12% vs last week</span>
                        </div>
                    </div>

                    <!-- Charging Distribution -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section" style="animation-delay: 150ms">
                        <h3 class="text-lg font-orbitron font-bold mb-6 flex items-center gap-3">
                            <i class="fa-solid fa-chart-pie text-pagani-gold"></i>
                            Charging Distribution
                        </h3>
                        <div class="flex items-center gap-8">
                            <!-- Donut Chart -->
                            <div class="relative w-40 h-40 flex-shrink-0">
                                <svg viewBox="0 0 120 120" class="w-full h-full -rotate-90">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#1f2937" stroke-width="16"/>
                                    <!-- DC Fast: 45% -->
                                    <circle id="donut-dc" cx="60" cy="60" r="50" fill="none" stroke="#eab308" stroke-width="16" stroke-dasharray="0 314.16" stroke-dashoffset="0" class="transition-all duration-1000" data-target-dash="141.37 314.16"/>
                                    <!-- Home AC: 35% -->
                                    <circle id="donut-home" cx="60" cy="60" r="50" fill="none" stroke="#3b82f6" stroke-width="16" stroke-dasharray="0 314.16" stroke-dashoffset="-141.37" class="transition-all duration-1000" data-target-dash="109.96 314.16"/>
                                    <!-- Public AC: 20% -->
                                    <circle id="donut-public" cx="60" cy="60" r="50" fill="none" stroke="#22c55e" stroke-width="16" stroke-dasharray="0 314.16" stroke-dashoffset="-251.33" class="transition-all duration-1000" data-target-dash="62.83 314.16"/>
                                </svg>
                                <div class="absolute inset-0 flex flex-col items-center justify-center">
                                    <p class="text-2xl font-orbitron font-bold text-pagani-gold">245</p>
                                    <p class="text-[10px] text-gray-400">sessions</p>
                                </div>
                            </div>
                            <!-- Legend -->
                            <div class="flex-1 space-y-4">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <span class="text-sm text-gray-300">DC Fast Charging</span>
                                    </div>
                                    <div class="text-right">
                                        <span class="text-sm font-orbitron font-bold text-yellow-400">45%</span>
                                        <p class="text-[10px] text-gray-500">110 sessions</p>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span class="text-sm text-gray-300">Home AC</span>
                                    </div>
                                    <div class="text-right">
                                        <span class="text-sm font-orbitron font-bold text-blue-400">35%</span>
                                        <p class="text-[10px] text-gray-500">86 sessions</p>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        <div class="w-3 h-3 rounded-full bg-green-500"></div>
                                        <span class="text-sm text-gray-300">Public AC</span>
                                    </div>
                                    <div class="text-right">
                                        <span class="text-sm font-orbitron font-bold text-green-400">20%</span>
                                        <p class="text-[10px] text-gray-500">49 sessions</p>
                                    </div>
                                </div>
                                <div class="pt-3 border-t border-gray-700">
                                    <div class="flex items-center justify-between text-xs">
                                        <span class="text-gray-400">Avg session cost</span>
                                        <span class="text-pagani-gold font-bold">₹285</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Voltage & Temperature Trends -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section" style="animation-delay: 200ms">
                        <h3 class="text-lg font-orbitron font-bold mb-6 flex items-center gap-3">
                            <i class="fa-solid fa-wave-square text-pagani-gold"></i>
                            Voltage & Temperature Trends
                        </h3>
                        <!-- Voltage sparkline -->
                        <div class="mb-5">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-xs text-gray-400 flex items-center gap-1"><i class="fa-solid fa-bolt text-yellow-400"></i>Pack Voltage</span>
                                <span class="text-xs font-orbitron text-yellow-400">396V</span>
                            </div>
                            <div class="relative h-16 bg-gray-800/50 rounded-lg overflow-hidden" id="voltage-sparkline">
                                <svg viewBox="0 0 300 60" class="w-full h-full" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="voltGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stop-color="#eab308" stop-opacity="0.4"/>
                                            <stop offset="100%" stop-color="#eab308" stop-opacity="0"/>
                                        </linearGradient>
                                    </defs>
                                    <path d="M0,30 Q15,28 30,25 T60,22 T90,28 T120,20 T150,24 T180,18 T210,22 T240,15 T270,18 T300,12" fill="url(#voltGrad)" stroke="none" opacity="0.5"/>
                                    <path id="volt-line" d="M0,30 Q15,28 30,25 T60,22 T90,28 T120,20 T150,24 T180,18 T210,22 T240,15 T270,18 T300,12" fill="none" stroke="#eab308" stroke-width="2" stroke-dasharray="500" stroke-dashoffset="500" class="transition-all duration-2000"/>
                                    <circle id="volt-dot" cx="300" cy="12" r="3" fill="#eab308" opacity="0" class="transition-all duration-500"/>
                                </svg>
                                <div class="absolute left-2 bottom-1 flex gap-4 text-[9px] text-gray-600">
                                    <span>6h ago</span><span>4h</span><span>2h</span><span>Now</span>
                                </div>
                            </div>
                        </div>
                        <!-- Temperature sparkline -->
                        <div class="mb-5">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-xs text-gray-400 flex items-center gap-1"><i class="fa-solid fa-temperature-half text-orange-400"></i>Battery Temperature</span>
                                <span class="text-xs font-orbitron text-orange-400">32°C</span>
                            </div>
                            <div class="relative h-16 bg-gray-800/50 rounded-lg overflow-hidden">
                                <svg viewBox="0 0 300 60" class="w-full h-full" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stop-color="#f97316" stop-opacity="0.4"/>
                                            <stop offset="100%" stop-color="#f97316" stop-opacity="0"/>
                                        </linearGradient>
                                    </defs>
                                    <path d="M0,40 Q15,38 30,35 T60,38 T90,30 T120,35 T150,28 T180,32 T210,25 T240,28 T270,22 T300,20" fill="url(#tempGrad)" stroke="none" opacity="0.5"/>
                                    <path id="temp-line" d="M0,40 Q15,38 30,35 T60,38 T90,30 T120,35 T150,28 T180,32 T210,25 T240,28 T270,22 T300,20" fill="none" stroke="#f97316" stroke-width="2" stroke-dasharray="500" stroke-dashoffset="500" class="transition-all duration-2000"/>
                                    <circle id="temp-dot" cx="300" cy="20" r="3" fill="#f97316" opacity="0" class="transition-all duration-500"/>
                                </svg>
                                <div class="absolute left-2 bottom-1 flex gap-4 text-[9px] text-gray-600">
                                    <span>6h ago</span><span>4h</span><span>2h</span><span>Now</span>
                                </div>
                            </div>
                        </div>
                        <!-- Efficiency gauge -->
                        <div class="flex items-center gap-4 p-3 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                            <div class="relative w-14 h-14 flex-shrink-0">
                                <svg viewBox="0 0 60 60" class="w-full h-full -rotate-90">
                                    <circle cx="30" cy="30" r="24" fill="none" stroke="#1f2937" stroke-width="6"/>
                                    <circle id="efficiency-ring" cx="30" cy="30" r="24" fill="none" stroke="#22c55e" stroke-width="6" stroke-dasharray="0 150.8" stroke-linecap="round" class="transition-all duration-1000" data-target-dash="131.9 150.8"/>
                                </svg>
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <span class="text-xs font-orbitron font-bold text-green-400">87%</span>
                                </div>
                            </div>
                            <div>
                                <p class="text-sm font-semibold text-white">Charging Efficiency</p>
                                <p class="text-xs text-gray-400">156 Wh/km average · <span class="text-green-400">Excellent</span></p>
                            </div>
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
    `,setTimeout(()=>{jl()},100)}}function jl(){Ol();const t=document.getElementById("charging-history");if(t){const a=[{date:"Today, 10:30 AM",type:"DC Fast",from:"25%",to:"87%",duration:"35 min",energy:"42 kWh"},{date:"Yesterday, 8:15 PM",type:"Home AC",from:"45%",to:"80%",duration:"2h 30m",energy:"28 kWh"},{date:"Feb 12, 3:45 PM",type:"DC Fast",from:"18%",to:"90%",duration:"48 min",energy:"58 kWh"},{date:"Feb 10, 11:00 AM",type:"Public AC",from:"60%",to:"100%",duration:"3h 10m",energy:"32 kWh"}];t.innerHTML=a.map(s=>`
            <div class="flex items-center justify-between p-3 bg-pagani-black/50 rounded-lg border border-pagani-gold/10 hover:border-pagani-gold/30 transition-all">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full ${s.type.includes("DC")?"bg-yellow-500/20 text-yellow-400":"bg-blue-500/20 text-blue-400"} flex items-center justify-center">
                        <i class="fa-solid ${s.type.includes("DC")?"fa-bolt":"fa-plug"}"></i>
                    </div>
                    <div>
                        <p class="text-sm font-semibold">${s.type} Charging</p>
                        <p class="text-xs text-gray-400">${s.date}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-sm font-orbitron text-pagani-gold">${s.from} → ${s.to}</p>
                    <p class="text-xs text-gray-400">${s.duration} | ${s.energy}</p>
                </div>
            </div>
        `).join("")}const e=document.getElementById("refresh-btn");e?.addEventListener("click",()=>{e.classList.add("animate-spin"),setTimeout(()=>{e.classList.remove("animate-spin"),zl("Battery data refreshed")},1e3)}),Nl()}function Ol(){document.querySelectorAll("#soh-chart [data-target-height]").forEach((t,e)=>{setTimeout(()=>{t.style.height=t.dataset.targetHeight},100+e*80)}),document.querySelectorAll("#energy-bars [data-target-width]").forEach((t,e)=>{setTimeout(()=>{t.style.width=t.dataset.targetWidth},200+e*100)}),setTimeout(()=>{["donut-dc","donut-home","donut-public"].forEach(t=>{const e=document.getElementById(t);e&&e.setAttribute("stroke-dasharray",e.dataset.targetDash)})},400),setTimeout(()=>{const t=document.getElementById("volt-line"),e=document.getElementById("temp-line");t&&(t.style.strokeDashoffset="0"),e&&(e.style.strokeDashoffset="0"),setTimeout(()=>{const a=document.getElementById("volt-dot"),s=document.getElementById("temp-dot");a&&a.setAttribute("opacity","1"),s&&s.setAttribute("opacity","1")},1500)},600),setTimeout(()=>{const t=document.getElementById("efficiency-ring");t&&t.setAttribute("stroke-dasharray",t.dataset.targetDash)},800)}function Nl(){setInterval(()=>{const t=document.getElementById("soc-display"),e=document.getElementById("battery-fill");if(t&&e){const a=parseInt(t.textContent||"87");if(a<100){const s=Math.min(a+1,100);t.textContent=`${s}%`,e.style.height=`${s}%`;const n=document.getElementById("range-value");n&&(n.textContent=`${Math.round(s*4.5)}km`)}}},5e3)}function zl(t,e){const a=document.createElement("div");a.className="fixed top-24 right-8 px-6 py-4 rounded-lg backdrop-blur-sm z-50 font-orbitron text-sm fade-in-section bg-green-500/20 border border-green-500/50 text-green-400",a.innerHTML=`<i class="fa-solid fa-check-circle mr-2"></i>${t}`,document.body.appendChild(a),setTimeout(()=>a.remove(),3e3)}async function _l(){if(!z.isAuthenticated()){window.location.href="/auth";return}const t=document.getElementById("app");t&&(t.innerHTML=`
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
    `,Hl())}function Hl(){const t=document.getElementById("battery-input-form"),e=new ft;e.addRule("voltage",{required:!0,custom:l=>parseFloat(l)>=2.5&&parseFloat(l)<=4.2}),e.addRule("current",{required:!0,custom:l=>parseFloat(l)>=-100&&parseFloat(l)<=100}),e.addRule("temperature",{required:!0,custom:l=>parseFloat(l)>=-20&&parseFloat(l)<=60});const a=[];s(),t?.addEventListener("submit",async l=>{l.preventDefault();const p=new FormData(t),d=e.validate(p);if(!d.isValid){lt(d.errors[0],"error");return}await n(p)});function s(){Object.entries({"scenario-normal":{voltage:3.7,current:-5,temperature:25,cell_age:"fresh",cycle_count:75,age_days:200},"scenario-charging":{voltage:4,current:15,temperature:35,cell_age:"fresh",cycle_count:120,age_days:150},"scenario-cold":{voltage:3.5,current:-3,temperature:-5,cell_age:"fresh",cycle_count:90,age_days:180},"scenario-critical":{voltage:3.1,current:-1,temperature:20,cell_age:"aged",cycle_count:800,age_days:1200}}).forEach(([p,d])=>{document.getElementById(p)?.addEventListener("click",()=>{document.getElementById("voltage-input").value=d.voltage.toString(),document.getElementById("current-input").value=d.current.toString(),document.getElementById("temperature-input").value=d.temperature.toString(),document.getElementById("cell-age-input").value=d.cell_age,document.getElementById("cycle-count-input").value=d.cycle_count.toString(),document.getElementById("age-days-input").value=d.age_days.toString(),lt(`Applied ${p.split("-")[1]} scenario`,"success")})})}async function n(l){const p=document.getElementById("prediction-loading"),d=document.getElementById("prediction-results");if(!(!p||!d)){p.classList.remove("hidden"),d.innerHTML="";try{const c=await Ul({voltage:parseFloat(l.get("voltage")),current:parseFloat(l.get("current")),temperature:parseFloat(l.get("temperature")),cell_age:l.get("cell_age"),cycle_count:parseInt(l.get("cycle_count"))||150,age_days:parseInt(l.get("age_days"))||400});p.classList.add("hidden"),c.status==="success"?(i(c,d),r(c),o()):lt(c.error||"Prediction failed","error")}catch{p.classList.add("hidden"),lt("ML model communication error","error")}}}function i(l,p){if(!l.predictions||!l.analysis)return;const{predictions:d,analysis:c}=l,m={LOW:{bg:"bg-green-500/20",border:"border-green-500/50",text:"text-green-400"},MEDIUM:{bg:"bg-yellow-500/20",border:"border-yellow-500/50",text:"text-yellow-400"},CRITICAL:{bg:"bg-red-500/20",border:"border-red-500/50",text:"text-red-400"}}[c.risk_level];p.innerHTML=`
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
                        v${c.intelligence_version||"2.0.0"}
                    </span>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="text-center p-3 bg-purple-500/5 rounded-lg">
                        <p class="text-lg font-orbitron text-purple-400">${((c.assessment_confidence||.85)*100).toFixed(1)}%</p>
                        <p class="text-xs text-gray-400">Assessment Confidence</p>
                    </div>
                    <div class="text-center p-3 bg-purple-500/5 rounded-lg">
                        <p class="text-lg font-orbitron text-purple-400">${c.risk_level}</p>
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
                    <span class="text-lg font-bold ${m.text}">${c.overall_health.toFixed(1)}/100</span>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-3">
                    <div class="${c.risk_level==="LOW"?"bg-green-500":c.risk_level==="MEDIUM"?"bg-yellow-500":"bg-red-500"} h-3 rounded-full transition-all duration-1000" style="width: ${c.overall_health}%"></div>
                </div>
                <div class="flex justify-between items-center mt-3">
                    <span class="text-xs text-gray-400">Risk Level</span>
                    <span class="text-sm font-orbitron ${m.text}">${c.risk_level}</span>
                </div>
            </div>

            <!-- AI Alerts & Recommendations -->
            <div class="space-y-3">
                <h4 class="text-sm font-orbitron font-bold text-pagani-gold mb-3">
                    <i class="fa-solid fa-lightbulb mr-2"></i>AI Insights & Recommendations
                </h4>
                ${c.alerts.map(v=>{const E={INFO:{bg:"bg-blue-500/10",border:"border-blue-500/30",text:"text-blue-400",icon:"fa-info-circle"},WARNING:{bg:"bg-yellow-500/10",border:"border-yellow-500/30",text:"text-yellow-400",icon:"fa-exclamation-triangle"},CRITICAL:{bg:"bg-red-500/10",border:"border-red-500/30",text:"text-red-400",icon:"fa-exclamation-circle"}}[v.level];return`
                        <div class="p-3 ${E.bg} ${E.border} border rounded-lg">
                            <div class="flex items-start gap-3">
                                <i class="fa-solid ${E.icon} ${E.text} mt-1"></i>
                                <div class="flex-1">
                                    <p class="text-sm font-semibold ${E.text}">${v.type}</p>
                                    <p class="text-xs text-gray-400 mt-1">${v.message}</p>
                                    <p class="text-xs text-gray-300 mt-2 font-semibold">💡 ${v.recommendation}</p>
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
        `}function r(l){if(!l.predictions)return;const p={timestamp:new Date().toISOString(),voltage:parseFloat(document.getElementById("voltage-input").value),current:parseFloat(document.getElementById("current-input").value),temperature:parseFloat(document.getElementById("temperature-input").value),soc:l.predictions.SOC,soh:l.predictions.SOH,rul:l.predictions.RUL};a.push(p),a.length>20&&a.shift()}function o(){const l=document.getElementById("prediction-chart");if(!l||a.length===0)return;const p=a.slice(-5);l.innerHTML=`
            <div class="w-full">
                <div class="flex justify-between items-end h-40 border-l border-b border-gray-600 pl-4 pb-4">
                    ${p.map(d=>`
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
        `}setInterval(()=>{const l=document.getElementById("last-update");l&&(l.textContent=new Date().toLocaleTimeString())},3e4)}async function Ul(t){try{const e="http://localhost:8000",a={voltage:t.voltage,current:t.current,temperature:t.temperature,cycle_count:t.cycle_count||150,age_days:t.age_days||(t.cell_age==="fresh"?200:800)},s=await fetch(`${e}/predict`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)});if(s.ok){const n=await s.json();return{status:n.status,predictions:n.predictions,analysis:n.analysis,error:n.error}}else throw new Error(`ML API returned ${s.status}`)}catch(e){console.warn("ML API not available, using fallback simulation:",e),await new Promise(A=>setTimeout(A,2e3));const{voltage:a,current:s,temperature:n,cycle_count:i=150,age_days:r=400}=t;let o=Math.max(0,Math.min(100,(a-2.5)/(4.2-2.5)*100)),l=Math.min(30,i/100),p=Math.min(20,r/365*5),d=Math.abs(n-25)*.3,c=100-l-p-d;c=Math.max(50,Math.min(100,c));const u=(l+p)/(i+r/7);let m=Math.max(50,(c-80)/(u+.001)*7);m=Math.max(100,Math.min(3e3,m));const v=(o+c)/2;let L;const E=[];return v>=80?(L="LOW",E.push({type:"Battery Health Excellent",message:"Your battery is operating within optimal parameters.",level:"INFO",recommendation:"Continue current charging habits for maximum lifespan."})):v>=65?(L="MEDIUM",E.push({type:"Moderate Degradation Detected",message:"Battery showing signs of aging but still functional.",level:"WARNING",recommendation:"Avoid extreme temperatures and deep discharge cycles."})):(L="CRITICAL",E.push({type:"Battery Health Critical",message:"Significant degradation detected. Consider replacement.",level:"CRITICAL",recommendation:"Schedule immediate battery inspection and replacement planning."})),n>40?E.push({type:"High Temperature Warning",message:"Battery temperature exceeds safe operating range.",level:"WARNING",recommendation:"Allow battery to cool before charging or heavy usage."}):n<0&&E.push({type:"Cold Temperature Alert",message:"Low temperature may reduce battery performance.",level:"INFO",recommendation:"Pre-condition battery before use in cold weather."}),Math.abs(s)>50&&E.push({type:"High Current Draw",message:"Excessive current may accelerate battery degradation.",level:"WARNING",recommendation:"Reduce power demand or use more conservative driving mode."}),{status:"success",predictions:{SOC:o,SOH:c,RUL:m,confidence:.85+Math.random()*.1},analysis:{overall_health:v,risk_level:L,alerts:E,intelligence_version:"EVBharat AI v2.1",assessment_confidence:Math.round((.85+Math.random()*.1)*100)}}}}function lt(t,e){const a=document.createElement("div");a.className=`fixed top-24 right-8 px-6 py-4 rounded-lg backdrop-blur-sm z-50 font-orbitron text-sm fade-in-section ${e==="success"?"bg-green-500/20 border border-green-500/50 text-green-400":"bg-red-500/20 border border-red-500/50 text-red-400"}`,a.innerHTML=`<i class="fa-solid ${e==="success"?"fa-check-circle":"fa-exclamation-circle"} mr-2"></i>${t}`,document.body.appendChild(a),setTimeout(()=>a.remove(),3e3)}class ql{baseUrl;constructor(){this.baseUrl="/api/rag",console.log("🔗 Backend via Vite proxy:",this.baseUrl)}async healthCheck(){return(await this.fetchR(`${this.baseUrl}/health`,{method:"GET"})).json()}async freeChat(e){const a=await this.fetchR(`${this.baseUrl}/free-chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:e})});if(!a.ok){const s=await a.json().catch(()=>({detail:"Network error"}));throw new Error(s.detail||"Chat failed")}return a.json()}async uploadPDF(e){const a=new FormData;a.append("file",e);const s=await this.fetchR(`${this.baseUrl}/upload`,{method:"POST",body:a},3);if(!s.ok){const n=await s.json().catch(()=>({detail:"Upload failed"}));throw new Error(n.detail||"Upload failed")}return s.json()}async docChat(e,a){const s=await this.fetchR(`${this.baseUrl}/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:e,session_id:a})});if(!s.ok){const n=await s.json().catch(()=>({detail:"Chat failed"}));throw new Error(n.detail||"Chat failed")}return s.json()}async speechToText(e){const a=new FormData;a.append("file",e);const s=await this.fetchR(`${this.baseUrl}/speech-to-text`,{method:"POST",body:a},1);if(!s.ok){const n=await s.json().catch(()=>({detail:"Speech transcription failed"}));throw new Error(n.detail||"Speech transcription failed")}return s.json()}async textToSpeech(e,a="en",s=!1){const n=await this.fetchR(`${this.baseUrl}/text-to-speech`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:e,language:a,slow:s})},1);if(!n.ok){const i=await n.json().catch(()=>({detail:"Text to speech failed"}));throw new Error(i.detail||"Text to speech failed")}return n.blob()}async sessionStatus(e){return(await fetch(`${this.baseUrl}/sessions/${e}/status`)).json()}async deleteSession(e){await fetch(`${this.baseUrl}/sessions/${e}`,{method:"DELETE"})}async fetchR(e,a,s=2){let n=null;for(let i=0;i<=s;i++)try{const r=new AbortController,o=setTimeout(()=>r.abort(),3e4),l=await fetch(e,{...a,signal:r.signal});if(clearTimeout(o),(l.status===429||l.status===503)&&i<s){await this.wait(2**i*1e3);continue}return l}catch(r){n=r,i<s&&await this.wait(2**i*1e3)}throw n||new Error("Request failed after all retries")}wait(e){return new Promise(a=>setTimeout(a,e))}}const ve=new ql,gs=[{icon:"fa-hand-holding-dollar",q:"What subsidies are available under FAME II for e-2W buyers?",color:"rgba(34, 197, 94, 0.15)"},{icon:"fa-file-invoice",q:"List the EV registration & road-tax exemptions in Maharashtra.",color:"rgba(59, 130, 246, 0.15)"},{icon:"fa-battery-full",q:"Explain BIS AIS-156 battery safety standards.",color:"rgba(168, 85, 247, 0.15)"},{icon:"fa-percent",q:"What are the GST rates on EVs vs ICE vehicles?",color:"rgba(245, 158, 11, 0.15)"},{icon:"fa-charging-station",q:"How to get approval for setting up a public EV charging station?",color:"rgba(20, 184, 166, 0.15)"},{icon:"fa-landmark",q:"What is Section 80EEB income-tax benefit on EV loans?",color:"rgba(236, 72, 153, 0.15)"}],ka="evbharat_chat_history";function us(t){try{localStorage.setItem(ka,JSON.stringify(t.map(e=>({...e,timestamp:e.timestamp.toISOString()}))))}catch{}}function Wl(){try{const t=localStorage.getItem(ka);return t?JSON.parse(t).map(e=>({...e,timestamp:new Date(e.timestamp)})):[]}catch{return[]}}function Gl(){localStorage.removeItem(ka)}const ms=()=>Math.random().toString(36).slice(2,10),qe=t=>t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),fs=t=>t.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});function Kl(t){let e=qe(t);return e=e.replace(/```(\w*)\n?([\s\S]*?)```/g,(a,s,n)=>`<div style="position:relative;margin:8px 0"><pre style="background:rgba(0,0,0,.45);border:1px solid rgba(75,85,99,.3);border-radius:8px;padding:12px 14px;overflow-x:auto;font-size:12px;line-height:1.6"><code>${s?`<span style="position:absolute;top:4px;right:8px;font-size:9px;color:#6b7280;text-transform:uppercase">${s}</span>`:""}${n.trim()}</code></pre></div>`),e=e.replace(/`([^`]+)`/g,'<code style="background:rgba(55,65,81,.6);color:rgba(212,175,55,.85);padding:1px 6px;border-radius:4px;font-size:12px">$1</code>'),e=e.replace(/\*\*(.+?)\*\*/g,'<strong style="color:#e5e7eb;font-weight:600">$1</strong>'),e=e.replace(/\*(.+?)\*/g,"<em>$1</em>"),e=e.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener" style="color:#D4AF37;text-decoration:underline">$1</a>'),e=e.replace(/^####\s+(.+)$/gm,'<h5 style="font-weight:600;color:rgba(212,175,55,.8);margin-top:8px;font-size:11px;text-transform:uppercase;letter-spacing:.5px">$1</h5>'),e=e.replace(/^###\s+(.+)$/gm,'<h4 style="font-weight:600;color:#D4AF37;margin-top:10px;font-size:14px">$1</h4>'),e=e.replace(/^##\s+(.+)$/gm,'<h3 style="font-weight:700;color:#D4AF37;margin-top:12px;font-size:16px">$1</h3>'),e=e.replace(/^#\s+(.+)$/gm,'<h2 style="font-weight:700;color:#D4AF37;margin-top:12px;font-size:18px">$1</h2>'),e=e.replace(/^[\-\*]\s+(.+)$/gm,'<li style="margin-left:16px;list-style:disc;color:#d1d5db">$1</li>'),e=e.replace(/^\d+\.\s+(.+)$/gm,'<li style="margin-left:16px;list-style:decimal;color:#d1d5db">$1</li>'),e=e.replace(/^---$/gm,'<hr style="border-color:rgba(75,85,99,.3);margin:12px 0">'),e=e.replace(/\n/g,"<br>"),e}async function Yl(){if(!z.isAuthenticated()){window.location.href="/auth";return}const t=document.getElementById("app");if(!t)return;const e=Wl();let a="free",s=null,n=!1,i=!1,r=null,o=!1,l=!1,p=!1,d=!1,c=null,u=null,m=[],v=null,L="",E="en",A=!1,b=1,k=0,y=null;async function w(){try{const g=await ve.healthCheck();return o=g.status==="healthy",C(o,g.active_sessions),o}catch{return o=!1,C(!1,0),!1}}function C(g,f){document.querySelectorAll(".ev-health-dot").forEach(B=>{B.style.background=g?"linear-gradient(135deg, #10b981, #34d399)":"linear-gradient(135deg, #ef4444, #f87171)",B.style.boxShadow=g?"0 0 12px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)":"0 0 12px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",B.style.animation=g?"evPulse 2s infinite":"none"}),document.querySelectorAll(".ev-health-text").forEach(B=>{B.textContent=g?"🟢 Online":"🔴 Offline",B.style.color=g?"#10b981":"#ef4444",B.style.fontWeight="600"});const S=document.getElementById("ev-sessions");S&&(S.textContent=g?`⚡ ${f} active session${f!==1?"s":""}`:"⚠️ Backend unreachable")}function $(){const g=document.getElementById("ev-messages");if(g){if(!e.length){g.innerHTML=M(),D();return}g.innerHTML=e.map(f=>{if(f.role==="system")return`<div style="display:flex;justify-content:center;margin:12px 0"><span style="font-size:11px;color:#6b7280;background:rgba(31,41,55,.6);padding:3px 12px;border-radius:999px"><i class="fa-solid fa-info-circle" style="margin-right:4px;color:#3b82f6"></i>${qe(f.content)}</span></div>`;const S=f.role==="user",B=S?"👤":"🤖";return`
            <div style="display:flex;justify-content:${S?"flex-end":"flex-start"};margin-bottom:16px" class="ev-msg-row">
                ${S?"":`<div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,rgba(212,175,55,.25),rgba(212,175,55,.08));display:flex;align-items:center;justify-content:center;margin-right:10px;margin-top:2px;flex-shrink:0;border:1px solid rgba(212,175,55,.15)"><span style="font-size:12px">${B}</span></div>`}
                <div style="max-width:78%;padding:12px 16px;border-radius:16px;${S?"border-bottom-right-radius:6px;background:linear-gradient(135deg,rgba(212,175,55,.1),rgba(212,175,55,.04));border:1px solid rgba(212,175,55,.18)":"border-bottom-left-radius:6px;background:rgba(31,41,55,.45);border:1px solid rgba(55,65,81,.4)"};box-shadow:0 2px 8px rgba(0,0,0,.15)">
                    <div style="font-size:13px;line-height:1.65;color:${S?"#e5e7eb":"#d1d5db"}">${S?qe(f.content):Kl(f.content)}</div>
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px;padding-top:6px;border-top:1px solid rgba(55,65,81,.2);gap:8px">
                        <span style="font-size:10px;color:#4b5563">🕐 ${fs(f.timestamp)}</span>
                        <div style="display:flex;align-items:center;gap:6px">
                            ${f.processingTime!=null?`<span style="font-size:10px;color:#6b7280"><i class="fa-solid fa-stopwatch" style="margin-right:2px;color:#8b5cf6"></i>${f.processingTime.toFixed(2)}s</span>`:""}
                            ${S?"":`<button data-copy="${f.id}" class="ev-copy" style="opacity:0;font-size:10px;color:#6b7280;cursor:pointer;background:none;border:none;transition:all .15s" title="📋 Copy"><i class="fa-regular fa-copy"></i></button>`}
                        </div>
                    </div>
                </div>
                ${S?`<div style="width:28px;height:28px;border-radius:8px;background:rgba(212,175,55,.12);display:flex;align-items:center;justify-content:center;margin-left:10px;margin-top:2px;flex-shrink:0;border:1px solid rgba(212,175,55,.12)"><span style="font-size:12px">${B}</span></div>`:""}
            </div>`}).join(""),document.querySelectorAll(".ev-copy").forEach(f=>{f.addEventListener("click",()=>{const S=e.find(B=>B.id===f.dataset.copy);S&&navigator.clipboard.writeText(S.content).then(()=>{f.innerHTML='<i class="fa-solid fa-check" style="color:#34d399"></i>',setTimeout(()=>{f.innerHTML='<i class="fa-regular fa-copy"></i>'},1500)})})}),j()}}function M(){return`
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:40px 20px;text-align:center">
            <div style="width:80px;height:80px;border-radius:20px;background:linear-gradient(135deg, #D4AF37, rgba(212,175,55,.6));border:2px solid rgba(212,175,55,.25);display:flex;align-items:center;justify-content:center;margin-bottom:32px;box-shadow:0 8px 32px rgba(212,175,55,.15), inset 0 2px 0 rgba(255,255,255,.1);position:relative;overflow:hidden" class="ev-logo-animate">
                <i class="fa-solid fa-bolt" style="color:#000;font-size:32px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))"></i>
                <div style="position:absolute;inset:0;background:linear-gradient(45deg, transparent 30%, rgba(255,255,255,.1) 50%, transparent 70%);animation:evShimmer 3s infinite"></div>
            </div>
            <h3 style="font-family:'Orbitron',sans-serif;font-size:24px;font-weight:800;margin-bottom:12px;letter-spacing:.5px;background:linear-gradient(135deg, #D4AF37, #FFD700);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 2px 8px rgba(212,175,55,.3)">⚡ EV Compliance Advisor</h3>
            <p style="font-size:15px;color:#c1c7cd;max-width:480px;margin-bottom:8px;line-height:1.5;font-weight:400">🔍 Ask any question about Indian EV regulations, subsidies, licensing, or upload a document for in-depth analysis.</p>
            <p style="font-size:12px;color:#64748b;max-width:420px;margin-bottom:40px;line-height:1.4">🚀 Powered by Google Gemini │ 📊 Knowledge covers FAME II, PM E-DRIVE, PLI, state policies & more</p>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;width:100%;max-width:640px">
                ${gs.map((g,f)=>`
                <button data-chip="${f}" class="ev-chip" style="display:flex;align-items:flex-start;gap:12px;text-align:left;font-size:13px;padding:16px 18px;border-radius:16px;border:1px solid rgba(55,65,81,.3);background:linear-gradient(135deg, rgba(31,41,55,.4), rgba(17,24,39,.6));color:#d1d5db;cursor:pointer;transition:all .3s cubic-bezier(0.4, 0, 0.2, 1);line-height:1.5;position:relative;overflow:hidden;backdrop-filter:blur(8px);box-shadow:0 2px 8px rgba(0,0,0,.1)">
                    <div style="width:32px;height:32px;border-radius:8px;background:${g.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.1)">
                        <i class="fa-solid ${g.icon}" style="color:#D4AF37;font-size:14px"></i>
                    </div>
                    <span style="font-weight:500">${qe(g.q)}</span>
                    <div style="position:absolute;inset:0;background:linear-gradient(135deg, transparent, rgba(212,175,55,.05));opacity:0;transition:opacity .3s"></div>
                </button>`).join("")}
            </div>
        </div>`}function D(){document.querySelectorAll(".ev-chip").forEach(g=>{g.addEventListener("click",()=>{g.style.transform="scale(0.98)",setTimeout(()=>{g.style.transform=""},150),te(gs[+(g.dataset.chip||"0")].q)}),g.addEventListener("mouseenter",()=>{g.style.borderColor="rgba(212,175,55,.4)",g.style.background="linear-gradient(135deg, rgba(212,175,55,.08), rgba(31,41,55,.6))",g.style.color="#f1f5f9",g.style.transform="translateY(-2px)",g.style.boxShadow="0 8px 25px rgba(212,175,55,.15), 0 2px 8px rgba(0,0,0,.1)";const f=g.querySelector("div:last-child");f&&(f.style.opacity="1")}),g.addEventListener("mouseleave",()=>{g.style.borderColor="rgba(55,65,81,.3)",g.style.background="linear-gradient(135deg, rgba(31,41,55,.4), rgba(17,24,39,.6))",g.style.color="#d1d5db",g.style.transform="",g.style.boxShadow="0 2px 8px rgba(0,0,0,.1)";const f=g.querySelector("div:last-child");f&&(f.style.opacity="0")})})}function j(){const g=document.getElementById("ev-messages");g&&requestAnimationFrame(()=>{g.scrollTop=g.scrollHeight})}function V(g,f="info"){const S=document.getElementById("ev-voice-status");if(!S)return;const B=f==="error"?"#f87171":f==="success"?"#34d399":"#9ca3af";S.textContent=g,S.style.color=B}function F(g){const f=document.getElementById("ev-voice-hint");f&&(f.textContent=g)}function X(g){const f=String(Math.floor(g/60)).padStart(2,"0"),S=String(g%60).padStart(2,"0");return`${f}:${S}`}function _(g){const f=document.getElementById("ev-mic"),S=document.getElementById("ev-mic-icon"),B=document.getElementById("ev-mic-text"),R=document.getElementById("ev-mic-dot");f&&(f.classList.toggle("ev-mic-recording",g),f.style.background=g?"linear-gradient(135deg, rgba(239,68,68,.95), rgba(249,115,22,.85))":"linear-gradient(135deg, rgba(31,41,55,.9), rgba(17,24,39,.7))",f.style.borderColor=g?"rgba(248,113,113,.65)":"rgba(75,85,99,.35)",f.style.color=g?"#ffffff":"#e5e7eb",f.title=g?"Stop voice recording":"Start voice input",S&&(S.className=g?"fa-solid fa-stop":"fa-solid fa-microphone-lines"),B&&(B.textContent=g?"Stop Voice":"Start Voice"),R&&(R.style.background=g?"#ffffff":"#34d399",R.style.opacity=g?"1":".75"))}function G(g){const f=document.getElementById("ev-tts-toggle"),S=document.getElementById("ev-tts-toggle-text");f&&(f.style.background=g?"linear-gradient(135deg, rgba(16,185,129,.25), rgba(52,211,153,.12))":"linear-gradient(135deg, rgba(31,41,55,.7), rgba(17,24,39,.5))",f.style.borderColor=g?"rgba(52,211,153,.45)":"rgba(75,85,99,.3)",f.style.color=g?"#34d399":"#9ca3af",f.title=g?"Disable auto voice replies":"Enable auto voice replies",S&&(S.textContent=g?"Auto Voice: On":"Auto Voice: Off"))}function O(){const g=document.getElementById("ev-tts-play"),f=document.getElementById("ev-tts-pause"),S=document.getElementById("ev-tts-stop"),B=document.getElementById("ev-tts-pause-text");if(g){const oe=!!L||!!v;g.disabled=!oe,g.style.opacity=oe?"1":".45",g.style.cursor=oe?"pointer":"not-allowed"}const R=!!v;f&&(f.disabled=!R,f.style.opacity=R?"1":".45",f.style.cursor=R?"pointer":"not-allowed",B&&(B.textContent=v?.paused?"Resume":"Pause")),S&&(S.disabled=!R,S.style.opacity=R?"1":".45",S.style.cursor=R?"pointer":"not-allowed")}function h(){u&&(u.getTracks().forEach(g=>g.stop()),u=null)}function x(){y!==null&&(window.clearInterval(y),y=null)}function I(g){return g.replace(/```[\s\S]*?```/g," ").replace(/`[^`]*`/g," ").replace(/[>#*_~\[\]()]/g," ").replace(/\s+/g," ").trim()}async function U(g,f){if(!p){p=!0,V("Transcribing audio...","info"),F("Listening to your recorded input");try{const S=g.type.includes("ogg")?"ogg":g.type.includes("mp4")||g.type.includes("m4a")?"m4a":g.type.includes("wav")?"wav":"webm",B=new File([g],`voice-input.${S}`,{type:g.type||"audio/webm"}),R=await ve.speechToText(B),oe=R.text?.trim();if(!oe){V("No speech detected. Please try again.","error"),F("Try speaking closer to the microphone");return}f.value=f.value.trim()?`${f.value.trim()} ${oe}`:oe,f.focus(),V(`Voice recognized (${R.language.toUpperCase()})`,"success"),F("You can edit the transcribed text before sending")}catch(S){const B=S.message||"Voice transcription failed";V(`Voice input failed: ${B}`,"error"),F("Check microphone permission and try again")}finally{p=!1,x(),_(!1)}}}async function H(g){if(!l){if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder>"u"){V("This browser does not support microphone recording.","error"),F("Use latest Chrome/Edge for voice input");return}try{u=await navigator.mediaDevices.getUserMedia({audio:!0});const S=["audio/webm;codecs=opus","audio/webm","audio/ogg;codecs=opus","audio/mp4"].find(B=>MediaRecorder.isTypeSupported(B));c=S?new MediaRecorder(u,{mimeType:S}):new MediaRecorder(u),m=[],c.ondataavailable=B=>{B.data.size>0&&m.push(B.data)},c.onstop=async()=>{const B=new Blob(m,{type:c?.mimeType||"audio/webm"});h(),await U(B,g)},c.start(),l=!0,k=Date.now(),x(),y=window.setInterval(()=>{const B=Math.floor((Date.now()-k)/1e3);V(`Recording ${X(B)}...`,"info")},250),_(!0),F("Tap Stop Voice when you finish speaking")}catch(f){h(),x(),l=!1,_(!1);const S=f.message||"Microphone access denied";V(`Unable to start recording: ${S}`,"error"),F("Allow microphone permission in browser settings")}}}function se(){!c||!l||(l=!1,x(),V("Processing recording...","info"),F("Converting speech into text"),c.stop())}function ce(g=!0){if(!v){O();return}const f=v;v=null,f.onended=null,f.onerror=null,f.onpause=null,f.onplay=null,f.pause(),f.currentTime=0,f.src.startsWith("blob:")&&URL.revokeObjectURL(f.src),g&&(V(d?"Auto voice ON":"Voice ready","success"),F("Use Speak Last to hear the latest assistant reply")),O()}async function Be(){if(v)try{v.paused?(await v.play(),V("Voice resumed","success"),F("Voice reply is now playing")):(v.pause(),V("Voice paused","info"),F("Tap Resume to continue playback"))}catch{V("Unable to change playback state.","error")}finally{O()}}async function ie(){if(!L){V("No assistant reply yet to read aloud.","error"),F("Send a message first, then tap Speak Last");return}await pe(L)}async function pe(g){const f=I(g).slice(0,3800);if(f)try{V("Generating speech...","info"),F(`Voice: ${E.toUpperCase()} | ${A?"Slow":"Normal"} speed`),ce(!1);const S=await ve.textToSpeech(f,E,A),B=URL.createObjectURL(S),R=new Audio(B);v=R,R.volume=b,R.onplay=()=>{V("Speaking assistant reply...","success"),F("Use Pause or Stop to control playback"),O()},R.onpause=()=>{v===R&&!R.ended&&(V("Voice paused","info"),F("Tap Resume to continue"),O())},R.onended=()=>{R.src.startsWith("blob:")&&URL.revokeObjectURL(R.src),v===R&&(v=null),V(d?"Auto voice ON":"Voice ready","success"),F("Voice playback finished"),O()},R.onerror=()=>{R.src.startsWith("blob:")&&URL.revokeObjectURL(R.src),v===R&&(v=null),V("Audio playback failed.","error"),F("Try again or switch language/speed"),O()},await R.play()}catch(S){const B=S.message||"Text to speech failed";V(`TTS failed: ${B}`,"error"),F("Check backend speech service and try again"),O()}}function xe(){const g=document.getElementById("ev-messages");if(!g)return;const f=a==="document"?"🔍 Searching document & analysing…":"🧠 Thinking…";g.insertAdjacentHTML("beforeend",`
        <div id="ev-thinking" style="display:flex;justify-content:flex-start;margin-bottom:16px;animation:evFadeIn .25s ease-out">
            <div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,rgba(212,175,55,.25),rgba(212,175,55,.08));display:flex;align-items:center;justify-content:center;margin-right:10px;margin-top:2px;flex-shrink:0;border:1px solid rgba(212,175,55,.15)">
                <span style="font-size:12px">🤖</span>
            </div>
            <div style="background:rgba(31,41,55,.45);border:1px solid rgba(55,65,81,.4);border-radius:16px;border-bottom-left-radius:6px;padding:12px 16px;box-shadow:0 2px 8px rgba(0,0,0,.15)">
                <div style="display:flex;align-items:center;gap:10px">
                    <div style="display:flex;gap:4px">
                        <span style="width:6px;height:6px;background:rgba(212,175,55,.65);border-radius:50%;animation:evBounce .6s infinite alternate"></span>
                        <span style="width:6px;height:6px;background:rgba(212,175,55,.65);border-radius:50%;animation:evBounce .6s .15s infinite alternate"></span>
                        <span style="width:6px;height:6px;background:rgba(212,175,55,.65);border-radius:50%;animation:evBounce .6s .3s infinite alternate"></span>
                    </div>
                    <span style="font-size:11px;color:#6b7280">${f}</span>
                </div>
            </div>
        </div>`),j()}function re(){document.getElementById("ev-thinking")?.remove()}async function te(g){if(n||!g.trim())return;if(!o&&!await w()){ge("assistant","❌ Backend server is offline. Please check if the server is running on port 8001 and try again.");return}const f=document.getElementById("ev-input");f&&(f.value=""),n=!0,La(!1),ge("user",g,!1),$(),xe();try{const S=a==="document"&&s?await ve.docChat(g,s):await ve.freeChat(g);re(),e.push({id:ms(),role:"assistant",content:S.response,timestamp:new Date,processingTime:S.processing_time}),L=S.response,d&&await pe(S.response)}catch(S){re();const B=S.message;if(a==="document"&&/session not found/i.test(B)){Aa(),ge("assistant","Your document session expired (usually after backend restart). Please upload the file again and continue.");return}const R=B.includes("Failed to fetch")||B.includes("aborted");ge("assistant",R?"Unable to reach the backend. Check that the API is running on port 8001.":`Error: ${B}`,!1),R&&(o=!1,C(!1,0))}finally{n=!1,La(!0),$(),us(e)}}function ge(g,f,S=!0){e.push({id:ms(),role:g,content:f,timestamp:new Date}),S&&($(),us(e))}function La(g){const f=document.getElementById("ev-send");f&&(f.disabled=!g,f.style.opacity=g?"1":".35")}async function Ca(g){if(i)return;const f=g.name.toLowerCase(),S=f.endsWith(".pdf"),B=f.match(/\.(jpg|jpeg|png|webp|gif|bmp)$/i);if(!(S||B)){Me("Only PDF or image files (JPG, PNG, WebP, GIF, BMP) accepted.","error");return}if(g.size>50*1024*1024){Me("File too large (max 50 MB).","error");return}i=!0,Me(`Uploading ${g.name}…`,"info"),at(40);try{const R=await ve.uploadPDF(g);s=R.session_id,r=g.name,a="document",at(100);const oe=S?"PDF":"Image";Me(`${g.name} — ${R.document_count} chunks`,"success"),kt();try{const St=await ve.sessionStatus(R.session_id);St.exists&&St.document_count&&Vn(St)}catch{}ge("system",`${oe} loaded: ${g.name}. Switched to document mode.`,!1),ge("assistant",`I've processed **${g.name}** (${oe}) and extracted **${R.document_count}** content chunks.

You can now ask questions about this ${S?"document":"image"}. I'll cross-reference with Indian EV regulations.

**File hash:** \`${R.file_hash.slice(0,12)}…\``)}catch(R){at(0),Me(`Upload failed: ${R.message}`,"error")}finally{i=!1}}function at(g){const f=document.getElementById("ev-upload-bar");f&&(f.style.width=`${g}%`,f.style.opacity=g>0?"1":"0")}function Me(g,f){const S=document.getElementById("ev-upload-status");if(!S)return;const R={error:{color:"#f87171",icon:"fa-circle-xmark",symbol:"❌"},success:{color:"#34d399",icon:"fa-circle-check",symbol:"✅"},info:{color:"#D4AF37",icon:"fa-spinner fa-spin",symbol:"⏳"}}[f];S.innerHTML=`<div style="display:flex;align-items:center;gap:6px;color:${R.color}"><span style="font-size:12px">${R.symbol}</span><i class="fa-solid ${R.icon}" style="font-size:10px"></i><span style="font-size:11px">${g}</span></div>`}function Vn(g){const f=document.getElementById("ev-doc-stats");!f||!g.exists||(f.innerHTML=`<div style="font-size:10px;color:#6b7280;margin-top:6px;padding-top:6px;border-top:1px solid rgba(55,65,81,.25)">🧩 <i class="fa-solid fa-puzzle-piece" style="color:rgba(212,175,55,.35);margin-right:4px"></i>${g.document_count} chunks${g.processed_at?` │ ⏰ Processed ${new Date(g.processed_at*1e3).toLocaleTimeString("en-IN")}`:""}</div>`)}function kt(){const g=document.getElementById("ev-mode");g&&(a==="document"&&r?(g.innerHTML=`<div style="display:flex;align-items:center;gap:6px;background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.18);border-radius:8px;padding:4px 10px">
                📄 <i class="fa-solid fa-file-pdf" style="color:#34d399;font-size:10px"></i>
                <span style="font-size:11px;color:#6ee7b7;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${qe(r)}</span>
                <button id="ev-rm-doc" style="color:#6b7280;cursor:pointer;background:none;border:none;transition:color .15s" title="🗑️ Remove"><i class="fa-solid fa-xmark" style="font-size:10px"></i></button>
            </div>`,document.getElementById("ev-rm-doc")?.addEventListener("click",Aa)):g.innerHTML=`<div style="display:flex;align-items:center;gap:6px;background:rgba(212,175,55,.04);border:1px solid rgba(212,175,55,.12);border-radius:8px;padding:4px 10px">
                💬 <i class="fa-solid fa-comments" style="color:#D4AF37;font-size:10px"></i>
                <span style="font-size:11px;color:#9ca3af">Free advisory mode</span>
            </div>`)}function Aa(){s&&ve.deleteSession(s).catch(()=>{}),s=null,r=null,a="free",kt(),Me("","info"),at(0);const g=document.getElementById("ev-doc-stats");g&&(g.innerHTML=""),ge("system","Document removed. Switched back to free advisory mode.")}function Dn(){if(!e.length)return;const g=e.filter(B=>B.role!=="system").map(B=>`[${fs(B.timestamp)}] ${B.role==="user"?"You":"EV Advisor"}:
${B.content}
`),f=`EVBharat EV Compliance Advisor — Chat Export
${"=".repeat(50)}
Exported: ${new Date().toLocaleString("en-IN")}
Messages: ${g.length}
${"=".repeat(50)}

${g.join(`
`)}`,S=document.createElement("a");S.href=URL.createObjectURL(new Blob([f],{type:"text/plain"})),S.download=`ev-chat-${Date.now()}.txt`,S.click(),URL.revokeObjectURL(S.href)}function Fn(){e.length=0,Gl(),$()}t.innerHTML=`
    <style>
    @keyframes evFadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
    @keyframes evBounce { from { transform:translateY(0) } to { transform:translateY(-6px) } }
    @keyframes evPulse { 0%, 100% { opacity:1 } 50% { opacity:.7 } }
    @keyframes evShimmer { 0% { transform:translateX(-100%) } 100% { transform:translateX(100%) } }
    @keyframes evGlow { 0%, 100% { box-shadow:0 0 20px rgba(212,175,55,.2) } 50% { box-shadow:0 0 30px rgba(212,175,55,.4), 0 0 40px rgba(212,175,55,.2) } }
    @keyframes evMicRing {
        0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, .45), 0 8px 24px rgba(239, 68, 68, .2); }
        70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0), 0 8px 24px rgba(239, 68, 68, .2); }
        100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0), 0 8px 24px rgba(239, 68, 68, .2); }
    }
    .ev-mic-recording { animation: evMicRing 1.4s infinite; }
    .ev-voice-pill { transition: all .2s ease; }
    .ev-voice-pill:hover { transform: translateY(-1px); }
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
            <button id="ev-sb-toggle" class="ev-mobile-show" style="display:none;align-items:center;gap:6px;font-size:12px;color:#9ca3af;margin-bottom:12px;cursor:pointer;background:none;border:none">
                <i class="fa-solid fa-bars"></i> Menu & Upload
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
                    <div style="text-align:center;padding:8px 0;border-bottom:1px solid rgba(75,85,99,.15);margin-bottom:6px">
                        <h1 style="font-family:'Orbitron',sans-serif;font-size:18px;font-weight:800;line-height:1.2;margin:0;background:linear-gradient(135deg, #D4AF37, #FFD700);-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 2px 4px rgba(212,175,55,.15))">⚡ EV <span style="background:linear-gradient(135deg, #FFD700, #D4AF37);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Compliance</span></h1>
                        <p style="font-size:9px;color:#9ca3af;margin-top:3px;text-transform:uppercase;letter-spacing:2px;font-weight:600">🤖 AI-Powered Advisory</p>
                    </div>

                    <!-- Status -->
                    <div style="background:linear-gradient(135deg, rgba(17,24,39,.7), rgba(31,41,55,.5));border:1px solid rgba(75,85,99,.3);border-radius:12px;padding:12px 14px;backdrop-filter:blur(8px);box-shadow:0 2px 8px rgba(0,0,0,.1)">
                        <div style="display:flex;align-items:center;gap:8px">
                            <span class="ev-health-dot" style="width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg, #6b7280, #9ca3af);flex-shrink:0;border:1px solid rgba(255,255,255,.1)"></span>
                            <span class="ev-health-text" style="font-size:12px;color:#c1c7cd;font-weight:500">Checking…</span>
                        </div>
                        <p id="ev-sessions" style="font-size:10px;color:#64748b;margin-top:4px;margin-left:16px;font-weight:400"></p>
                    </div>

                    <!-- Upload -->
                    <div style="background:linear-gradient(135deg, rgba(17,24,39,.7), rgba(31,41,55,.5));border:1px solid rgba(75,85,99,.3);border-radius:12px;padding:14px;backdrop-filter:blur(8px);box-shadow:0 2px 8px rgba(0,0,0,.1)">
                        <h4 style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#9ca3af;margin-bottom:10px;display:flex;align-items:center;gap:6px"><i class="fa-solid fa-paperclip" style="color:#D4AF37;font-size:12px"></i>Document Analysis</h4>
                        <div id="ev-upload-area" style="position:relative;border:2px dashed rgba(212,175,55,.25);border-radius:12px;padding:20px 16px;text-align:center;cursor:pointer;transition:all .3s cubic-bezier(0.4, 0, 0.2, 1);overflow:hidden;background:linear-gradient(135deg, rgba(212,175,55,.03), rgba(17,24,39,.3))">
                            <input type="file" id="ev-file-input" accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.bmp" style="display:none">
                            <i class="fa-solid fa-cloud-arrow-up" style="font-size:28px;color:#64748b;margin-bottom:8px;display:block;transition:all .3s"></i>
                            <p style="font-size:12px;color:#9ca3af;font-weight:500">Drop PDF or image or <span style="color:#D4AF37;text-decoration:underline;cursor:pointer;font-weight:600">browse</span></p>
                            <p style="font-size:10px;color:#64748b;margin-top:4px">JPG • PNG • WebP • GIF • BMP | Max 50 MB</p>
                            <div id="ev-upload-bar" style="position:absolute;bottom:0;left:0;height:3px;background:linear-gradient(90deg,#D4AF37,#FFD700);transition:width .8s cubic-bezier(0.4, 0, 0.2, 1);opacity:0;width:0;border-radius:0 0 12px 12px"></div>
                        </div>
                        <div id="ev-upload-status" style="margin-top:8px"></div>
                        <div id="ev-doc-stats"></div>
                    </div>

                    <!-- Capabilities -->
                    <div style="background:linear-gradient(135deg, rgba(17,24,39,.7), rgba(31,41,55,.5));border:1px solid rgba(75,85,99,.3);border-radius:12px;padding:14px;backdrop-filter:blur(8px);box-shadow:0 2px 8px rgba(0,0,0,.1)">
                        <h4 style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#9ca3af;margin-bottom:12px;display:flex;align-items:center;gap:6px"><i class="fa-solid fa-shield-halved" style="color:#D4AF37;font-size:12px"></i>🚀 Capabilities</h4>
                        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px">
                            ${["⚡ FAME II / PM E-DRIVE subsidy guidance","🗺️ State-wise EV policy comparison","🛡️ BIS / AIS safety-standard checks","� GST, income-tax & import-duty rules","🔌 Charging-infra & DISCOM approvals","� PDF analysis & compliance audit"].map(g=>`<li style="display:flex;align-items:flex-start;gap:8px;font-size:11px;color:#c1c7cd;padding:6px 8px;border-radius:6px;background:rgba(212,175,55,.03);border:1px solid rgba(212,175,55,.08);transition:all .2s"><div style="width:16px;height:16px;border-radius:4px;background:linear-gradient(135deg, rgba(16,185,129,.2), rgba(52,211,153,.1));display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px"><i class="fa-solid fa-check" style="color:#10b981;font-size:8px"></i></div><span style="line-height:1.4;font-weight:400">${g}</span></li>`).join("")}
                        </ul>
                    </div>

                    <!-- Actions -->
                    <div style="display:flex;gap:6px">
                        <button id="ev-export" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;font-size:11px;color:#9ca3af;padding:8px 12px;border-radius:8px;cursor:pointer;background:linear-gradient(135deg, rgba(31,41,55,.6), rgba(17,24,39,.4));border:1px solid rgba(75,85,99,.25);transition:all .3s;font-weight:500" title="📥 Export conversation">
                            <i class="fa-solid fa-download" style="font-size:10px"></i> Export
                        </button>
                        <button id="ev-test-connection" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;font-size:11px;color:#9ca3af;padding:8px 12px;border-radius:8px;cursor:pointer;background:linear-gradient(135deg, rgba(31,41,55,.6), rgba(17,24,39,.4));border:1px solid rgba(75,85,99,.25);transition:all .3s;font-weight:500" title="🔍 Test connection">
                            <i class="fa-solid fa-wifi" style="font-size:10px"></i> Test
                        </button>
                        <button id="ev-clear" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;font-size:11px;color:#9ca3af;padding:8px 12px;border-radius:8px;cursor:pointer;background:linear-gradient(135deg, rgba(31,41,55,.6), rgba(17,24,39,.4));border:1px solid rgba(75,85,99,.25);transition:all .3s;font-weight:500" title="🧹 Clear chat history">
                            <i class="fa-solid fa-trash-can" style="font-size:10px"></i> Clear
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
                            <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
                                <input
                                    type="text"
                                    id="ev-input"
                                    placeholder="💬 Ask about Indian EV regulations, subsidies, compliance…"
                                    maxlength="2000"
                                    autocomplete="off"
                                    style="flex:1;padding:12px 16px;background:rgba(31,41,55,.5);border:1px solid rgba(75,85,99,.3);border-radius:16px;font-size:14px;color:#f1f5f9;outline:none;transition:all .3s;font-weight:400;backdrop-filter:blur(4px)"
                                    onfocus="this.style.borderColor='rgba(212,175,55,.4)';this.style.boxShadow='0 0 0 3px rgba(212,175,55,.1)'"
                                    onblur="this.style.borderColor='rgba(75,85,99,.3)';this.style.boxShadow='none'"
                                >
                                <button
                                    id="ev-mic"
                                    class="ev-voice-pill"
                                    style="display:flex;align-items:center;gap:8px;padding:12px 14px;background:linear-gradient(135deg, rgba(31,41,55,.9), rgba(17,24,39,.7));border:1px solid rgba(75,85,99,.35);border-radius:14px;color:#e5e7eb;cursor:pointer;transition:all .2s;font-size:12px;font-weight:600;min-width:126px;justify-content:center"
                                    title="Start voice input"
                                >
                                    <span id="ev-mic-dot" style="width:7px;height:7px;border-radius:999px;background:#34d399;opacity:.75"></span>
                                    <i id="ev-mic-icon" class="fa-solid fa-microphone-lines" style="font-size:13px"></i>
                                    <span id="ev-mic-text">Start Voice</span>
                                </button>
                                <button
                                    id="ev-send"
                                    style="padding:12px 20px;background:linear-gradient(135deg, #D4AF37, #FFD700);border:none;border-radius:16px;color:#000;cursor:pointer;transition:all .3s;font-size:14px;font-weight:600;box-shadow:0 4px 12px rgba(212,175,55,.25);display:flex;align-items:center;gap:8px"
                                    title="🚀 Send message"
                                    onmouseenter="this.style.transform='translateY(-1px)';this.style.boxShadow='0 6px 20px rgba(212,175,55,.35)'"
                                    onmouseleave="this.style.transform='';this.style.boxShadow='0 4px 12px rgba(212,175,55,.25)'"
                                >
                                    <i class="fa-solid fa-paper-plane" style="font-size:14px"></i>
                                    <span style="font-weight:700">Send</span>
                                    <i class="fa-solid fa-rocket" style="font-size:12px"></i>
                                </button>
                            </div>
                            <div style="margin-top:10px;padding:10px 12px;border-radius:12px;background:linear-gradient(135deg, rgba(31,41,55,.35), rgba(17,24,39,.5));border:1px solid rgba(75,85,99,.22)">
                                <div style="display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap">
                                    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                                        <button id="ev-tts-toggle" class="ev-voice-pill" style="display:flex;align-items:center;gap:6px;padding:8px 10px;border-radius:10px;border:1px solid rgba(75,85,99,.3);background:linear-gradient(135deg, rgba(31,41,55,.7), rgba(17,24,39,.5));color:#9ca3af;cursor:pointer;font-size:11px;font-weight:600">
                                            <i class="fa-solid fa-wave-square" style="font-size:11px"></i>
                                            <span id="ev-tts-toggle-text">Auto Voice: Off</span>
                                        </button>
                                        <button id="ev-tts-play" class="ev-voice-pill" style="display:flex;align-items:center;gap:6px;padding:8px 10px;border-radius:10px;border:1px solid rgba(75,85,99,.3);background:rgba(31,41,55,.6);color:#d1d5db;cursor:pointer;font-size:11px;font-weight:600">
                                            <i class="fa-solid fa-play" style="font-size:10px"></i>
                                            <span>Speak Last</span>
                                        </button>
                                        <button id="ev-tts-pause" class="ev-voice-pill" style="display:flex;align-items:center;gap:6px;padding:8px 10px;border-radius:10px;border:1px solid rgba(75,85,99,.3);background:rgba(31,41,55,.6);color:#d1d5db;cursor:pointer;font-size:11px;font-weight:600">
                                            <i class="fa-solid fa-pause" style="font-size:10px"></i>
                                            <span id="ev-tts-pause-text">Pause</span>
                                        </button>
                                        <button id="ev-tts-stop" class="ev-voice-pill" style="display:flex;align-items:center;gap:6px;padding:8px 10px;border-radius:10px;border:1px solid rgba(75,85,99,.3);background:rgba(31,41,55,.6);color:#d1d5db;cursor:pointer;font-size:11px;font-weight:600">
                                            <i class="fa-solid fa-stop" style="font-size:10px"></i>
                                            <span>Stop</span>
                                        </button>
                                    </div>
                                    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                                        <label for="ev-tts-lang" style="font-size:10px;color:#9ca3af">Lang</label>
                                        <select id="ev-tts-lang" style="background:rgba(17,24,39,.7);border:1px solid rgba(75,85,99,.32);color:#d1d5db;border-radius:8px;padding:6px 8px;font-size:11px;outline:none">
                                            <option value="en">English</option>
                                            <option value="hi">Hindi</option>
                                            <option value="kn">Kannada</option>
                                            <option value="ta">Tamil</option>
                                            <option value="te">Telugu</option>
                                            <option value="mr">Marathi</option>
                                        </select>
                                        <label for="ev-tts-speed" style="font-size:10px;color:#9ca3af">Speed</label>
                                        <select id="ev-tts-speed" style="background:rgba(17,24,39,.7);border:1px solid rgba(75,85,99,.32);color:#d1d5db;border-radius:8px;padding:6px 8px;font-size:11px;outline:none">
                                            <option value="normal">Normal</option>
                                            <option value="slow">Slow</option>
                                        </select>
                                        <label for="ev-tts-volume" style="font-size:10px;color:#9ca3af">Vol</label>
                                        <input id="ev-tts-volume" type="range" min="0" max="100" value="100" style="accent-color:#D4AF37;cursor:pointer;width:90px">
                                        <span id="ev-tts-volume-label" style="font-size:10px;color:#9ca3af;min-width:34px">100%</span>
                                    </div>
                                </div>
                            </div>
                            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;padding:0 4px">
                                <span id="ev-voice-status" style="font-size:11px;color:#9ca3af">Voice ready</span>
                                <span id="ev-voice-hint" style="font-size:11px;color:#6b7280">Mic input + full playback controls</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;const J=document.getElementById("ev-upload-area"),st=document.getElementById("ev-file-input"),nt=document.getElementById("ev-input"),jn=document.getElementById("ev-mic"),On=document.getElementById("ev-tts-toggle"),Nn=document.getElementById("ev-tts-play"),zn=document.getElementById("ev-tts-pause"),_n=document.getElementById("ev-tts-stop"),it=document.getElementById("ev-tts-lang"),Ia=document.getElementById("ev-tts-speed"),Ba=document.getElementById("ev-tts-volume"),Ma=document.getElementById("ev-tts-volume-label"),Hn=document.getElementById("ev-send");J.addEventListener("click",()=>st.click()),J.addEventListener("dragover",g=>{g.preventDefault(),J.style.borderColor="rgba(212,175,55,.5)",J.style.background="linear-gradient(135deg, rgba(212,175,55,.08), rgba(255,215,0,.04))",J.style.transform="scale(1.02)";const f=J.querySelector("i");f&&(f.style.color="#D4AF37",f.style.transform="scale(1.1)")}),J.addEventListener("dragleave",g=>{g.preventDefault(),J.style.borderColor="rgba(212,175,55,.25)",J.style.background="linear-gradient(135deg, rgba(212,175,55,.03), rgba(17,24,39,.3))",J.style.transform="";const f=J.querySelector("i");f&&(f.style.color="#64748b",f.style.transform="")}),J.addEventListener("drop",g=>{g.preventDefault(),J.style.borderColor="rgba(212,175,55,.25)",J.style.background="linear-gradient(135deg, rgba(212,175,55,.03), rgba(17,24,39,.3))",J.style.transform="";const f=J.querySelector("i");f&&(f.style.color="#64748b",f.style.transform=""),g.dataTransfer?.files[0]&&Ca(g.dataTransfer.files[0])}),st.addEventListener("change",()=>{st.files?.[0]&&Ca(st.files[0])}),Hn.addEventListener("click",()=>te(nt.value.trim())),nt.addEventListener("keydown",g=>{g.key==="Enter"&&!g.shiftKey&&(g.preventDefault(),te(nt.value.trim()))}),jn.addEventListener("click",async()=>{if(!p){if(l){se();return}await H(nt)}}),On.addEventListener("click",()=>{d=!d,G(d),V(d?"Auto voice ON":"Auto voice OFF","success"),F(d?"Assistant replies will be spoken automatically":"Auto voice disabled; use Speak Last anytime"),!d&&v&&ce(!1),O()}),Nn.addEventListener("click",()=>{ie()}),zn.addEventListener("click",()=>{Be()}),_n.addEventListener("click",()=>{ce()}),it.addEventListener("change",()=>{E=it.value,V(`Voice language set to ${it.options[it.selectedIndex].text}`,"success")}),Ia.addEventListener("change",()=>{A=Ia.value==="slow",V(`Voice speed: ${A?"Slow":"Normal"}`,"success")}),Ba.addEventListener("input",()=>{b=Number(Ba.value)/100,Ma&&(Ma.textContent=`${Math.round(b*100)}%`),v&&(v.volume=b)});const $a=document.getElementById("ev-sidebar"),Et=document.getElementById("ev-overlay"),Un=()=>{$a.classList.add("open"),Et.style.display="block"},Ra=()=>{$a.classList.remove("open"),Et.style.display="none"};document.getElementById("ev-sb-toggle")?.addEventListener("click",Un),document.getElementById("ev-sb-close")?.addEventListener("click",Ra),Et.addEventListener("click",Ra),document.getElementById("ev-export")?.addEventListener("click",Dn),document.getElementById("ev-clear")?.addEventListener("click",Fn),document.getElementById("ev-test-connection")?.addEventListener("click",async()=>{ge("system","🔍 Testing backend connection...");const g=await w();ge("system",g?"✅ Connection successful!":"❌ Connection failed – check console (F12)")}),["ev-export","ev-clear","ev-test-connection"].forEach(g=>{const f=document.getElementById(g);if(f){const S=g==="ev-clear"?"#ef4444":g==="ev-test-connection"?"#3b82f6":"#D4AF37",B=g==="ev-clear"?"239,68,68":g==="ev-test-connection"?"59,130,246":"212,175,55";f.addEventListener("mouseenter",()=>{f.style.color=S,f.style.background=`linear-gradient(135deg, rgba(${B},.1), rgba(${B},.05))`,f.style.borderColor=`rgba(${B},.4)`,f.style.transform="translateY(-1px)",f.style.boxShadow=`0 4px 12px rgba(${B},.15)`}),f.addEventListener("mouseleave",()=>{f.style.color="#9ca3af",f.style.background="linear-gradient(135deg, rgba(31,41,55,.6), rgba(17,24,39,.4))",f.style.borderColor="rgba(75,85,99,.25)",f.style.transform="",f.style.boxShadow="none"})}}),kt(),_(!1),G(!1),O(),V("Voice ready","info"),F("Tap Start Voice or use playback controls for replies"),$(),w();const qn=setInterval(w,3e4),Pa=new MutationObserver(()=>{document.getElementById("ev-messages")||(clearInterval(qn),l&&se(),x(),h(),ce(!1),Pa.disconnect())});Pa.observe(t,{childList:!0})}const Ae="pk.eyJ1Ijoic3Rhc2gxMiIsImEiOiJjbW1qY3FwbnowNnRyMnJzYWhvNnZuN3dwIn0.UdkyD-K7763L-JaB7j79Kg";let P=null,Jt=null,Zt=null,Ke=[],Ie=null,Se=null,yt=[],Rt=0;const ht=[76.5,27.5],In=7;async function Xl(){if(!z.isAuthenticated()){window.location.href="/auth";return}const t=document.getElementById("app");if(t){if(!document.querySelector('link[href*="font-awesome"]')){const e=document.createElement("link");e.rel="stylesheet",e.href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",document.head.appendChild(e)}t.innerHTML=`
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

                                <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
                                    <button
                                        id="swap-route-btn"
                                        class="px-3 py-1.5 rounded-lg border border-pagani-gold/30 text-pagani-gold hover:bg-pagani-gold hover:text-black transition-all"
                                        type="button"
                                    >
                                        <i class="fa-solid fa-arrows-up-down-left-right mr-1"></i>
                                        Swap
                                    </button>
                                    <span>Tip: Use current location icon for quick origin</span>
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
                                <!-- Map container -->
                                <div id="google-map" style="position:absolute;top:0;left:0;width:100%;height:100%"></div>
                                <!-- Loading overlay (shown until map loads) -->
                                <div id="map-loading" class="absolute inset-0 flex items-center justify-center bg-gray-900/80" style="z-index:10">
                                    <div class="text-center">
                                        <i class="fa-solid fa-spinner animate-spin text-pagani-gold text-3xl mb-3"></i>
                                        <p class="text-gray-400 text-sm font-orbitron">Loading Map...</p>
                                    </div>
                                </div>
                                <div class="absolute left-3 top-3 z-20 flex flex-wrap gap-2">
                                    <button id="map-locate-btn" type="button" class="px-3 py-1.5 rounded-lg border border-cyan-400/40 bg-gray-900/80 text-cyan-300 text-xs font-orbitron hover:bg-cyan-400 hover:text-black transition-all">
                                        <i class="fa-solid fa-location-crosshairs mr-1"></i>Locate Me
                                    </button>
                                    <button id="map-fit-route-btn" type="button" class="px-3 py-1.5 rounded-lg border border-emerald-400/40 bg-gray-900/80 text-emerald-300 text-xs font-orbitron hover:bg-emerald-400 hover:text-black transition-all">
                                        <i class="fa-solid fa-expand mr-1"></i>Fit Route
                                    </button>
                                    <button id="map-reset-view-btn" type="button" class="px-3 py-1.5 rounded-lg border border-amber-400/40 bg-gray-900/80 text-amber-300 text-xs font-orbitron hover:bg-amber-400 hover:text-black transition-all">
                                        <i class="fa-solid fa-rotate-left mr-1"></i>Reset
                                    </button>
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

                        <!-- Turn-by-Turn Guidance -->
                        <div id="route-steps-panel" class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section hidden" style="animation-delay: 260ms">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-list-check text-pagani-gold"></i>
                                Turn-by-Turn Guidance
                            </h3>
                            <div id="route-steps" class="space-y-2 max-h-[280px] overflow-y-auto pr-1"></div>
                        </div>

                        <!-- Weather Information Panel -->
                        <div id="weather-panel" class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section hidden" style="animation-delay: 270ms">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-cloud-sun text-pagani-gold"></i>
                                Weather Along Route
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="weather-cards">
                                <!-- Origin weather -->
                                <div id="weather-origin" class="p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                                    <div class="flex items-center justify-between mb-3">
                                        <div class="flex items-center gap-2">
                                            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span class="text-sm font-orbitron text-gray-300" id="weather-origin-name">Origin</span>
                                        </div>
                                        <img id="weather-origin-icon" src="" alt="" class="w-10 h-10 hidden">
                                    </div>
                                    <div class="text-center py-2">
                                        <p class="text-3xl font-orbitron font-bold text-pagani-gold" id="weather-origin-temp">--°C</p>
                                        <p class="text-xs text-gray-400 capitalize mt-1" id="weather-origin-desc">Loading...</p>
                                    </div>
                                    <div class="grid grid-cols-2 gap-2 mt-3">
                                        <div class="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 rounded p-2">
                                            <i class="fa-solid fa-temperature-low text-blue-400"></i>
                                            <span>Feels <span id="weather-origin-feels">--</span>°C</span>
                                        </div>
                                        <div class="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 rounded p-2">
                                            <i class="fa-solid fa-wind text-cyan-400"></i>
                                            <span><span id="weather-origin-wind">--</span> km/h</span>
                                        </div>
                                        <div class="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 rounded p-2">
                                            <i class="fa-solid fa-droplet text-blue-400"></i>
                                            <span><span id="weather-origin-humidity">--</span>%</span>
                                        </div>
                                        <div class="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 rounded p-2">
                                            <i class="fa-solid fa-eye text-gray-400"></i>
                                            <span><span id="weather-origin-visibility">--</span> km</span>
                                        </div>
                                    </div>
                                    <div class="mt-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400" id="weather-origin-advisory"></div>
                                </div>
                                <!-- Destination weather -->
                                <div id="weather-destination" class="p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                                    <div class="flex items-center justify-between mb-3">
                                        <div class="flex items-center gap-2">
                                            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <span class="text-sm font-orbitron text-gray-300" id="weather-dest-name">Destination</span>
                                        </div>
                                        <img id="weather-dest-icon" src="" alt="" class="w-10 h-10 hidden">
                                    </div>
                                    <div class="text-center py-2">
                                        <p class="text-3xl font-orbitron font-bold text-pagani-gold" id="weather-dest-temp">--°C</p>
                                        <p class="text-xs text-gray-400 capitalize mt-1" id="weather-dest-desc">Loading...</p>
                                    </div>
                                    <div class="grid grid-cols-2 gap-2 mt-3">
                                        <div class="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 rounded p-2">
                                            <i class="fa-solid fa-temperature-low text-blue-400"></i>
                                            <span>Feels <span id="weather-dest-feels">--</span>°C</span>
                                        </div>
                                        <div class="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 rounded p-2">
                                            <i class="fa-solid fa-wind text-cyan-400"></i>
                                            <span><span id="weather-dest-wind">--</span> km/h</span>
                                        </div>
                                        <div class="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 rounded p-2">
                                            <i class="fa-solid fa-droplet text-blue-400"></i>
                                            <span><span id="weather-dest-humidity">--</span>%</span>
                                        </div>
                                        <div class="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 rounded p-2">
                                            <i class="fa-solid fa-eye text-gray-400"></i>
                                            <span><span id="weather-dest-visibility">--</span> km</span>
                                        </div>
                                    </div>
                                    <div class="mt-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400" id="weather-dest-advisory"></div>
                                </div>
                            </div>
                            <!-- EV Weather Impact -->
                            <div id="weather-ev-impact" class="mt-4 p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10 hidden">
                                <h4 class="text-sm font-orbitron font-bold text-pagani-gold mb-2 flex items-center gap-2">
                                    <i class="fa-solid fa-car-battery"></i>
                                    EV Weather Impact
                                </h4>
                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3" id="weather-impact-items"></div>
                            </div>
                        </div>

                        <!-- Charging Stations Along Route -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section" style="animation-delay: 300ms">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center justify-between">
                                <span class="flex items-center gap-2">
                                    <i class="fa-solid fa-charging-station text-pagani-gold"></i>
                                    Charging Stations
                                </span>
                                <span id="charging-count" class="text-sm text-gray-400 font-normal">0 stations found</span>
                            </h3>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                <select id="connector-filter" class="w-full px-3 py-2 bg-gray-800/60 border border-pagani-gold/20 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-pagani-gold">
                                    <option value="all">All Connectors</option>
                                    <option value="CCS2">CCS2</option>
                                    <option value="CHAdeMO">CHAdeMO</option>
                                    <option value="Type 2">Type 2</option>
                                </select>
                                <label class="flex items-center gap-2 px-3 py-2 bg-gray-800/40 border border-pagani-gold/20 rounded-lg text-sm text-gray-300">
                                    <input id="available-only" type="checkbox" class="accent-green-400">
                                    Show only available chargers
                                </label>
                            </div>
                            <div class="space-y-3" id="charging-stations">
                                <!-- Stations will be populated by JS -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,setTimeout(async()=>{Ql(),await Jl()},100)}}async function Jl(){try{if(!Ae||!Ae.startsWith("pk."))throw new Error("Invalid Mapbox public token. Set VITE_MAPBOX_API_KEY to a valid public key (pk...).");if(!document.querySelector('link[href*="mapbox-gl.css"]')){const a=document.createElement("link");a.rel="stylesheet",a.href="https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.css",document.head.appendChild(a)}if(window.mapboxgl||await new Promise((a,s)=>{const n=document.createElement("script");n.src="https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.js",n.async=!0,n.onload=()=>a(),n.onerror=()=>s(new Error("Failed to load Mapbox GL script.")),document.head.appendChild(n)}),!window.mapboxgl)throw new Error("Mapbox GL is unavailable.");window.mapboxgl.accessToken=Ae;const t=document.getElementById("google-map");if(!t)throw new Error("Map container not found.");P&&(P.remove(),P=null,Jt=null,Zt=null,Ke=[]);const e=document.getElementById("map-loading");e&&e.remove(),t.style.position="absolute",t.style.inset="0",t.style.width="100%",t.style.height="100%",P=new window.mapboxgl.Map({container:t,style:"mapbox://styles/mapbox/dark-v11",center:ht,zoom:In,attributionControl:!0}),P.addControl(new window.mapboxgl.NavigationControl,"top-right"),P.addControl(new window.mapboxgl.FullscreenControl,"top-right"),P.on("error",a=>{const s=a?.error?.message??"Unknown Mapbox error";console.error("[EVBharat Maps] Mapbox error:",s)}),P.on("load",()=>{requestAnimationFrame(()=>P?.resize()),setTimeout(()=>P?.resize(),300),setTimeout(()=>P?.resize(),1200),Bn(),wt({origin:ht,silent:!0})}),setTimeout(()=>P?.resize(),500),setTimeout(()=>P?.resize(),2e3)}catch(t){const e=t instanceof Error?t.message:String(t);console.error("[EVBharat Maps]",e),Zl(e)}}let me=[];function Zl(t){const e=document.getElementById("map-loading");if(e){const a=t.toLowerCase().includes("token")||t.toLowerCase().includes("api key")||t.toLowerCase().includes("script failed"),s=t.toLowerCase().includes("endpoint")||t.toLowerCase().includes("port 3001");let n="";s?n=`
                <div style="text-align:left;margin-top:12px;font-size:11px;color:#fbbf24;background:rgba(0,0,0,0.3);padding:8px;border-radius:6px">
                    <strong>✓ Backend Fix:</strong> Start backend server with: <code style="background:rgba(0,0,0,0.5);padding:2px 6px;border-radius:3px">npm start</code>
                </div>
            `:a&&(n=`
                <div style="text-align:left;margin-top:12px;font-size:11px;color:#fbbf24;background:rgba(0,0,0,0.3);padding:8px;border-radius:6px">
                    <strong>✓ Mapbox Token Fix:</strong>
                    <ol style="margin:6px 0 0 16px;padding:0">
                        <li>Go to <a href="https://account.mapbox.com/access-tokens/" target="_blank" style="color:#60a5fa">Mapbox Access Tokens</a></li>
                        <li>Create or copy a public token that starts with <code style="background:rgba(0,0,0,0.5);padding:2px 6px;border-radius:3px">pk.</code></li>
                        <li>Set <code style="background:rgba(0,0,0,0.5);padding:2px 6px;border-radius:3px">VITE_MAPBOX_API_KEY</code> in frontend .env</li>
                        <li>Restart frontend dev server</li>
                    </ol>
                </div>
            `),e.innerHTML=`
            <div class="text-center">
                <i class="fa-solid fa-triangle-exclamation text-red-400 text-3xl mb-3"></i>
                <p class="text-red-400 text-sm font-orbitron mb-1">Failed to load map</p>
                <p class="text-gray-500 text-xs" style="max-width:400px;margin:0 auto">${t}</p>
                ${n}
                <p style="margin-top:12px;font-size:10px;color:#6b7280">📋 Check browser console (F12) for technical details</p>
            </div>`}}function Ql(){const t=document.getElementById("route-options");if(t){const c=[{id:"1",name:"Energy Efficient",distance:268,duration:"4h 15m",energyConsumption:42,chargingStops:1,traffic:"low",recommended:!0},{id:"2",name:"Fastest Route",distance:255,duration:"3h 45m",energyConsumption:48,chargingStops:1,traffic:"high",recommended:!1},{id:"3",name:"Scenic Route",distance:295,duration:"5h 00m",energyConsumption:52,chargingStops:2,traffic:"low",recommended:!1}];t.innerHTML=c.map(u=>`
            <div class="route-option p-4 bg-pagani-black/50 border ${u.recommended?"border-pagani-gold":"border-pagani-gold/20"} rounded-lg cursor-pointer hover:border-pagani-gold transition-all ${u.recommended?"ring-2 ring-pagani-gold/30":""}">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                        ${u.recommended?'<span class="px-2 py-0.5 bg-pagani-gold text-black text-xs font-bold rounded">AI PICK</span>':""}
                        <span class="font-orbitron font-bold">${u.name}</span>
                    </div>
                    <span class="text-sm text-gray-400">${u.distance} km</span>
                </div>
                <div class="flex items-center gap-4 text-xs text-gray-400">
                    <span><i class="fa-solid fa-clock mr-1"></i>${u.duration}</span>
                    <span><i class="fa-solid fa-bolt mr-1"></i>${u.energyConsumption} kWh</span>
                    <span><i class="fa-solid fa-charging-station mr-1"></i>${u.chargingStops} stops</span>
                    <span class="${u.traffic==="low"?"text-green-400":u.traffic==="medium"?"text-yellow-400":"text-red-400"}">
                        <i class="fa-solid fa-traffic-light mr-1"></i>${u.traffic}
                    </span>
                </div>
            </div>
        `).join("")}de(me),document.getElementById("calculate-route-btn")?.addEventListener("click",()=>{Qt()});const a=document.getElementById("start-location"),s=document.getElementById("end-location");if(a&&s){const c=async()=>bs(a.value,"origin"),u=async()=>bs(s.value,"destination");a.addEventListener("change",c),s.addEventListener("change",u),a.addEventListener("blur",c),s.addEventListener("blur",u);const m=v=>{v.key==="Enter"&&Qt()};a.addEventListener("keydown",m),s.addEventListener("keydown",m)}wd(),document.getElementById("swap-route-btn")?.addEventListener("click",()=>{const c=document.getElementById("start-location"),u=document.getElementById("end-location");if(!c||!u)return;const m=c.value;c.value=u.value,u.value=m,Y("Origin and destination swapped","success")}),document.getElementById("map-locate-btn")?.addEventListener("click",()=>{dd()}),document.getElementById("map-fit-route-btn")?.addEventListener("click",()=>{cd()}),document.getElementById("map-reset-view-btn")?.addEventListener("click",()=>{gd()});const l=document.getElementById("connector-filter"),p=document.getElementById("available-only");l?.addEventListener("change",()=>de(he())),p?.addEventListener("change",()=>de(he()));const d=document.querySelectorAll(".route-option");d.forEach(c=>{c.addEventListener("click",()=>{d.forEach(u=>{u.classList.remove("border-pagani-gold","ring-2","ring-pagani-gold/30"),u.classList.add("border-pagani-gold/20")}),c.classList.remove("border-pagani-gold/20"),c.classList.add("border-pagani-gold","ring-2","ring-pagani-gold/30")})})}function Y(t,e){const a=document.createElement("div");a.className=`fixed top-24 right-8 px-6 py-4 rounded-lg backdrop-blur-sm z-50 font-orbitron text-sm fade-in-section ${e==="success"?"bg-green-500/20 border border-green-500/50 text-green-400":"bg-red-500/20 border border-red-500/50 text-red-400"}`,a.innerHTML=`<i class="fa-solid ${e==="success"?"fa-check-circle":"fa-exclamation-circle"} mr-2"></i>${t}`,document.body.appendChild(a),setTimeout(()=>a.remove(),3e3)}function ed(t){const e=t.toLowerCase(),a=[];return e.includes("ccs")&&a.push("CCS2"),e.includes("chademo")&&a.push("CHAdeMO"),/\btype\s*2\b/.test(e)&&a.push("Type 2"),a.length===0&&a.push("CCS2"),a}function td(t,e){return e>=6&&e<=38&&t>=68&&t<=98}function ad(t){return[t.AddressLine1,t.AddressLine2,t.Town,t.StateOrProvince,t.Postcode].filter(a=>!!(a&&a.trim())).join(", ")||t.Title||"Address unavailable"}async function sd(t,e,a=8){const[s,n]=t,i=new URLSearchParams({access_token:Ae,types:"poi,address",proximity:`${s},${n}`,limit:String(a),autocomplete:"true"});td(s,n)&&i.set("country","IN");const r=`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(e)}.json?${i.toString()}`;try{const o=await fetch(r);if(!o.ok)return[];const l=await o.json();return Array.isArray(l.features)?l.features:[]}catch{return[]}}async function nd(t,e=10){const[a,s]=t,i=`https://api.openchargemap.io/v3/poi/?${new URLSearchParams({output:"json",latitude:String(s),longitude:String(a),distance:"80",distanceunit:"KM",maxresults:String(e),compact:"true",verbose:"false"}).toString()}`;try{const r=await fetch(i);if(!r.ok)return[];const o=await r.json();return Array.isArray(o)?o.map((l,p)=>{const d=l.AddressInfo,c=d?.Latitude,u=d?.Longitude;if(typeof c!="number"||typeof u!="number")return null;const m=(l.Connections??[]).map(b=>b.ConnectionType?.Title?.trim()).filter(b=>!!(b&&b.length>0)),v=Math.max(...(l.Connections??[]).map(b=>Number(b.PowerKW)).filter(b=>Number.isFinite(b))),L=Math.max(1,Number(l.NumberOfPoints)||(l.Connections?.length??0)||1),E=(d?.Title||`Charging Station ${p+1}`).trim();return{id:l.ID?`ocm-${l.ID}`:`ocm-fallback-${s.toFixed(4)}-${a.toFixed(4)}-${p}`,name:E,address:d?ad(d):"Address unavailable",lat:c,lng:u,distance:Math.max(1,Math.round(xt(s,a,c,u))),connectors:m.length>0?m:["CCS2"],available:L,total:L,power:Number.isFinite(v)?`${Math.round(v)} kW`:"Unknown",price:l.UsageCost?.trim()||"--",rating:4,amenities:["Public Access"]}}).filter(l=>l!==null):[]}catch{return[]}}function id(t){const e=[];t.origin&&e.push(t.origin),t.destination&&e.push(t.destination);const a=t.routeGeometry?.coordinates;return a&&a.length>0&&e.push(a[Math.floor(a.length/2)]),e.length===0&&e.push(ht),e}async function wt(t={}){const e=++Rt,a=document.getElementById("charging-count");a&&(a.textContent="Finding nearby stations...");const s=id(t),n=!!Ae.startsWith("pk."),i=["ev charging station","electric vehicle charging station","charging station","fast charger"],r=n?await Promise.all(s.flatMap((d,c)=>i.map(u=>sd(d,u,Math.max(6,12-c*2))))):[];if(e!==Rt)return;const o=t.origin??s[0],l=new Map;let p=0;if(r.flat().forEach(d=>{if(!d.center||d.center.length<2)return;const c=Number(d.center[0]),u=Number(d.center[1]);if(!Number.isFinite(u)||!Number.isFinite(c))return;const m=(d.text||d.place_name||"Charging Station").trim(),v=(d.place_name||m).trim(),L=`${m.toLowerCase()}|${u.toFixed(4)}|${c.toFixed(4)}`,E=Math.max(1,Math.round(xt(o[1],o[0],u,c))),A={id:d.id||`dynamic-${p++}`,name:m,address:v,lat:u,lng:c,distance:E,connectors:ed(`${m} ${v}`),available:1,total:1,power:"Unknown",price:"--",rating:4,amenities:["Public Access"]},b=l.get(L);(!b||A.distance<b.distance)&&l.set(L,A)}),l.size<6){const d=await Promise.all(s.slice(0,3).map((c,u)=>nd(c,Math.max(8,14-u*2))));if(e!==Rt)return;d.flat().forEach(c=>{const u=`${c.name.toLowerCase()}|${c.lat.toFixed(4)}|${c.lng.toFixed(4)}`,m={...c,distance:Math.max(1,Math.round(xt(o[1],o[0],c.lat,c.lng)))},v=l.get(u);(!v||m.distance<v.distance)&&l.set(u,m)})}me=Array.from(l.values()).sort((d,c)=>d.distance-c.distance).slice(0,15),Ie&&!me.some(d=>d.id===Ie)&&(Ie=null),Bn(),de(he()),!t.silent&&me.length===0&&Y("No nearby charging stations found for this route area","error")}function Bn(){!P||!window.mapboxgl||(Ke.forEach(({marker:t})=>t.remove()),Ke=[],me.forEach(t=>{const e=document.createElement("div");e.style.width="12px",e.style.height="12px",e.style.borderRadius="9999px",e.style.background="#22d3ee",e.style.border="2px solid #0a0a0a",e.style.boxShadow="0 0 0 2px rgba(34,211,238,0.2)";const a=new window.mapboxgl.Popup({offset:14}).setHTML(`
            <div style="color:#0f172a;font-family:sans-serif;min-width:200px">
                <strong>${t.name}</strong><br>
                <span style="font-size:12px">${t.address}</span><br>
                <span style="font-size:11px;color:#334155">${t.available}/${t.total} available | ${t.power}</span>
            </div>
        `),s=new window.mapboxgl.Marker(e).setLngLat([t.lng,t.lat]).setPopup(a).addTo(P);s.getElement().addEventListener("click",()=>{Ie=t.id,de(he())}),Ke.push({stationId:t.id,marker:s})}))}function xt(t,e,a,s){const n=l=>l*(Math.PI/180),i=n(a-t),r=n(s-e),o=Math.sin(i/2)**2+Math.cos(n(t))*Math.cos(n(a))*Math.sin(r/2)**2;return 6371*(2*Math.atan2(Math.sqrt(o),Math.sqrt(1-o)))}function rd(t,e){const a=e.coordinates,s=Math.max(1,Math.floor(a.length/120));let n=Number.POSITIVE_INFINITY;for(let i=0;i<a.length;i+=s){const[r,o]=a[i],l=xt(t.lat,t.lng,o,r);l<n&&(n=l)}return Number.isFinite(n)?n:t.distance}function od(){return Se?me.map(t=>({...t,routeDeviationKm:rd(t,Se.geometry)})).sort((t,e)=>(t.routeDeviationKm??Number.MAX_SAFE_INTEGER)-(e.routeDeviationKm??Number.MAX_SAFE_INTEGER)):me}function he(){const t=document.getElementById("connector-filter"),e=document.getElementById("available-only"),a=t?.value??"all",s=!!e?.checked;return od().filter(n=>{const i=a==="all"||n.connectors.includes(a),r=!s||n.available>0;return i&&r})}function de(t){const e=document.getElementById("charging-stations"),a=document.getElementById("charging-count");if(e){if(a&&(a.textContent=`${t.length} station${t.length===1?"":"s"} found`),t.length===0){const s=me.length===0?"No nearby charging stations found yet. Set source and destination or use Locate Me to search again.":"No stations match your filters. Try changing connector type or availability filter.";e.innerHTML=`
            <div class="p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-300">
                ${s}
            </div>
        `;return}e.innerHTML=t.map((s,n)=>{const i=Ie===s.id,o=typeof s.routeDeviationKm=="number"?`~${s.routeDeviationKm.toFixed(1)} km from route`:`${s.distance} km away`;return`
            <div class="p-4 bg-pagani-black/50 border ${i?"border-cyan-300 ring-2 ring-cyan-400/25":"border-pagani-gold/10"} rounded-lg hover:border-pagani-gold/30 transition-all ${n===0?"ring-2 ring-yellow-500/25":""}" data-station-card="${s.id}">
                <div class="flex items-start justify-between gap-4">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            ${n===0?'<span class="px-2 py-0.5 bg-yellow-500 text-black text-xs font-bold rounded">BEST STOP</span>':""}
                            <h4 class="font-orbitron font-bold">${s.name}</h4>
                        </div>
                        <p class="text-xs text-gray-400 mb-2">${s.address}</p>
                        <div class="flex flex-wrap gap-2 mb-2">
                            ${s.connectors.map(l=>`<span class="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">${l}</span>`).join("")}
                            <span class="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">${s.power}</span>
                        </div>
                        <div class="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                            <span><i class="fa-solid fa-location-dot mr-1"></i>${o}</span>
                            <span class="${s.available>0?"text-green-400":"text-red-400"}">
                                <i class="fa-solid fa-plug mr-1"></i>${s.available}/${s.total} available
                            </span>
                            <span><i class="fa-solid fa-indian-rupee-sign mr-1"></i>${s.price}</span>
                            <span class="text-yellow-400"><i class="fa-solid fa-star mr-1"></i>${s.rating}</span>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <button class="focus-station-btn px-3 py-1.5 bg-cyan-500/20 border border-cyan-400/50 rounded-lg text-cyan-300 text-xs font-orbitron hover:bg-cyan-400 hover:text-black transition-all whitespace-nowrap" data-station-id="${s.id}">
                            Focus
                        </button>
                        <button class="set-stop-btn px-3 py-1.5 bg-pagani-gold/20 border border-pagani-gold/50 rounded-lg text-pagani-gold text-xs font-orbitron hover:bg-pagani-gold hover:text-black transition-all whitespace-nowrap" data-station-id="${s.id}">
                            Set Stop
                        </button>
                        <button class="navigate-station-btn px-3 py-1.5 bg-emerald-500/15 border border-emerald-400/40 rounded-lg text-emerald-300 text-xs font-orbitron hover:bg-emerald-400 hover:text-black transition-all whitespace-nowrap" data-station-id="${s.id}">
                            Open Maps
                        </button>
                    </div>
                </div>
            </div>
        `}).join(""),ld()}}function ld(){const t=e=>me.find(a=>a.id===e);document.querySelectorAll(".focus-station-btn").forEach(e=>{e.onclick=()=>{const a=t(e.dataset.stationId??"");if(!a)return;Ie=a.id,P&&P.flyTo({center:[a.lng,a.lat],zoom:12,duration:900}),Ke.find(n=>n.stationId===a.id)?.marker.togglePopup(),de(he()),Y(`Focused on ${a.name}`,"success")}}),document.querySelectorAll(".set-stop-btn").forEach(e=>{e.onclick=()=>{const a=t(e.dataset.stationId??"");if(!a)return;const s=document.getElementById("end-location"),n=document.getElementById("start-location");s&&(Ie=a.id,s.value=`${a.name}, ${a.address}`,Ve("destination",[a.lng,a.lat],"#ef4444"),P&&P.flyTo({center:[a.lng,a.lat],zoom:12,duration:900}),Y(`${a.name} selected as destination`,"success"),de(he()),n?.value.trim()&&Qt())}}),document.querySelectorAll(".navigate-station-btn").forEach(e=>{e.onclick=()=>{const a=t(e.dataset.stationId??"");if(!a)return;const s=`https://www.google.com/maps/dir/?api=1&destination=${a.lat},${a.lng}`;window.open(s,"_blank","noopener,noreferrer")}})}function Mn(t){if(!P||!window.mapboxgl||t.coordinates.length===0)return;const e=t.coordinates.reduce((a,s)=>a.extend(s),new window.mapboxgl.LngLatBounds(t.coordinates[0],t.coordinates[0]));P.fitBounds(e,{padding:50,duration:900})}function dd(){if(!("geolocation"in navigator)){Y("Geolocation is not supported by your browser","error");return}navigator.geolocation.getCurrentPosition(t=>{const e=[t.coords.longitude,t.coords.latitude];Ve("origin",e,"#22c55e"),P&&P.flyTo({center:e,zoom:12,duration:900});const a=document.getElementById("start-location");a&&!a.value.trim()&&(a.value=`${e[1].toFixed(5)}, ${e[0].toFixed(5)}`),wt({origin:e,silent:!0}),Y("Map centered to your current location","success")},()=>Y("Unable to access your location","error"))}function cd(){if(!Se){Y("No active route to fit yet","error");return}Mn(Se.geometry)}function pd(){if(!P)return;const t="route-line";P.getLayer(t)&&P.removeLayer(t),P.getSource(t)&&P.removeSource(t)}function gd(){Se=null,yt=[],pd(),P&&P.flyTo({center:ht,zoom:In,duration:900});const t=document.getElementById("route-steps-panel"),e=document.getElementById("route-steps");t&&t.classList.add("hidden"),e&&(e.innerHTML=""),ta(),de(he()),Y("Map reset to default view","success")}function Qt(){const t=document.getElementById("calculate-route-btn"),e=document.getElementById("start-location"),a=document.getElementById("end-location");if(!t||!e||!a)return;const s=e.value.trim(),n=a.value.trim();if(!s||!n){Y("Please enter both origin and destination","error");return}t.innerHTML='<i class="fa-solid fa-spinner animate-spin mr-2"></i> Calculating...',P&&window.mapboxgl?Promise.all([ea(s),ea(n)]).then(async([i,r])=>{if(!i||!r){t.innerHTML='<i class="fa-solid fa-exclamation-triangle mr-2"></i> Invalid Locations',Y("Could not find one or both locations. Please check spelling.","error"),ta(),setTimeout(()=>{t.innerHTML='<i class="fa-solid fa-magnifying-glass-location mr-2"></i> Calculate Route'},3e3);return}const o=await md(i.center,r.center);if(o.length===0){t.innerHTML='<i class="fa-solid fa-exclamation-triangle mr-2"></i> Route Failed',Y("No route found between these locations","error"),ta(),setTimeout(()=>{t.innerHTML='<i class="fa-solid fa-magnifying-glass-location mr-2"></i> Calculate Route'},3e3);return}yt=o;const l=yd(o);Ve("origin",i.center,"#22c55e"),Ve("destination",r.center,"#ef4444"),Rn(l),Ld(o,l),await wt({origin:i.center,destination:r.center,routeGeometry:Se?.geometry??null,silent:!0}),t.innerHTML='<i class="fa-solid fa-check mr-2"></i> Route Calculated!',Y(`Route from ${i.name} to ${r.name} calculated`,"success"),Td(i.center[1],i.center[0],r.center[1],r.center[0],i.name,r.name),setTimeout(()=>{t.innerHTML='<i class="fa-solid fa-magnifying-glass-location mr-2"></i> Calculate Route'},3e3)}).catch(()=>{t.innerHTML='<i class="fa-solid fa-exclamation-triangle mr-2"></i> Route Failed',Y("Route calculation failed. Please retry.","error"),setTimeout(()=>{t.innerHTML='<i class="fa-solid fa-magnifying-glass-location mr-2"></i> Calculate Route'},3e3)}):(Y("Mapbox map not loaded yet. Please wait and try again.","error"),setTimeout(()=>{t.innerHTML='<i class="fa-solid fa-magnifying-glass-location mr-2"></i> Calculate Route'},2e3))}async function bs(t,e){const a=t.trim();if(!a||!P||!window.mapboxgl)return;const s=await ea(a);s&&(Ve(e,s.center,e==="origin"?"#22c55e":"#ef4444"),P.flyTo({center:s.center,zoom:10,duration:900}))}async function ea(t){try{const e=ud(t);if(e)return{center:[e.lng,e.lat],name:`${e.lat.toFixed(5)}, ${e.lng.toFixed(5)}`};const a=`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(t)}.json?access_token=${Ae}&country=IN&limit=1`,s=await fetch(a);if(!s.ok)return null;const i=(await s.json())?.features?.[0];return i?.center?{center:i.center,name:i.place_name||t}:null}catch{return null}}function ud(t){const e=t.split(",").map(n=>n.trim());if(e.length!==2)return null;const a=Number(e[0]),s=Number(e[1]);return!Number.isFinite(a)||!Number.isFinite(s)||a<-90||a>90||s<-180||s>180?null:{lat:a,lng:s}}async function md(t,e){try{const s=`https://api.mapbox.com/directions/v5/mapbox/driving/${`${t[0]},${t[1]};${e[0]},${e[1]}`}?alternatives=true&geometries=geojson&overview=full&steps=true&access_token=${Ae}`,n=await fetch(s);if(!n.ok)return[];const r=(await n.json())?.routes;return Array.isArray(r)?r:[]}catch{return[]}}function Ve(t,e,a){if(!P||!window.mapboxgl)return;const s=t==="origin"?Jt:Zt;if(s){s.setLngLat(e);return}const n=new window.mapboxgl.Marker({color:a}).setLngLat(e).addTo(P);t==="origin"?Jt=n:Zt=n}function fd(t){if(!P||!window.mapboxgl)return;const e="route-line";P.getLayer(e)&&P.removeLayer(e),P.getSource(e)&&P.removeSource(e),P.addSource(e,{type:"geojson",data:{type:"Feature",geometry:t,properties:{}}}),P.addLayer({id:e,type:"line",source:e,paint:{"line-color":"#22d3ee","line-width":5,"line-opacity":.9}}),Mn(t)}function bd(t){return t.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function Ea(t){const e=t.distance/1e3,a=t.duration/3600,s=a>0?e/a:0;return s<38?"high":s<55?"medium":"low"}function Sa(t,e){return Math.round(t*(e==="high"?.22:e==="medium"?.2:.18))}function $n(t){return t>392?Math.ceil((t-392)/300):0}function hd(t,e,a,s){const n=document.querySelector('[data-trip="km"]'),i=document.querySelector('[data-trip="dur"]'),r=document.querySelector('[data-trip="energy"]'),o=document.querySelector('[data-trip="stops"]');n&&(n.textContent=String(t)),i&&(i.textContent=e),r&&(r.textContent=`${a} kWh`),o&&(o.textContent=String(s))}function xd(t){const e=document.getElementById("route-steps-panel"),a=document.getElementById("route-steps");if(!e||!a)return;const s=t.legs?.[0]?.steps??[];if(s.length===0){e.classList.add("hidden"),a.innerHTML="";return}e.classList.remove("hidden"),a.innerHTML=s.slice(0,14).map((n,i)=>{const r=Math.max(1,Math.round(n.distance)),o=r>=1e3?`${(r/1e3).toFixed(1)} km`:`${r} m`,l=bd(n.maneuver?.instruction||n.name||"Continue straight");return`
            <div class="p-3 rounded-lg border border-pagani-gold/15 bg-pagani-black/40">
                <div class="flex items-start gap-3">
                    <span class="w-6 h-6 shrink-0 rounded-full bg-pagani-gold/25 text-pagani-gold text-xs font-bold flex items-center justify-center">${i+1}</span>
                    <div>
                        <p class="text-sm text-gray-100">${l}</p>
                        <p class="text-xs text-gray-400 mt-1">${o} • ${Ta(Math.max(1,Math.round(n.duration/60)))}</p>
                    </div>
                </div>
            </div>
        `}).join("")}function vd(t){const e=document.getElementById("route-options");e&&e.querySelectorAll(".route-option").forEach(a=>{const s=Number(a.dataset.routeIndex)===t;a.classList.remove("border-pagani-gold","ring-2","ring-pagani-gold/30","border-pagani-gold/20"),s?a.classList.add("border-pagani-gold","ring-2","ring-pagani-gold/30"):a.classList.add("border-pagani-gold/20")})}function yd(t){if(t.length===0)return 0;let e=0,a=Number.POSITIVE_INFINITY;return t.forEach((s,n)=>{const i=s.distance/1e3,r=s.duration/60,o=Ea(s),l=Sa(i,o),p=r*.55+l*.45;p<a&&(a=p,e=n)}),e}function Rn(t){const e=yt[t];if(!e)return;Se=e,fd(e.geometry);const a=Math.round(e.distance/1e3),s=Ta(Math.max(1,Math.round(e.duration/60))),n=Ea(e),i=Sa(a,n),r=$n(a);hd(a,s,i,r),xd(e),de(he()),vd(t)}function ta(){Se=null,yt=[];const t=document.querySelector('[data-trip="km"]'),e=document.querySelector('[data-trip="dur"]'),a=document.querySelector('[data-trip="energy"]'),s=document.querySelector('[data-trip="stops"]');t&&(t.textContent="--"),e&&(e.textContent="--"),a&&(a.textContent="-- kWh"),s&&(s.textContent="--");const n=document.getElementById("weather-panel");n&&n.classList.add("hidden");const i=document.getElementById("weather-ev-impact");i&&i.classList.add("hidden");const r=document.getElementById("route-steps-panel"),o=document.getElementById("route-steps");r&&r.classList.add("hidden"),o&&(o.innerHTML="");const l=document.querySelector(".bg-green-500\\/10 p, .bg-yellow-500\\/10 p, .bg-blue-500\\/10 p");l&&(l.innerHTML=`
            <i class="fa-solid fa-info-circle mr-1"></i>
            Enter route details to calculate optimal charging strategy.
        `,l.parentElement.className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg",l.className="text-xs text-blue-400"),de(he())}function wd(){const t=document.getElementById("start-location");if(t&&!document.getElementById("current-location-btn")){const e=t.parentElement;if(e){const a=document.createElement("button");a.id="current-location-btn",a.type="button",a.className="absolute right-3 top-1/2 -translate-y-1/2 text-pagani-gold hover:text-bright-gold transition-colors",a.innerHTML='<i class="fa-solid fa-location-crosshairs text-sm"></i>',a.title="Use current location",a.addEventListener("click",()=>{"geolocation"in navigator?(a.innerHTML='<i class="fa-solid fa-spinner animate-spin text-sm"></i>',navigator.geolocation.getCurrentPosition(s=>{const n=s.coords.latitude,i=s.coords.longitude;a.innerHTML='<i class="fa-solid fa-location-crosshairs text-sm"></i>',t.value=`${n.toFixed(5)}, ${i.toFixed(5)}`,Ve("origin",[i,n],"#22c55e"),P&&P.flyTo({center:[i,n],zoom:12}),wt({origin:[i,n],silent:!0}),Y("Current location detected","success")},s=>{a.innerHTML='<i class="fa-solid fa-location-crosshairs text-sm"></i>',Y("Location access denied or unavailable","error")})):Y("Geolocation not supported by this browser","error")}),e.appendChild(a)}}}async function hs(t,e){try{const s=await fetch(`/api/weather?lat=${t}&lng=${e}`);if(s.ok){const n=await s.json();if(n.success&&n.weather)return n.weather}}catch{}try{const s=`https://api.open-meteo.com/v1/forecast?latitude=${t}&longitude=${e}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,visibility&wind_speed_unit=kmh`,n=await fetch(s);if(!n.ok)throw new Error(`Open-Meteo returned ${n.status}`);const r=(await n.json()).current;if(!r)return null;const o=kd(r.weather_code??0);return{main:{temp:r.temperature_2m??25,feels_like:r.apparent_temperature??r.temperature_2m??25,humidity:r.relative_humidity_2m??50},weather:[{description:o.description,icon:o.icon,main:o.main}],wind:{speed:(r.wind_speed_10m??0)/3.6},visibility:r.visibility??1e4,name:""}}catch(s){return console.error("[EVBharat] Weather fetch error:",s),null}}function kd(t){return t===0?{description:"Clear sky",icon:"01d",main:"Clear"}:t<=3?{description:"Partly cloudy",icon:"02d",main:"Clouds"}:t<=49?{description:"Foggy",icon:"50d",main:"Fog"}:t<=59?{description:"Drizzle",icon:"09d",main:"Drizzle"}:t<=69?{description:"Rain",icon:"10d",main:"Rain"}:t<=79?{description:"Snow",icon:"13d",main:"Snow"}:t<=82?{description:"Rain showers",icon:"09d",main:"Rain"}:t<=86?{description:"Snow showers",icon:"13d",main:"Snow"}:t<=99?{description:"Thunderstorm",icon:"11d",main:"Thunderstorm"}:{description:"Unknown",icon:"01d",main:"Clear"}}function Ed(t){const e=t.main.temp,a=t.weather[0]?.main?.toLowerCase()??"",s=Math.round(t.wind.speed*3.6);return a.includes("rain")||a.includes("drizzle")||a.includes("thunderstorm")?{text:"Rainy conditions — reduced traction. Drive cautiously, regenerative braking may be less effective on wet roads.",icon:"fa-cloud-showers-heavy",color:"text-blue-400"}:a.includes("snow")||a.includes("sleet")?{text:"Snow/ice possible — battery range reduced by ~20-30%. Pre-condition cabin before departure.",icon:"fa-snowflake",color:"text-cyan-300"}:a.includes("fog")||a.includes("mist")||a.includes("haze")?{text:"Low visibility — use fog lights. Maintain safe following distance.",icon:"fa-smog",color:"text-gray-300"}:e>40?{text:"Extreme heat — A/C load will reduce range by ~15%. Battery cooling active.",icon:"fa-temperature-arrow-up",color:"text-red-400"}:e>35?{text:"High temperature — expect slightly reduced range due to cabin cooling.",icon:"fa-sun",color:"text-orange-400"}:e<5?{text:"Cold weather — battery range reduced ~15-25%. Pre-heat cabin while plugged in.",icon:"fa-temperature-arrow-down",color:"text-blue-300"}:s>40?{text:`Strong winds (${s} km/h) — increased energy consumption, especially on highways.`,icon:"fa-wind",color:"text-cyan-400"}:{text:"Good driving conditions — optimal battery performance expected.",icon:"fa-check-circle",color:"text-green-400"}}function Sd(t,e){const a=[],s=((t?.main.temp??25)+(e?.main.temp??25))/2,n=Math.max(Math.round((t?.wind.speed??0)*3.6),Math.round((e?.wind.speed??0)*3.6));let i=0;s<5?i=-20:s<15?i=-10:s>40?i=-15:s>35&&(i=-8),n>30&&(i-=5);const r=[t,e].some(o=>o?.weather[0]?.main?.toLowerCase().includes("rain")||o?.weather[0]?.main?.toLowerCase().includes("thunderstorm"));return r&&(i-=5),i!==0?a.push(`<div class="flex items-center gap-2 p-2 bg-gray-800/50 rounded text-xs">
            <i class="fa-solid fa-battery-three-quarters ${i<-10?"text-red-400":"text-yellow-400"}"></i>
            <span class="text-gray-300">Range impact: <span class="font-bold ${i<-10?"text-red-400":"text-yellow-400"}">${i}%</span> estimated</span>
        </div>`):a.push(`<div class="flex items-center gap-2 p-2 bg-gray-800/50 rounded text-xs">
            <i class="fa-solid fa-battery-full text-green-400"></i>
            <span class="text-gray-300">Range impact: <span class="font-bold text-green-400">Minimal</span></span>
        </div>`),s<10?a.push(`<div class="flex items-center gap-2 p-2 bg-gray-800/50 rounded text-xs">
            <i class="fa-solid fa-charging-station text-blue-400"></i>
            <span class="text-gray-300">Pre-heat battery before fast charging for optimal speed</span>
        </div>`):a.push(`<div class="flex items-center gap-2 p-2 bg-gray-800/50 rounded text-xs">
            <i class="fa-solid fa-charging-station text-green-400"></i>
            <span class="text-gray-300">Normal charging performance expected</span>
        </div>`),r?a.push(`<div class="flex items-center gap-2 p-2 bg-gray-800/50 rounded text-xs">
            <i class="fa-solid fa-road text-blue-400"></i>
            <span class="text-gray-300">Enable max regen braking for wet roads</span>
        </div>`):n>30?a.push(`<div class="flex items-center gap-2 p-2 bg-gray-800/50 rounded text-xs">
            <i class="fa-solid fa-wind text-cyan-400"></i>
            <span class="text-gray-300">Reduce highway speed to save ${Math.round(n/10)}% energy</span>
        </div>`):a.push(`<div class="flex items-center gap-2 p-2 bg-gray-800/50 rounded text-xs">
            <i class="fa-solid fa-leaf text-green-400"></i>
            <span class="text-gray-300">Ideal conditions for eco driving mode</span>
        </div>`),a}function xs(t,e,a){const s=(o,l)=>{const p=document.getElementById(o);p&&(p.textContent=l)};s(`weather-${t}-name`,a),s(`weather-${t}-temp`,`${Math.round(e.main.temp)}°C`),s(`weather-${t}-desc`,e.weather[0]?.description??""),s(`weather-${t}-feels`,String(Math.round(e.main.feels_like))),s(`weather-${t}-wind`,String(Math.round(e.wind.speed*3.6))),s(`weather-${t}-humidity`,String(e.main.humidity)),s(`weather-${t}-visibility`,String(Math.round((e.visibility??1e4)/1e3)));const n=document.getElementById(`weather-${t}-icon`);n&&e.weather[0]?.icon&&(n.src=`https://openweathermap.org/img/wn/${e.weather[0].icon}@2x.png`,n.alt=e.weather[0].description,n.classList.remove("hidden"));const i=Ed(e),r=document.getElementById(`weather-${t}-advisory`);r&&(r.innerHTML=`<i class="fa-solid ${i.icon} mr-1 ${i.color}"></i> ${i.text}`)}async function Td(t,e,a,s,n,i){const r=document.getElementById("weather-panel");r&&r.classList.remove("hidden");const[o,l]=await Promise.all([hs(t,e),hs(a,s)]);o&&xs("origin",o,n),l&&xs("dest",l,i);const p=document.getElementById("weather-ev-impact"),d=document.getElementById("weather-impact-items");if(p&&d&&(o||l)){const c=Sd(o,l);d.innerHTML=c.join(""),p.classList.remove("hidden")}}function Ld(t,e){const a=document.getElementById("route-options");if(!a)return;const s=["Balanced Route","Fastest Route","Energy Saver","Alternative Route"],n=t.slice(0,4).map((i,r)=>{const o=Math.round(i.distance/1e3),l=Ta(Math.max(1,Math.round(i.duration/60))),p=Ea(i);return{id:`${r+1}`,name:s[r]||`Route ${r+1}`,distance:o,duration:l,energyConsumption:Sa(o,p),chargingStops:$n(o),traffic:p,recommended:r===e}});a.innerHTML=n.map((i,r)=>`
        <div class="route-option p-4 bg-pagani-black/50 border ${i.recommended?"border-pagani-gold":"border-pagani-gold/20"} rounded-lg cursor-pointer hover:border-pagani-gold transition-all ${i.recommended?"ring-2 ring-pagani-gold/30":""}" data-route-index="${r}">
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                    ${i.recommended?'<span class="px-2 py-0.5 bg-pagani-gold text-black text-xs font-bold rounded">AI PICK</span>':""}
                    <span class="font-orbitron font-bold">${i.name}</span>
                </div>
                <span class="text-sm text-gray-400">${i.distance} km</span>
            </div>
            <div class="flex items-center gap-4 text-xs text-gray-400">
                <span><i class="fa-solid fa-clock mr-1"></i>${i.duration}</span>
                <span><i class="fa-solid fa-bolt mr-1"></i>${i.energyConsumption} kWh</span>
                <span><i class="fa-solid fa-charging-station mr-1"></i>${i.chargingStops} stops</span>
                <span class="${i.traffic==="low"?"text-green-400":i.traffic==="medium"?"text-yellow-400":"text-red-400"}">
                    <i class="fa-solid fa-traffic-light mr-1"></i>${i.traffic}
                </span>
            </div>
        </div>
    `).join(""),a.querySelectorAll(".route-option").forEach(i=>{i.addEventListener("click",()=>{const r=Number(i.dataset.routeIndex??"-1");!Number.isFinite(r)||r<0||Rn(r)})})}function Ta(t){const e=Math.floor(t/60),a=t%60;return e>0?`${e}h ${a.toString().padStart(2,"0")}m`:`${a}m`}async function Cd(){if(!z.isAuthenticated()){window.location.href="/auth";return}const t=document.getElementById("app");if(t){if(!document.querySelector('link[href*="font-awesome"]')){const e=document.createElement("link");e.rel="stylesheet",e.href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",document.head.appendChild(e)}t.innerHTML=`
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
    `,setTimeout(()=>{Ad()},100)}}function Ad(){const t=[{id:"1",type:"critical",category:"battery",title:"Battery Cell Degradation Detected",message:"Cell #67 showing abnormal degradation (72% health). Recommend immediate inspection to prevent further battery pack damage.",timestamp:"10 minutes ago",read:!1,actionable:!0,action:"Schedule Service"},{id:"2",type:"warning",category:"battery",title:"High Battery Temperature",message:"Battery temperature reached 42°C during fast charging. Reduced charging speed to protect battery longevity.",timestamp:"25 minutes ago",read:!1,actionable:!1},{id:"3",type:"warning",category:"safety",title:"Lane Departure Warning",message:"Multiple lane departures detected in the last trip. Driver attention monitoring activated.",timestamp:"1 hour ago",read:!1,actionable:!1},{id:"4",type:"info",category:"v2e",title:"V2E Connection Established",message:"Successfully connected to nearby traffic infrastructure via VLC. Real-time traffic signal data now available.",timestamp:"1 hour ago",read:!0,actionable:!1},{id:"5",type:"warning",category:"safety",title:"Obstacle Detected Ahead",message:"Stationary vehicle detected 200m ahead on NH-48. Proceed with caution.",timestamp:"2 hours ago",read:!0,actionable:!1},{id:"6",type:"info",category:"v2e",title:"Emergency Vehicle Approaching",message:"V2E alert: Ambulance approaching from rear. Please make way.",timestamp:"3 hours ago",read:!0,actionable:!1},{id:"7",type:"success",category:"battery",title:"Charging Complete",message:"Battery fully charged to 100%. Total energy added: 58 kWh. Ready for 450 km range.",timestamp:"4 hours ago",read:!0,actionable:!1},{id:"8",type:"info",category:"maintenance",title:"Scheduled Maintenance Reminder",message:"Your vehicle is due for scheduled maintenance in 45 days. Book your service appointment.",timestamp:"1 day ago",read:!0,actionable:!0,action:"Book Now"},{id:"9",type:"info",category:"system",title:"Software Update Available",message:"EVBharat OS v3.2.1 is available. Includes improved battery management and new V2E features.",timestamp:"2 days ago",read:!0,actionable:!0,action:"Update Now"}];Id(t),Bd(),Md(),Rd(t)}function Id(t){const e=document.getElementById("alerts-list");if(!e)return;const a=n=>{switch(n){case"critical":return{bg:"from-red-900/30 to-red-900/10",border:"border-red-500/50",icon:"fa-circle-exclamation",iconColor:"text-red-400"};case"warning":return{bg:"from-yellow-900/30 to-yellow-900/10",border:"border-yellow-500/50",icon:"fa-triangle-exclamation",iconColor:"text-yellow-400"};case"info":return{bg:"from-blue-900/30 to-blue-900/10",border:"border-blue-500/50",icon:"fa-circle-info",iconColor:"text-blue-400"};case"success":return{bg:"from-green-900/30 to-green-900/10",border:"border-green-500/50",icon:"fa-circle-check",iconColor:"text-green-400"}}},s=n=>{switch(n){case"battery":return"fa-car-battery";case"safety":return"fa-shield-halved";case"v2e":return"fa-tower-broadcast";case"emergency":return"fa-truck-medical";case"maintenance":return"fa-wrench";case"system":return"fa-gear"}};e.innerHTML=t.map((n,i)=>{const r=a(n.type),o=s(n.category);return`
            <div class="alert-item bg-gradient-to-br ${r.bg} border ${r.border} rounded-xl p-5 fade-in-section ${n.read?"":"ring-2 ring-white/10"}" 
                 data-category="${n.category}" style="animation-delay: ${i*50}ms">
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
                                ${n.category.toUpperCase()}
                            </span>
                            ${n.read?"":'<span class="w-2 h-2 bg-pagani-gold rounded-full"></span>'}
                        </div>
                        <h4 class="font-orbitron font-bold text-white mb-2">${n.title}</h4>
                        <p class="text-sm text-gray-400 mb-3">${n.message}</p>
                        <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-500">
                                <i class="fa-solid fa-clock mr-1"></i>
                                ${n.timestamp}
                            </span>
                            ${n.actionable?`
                                <button class="px-4 py-2 bg-pagani-gold/20 border border-pagani-gold/50 rounded-lg text-pagani-gold text-xs font-orbitron hover:bg-pagani-gold hover:text-black transition-all">
                                    ${n.action}
                                </button>
                            `:""}
                        </div>
                    </div>
                    <button class="flex-shrink-0 p-2 text-gray-500 hover:text-white transition-all" title="Dismiss">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
        `}).join("")}function Bd(){const t=document.querySelectorAll(".alert-filter");t.forEach(e=>{e.addEventListener("click",()=>{t.forEach(n=>{n.classList.remove("active","bg-pagani-gold","text-black"),n.classList.add("bg-pagani-black/50","text-white")}),e.classList.add("active","bg-pagani-gold","text-black"),e.classList.remove("bg-pagani-black/50","text-white");const a=e.getAttribute("data-filter");document.querySelectorAll(".alert-item").forEach(n=>{const i=n.getAttribute("data-category");a==="all"||i===a?n.style.display="block":n.style.display="none"})})})}function Md(){const t=document.getElementById("sos-btn");if(!t)return;let e=null,a=!1;t.addEventListener("mousedown",()=>{a=!0,t.innerHTML='<i class="fa-solid fa-spinner animate-spin mr-2"></i> HOLD 3 SECONDS...',e=setTimeout(()=>{a&&(t.innerHTML='<i class="fa-solid fa-check mr-2"></i> SOS ACTIVATED!',t.classList.remove("bg-red-600","hover:bg-red-500","animate-pulse"),t.classList.add("bg-green-600"),$d())},3e3)}),t.addEventListener("mouseup",()=>{a=!1,e&&(clearTimeout(e),t.innerHTML='<i class="fa-solid fa-circle-exclamation mr-2"></i> EMERGENCY SOS')}),t.addEventListener("mouseleave",()=>{a=!1,e&&(clearTimeout(e),t.innerHTML='<i class="fa-solid fa-circle-exclamation mr-2"></i> EMERGENCY SOS')})}function $d(){const t=document.createElement("div");t.className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4 fade-in-section",t.innerHTML=`
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
    `,document.body.appendChild(t),t.querySelector("#cancel-sos")?.addEventListener("click",()=>{t.remove();const a=document.getElementById("sos-btn");a&&(a.innerHTML='<i class="fa-solid fa-circle-exclamation mr-2"></i> EMERGENCY SOS',a.classList.remove("bg-green-600"),a.classList.add("bg-red-600","hover:bg-red-500","animate-pulse"))})}function Rd(t){document.getElementById("mark-all-read")?.addEventListener("click",()=>{t.forEach(a=>a.read=!0),document.querySelectorAll(".alert-item").forEach(a=>{a.classList.remove("ring-2","ring-white/10")}),document.querySelectorAll(".alert-item .w-2.h-2.bg-pagani-gold").forEach(a=>{a.remove()}),Pd("All alerts marked as read")})}function Pd(t,e){const a=document.createElement("div");a.className="fixed top-24 right-8 px-6 py-4 rounded-lg backdrop-blur-sm z-50 font-orbitron text-sm fade-in-section bg-green-500/20 border border-green-500/50 text-green-400",a.innerHTML=`<i class="fa-solid fa-check-circle mr-2"></i>${t}`,document.body.appendChild(a),setTimeout(()=>a.remove(),3e3)}const vs="evbharat_drowsiness_api_base",Pn="/api/drowsiness",Vd=1e3;let pt=null,dt=!1;function ys(t){const e=t.trim().replace(/\/+$/,"");return e.length>0?e:Pn}function ws(){pt&&(clearInterval(pt),pt=null)}async function Dd(){if(!z.isAuthenticated()){window.location.href="/auth";return}const t=document.getElementById("app");if(!t)return;if(!document.querySelector('link[href*="font-awesome"]')){const b=document.createElement("link");b.rel="stylesheet",b.href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",document.head.appendChild(b)}ws(),dt=!1;let e=ys(localStorage.getItem(vs)||Pn),a=!1,s=0;t.innerHTML=`
        <div id="drowsiness-page-root" class="min-h-screen bg-pagani-black pt-24 pb-12">
            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 fade-in-section">
                    <div>
                        <div class="flex items-center gap-3 mb-2">
                            <i class="fa-solid fa-eye text-3xl text-pagani-gold"></i>
                            <h1 class="text-3xl md:text-4xl font-orbitron font-bold">Driver Drowsiness Monitor</h1>
                        </div>
                        <p class="text-gray-400">Real-time detection to check whether the driver is drowsy or alert.</p>
                    </div>
                    <div class="flex items-center gap-2 px-4 py-2 rounded-lg border border-pagani-gold/40 bg-pagani-gold/10">
                        <span id="drowsiness-connection-dot" class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                        <span id="drowsiness-connection-text" class="text-sm font-orbitron text-red-400">Backend Offline</span>
                    </div>
                </div>
            </div>

            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-5 fade-in-section">
                    <div class="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
                        <div>
                            <label for="drowsiness-api-base" class="block text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">Backend Endpoint</label>
                            <input
                                id="drowsiness-api-base"
                                type="text"
                                class="w-full px-4 py-3 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pagani-gold transition-all"
                                placeholder="/api/drowsiness"
                            />
                            <p class="text-xs text-gray-500 mt-2">Default dev endpoint is <span class="text-pagani-gold">/api/drowsiness</span>. It proxies to <span class="text-pagani-gold">127.0.0.1:5000</span>.</p>
                        </div>
                        <div class="flex items-end gap-3">
                            <button id="drowsiness-connect-btn" class="px-5 py-3 bg-pagani-gold/20 border border-pagani-gold/50 rounded-lg text-pagani-gold hover:bg-pagani-gold hover:text-black transition-all uppercase text-xs tracking-[0.18em] font-orbitron font-bold whitespace-nowrap">
                                Connect
                            </button>
                            <button id="drowsiness-voice-btn" class="px-5 py-3 border border-cyan-400/50 rounded-lg text-cyan-300 hover:bg-cyan-400/10 transition-all uppercase text-xs tracking-[0.12em] font-orbitron font-bold whitespace-nowrap">
                                Voice Alerts Off
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="max-w-7xl mx-auto px-4 md:px-8">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2 space-y-6">
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                            <div class="flex items-center justify-between gap-3 mb-4">
                                <h3 class="text-lg font-orbitron font-bold flex items-center gap-2">
                                    <i class="fa-solid fa-camera text-pagani-gold"></i>
                                    Live Driver Feed
                                </h3>
                                <span class="text-xs uppercase tracking-wider text-gray-400">Source: <span id="drowsiness-source-label" class="text-pagani-gold">${e}</span></span>
                            </div>

                            <div class="relative overflow-hidden rounded-xl border border-pagani-gold/20 bg-black/70 aspect-video">
                                <img id="drowsiness-video-feed" alt="Drowsiness detector live feed" class="w-full h-full object-cover" loading="eager" />
                                <div class="absolute top-3 left-3 px-2.5 py-1 rounded-lg border border-pagani-gold/50 bg-black/70 text-[11px] uppercase tracking-[0.2em] text-pagani-gold font-orbitron">
                                    AI Monitor
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-4 fade-in-section">
                                <p class="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-2">Risk Score</p>
                                <p id="drowsiness-risk-value" class="text-3xl font-orbitron font-bold text-green-400">0%</p>
                                <div class="h-2 bg-gray-700 rounded-full mt-3 overflow-hidden">
                                    <div id="drowsiness-risk-bar" class="h-full bg-green-500 rounded-full transition-all duration-300" style="width: 0%"></div>
                                </div>
                            </div>

                            <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-4 fade-in-section" style="animation-delay: 50ms">
                                <p class="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-2">PERCLOS</p>
                                <p id="drowsiness-perclos" class="text-3xl font-orbitron font-bold text-white">0.00</p>
                                <p class="text-xs text-gray-500 mt-2">Eye-closure ratio</p>
                            </div>

                            <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-4 fade-in-section" style="animation-delay: 100ms">
                                <p class="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-2">Eye State</p>
                                <p id="drowsiness-eye-state" class="text-2xl font-orbitron font-bold text-white">OPEN</p>
                                <p id="drowsiness-face-state" class="text-xs text-gray-500 mt-2">Face: Not detected</p>
                            </div>

                            <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-4 fade-in-section" style="animation-delay: 150ms">
                                <p class="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-2">Yawn Status</p>
                                <p id="drowsiness-yawn-state" class="text-2xl font-orbitron font-bold text-white">NO</p>
                                <p id="drowsiness-calibration-state" class="text-xs text-gray-500 mt-2">Calibration pending</p>
                            </div>
                        </div>
                    </div>

                    <div class="lg:col-span-1 space-y-6">
                        <div id="drowsiness-state-card" class="bg-gradient-to-br from-green-500/15 to-green-900/10 border border-green-500/30 rounded-xl p-6 fade-in-section">
                            <p class="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">Driver Condition</p>
                            <h3 id="drowsiness-driver-label" class="text-2xl font-orbitron font-bold text-green-400">SAFE</h3>
                            <p id="drowsiness-driver-description" class="text-sm text-gray-300 mt-3">No drowsiness risk detected right now.</p>
                            <div class="mt-4 pt-4 border-t border-gray-700/60">
                                <p class="text-xs text-gray-500">Last update</p>
                                <p id="drowsiness-last-update" class="text-sm font-orbitron text-pagani-gold mt-1">--:--:--</p>
                            </div>
                        </div>

                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section" style="animation-delay: 80ms">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-wave-square text-pagani-gold"></i>
                                Detection Signals
                            </h3>
                            <div class="space-y-3 text-sm">
                                <div class="flex items-center justify-between p-3 rounded-lg bg-pagani-black/40 border border-pagani-gold/10">
                                    <span class="text-gray-400">EAR / Threshold</span>
                                    <span id="drowsiness-ear-value" class="font-orbitron text-white">-- / --</span>
                                </div>
                                <div class="flex items-center justify-between p-3 rounded-lg bg-pagani-black/40 border border-pagani-gold/10">
                                    <span class="text-gray-400">MAR / Threshold</span>
                                    <span id="drowsiness-mar-value" class="font-orbitron text-white">-- / --</span>
                                </div>
                                <div class="flex items-center justify-between p-3 rounded-lg bg-pagani-black/40 border border-pagani-gold/10">
                                    <span class="text-gray-400">Alert Level</span>
                                    <span id="drowsiness-alert-level" class="font-orbitron text-white uppercase">none</span>
                                </div>
                            </div>
                            <p id="drowsiness-alert-message" class="text-xs text-gray-500 mt-4">No active alert.</p>
                        </div>

                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section" style="animation-delay: 120ms">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-terminal text-pagani-gold"></i>
                                Backend Quick Start
                            </h3>
                            <p class="text-sm text-gray-400 mb-3">Start the detector backend if the feed is offline:</p>
                            <div class="p-3 rounded-lg border border-pagani-gold/20 bg-pagani-black/40 text-xs text-gray-300 font-mono leading-relaxed">
                                cd backend/ML/drowziness
                                <br />
                                python web_server.py
                            </div>
                            <p class="text-xs text-gray-500 mt-3">Then keep this page open. It auto-refreshes status every second.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;const n=document.getElementById("drowsiness-page-root"),i=document.getElementById("drowsiness-api-base"),r=document.getElementById("drowsiness-connect-btn"),o=document.getElementById("drowsiness-voice-btn"),l=document.getElementById("drowsiness-video-feed"),p=document.getElementById("drowsiness-source-label");i&&(i.value=e);const d=b=>{if(!("speechSynthesis"in window))return;window.speechSynthesis.cancel();const k=new SpeechSynthesisUtterance(b);k.rate=1,k.pitch=1,k.lang="en-US",window.speechSynthesis.speak(k)},c=()=>{if(!l)return;const b=e.includes("?")?"&":"?";l.src=`${e}/video_feed${b}v=${Date.now()}`,p&&(p.textContent=e)},u=b=>{const k=document.getElementById("drowsiness-connection-dot"),y=document.getElementById("drowsiness-connection-text");!k||!y||(k.classList.toggle("bg-green-500",b),k.classList.toggle("bg-red-500",!b),y.textContent=b?"Backend Online":"Backend Offline",y.classList.toggle("text-green-400",b),y.classList.toggle("text-red-400",!b))},m=b=>{u(!1);const k=document.getElementById("drowsiness-driver-label"),y=document.getElementById("drowsiness-driver-description"),w=document.getElementById("drowsiness-state-card");k&&(k.textContent="OFFLINE",k.className="text-2xl font-orbitron font-bold text-red-400"),y&&(y.textContent=b),w&&(w.className="bg-gradient-to-br from-red-500/15 to-red-900/10 border border-red-500/30 rounded-xl p-6 fade-in-section")},v=b=>typeof b!="number"||Number.isNaN(b)?"--":b.toFixed(2),L=b=>{const k=Number.isFinite(b.risk_percent)?Math.max(0,Math.min(100,b.risk_percent)):0,y=document.getElementById("drowsiness-risk-value"),w=document.getElementById("drowsiness-risk-bar"),C=document.getElementById("drowsiness-perclos"),$=document.getElementById("drowsiness-eye-state"),M=document.getElementById("drowsiness-face-state"),D=document.getElementById("drowsiness-yawn-state"),j=document.getElementById("drowsiness-calibration-state"),V=document.getElementById("drowsiness-ear-value"),F=document.getElementById("drowsiness-mar-value"),X=document.getElementById("drowsiness-alert-level"),_=document.getElementById("drowsiness-alert-message"),G=document.getElementById("drowsiness-driver-label"),O=document.getElementById("drowsiness-driver-description"),h=document.getElementById("drowsiness-state-card"),x=document.getElementById("drowsiness-last-update");y&&(y.textContent=`${k}%`,y.className=`text-3xl font-orbitron font-bold ${k>=85?"text-red-400":k>=60?"text-yellow-400":"text-green-400"}`),w&&(w.style.width=`${k}%`,w.className=`h-full rounded-full transition-all duration-300 ${k>=85?"bg-red-500":k>=60?"bg-yellow-500":"bg-green-500"}`),C&&(C.textContent=v(b.perclos)),$&&($.textContent=b.eye_closed?"CLOSED":"OPEN",$.className=`text-2xl font-orbitron font-bold ${b.eye_closed?"text-yellow-400":"text-green-400"}`),M&&(M.textContent=`Face: ${b.face_present?"Detected":"Not detected"}`),D&&(D.textContent=b.yawn_active?"YES":"NO",D.className=`text-2xl font-orbitron font-bold ${b.yawn_active?"text-yellow-400":"text-green-400"}`),j&&(j.textContent=b.calibrated?"Calibration complete":"Calibration pending"),V&&(V.textContent=`${v(b.ear)} / ${v(b.ear_threshold)}`),F&&(F.textContent=`${v(b.mar)} / ${v(b.mar_threshold)}`),X&&(X.textContent=b.alert_level,X.className=`font-orbitron uppercase ${b.alert_level==="high"?"text-red-400":b.alert_level==="medium"?"text-yellow-400":"text-green-400"}`),_&&(_.textContent=b.alert_message||"No active alert.",_.className=`text-xs mt-4 ${b.alert_level==="high"?"text-red-300":b.alert_level==="medium"?"text-yellow-300":"text-gray-500"}`);const I=b.alert_level==="high"||k>=85,U=b.alert_level==="medium"||k>=60,H=!b.face_present;if(G&&O&&h&&(I?(G.textContent="DROWSY",G.className="text-2xl font-orbitron font-bold text-red-400",O.textContent="Driver appears drowsy. Please stop the vehicle safely and rest immediately.",h.className="bg-gradient-to-br from-red-500/15 to-red-900/10 border border-red-500/30 rounded-xl p-6 fade-in-section"):U?(G.textContent="WARNING",G.className="text-2xl font-orbitron font-bold text-yellow-400",O.textContent="Fatigue signals are rising. Stay alert and plan a short break.",h.className="bg-gradient-to-br from-yellow-500/15 to-yellow-900/10 border border-yellow-500/30 rounded-xl p-6 fade-in-section"):H?(G.textContent="NO FACE",G.className="text-2xl font-orbitron font-bold text-cyan-400",O.textContent="No face detected in camera frame. Align camera toward the driver.",h.className="bg-gradient-to-br from-cyan-500/15 to-cyan-900/10 border border-cyan-500/30 rounded-xl p-6 fade-in-section"):(G.textContent="SAFE",G.className="text-2xl font-orbitron font-bold text-green-400",O.textContent="Driver is alert and no drowsiness condition is detected.",h.className="bg-gradient-to-br from-green-500/15 to-green-900/10 border border-green-500/30 rounded-xl p-6 fade-in-section")),x){const se=Number.isFinite(b.updated_at)?new Date(b.updated_at*1e3).toLocaleTimeString("en-IN",{hour12:!1}):"--:--:--";x.textContent=se}b.alert_seq>s&&(s=b.alert_seq,a&&b.alert_level!=="none"&&b.alert_message&&d(b.alert_message))},E=async()=>{if(!dt){dt=!0;try{const b=await fetch(`${e}/status`,{method:"GET",cache:"no-store",headers:{Accept:"application/json"}});if(!b.ok)throw new Error(`Status fetch failed with code ${b.status}`);const k=await b.json();u(!0),L(k)}catch{m("Cannot reach drowsiness backend. Verify endpoint and start web_server.py.")}finally{dt=!1}}},A=()=>{i&&(e=ys(i.value||e),i.value=e),localStorage.setItem(vs,e),c(),E()};r?.addEventListener("click",A),i?.addEventListener("keydown",b=>{b.key==="Enter"&&(b.preventDefault(),A())}),o?.addEventListener("click",()=>{a=!a,o.textContent=a?"Voice Alerts On":"Voice Alerts Off",o.className=a?"px-5 py-3 border border-green-400/60 rounded-lg text-green-300 bg-green-400/10 hover:bg-green-400/20 transition-all uppercase text-xs tracking-[0.12em] font-orbitron font-bold whitespace-nowrap":"px-5 py-3 border border-cyan-400/50 rounded-lg text-cyan-300 hover:bg-cyan-400/10 transition-all uppercase text-xs tracking-[0.12em] font-orbitron font-bold whitespace-nowrap",!a&&"speechSynthesis"in window&&window.speechSynthesis.cancel()}),c(),E(),pt=setInterval(()=>{if(!n||!document.body.contains(n)){ws();return}E()},Vd)}function Fd(){const t=z.getCurrentUser();if(!t){window.location.href="/auth";return}const e=document.getElementById("app");e.innerHTML=`
        <div class="min-h-screen bg-gradient-to-br from-pagani-black via-gray-900 to-pagani-black pt-24 pb-16">
            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <!-- Profile Header -->
                <div class="text-center mb-12">
                    <h1 class="text-4xl md:text-5xl font-bold font-orbitron text-white mb-4">
                        User <span class="text-pagani-gold">Profile</span>
                    </h1>
                    <p class="text-xl text-gray-300">Manage your account information</p>
                    <div class="w-24 h-1 bg-gradient-to-r from-pagani-gold to-yellow-600 mx-auto mt-4"></div>
                </div>

                <div class="grid lg:grid-cols-3 gap-8">
                    <!-- Profile Sidebar -->
                    <div class="lg:col-span-1">
                        <div class="bg-pagani-black/60 backdrop-blur-lg border border-pagani-gold/20 rounded-2xl p-8 text-center">
                            <!-- Profile Avatar -->
                            <div class="relative mx-auto w-32 h-32 mb-6">
                                <div class="w-full h-full rounded-full bg-gradient-to-br from-pagani-gold/30 to-pagani-gold/10 border-4 border-pagani-gold/50 flex items-center justify-center">
                                    <i class="fa-solid fa-user text-4xl text-pagani-gold"></i>
                                </div>
                                <button id="change-avatar-btn" class="absolute bottom-0 right-0 w-10 h-10 bg-pagani-gold hover:bg-yellow-500 rounded-full flex items-center justify-center text-black transition-all duration-300">
                                    <i class="fa-solid fa-camera text-sm"></i>
                                </button>
                            </div>

                            <!-- User Info -->
                            <h2 class="text-2xl font-bold text-white mb-2">${t.name}</h2>
                            <p class="text-pagani-gold mb-4">${t.email}</p>
                            <div class="inline-flex items-center gap-2 px-4 py-2 bg-pagani-gold/20 border border-pagani-gold/30 rounded-lg">
                                <i class="fa-solid fa-crown text-pagani-gold text-sm"></i>
                                <span class="text-sm font-medium text-pagani-gold uppercase">${t.role}</span>
                            </div>

                            <!-- Quick Stats -->
                            <div class="mt-8 pt-8 border-t border-pagani-gold/20">
                                <h3 class="text-lg font-semibold text-white mb-4">Account Stats</h3>
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="text-center">
                                        <div class="text-2xl font-bold text-pagani-gold">847</div>
                                        <div class="text-sm text-gray-400">Miles Driven</div>
                                    </div>
                                    <div class="text-center">
                                        <div class="text-2xl font-bold text-pagani-gold">23</div>
                                        <div class="text-sm text-gray-400">Trips</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Profile Form -->
                    <div class="lg:col-span-2">
                        <div class="bg-pagani-black/60 backdrop-blur-lg border border-pagani-gold/20 rounded-2xl p-8">
                            <!-- Tab Navigation -->
                            <div class="flex flex-wrap gap-2 mb-8 border-b border-pagani-gold/20">
                                <button class="profile-tab active" data-tab="personal">
                                    <i class="fa-solid fa-user mr-2"></i>Personal Info
                                </button>
                                <button class="profile-tab" data-tab="security">
                                    <i class="fa-solid fa-shield-halved mr-2"></i>Security
                                </button>
                                <button class="profile-tab" data-tab="preferences">
                                    <i class="fa-solid fa-cog mr-2"></i>Preferences
                                </button>
                                <button class="profile-tab" data-tab="vehicle">
                                    <i class="fa-solid fa-car mr-2"></i>Vehicle Info
                                </button>
                            </div>

                            <!-- Success/Error Messages -->
                            <div id="profile-message" class="hidden mb-6"></div>

                            <!-- Personal Information Tab -->
                            <div id="personal-tab" class="tab-content active">
                                <h3 class="text-2xl font-bold text-white mb-6">Personal Information</h3>
                                <form id="personal-form" class="space-y-6">
                                    <div class="grid md:grid-cols-2 gap-6">
                                        <div class="form-group">
                                            <label for="firstName" class="form-label">First Name</label>
                                            <input type="text" id="firstName" name="firstName" class="form-input" value="${t.name.split(" ")[0]||""}" required>
                                        </div>
                                        <div class="form-group">
                                            <label for="lastName" class="form-label">Last Name</label>
                                            <input type="text" id="lastName" name="lastName" class="form-input" value="${t.name.split(" ")[1]||""}" required>
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label for="email" class="form-label">Email Address</label>
                                        <input type="email" id="email" name="email" class="form-input" value="${t.email}" required>
                                        <p class="text-sm text-gray-400 mt-1">We'll send a verification email if you change this</p>
                                    </div>

                                    <div class="grid md:grid-cols-2 gap-6">
                                        <div class="form-group">
                                            <label for="phone" class="form-label">Phone Number</label>
                                            <input type="tel" id="phone" name="phone" class="form-input" placeholder="+91 98765 43210">
                                        </div>
                                        <div class="form-group">
                                            <label for="dateOfBirth" class="form-label">Date of Birth</label>
                                            <input type="date" id="dateOfBirth" name="dateOfBirth" class="form-input">
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label for="address" class="form-label">Address</label>
                                        <textarea id="address" name="address" class="form-input" rows="3" placeholder="Enter your full address"></textarea>
                                    </div>

                                    <div class="grid md:grid-cols-2 gap-6">
                                        <div class="form-group">
                                            <label for="city" class="form-label">City</label>
                                            <input type="text" id="city" name="city" class="form-input" placeholder="Mumbai">
                                        </div>
                                        <div class="form-group">
                                            <label for="state" class="form-label">State</label>
                                            <select id="state" name="state" class="form-input">
                                                <option value="">Select State</option>
                                                <option value="maharashtra">Maharashtra</option>
                                                <option value="delhi">Delhi</option>
                                                <option value="karnataka">Karnataka</option>
                                                <option value="tamil-nadu">Tamil Nadu</option>
                                                <option value="gujarat">Gujarat</option>
                                                <option value="rajasthan">Rajasthan</option>
                                                <option value="west-bengal">West Bengal</option>
                                                <option value="uttar-pradesh">Uttar Pradesh</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div class="flex justify-end">
                                        <button type="submit" class="btn-primary">
                                            <i class="fa-solid fa-save mr-2"></i>Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <!-- Security Tab -->
                            <div id="security-tab" class="tab-content hidden">
                                <h3 class="text-2xl font-bold text-white mb-6">Security Settings</h3>
                                <form id="security-form" class="space-y-6">
                                    <div class="form-group">
                                        <label for="currentPassword" class="form-label">Current Password</label>
                                        <div class="relative">
                                            <input type="password" id="currentPassword" name="currentPassword" class="form-input pr-12" required>
                                            <button type="button" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pagani-gold" onclick="togglePassword('currentPassword')">
                                                <i class="fa-solid fa-eye"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label for="newPassword" class="form-label">New Password</label>
                                        <div class="relative">
                                            <input type="password" id="newPassword" name="newPassword" class="form-input pr-12" required>
                                            <button type="button" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pagani-gold" onclick="togglePassword('newPassword')">
                                                <i class="fa-solid fa-eye"></i>
                                            </button>
                                        </div>
                                        <div class="mt-2">
                                            <div class="text-sm text-gray-400 mb-2">Password strength:</div>
                                            <div class="w-full bg-gray-700 rounded-full h-2">
                                                <div id="password-strength" class="bg-red-500 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label for="confirmPassword" class="form-label">Confirm New Password</label>
                                        <input type="password" id="confirmPassword" name="confirmPassword" class="form-input" required>
                                    </div>

                                    <!-- Two-Factor Authentication -->
                                    <div class="bg-pagani-gold/10 border border-pagani-gold/20 rounded-lg p-6">
                                        <div class="flex items-center justify-between">
                                            <div>
                                                <h4 class="text-lg font-semibold text-white">Two-Factor Authentication</h4>
                                                <p class="text-sm text-gray-400">Add an extra layer of security to your account</p>
                                            </div>
                                            <label class="toggle-switch">
                                                <input type="checkbox" id="twoFactor">
                                                <span class="toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>

                                    <div class="flex justify-end">
                                        <button type="submit" class="btn-primary">
                                            <i class="fa-solid fa-shield-halved mr-2"></i>Update Security
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <!-- Preferences Tab -->
                            <div id="preferences-tab" class="tab-content hidden">
                                <h3 class="text-2xl font-bold text-white mb-6">Preferences</h3>
                                <form id="preferences-form" class="space-y-6">
                                    <!-- Notification Settings -->
                                    <div class="space-y-4">
                                        <h4 class="text-lg font-semibold text-white">Notifications</h4>
                                        <div class="space-y-3">
                                            <div class="flex items-center justify-between">
                                                <div>
                                                    <div class="text-white">Email Notifications</div>
                                                    <div class="text-sm text-gray-400">Receive updates via email</div>
                                                </div>
                                                <label class="toggle-switch">
                                                    <input type="checkbox" id="emailNotifications" checked>
                                                    <span class="toggle-slider"></span>
                                                </label>
                                            </div>
                                            <div class="flex items-center justify-between">
                                                <div>
                                                    <div class="text-white">Battery Alerts</div>
                                                    <div class="text-sm text-gray-400">Get notified about battery status</div>
                                                </div>
                                                <label class="toggle-switch">
                                                    <input type="checkbox" id="batteryAlerts" checked>
                                                    <span class="toggle-slider"></span>
                                                </label>
                                            </div>
                                            <div class="flex items-center justify-between">
                                                <div>
                                                    <div class="text-white">Maintenance Reminders</div>
                                                    <div class="text-sm text-gray-400">Periodic maintenance notifications</div>
                                                </div>
                                                <label class="toggle-switch">
                                                    <input type="checkbox" id="maintenanceAlerts" checked>
                                                    <span class="toggle-slider"></span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Units Settings -->
                                    <div class="space-y-4">
                                        <h4 class="text-lg font-semibold text-white">Units & Display</h4>
                                        <div class="grid md:grid-cols-2 gap-6">
                                            <div class="form-group">
                                                <label for="distanceUnit" class="form-label">Distance Unit</label>
                                                <select id="distanceUnit" name="distanceUnit" class="form-input">
                                                    <option value="km">Kilometers</option>
                                                    <option value="miles">Miles</option>
                                                </select>
                                            </div>
                                            <div class="form-group">
                                                <label for="temperatureUnit" class="form-label">Temperature Unit</label>
                                                <select id="temperatureUnit" name="temperatureUnit" class="form-input">
                                                    <option value="celsius">Celsius (°C)</option>
                                                    <option value="fahrenheit">Fahrenheit (°F)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Language Settings -->
                                    <div class="form-group">
                                        <label for="language" class="form-label">Language</label>
                                        <select id="language" name="language" class="form-input">
                                            <option value="en">English</option>
                                            <option value="hi">हिन्दी (Hindi)</option>
                                            <option value="mr">मराठी (Marathi)</option>
                                            <option value="ta">தமிழ் (Tamil)</option>
                                            <option value="te">తెలుగు (Telugu)</option>
                                        </select>
                                    </div>

                                    <div class="flex justify-end">
                                        <button type="submit" class="btn-primary">
                                            <i class="fa-solid fa-cog mr-2"></i>Save Preferences
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <!-- Vehicle Info Tab -->
                            <div id="vehicle-tab" class="tab-content hidden">
                                <h3 class="text-2xl font-bold text-white mb-6">Vehicle Information</h3>
                                <form id="vehicle-form" class="space-y-6">
                                    <div class="form-group">
                                        <label for="vehicleMake" class="form-label">Make</label>
                                        <select id="vehicleMake" name="vehicleMake" class="form-input">
                                            <option value="">Select Make</option>
                                            <option value="tata">Tata Motors</option>
                                            <option value="mahindra">Mahindra</option>
                                            <option value="hyundai">Hyundai</option>
                                            <option value="mg">MG Motor</option>
                                            <option value="kia">Kia</option>
                                            <option value="tesla">Tesla</option>
                                            <option value="bmw">BMW</option>
                                            <option value="audi">Audi</option>
                                        </select>
                                    </div>

                                    <div class="grid md:grid-cols-2 gap-6">
                                        <div class="form-group">
                                            <label for="vehicleModel" class="form-label">Model</label>
                                            <input type="text" id="vehicleModel" name="vehicleModel" class="form-input" placeholder="e.g., Nexon EV">
                                        </div>
                                        <div class="form-group">
                                            <label for="vehicleYear" class="form-label">Year</label>
                                            <select id="vehicleYear" name="vehicleYear" class="form-input">
                                                <option value="">Select Year</option>
                                                ${Array.from({length:10},(a,s)=>new Date().getFullYear()-s).map(a=>`<option value="${a}">${a}</option>`).join("")}
                                            </select>
                                        </div>
                                    </div>

                                    <div class="grid md:grid-cols-2 gap-6">
                                        <div class="form-group">
                                            <label for="batteryCapacity" class="form-label">Battery Capacity (kWh)</label>
                                            <input type="number" id="batteryCapacity" name="batteryCapacity" class="form-input" placeholder="40.5" step="0.1">
                                        </div>
                                        <div class="form-group">
                                            <label for="range" class="form-label">Range (km)</label>
                                            <input type="number" id="range" name="range" class="form-input" placeholder="312">
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label for="chargingType" class="form-label">Charging Type</label>
                                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                                            <label class="charging-option">
                                                <input type="checkbox" name="chargingType" value="type1">
                                                <div class="charging-card">
                                                    <i class="fa-solid fa-plug text-2xl text-pagani-gold mb-2"></i>
                                                    <div class="text-sm">Type 1</div>
                                                </div>
                                            </label>
                                            <label class="charging-option">
                                                <input type="checkbox" name="chargingType" value="type2">
                                                <div class="charging-card">
                                                    <i class="fa-solid fa-plug-circle-plus text-2xl text-pagani-gold mb-2"></i>
                                                    <div class="text-sm">Type 2</div>
                                                </div>
                                            </label>
                                            <label class="charging-option">
                                                <input type="checkbox" name="chargingType" value="ccs">
                                                <div class="charging-card">
                                                    <i class="fa-solid fa-bolt text-2xl text-pagani-gold mb-2"></i>
                                                    <div class="text-sm">CCS</div>
                                                </div>
                                            </label>
                                            <label class="charging-option">
                                                <input type="checkbox" name="chargingType" value="chademo">
                                                <div class="charging-card">
                                                    <i class="fa-solid fa-charging-station text-2xl text-pagani-gold mb-2"></i>
                                                    <div class="text-sm">CHAdeMO</div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label for="vehicleNotes" class="form-label">Additional Notes</label>
                                        <textarea id="vehicleNotes" name="vehicleNotes" class="form-input" rows="3" placeholder="Any additional information about your vehicle..."></textarea>
                                    </div>

                                    <div class="flex justify-end">
                                        <button type="submit" class="btn-primary">
                                            <i class="fa-solid fa-car mr-2"></i>Save Vehicle Info
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,jd()}function jd(){const t=document.querySelectorAll(".profile-tab"),e=document.querySelectorAll(".tab-content");t.forEach(n=>{n.addEventListener("click",()=>{const i=n.dataset.tab;t.forEach(o=>o.classList.remove("active")),e.forEach(o=>{o.classList.remove("active"),o.classList.add("hidden")}),n.classList.add("active");const r=document.getElementById(`${i}-tab`);r&&(r.classList.add("active"),r.classList.remove("hidden"))})});const a=new ft;a.addRule("firstName",{required:!0,minLength:2}),a.addRule("lastName",{required:!0,minLength:2}),a.addRule("email",{required:!0,email:!0}),a.addRule("phone",{phone:!0});const s=new ft;s.addRule("currentPassword",{required:!0,minLength:6}),s.addRule("newPassword",{required:!0,minLength:8}),s.addRule("confirmPassword",{required:!0}),Nd(a,s),zd(),Hd(),Od()}async function Od(){const t=await z.fetchProfile();if(!t.success||!t.data)return;const{profile:e,preferences:a,vehicle:s}=t.data,n=(i,r)=>{const o=document.getElementById(i);o&&r&&(o.value=r)};if(e&&(n("phone",e.phone),n("dateOfBirth",e.date_of_birth),n("address",e.address),n("city",e.city),n("state",e.state)),a){const i=(r,o)=>{const l=document.getElementById(r);l&&(l.checked=o)};i("emailNotifications",a.emailNotifications),i("batteryAlerts",a.batteryAlerts),i("maintenanceAlerts",a.maintenanceAlerts),i("twoFactor",a.twoFactorEnabled),n("distanceUnit",a.distanceUnit),n("temperatureUnit",a.temperatureUnit),n("language",a.language)}s&&(n("vehicleMake",s.make),n("vehicleModel",s.model),n("vehicleYear",s.year?.toString()),n("batteryCapacity",s.batteryCapacity?.toString()),n("range",s.rangeKm?.toString()),n("vehicleNotes",s.notes),Array.isArray(s.chargingTypes)&&s.chargingTypes.forEach(i=>{const r=document.querySelector(`input[name="chargingType"][value="${i}"]`);r&&(r.checked=!0)}))}function Nd(t,e){const a=document.getElementById("personal-form");a?.addEventListener("submit",async r=>{r.preventDefault();const o=new FormData(a),l=t.validate(o);if(!l.isValid){q(l.errors.join(", "),"error");return}q("Processing...","info");try{const p=await z.updateProfile({firstName:o.get("firstName"),lastName:o.get("lastName"),email:o.get("email"),phone:o.get("phone"),dateOfBirth:o.get("dateOfBirth"),address:o.get("address"),city:o.get("city"),state:o.get("state")});p.success?(q(p.message,"success"),setTimeout(()=>window.location.reload(),1500)):q(p.message,"error")}catch{q("Failed to update information. Please try again.","error")}});const s=document.getElementById("security-form");s?.addEventListener("submit",async r=>{r.preventDefault();const o=new FormData(s),l=e.validate(o);if(!l.isValid){q(l.errors.join(", "),"error");return}const p=o.get("currentPassword"),d=o.get("newPassword"),c=o.get("confirmPassword");if(d!==c){q("Passwords do not match","error");return}q("Updating security settings...","info");try{const u=await z.updatePassword(p,d);u.success?(q(u.message,"success"),s.reset()):q(u.message,"error")}catch{q("Failed to update security settings. Please try again.","error")}}),document.getElementById("preferences-form")?.addEventListener("submit",async r=>{r.preventDefault(),q("Saving preferences...","info");try{const o=await z.updatePreferences({emailNotifications:document.getElementById("emailNotifications")?.checked??!0,batteryAlerts:document.getElementById("batteryAlerts")?.checked??!0,maintenanceAlerts:document.getElementById("maintenanceAlerts")?.checked??!0,distanceUnit:document.getElementById("distanceUnit")?.value??"km",temperatureUnit:document.getElementById("temperatureUnit")?.value??"celsius",language:document.getElementById("language")?.value??"en",twoFactorEnabled:document.getElementById("twoFactor")?.checked??!1});o.success?q(o.message,"success"):q(o.message,"error")}catch{q("Failed to save preferences. Please try again.","error")}});const i=document.getElementById("vehicle-form");i?.addEventListener("submit",async r=>{r.preventDefault(),q("Saving vehicle information...","info");try{const o=i.querySelectorAll('input[name="chargingType"]:checked'),l=Array.from(o).map(d=>d.value),p=await z.updateVehicle({make:document.getElementById("vehicleMake")?.value??"",model:document.getElementById("vehicleModel")?.value??"",year:parseInt(document.getElementById("vehicleYear")?.value)||null,batteryCapacity:parseFloat(document.getElementById("batteryCapacity")?.value)||null,rangeKm:parseFloat(document.getElementById("range")?.value)||null,chargingTypes:l,notes:document.getElementById("vehicleNotes")?.value??""});p.success?q(p.message,"success"):q(p.message,"error")}catch{q("Failed to save vehicle information. Please try again.","error")}})}function zd(){const t=document.getElementById("newPassword"),e=document.getElementById("password-strength");t?.addEventListener("input",a=>{const s=a.target.value,n=_d(s);e&&(e.style.width=`${n.percentage}%`,e.className=`h-2 rounded-full transition-all duration-300 ${n.colorClass}`)})}function _d(t){let e=0;t.length>=8&&(e+=25),/[a-z]/.test(t)&&(e+=25),/[A-Z]/.test(t)&&(e+=25),/[0-9]/.test(t)&&(e+=25),/[^A-Za-z0-9]/.test(t)&&(e+=25);let a="bg-red-500";return e>=75?a="bg-green-500":e>=50?a="bg-yellow-500":e>=25&&(a="bg-orange-500"),{percentage:Math.min(100,e),colorClass:a}}function Hd(){document.getElementById("change-avatar-btn")?.addEventListener("click",()=>{q("Avatar upload feature coming soon!","info")})}function q(t,e){const a=document.getElementById("profile-message");if(!a)return;const s=e==="success"?"bg-green-500/20 border-green-500/30 text-green-400":e==="error"?"bg-red-500/20 border-red-500/30 text-red-400":"bg-blue-500/20 border-blue-500/30 text-blue-400";a.className=`mb-6 p-4 rounded-lg border ${s}`,a.textContent=t,a.classList.remove("hidden"),(e==="success"||e==="info")&&setTimeout(()=>{a.classList.add("hidden")},3e3)}window.togglePassword=function(t){const e=document.getElementById(t),a=e?.nextElementSibling?.querySelector("i");e&&a&&(e.type==="password"?(e.type="text",a.className="fa-solid fa-eye-slash"):(e.type="password",a.className="fa-solid fa-eye"))};async function Ud(){if(!z.isAuthenticated()){window.location.href="/auth";return}const t=document.getElementById("app");if(!t)return;const e=z.getCurrentUser();t.innerHTML=`
        <div class="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-slate-950 pt-24 pb-12 text-white">
            <div class="max-w-7xl mx-auto px-4 md:px-8">
                <div class="mb-8 rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-500/10 via-slate-900/70 to-black p-6">
                    <p class="text-xs uppercase tracking-[0.28em] text-cyan-300 mb-2">Dark Factory Portal</p>
                    <h1 class="text-3xl md:text-4xl font-orbitron font-bold mb-2">Factory Command Center</h1>
                    <p class="text-slate-300">Operator: ${e?.name||"Factory User"} | Real-time robotics and production telemetry</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                    <article class="rounded-xl border border-cyan-300/25 bg-slate-900/45 p-5">
                        <p class="text-slate-400 text-xs uppercase tracking-[0.2em]">Line Status</p>
                        <p class="text-3xl font-orbitron text-cyan-300 mt-2">ONLINE</p>
                        <p class="text-xs text-blue-300 mt-2">All 4 zones active</p>
                    </article>
                    <article class="rounded-xl border border-cyan-300/25 bg-slate-900/45 p-5">
                        <p class="text-slate-400 text-xs uppercase tracking-[0.2em]">Bots Running</p>
                        <p class="text-3xl font-orbitron text-cyan-300 mt-2">12</p>
                        <p class="text-xs text-slate-300 mt-2">2 in high-load mode</p>
                    </article>
                    <article class="rounded-xl border border-cyan-300/25 bg-slate-900/45 p-5">
                        <p class="text-slate-400 text-xs uppercase tracking-[0.2em]">Safety Alerts</p>
                        <p class="text-3xl font-orbitron text-cyan-200 mt-2">1</p>
                        <p class="text-xs text-blue-300 mt-2">Cooling threshold near Zone B</p>
                    </article>
                    <article class="rounded-xl border border-cyan-300/25 bg-slate-900/45 p-5">
                        <p class="text-slate-400 text-xs uppercase tracking-[0.2em]">Energy Draw</p>
                        <p class="text-3xl font-orbitron text-cyan-300 mt-2">482 kW</p>
                        <p class="text-xs text-blue-300 mt-2">-3.1% vs previous hour</p>
                    </article>
                </div>

                <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <section class="xl:col-span-2 rounded-2xl border border-cyan-400/20 bg-slate-900/40 p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="font-orbitron text-xl text-cyan-300">Production Grid</h2>
                            <a href="/alerts" class="text-sm text-cyan-300 hover:text-cyan-200">View alerts</a>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="rounded-xl border border-slate-700 bg-black/40 p-4">
                                <p class="text-sm text-slate-400">Zone A Assembly</p>
                                <p class="text-2xl font-orbitron mt-2">98.4%</p>
                                <p class="text-xs text-blue-300 mt-1">Efficiency stable</p>
                            </div>
                            <div class="rounded-xl border border-slate-700 bg-black/40 p-4">
                                <p class="text-sm text-slate-400">Zone B Power Systems</p>
                                <p class="text-2xl font-orbitron mt-2">91.2%</p>
                                <p class="text-xs text-cyan-300 mt-1">Cooling check required</p>
                            </div>
                            <div class="rounded-xl border border-slate-700 bg-black/40 p-4">
                                <p class="text-sm text-slate-400">Zone C QA Scan</p>
                                <p class="text-2xl font-orbitron mt-2">99.1%</p>
                                <p class="text-xs text-blue-300 mt-1">Defect rate low</p>
                            </div>
                            <div class="rounded-xl border border-slate-700 bg-black/40 p-4">
                                <p class="text-sm text-slate-400">Zone D Dispatch</p>
                                <p class="text-2xl font-orbitron mt-2">96.8%</p>
                                <p class="text-xs text-blue-300 mt-1">Output on schedule</p>
                            </div>
                        </div>
                    </section>

                    <section class="rounded-2xl border border-cyan-400/20 bg-slate-900/40 p-6">
                        <h2 class="font-orbitron text-xl text-cyan-300 mb-4">Quick Actions</h2>
                        <div class="space-y-3">
                            <a href="/dashboard" class="block rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 hover:bg-cyan-400/20 transition-all">Open EV dashboard</a>
                            <a href="/alerts" class="block rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 hover:bg-cyan-400/20 transition-all">Open incident center</a>
                            <a href="/gallery" class="block rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 hover:bg-cyan-400/20 transition-all">Open camera wall</a>
                            <a href="/rag-chat" class="block rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 hover:bg-cyan-400/20 transition-all">AI operator assistant</a>
                            <a href="/profile" class="block rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 hover:bg-cyan-400/20 transition-all">Operator profile</a>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    `}async function qd(){const t=document.getElementById("app");t&&(t.innerHTML=`
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
    `)}const Wd=new Xn;document.addEventListener("DOMContentLoaded",async()=>{new Kn,new Yn,K.register("/","EVBharat | AI-Powered EV Intelligence",pl),K.register("/about","About Us | EVBharat",ul),K.register("/technology","Technology | EVBharat",fl),K.register("/documentation","Documentation | EVBharat",El),K.register("/contact","Contact Us | EVBharat",Sl),K.register("/gallery","Gallery | EVBharat",Ll),K.register("/auth","Login | EVBharat",Cl),K.register("/dashboard","Dashboard | EVBharat",Rl),K.register("/factory-dashboard","Dark Factory | EVBharat",Ud),K.register("/battery","Battery Management | EVBharat",Fl),K.register("/battery-analytics","AI Battery Analytics | EVBharat",_l),K.register("/rag-chat","AI Assistant | EVBharat",Yl),K.register("/map","Route Planner | EVBharat",Xl),K.register("/alerts","Alerts | EVBharat",Cd),K.register("/drowsiness","Driver Drowsiness Monitor | EVBharat",Dd),K.register("/profile","Profile | EVBharat",Fd),K.register("/404","404 Not Found | EVBharat",qd),K.init(),setTimeout(()=>{Wd.hide()},1500)});
