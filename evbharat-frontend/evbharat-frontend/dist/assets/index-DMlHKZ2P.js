(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function a(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(n){if(n.ep)return;n.ep=!0;const i=a(n);fetch(n.href,i)}})();class Rn{routes=new Map;currentPath="";constructor(){window.addEventListener("popstate",()=>this.handleRoute()),document.addEventListener("click",e=>this.handleLinkClick(e))}register(e,a,s){this.routes.set(e,{path:e,title:a,render:s})}navigate(e,a=!0){if(this.currentPath===e)return;const s=this.routes.get(e);if(!s){this.navigate("/404",a);return}this.currentPath=e,a&&window.history.pushState({path:e},s.title,e),document.title=s.title,this.showPageTransition(async()=>{await s.render(),window.scrollTo({top:0,behavior:"instant"})})}handleRoute(){const e=window.location.pathname;this.navigate(e,!1)}handleLinkClick(e){const a=e.target.closest("a");if(!a)return;const s=a.getAttribute("href");!s||s.startsWith("http")||s.startsWith("#")||this.routes.has(s)&&(e.preventDefault(),this.navigate(s))}showPageTransition(e){const a=document.getElementById("app");if(!a)return e();a.style.opacity="0",a.style.transition="opacity 0.3s ease-out",setTimeout(async()=>{await e(),a.style.opacity="1"},300)}init(){this.handleRoute()}}const U=new Rn;class Vn{storageKey="evbharat_auth";userKey="evbharat_user";apiBase="".replace(/\/$/,"");enableOfflineAuth=!1;debugMode=!1;constructor(){this.debugMode&&(this.apiBase?console.log("Auth Service: backend base URL =",this.apiBase):console.log("Auth Service: using same-origin /api (Vite proxy in dev)"),this.enableOfflineAuth&&console.warn("Auth Service: offline mock auth is ENABLED (VITE_ENABLE_OFFLINE_AUTH=true)"))}getAuthEndpoints(e){return this.apiBase?[`${this.apiBase}${e}`]:[e,`http://127.0.0.1:3001${e}`,`http://localhost:3001${e}`,`http://host.docker.internal:3001${e}`]}getAuthState(){const e=localStorage.getItem(this.storageKey),a=localStorage.getItem(this.userKey);if(e&&a)try{return{isAuthenticated:!0,user:JSON.parse(a),token:e}}catch{return{isAuthenticated:!1,user:null,token:null}}return{isAuthenticated:!1,user:null,token:null}}isAuthenticated(){return this.getAuthState().isAuthenticated}getCurrentUser(){return this.getAuthState().user}async login(e,a){return this.requestAuth("/api/auth/login",{email:e,password:a})}async signup(e,a,s){return this.requestAuth("/api/auth/signup",{name:e,email:a,password:s})}logout(){localStorage.removeItem(this.storageKey),localStorage.removeItem(this.userKey)}getDefaultCredentials(){return null}persistAuth(e,a){localStorage.setItem(this.storageKey,e),localStorage.setItem(this.userKey,JSON.stringify(a))}async requestAuth(e,a){const s=this.getAuthEndpoints(e);let n=!1;for(const i of s)try{const r=await fetch(i,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)}),o=await r.json().catch(()=>({}));if(r.ok&&o?.token&&o?.user)return this.persistAuth(o.token,o.user),{success:!0,message:o?.message??"Success",user:o?.user};if([502,503,504].includes(r.status)){n=!0,this.debugMode&&console.warn(`Auth Service: upstream unavailable via ${i} (${r.status})`);continue}return r.ok?{success:!1,message:"Authentication response is invalid. Please try again."}:{success:!1,message:o?.message??"Authentication failed. Please try again."}}catch(r){n=!0,this.debugMode&&console.warn(`Auth Service: network error via ${i}`,r)}if(n&&!this.enableOfflineAuth)return{success:!1,message:"Cannot reach authentication server. Please check backend and try again."};if(e.includes("login")){const i={id:"mock_user_"+Date.now(),email:a.email,name:a.email.split("@")[0]||"User",role:"user",preferences:{notifications:{email:!0,battery:!0,maintenance:!0},units:{distance:"km",temperature:"celsius"},language:"en"},vehicle:{make:"Tesla",model:"Model 3",year:2024,batteryCapacity:75,range:350,chargingTypes:["AC Type 2","DC CCS2"]}},r="mock_token_"+Date.now();return this.persistAuth(r,i),{success:!0,message:"Login successful (offline mode)",user:i}}else if(e.includes("signup")){const i={id:"mock_user_"+Date.now(),email:a.email,name:a.name||a.email.split("@")[0],role:"user",preferences:{notifications:{email:!0,battery:!0,maintenance:!0},units:{distance:"km",temperature:"celsius"},language:"en"}},r="mock_token_"+Date.now();return this.persistAuth(r,i),{success:!0,message:"Account created successfully (offline mode)",user:i}}return{success:!1,message:"Authentication failed. Please try again."}}async authFetch(e,a="GET",s){const{token:n}=this.getAuthState();if(!n)return{ok:!1,data:{message:"Not authenticated."}};const i={method:a,headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`}};s&&(i.body=JSON.stringify(s));const r=await fetch(`${this.apiBase}${e}`,i),o=await r.json().catch(()=>({}));return{ok:r.ok,data:o}}async fetchProfile(){try{const{ok:e,data:a}=await this.authFetch("/api/profile");return e?{success:!0,data:a.data}:{success:!1,message:a?.message??"Failed to load profile."}}catch{return{success:!1,message:"Network error."}}}async updateProfile(e){if(!this.isAuthenticated())return{success:!1,message:"User not authenticated"};try{const{ok:a,data:s}=await this.authFetch("/api/profile/personal","PUT",e);if(!a)return{success:!1,message:s?.message??"Failed to update profile."};if(s?.user){const n=s.token??this.getAuthState().token;this.persistAuth(n,s.user)}return{success:!0,message:s?.message??"Profile updated successfully",user:s?.user}}catch{return{success:!1,message:"Network error. Please try again."}}}async updatePassword(e,a){if(!this.isAuthenticated())return{success:!1,message:"User not authenticated"};try{const{ok:s,data:n}=await this.authFetch("/api/profile/password","PUT",{currentPassword:e,newPassword:a});return s?{success:!0,message:n?.message??"Password updated successfully"}:{success:!1,message:n?.message??"Failed to update password."}}catch{return{success:!1,message:"Network error. Please try again."}}}async updatePreferences(e){if(!this.isAuthenticated())return{success:!1,message:"Not authenticated"};try{const{ok:a,data:s}=await this.authFetch("/api/profile/preferences","PUT",e);return a?{success:!0,message:s?.message??"Preferences saved."}:{success:!1,message:s?.message??"Failed to save preferences."}}catch{return{success:!1,message:"Network error."}}}async updateVehicle(e){if(!this.isAuthenticated())return{success:!1,message:"Not authenticated"};try{const{ok:a,data:s}=await this.authFetch("/api/profile/vehicle","PUT",e);return a?{success:!0,message:s?.message??"Vehicle info saved."}:{success:!1,message:s?.message??"Failed to save vehicle."}}catch{return{success:!1,message:"Network error."}}}}const D=new Vn;class Fn{navbar=null;mobileMenu=null;isMenuOpen=!1;languageStorageKey="evbharat_language";constructor(){this.render(),this.attachEventListeners()}render(){const e=D.isAuthenticated(),a=D.getCurrentUser(),s=localStorage.getItem("evbharat_portal_mode")||"ev",n=s==="factory",i=s==="factory"?"/factory-dashboard":"/dashboard",r=`
            ${n?`
            <style id="factory-navbar-theme">
                .factory-mode .text-pagani-gold { color: #67e8f9 !important; }
                .factory-mode .hover\\:text-pagani-gold:hover { color: #67e8f9 !important; }
                .factory-mode .border-pagani-gold\\/10,
                .factory-mode .border-pagani-gold\\/20,
                .factory-mode .border-pagani-gold\\/30,
                .factory-mode .border-pagani-gold\\/50,
                .factory-mode .hover\\:border-pagani-gold:hover { border-color: rgba(34, 211, 238, 0.45) !important; }
                .factory-mode .bg-pagani-gold\\/10 { background-color: rgba(34, 211, 238, 0.10) !important; }
                .factory-mode .bg-pagani-gold\\/20 { background-color: rgba(34, 211, 238, 0.16) !important; }
                .factory-mode .hover\\:bg-pagani-gold\\/10:hover { background-color: rgba(34, 211, 238, 0.16) !important; }
                .factory-mode .bg-pagani-gold { background-color: #22d3ee !important; }
                .factory-mode .hover\\:bg-pagani-gold:hover { background-color: #22d3ee !important; }
                .factory-mode .hover\\:text-black:hover { color: #020617 !important; }
            </style>
            `:""}
            <style id="language-selector-theme">
                .language-select {
                    width: 11rem;
                    color: #f8fafc;
                    background-color: rgba(2, 6, 23, 0.25);
                    border: 1px solid rgba(234, 179, 8, 0.35);
                    border-radius: 0.5rem;
                    padding: 0.35rem 2rem 0.35rem 0.75rem;
                    font-size: 0.875rem;
                    line-height: 1.25rem;
                    appearance: none;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    background-image: linear-gradient(45deg, transparent 50%, #eab308 50%), linear-gradient(135deg, #eab308 50%, transparent 50%);
                    background-position: calc(100% - 16px) calc(50% - 2px), calc(100% - 11px) calc(50% - 2px);
                    background-size: 5px 5px, 5px 5px;
                    background-repeat: no-repeat;
                    transition: border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
                }

                .language-select:hover {
                    border-color: rgba(234, 179, 8, 0.7);
                    background-color: rgba(2, 6, 23, 0.4);
                }

                .language-select:focus {
                    outline: none;
                    border-color: rgba(234, 179, 8, 0.9);
                    box-shadow: 0 0 0 2px rgba(234, 179, 8, 0.2);
                }

                .language-select option {
                    color: #f8fafc;
                    background-color: #0b1220;
                }

                .mobile-language-select {
                    width: 100%;
                    max-width: 13rem;
                }

                .factory-mode .language-select {
                    border-color: rgba(34, 211, 238, 0.45);
                    background-image: linear-gradient(45deg, transparent 50%, #22d3ee 50%), linear-gradient(135deg, #22d3ee 50%, transparent 50%);
                }

                .factory-mode .language-select:hover,
                .factory-mode .language-select:focus {
                    border-color: rgba(34, 211, 238, 0.8);
                    box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.2);
                }
            </style>
            <nav class="fixed top-0 left-0 w-full z-50 px-4 md:px-8 py-3 md:py-4 transition-all duration-300 ${n?"factory-mode":""}" id="navbar">
                <div class="max-w-7xl mx-auto">
                    <div class="flex items-center justify-between">
                        <!-- Logo -->
                        <div class="flex-shrink-0 z-10">
                            <a href="/" class="text-lg md:text-xl lg:text-2xl font-bold tracking-widest text-white uppercase font-orbitron hover:text-pagani-gold transition-colors">
                                EV<span class="text-pagani-gold">BHARAT</span>
                            </a>
                        </div>

                        <!-- Desktop Navigation -->
                        <div class="hidden lg:flex items-center justify-center flex-1 max-w-4xl mx-8">
                            ${e?`
                            <div class="flex items-center gap-3 xl:gap-4">
                                <a href="${i}" class="nav-link text-xs xl:text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-pagani-gold/10 border border-transparent hover:border-pagani-gold/30">
                                    <i class="fa-solid fa-gauge-high text-xs"></i>
                                    <span class="hidden xl:inline">${s==="factory"?"Factory":"Dashboard"}</span>
                                </a>
                                ${s==="factory"?`
                                <a href="/dashboard" class="nav-link text-xs xl:text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-pagani-gold/10 border border-transparent hover:border-pagani-gold/30">
                                    <i class="fa-solid fa-car-side text-xs"></i>
                                    <span class="hidden xl:inline">EV Dashboard</span>
                                </a>
                                <a href="/alerts" class="nav-link text-xs xl:text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-pagani-gold/10 border border-transparent hover:border-pagani-gold/30">
                                    <i class="fa-solid fa-bell text-xs"></i>
                                    <span class="hidden xl:inline">Incidents</span>
                                </a>
                                <a href="/rag-chat" class="nav-link text-xs xl:text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-pagani-gold/10 border border-transparent hover:border-pagani-gold/30">
                                    <i class="fa-solid fa-robot text-xs"></i>
                                    <span class="hidden xl:inline">AI Ops</span>
                                </a>
                                <a href="/gallery" class="nav-link text-xs xl:text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-pagani-gold/10 border border-transparent hover:border-pagani-gold/30">
                                    <i class="fa-solid fa-camera text-xs"></i>
                                    <span class="hidden xl:inline">Camera Wall</span>
                                </a>
                                <a href="/profile" class="nav-link text-xs xl:text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-pagani-gold/10 border border-transparent hover:border-pagani-gold/30">
                                    <i class="fa-solid fa-user text-xs"></i>
                                    <span class="hidden xl:inline">Operator</span>
                                </a>
                                `:`
                                <a href="/battery" class="nav-link text-xs xl:text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-pagani-gold/10 border border-transparent hover:border-pagani-gold/30">
                                    <i class="fa-solid fa-car-battery text-xs"></i>
                                    <span class="hidden xl:inline">Battery</span>
                                </a>
                                <a href="/rag-chat" class="nav-link text-xs xl:text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-pagani-gold/10 border border-transparent hover:border-pagani-gold/30">
                                    <i class="fa-solid fa-robot text-xs"></i>
                                    <span class="hidden xl:inline">AI Chat</span>
                                </a>
                                <a href="/map" class="nav-link text-xs xl:text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-pagani-gold/10 border border-transparent hover:border-pagani-gold/30">
                                    <i class="fa-solid fa-route text-xs"></i>
                                    <span class="hidden xl:inline">Routes</span>
                                </a>
                                <a href="/alerts" class="nav-link text-xs xl:text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-pagani-gold/10 border border-transparent hover:border-pagani-gold/30">
                                    <i class="fa-solid fa-bell text-xs"></i>
                                    <span class="hidden xl:inline">Alerts</span>
                                </a>
                                `}
                            </div>
                            `:`
                            <div class="flex items-center gap-4 xl:gap-6">
                                <a href="/" class="nav-link text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 py-2 px-3 rounded-md hover:bg-pagani-gold/10">Home</a>
                                <a href="/about" class="nav-link text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 py-2 px-3 rounded-md hover:bg-pagani-gold/10">About</a>
                                <a href="/technology" class="nav-link text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 py-2 px-3 rounded-md hover:bg-pagani-gold/10">Technology</a>
                                <a href="/gallery" class="nav-link text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 py-2 px-3 rounded-md hover:bg-pagani-gold/10">Gallery</a>
                                <a href="/contact" class="nav-link text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 py-2 px-3 rounded-md hover:bg-pagani-gold/10">Contact</a>
                            </div>
                            `}
                        </div>

                        <!-- User Menu (Desktop) - Right Aligned -->
                        <div class="hidden md:flex items-center gap-3 lg:gap-4 flex-shrink-0 z-10">
                            <label class="flex items-center gap-2 px-3 py-2 border border-pagani-gold/30 rounded-lg bg-pagani-black/30 hover:border-pagani-gold/60 transition-colors" aria-label="Select language">
                                <i class="fa-solid fa-language text-pagani-gold text-sm"></i>
                                <select id="language-select" class="language-select" title="Select language">
                                    <option value="en">English</option>
                                    <option value="hi">Hindi</option>
                                    <option value="bn">Bengali</option>
                                    <option value="as">Assamese</option>
                                    <option value="or">Odia</option>
                                    <option value="ur">Urdu</option>
                                    <option value="ne">Nepali</option>
                                    <option value="sd">Sindhi</option>
                                    <option value="ta">Tamil</option>
                                    <option value="te">Telugu</option>
                                    <option value="mr">Marathi</option>
                                    <option value="gu">Gujarati</option>
                                    <option value="kn">Kannada</option>
                                    <option value="ml">Malayalam</option>
                                    <option value="pa">Punjabi</option>
                                    <option value="ar">Arabic</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                    <option value="es">Spanish</option>
                                    <option value="pt">Portuguese</option>
                                    <option value="ru">Russian</option>
                                    <option value="ja">Japanese</option>
                                    <option value="ko">Korean</option>
                                    <option value="zh-CN">Chinese (Simplified)</option>
                                    <option value="zh-TW">Chinese (Traditional)</option>
                                    <option value="it">Italian</option>
                                    <option value="nl">Dutch</option>
                                    <option value="tr">Turkish</option>
                                    <option value="pl">Polish</option>
                                    <option value="vi">Vietnamese</option>
                                    <option value="id">Indonesian</option>
                                    <option value="th">Thai</option>
                                    <option value="fa">Persian</option>
                                    <option value="uk">Ukrainian</option>
                                    <option value="el">Greek</option>
                                    <option value="sv">Swedish</option>
                                    <option value="da">Danish</option>
                                    <option value="fi">Finnish</option>
                                </select>
                            </label>
                            ${e?`
                            <a href="/profile" class="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 border border-pagani-gold/30 rounded-lg bg-pagani-black/20 backdrop-blur-sm hover:border-pagani-gold hover:bg-pagani-gold/10 transition-all duration-300 group">
                                <div class="text-right hidden md:block">
                                    <p class="text-xs text-gray-400 uppercase tracking-wider group-hover:text-pagani-gold/80 transition-colors">User</p>
                                    <p class="text-sm font-orbitron font-bold text-pagani-gold">${a?.name}</p>
                                </div>
                                <div class="w-8 h-8 rounded-full bg-pagani-gold/20 flex items-center justify-center text-pagani-gold border border-pagani-gold/30 group-hover:bg-pagani-gold/30 group-hover:border-pagani-gold transition-all duration-300">
                                    <i class="fa-solid fa-user text-sm"></i>
                                </div>
                            </a>
                            <button id="logout-btn" class="px-4 lg:px-6 py-2 bg-pagani-gold/20 border border-pagani-gold/50 text-xs tracking-[0.2em] hover:bg-pagani-gold hover:text-black transition-all uppercase rounded-lg">
                                <span class="hidden lg:inline">Logout</span>
                                <i class="fa-solid fa-sign-out-alt lg:hidden"></i>
                            </button>
                            `:`
                            <a href="/auth" class="px-4 lg:px-6 py-2 border border-pagani-gold/30 text-xs tracking-[0.2em] hover:text-pagani-gold hover:border-pagani-gold transition-all uppercase rounded-lg">
                                Login
                            </a>
                            `}
                        </div>

                        <!-- Mobile Menu Button -->
                        <button id="mobile-menu-btn" class="lg:hidden text-white focus:outline-none p-2 hover:bg-pagani-gold/10 rounded-lg transition-colors ml-auto md:ml-4">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path class="menu-icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                <path class="close-icon hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                <!-- Mobile Menu -->
                <div id="mobile-menu" class="lg:hidden fixed inset-0 bg-pagani-black/98 backdrop-blur-xl transform translate-x-full transition-transform duration-300 pt-16 z-40">
                    <div class="flex flex-col items-center gap-6 p-4 h-full overflow-y-auto">
                        ${e?"":`
                        <div class="flex flex-col items-center gap-6 w-full">
                            <a href="/" class="mobile-nav-link text-xl tracking-wider uppercase hover:text-pagani-gold transition-colors py-2">Home</a>
                            <a href="/about" class="mobile-nav-link text-xl tracking-wider uppercase hover:text-pagani-gold transition-colors py-2">About</a>
                            <a href="/technology" class="mobile-nav-link text-xl tracking-wider uppercase hover:text-pagani-gold transition-colors py-2">Technology</a>
                            <a href="/gallery" class="mobile-nav-link text-xl tracking-wider uppercase hover:text-pagani-gold transition-colors py-2">Gallery</a>
                            <a href="/contact" class="mobile-nav-link text-xl tracking-wider uppercase hover:text-pagani-gold transition-colors py-2">Contact</a>
                        </div>
                        `}
                        ${e?`
                        <div class="w-full">
                            <div class="text-center mb-6">
                                <h2 class="text-pagani-gold font-orbitron text-lg uppercase tracking-wider">${s==="factory"?"Factory Control Center":"EV Control Center"}</h2>
                                <div class="w-16 h-0.5 bg-pagani-gold mx-auto mt-2"></div>
                            </div>
                            <div class="grid grid-cols-2 gap-4 mb-6">
                                <a href="${i}" class="mobile-nav-card flex flex-col items-center justify-center gap-3 p-6 border border-pagani-gold/30 rounded-xl hover:bg-pagani-gold/10 hover:border-pagani-gold transition-all duration-300 min-h-[100px]">
                                    <i class="fa-solid fa-gauge-high text-3xl text-pagani-gold"></i>
                                    <span class="text-xs uppercase tracking-wider text-center">${s==="factory"?"Factory":"Dashboard"}</span>
                                </a>
                                ${s==="factory"?`
                                <a href="/alerts" class="mobile-nav-card flex flex-col items-center justify-center gap-3 p-6 border border-pagani-gold/30 rounded-xl hover:bg-pagani-gold/10 hover:border-pagani-gold transition-all duration-300 min-h-[100px]">
                                    <i class="fa-solid fa-bell text-3xl text-pagani-gold"></i>
                                    <span class="text-xs uppercase tracking-wider text-center">Incidents</span>
                                </a>
                                `:`
                                <a href="/battery" class="mobile-nav-card flex flex-col items-center justify-center gap-3 p-6 border border-pagani-gold/30 rounded-xl hover:bg-pagani-gold/10 hover:border-pagani-gold transition-all duration-300 min-h-[100px]">
                                    <i class="fa-solid fa-car-battery text-3xl text-pagani-gold"></i>
                                    <span class="text-xs uppercase tracking-wider text-center">Battery</span>
                                </a>
                                `}
                                <a href="/rag-chat" class="mobile-nav-card flex flex-col items-center justify-center gap-3 p-6 border border-pagani-gold/30 rounded-xl hover:bg-pagani-gold/10 hover:border-pagani-gold transition-all duration-300 min-h-[100px]">
                                    <i class="fa-solid fa-robot text-3xl text-pagani-gold"></i>
                                    <span class="text-xs uppercase tracking-wider text-center">${s==="factory"?"AI Ops":"AI Chat"}</span>
                                </a>
                                ${s==="factory"?`
                                <a href="/dashboard" class="mobile-nav-card flex flex-col items-center justify-center gap-3 p-6 border border-pagani-gold/30 rounded-xl hover:bg-pagani-gold/10 hover:border-pagani-gold transition-all duration-300 min-h-[100px]">
                                    <i class="fa-solid fa-car-side text-3xl text-pagani-gold"></i>
                                    <span class="text-xs uppercase tracking-wider text-center">EV Dashboard</span>
                                </a>
                                `:""}
                                ${s==="factory"?`
                                <a href="/gallery" class="mobile-nav-card flex flex-col items-center justify-center gap-3 p-6 border border-pagani-gold/30 rounded-xl hover:bg-pagani-gold/10 hover:border-pagani-gold transition-all duration-300 min-h-[100px]">
                                    <i class="fa-solid fa-camera text-3xl text-pagani-gold"></i>
                                    <span class="text-xs uppercase tracking-wider text-center">Camera Wall</span>
                                </a>
                                `:`
                                <a href="/map" class="mobile-nav-card flex flex-col items-center justify-center gap-3 p-6 border border-pagani-gold/30 rounded-xl hover:bg-pagani-gold/10 hover:border-pagani-gold transition-all duration-300 min-h-[100px]">
                                    <i class="fa-solid fa-route text-3xl text-pagani-gold"></i>
                                    <span class="text-xs uppercase tracking-wider text-center">Routes</span>
                                </a>
                                `}
                            </div>
                            ${s==="factory"?`
                            <a href="/profile" class="mobile-nav-card w-full flex items-center justify-center gap-4 p-4 border border-pagani-gold/30 rounded-xl hover:bg-pagani-gold/10 hover:border-pagani-gold transition-all duration-300">
                                <i class="fa-solid fa-user text-2xl text-pagani-gold"></i>
                                <span class="text-sm uppercase tracking-wider">Operator Settings</span>
                            </a>
                            `:`
                            <a href="/alerts" class="mobile-nav-card w-full flex items-center justify-center gap-4 p-4 border border-pagani-gold/30 rounded-xl hover:bg-pagani-gold/10 hover:border-pagani-gold transition-all duration-300">
                                <i class="fa-solid fa-bell text-2xl text-pagani-gold"></i>
                                <span class="text-sm uppercase tracking-wider">Smart Alerts & Notifications</span>
                            </a>
                            `}
                        </div>
                        `:""}
                        <div class="flex flex-col gap-4 w-full mt-8">
                            <label class="w-full flex items-center justify-between gap-3 px-4 py-3 border border-pagani-gold/30 rounded-lg bg-pagani-black/20" aria-label="Select language">
                                <span class="text-xs uppercase tracking-[0.2em] text-pagani-gold">Language</span>
                                <select id="mobile-language-select" class="language-select mobile-language-select" title="Select language">
                                    <option value="en">English</option>
                                    <option value="hi">Hindi</option>
                                    <option value="bn">Bengali</option>
                                    <option value="as">Assamese</option>
                                    <option value="or">Odia</option>
                                    <option value="ur">Urdu</option>
                                    <option value="ne">Nepali</option>
                                    <option value="sd">Sindhi</option>
                                    <option value="ta">Tamil</option>
                                    <option value="te">Telugu</option>
                                    <option value="mr">Marathi</option>
                                    <option value="gu">Gujarati</option>
                                    <option value="kn">Kannada</option>
                                    <option value="ml">Malayalam</option>
                                    <option value="pa">Punjabi</option>
                                    <option value="ar">Arabic</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                    <option value="es">Spanish</option>
                                    <option value="pt">Portuguese</option>
                                    <option value="ru">Russian</option>
                                    <option value="ja">Japanese</option>
                                    <option value="ko">Korean</option>
                                    <option value="zh-CN">Chinese (Simplified)</option>
                                    <option value="zh-TW">Chinese (Traditional)</option>
                                    <option value="it">Italian</option>
                                    <option value="nl">Dutch</option>
                                    <option value="tr">Turkish</option>
                                    <option value="pl">Polish</option>
                                    <option value="vi">Vietnamese</option>
                                    <option value="id">Indonesian</option>
                                    <option value="th">Thai</option>
                                    <option value="fa">Persian</option>
                                    <option value="uk">Ukrainian</option>
                                    <option value="el">Greek</option>
                                    <option value="sv">Swedish</option>
                                    <option value="da">Danish</option>
                                    <option value="fi">Finnish</option>
                                </select>
                            </label>
                            ${e?`
                                <a href="/profile" class="text-center py-3 border border-pagani-gold/30 rounded-lg hover:border-pagani-gold hover:bg-pagani-gold/10 transition-all duration-300 mobile-nav-link">
                                    <p class="text-xs text-gray-400 uppercase tracking-wider">Profile Settings</p>
                                    <p class="font-orbitron font-bold text-pagani-gold">${a?.name}</p>
                                </a>
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
        `;document.body.insertAdjacentHTML("afterbegin",r),this.navbar=document.getElementById("navbar"),this.mobileMenu=document.getElementById("mobile-menu"),this.initializeGoogleTranslate()}attachEventListeners(){const e=document.getElementById("logout-btn"),a=document.getElementById("logout-mobile-btn");e?.addEventListener("click",()=>this.handleLogout()),a?.addEventListener("click",()=>this.handleLogout()),document.getElementById("mobile-menu-btn")?.addEventListener("click",()=>this.toggleMobileMenu());const n=document.getElementById("language-select"),i=document.getElementById("mobile-language-select"),r=localStorage.getItem(this.languageStorageKey)||"en";n&&(n.value=r,n.addEventListener("change",l=>{this.handleLanguageChange(l.target.value)})),i&&(i.value=r,i.addEventListener("change",l=>{this.handleLanguageChange(l.target.value)})),document.querySelectorAll(".mobile-nav-link, .mobile-nav-card").forEach(l=>{l.addEventListener("click",()=>this.closeMobileMenu())}),window.addEventListener("scroll",()=>this.handleScroll(),{passive:!0}),this.updateActiveLink(),window.addEventListener("popstate",()=>this.updateActiveLink())}handleLogout(){D.logout(),window.location.href="/"}initializeGoogleTranslate(){const e=window;if(e.googleTranslateElementInit=()=>{if(e.googleTranslateInitialized||!e.google?.translate)return;const a="google_translate_element";if(!document.getElementById(a)){const n=document.createElement("div");n.id=a,n.style.display="none",document.body.appendChild(n)}new e.google.translate.TranslateElement({pageLanguage:"en",includedLanguages:"en,hi,bn,as,or,ur,ne,sd,ta,te,mr,gu,kn,ml,pa,ar,fr,de,es,pt,ru,ja,ko,zh-CN,zh-TW,it,nl,tr,pl,vi,id,th,fa,uk,el,sv,da,fi",autoDisplay:!1},a),e.googleTranslateInitialized=!0;const s=localStorage.getItem(this.languageStorageKey)||"en";this.applyGoogleLanguage(s)},document.getElementById("google-translate-script"))e.google?.translate&&e.googleTranslateElementInit();else{const a=document.createElement("script");a.id="google-translate-script",a.src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit",a.async=!0,document.body.appendChild(a)}}handleLanguageChange(e){localStorage.setItem(this.languageStorageKey,e);const a=document.getElementById("language-select"),s=document.getElementById("mobile-language-select");a&&(a.value=e),s&&(s.value=e),this.applyGoogleLanguage(e)}applyGoogleLanguage(e){const a=document.querySelector(".goog-te-combo");a&&(a.value=e,a.dispatchEvent(new Event("change")))}toggleMobileMenu(){this.isMenuOpen=!this.isMenuOpen,this.isMenuOpen?(this.mobileMenu?.classList.remove("translate-x-full"),document.querySelector(".menu-icon")?.classList.add("hidden"),document.querySelector(".close-icon")?.classList.remove("hidden"),document.body.style.overflow="hidden"):this.closeMobileMenu()}closeMobileMenu(){this.isMenuOpen=!1,this.mobileMenu?.classList.add("translate-x-full"),document.querySelector(".menu-icon")?.classList.remove("hidden"),document.querySelector(".close-icon")?.classList.add("hidden"),document.body.style.overflow=""}handleScroll(){if(!this.navbar)return;window.scrollY>50?this.navbar.classList.add("bg-pagani-black/80","backdrop-blur-md","shadow-lg"):this.navbar.classList.remove("bg-pagani-black/80","backdrop-blur-md","shadow-lg")}updateActiveLink(){const e=window.location.pathname;document.querySelectorAll(".nav-link, .mobile-nav-link, .mobile-nav-card").forEach(s=>{s.getAttribute("href")===e?(s.classList.add("text-pagani-gold"),s.classList.contains("mobile-nav-card")&&s.classList.add("bg-pagani-gold/20","border-pagani-gold")):(s.classList.remove("text-pagani-gold"),s.classList.contains("mobile-nav-card")&&s.classList.remove("bg-pagani-gold/20","border-pagani-gold"))})}destroy(){this.navbar?.remove()}}class jn{constructor(){this.render()}render(){document.body.insertAdjacentHTML("beforeend",`
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
        `),this.attachEventListeners()}attachEventListeners(){document.getElementById("newsletter-form")?.addEventListener("submit",s=>{s.preventDefault(),alert("Thank you for subscribing! 🎉"),s.target.reset()});const a=document.getElementById("back-to-top");window.addEventListener("scroll",()=>{window.scrollY>500?a?.classList.remove("opacity-0","pointer-events-none"):a?.classList.add("opacity-0","pointer-events-none")},{passive:!0}),a?.addEventListener("click",()=>{window.scrollTo({top:0,behavior:"smooth"})})}}class Dn{loader=null;constructor(){this.render()}render(){document.body.insertAdjacentHTML("afterbegin",`
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
        `),this.loader=document.getElementById("page-loader")}hide(){this.loader&&(this.loader.style.opacity="0",setTimeout(()=>{this.loader?.remove()},500))}show(){this.loader?this.loader.style.opacity="1":this.render()}}class On{canvas;ctx;images=[];totalFrames=240;isLoaded=!1;currentFrameIndex=-1;framePathBuilder;constructor(e,a=240,s=n=>`/images/zonda-sequence/${n}.jpg`){if(this.canvas=document.getElementById(e),!this.canvas)throw new Error(`Canvas with id ${e} not found`);this.ctx=this.canvas.getContext("2d",{alpha:!1}),this.totalFrames=a,this.framePathBuilder=s,this.ctx&&(this.ctx.imageSmoothingEnabled=!0,this.ctx.imageSmoothingQuality="high"),this.resize(),window.addEventListener("resize",()=>this.resize()),this.preloadImages()}resize(){if(!this.canvas||!this.ctx)return;const e=window.devicePixelRatio||1,a=this.canvas.parentElement?.getBoundingClientRect();a&&(this.canvas.width=a.width*e,this.canvas.height=a.height*e,this.ctx.scale(e,e),this.ctx.imageSmoothingEnabled=!0,this.ctx.imageSmoothingQuality="high",this.currentFrameIndex>=0&&this.renderFrame(this.currentFrameIndex))}preloadImages(){let e=0;for(let a=1;a<=this.totalFrames;a++){const s=new Image;s.src=this.framePathBuilder(a),s.onload=()=>{e++,e===this.totalFrames&&(this.isLoaded=!0,this.renderFrame(0))},this.images.push(s)}}update(e){if(!this.isLoaded)return;const a=Math.min(this.totalFrames-1,Math.max(0,Math.floor(e*this.totalFrames)));a!==this.currentFrameIndex&&(this.renderFrame(a),this.currentFrameIndex=a)}renderFrame(e){if(!this.ctx||!this.canvas)return;const a=this.images[e];if(!a)return;const s=window.devicePixelRatio||1;this.ctx.clearRect(0,0,this.canvas.width/s,this.canvas.height/s);const n=this.canvas.width/s,i=this.canvas.height/s,r=Math.min(n/a.width,i/a.height),o=n/2-a.width/2*r,l=i/2-a.height/2*r;this.ctx.drawImage(a,o,l,a.width*r,a.height*r)}}function Nn(t,e){t.indexOf(e)===-1&&t.push(e)}function ps(t,e){const a=t.indexOf(e);a>-1&&t.splice(a,1)}const be=(t,e,a)=>a>e?e:a<t?t:a;let Jt=()=>{};const le={},gs=t=>/^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(t);function zn(t){return typeof t=="object"&&t!==null}const us=t=>/^0[^.\s]+$/u.test(t);function Zt(t){let e;return()=>(e===void 0&&(e=t()),e)}const Ve=t=>t,Hn=(t,e)=>a=>e(t(a)),Qt=(...t)=>t.reduce(Hn),ea=(t,e,a)=>{const s=e-t;return s===0?1:(a-t)/s};class fs{constructor(){this.subscriptions=[]}add(e){return Nn(this.subscriptions,e),()=>ps(this.subscriptions,e)}notify(e,a,s){const n=this.subscriptions.length;if(n)if(n===1)this.subscriptions[0](e,a,s);else for(let i=0;i<n;i++){const r=this.subscriptions[i];r&&r(e,a,s)}}getSize(){return this.subscriptions.length}clear(){this.subscriptions.length=0}}const re=t=>t*1e3,Q=t=>t/1e3;function ms(t,e){return e?t*(1e3/e):0}const _n=(t,e,a)=>{const s=e-t;return((a-t)%s+s)%s+t},bs=(t,e,a)=>(((1-3*a+3*e)*t+(3*a-6*e))*t+3*e)*t,Un=1e-7,qn=12;function Wn(t,e,a,s,n){let i,r,o=0;do r=e+(a-e)/2,i=bs(r,s,n)-t,i>0?a=r:e=r;while(Math.abs(i)>Un&&++o<qn);return r}function Je(t,e,a,s){if(t===e&&a===s)return Ve;const n=i=>Wn(i,0,1,t,a);return i=>i===0||i===1?i:bs(n(i),e,s)}const hs=t=>e=>e<=.5?t(2*e)/2:(2-t(2*(1-e)))/2,xs=t=>e=>1-t(1-e),vs=Je(.33,1.53,.69,.99),ta=xs(vs),ys=hs(ta),ws=t=>(t*=2)<1?.5*ta(t):.5*(2-Math.pow(2,-10*(t-1))),aa=t=>1-Math.sin(Math.acos(t)),Kn=xs(aa),ks=hs(aa),Gn=Je(.42,0,1,1),Yn=Je(0,0,.58,1),Es=Je(.42,0,.58,1),Ss=t=>Array.isArray(t)&&typeof t[0]!="number";function Ts(t,e){return Ss(t)?t[_n(0,t.length,e)]:t}const Cs=t=>Array.isArray(t)&&typeof t[0]=="number",Xn={linear:Ve,easeIn:Gn,easeInOut:Es,easeOut:Yn,circIn:aa,circInOut:ks,circOut:Kn,backIn:ta,backInOut:ys,backOut:vs,anticipate:ws},Jn=t=>typeof t=="string",Ma=t=>{if(Cs(t)){Jt(t.length===4);const[e,a,s,n]=t;return Je(e,a,s,n)}else if(Jn(t))return Xn[t];return t},it=["setup","read","resolveKeyframes","preUpdate","update","preRender","render","postRender"];function Zn(t,e){let a=new Set,s=new Set,n=!1,i=!1;const r=new WeakSet;let o={delta:0,timestamp:0,isProcessing:!1};function l(d){r.has(d)&&(p.schedule(d),t()),d(o)}const p={schedule:(d,c=!1,u=!1)=>{const b=u&&n?a:s;return c&&r.add(d),b.has(d)||b.add(d),d},cancel:d=>{s.delete(d),r.delete(d)},process:d=>{if(o=d,n){i=!0;return}n=!0,[a,s]=[s,a],a.forEach(l),a.clear(),n=!1,i&&(i=!1,p.process(d))}};return p}const Qn=40;function As(t,e){let a=!1,s=!0;const n={delta:0,timestamp:0,isProcessing:!1},i=()=>a=!0,r=it.reduce((A,w)=>(A[w]=Zn(i),A),{}),{setup:o,read:l,resolveKeyframes:p,preUpdate:d,update:c,preRender:u,render:m,postRender:b}=r,E=()=>{const A=le.useManualTiming?n.timestamp:performance.now();a=!1,le.useManualTiming||(n.delta=s?1e3/60:Math.max(Math.min(A-n.timestamp,Qn),1)),n.timestamp=A,n.isProcessing=!0,o.process(n),l.process(n),p.process(n),d.process(n),c.process(n),u.process(n),m.process(n),b.process(n),n.isProcessing=!1,a&&e&&(s=!1,t(E))},k=()=>{a=!0,s=!0,n.isProcessing||t(E)};return{schedule:it.reduce((A,w)=>{const h=r[w];return A[w]=(T,P=!1,L=!1)=>(a||k(),h.schedule(T,P,L)),A},{}),cancel:A=>{for(let w=0;w<it.length;w++)r[it[w]].cancel(A)},state:n,steps:r}}const{schedule:de,cancel:Lt,state:dt}=As(typeof requestAnimationFrame<"u"?requestAnimationFrame:Ve,!0);let lt;function ei(){lt=void 0}const X={now:()=>(lt===void 0&&X.set(dt.isProcessing||le.useManualTiming?dt.timestamp:performance.now()),lt),set:t=>{lt=t,queueMicrotask(ei)}},Is=t=>e=>typeof e=="string"&&e.startsWith(t),Ls=Is("--"),ti=Is("var(--"),sa=t=>ti(t)?ai.test(t.split("/*")[0].trim()):!1,ai=/var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;function Ba(t){return typeof t!="string"?!1:t.split("/*")[0].includes("var(--")}const Fe={test:t=>typeof t=="number",parse:parseFloat,transform:t=>t},We={...Fe,transform:t=>be(0,1,t)},rt={...Fe,default:1},_e=t=>Math.round(t*1e5)/1e5,na=/-?(?:\d+(?:\.\d+)?|\.\d+)/gu;function si(t){return t==null}const ni=/^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu,ia=(t,e)=>a=>!!(typeof a=="string"&&ni.test(a)&&a.startsWith(t)||e&&!si(a)&&Object.prototype.hasOwnProperty.call(a,e)),Ms=(t,e,a)=>s=>{if(typeof s!="string")return s;const[n,i,r,o]=s.match(na);return{[t]:parseFloat(n),[e]:parseFloat(i),[a]:parseFloat(r),alpha:o!==void 0?parseFloat(o):1}},ii=t=>be(0,255,t),kt={...Fe,transform:t=>Math.round(ii(t))},Ee={test:ia("rgb","red"),parse:Ms("red","green","blue"),transform:({red:t,green:e,blue:a,alpha:s=1})=>"rgba("+kt.transform(t)+", "+kt.transform(e)+", "+kt.transform(a)+", "+_e(We.transform(s))+")"};function ri(t){let e="",a="",s="",n="";return t.length>5?(e=t.substring(1,3),a=t.substring(3,5),s=t.substring(5,7),n=t.substring(7,9)):(e=t.substring(1,2),a=t.substring(2,3),s=t.substring(3,4),n=t.substring(4,5),e+=e,a+=a,s+=s,n+=n),{red:parseInt(e,16),green:parseInt(a,16),blue:parseInt(s,16),alpha:n?parseInt(n,16)/255:1}}const Mt={test:ia("#"),parse:ri,transform:Ee.transform},Ze=t=>({test:e=>typeof e=="string"&&e.endsWith(t)&&e.split(" ").length===1,parse:parseFloat,transform:e=>`${e}${t}`}),fe=Ze("deg"),Pe=Ze("%"),v=Ze("px"),oi=Ze("vh"),li=Ze("vw"),Pa={...Pe,parse:t=>Pe.parse(t)/100,transform:t=>Pe.transform(t*100)},Be={test:ia("hsl","hue"),parse:Ms("hue","saturation","lightness"),transform:({hue:t,saturation:e,lightness:a,alpha:s=1})=>"hsla("+Math.round(t)+", "+Pe.transform(_e(e))+", "+Pe.transform(_e(a))+", "+_e(We.transform(s))+")"},z={test:t=>Ee.test(t)||Mt.test(t)||Be.test(t),parse:t=>Ee.test(t)?Ee.parse(t):Be.test(t)?Be.parse(t):Mt.parse(t),transform:t=>typeof t=="string"?t:t.hasOwnProperty("red")?Ee.transform(t):Be.transform(t),getAnimatableNone:t=>{const e=z.parse(t);return e.alpha=0,z.transform(e)}},di=/(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;function ci(t){return isNaN(t)&&typeof t=="string"&&(t.match(na)?.length||0)+(t.match(di)?.length||0)>0}const Bs="number",Ps="color",pi="var",gi="var(",$a="${}",ui=/var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;function Ke(t){const e=t.toString(),a=[],s={color:[],number:[],var:[]},n=[];let i=0;const o=e.replace(ui,l=>(z.test(l)?(s.color.push(i),n.push(Ps),a.push(z.parse(l))):l.startsWith(gi)?(s.var.push(i),n.push(pi),a.push(l)):(s.number.push(i),n.push(Bs),a.push(parseFloat(l))),++i,$a)).split($a);return{values:a,split:o,indexes:s,types:n}}function $s(t){return Ke(t).values}function Rs(t){const{split:e,types:a}=Ke(t),s=e.length;return n=>{let i="";for(let r=0;r<s;r++)if(i+=e[r],n[r]!==void 0){const o=a[r];o===Bs?i+=_e(n[r]):o===Ps?i+=z.transform(n[r]):i+=n[r]}return i}}const fi=t=>typeof t=="number"?0:z.test(t)?z.getAnimatableNone(t):t;function mi(t){const e=$s(t);return Rs(t)(e.map(fi))}const he={test:ci,parse:$s,createTransformer:Rs,getAnimatableNone:mi};function Et(t,e,a){return a<0&&(a+=1),a>1&&(a-=1),a<1/6?t+(e-t)*6*a:a<1/2?e:a<2/3?t+(e-t)*(2/3-a)*6:t}function bi({hue:t,saturation:e,lightness:a,alpha:s}){t/=360,e/=100,a/=100;let n=0,i=0,r=0;if(!e)n=i=r=a;else{const o=a<.5?a*(1+e):a+e-a*e,l=2*a-o;n=Et(l,o,t+1/3),i=Et(l,o,t),r=Et(l,o,t-1/3)}return{red:Math.round(n*255),green:Math.round(i*255),blue:Math.round(r*255),alpha:s}}function ct(t,e){return a=>a>0?e:t}const je=(t,e,a)=>t+(e-t)*a,St=(t,e,a)=>{const s=t*t,n=a*(e*e-s)+s;return n<0?0:Math.sqrt(n)},hi=[Mt,Ee,Be],xi=t=>hi.find(e=>e.test(t));function Ra(t){const e=xi(t);if(!e)return!1;let a=e.parse(t);return e===Be&&(a=bi(a)),a}const Va=(t,e)=>{const a=Ra(t),s=Ra(e);if(!a||!s)return ct(t,e);const n={...a};return i=>(n.red=St(a.red,s.red,i),n.green=St(a.green,s.green,i),n.blue=St(a.blue,s.blue,i),n.alpha=je(a.alpha,s.alpha,i),Ee.transform(n))},Bt=new Set(["none","hidden"]);function vi(t,e){return Bt.has(t)?a=>a<=0?t:e:a=>a>=1?e:t}function yi(t,e){return a=>je(t,e,a)}function ra(t){return typeof t=="number"?yi:typeof t=="string"?sa(t)?ct:z.test(t)?Va:Ei:Array.isArray(t)?Vs:typeof t=="object"?z.test(t)?Va:wi:ct}function Vs(t,e){const a=[...t],s=a.length,n=t.map((i,r)=>ra(i)(i,e[r]));return i=>{for(let r=0;r<s;r++)a[r]=n[r](i);return a}}function wi(t,e){const a={...t,...e},s={};for(const n in a)t[n]!==void 0&&e[n]!==void 0&&(s[n]=ra(t[n])(t[n],e[n]));return n=>{for(const i in s)a[i]=s[i](n);return a}}function ki(t,e){const a=[],s={color:0,var:0,number:0};for(let n=0;n<e.values.length;n++){const i=e.types[n],r=t.indexes[i][s[i]],o=t.values[r]??0;a[n]=o,s[i]++}return a}const Ei=(t,e)=>{const a=he.createTransformer(e),s=Ke(t),n=Ke(e);return s.indexes.var.length===n.indexes.var.length&&s.indexes.color.length===n.indexes.color.length&&s.indexes.number.length>=n.indexes.number.length?Bt.has(t)&&!n.values.length||Bt.has(e)&&!s.values.length?vi(t,e):Qt(Vs(ki(s,n),n.values),a):ct(t,e)};function Fs(t,e,a){return typeof t=="number"&&typeof e=="number"&&typeof a=="number"?je(t,e,a):ra(t)(t,e)}const Si=t=>{const e=({timestamp:a})=>t(a);return{start:(a=!0)=>de.update(e,a),stop:()=>Lt(e),now:()=>dt.isProcessing?dt.timestamp:X.now()}},js=(t,e,a=10)=>{let s="";const n=Math.max(Math.round(e/a),2);for(let i=0;i<n;i++)s+=Math.round(t(i/(n-1))*1e4)/1e4+", ";return`linear(${s.substring(0,s.length-2)})`},pt=2e4;function oa(t){let e=0;const a=50;let s=t.next(e);for(;!s.done&&e<pt;)e+=a,s=t.next(e);return e>=pt?1/0:e}function Ds(t,e=100,a){const s=a({...t,keyframes:[0,e]}),n=Math.min(oa(s),pt);return{type:"keyframes",ease:i=>s.next(n*i).value/e,duration:Q(n)}}const Ti=5;function Os(t,e,a){const s=Math.max(e-Ti,0);return ms(a-t(s),e-s)}const j={stiffness:100,damping:10,mass:1,velocity:0,duration:800,bounce:.3,visualDuration:.3,restSpeed:{granular:.01,default:2},restDelta:{granular:.005,default:.5},minDuration:.01,maxDuration:10,minDamping:.05,maxDamping:1},Tt=.001;function Ci({duration:t=j.duration,bounce:e=j.bounce,velocity:a=j.velocity,mass:s=j.mass}){let n,i,r=1-e;r=be(j.minDamping,j.maxDamping,r),t=be(j.minDuration,j.maxDuration,Q(t)),r<1?(n=p=>{const d=p*r,c=d*t,u=d-a,m=Pt(p,r),b=Math.exp(-c);return Tt-u/m*b},i=p=>{const c=p*r*t,u=c*a+a,m=Math.pow(r,2)*Math.pow(p,2)*t,b=Math.exp(-c),E=Pt(Math.pow(p,2),r);return(-n(p)+Tt>0?-1:1)*((u-m)*b)/E}):(n=p=>{const d=Math.exp(-p*t),c=(p-a)*t+1;return-Tt+d*c},i=p=>{const d=Math.exp(-p*t),c=(a-p)*(t*t);return d*c});const o=5/t,l=Ii(n,i,o);if(t=re(t),isNaN(l))return{stiffness:j.stiffness,damping:j.damping,duration:t};{const p=Math.pow(l,2)*s;return{stiffness:p,damping:r*2*Math.sqrt(s*p),duration:t}}}const Ai=12;function Ii(t,e,a){let s=a;for(let n=1;n<Ai;n++)s=s-t(s)/e(s);return s}function Pt(t,e){return t*Math.sqrt(1-e*e)}const Li=["duration","bounce"],Mi=["stiffness","damping","mass"];function Fa(t,e){return e.some(a=>t[a]!==void 0)}function Bi(t){let e={velocity:j.velocity,stiffness:j.stiffness,damping:j.damping,mass:j.mass,isResolvedFromDuration:!1,...t};if(!Fa(t,Mi)&&Fa(t,Li))if(t.visualDuration){const a=t.visualDuration,s=2*Math.PI/(a*1.2),n=s*s,i=2*be(.05,1,1-(t.bounce||0))*Math.sqrt(n);e={...e,mass:j.mass,stiffness:n,damping:i}}else{const a=Ci(t);e={...e,...a,mass:j.mass},e.isResolvedFromDuration=!0}return e}function Ge(t=j.visualDuration,e=j.bounce){const a=typeof t!="object"?{visualDuration:t,keyframes:[0,1],bounce:e}:t;let{restSpeed:s,restDelta:n}=a;const i=a.keyframes[0],r=a.keyframes[a.keyframes.length-1],o={done:!1,value:i},{stiffness:l,damping:p,mass:d,duration:c,velocity:u,isResolvedFromDuration:m}=Bi({...a,velocity:-Q(a.velocity||0)}),b=u||0,E=p/(2*Math.sqrt(l*d)),k=r-i,C=Q(Math.sqrt(l/d)),I=Math.abs(k)<5;s||(s=I?j.restSpeed.granular:j.restSpeed.default),n||(n=I?j.restDelta.granular:j.restDelta.default);let A;if(E<1){const h=Pt(C,E);A=T=>{const P=Math.exp(-E*C*T);return r-P*((b+E*C*k)/h*Math.sin(h*T)+k*Math.cos(h*T))}}else if(E===1)A=h=>r-Math.exp(-C*h)*(k+(b+C*k)*h);else{const h=C*Math.sqrt(E*E-1);A=T=>{const P=Math.exp(-E*C*T),L=Math.min(h*T,300);return r-P*((b+E*C*k)*Math.sinh(L)+h*k*Math.cosh(L))/h}}const w={calculatedDuration:m&&c||null,next:h=>{const T=A(h);if(m)o.done=h>=c;else{let P=h===0?b:0;E<1&&(P=h===0?re(b):Os(A,h,T));const L=Math.abs(P)<=s,R=Math.abs(r-T)<=n;o.done=L&&R}return o.value=o.done?r:T,o},toString:()=>{const h=Math.min(oa(w),pt),T=js(P=>w.next(h*P).value,h,30);return h+"ms "+T},toTransition:()=>{}};return w}Ge.applyToOptions=t=>{const e=Ds(t,100,Ge);return t.ease=e.ease,t.duration=re(e.duration),t.type="keyframes",t};function $t({keyframes:t,velocity:e=0,power:a=.8,timeConstant:s=325,bounceDamping:n=10,bounceStiffness:i=500,modifyTarget:r,min:o,max:l,restDelta:p=.5,restSpeed:d}){const c=t[0],u={done:!1,value:c},m=L=>o!==void 0&&L<o||l!==void 0&&L>l,b=L=>o===void 0?l:l===void 0||Math.abs(o-L)<Math.abs(l-L)?o:l;let E=a*e;const k=c+E,C=r===void 0?k:r(k);C!==k&&(E=C-c);const I=L=>-E*Math.exp(-L/s),A=L=>C+I(L),w=L=>{const R=I(L),O=A(L);u.done=Math.abs(R)<=p,u.value=u.done?C:O};let h,T;const P=L=>{m(u.value)&&(h=L,T=Ge({keyframes:[u.value,b(u.value)],velocity:Os(A,L,u.value),damping:n,stiffness:i,restDelta:p,restSpeed:d}))};return P(0),{calculatedDuration:null,next:L=>{let R=!1;return!T&&h===void 0&&(R=!0,w(L),P(L)),h!==void 0&&L>=h?T.next(L-h):(!R&&w(L),u)}}}function Pi(t,e,a){const s=[],n=a||le.mix||Fs,i=t.length-1;for(let r=0;r<i;r++){let o=n(t[r],t[r+1]);if(e){const l=Array.isArray(e)?e[r]||Ve:e;o=Qt(l,o)}s.push(o)}return s}function $i(t,e,{clamp:a=!0,ease:s,mixer:n}={}){const i=t.length;if(Jt(i===e.length),i===1)return()=>e[0];if(i===2&&e[0]===e[1])return()=>e[1];const r=t[0]===t[1];t[0]>t[i-1]&&(t=[...t].reverse(),e=[...e].reverse());const o=Pi(e,s,n),l=o.length,p=d=>{if(r&&d<t[0])return e[0];let c=0;if(l>1)for(;c<t.length-2&&!(d<t[c+1]);c++);const u=ea(t[c],t[c+1],d);return o[c](u)};return a?d=>p(be(t[0],t[i-1],d)):p}function Ns(t,e){const a=t[t.length-1];for(let s=1;s<=e;s++){const n=ea(0,e,s);t.push(je(a,1,n))}}function zs(t){const e=[0];return Ns(e,t.length-1),e}function Ri(t,e){return t.map(a=>a*e)}function Vi(t,e){return t.map(()=>e||Es).splice(0,t.length-1)}function Ue({duration:t=300,keyframes:e,times:a,ease:s="easeInOut"}){const n=Ss(s)?s.map(Ma):Ma(s),i={done:!1,value:e[0]},r=Ri(a&&a.length===e.length?a:zs(e),t),o=$i(r,e,{ease:Array.isArray(n)?n:Vi(e,n)});return{calculatedDuration:t,next:l=>(i.value=o(l),i.done=l>=t,i)}}const Fi=t=>t!==null;function la(t,{repeat:e,repeatType:a="loop"},s,n=1){const i=t.filter(Fi),o=n<0||e&&a!=="loop"&&e%2===1?0:i.length-1;return!o||s===void 0?i[o]:s}const ji={decay:$t,inertia:$t,tween:Ue,keyframes:Ue,spring:Ge};function Hs(t){typeof t.type=="string"&&(t.type=ji[t.type])}class da{constructor(){this.updateFinished()}get finished(){return this._finished}updateFinished(){this._finished=new Promise(e=>{this.resolve=e})}notifyFinished(){this.resolve()}then(e,a){return this.finished.then(e,a)}}const Di=t=>t/100;class ca extends da{constructor(e){super(),this.state="idle",this.startTime=null,this.isStopped=!1,this.currentTime=0,this.holdTime=null,this.playbackSpeed=1,this.stop=()=>{const{motionValue:a}=this.options;a&&a.updatedAt!==X.now()&&this.tick(X.now()),this.isStopped=!0,this.state!=="idle"&&(this.teardown(),this.options.onStop?.())},this.options=e,this.initAnimation(),this.play(),e.autoplay===!1&&this.pause()}initAnimation(){const{options:e}=this;Hs(e);const{type:a=Ue,repeat:s=0,repeatDelay:n=0,repeatType:i,velocity:r=0}=e;let{keyframes:o}=e;const l=a||Ue;l!==Ue&&typeof o[0]!="number"&&(this.mixKeyframes=Qt(Di,Fs(o[0],o[1])),o=[0,100]);const p=l({...e,keyframes:o});i==="mirror"&&(this.mirroredGenerator=l({...e,keyframes:[...o].reverse(),velocity:-r})),p.calculatedDuration===null&&(p.calculatedDuration=oa(p));const{calculatedDuration:d}=p;this.calculatedDuration=d,this.resolvedDuration=d+n,this.totalDuration=this.resolvedDuration*(s+1)-n,this.generator=p}updateTime(e){const a=Math.round(e-this.startTime)*this.playbackSpeed;this.holdTime!==null?this.currentTime=this.holdTime:this.currentTime=a}tick(e,a=!1){const{generator:s,totalDuration:n,mixKeyframes:i,mirroredGenerator:r,resolvedDuration:o,calculatedDuration:l}=this;if(this.startTime===null)return s.next(0);const{delay:p=0,keyframes:d,repeat:c,repeatType:u,repeatDelay:m,type:b,onUpdate:E,finalKeyframe:k}=this.options;this.speed>0?this.startTime=Math.min(this.startTime,e):this.speed<0&&(this.startTime=Math.min(e-n/this.speed,this.startTime)),a?this.currentTime=e:this.updateTime(e);const C=this.currentTime-p*(this.playbackSpeed>=0?1:-1),I=this.playbackSpeed>=0?C<0:C>n;this.currentTime=Math.max(C,0),this.state==="finished"&&this.holdTime===null&&(this.currentTime=n);let A=this.currentTime,w=s;if(c){const L=Math.min(this.currentTime,n)/o;let R=Math.floor(L),O=L%1;!O&&L>=1&&(O=1),O===1&&R--,R=Math.min(R,c+1),R%2&&(u==="reverse"?(O=1-O,m&&(O-=m/o)):u==="mirror"&&(w=r)),A=be(0,1,O)*o}const h=I?{done:!1,value:d[0]}:w.next(A);i&&(h.value=i(h.value));let{done:T}=h;!I&&l!==null&&(T=this.playbackSpeed>=0?this.currentTime>=n:this.currentTime<=0);const P=this.holdTime===null&&(this.state==="finished"||this.state==="running"&&T);return P&&b!==$t&&(h.value=la(d,this.options,k,this.speed)),E&&E(h.value),P&&this.finish(),h}then(e,a){return this.finished.then(e,a)}get duration(){return Q(this.calculatedDuration)}get iterationDuration(){const{delay:e=0}=this.options||{};return this.duration+Q(e)}get time(){return Q(this.currentTime)}set time(e){e=re(e),this.currentTime=e,this.startTime===null||this.holdTime!==null||this.playbackSpeed===0?this.holdTime=e:this.driver&&(this.startTime=this.driver.now()-e/this.playbackSpeed),this.driver?.start(!1)}get speed(){return this.playbackSpeed}set speed(e){this.updateTime(X.now());const a=this.playbackSpeed!==e;this.playbackSpeed=e,a&&(this.time=Q(this.currentTime))}play(){if(this.isStopped)return;const{driver:e=Si,startTime:a}=this.options;this.driver||(this.driver=e(n=>this.tick(n))),this.options.onPlay?.();const s=this.driver.now();this.state==="finished"?(this.updateFinished(),this.startTime=s):this.holdTime!==null?this.startTime=s-this.holdTime:this.startTime||(this.startTime=a??s),this.state==="finished"&&this.speed<0&&(this.startTime+=this.calculatedDuration),this.holdTime=null,this.state="running",this.driver.start()}pause(){this.state="paused",this.updateTime(X.now()),this.holdTime=this.currentTime}complete(){this.state!=="running"&&this.play(),this.state="finished",this.holdTime=null}finish(){this.notifyFinished(),this.teardown(),this.state="finished",this.options.onComplete?.()}cancel(){this.holdTime=null,this.startTime=0,this.tick(0),this.teardown(),this.options.onCancel?.()}teardown(){this.state="idle",this.stopDriver(),this.startTime=this.holdTime=null}stopDriver(){this.driver&&(this.driver.stop(),this.driver=void 0)}sample(e){return this.startTime=0,this.tick(e,!0)}attachTimeline(e){return this.options.allowFlatten&&(this.options.type="keyframes",this.options.ease="linear",this.initAnimation()),this.driver?.stop(),e.observe(this)}}function Oi(t){for(let e=1;e<t.length;e++)t[e]??(t[e]=t[e-1])}const Se=t=>t*180/Math.PI,Rt=t=>{const e=Se(Math.atan2(t[1],t[0]));return Vt(e)},Ni={x:4,y:5,translateX:4,translateY:5,scaleX:0,scaleY:3,scale:t=>(Math.abs(t[0])+Math.abs(t[3]))/2,rotate:Rt,rotateZ:Rt,skewX:t=>Se(Math.atan(t[1])),skewY:t=>Se(Math.atan(t[2])),skew:t=>(Math.abs(t[1])+Math.abs(t[2]))/2},Vt=t=>(t=t%360,t<0&&(t+=360),t),ja=Rt,Da=t=>Math.sqrt(t[0]*t[0]+t[1]*t[1]),Oa=t=>Math.sqrt(t[4]*t[4]+t[5]*t[5]),zi={x:12,y:13,z:14,translateX:12,translateY:13,translateZ:14,scaleX:Da,scaleY:Oa,scale:t=>(Da(t)+Oa(t))/2,rotateX:t=>Vt(Se(Math.atan2(t[6],t[5]))),rotateY:t=>Vt(Se(Math.atan2(-t[2],t[0]))),rotateZ:ja,rotate:ja,skewX:t=>Se(Math.atan(t[4])),skewY:t=>Se(Math.atan(t[1])),skew:t=>(Math.abs(t[1])+Math.abs(t[4]))/2};function Ft(t){return t.includes("scale")?1:0}function jt(t,e){if(!t||t==="none")return Ft(e);const a=t.match(/^matrix3d\(([-\d.e\s,]+)\)$/u);let s,n;if(a)s=zi,n=a;else{const o=t.match(/^matrix\(([-\d.e\s,]+)\)$/u);s=Ni,n=o}if(!n)return Ft(e);const i=s[e],r=n[1].split(",").map(_i);return typeof i=="function"?i(r):r[i]}const Hi=(t,e)=>{const{transform:a="none"}=getComputedStyle(t);return jt(a,e)};function _i(t){return parseFloat(t.trim())}const De=["transformPerspective","x","y","z","translateX","translateY","translateZ","scale","scaleX","scaleY","rotate","rotateX","rotateY","rotateZ","skew","skewX","skewY"],Oe=new Set(De),Na=t=>t===Fe||t===v,Ui=new Set(["x","y","z"]),qi=De.filter(t=>!Ui.has(t));function Wi(t){const e=[];return qi.forEach(a=>{const s=t.getValue(a);s!==void 0&&(e.push([a,s.get()]),s.set(a.startsWith("scale")?1:0))}),e}const me={width:({x:t},{paddingLeft:e="0",paddingRight:a="0"})=>t.max-t.min-parseFloat(e)-parseFloat(a),height:({y:t},{paddingTop:e="0",paddingBottom:a="0"})=>t.max-t.min-parseFloat(e)-parseFloat(a),top:(t,{top:e})=>parseFloat(e),left:(t,{left:e})=>parseFloat(e),bottom:({y:t},{top:e})=>parseFloat(e)+(t.max-t.min),right:({x:t},{left:e})=>parseFloat(e)+(t.max-t.min),x:(t,{transform:e})=>jt(e,"x"),y:(t,{transform:e})=>jt(e,"y")};me.translateX=me.x;me.translateY=me.y;const Te=new Set;let Dt=!1,Ot=!1,Nt=!1;function _s(){if(Ot){const t=Array.from(Te).filter(s=>s.needsMeasurement),e=new Set(t.map(s=>s.element)),a=new Map;e.forEach(s=>{const n=Wi(s);n.length&&(a.set(s,n),s.render())}),t.forEach(s=>s.measureInitialState()),e.forEach(s=>{s.render();const n=a.get(s);n&&n.forEach(([i,r])=>{s.getValue(i)?.set(r)})}),t.forEach(s=>s.measureEndState()),t.forEach(s=>{s.suspendedScrollY!==void 0&&window.scrollTo(0,s.suspendedScrollY)})}Ot=!1,Dt=!1,Te.forEach(t=>t.complete(Nt)),Te.clear()}function Us(){Te.forEach(t=>{t.readKeyframes(),t.needsMeasurement&&(Ot=!0)})}function Ki(){Nt=!0,Us(),_s(),Nt=!1}class pa{constructor(e,a,s,n,i,r=!1){this.state="pending",this.isAsync=!1,this.needsMeasurement=!1,this.unresolvedKeyframes=[...e],this.onComplete=a,this.name=s,this.motionValue=n,this.element=i,this.isAsync=r}scheduleResolve(){this.state="scheduled",this.isAsync?(Te.add(this),Dt||(Dt=!0,de.read(Us),de.resolveKeyframes(_s))):(this.readKeyframes(),this.complete())}readKeyframes(){const{unresolvedKeyframes:e,name:a,element:s,motionValue:n}=this;if(e[0]===null){const i=n?.get(),r=e[e.length-1];if(i!==void 0)e[0]=i;else if(s&&a){const o=s.readValue(a,r);o!=null&&(e[0]=o)}e[0]===void 0&&(e[0]=r),n&&i===void 0&&n.set(e[0])}Oi(e)}setFinalKeyframe(){}measureInitialState(){}renderEndStyles(){}measureEndState(){}complete(e=!1){this.state="complete",this.onComplete(this.unresolvedKeyframes,this.finalKeyframe,e),Te.delete(this)}cancel(){this.state==="scheduled"&&(Te.delete(this),this.state="pending")}resume(){this.state==="pending"&&this.scheduleResolve()}}const Gi=t=>t.startsWith("--");function Yi(t,e,a){Gi(e)?t.style.setProperty(e,a):t.style[e]=a}const Xi=Zt(()=>window.ScrollTimeline!==void 0),Ji={};function Zi(t,e){const a=Zt(t);return()=>Ji[e]??a()}const qs=Zi(()=>{try{document.createElement("div").animate({opacity:0},{easing:"linear(0, 1)"})}catch{return!1}return!0},"linearEasing"),ze=([t,e,a,s])=>`cubic-bezier(${t}, ${e}, ${a}, ${s})`,za={linear:"linear",ease:"ease",easeIn:"ease-in",easeOut:"ease-out",easeInOut:"ease-in-out",circIn:ze([0,.65,.55,1]),circOut:ze([.55,0,1,.45]),backIn:ze([.31,.01,.66,-.59]),backOut:ze([.33,1.53,.69,.99])};function Ws(t,e){if(t)return typeof t=="function"?qs()?js(t,e):"ease-out":Cs(t)?ze(t):Array.isArray(t)?t.map(a=>Ws(a,e)||za.easeOut):za[t]}function Qi(t,e,a,{delay:s=0,duration:n=300,repeat:i=0,repeatType:r="loop",ease:o="easeOut",times:l}={},p=void 0){const d={[e]:a};l&&(d.offset=l);const c=Ws(o,n);Array.isArray(c)&&(d.easing=c);const u={delay:s,duration:n,easing:Array.isArray(c)?"linear":c,fill:"both",iterations:i+1,direction:r==="reverse"?"alternate":"normal"};return p&&(u.pseudoElement=p),t.animate(d,u)}function ga(t){return typeof t=="function"&&"applyToOptions"in t}function er({type:t,...e}){return ga(t)&&qs()?t.applyToOptions(e):(e.duration??(e.duration=300),e.ease??(e.ease="easeOut"),e)}class tr extends da{constructor(e){if(super(),this.finishedTime=null,this.isStopped=!1,this.manualStartTime=null,!e)return;const{element:a,name:s,keyframes:n,pseudoElement:i,allowFlatten:r=!1,finalKeyframe:o,onComplete:l}=e;this.isPseudoElement=!!i,this.allowFlatten=r,this.options=e,Jt(typeof e.type!="string");const p=er(e);this.animation=Qi(a,s,n,p,i),p.autoplay===!1&&this.animation.pause(),this.animation.onfinish=()=>{if(this.finishedTime=this.time,!i){const d=la(n,this.options,o,this.speed);this.updateMotionValue?this.updateMotionValue(d):Yi(a,s,d),this.animation.cancel()}l?.(),this.notifyFinished()}}play(){this.isStopped||(this.manualStartTime=null,this.animation.play(),this.state==="finished"&&this.updateFinished())}pause(){this.animation.pause()}complete(){this.animation.finish?.()}cancel(){try{this.animation.cancel()}catch{}}stop(){if(this.isStopped)return;this.isStopped=!0;const{state:e}=this;e==="idle"||e==="finished"||(this.updateMotionValue?this.updateMotionValue():this.commitStyles(),this.isPseudoElement||this.cancel())}commitStyles(){this.isPseudoElement||this.animation.commitStyles?.()}get duration(){const e=this.animation.effect?.getComputedTiming?.().duration||0;return Q(Number(e))}get iterationDuration(){const{delay:e=0}=this.options||{};return this.duration+Q(e)}get time(){return Q(Number(this.animation.currentTime)||0)}set time(e){this.manualStartTime=null,this.finishedTime=null,this.animation.currentTime=re(e)}get speed(){return this.animation.playbackRate}set speed(e){e<0&&(this.finishedTime=null),this.animation.playbackRate=e}get state(){return this.finishedTime!==null?"finished":this.animation.playState}get startTime(){return this.manualStartTime??Number(this.animation.startTime)}set startTime(e){this.manualStartTime=this.animation.startTime=e}attachTimeline({timeline:e,observe:a}){return this.allowFlatten&&this.animation.effect?.updateTiming({easing:"linear"}),this.animation.onfinish=null,e&&Xi()?(this.animation.timeline=e,Ve):a(this)}}const Ks={anticipate:ws,backInOut:ys,circInOut:ks};function ar(t){return t in Ks}function sr(t){typeof t.ease=="string"&&ar(t.ease)&&(t.ease=Ks[t.ease])}const Ct=10;class nr extends tr{constructor(e){sr(e),Hs(e),super(e),e.startTime!==void 0&&(this.startTime=e.startTime),this.options=e}updateMotionValue(e){const{motionValue:a,onUpdate:s,onComplete:n,element:i,...r}=this.options;if(!a)return;if(e!==void 0){a.set(e);return}const o=new ca({...r,autoplay:!1}),l=Math.max(Ct,X.now()-this.startTime),p=be(0,Ct,l-Ct);a.setWithVelocity(o.sample(Math.max(0,l-p)).value,o.sample(l).value,p),o.stop()}}const Ha=(t,e)=>e==="zIndex"?!1:!!(typeof t=="number"||Array.isArray(t)||typeof t=="string"&&(he.test(t)||t==="0")&&!t.startsWith("url("));function ir(t){const e=t[0];if(t.length===1)return!0;for(let a=0;a<t.length;a++)if(t[a]!==e)return!0}function rr(t,e,a,s){const n=t[0];if(n===null)return!1;if(e==="display"||e==="visibility")return!0;const i=t[t.length-1],r=Ha(n,e),o=Ha(i,e);return!r||!o?!1:ir(t)||(a==="spring"||ga(a))&&s}function zt(t){t.duration=0,t.type="keyframes"}const or=new Set(["opacity","clipPath","filter","transform"]),lr=Zt(()=>Object.hasOwnProperty.call(Element.prototype,"animate"));function dr(t){const{motionValue:e,name:a,repeatDelay:s,repeatType:n,damping:i,type:r}=t;if(!(e?.owner?.current instanceof HTMLElement))return!1;const{onUpdate:l,transformTemplate:p}=e.owner.getProps();return lr()&&a&&or.has(a)&&(a!=="transform"||!p)&&!l&&!s&&n!=="mirror"&&i!==0&&r!=="inertia"}const cr=40;class pr extends da{constructor({autoplay:e=!0,delay:a=0,type:s="keyframes",repeat:n=0,repeatDelay:i=0,repeatType:r="loop",keyframes:o,name:l,motionValue:p,element:d,...c}){super(),this.stop=()=>{this._animation&&(this._animation.stop(),this.stopTimeline?.()),this.keyframeResolver?.cancel()},this.createdAt=X.now();const u={autoplay:e,delay:a,type:s,repeat:n,repeatDelay:i,repeatType:r,name:l,motionValue:p,element:d,...c},m=d?.KeyframeResolver||pa;this.keyframeResolver=new m(o,(b,E,k)=>this.onKeyframesResolved(b,E,u,!k),l,p,d),this.keyframeResolver?.scheduleResolve()}onKeyframesResolved(e,a,s,n){this.keyframeResolver=void 0;const{name:i,type:r,velocity:o,delay:l,isHandoff:p,onUpdate:d}=s;this.resolvedAt=X.now(),rr(e,i,r,o)||((le.instantAnimations||!l)&&d?.(la(e,s,a)),e[0]=e[e.length-1],zt(s),s.repeat=0);const u={startTime:n?this.resolvedAt?this.resolvedAt-this.createdAt>cr?this.resolvedAt:this.createdAt:this.createdAt:void 0,finalKeyframe:a,...s,keyframes:e},m=!p&&dr(u)?new nr({...u,element:u.motionValue.owner.current}):new ca(u);m.finished.then(()=>this.notifyFinished()).catch(Ve),this.pendingTimeline&&(this.stopTimeline=m.attachTimeline(this.pendingTimeline),this.pendingTimeline=void 0),this._animation=m}get finished(){return this._animation?this.animation.finished:this._finished}then(e,a){return this.finished.finally(e).then(()=>{})}get animation(){return this._animation||(this.keyframeResolver?.resume(),Ki()),this._animation}get duration(){return this.animation.duration}get iterationDuration(){return this.animation.iterationDuration}get time(){return this.animation.time}set time(e){this.animation.time=e}get speed(){return this.animation.speed}get state(){return this.animation.state}set speed(e){this.animation.speed=e}get startTime(){return this.animation.startTime}attachTimeline(e){return this._animation?this.stopTimeline=this.animation.attachTimeline(e):this.pendingTimeline=e,()=>this.stop()}play(){this.animation.play()}pause(){this.animation.pause()}complete(){this.animation.complete()}cancel(){this._animation&&this.animation.cancel(),this.keyframeResolver?.cancel()}}class gr{constructor(e){this.stop=()=>this.runAll("stop"),this.animations=e.filter(Boolean)}get finished(){return Promise.all(this.animations.map(e=>e.finished))}getAll(e){return this.animations[0][e]}setAll(e,a){for(let s=0;s<this.animations.length;s++)this.animations[s][e]=a}attachTimeline(e){const a=this.animations.map(s=>s.attachTimeline(e));return()=>{a.forEach((s,n)=>{s&&s(),this.animations[n].stop()})}}get time(){return this.getAll("time")}set time(e){this.setAll("time",e)}get speed(){return this.getAll("speed")}set speed(e){this.setAll("speed",e)}get state(){return this.getAll("state")}get startTime(){return this.getAll("startTime")}get duration(){return _a(this.animations,"duration")}get iterationDuration(){return _a(this.animations,"iterationDuration")}runAll(e){this.animations.forEach(a=>a[e]())}play(){this.runAll("play")}pause(){this.runAll("pause")}cancel(){this.runAll("cancel")}complete(){this.runAll("complete")}}function _a(t,e){let a=0;for(let s=0;s<t.length;s++){const n=t[s][e];n!==null&&n>a&&(a=n)}return a}class ur extends gr{then(e,a){return this.finished.finally(e).then(()=>{})}}const fr=/^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u;function mr(t){const e=fr.exec(t);if(!e)return[,];const[,a,s,n]=e;return[`--${a??s}`,n]}function Gs(t,e,a=1){const[s,n]=mr(t);if(!s)return;const i=window.getComputedStyle(e).getPropertyValue(s);if(i){const r=i.trim();return gs(r)?parseFloat(r):r}return sa(n)?Gs(n,e,a+1):n}function Ys(t,e){return t?.[e]??t?.default??t}const br={type:"spring",stiffness:500,damping:25,restSpeed:10},hr=t=>({type:"spring",stiffness:550,damping:t===0?2*Math.sqrt(550):30,restSpeed:10}),xr={type:"keyframes",duration:.8},vr={type:"keyframes",ease:[.25,.1,.35,1],duration:.3},yr=(t,{keyframes:e})=>e.length>2?xr:Oe.has(t)?t.startsWith("scale")?hr(e[1]):br:vr;function wr({when:t,delay:e,delayChildren:a,staggerChildren:s,staggerDirection:n,repeat:i,repeatType:r,repeatDelay:o,from:l,elapsed:p,...d}){return!!Object.keys(d).length}const kr=t=>t!==null;function Er(t,{repeat:e,repeatType:a="loop"},s){const n=t.filter(kr),i=e&&a!=="loop"&&e%2===1?0:n.length-1;return n[i]}const Xs=(t,e,a,s={},n,i)=>r=>{const o=Ys(s,t)||{},l=o.delay||s.delay||0;let{elapsed:p=0}=s;p=p-re(l);const d={keyframes:Array.isArray(a)?a:[null,a],ease:"easeOut",velocity:e.getVelocity(),...o,delay:-p,onUpdate:u=>{e.set(u),o.onUpdate&&o.onUpdate(u)},onComplete:()=>{r(),o.onComplete&&o.onComplete()},name:t,motionValue:e,element:i?void 0:n};wr(o)||Object.assign(d,yr(t,d)),d.duration&&(d.duration=re(d.duration)),d.repeatDelay&&(d.repeatDelay=re(d.repeatDelay)),d.from!==void 0&&(d.keyframes[0]=d.from);let c=!1;if((d.type===!1||d.duration===0&&!d.repeatDelay)&&(zt(d),d.delay===0&&(c=!0)),(le.instantAnimations||le.skipAnimations)&&(c=!0,zt(d),d.delay=0),d.allowFlatten=!o.type&&!o.ease,c&&!i&&e.get()!==void 0){const u=Er(d.keyframes,o);if(u!==void 0){de.update(()=>{d.onUpdate(u),d.onComplete()});return}}return o.isSync?new ca(d):new pr(d)},Js=new Set(["width","height","top","left","right","bottom",...De]),Ua=30,Sr=t=>!isNaN(parseFloat(t));class Tr{constructor(e,a={}){this.canTrackVelocity=null,this.events={},this.updateAndNotify=s=>{const n=X.now();if(this.updatedAt!==n&&this.setPrevFrameValue(),this.prev=this.current,this.setCurrent(s),this.current!==this.prev&&(this.events.change?.notify(this.current),this.dependents))for(const i of this.dependents)i.dirty()},this.hasAnimated=!1,this.setCurrent(e),this.owner=a.owner}setCurrent(e){this.current=e,this.updatedAt=X.now(),this.canTrackVelocity===null&&e!==void 0&&(this.canTrackVelocity=Sr(this.current))}setPrevFrameValue(e=this.current){this.prevFrameValue=e,this.prevUpdatedAt=this.updatedAt}onChange(e){return this.on("change",e)}on(e,a){this.events[e]||(this.events[e]=new fs);const s=this.events[e].add(a);return e==="change"?()=>{s(),de.read(()=>{this.events.change.getSize()||this.stop()})}:s}clearListeners(){for(const e in this.events)this.events[e].clear()}attach(e,a){this.passiveEffect=e,this.stopPassiveEffect=a}set(e){this.passiveEffect?this.passiveEffect(e,this.updateAndNotify):this.updateAndNotify(e)}setWithVelocity(e,a,s){this.set(a),this.prev=void 0,this.prevFrameValue=e,this.prevUpdatedAt=this.updatedAt-s}jump(e,a=!0){this.updateAndNotify(e),this.prev=e,this.prevUpdatedAt=this.prevFrameValue=void 0,a&&this.stop(),this.stopPassiveEffect&&this.stopPassiveEffect()}dirty(){this.events.change?.notify(this.current)}addDependent(e){this.dependents||(this.dependents=new Set),this.dependents.add(e)}removeDependent(e){this.dependents&&this.dependents.delete(e)}get(){return this.current}getPrevious(){return this.prev}getVelocity(){const e=X.now();if(!this.canTrackVelocity||this.prevFrameValue===void 0||e-this.updatedAt>Ua)return 0;const a=Math.min(this.updatedAt-this.prevUpdatedAt,Ua);return ms(parseFloat(this.current)-parseFloat(this.prevFrameValue),a)}start(e){return this.stop(),new Promise(a=>{this.hasAnimated=!0,this.animation=e(a),this.events.animationStart&&this.events.animationStart.notify()}).then(()=>{this.events.animationComplete&&this.events.animationComplete.notify(),this.clearAnimation()})}stop(){this.animation&&(this.animation.stop(),this.events.animationCancel&&this.events.animationCancel.notify()),this.clearAnimation()}isAnimating(){return!!this.animation}clearAnimation(){delete this.animation}destroy(){this.dependents?.clear(),this.events.destroy?.notify(),this.clearListeners(),this.stop(),this.stopPassiveEffect&&this.stopPassiveEffect()}}function Ye(t,e){return new Tr(t,e)}function qa(t){const e=[{},{}];return t?.values.forEach((a,s)=>{e[0][s]=a.get(),e[1][s]=a.getVelocity()}),e}function Zs(t,e,a,s){if(typeof e=="function"){const[n,i]=qa(s);e=e(a!==void 0?a:t.custom,n,i)}if(typeof e=="string"&&(e=t.variants&&t.variants[e]),typeof e=="function"){const[n,i]=qa(s);e=e(a!==void 0?a:t.custom,n,i)}return e}function Cr(t,e,a){const s=t.getProps();return Zs(s,e,s.custom,t)}const Ar=t=>Array.isArray(t);function Ir(t,e,a){t.hasValue(e)?t.getValue(e).set(a):t.addValue(e,Ye(a))}function Lr(t){return Ar(t)?t[t.length-1]||0:t}function Mr(t,e){const a=Cr(t,e);let{transitionEnd:s={},transition:n={},...i}=a||{};i={...i,...s};for(const r in i){const o=Lr(i[r]);Ir(t,r,o)}}const Y=t=>!!(t&&t.getVelocity);function Br(t){return!!(Y(t)&&t.add)}function Pr(t,e){const a=t.getValue("willChange");if(Br(a))return a.add(e);if(!a&&le.WillChange){const s=new le.WillChange("auto");t.addValue("willChange",s),s.add(e)}}function ua(t){return t.replace(/([A-Z])/g,e=>`-${e.toLowerCase()}`)}const $r="framerAppearId",Rr="data-"+ua($r);function Vr(t){return t.props[Rr]}function Fr({protectedKeys:t,needsAnimating:e},a){const s=t.hasOwnProperty(a)&&e[a]!==!0;return e[a]=!1,s}function jr(t,e,{delay:a=0,transitionOverride:s,type:n}={}){let{transition:i=t.getDefaultTransition(),transitionEnd:r,...o}=e;s&&(i=s);const l=[],p=n&&t.animationState&&t.animationState.getState()[n];for(const d in o){const c=t.getValue(d,t.latestValues[d]??null),u=o[d];if(u===void 0||p&&Fr(p,d))continue;const m={delay:a,...Ys(i||{},d)},b=c.get();if(b!==void 0&&!c.isAnimating&&!Array.isArray(u)&&u===b&&!m.velocity)continue;let E=!1;if(window.MotionHandoffAnimation){const C=Vr(t);if(C){const I=window.MotionHandoffAnimation(C,d,de);I!==null&&(m.startTime=I,E=!0)}}Pr(t,d),c.start(Xs(d,c,u,t.shouldReduceMotion&&Js.has(d)?{type:!1}:m,t,E));const k=c.animation;k&&l.push(k)}return r&&Promise.all(l).then(()=>{de.update(()=>{r&&Mr(t,r)})}),l}const Dr={test:t=>t==="auto",parse:t=>t},Qs=t=>e=>e.test(t),en=[Fe,v,Pe,fe,li,oi,Dr],Wa=t=>en.find(Qs(t));function Or(t){return typeof t=="number"?t===0:t!==null?t==="none"||t==="0"||us(t):!0}const Nr=new Set(["brightness","contrast","saturate","opacity"]);function zr(t){const[e,a]=t.slice(0,-1).split("(");if(e==="drop-shadow")return t;const[s]=a.match(na)||[];if(!s)return t;const n=a.replace(s,"");let i=Nr.has(e)?1:0;return s!==a&&(i*=100),e+"("+i+n+")"}const Hr=/\b([a-z-]*)\(.*?\)/gu,Ht={...he,getAnimatableNone:t=>{const e=t.match(Hr);return e?e.map(zr).join(" "):t}},Ka={...Fe,transform:Math.round},_r={rotate:fe,rotateX:fe,rotateY:fe,rotateZ:fe,scale:rt,scaleX:rt,scaleY:rt,scaleZ:rt,skew:fe,skewX:fe,skewY:fe,distance:v,translateX:v,translateY:v,translateZ:v,x:v,y:v,z:v,perspective:v,transformPerspective:v,opacity:We,originX:Pa,originY:Pa,originZ:v},fa={borderWidth:v,borderTopWidth:v,borderRightWidth:v,borderBottomWidth:v,borderLeftWidth:v,borderRadius:v,radius:v,borderTopLeftRadius:v,borderTopRightRadius:v,borderBottomRightRadius:v,borderBottomLeftRadius:v,width:v,maxWidth:v,height:v,maxHeight:v,top:v,right:v,bottom:v,left:v,inset:v,insetBlock:v,insetBlockStart:v,insetBlockEnd:v,insetInline:v,insetInlineStart:v,insetInlineEnd:v,padding:v,paddingTop:v,paddingRight:v,paddingBottom:v,paddingLeft:v,paddingBlock:v,paddingBlockStart:v,paddingBlockEnd:v,paddingInline:v,paddingInlineStart:v,paddingInlineEnd:v,margin:v,marginTop:v,marginRight:v,marginBottom:v,marginLeft:v,marginBlock:v,marginBlockStart:v,marginBlockEnd:v,marginInline:v,marginInlineStart:v,marginInlineEnd:v,backgroundPositionX:v,backgroundPositionY:v,..._r,zIndex:Ka,fillOpacity:We,strokeOpacity:We,numOctaves:Ka},Ur={...fa,color:z,backgroundColor:z,outlineColor:z,fill:z,stroke:z,borderColor:z,borderTopColor:z,borderRightColor:z,borderBottomColor:z,borderLeftColor:z,filter:Ht,WebkitFilter:Ht},tn=t=>Ur[t];function an(t,e){let a=tn(t);return a!==Ht&&(a=he),a.getAnimatableNone?a.getAnimatableNone(e):void 0}const qr=new Set(["auto","none","0"]);function Wr(t,e,a){let s=0,n;for(;s<t.length&&!n;){const i=t[s];typeof i=="string"&&!qr.has(i)&&Ke(i).values.length&&(n=t[s]),s++}if(n&&a)for(const i of e)t[i]=an(a,n)}class Kr extends pa{constructor(e,a,s,n,i){super(e,a,s,n,i,!0)}readKeyframes(){const{unresolvedKeyframes:e,element:a,name:s}=this;if(!a||!a.current)return;super.readKeyframes();for(let d=0;d<e.length;d++){let c=e[d];if(typeof c=="string"&&(c=c.trim(),sa(c))){const u=Gs(c,a.current);u!==void 0&&(e[d]=u),d===e.length-1&&(this.finalKeyframe=c)}}if(this.resolveNoneKeyframes(),!Js.has(s)||e.length!==2)return;const[n,i]=e,r=Wa(n),o=Wa(i),l=Ba(n),p=Ba(i);if(l!==p&&me[s]){this.needsMeasurement=!0;return}if(r!==o)if(Na(r)&&Na(o))for(let d=0;d<e.length;d++){const c=e[d];typeof c=="string"&&(e[d]=parseFloat(c))}else me[s]&&(this.needsMeasurement=!0)}resolveNoneKeyframes(){const{unresolvedKeyframes:e,name:a}=this,s=[];for(let n=0;n<e.length;n++)(e[n]===null||Or(e[n]))&&s.push(n);s.length&&Wr(e,s,a)}measureInitialState(){const{element:e,unresolvedKeyframes:a,name:s}=this;if(!e||!e.current)return;s==="height"&&(this.suspendedScrollY=window.pageYOffset),this.measuredOrigin=me[s](e.measureViewportBox(),window.getComputedStyle(e.current)),a[0]=this.measuredOrigin;const n=a[a.length-1];n!==void 0&&e.getValue(s,n).jump(n,!1)}measureEndState(){const{element:e,name:a,unresolvedKeyframes:s}=this;if(!e||!e.current)return;const n=e.getValue(a);n&&n.jump(this.measuredOrigin,!1);const i=s.length-1,r=s[i];s[i]=me[a](e.measureViewportBox(),window.getComputedStyle(e.current)),r!==null&&this.finalKeyframe===void 0&&(this.finalKeyframe=r),this.removedTransforms?.length&&this.removedTransforms.forEach(([o,l])=>{e.getValue(o).set(l)}),this.resolveNoneKeyframes()}}function Gr(t,e,a){if(t instanceof EventTarget)return[t];if(typeof t=="string"){let s=document;const n=a?.[t]??s.querySelectorAll(t);return n?Array.from(n):[]}return Array.from(t)}const sn=(t,e)=>e&&typeof t=="number"?e.transform(t):t,{schedule:Yr}=As(queueMicrotask,!1);function nn(t){return zn(t)&&"ownerSVGElement"in t}function Xr(t){return nn(t)&&t.tagName==="svg"}const Jr=[...en,z,he],Zr=t=>Jr.find(Qs(t)),Ga=()=>({min:0,max:0}),ma=()=>({x:Ga(),y:Ga()}),_t={current:null},rn={current:!1},Qr=typeof window<"u";function eo(){if(rn.current=!0,!!Qr)if(window.matchMedia){const t=window.matchMedia("(prefers-reduced-motion)"),e=()=>_t.current=t.matches;t.addEventListener("change",e),e()}else _t.current=!1}const Xe=new WeakMap;function to(t){return t!==null&&typeof t=="object"&&typeof t.start=="function"}function ao(t){return typeof t=="string"||Array.isArray(t)}const so=["animate","whileInView","whileFocus","whileHover","whileTap","whileDrag","exit"],no=["initial",...so];function on(t){return to(t.animate)||no.some(e=>ao(t[e]))}function io(t){return!!(on(t)||t.variants)}function ro(t,e,a){for(const s in e){const n=e[s],i=a[s];if(Y(n))t.addValue(s,n);else if(Y(i))t.addValue(s,Ye(n,{owner:t}));else if(i!==n)if(t.hasValue(s)){const r=t.getValue(s);r.liveStyle===!0?r.jump(n):r.hasAnimated||r.set(n)}else{const r=t.getStaticValue(s);t.addValue(s,Ye(r!==void 0?r:n,{owner:t}))}}for(const s in a)e[s]===void 0&&t.removeValue(s);return e}const Ya=["AnimationStart","AnimationComplete","Update","BeforeLayoutMeasure","LayoutMeasure","LayoutAnimationStart","LayoutAnimationComplete"];let Xa={};class ln{scrapeMotionValuesFromProps(e,a,s){return{}}constructor({parent:e,props:a,presenceContext:s,reducedMotionConfig:n,blockInitialAnimation:i,visualState:r},o={}){this.current=null,this.children=new Set,this.isVariantNode=!1,this.isControllingVariants=!1,this.shouldReduceMotion=null,this.values=new Map,this.KeyframeResolver=pa,this.features={},this.valueSubscriptions=new Map,this.prevMotionValues={},this.events={},this.propEventSubscriptions={},this.notifyUpdate=()=>this.notify("Update",this.latestValues),this.render=()=>{this.current&&(this.triggerBuild(),this.renderInstance(this.current,this.renderState,this.props.style,this.projection))},this.renderScheduledAt=0,this.scheduleRender=()=>{const u=X.now();this.renderScheduledAt<u&&(this.renderScheduledAt=u,de.render(this.render,!1,!0))};const{latestValues:l,renderState:p}=r;this.latestValues=l,this.baseTarget={...l},this.initialValues=a.initial?{...l}:{},this.renderState=p,this.parent=e,this.props=a,this.presenceContext=s,this.depth=e?e.depth+1:0,this.reducedMotionConfig=n,this.options=o,this.blockInitialAnimation=!!i,this.isControllingVariants=on(a),this.isVariantNode=io(a),this.isVariantNode&&(this.variantChildren=new Set),this.manuallyAnimateOnMount=!!(e&&e.current);const{willChange:d,...c}=this.scrapeMotionValuesFromProps(a,{},this);for(const u in c){const m=c[u];l[u]!==void 0&&Y(m)&&m.set(l[u])}}mount(e){this.current=e,Xe.set(e,this),this.projection&&!this.projection.instance&&this.projection.mount(e),this.parent&&this.isVariantNode&&!this.isControllingVariants&&(this.removeFromVariantTree=this.parent.addVariantChild(this)),this.values.forEach((a,s)=>this.bindToMotionValue(s,a)),this.reducedMotionConfig==="never"?this.shouldReduceMotion=!1:this.reducedMotionConfig==="always"?this.shouldReduceMotion=!0:(rn.current||eo(),this.shouldReduceMotion=_t.current),this.parent?.addChild(this),this.update(this.props,this.presenceContext)}unmount(){this.projection&&this.projection.unmount(),Lt(this.notifyUpdate),Lt(this.render),this.valueSubscriptions.forEach(e=>e()),this.valueSubscriptions.clear(),this.removeFromVariantTree&&this.removeFromVariantTree(),this.parent?.removeChild(this);for(const e in this.events)this.events[e].clear();for(const e in this.features){const a=this.features[e];a&&(a.unmount(),a.isMounted=!1)}this.current=null}addChild(e){this.children.add(e),this.enteringChildren??(this.enteringChildren=new Set),this.enteringChildren.add(e)}removeChild(e){this.children.delete(e),this.enteringChildren&&this.enteringChildren.delete(e)}bindToMotionValue(e,a){this.valueSubscriptions.has(e)&&this.valueSubscriptions.get(e)();const s=Oe.has(e);s&&this.onBindTransform&&this.onBindTransform();const n=a.on("change",r=>{this.latestValues[e]=r,this.props.onUpdate&&de.preRender(this.notifyUpdate),s&&this.projection&&(this.projection.isTransformDirty=!0),this.scheduleRender()});let i;typeof window<"u"&&window.MotionCheckAppearSync&&(i=window.MotionCheckAppearSync(this,e,a)),this.valueSubscriptions.set(e,()=>{n(),i&&i(),a.owner&&a.stop()})}sortNodePosition(e){return!this.current||!this.sortInstanceNodePosition||this.type!==e.type?0:this.sortInstanceNodePosition(this.current,e.current)}updateFeatures(){let e="animation";for(e in Xa){const a=Xa[e];if(!a)continue;const{isEnabled:s,Feature:n}=a;if(!this.features[e]&&n&&s(this.props)&&(this.features[e]=new n(this)),this.features[e]){const i=this.features[e];i.isMounted?i.update():(i.mount(),i.isMounted=!0)}}}triggerBuild(){this.build(this.renderState,this.latestValues,this.props)}measureViewportBox(){return this.current?this.measureInstanceViewportBox(this.current,this.props):ma()}getStaticValue(e){return this.latestValues[e]}setStaticValue(e,a){this.latestValues[e]=a}update(e,a){(e.transformTemplate||this.props.transformTemplate)&&this.scheduleRender(),this.prevProps=this.props,this.props=e,this.prevPresenceContext=this.presenceContext,this.presenceContext=a;for(let s=0;s<Ya.length;s++){const n=Ya[s];this.propEventSubscriptions[n]&&(this.propEventSubscriptions[n](),delete this.propEventSubscriptions[n]);const i="on"+n,r=e[i];r&&(this.propEventSubscriptions[n]=this.on(n,r))}this.prevMotionValues=ro(this,this.scrapeMotionValuesFromProps(e,this.prevProps||{},this),this.prevMotionValues),this.handleChildMotionValue&&this.handleChildMotionValue()}getProps(){return this.props}getVariant(e){return this.props.variants?this.props.variants[e]:void 0}getDefaultTransition(){return this.props.transition}getTransformPagePoint(){return this.props.transformPagePoint}getClosestVariantNode(){return this.isVariantNode?this:this.parent?this.parent.getClosestVariantNode():void 0}addVariantChild(e){const a=this.getClosestVariantNode();if(a)return a.variantChildren&&a.variantChildren.add(e),()=>a.variantChildren.delete(e)}addValue(e,a){const s=this.values.get(e);a!==s&&(s&&this.removeValue(e),this.bindToMotionValue(e,a),this.values.set(e,a),this.latestValues[e]=a.get())}removeValue(e){this.values.delete(e);const a=this.valueSubscriptions.get(e);a&&(a(),this.valueSubscriptions.delete(e)),delete this.latestValues[e],this.removeValueFromRenderState(e,this.renderState)}hasValue(e){return this.values.has(e)}getValue(e,a){if(this.props.values&&this.props.values[e])return this.props.values[e];let s=this.values.get(e);return s===void 0&&a!==void 0&&(s=Ye(a===null?void 0:a,{owner:this}),this.addValue(e,s)),s}readValue(e,a){let s=this.latestValues[e]!==void 0||!this.current?this.latestValues[e]:this.getBaseTargetFromProps(this.props,e)??this.readValueFromInstance(this.current,e,this.options);return s!=null&&(typeof s=="string"&&(gs(s)||us(s))?s=parseFloat(s):!Zr(s)&&he.test(a)&&(s=an(e,a)),this.setBaseTarget(e,Y(s)?s.get():s)),Y(s)?s.get():s}setBaseTarget(e,a){this.baseTarget[e]=a}getBaseTarget(e){const{initial:a}=this.props;let s;if(typeof a=="string"||typeof a=="object"){const i=Zs(this.props,a,this.presenceContext?.custom);i&&(s=i[e])}if(a&&s!==void 0)return s;const n=this.getBaseTargetFromProps(this.props,e);return n!==void 0&&!Y(n)?n:this.initialValues[e]!==void 0&&s===void 0?void 0:this.baseTarget[e]}on(e,a){return this.events[e]||(this.events[e]=new fs),this.events[e].add(a)}notify(e,...a){this.events[e]&&this.events[e].notify(...a)}scheduleRenderMicrotask(){Yr.render(this.render)}}class dn extends ln{constructor(){super(...arguments),this.KeyframeResolver=Kr}sortInstanceNodePosition(e,a){return e.compareDocumentPosition(a)&2?1:-1}getBaseTargetFromProps(e,a){const s=e.style;return s?s[a]:void 0}removeValueFromRenderState(e,{vars:a,style:s}){delete a[e],delete s[e]}handleChildMotionValue(){this.childSubscription&&(this.childSubscription(),delete this.childSubscription);const{children:e}=this.props;Y(e)&&(this.childSubscription=e.on("change",a=>{this.current&&(this.current.textContent=`${a}`)}))}}function oo({top:t,left:e,right:a,bottom:s}){return{x:{min:e,max:a},y:{min:t,max:s}}}function lo(t,e){if(!e)return t;const a=e({x:t.left,y:t.top}),s=e({x:t.right,y:t.bottom});return{top:a.y,left:a.x,bottom:s.y,right:s.x}}function co(t,e){return oo(lo(t.getBoundingClientRect(),e))}const po={x:"translateX",y:"translateY",z:"translateZ",transformPerspective:"perspective"},go=De.length;function uo(t,e,a){let s="",n=!0;for(let i=0;i<go;i++){const r=De[i],o=t[r];if(o===void 0)continue;let l=!0;if(typeof o=="number"?l=o===(r.startsWith("scale")?1:0):l=parseFloat(o)===0,!l||a){const p=sn(o,fa[r]);if(!l){n=!1;const d=po[r]||r;s+=`${d}(${p}) `}a&&(e[r]=p)}}return s=s.trim(),a?s=a(e,n?"":s):n&&(s="none"),s}function cn(t,e,a){const{style:s,vars:n,transformOrigin:i}=t;let r=!1,o=!1;for(const l in e){const p=e[l];if(Oe.has(l)){r=!0;continue}else if(Ls(l)){n[l]=p;continue}else{const d=sn(p,fa[l]);l.startsWith("origin")?(o=!0,i[l]=d):s[l]=d}}if(e.transform||(r||a?s.transform=uo(e,t.transform,a):s.transform&&(s.transform="none")),o){const{originX:l="50%",originY:p="50%",originZ:d=0}=i;s.transformOrigin=`${l} ${p} ${d}`}}function pn(t,{style:e,vars:a},s,n){const i=t.style;let r;for(r in e)i[r]=e[r];n?.applyProjectionStyles(i,s);for(r in a)i.setProperty(r,a[r])}function Ja(t,e){return e.max===e.min?0:t/(e.max-e.min)*100}const Ne={correct:(t,e)=>{if(!e.target)return t;if(typeof t=="string")if(v.test(t))t=parseFloat(t);else return t;const a=Ja(t,e.target.x),s=Ja(t,e.target.y);return`${a}% ${s}%`}},fo={correct:(t,{treeScale:e,projectionDelta:a})=>{const s=t,n=he.parse(t);if(n.length>5)return s;const i=he.createTransformer(t),r=typeof n[0]!="number"?1:0,o=a.x.scale*e.x,l=a.y.scale*e.y;n[0+r]/=o,n[1+r]/=l;const p=je(o,l,.5);return typeof n[2+r]=="number"&&(n[2+r]/=p),typeof n[3+r]=="number"&&(n[3+r]/=p),i(n)}},mo={borderRadius:{...Ne,applyTo:["borderTopLeftRadius","borderTopRightRadius","borderBottomLeftRadius","borderBottomRightRadius"]},borderTopLeftRadius:Ne,borderTopRightRadius:Ne,borderBottomLeftRadius:Ne,borderBottomRightRadius:Ne,boxShadow:fo};function bo(t,{layout:e,layoutId:a}){return Oe.has(t)||t.startsWith("origin")||(e||a!==void 0)&&(!!mo[t]||t==="opacity")}function gn(t,e,a){const s=t.style,n=e?.style,i={};if(!s)return i;for(const r in s)(Y(s[r])||n&&Y(n[r])||bo(r,t)||a?.getValue(r)?.liveStyle!==void 0)&&(i[r]=s[r]);return i}function ho(t){return window.getComputedStyle(t)}class xo extends dn{constructor(){super(...arguments),this.type="html",this.renderInstance=pn}readValueFromInstance(e,a){if(Oe.has(a))return this.projection?.isProjecting?Ft(a):Hi(e,a);{const s=ho(e),n=(Ls(a)?s.getPropertyValue(a):s[a])||0;return typeof n=="string"?n.trim():n}}measureInstanceViewportBox(e,{transformPagePoint:a}){return co(e,a)}build(e,a,s){cn(e,a,s.transformTemplate)}scrapeMotionValuesFromProps(e,a,s){return gn(e,a,s)}}const vo={offset:"stroke-dashoffset",array:"stroke-dasharray"},yo={offset:"strokeDashoffset",array:"strokeDasharray"};function wo(t,e,a=1,s=0,n=!0){t.pathLength=1;const i=n?vo:yo;t[i.offset]=v.transform(-s);const r=v.transform(e),o=v.transform(a);t[i.array]=`${r} ${o}`}const ko=["offsetDistance","offsetPath","offsetRotate","offsetAnchor"];function Eo(t,{attrX:e,attrY:a,attrScale:s,pathLength:n,pathSpacing:i=1,pathOffset:r=0,...o},l,p,d){if(cn(t,o,p),l){t.style.viewBox&&(t.attrs.viewBox=t.style.viewBox);return}t.attrs=t.style,t.style={};const{attrs:c,style:u}=t;c.transform&&(u.transform=c.transform,delete c.transform),(u.transform||c.transformOrigin)&&(u.transformOrigin=c.transformOrigin??"50% 50%",delete c.transformOrigin),u.transform&&(u.transformBox=d?.transformBox??"fill-box",delete c.transformBox);for(const m of ko)c[m]!==void 0&&(u[m]=c[m],delete c[m]);e!==void 0&&(c.x=e),a!==void 0&&(c.y=a),s!==void 0&&(c.scale=s),n!==void 0&&wo(c,n,i,r,!1)}const un=new Set(["baseFrequency","diffuseConstant","kernelMatrix","kernelUnitLength","keySplines","keyTimes","limitingConeAngle","markerHeight","markerWidth","numOctaves","targetX","targetY","surfaceScale","specularConstant","specularExponent","stdDeviation","tableValues","viewBox","gradientTransform","pathLength","startOffset","textLength","lengthAdjust"]),So=t=>typeof t=="string"&&t.toLowerCase()==="svg";function To(t,e,a,s){pn(t,e,void 0,s);for(const n in e.attrs)t.setAttribute(un.has(n)?n:ua(n),e.attrs[n])}function Co(t,e,a){const s=gn(t,e,a);for(const n in t)if(Y(t[n])||Y(e[n])){const i=De.indexOf(n)!==-1?"attr"+n.charAt(0).toUpperCase()+n.substring(1):n;s[i]=t[n]}return s}class Ao extends dn{constructor(){super(...arguments),this.type="svg",this.isSVGTag=!1,this.measureInstanceViewportBox=ma}getBaseTargetFromProps(e,a){return e[a]}readValueFromInstance(e,a){if(Oe.has(a)){const s=tn(a);return s&&s.default||0}return a=un.has(a)?a:ua(a),e.getAttribute(a)}scrapeMotionValuesFromProps(e,a,s){return Co(e,a,s)}build(e,a,s){Eo(e,a,this.isSVGTag,s.transformTemplate,s.style)}renderInstance(e,a,s,n){To(e,a,s,n)}mount(e){this.isSVGTag=So(e.tagName),super.mount(e)}}function Io(t,e){return t in e}class Lo extends ln{constructor(){super(...arguments),this.type="object"}readValueFromInstance(e,a){if(Io(a,e)){const s=e[a];if(typeof s=="string"||typeof s=="number")return s}}getBaseTargetFromProps(){}removeValueFromRenderState(e,a){delete a.output[e]}measureInstanceViewportBox(){return ma()}build(e,a){Object.assign(e.output,a)}renderInstance(e,{output:a}){Object.assign(e,a)}sortInstanceNodePosition(){return 0}}function Mo(t,e,a){const s=Y(t)?t:Ye(t);return s.start(Xs("",s,e,a)),s.animation}function ba(t){return typeof t=="object"&&!Array.isArray(t)}function fn(t,e,a,s){return typeof t=="string"&&ba(e)?Gr(t,a,s):t instanceof NodeList?Array.from(t):Array.isArray(t)?t:[t]}function Bo(t,e,a){return t*(e+1)}function Za(t,e,a,s){return typeof e=="number"?e:e.startsWith("-")||e.startsWith("+")?Math.max(0,t+parseFloat(e)):e==="<"?a:e.startsWith("<")?Math.max(0,a+parseFloat(e.slice(1))):s.get(e)??t}function Po(t,e,a){for(let s=0;s<t.length;s++){const n=t[s];n.at>e&&n.at<a&&(ps(t,n),s--)}}function $o(t,e,a,s,n,i){Po(t,n,i);for(let r=0;r<e.length;r++)t.push({value:e[r],at:je(n,i,s[r]),easing:Ts(a,r)})}function Ro(t,e){for(let a=0;a<t.length;a++)t[a]=t[a]/(e+1)}function Vo(t,e){return t.at===e.at?t.value===null?1:e.value===null?-1:0:t.at-e.at}const Fo="easeInOut";function jo(t,{defaultTransition:e={},...a}={},s,n){const i=e.duration||.3,r=new Map,o=new Map,l={},p=new Map;let d=0,c=0,u=0;for(let m=0;m<t.length;m++){const b=t[m];if(typeof b=="string"){p.set(b,c);continue}else if(!Array.isArray(b)){p.set(b.name,Za(c,b.at,d,p));continue}let[E,k,C={}]=b;C.at!==void 0&&(c=Za(c,C.at,d,p));let I=0;const A=(w,h,T,P=0,L=0)=>{const R=Do(w),{delay:O=0,times:$=zs(R),type:F="keyframes",repeat:pe,repeatType:Z,repeatDelay:Ie=0,...q}=h;let{ease:W=e.ease||"easeOut",duration:y}=h;const V=typeof O=="function"?O(P,L):O,K=R.length,ee=ga(F)?F:n?.[F||"keyframes"];if(K<=2&&ee){let we=100;if(K===2&&zo(R)){const ge=R[1]-R[0];we=Math.abs(ge)}const ke={...q};y!==void 0&&(ke.duration=re(y));const Le=Ds(ke,we,ee);W=Le.ease,y=Le.duration}y??(y=i);const ve=c+V;$.length===1&&$[0]===0&&($[1]=1);const ye=$.length-R.length;if(ye>0&&Ns($,ye),R.length===1&&R.unshift(null),pe){y=Bo(y,pe);const we=[...R],ke=[...$];W=Array.isArray(W)?[...W]:[W];const Le=[...W];for(let ge=0;ge<pe;ge++){R.push(...we);for(let ne=0;ne<we.length;ne++)$.push(ke[ne]+(ge+1)),W.push(ne===0?"linear":Ts(Le,ne-1))}Ro($,pe)}const et=ve+y;$o(T,R,W,$,ve,et),I=Math.max(V+y,I),u=Math.max(et,u)};if(Y(E)){const w=Qa(E,o);A(k,C,es("default",w))}else{const w=fn(E,k,s,l),h=w.length;for(let T=0;T<h;T++){k=k,C=C;const P=w[T],L=Qa(P,o);for(const R in k)A(k[R],Oo(C,R),es(R,L),T,h)}}d=c,c+=I}return o.forEach((m,b)=>{for(const E in m){const k=m[E];k.sort(Vo);const C=[],I=[],A=[];for(let h=0;h<k.length;h++){const{at:T,value:P,easing:L}=k[h];C.push(P),I.push(ea(0,u,T)),A.push(L||"easeOut")}I[0]!==0&&(I.unshift(0),C.unshift(C[0]),A.unshift(Fo)),I[I.length-1]!==1&&(I.push(1),C.push(null)),r.has(b)||r.set(b,{keyframes:{},transition:{}});const w=r.get(b);w.keyframes[E]=C,w.transition[E]={...e,duration:u,ease:A,times:I,...a}}}),r}function Qa(t,e){return!e.has(t)&&e.set(t,{}),e.get(t)}function es(t,e){return e[t]||(e[t]=[]),e[t]}function Do(t){return Array.isArray(t)?t:[t]}function Oo(t,e){return t&&t[e]?{...t,...t[e]}:{...t}}const No=t=>typeof t=="number",zo=t=>t.every(No);function Ho(t){const e={presenceContext:null,props:{},visualState:{renderState:{transform:{},transformOrigin:{},style:{},vars:{},attrs:{}},latestValues:{}}},a=nn(t)&&!Xr(t)?new Ao(e):new xo(e);a.mount(t),Xe.set(t,a)}function _o(t){const e={presenceContext:null,props:{},visualState:{renderState:{output:{}},latestValues:{}}},a=new Lo(e);a.mount(t),Xe.set(t,a)}function Uo(t,e){return Y(t)||typeof t=="number"||typeof t=="string"&&!ba(e)}function mn(t,e,a,s){const n=[];if(Uo(t,e))n.push(Mo(t,ba(e)&&e.default||e,a&&(a.default||a)));else{const i=fn(t,e,s),r=i.length;for(let o=0;o<r;o++){const l=i[o],p=l instanceof Element?Ho:_o;Xe.has(l)||p(l);const d=Xe.get(l),c={...a};"delay"in c&&typeof c.delay=="function"&&(c.delay=c.delay(o,r)),n.push(...jr(d,{...e,transition:c},{}))}}return n}function qo(t,e,a){const s=[];return jo(t,e,a,{spring:Ge}).forEach(({keyframes:i,transition:r},o)=>{s.push(...mn(o,i,r))}),s}function Wo(t){return Array.isArray(t)&&t.some(Array.isArray)}function Ko(t){function e(a,s,n){let i=[],r;if(Wo(a))i=qo(a,s,t);else{const{onComplete:l,...p}=n||{};typeof l=="function"&&(r=l),i=mn(a,s,p,t)}const o=new ur(i);return r&&o.finished.then(r),o}return e}const Ut=Ko();class Go{modal=null;isOpen=!1;open(e,a){if(this.isOpen)return;const s=`
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
        `;document.body.insertAdjacentHTML("beforeend",s),this.modal=document.getElementById("modal-overlay"),this.isOpen=!0,document.body.style.overflow="hidden";const n=document.getElementById("modal-content");n&&Ut(n,{opacity:[0,1],transform:["scale(0.9)","scale(1)"]},{duration:.3}),document.getElementById("modal-close")?.addEventListener("click",()=>this.close()),this.modal?.addEventListener("click",r=>{r.target===this.modal&&this.close()});const i=r=>{r.key==="Escape"&&(this.close(),document.removeEventListener("keydown",i))};document.addEventListener("keydown",i)}close(){if(!this.isOpen||!this.modal)return;const e=document.getElementById("modal-content");e&&Ut(e,{opacity:0,transform:"scale(0.9)"},{duration:.2}).finished.then(()=>{this.modal?.remove(),this.modal=null,this.isOpen=!1,document.body.style.overflow=""})}}const bt=new Go;class Yo{container;heroEl;designEl;engineEl;constructor(e){if(this.container=document.getElementById(e),!this.container)throw new Error(`HUD container with id ${e} not found`);this.container.innerHTML="",this.heroEl=this.createPhaseElement("hero",`
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
        `;bt.open(e,"BATTERY HEALTH PREDICTION")}createPhaseElement(e,a){const s=document.createElement("div");return s.id=`phase-${e}`,s.className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 transition-opacity duration-500",s.innerHTML=a,s}setPhaseOpacity(e,a){Ut(e,{opacity:a},{duration:.5})}update(e){if(e<.25)this.setPhaseOpacity(this.heroEl,1),this.setPhaseOpacity(this.designEl,0),this.setPhaseOpacity(this.engineEl,0);else if(e>=.25&&e<.35){const a=(e-.25)/.1;this.setPhaseOpacity(this.heroEl,1-a),this.setPhaseOpacity(this.designEl,a),this.setPhaseOpacity(this.engineEl,0)}else if(e>=.35&&e<.6)this.setPhaseOpacity(this.heroEl,0),this.setPhaseOpacity(this.designEl,1),this.setPhaseOpacity(this.engineEl,0);else if(e>=.6&&e<.7){const a=(e-.6)/.1;this.setPhaseOpacity(this.heroEl,0),this.setPhaseOpacity(this.designEl,1-a),this.setPhaseOpacity(this.engineEl,a)}else this.setPhaseOpacity(this.heroEl,0),this.setPhaseOpacity(this.designEl,0),this.setPhaseOpacity(this.engineEl,1)}}const Xo=[{id:"battery-health",icon:"🔋",title:"AI Battery Health Monitoring",description:"Real-time ML-powered battery degradation analysis and predictive maintenance alerts",category:"ai"},{id:"smart-routing",icon:"🗺️",title:"Intelligent Route Optimization",description:"Traffic-aware energy-efficient routing optimized for Indian road conditions",category:"routing"},{id:"energy-prediction",icon:"⚡",title:"Energy Consumption Prediction",description:"ML models predict range based on driving patterns, terrain, and weather",category:"ai"},{id:"fast-charging",icon:"⚡",title:"800V Ultra-Fast Charging",description:"10-80% charge in 18 minutes with advanced thermal management",category:"battery"},{id:"quad-motor",icon:"🏎️",title:"Quad Motor Torque Vectoring",description:"Independent motor control for each wheel delivering unmatched handling",category:"performance"},{id:"range",icon:"🎯",title:"850 KM Range",description:"Solid-state battery technology with graphene enhancement",category:"battery"},{id:"charging-network",icon:"📍",title:"Smart Charging Network",description:"AI-powered charging station recommendations based on availability and pricing",category:"routing"},{id:"performance",icon:"🚀",title:"0-100 in 2.1s",description:"Hypercar-level acceleration with instant torque delivery",category:"performance"}],Jo=[{id:"1",name:"Vikram Singh",role:"Tech Entrepreneur",company:"Mumbai",content:"The AI-powered battery management is a game-changer. I drive 200km daily and the range prediction is incredibly accurate.",rating:5,image:"/images/testimonials/1.jpg"},{id:"2",name:"Ananya Desai",role:"Business Executive",company:"Bangalore",content:"Smart routing saves me 30 minutes daily on my commute. The traffic-aware navigation is brilliant for Indian roads.",rating:5,image:"/images/testimonials/2.jpg"},{id:"3",name:"Rahul Kapoor",role:"Automotive Journalist",company:"Delhi",content:"This is not just an EV, it's a technological masterpiece. The performance rivals any hypercar I've driven.",rating:5,image:"/images/testimonials/3.jpg"}];class Qe{observer;constructor(e=.1){this.observer=new IntersectionObserver(a=>{a.forEach(s=>{s.isIntersecting&&s.target.classList.add("animate-in")})},{threshold:e})}observe(e){this.observer.observe(e)}observeAll(e){document.querySelectorAll(e).forEach(s=>this.observe(s))}disconnect(){this.observer.disconnect()}}function Zo(t,e,a,s=2e3,n=""){const i=Date.now(),r=()=>{const o=Date.now()-i,l=Math.min(o/s,1),p=1-Math.pow(1-l,3),d=Math.floor(e+(a-e)*p);t.textContent=d.toLocaleString()+n,l<1&&requestAnimationFrame(r)};r()}async function Qo(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
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
                    ${Xo.map((o,l)=>`
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
                    ${Jo.map((o,l)=>`
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
    `;const e=new On("zonda-canvas",40,o=>`/images/ezgif-49d96893fca105bb-jpg/ezgif-frame-${String(o).padStart(3,"0")}.jpg`),a=new Yo("zonda-hud"),s=document.querySelector("#scroll-container"),n=()=>{if(!s)return;const o=s.getBoundingClientRect(),l=window.innerHeight,d=s.offsetHeight-l,c=-o.top,u=Math.min(1,Math.max(0,c/d));e.update(u),a.update(u)};window.addEventListener("scroll",n,{passive:!0}),n(),new Qe(.1).observeAll(".fade-in-section");const r=new IntersectionObserver(o=>{o.forEach(l=>{if(l.isIntersecting){const p=l.target,d=parseFloat(p.dataset.counter||"0"),c=p.dataset.counter?.includes(".")?"s":"";Zo(p,0,d,2e3,c),r.unobserve(p)}})});document.querySelectorAll("[data-counter]").forEach(o=>{r.observe(o)})}const el=[{id:"ceo",name:"Karthik Janardhan",role:"CEO & Founder",image:"/images/ceo.jpg"},{id:"cto",name:"Anushka Kotal",role:"CTO",image:"/images/cto.jpg"},{id:"design",name:"Stash Lopes",role:"Head of Design",image:"/images/design.jpg"},{id:"engineering",name:"Ashwin Vincent Koonissery",role:"Chief Engineer",image:"/images/engineering.jpg"}];async function tl(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
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
                    ${el.map((a,s)=>`
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
    `,new Qe(.1).observeAll(".fade-in-section")}const al=[{category:"Performance",specs:[{label:"0-100 km/h",value:"2.1 seconds"},{label:"Top Speed",value:"350 km/h"},{label:"Power Output",value:"1,400 kW (1,877 HP)"},{label:"Torque",value:"2,300 Nm"},{label:"Drive Type",value:"Quad Motor AWD"}]},{category:"Battery & Range",specs:[{label:"Battery Capacity",value:"120 kWh"},{label:"Battery Type",value:"Solid-State Graphene"},{label:"Range (WLTP)",value:"850 km"},{label:"Charging",value:"800V Architecture"},{label:"10-80% Charge Time",value:"18 minutes"}]},{category:"Dimensions & Weight",specs:[{label:"Length",value:"4,650 mm"},{label:"Width",value:"2,050 mm"},{label:"Height",value:"1,150 mm"},{label:"Wheelbase",value:"2,750 mm"},{label:"Dry Weight",value:"1,150 kg"}]},{category:"AI & Technology",specs:[{label:"AI Processor",value:"NVIDIA Drive Orin"},{label:"Sensors",value:"12 Cameras, 8 Radars, 4 LiDAR"},{label:"Connectivity",value:"5G, V2X"},{label:"OTA Updates",value:"Full Stack"},{label:"Autonomous Level",value:"Level 3"}]}];async function sl(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
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
                    ${al.map((n,i)=>`
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
    `,new Qe(.1).observeAll(".fade-in-section");const a=document.getElementById("battery-health-title");a&&a.addEventListener("click",nl);const s=document.getElementById("intelligent-routing-title");s&&s.addEventListener("click",il)}function nl(){const t=`
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
    `;bt.open(t,"BATTERY HEALTH PREDICTION")}function il(){bt.open(`
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
    `,"INTELLIGENT ROUTING SYSTEM")}class gt{rules=new Map;addRule(e,a){this.rules.set(e,a)}validate(e){const a=[];return this.rules.forEach((s,n)=>{const i=e.get(n)||"",r=this.validateField(n,i,s);a.push(...r)}),{isValid:a.length===0,errors:a}}validateField(e,a,s){const n=[];return s.required&&!a.trim()?(n.push(`${this.formatFieldName(e)} is required`),n):(a&&s.email&&!this.isValidEmail(a)&&n.push(`${this.formatFieldName(e)} must be a valid email address`),a&&s.phone&&!this.isValidPhone(a)&&n.push(`${this.formatFieldName(e)} must be a valid phone number`),a&&s.minLength&&a.length<s.minLength&&n.push(`${this.formatFieldName(e)} must be at least ${s.minLength} characters`),a&&s.maxLength&&a.length>s.maxLength&&n.push(`${this.formatFieldName(e)} must not exceed ${s.maxLength} characters`),a&&s.pattern&&!s.pattern.test(a)&&n.push(`${this.formatFieldName(e)} format is invalid`),a&&s.custom&&!s.custom(a)&&n.push(`${this.formatFieldName(e)} is invalid`),n)}isValidEmail(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}isValidPhone(e){return/^[\d\s\-\+\(\)]+$/.test(e)&&e.replace(/\D/g,"").length>=10}formatFieldName(e){return e.split(/[-_]/).map(a=>a.charAt(0).toUpperCase()+a.slice(1)).join(" ")}}async function rl(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
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
    `;const e=new gt;e.addRule("name",{required:!0,minLength:2}),e.addRule("email",{required:!0,email:!0}),e.addRule("phone",{phone:!0}),e.addRule("subject",{required:!0}),e.addRule("message",{required:!0,minLength:10});const a=document.getElementById("contact-form");a?.addEventListener("submit",n=>{n.preventDefault();const i=new FormData(a),r=e.validate(i);r.isValid?(alert("Thank you for your message! We will get back to you soon. 🎉"),a.reset()):alert(r.errors.join(`
`))}),document.querySelectorAll(".faq-question").forEach(n=>{n.addEventListener("click",()=>{const r=n.parentElement?.querySelector(".faq-answer"),o=n.querySelector(".faq-icon");r?.classList.contains("hidden")?(r.classList.remove("hidden"),o&&(o.textContent="−")):(r?.classList.add("hidden"),o&&(o.textContent="+"))})}),new Qe(.1).observeAll(".fade-in-section")}const ts=[{id:1,category:"technology",title:"Wiring Bench Telemetry",description:"Bench-level MCU wiring and isolation rails inside a dark factory diagnostics rig.",src:"/images/gallery/Gemini_Generated_Image_j11eq8j11eq8j11e.png"},{id:2,category:"interior",title:"Nested MCU Stack",description:"ESP32-CAM and controller stack mounted on the rover with VLC receiver hardware.",src:"/images/gallery/unnamed%20(1).jpg"},{id:3,category:"exterior",title:"Factory Swarm Link",description:"Multi-bot optical communication across an automated factory floor.",src:"/images/gallery/unnamed%20(2).jpg"}],ol=[{title:"Factory Bot Feed 01",src:"/images/gallery/AI_Generates_Project_Visualization_Videos.mp4"},{title:"Factory Bot Feed 02",src:"/images/gallery/Project_Visualization_Images_and_Video.mp4"},{title:"Factory Bot Feed 03",src:"/images/gallery/Zonda_Sequence_Video_Generated.mp4"}];async function ll(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
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
                    ${ol.map(i=>`
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
                    ${ts.map((i,r)=>`
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
    `;const e=document.querySelectorAll(".filter-btn"),a=document.querySelectorAll(".gallery-item"),s=document.getElementById("no-results");e.forEach(i=>{i.addEventListener("click",()=>{e.forEach(l=>{l.classList.remove("active","bg-cyan-300","text-zinc-950"),l.classList.add("border-white/20")}),i.classList.add("active","bg-cyan-300","text-zinc-950"),i.classList.remove("border-white/20");const r=i.getAttribute("data-filter");let o=0;a.forEach(l=>{const p=l.getAttribute("data-category");r==="all"||p===r?(l.classList.remove("hidden"),o++):l.classList.add("hidden")}),o===0?s?.classList.remove("hidden"):s?.classList.add("hidden")})}),a.forEach(i=>{i.addEventListener("click",()=>{const r=i.getAttribute("data-id"),o=ts.find(l=>l.id===parseInt(r||"0"));if(o){const l=`
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
                `;bt.open(l)}})}),new Qe(.1).observeAll(".fade-in-section")}function bn(t){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)}function hn(t){return t.length>=8}async function dl(){const t=document.getElementById("app");if(t){if(!document.querySelector('link[href*="font-awesome"]')){const e=document.createElement("link");e.rel="stylesheet",e.href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",document.head.appendChild(e)}t.innerHTML=`
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
    `,setTimeout(()=>{cl()},100)}}function cl(){const t=document.getElementById("authContainer"),e=document.getElementById("showRegister"),a=document.getElementById("showLogin"),s=document.getElementById("showRegisterMobile"),n=document.getElementById("showLoginMobile"),i=document.getElementById("loginContainer"),r=document.getElementById("registerContainer"),o=document.getElementById("modeEvBtn"),l=document.getElementById("modeFactoryBtn"),p=document.getElementById("login-portal-mode"),d=document.getElementById("loginPortalTitle"),c=document.getElementById("loginPortalDescription"),u=document.getElementById("authThemeRoot"),m=A=>{p&&(p.value=A);const w=A==="factory";t?.classList.toggle("mode-factory",w),t?.classList.toggle("mode-ev",!w),u?.classList.toggle("mode-factory",w),u?.classList.toggle("mode-ev",!w),o?.classList.toggle("active",!w),l?.classList.toggle("active",w),d&&(d.textContent=w?"Dark Factory Login":"EV Portal Login"),c&&(c.textContent=w?"Sign in to monitor robotics lines, alerts, and industrial analytics":"Sign in to access your EV dashboard")};o?.addEventListener("click",()=>m("ev")),l?.addEventListener("click",()=>m("factory")),m("ev"),e?.addEventListener("click",()=>{t?.classList.add("right-panel-active")}),a?.addEventListener("click",()=>{t?.classList.remove("right-panel-active")}),s?.addEventListener("click",()=>{i?.classList.add("hidden"),r?.classList.add("active")}),n?.addEventListener("click",()=>{i?.classList.remove("hidden"),r?.classList.remove("active")}),document.getElementById("useDemoBtn")?.addEventListener("click",()=>{t?.classList.remove("right-panel-active"),i?.classList.remove("hidden"),r?.classList.remove("active");const A=D.getDefaultCredentials(),w=document.getElementById("login-email"),h=document.getElementById("login-password"),T=document.getElementById("login-status");if(!A){$e(T,"Demo account is not configured.","error");return}w&&h&&(w.value=A.email,h.value=A.password,w.classList.add("border-pagani-gold"),h.classList.add("border-pagani-gold"),setTimeout(()=>{w.classList.remove("border-pagani-gold"),h.classList.remove("border-pagani-gold")},1e3))}),document.querySelectorAll(".toggle-password").forEach(A=>{A.addEventListener("click",w=>{w.preventDefault();const h=A.parentElement;if(h){const T=h.querySelector("input");if(T){const P=T.type==="password";T.type=P?"text":"password";const L=A.querySelector("i");L&&(L.className=P?"fa-solid fa-eye-slash":"fa-solid fa-eye")}}})});const k=document.getElementById("register-password");k?.addEventListener("input",()=>{pl(k.value)});const C=document.getElementById("loginForm"),I=document.getElementById("registerForm");C?.addEventListener("submit",A=>{A.preventDefault(),gl()}),I?.addEventListener("submit",A=>{A.preventDefault(),ul()}),location.hash==="#register"&&(t?.classList.add("right-panel-active"),i?.classList.add("hidden"),r?.classList.add("active"))}function pl(t){let e=0;t.length>=8&&e++,t.match(/[a-z]/)&&t.match(/[A-Z]/)&&e++,t.match(/\d/)&&e++,t.match(/[@$!%*?&#]/)&&e++;const a=document.querySelectorAll(".strength-bar"),s=document.querySelector(".strength-text"),n=["bg-red-500","bg-orange-500","bg-yellow-500","bg-green-500"],i=["Weak","Fair","Good","Strong"];a.forEach((r,o)=>{r.classList.remove("bg-red-500","bg-orange-500","bg-yellow-500","bg-green-500","bg-gray-600"),o<e?r.classList.add(n[e-1]):r.classList.add("bg-gray-600")}),s&&(s.textContent=e>0?i[e-1]:"Weak",s.className="strength-text text-xs w-14 text-right "+(e===0||e===1?"text-red-400":e===2?"text-orange-400":e===3?"text-yellow-400":"text-green-400"))}function ae(t,e){t&&(t.textContent=e,t.style.display="block")}function qt(t){t&&(t.textContent="",t.style.display="none")}function $e(t,e,a){t&&(t.textContent=e,t.className=`form-status show ${a}`)}async function gl(){const t=document.getElementById("login-email"),e=document.getElementById("login-password"),a=document.getElementById("login-email-error"),s=document.getElementById("login-password-error"),n=document.getElementById("login-status"),i=document.getElementById("login-portal-mode");let r=!0;if(qt(a),qt(s),n&&(n.className="form-status"),t.value.trim()?bn(t.value)||(ae(a,"Please enter a valid email"),r=!1):(ae(a,"Email is required"),r=!1),e.value.trim()?hn(e.value)||(ae(s,"Password must be at least 8 characters"),r=!1):(ae(s,"Password is required"),r=!1),!r)return;const o=await D.login(t.value,e.value);if(o.success){const l=i?.value||"ev";localStorage.setItem("evbharat_portal_mode",l),$e(n,"Login successful! Redirecting...","success"),setTimeout(()=>{window.location.href=l==="factory"?"/factory-dashboard":"/dashboard"},1500)}else $e(n,o.message,"error")}async function ul(){const t=document.getElementById("register-name"),e=document.getElementById("register-email"),a=document.getElementById("register-password"),s=document.getElementById("register-confirm"),n=document.getElementById("terms-checkbox"),i=document.getElementById("register-name-error"),r=document.getElementById("register-email-error"),o=document.getElementById("register-password-error"),l=document.getElementById("register-confirm-error"),p=document.getElementById("register-status");let d=!0;if([i,r,o,l].forEach(qt),p&&(p.className="form-status"),t.value.trim()||(ae(i,"Name is required"),d=!1),e.value.trim()?bn(e.value)||(ae(r,"Please enter a valid email"),d=!1):(ae(r,"Email is required"),d=!1),a.value.trim()?hn(a.value)||(ae(o,"Password must be at least 8 characters"),d=!1):(ae(o,"Password is required"),d=!1),a.value!==s.value&&(ae(l,"Passwords do not match"),d=!1),n.checked||($e(p,"Please accept the Terms of Service","error"),d=!1),!d)return;const c=await D.signup(t.value,e.value,a.value);c.success?($e(p,"Registration successful! Redirecting...","success"),setTimeout(()=>{window.location.href="/dashboard"},1500)):$e(p,c.message,"error")}class fl{ws=null;reconnectInterval=null;telemetryCallbacks=new Set;statusCallbacks=new Set;currentStatus={connected:!1,device:null,telemetry:null};wsUrls=["ws://localhost:8002/ws","ws://127.0.0.1:8002/ws"];currentUrlIndex=0;RECONNECT_DELAY=3e3;constructor(){this.connect()}setCustomUrls(e){this.wsUrls=e,this.currentUrlIndex=0,this.disconnect(),setTimeout(()=>this.connect(),100)}connect(){if(this.ws?.readyState===WebSocket.OPEN)return;const e=this.wsUrls[this.currentUrlIndex];try{console.log(`🔵 Attempting connection to: ${e}`),this.ws=new WebSocket(e),this.ws.onopen=()=>{console.log(`🔵 Connected to Serial Bridge at ${e}`),this.stopReconnectTimer(),this.currentUrlIndex=0},this.ws.onmessage=a=>{try{const s=JSON.parse(a.data);this.handleMessage(s)}catch(s){console.error("Failed to parse WebSocket message:",s)}},this.ws.onerror=a=>{console.error(`WebSocket error on ${e}:`,a)},this.ws.onclose=()=>{console.log(`🔴 Disconnected from ${e}`),this.currentStatus.connected=!1,this.notifyStatusChange(),this.currentUrlIndex=(this.currentUrlIndex+1)%this.wsUrls.length,this.scheduleReconnect()}}catch(a){console.error("Failed to create WebSocket:",a),this.currentUrlIndex=(this.currentUrlIndex+1)%this.wsUrls.length,this.scheduleReconnect()}}handleMessage(e){switch(e.type){case"status":this.currentStatus={connected:e.connected||!1,device:e.port||e.device||"ESP32",telemetry:e.telemetry||null},this.notifyStatusChange(),e.telemetry&&this.notifyTelemetry(e.telemetry);break;case"telemetry":this.currentStatus.telemetry=e.data,this.currentStatus.connected=!0,this.notifyTelemetry(e.data);break;case"command_response":console.log(`Command ${e.command}: ${e.success?"Success":"Failed"}`);break;case"connection_response":this.currentStatus.connected=e.connected,this.notifyStatusChange();break}}scheduleReconnect(){this.stopReconnectTimer(),this.reconnectInterval=window.setInterval(()=>{console.log("🔄 Attempting to reconnect to Bluetooth Bridge..."),this.connect()},this.RECONNECT_DELAY)}stopReconnectTimer(){this.reconnectInterval!==null&&(clearInterval(this.reconnectInterval),this.reconnectInterval=null)}sendCommand(e){if(!this.ws||this.ws.readyState!==WebSocket.OPEN)return console.warn("WebSocket not connected - command not sent:",e),!1;try{return this.ws.send(JSON.stringify({command:e})),!0}catch(a){return console.error("Failed to send command:",a),!1}}connectToESP32(){if(!this.ws||this.ws.readyState!==WebSocket.OPEN)return console.warn("WebSocket not connected to bridge - trying to reconnect..."),this.connect(),!1;try{return this.ws.send(JSON.stringify({command:"CONNECT"})),!0}catch(e){return console.error("Failed to send connect command:",e),!1}}onTelemetry(e){return this.telemetryCallbacks.add(e),this.currentStatus.telemetry&&e(this.currentStatus.telemetry),()=>{this.telemetryCallbacks.delete(e)}}onStatusChange(e){return this.statusCallbacks.add(e),e(this.currentStatus),()=>{this.statusCallbacks.delete(e)}}getStatus(){return{...this.currentStatus}}notifyTelemetry(e){this.telemetryCallbacks.forEach(a=>{try{a(e)}catch(s){console.error("Error in telemetry callback:",s)}})}notifyStatusChange(){this.statusCallbacks.forEach(e=>{try{e(this.currentStatus)}catch(a){console.error("Error in status callback:",a)}})}disconnect(){this.stopReconnectTimer(),this.ws&&(this.ws.close(),this.ws=null)}}const G=new fl,as="http://192.168.1.11/cam-hi.jpg",At="evbharat_esp32_cam_url",ss="evbharat_cam_mode",ut="http://localhost:8000/stream";let J=null;async function ml(){if(!D.isAuthenticated()){window.location.href="/auth";return}const t=document.getElementById("app");if(!t)return;const e=D.getCurrentUser(),s=(localStorage.getItem("evbharat_portal_mode")||"ev")==="factory";if(!document.querySelector('link[href*="font-awesome"]')){const n=document.createElement("link");n.rel="stylesheet",n.href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",document.head.appendChild(n)}t.innerHTML=`
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
                                <span class="text-[11px] text-gray-500 truncate">Proxy: ${ut}</span>
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
                                Toggle YOLO Detection Mode to proxy frames through ${ut} for live bounding boxes, or keep Direct Feed to pull directly from your ESP32 endpoint.
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
    `,s&&(document.getElementById("quick-route-planner-card")?.remove(),document.getElementById("nearby-stations-card")?.remove(),document.getElementById("quick-route-action")?.remove(),document.getElementById("route-updated-alert")?.remove()),setTimeout(()=>{bl()},100)}function bl(){const t=document.getElementById("refresh-dashboard");t?.addEventListener("click",()=>{t.classList.add("animate-spin"),setTimeout(()=>{t.classList.remove("animate-spin")},1e3)});const e=document.getElementById("sos-btn");let a;e?.addEventListener("mousedown",()=>{a=setTimeout(()=>{alert("Emergency SOS activated! Contacting emergency services...")},3e3)}),e?.addEventListener("mouseup",()=>{clearTimeout(a)}),e?.addEventListener("mouseleave",()=>{clearTimeout(a)}),document.getElementById("vehicle-diagnostics")?.addEventListener("click",()=>{alert("Running vehicle diagnostics... All systems operational!")}),xl(),hl();const n=document.querySelectorAll(".fade-in-section"),i=new IntersectionObserver(r=>{r.forEach(o=>{o.isIntersecting&&o.target.classList.add("animate-fadeInUp")})},{threshold:.1});n.forEach(r=>i.observe(r))}function hl(){const t=document.getElementById("cam-feed"),e=document.getElementById("cam-url-input"),a=document.getElementById("cam-save-url"),s=document.getElementById("cam-toggle-btn"),n=Array.from(document.querySelectorAll("[data-cam-path]")),i=document.getElementById("cam-mode-direct"),r=document.getElementById("cam-mode-yolo"),o=document.getElementById("cam-status-dot"),l=document.getElementById("cam-status-text");if(!t||!e||!a||!s||!o||!l)return;const p=y=>{const V=y.trim();return V?/^https?:\/\//i.test(V)?V:`http://${V}`:""},d=y=>y.replace("/com-hi.jpg","/cam-hi.jpg").replace("com-hi.jpg","cam-hi.jpg").replace("/camhi.jpg","/cam-hi.jpg").replace("camhi.jpg","cam-hi.jpg").replace("/cam-mid.jpeg","/cam-mid.jpg").replace("/cam-lo.jpeg","/cam-lo.jpg").replace("/cam-hi.jpeg","/cam-hi.jpg"),c=y=>{try{const V=new URL(y),K=V.pathname.toLowerCase(),ee=/\/cam-(lo|mid|hi)\.jpg$/.test(K),ve=K.endsWith(".jpg")||K.endsWith(".jpeg");return(!K||K==="/"||!ee&&!ve)&&(V.pathname="/cam-hi.jpg"),V.toString()}catch{return y}},u=(y,V)=>{try{const K=new URL(y);return K.pathname=V,K.toString()}catch{return y}},m=(y,V)=>{if(l.textContent=V,o.classList.remove("bg-red-500","bg-green-500","animate-pulse"),y){o.classList.add("bg-green-500","animate-pulse"),l.classList.remove("text-red-300"),l.classList.add("text-cyan-300");return}o.classList.add("bg-red-500"),l.classList.add("text-red-300")},b=y=>{try{const V=new URL(y);return V.searchParams.set("t",String(Date.now())),V.toString()}catch{return y}},E=y=>{const V=ut.includes("?")?"&":"?";return`${ut}${V}source=${encodeURIComponent(y)}&ts=${Date.now()}`},k=y=>{y?(s.textContent="Stop",s.classList.remove("bg-cyan-500","hover:bg-cyan-400","text-black"),s.classList.add("bg-red-600","hover:bg-red-500","text-white")):(s.textContent="Start",s.classList.remove("bg-red-600","hover:bg-red-500","text-white"),s.classList.add("bg-cyan-500","hover:bg-cyan-400","text-black"))},C=(y,V)=>{y&&(y.classList.toggle("bg-cyan-500",V),y.classList.toggle("text-black",V),y.classList.toggle("text-cyan-300",!V),y.classList.toggle("border-cyan-500",V),y.classList.toggle("border-cyan-500/40",!V),y.classList.toggle("font-semibold",V))},I=localStorage.getItem(ss);let w=(y=>y==="direct"||y==="yolo")(I)?I:"direct",h=c(d(p(localStorage.getItem(At)||as))),T=!1,P=!1;e.value=h,J&&(clearTimeout(J),J=null);const L=()=>{if(w==="direct"){if(!h){m(!1,"No URL");return}P||(P=!0,t.src=b(h))}},R=(y=100)=>{!T||w!=="direct"||(J&&clearTimeout(J),J=setTimeout(()=>{L()},y))},O=()=>{J&&(clearTimeout(J),J=null),P=!1},$=()=>{C(i,w==="direct"),C(r,w==="yolo")},F=()=>{if(O(),!h){m(!1,"No URL");return}T=!0,k(!0),m(!1,"Connecting..."),L()},pe=()=>{if(O(),!h){m(!1,"No URL");return}T=!0,k(!0),m(!1,"YOLO connecting..."),t.src=E(h)},Z=()=>{w==="yolo"?pe():F()},Ie=()=>{T=!1,O(),t.removeAttribute("src"),k(!1),m(!1,"Stopped")},q=y=>{w=y,localStorage.setItem(ss,y),$(),T?Z():m(!1,y==="yolo"?"YOLO ready":"Ready")},W=()=>{const y=c(d(p(e.value)));if(e.value=y,h=y,localStorage.setItem(At,y),!y){Ie(),m(!1,"No URL");return}T?Z():m(!1,w==="yolo"?"YOLO ready":"Ready")};t.addEventListener("load",()=>{P=!1,T&&(w==="direct"?(m(!0,"Online"),R(80)):m(!0,"YOLO active"))}),t.addEventListener("error",()=>{P=!1,m(!1,w==="yolo"?"YOLO proxy unavailable":"Unable to load"),T&&(w==="direct"?R(500):(J&&clearTimeout(J),J=setTimeout(()=>{T&&w==="yolo"&&(t.src=E(h))},1500)))}),a.addEventListener("click",W),e.addEventListener("keydown",y=>{y.key==="Enter"&&(y.preventDefault(),W())}),s.addEventListener("click",()=>{T?Ie():Z()}),i?.addEventListener("click",()=>q("direct")),r?.addEventListener("click",()=>q("yolo")),n.forEach(y=>{y.addEventListener("click",()=>{const V=y.dataset.camPath||"/cam-hi.jpg",K=c(d(p(e.value||h||as))),ee=u(K,V);h=ee,e.value=ee,localStorage.setItem(At,ee),T?Z():m(!1,w==="yolo"?"YOLO ready":"Ready")})}),$(),h?Z():m(!1,"No URL")}function xl(){const t=document.getElementById("bt-connect-btn"),e=document.getElementById("bt-indicator"),a=document.getElementById("bt-status-text"),s=document.getElementById("vehicle-telemetry"),n=document.getElementById("ctrl-forward"),i=document.getElementById("ctrl-backward"),r=document.getElementById("ctrl-left"),o=document.getElementById("ctrl-right"),l=document.getElementById("ctrl-stop"),p=document.getElementById("telemetry-battery"),d=document.getElementById("telemetry-temp"),c=document.getElementById("telemetry-direction"),u=[n,i,r,o,l];u.forEach(m=>m&&(m.disabled=!0)),G.onStatusChange(m=>{m.connected?(e?.classList.remove("bg-red-500"),e?.classList.add("bg-green-500","animate-pulse"),a&&(a.textContent=`Connected to ${m.device||"ESP32"}`),t&&(t.textContent="Connected",t.classList.add("bg-green-500/20","border-green-500/50","text-green-400"),t.classList.remove("bg-blue-500/20","border-blue-500/50","text-blue-400")),s?.classList.remove("opacity-50"),u.forEach(b=>b&&(b.disabled=!1))):(e?.classList.remove("bg-green-500","animate-pulse"),e?.classList.add("bg-red-500"),a&&(a.textContent="Disconnected"),t&&(t.textContent="Connect",t.classList.remove("bg-green-500/20","border-green-500/50","text-green-400"),t.classList.add("bg-blue-500/20","border-blue-500/50","text-blue-400")),s?.classList.add("opacity-50"),u.forEach(b=>b&&(b.disabled=!0)))}),G.onTelemetry(m=>{p&&(p.textContent=`${m.battery}%`),d&&(d.textContent=`${m.temperature.toFixed(1)}°C`),c&&(c.textContent=m.direction,m.moving?(c.classList.remove("text-gray-400"),c.classList.add("text-green-400")):(c.classList.remove("text-green-400"),c.classList.add("text-gray-400")))}),t?.addEventListener("click",()=>{G.getStatus().connected||(G.connectToESP32(),t&&(t.textContent="Connecting..."))}),n?.addEventListener("click",()=>{G.sendCommand("FORWARD")}),i?.addEventListener("click",()=>{G.sendCommand("BACKWARD")}),r?.addEventListener("click",()=>{G.sendCommand("LEFT")}),o?.addEventListener("click",()=>{G.sendCommand("RIGHT")}),l?.addEventListener("click",()=>{G.sendCommand("STOP")}),document.addEventListener("keydown",m=>{if(G.getStatus().connected)switch(m.key.toLowerCase()){case"w":case"arrowup":m.preventDefault(),n?.classList.add("scale-95"),G.sendCommand("FORWARD");break;case"s":case"arrowdown":m.preventDefault(),i?.classList.add("scale-95"),G.sendCommand("BACKWARD");break;case"a":case"arrowleft":m.preventDefault(),r?.classList.add("scale-95"),G.sendCommand("LEFT");break;case"d":case"arrowright":m.preventDefault(),o?.classList.add("scale-95"),G.sendCommand("RIGHT");break;case" ":m.preventDefault(),l?.classList.add("scale-95"),G.sendCommand("STOP");break}}),document.addEventListener("keyup",m=>{switch(m.key.toLowerCase()){case"w":case"arrowup":n?.classList.remove("scale-95");break;case"s":case"arrowdown":i?.classList.remove("scale-95");break;case"a":case"arrowleft":r?.classList.remove("scale-95");break;case"d":case"arrowright":o?.classList.remove("scale-95");break;case" ":l?.classList.remove("scale-95");break}})}async function vl(){if(!D.isAuthenticated()){window.location.href="/auth";return}const t=document.getElementById("app");if(t){if(!document.querySelector('link[href*="font-awesome"]')){const e=document.createElement("link");e.rel="stylesheet",e.href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",document.head.appendChild(e)}t.innerHTML=`
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
    `,setTimeout(()=>{yl()},100)}}function yl(){wl();const t=document.getElementById("charging-history");if(t){const a=[{date:"Today, 10:30 AM",type:"DC Fast",from:"25%",to:"87%",duration:"35 min",energy:"42 kWh"},{date:"Yesterday, 8:15 PM",type:"Home AC",from:"45%",to:"80%",duration:"2h 30m",energy:"28 kWh"},{date:"Feb 12, 3:45 PM",type:"DC Fast",from:"18%",to:"90%",duration:"48 min",energy:"58 kWh"},{date:"Feb 10, 11:00 AM",type:"Public AC",from:"60%",to:"100%",duration:"3h 10m",energy:"32 kWh"}];t.innerHTML=a.map(s=>`
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
        `).join("")}const e=document.getElementById("refresh-btn");e?.addEventListener("click",()=>{e.classList.add("animate-spin"),setTimeout(()=>{e.classList.remove("animate-spin"),El("Battery data refreshed")},1e3)}),kl()}function wl(){document.querySelectorAll("#soh-chart [data-target-height]").forEach((t,e)=>{setTimeout(()=>{t.style.height=t.dataset.targetHeight},100+e*80)}),document.querySelectorAll("#energy-bars [data-target-width]").forEach((t,e)=>{setTimeout(()=>{t.style.width=t.dataset.targetWidth},200+e*100)}),setTimeout(()=>{["donut-dc","donut-home","donut-public"].forEach(t=>{const e=document.getElementById(t);e&&e.setAttribute("stroke-dasharray",e.dataset.targetDash)})},400),setTimeout(()=>{const t=document.getElementById("volt-line"),e=document.getElementById("temp-line");t&&(t.style.strokeDashoffset="0"),e&&(e.style.strokeDashoffset="0"),setTimeout(()=>{const a=document.getElementById("volt-dot"),s=document.getElementById("temp-dot");a&&a.setAttribute("opacity","1"),s&&s.setAttribute("opacity","1")},1500)},600),setTimeout(()=>{const t=document.getElementById("efficiency-ring");t&&t.setAttribute("stroke-dasharray",t.dataset.targetDash)},800)}function kl(){setInterval(()=>{const t=document.getElementById("soc-display"),e=document.getElementById("battery-fill");if(t&&e){const a=parseInt(t.textContent||"87");if(a<100){const s=Math.min(a+1,100);t.textContent=`${s}%`,e.style.height=`${s}%`;const n=document.getElementById("range-value");n&&(n.textContent=`${Math.round(s*4.5)}km`)}}},5e3)}function El(t,e){const a=document.createElement("div");a.className="fixed top-24 right-8 px-6 py-4 rounded-lg backdrop-blur-sm z-50 font-orbitron text-sm fade-in-section bg-green-500/20 border border-green-500/50 text-green-400",a.innerHTML=`<i class="fa-solid fa-check-circle mr-2"></i>${t}`,document.body.appendChild(a),setTimeout(()=>a.remove(),3e3)}async function Sl(){if(!D.isAuthenticated()){window.location.href="/auth";return}const t=document.getElementById("app");t&&(t.innerHTML=`
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
    `,Tl())}function Tl(){const t=document.getElementById("battery-input-form"),e=new gt;e.addRule("voltage",{required:!0,custom:l=>parseFloat(l)>=2.5&&parseFloat(l)<=4.2}),e.addRule("current",{required:!0,custom:l=>parseFloat(l)>=-100&&parseFloat(l)<=100}),e.addRule("temperature",{required:!0,custom:l=>parseFloat(l)>=-20&&parseFloat(l)<=60});const a=[];s(),t?.addEventListener("submit",async l=>{l.preventDefault();const p=new FormData(t),d=e.validate(p);if(!d.isValid){ot(d.errors[0],"error");return}await n(p)});function s(){Object.entries({"scenario-normal":{voltage:3.7,current:-5,temperature:25,cell_age:"fresh",cycle_count:75,age_days:200},"scenario-charging":{voltage:4,current:15,temperature:35,cell_age:"fresh",cycle_count:120,age_days:150},"scenario-cold":{voltage:3.5,current:-3,temperature:-5,cell_age:"fresh",cycle_count:90,age_days:180},"scenario-critical":{voltage:3.1,current:-1,temperature:20,cell_age:"aged",cycle_count:800,age_days:1200}}).forEach(([p,d])=>{document.getElementById(p)?.addEventListener("click",()=>{document.getElementById("voltage-input").value=d.voltage.toString(),document.getElementById("current-input").value=d.current.toString(),document.getElementById("temperature-input").value=d.temperature.toString(),document.getElementById("cell-age-input").value=d.cell_age,document.getElementById("cycle-count-input").value=d.cycle_count.toString(),document.getElementById("age-days-input").value=d.age_days.toString(),ot(`Applied ${p.split("-")[1]} scenario`,"success")})})}async function n(l){const p=document.getElementById("prediction-loading"),d=document.getElementById("prediction-results");if(!(!p||!d)){p.classList.remove("hidden"),d.innerHTML="";try{const c=await Cl({voltage:parseFloat(l.get("voltage")),current:parseFloat(l.get("current")),temperature:parseFloat(l.get("temperature")),cell_age:l.get("cell_age"),cycle_count:parseInt(l.get("cycle_count"))||150,age_days:parseInt(l.get("age_days"))||400});p.classList.add("hidden"),c.status==="success"?(i(c,d),r(c),o()):ot(c.error||"Prediction failed","error")}catch{p.classList.add("hidden"),ot("ML model communication error","error")}}}function i(l,p){if(!l.predictions||!l.analysis)return;const{predictions:d,analysis:c}=l,m={LOW:{bg:"bg-green-500/20",border:"border-green-500/50",text:"text-green-400"},MEDIUM:{bg:"bg-yellow-500/20",border:"border-yellow-500/50",text:"text-yellow-400"},CRITICAL:{bg:"bg-red-500/20",border:"border-red-500/50",text:"text-red-400"}}[c.risk_level];p.innerHTML=`
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
                ${c.alerts.map(b=>{const k={INFO:{bg:"bg-blue-500/10",border:"border-blue-500/30",text:"text-blue-400",icon:"fa-info-circle"},WARNING:{bg:"bg-yellow-500/10",border:"border-yellow-500/30",text:"text-yellow-400",icon:"fa-exclamation-triangle"},CRITICAL:{bg:"bg-red-500/10",border:"border-red-500/30",text:"text-red-400",icon:"fa-exclamation-circle"}}[b.level];return`
                        <div class="p-3 ${k.bg} ${k.border} border rounded-lg">
                            <div class="flex items-start gap-3">
                                <i class="fa-solid ${k.icon} ${k.text} mt-1"></i>
                                <div class="flex-1">
                                    <p class="text-sm font-semibold ${k.text}">${b.type}</p>
                                    <p class="text-xs text-gray-400 mt-1">${b.message}</p>
                                    <p class="text-xs text-gray-300 mt-2 font-semibold">💡 ${b.recommendation}</p>
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
        `}setInterval(()=>{const l=document.getElementById("last-update");l&&(l.textContent=new Date().toLocaleTimeString())},3e4)}async function Cl(t){try{const e="http://localhost:8000",a={voltage:t.voltage,current:t.current,temperature:t.temperature,cycle_count:t.cycle_count||150,age_days:t.age_days||(t.cell_age==="fresh"?200:800)},s=await fetch(`${e}/predict`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)});if(s.ok){const n=await s.json();return{status:n.status,predictions:n.predictions,analysis:n.analysis,error:n.error}}else throw new Error(`ML API returned ${s.status}`)}catch(e){console.warn("ML API not available, using fallback simulation:",e),await new Promise(C=>setTimeout(C,2e3));const{voltage:a,current:s,temperature:n,cycle_count:i=150,age_days:r=400}=t;let o=Math.max(0,Math.min(100,(a-2.5)/(4.2-2.5)*100)),l=Math.min(30,i/100),p=Math.min(20,r/365*5),d=Math.abs(n-25)*.3,c=100-l-p-d;c=Math.max(50,Math.min(100,c));const u=(l+p)/(i+r/7);let m=Math.max(50,(c-80)/(u+.001)*7);m=Math.max(100,Math.min(3e3,m));const b=(o+c)/2;let E;const k=[];return b>=80?(E="LOW",k.push({type:"Battery Health Excellent",message:"Your battery is operating within optimal parameters.",level:"INFO",recommendation:"Continue current charging habits for maximum lifespan."})):b>=65?(E="MEDIUM",k.push({type:"Moderate Degradation Detected",message:"Battery showing signs of aging but still functional.",level:"WARNING",recommendation:"Avoid extreme temperatures and deep discharge cycles."})):(E="CRITICAL",k.push({type:"Battery Health Critical",message:"Significant degradation detected. Consider replacement.",level:"CRITICAL",recommendation:"Schedule immediate battery inspection and replacement planning."})),n>40?k.push({type:"High Temperature Warning",message:"Battery temperature exceeds safe operating range.",level:"WARNING",recommendation:"Allow battery to cool before charging or heavy usage."}):n<0&&k.push({type:"Cold Temperature Alert",message:"Low temperature may reduce battery performance.",level:"INFO",recommendation:"Pre-condition battery before use in cold weather."}),Math.abs(s)>50&&k.push({type:"High Current Draw",message:"Excessive current may accelerate battery degradation.",level:"WARNING",recommendation:"Reduce power demand or use more conservative driving mode."}),{status:"success",predictions:{SOC:o,SOH:c,RUL:m,confidence:.85+Math.random()*.1},analysis:{overall_health:b,risk_level:E,alerts:k,intelligence_version:"EVBharat AI v2.1",assessment_confidence:Math.round((.85+Math.random()*.1)*100)}}}}function ot(t,e){const a=document.createElement("div");a.className=`fixed top-24 right-8 px-6 py-4 rounded-lg backdrop-blur-sm z-50 font-orbitron text-sm fade-in-section ${e==="success"?"bg-green-500/20 border border-green-500/50 text-green-400":"bg-red-500/20 border border-red-500/50 text-red-400"}`,a.innerHTML=`<i class="fa-solid ${e==="success"?"fa-check-circle":"fa-exclamation-circle"} mr-2"></i>${t}`,document.body.appendChild(a),setTimeout(()=>a.remove(),3e3)}class Al{baseUrl;constructor(){this.baseUrl="/api/rag",console.log("🔗 Backend via Vite proxy:",this.baseUrl)}async healthCheck(){return(await this.fetchR(`${this.baseUrl}/health`,{method:"GET"})).json()}async freeChat(e){const a=await this.fetchR(`${this.baseUrl}/free-chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:e})});if(!a.ok){const s=await a.json().catch(()=>({detail:"Network error"}));throw new Error(s.detail||"Chat failed")}return a.json()}async uploadPDF(e){const a=new FormData;a.append("file",e);const s=await this.fetchR(`${this.baseUrl}/upload`,{method:"POST",body:a},3);if(!s.ok){const n=await s.json().catch(()=>({detail:"Upload failed"}));throw new Error(n.detail||"Upload failed")}return s.json()}async docChat(e,a){const s=await this.fetchR(`${this.baseUrl}/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:e,session_id:a})});if(!s.ok){const n=await s.json().catch(()=>({detail:"Chat failed"}));throw new Error(n.detail||"Chat failed")}return s.json()}async speechToText(e){const a=new FormData;a.append("file",e);const s=await this.fetchR(`${this.baseUrl}/speech-to-text`,{method:"POST",body:a},1);if(!s.ok){const n=await s.json().catch(()=>({detail:"Speech transcription failed"}));throw new Error(n.detail||"Speech transcription failed")}return s.json()}async textToSpeech(e,a="en",s=!1){const n=await this.fetchR(`${this.baseUrl}/text-to-speech`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:e,language:a,slow:s})},1);if(!n.ok){const i=await n.json().catch(()=>({detail:"Text to speech failed"}));throw new Error(i.detail||"Text to speech failed")}return n.blob()}async sessionStatus(e){return(await fetch(`${this.baseUrl}/sessions/${e}/status`)).json()}async deleteSession(e){await fetch(`${this.baseUrl}/sessions/${e}`,{method:"DELETE"})}async fetchR(e,a,s=2){let n=null;for(let i=0;i<=s;i++)try{const r=new AbortController,o=setTimeout(()=>r.abort(),3e4),l=await fetch(e,{...a,signal:r.signal});if(clearTimeout(o),(l.status===429||l.status===503)&&i<s){await this.wait(2**i*1e3);continue}return l}catch(r){n=r,i<s&&await this.wait(2**i*1e3)}throw n||new Error("Request failed after all retries")}wait(e){return new Promise(a=>setTimeout(a,e))}}const ue=new Al,ns=[{icon:"fa-hand-holding-dollar",q:"What subsidies are available under FAME II for e-2W buyers?",color:"rgba(34, 197, 94, 0.15)"},{icon:"fa-file-invoice",q:"List the EV registration & road-tax exemptions in Maharashtra.",color:"rgba(59, 130, 246, 0.15)"},{icon:"fa-battery-full",q:"Explain BIS AIS-156 battery safety standards.",color:"rgba(168, 85, 247, 0.15)"},{icon:"fa-percent",q:"What are the GST rates on EVs vs ICE vehicles?",color:"rgba(245, 158, 11, 0.15)"},{icon:"fa-charging-station",q:"How to get approval for setting up a public EV charging station?",color:"rgba(20, 184, 166, 0.15)"},{icon:"fa-landmark",q:"What is Section 80EEB income-tax benefit on EV loans?",color:"rgba(236, 72, 153, 0.15)"}],ha="evbharat_chat_history";function is(t){try{localStorage.setItem(ha,JSON.stringify(t.map(e=>({...e,timestamp:e.timestamp.toISOString()}))))}catch{}}function Il(){try{const t=localStorage.getItem(ha);return t?JSON.parse(t).map(e=>({...e,timestamp:new Date(e.timestamp)})):[]}catch{return[]}}function Ll(){localStorage.removeItem(ha)}const rs=()=>Math.random().toString(36).slice(2,10),He=t=>t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),os=t=>t.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});function Ml(t){let e=He(t);return e=e.replace(/```(\w*)\n?([\s\S]*?)```/g,(a,s,n)=>`<div style="position:relative;margin:8px 0"><pre style="background:rgba(0,0,0,.45);border:1px solid rgba(75,85,99,.3);border-radius:8px;padding:12px 14px;overflow-x:auto;font-size:12px;line-height:1.6"><code>${s?`<span style="position:absolute;top:4px;right:8px;font-size:9px;color:#6b7280;text-transform:uppercase">${s}</span>`:""}${n.trim()}</code></pre></div>`),e=e.replace(/`([^`]+)`/g,'<code style="background:rgba(55,65,81,.6);color:rgba(212,175,55,.85);padding:1px 6px;border-radius:4px;font-size:12px">$1</code>'),e=e.replace(/\*\*(.+?)\*\*/g,'<strong style="color:#e5e7eb;font-weight:600">$1</strong>'),e=e.replace(/\*(.+?)\*/g,"<em>$1</em>"),e=e.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener" style="color:#D4AF37;text-decoration:underline">$1</a>'),e=e.replace(/^####\s+(.+)$/gm,'<h5 style="font-weight:600;color:rgba(212,175,55,.8);margin-top:8px;font-size:11px;text-transform:uppercase;letter-spacing:.5px">$1</h5>'),e=e.replace(/^###\s+(.+)$/gm,'<h4 style="font-weight:600;color:#D4AF37;margin-top:10px;font-size:14px">$1</h4>'),e=e.replace(/^##\s+(.+)$/gm,'<h3 style="font-weight:700;color:#D4AF37;margin-top:12px;font-size:16px">$1</h3>'),e=e.replace(/^#\s+(.+)$/gm,'<h2 style="font-weight:700;color:#D4AF37;margin-top:12px;font-size:18px">$1</h2>'),e=e.replace(/^[\-\*]\s+(.+)$/gm,'<li style="margin-left:16px;list-style:disc;color:#d1d5db">$1</li>'),e=e.replace(/^\d+\.\s+(.+)$/gm,'<li style="margin-left:16px;list-style:decimal;color:#d1d5db">$1</li>'),e=e.replace(/^---$/gm,'<hr style="border-color:rgba(75,85,99,.3);margin:12px 0">'),e=e.replace(/\n/g,"<br>"),e}async function Bl(){if(!D.isAuthenticated()){window.location.href="/auth";return}const t=document.getElementById("app");if(!t)return;const e=Il();let a="free",s=null,n=!1,i=!1,r=null,o=!1,l=!1,p=!1,d=!1,c=null,u=null,m=[],b=null,E="",k="en",C=!1,I=1,A=0,w=null;async function h(){try{const g=await ue.healthCheck();return o=g.status==="healthy",T(o,g.active_sessions),o}catch{return o=!1,T(!1,0),!1}}function T(g,f){document.querySelectorAll(".ev-health-dot").forEach(S=>{S.style.background=g?"linear-gradient(135deg, #10b981, #34d399)":"linear-gradient(135deg, #ef4444, #f87171)",S.style.boxShadow=g?"0 0 12px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)":"0 0 12px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",S.style.animation=g?"evPulse 2s infinite":"none"}),document.querySelectorAll(".ev-health-text").forEach(S=>{S.textContent=g?"🟢 Online":"🔴 Offline",S.style.color=g?"#10b981":"#ef4444",S.style.fontWeight="600"});const x=document.getElementById("ev-sessions");x&&(x.textContent=g?`⚡ ${f} active session${f!==1?"s":""}`:"⚠️ Backend unreachable")}function P(){const g=document.getElementById("ev-messages");if(g){if(!e.length){g.innerHTML=L(),R();return}g.innerHTML=e.map(f=>{if(f.role==="system")return`<div style="display:flex;justify-content:center;margin:12px 0"><span style="font-size:11px;color:#6b7280;background:rgba(31,41,55,.6);padding:3px 12px;border-radius:999px"><i class="fa-solid fa-info-circle" style="margin-right:4px;color:#3b82f6"></i>${He(f.content)}</span></div>`;const x=f.role==="user",S=x?"👤":"🤖";return`
            <div style="display:flex;justify-content:${x?"flex-end":"flex-start"};margin-bottom:16px" class="ev-msg-row">
                ${x?"":`<div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,rgba(212,175,55,.25),rgba(212,175,55,.08));display:flex;align-items:center;justify-content:center;margin-right:10px;margin-top:2px;flex-shrink:0;border:1px solid rgba(212,175,55,.15)"><span style="font-size:12px">${S}</span></div>`}
                <div style="max-width:78%;padding:12px 16px;border-radius:16px;${x?"border-bottom-right-radius:6px;background:linear-gradient(135deg,rgba(212,175,55,.1),rgba(212,175,55,.04));border:1px solid rgba(212,175,55,.18)":"border-bottom-left-radius:6px;background:rgba(31,41,55,.45);border:1px solid rgba(55,65,81,.4)"};box-shadow:0 2px 8px rgba(0,0,0,.15)">
                    <div style="font-size:13px;line-height:1.65;color:${x?"#e5e7eb":"#d1d5db"}">${x?He(f.content):Ml(f.content)}</div>
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px;padding-top:6px;border-top:1px solid rgba(55,65,81,.2);gap:8px">
                        <span style="font-size:10px;color:#4b5563">🕐 ${os(f.timestamp)}</span>
                        <div style="display:flex;align-items:center;gap:6px">
                            ${f.processingTime!=null?`<span style="font-size:10px;color:#6b7280"><i class="fa-solid fa-stopwatch" style="margin-right:2px;color:#8b5cf6"></i>${f.processingTime.toFixed(2)}s</span>`:""}
                            ${x?"":`<button data-copy="${f.id}" class="ev-copy" style="opacity:0;font-size:10px;color:#6b7280;cursor:pointer;background:none;border:none;transition:all .15s" title="📋 Copy"><i class="fa-regular fa-copy"></i></button>`}
                        </div>
                    </div>
                </div>
                ${x?`<div style="width:28px;height:28px;border-radius:8px;background:rgba(212,175,55,.12);display:flex;align-items:center;justify-content:center;margin-left:10px;margin-top:2px;flex-shrink:0;border:1px solid rgba(212,175,55,.12)"><span style="font-size:12px">${S}</span></div>`:""}
            </div>`}).join(""),document.querySelectorAll(".ev-copy").forEach(f=>{f.addEventListener("click",()=>{const x=e.find(S=>S.id===f.dataset.copy);x&&navigator.clipboard.writeText(x.content).then(()=>{f.innerHTML='<i class="fa-solid fa-check" style="color:#34d399"></i>',setTimeout(()=>{f.innerHTML='<i class="fa-regular fa-copy"></i>'},1500)})})}),O()}}function L(){return`
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:40px 20px;text-align:center">
            <div style="width:80px;height:80px;border-radius:20px;background:linear-gradient(135deg, #D4AF37, rgba(212,175,55,.6));border:2px solid rgba(212,175,55,.25);display:flex;align-items:center;justify-content:center;margin-bottom:32px;box-shadow:0 8px 32px rgba(212,175,55,.15), inset 0 2px 0 rgba(255,255,255,.1);position:relative;overflow:hidden" class="ev-logo-animate">
                <i class="fa-solid fa-bolt" style="color:#000;font-size:32px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))"></i>
                <div style="position:absolute;inset:0;background:linear-gradient(45deg, transparent 30%, rgba(255,255,255,.1) 50%, transparent 70%);animation:evShimmer 3s infinite"></div>
            </div>
            <h3 style="font-family:'Orbitron',sans-serif;font-size:24px;font-weight:800;margin-bottom:12px;letter-spacing:.5px;background:linear-gradient(135deg, #D4AF37, #FFD700);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 2px 8px rgba(212,175,55,.3)">⚡ EV Compliance Advisor</h3>
            <p style="font-size:15px;color:#c1c7cd;max-width:480px;margin-bottom:8px;line-height:1.5;font-weight:400">🔍 Ask any question about Indian EV regulations, subsidies, licensing, or upload a document for in-depth analysis.</p>
            <p style="font-size:12px;color:#64748b;max-width:420px;margin-bottom:40px;line-height:1.4">🚀 Powered by Google Gemini │ 📊 Knowledge covers FAME II, PM E-DRIVE, PLI, state policies & more</p>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;width:100%;max-width:640px">
                ${ns.map((g,f)=>`
                <button data-chip="${f}" class="ev-chip" style="display:flex;align-items:flex-start;gap:12px;text-align:left;font-size:13px;padding:16px 18px;border-radius:16px;border:1px solid rgba(55,65,81,.3);background:linear-gradient(135deg, rgba(31,41,55,.4), rgba(17,24,39,.6));color:#d1d5db;cursor:pointer;transition:all .3s cubic-bezier(0.4, 0, 0.2, 1);line-height:1.5;position:relative;overflow:hidden;backdrop-filter:blur(8px);box-shadow:0 2px 8px rgba(0,0,0,.1)">
                    <div style="width:32px;height:32px;border-radius:8px;background:${g.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.1)">
                        <i class="fa-solid ${g.icon}" style="color:#D4AF37;font-size:14px"></i>
                    </div>
                    <span style="font-weight:500">${He(g.q)}</span>
                    <div style="position:absolute;inset:0;background:linear-gradient(135deg, transparent, rgba(212,175,55,.05));opacity:0;transition:opacity .3s"></div>
                </button>`).join("")}
            </div>
        </div>`}function R(){document.querySelectorAll(".ev-chip").forEach(g=>{g.addEventListener("click",()=>{g.style.transform="scale(0.98)",setTimeout(()=>{g.style.transform=""},150),ne(ns[+(g.dataset.chip||"0")].q)}),g.addEventListener("mouseenter",()=>{g.style.borderColor="rgba(212,175,55,.4)",g.style.background="linear-gradient(135deg, rgba(212,175,55,.08), rgba(31,41,55,.6))",g.style.color="#f1f5f9",g.style.transform="translateY(-2px)",g.style.boxShadow="0 8px 25px rgba(212,175,55,.15), 0 2px 8px rgba(0,0,0,.1)";const f=g.querySelector("div:last-child");f&&(f.style.opacity="1")}),g.addEventListener("mouseleave",()=>{g.style.borderColor="rgba(55,65,81,.3)",g.style.background="linear-gradient(135deg, rgba(31,41,55,.4), rgba(17,24,39,.6))",g.style.color="#d1d5db",g.style.transform="",g.style.boxShadow="0 2px 8px rgba(0,0,0,.1)";const f=g.querySelector("div:last-child");f&&(f.style.opacity="0")})})}function O(){const g=document.getElementById("ev-messages");g&&requestAnimationFrame(()=>{g.scrollTop=g.scrollHeight})}function $(g,f="info"){const x=document.getElementById("ev-voice-status");if(!x)return;const S=f==="error"?"#f87171":f==="success"?"#34d399":"#9ca3af";x.textContent=g,x.style.color=S}function F(g){const f=document.getElementById("ev-voice-hint");f&&(f.textContent=g)}function pe(g){const f=String(Math.floor(g/60)).padStart(2,"0"),x=String(g%60).padStart(2,"0");return`${f}:${x}`}function Z(g){const f=document.getElementById("ev-mic"),x=document.getElementById("ev-mic-icon"),S=document.getElementById("ev-mic-text"),M=document.getElementById("ev-mic-dot");f&&(f.classList.toggle("ev-mic-recording",g),f.style.background=g?"linear-gradient(135deg, rgba(239,68,68,.95), rgba(249,115,22,.85))":"linear-gradient(135deg, rgba(31,41,55,.9), rgba(17,24,39,.7))",f.style.borderColor=g?"rgba(248,113,113,.65)":"rgba(75,85,99,.35)",f.style.color=g?"#ffffff":"#e5e7eb",f.title=g?"Stop voice recording":"Start voice input",x&&(x.className=g?"fa-solid fa-stop":"fa-solid fa-microphone-lines"),S&&(S.textContent=g?"Stop Voice":"Start Voice"),M&&(M.style.background=g?"#ffffff":"#34d399",M.style.opacity=g?"1":".75"))}function Ie(g){const f=document.getElementById("ev-tts-toggle"),x=document.getElementById("ev-tts-toggle-text");f&&(f.style.background=g?"linear-gradient(135deg, rgba(16,185,129,.25), rgba(52,211,153,.12))":"linear-gradient(135deg, rgba(31,41,55,.7), rgba(17,24,39,.5))",f.style.borderColor=g?"rgba(52,211,153,.45)":"rgba(75,85,99,.3)",f.style.color=g?"#34d399":"#9ca3af",f.title=g?"Disable auto voice replies":"Enable auto voice replies",x&&(x.textContent=g?"Auto Voice: On":"Auto Voice: Off"))}function q(){const g=document.getElementById("ev-tts-play"),f=document.getElementById("ev-tts-pause"),x=document.getElementById("ev-tts-stop"),S=document.getElementById("ev-tts-pause-text");if(g){const te=!!E||!!b;g.disabled=!te,g.style.opacity=te?"1":".45",g.style.cursor=te?"pointer":"not-allowed"}const M=!!b;f&&(f.disabled=!M,f.style.opacity=M?"1":".45",f.style.cursor=M?"pointer":"not-allowed",S&&(S.textContent=b?.paused?"Resume":"Pause")),x&&(x.disabled=!M,x.style.opacity=M?"1":".45",x.style.cursor=M?"pointer":"not-allowed")}function W(){u&&(u.getTracks().forEach(g=>g.stop()),u=null)}function y(){w!==null&&(window.clearInterval(w),w=null)}function V(g){return g.replace(/```[\s\S]*?```/g," ").replace(/`[^`]*`/g," ").replace(/[>#*_~\[\]()]/g," ").replace(/\s+/g," ").trim()}async function K(g,f){if(!p){p=!0,$("Transcribing audio...","info"),F("Listening to your recorded input");try{const x=g.type.includes("ogg")?"ogg":g.type.includes("mp4")||g.type.includes("m4a")?"m4a":g.type.includes("wav")?"wav":"webm",S=new File([g],`voice-input.${x}`,{type:g.type||"audio/webm"}),M=await ue.speechToText(S),te=M.text?.trim();if(!te){$("No speech detected. Please try again.","error"),F("Try speaking closer to the microphone");return}f.value=f.value.trim()?`${f.value.trim()} ${te}`:te,f.focus(),$(`Voice recognized (${M.language.toUpperCase()})`,"success"),F("You can edit the transcribed text before sending")}catch(x){const S=x.message||"Voice transcription failed";$(`Voice input failed: ${S}`,"error"),F("Check microphone permission and try again")}finally{p=!1,y(),Z(!1)}}}async function ee(g){if(!l){if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder>"u"){$("This browser does not support microphone recording.","error"),F("Use latest Chrome/Edge for voice input");return}try{u=await navigator.mediaDevices.getUserMedia({audio:!0});const x=["audio/webm;codecs=opus","audio/webm","audio/ogg;codecs=opus","audio/mp4"].find(S=>MediaRecorder.isTypeSupported(S));c=x?new MediaRecorder(u,{mimeType:x}):new MediaRecorder(u),m=[],c.ondataavailable=S=>{S.data.size>0&&m.push(S.data)},c.onstop=async()=>{const S=new Blob(m,{type:c?.mimeType||"audio/webm"});W(),await K(S,g)},c.start(),l=!0,A=Date.now(),y(),w=window.setInterval(()=>{const S=Math.floor((Date.now()-A)/1e3);$(`Recording ${pe(S)}...`,"info")},250),Z(!0),F("Tap Stop Voice when you finish speaking")}catch(f){W(),y(),l=!1,Z(!1);const x=f.message||"Microphone access denied";$(`Unable to start recording: ${x}`,"error"),F("Allow microphone permission in browser settings")}}}function ve(){!c||!l||(l=!1,y(),$("Processing recording...","info"),F("Converting speech into text"),c.stop())}function ye(g=!0){if(!b){q();return}const f=b;b=null,f.onended=null,f.onerror=null,f.onpause=null,f.onplay=null,f.pause(),f.currentTime=0,f.src.startsWith("blob:")&&URL.revokeObjectURL(f.src),g&&($(d?"Auto voice ON":"Voice ready","success"),F("Use Speak Last to hear the latest assistant reply")),q()}async function et(){if(b)try{b.paused?(await b.play(),$("Voice resumed","success"),F("Voice reply is now playing")):(b.pause(),$("Voice paused","info"),F("Tap Resume to continue playback"))}catch{$("Unable to change playback state.","error")}finally{q()}}async function we(){if(!E){$("No assistant reply yet to read aloud.","error"),F("Send a message first, then tap Speak Last");return}await ke(E)}async function ke(g){const f=V(g).slice(0,3800);if(f)try{$("Generating speech...","info"),F(`Voice: ${k.toUpperCase()} | ${C?"Slow":"Normal"} speed`),ye(!1);const x=await ue.textToSpeech(f,k,C),S=URL.createObjectURL(x),M=new Audio(S);b=M,M.volume=I,M.onplay=()=>{$("Speaking assistant reply...","success"),F("Use Pause or Stop to control playback"),q()},M.onpause=()=>{b===M&&!M.ended&&($("Voice paused","info"),F("Tap Resume to continue"),q())},M.onended=()=>{M.src.startsWith("blob:")&&URL.revokeObjectURL(M.src),b===M&&(b=null),$(d?"Auto voice ON":"Voice ready","success"),F("Voice playback finished"),q()},M.onerror=()=>{M.src.startsWith("blob:")&&URL.revokeObjectURL(M.src),b===M&&(b=null),$("Audio playback failed.","error"),F("Try again or switch language/speed"),q()},await M.play()}catch(x){const S=x.message||"Text to speech failed";$(`TTS failed: ${S}`,"error"),F("Check backend speech service and try again"),q()}}function Le(){const g=document.getElementById("ev-messages");if(!g)return;const f=a==="document"?"🔍 Searching document & analysing…":"🧠 Thinking…";g.insertAdjacentHTML("beforeend",`
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
        </div>`),O()}function ge(){document.getElementById("ev-thinking")?.remove()}async function ne(g){if(n||!g.trim())return;if(!o&&!await h()){ie("assistant","❌ Backend server is offline. Please check if the server is running on port 8001 and try again.");return}const f=document.getElementById("ev-input");f&&(f.value=""),n=!0,wa(!1),ie("user",g,!1),P(),Le();try{const x=a==="document"&&s?await ue.docChat(g,s):await ue.freeChat(g);ge(),e.push({id:rs(),role:"assistant",content:x.response,timestamp:new Date,processingTime:x.processing_time}),E=x.response,d&&await ke(x.response)}catch(x){ge();const S=x.message;if(a==="document"&&/session not found/i.test(S)){Ea(),ie("assistant","Your document session expired (usually after backend restart). Please upload the file again and continue.");return}const M=S.includes("Failed to fetch")||S.includes("aborted");ie("assistant",M?"Unable to reach the backend. Check that the API is running on port 8001.":`Error: ${S}`,!1),M&&(o=!1,T(!1,0))}finally{n=!1,wa(!0),P(),is(e)}}function ie(g,f,x=!0){e.push({id:rs(),role:g,content:f,timestamp:new Date}),x&&(P(),is(e))}function wa(g){const f=document.getElementById("ev-send");f&&(f.disabled=!g,f.style.opacity=g?"1":".35")}async function ka(g){if(i)return;const f=g.name.toLowerCase(),x=f.endsWith(".pdf"),S=f.match(/\.(jpg|jpeg|png|webp|gif|bmp)$/i);if(!(x||S)){Me("Only PDF or image files (JPG, PNG, WebP, GIF, BMP) accepted.","error");return}if(g.size>50*1024*1024){Me("File too large (max 50 MB).","error");return}i=!0,Me(`Uploading ${g.name}…`,"info"),tt(40);try{const M=await ue.uploadPDF(g);s=M.session_id,r=g.name,a="document",tt(100);const te=x?"PDF":"Image";Me(`${g.name} — ${M.document_count} chunks`,"success"),vt();try{const wt=await ue.sessionStatus(M.session_id);wt.exists&&wt.document_count&&En(wt)}catch{}ie("system",`${te} loaded: ${g.name}. Switched to document mode.`,!1),ie("assistant",`I've processed **${g.name}** (${te}) and extracted **${M.document_count}** content chunks.

You can now ask questions about this ${x?"document":"image"}. I'll cross-reference with Indian EV regulations.

**File hash:** \`${M.file_hash.slice(0,12)}…\``)}catch(M){tt(0),Me(`Upload failed: ${M.message}`,"error")}finally{i=!1}}function tt(g){const f=document.getElementById("ev-upload-bar");f&&(f.style.width=`${g}%`,f.style.opacity=g>0?"1":"0")}function Me(g,f){const x=document.getElementById("ev-upload-status");if(!x)return;const M={error:{color:"#f87171",icon:"fa-circle-xmark",symbol:"❌"},success:{color:"#34d399",icon:"fa-circle-check",symbol:"✅"},info:{color:"#D4AF37",icon:"fa-spinner fa-spin",symbol:"⏳"}}[f];x.innerHTML=`<div style="display:flex;align-items:center;gap:6px;color:${M.color}"><span style="font-size:12px">${M.symbol}</span><i class="fa-solid ${M.icon}" style="font-size:10px"></i><span style="font-size:11px">${g}</span></div>`}function En(g){const f=document.getElementById("ev-doc-stats");!f||!g.exists||(f.innerHTML=`<div style="font-size:10px;color:#6b7280;margin-top:6px;padding-top:6px;border-top:1px solid rgba(55,65,81,.25)">🧩 <i class="fa-solid fa-puzzle-piece" style="color:rgba(212,175,55,.35);margin-right:4px"></i>${g.document_count} chunks${g.processed_at?` │ ⏰ Processed ${new Date(g.processed_at*1e3).toLocaleTimeString("en-IN")}`:""}</div>`)}function vt(){const g=document.getElementById("ev-mode");g&&(a==="document"&&r?(g.innerHTML=`<div style="display:flex;align-items:center;gap:6px;background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.18);border-radius:8px;padding:4px 10px">
                📄 <i class="fa-solid fa-file-pdf" style="color:#34d399;font-size:10px"></i>
                <span style="font-size:11px;color:#6ee7b7;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${He(r)}</span>
                <button id="ev-rm-doc" style="color:#6b7280;cursor:pointer;background:none;border:none;transition:color .15s" title="🗑️ Remove"><i class="fa-solid fa-xmark" style="font-size:10px"></i></button>
            </div>`,document.getElementById("ev-rm-doc")?.addEventListener("click",Ea)):g.innerHTML=`<div style="display:flex;align-items:center;gap:6px;background:rgba(212,175,55,.04);border:1px solid rgba(212,175,55,.12);border-radius:8px;padding:4px 10px">
                💬 <i class="fa-solid fa-comments" style="color:#D4AF37;font-size:10px"></i>
                <span style="font-size:11px;color:#9ca3af">Free advisory mode</span>
            </div>`)}function Ea(){s&&ue.deleteSession(s).catch(()=>{}),s=null,r=null,a="free",vt(),Me("","info"),tt(0);const g=document.getElementById("ev-doc-stats");g&&(g.innerHTML=""),ie("system","Document removed. Switched back to free advisory mode.")}function Sn(){if(!e.length)return;const g=e.filter(S=>S.role!=="system").map(S=>`[${os(S.timestamp)}] ${S.role==="user"?"You":"EV Advisor"}:
${S.content}
`),f=`EVBharat EV Compliance Advisor — Chat Export
${"=".repeat(50)}
Exported: ${new Date().toLocaleString("en-IN")}
Messages: ${g.length}
${"=".repeat(50)}

${g.join(`
`)}`,x=document.createElement("a");x.href=URL.createObjectURL(new Blob([f],{type:"text/plain"})),x.download=`ev-chat-${Date.now()}.txt`,x.click(),URL.revokeObjectURL(x.href)}function Tn(){e.length=0,Ll(),P()}t.innerHTML=`
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
    </div>`;const _=document.getElementById("ev-upload-area"),at=document.getElementById("ev-file-input"),st=document.getElementById("ev-input"),Cn=document.getElementById("ev-mic"),An=document.getElementById("ev-tts-toggle"),In=document.getElementById("ev-tts-play"),Ln=document.getElementById("ev-tts-pause"),Mn=document.getElementById("ev-tts-stop"),nt=document.getElementById("ev-tts-lang"),Sa=document.getElementById("ev-tts-speed"),Ta=document.getElementById("ev-tts-volume"),Ca=document.getElementById("ev-tts-volume-label"),Bn=document.getElementById("ev-send");_.addEventListener("click",()=>at.click()),_.addEventListener("dragover",g=>{g.preventDefault(),_.style.borderColor="rgba(212,175,55,.5)",_.style.background="linear-gradient(135deg, rgba(212,175,55,.08), rgba(255,215,0,.04))",_.style.transform="scale(1.02)";const f=_.querySelector("i");f&&(f.style.color="#D4AF37",f.style.transform="scale(1.1)")}),_.addEventListener("dragleave",g=>{g.preventDefault(),_.style.borderColor="rgba(212,175,55,.25)",_.style.background="linear-gradient(135deg, rgba(212,175,55,.03), rgba(17,24,39,.3))",_.style.transform="";const f=_.querySelector("i");f&&(f.style.color="#64748b",f.style.transform="")}),_.addEventListener("drop",g=>{g.preventDefault(),_.style.borderColor="rgba(212,175,55,.25)",_.style.background="linear-gradient(135deg, rgba(212,175,55,.03), rgba(17,24,39,.3))",_.style.transform="";const f=_.querySelector("i");f&&(f.style.color="#64748b",f.style.transform=""),g.dataTransfer?.files[0]&&ka(g.dataTransfer.files[0])}),at.addEventListener("change",()=>{at.files?.[0]&&ka(at.files[0])}),Bn.addEventListener("click",()=>ne(st.value.trim())),st.addEventListener("keydown",g=>{g.key==="Enter"&&!g.shiftKey&&(g.preventDefault(),ne(st.value.trim()))}),Cn.addEventListener("click",async()=>{if(!p){if(l){ve();return}await ee(st)}}),An.addEventListener("click",()=>{d=!d,Ie(d),$(d?"Auto voice ON":"Auto voice OFF","success"),F(d?"Assistant replies will be spoken automatically":"Auto voice disabled; use Speak Last anytime"),!d&&b&&ye(!1),q()}),In.addEventListener("click",()=>{we()}),Ln.addEventListener("click",()=>{et()}),Mn.addEventListener("click",()=>{ye()}),nt.addEventListener("change",()=>{k=nt.value,$(`Voice language set to ${nt.options[nt.selectedIndex].text}`,"success")}),Sa.addEventListener("change",()=>{C=Sa.value==="slow",$(`Voice speed: ${C?"Slow":"Normal"}`,"success")}),Ta.addEventListener("input",()=>{I=Number(Ta.value)/100,Ca&&(Ca.textContent=`${Math.round(I*100)}%`),b&&(b.volume=I)});const Aa=document.getElementById("ev-sidebar"),yt=document.getElementById("ev-overlay"),Pn=()=>{Aa.classList.add("open"),yt.style.display="block"},Ia=()=>{Aa.classList.remove("open"),yt.style.display="none"};document.getElementById("ev-sb-toggle")?.addEventListener("click",Pn),document.getElementById("ev-sb-close")?.addEventListener("click",Ia),yt.addEventListener("click",Ia),document.getElementById("ev-export")?.addEventListener("click",Sn),document.getElementById("ev-clear")?.addEventListener("click",Tn),document.getElementById("ev-test-connection")?.addEventListener("click",async()=>{ie("system","🔍 Testing backend connection...");const g=await h();ie("system",g?"✅ Connection successful!":"❌ Connection failed – check console (F12)")}),["ev-export","ev-clear","ev-test-connection"].forEach(g=>{const f=document.getElementById(g);if(f){const x=g==="ev-clear"?"#ef4444":g==="ev-test-connection"?"#3b82f6":"#D4AF37",S=g==="ev-clear"?"239,68,68":g==="ev-test-connection"?"59,130,246":"212,175,55";f.addEventListener("mouseenter",()=>{f.style.color=x,f.style.background=`linear-gradient(135deg, rgba(${S},.1), rgba(${S},.05))`,f.style.borderColor=`rgba(${S},.4)`,f.style.transform="translateY(-1px)",f.style.boxShadow=`0 4px 12px rgba(${S},.15)`}),f.addEventListener("mouseleave",()=>{f.style.color="#9ca3af",f.style.background="linear-gradient(135deg, rgba(31,41,55,.6), rgba(17,24,39,.4))",f.style.borderColor="rgba(75,85,99,.25)",f.style.transform="",f.style.boxShadow="none"})}}),vt(),Z(!1),Ie(!1),q(),$("Voice ready","info"),F("Tap Start Voice or use playback controls for replies"),P(),h();const $n=setInterval(h,3e4),La=new MutationObserver(()=>{document.getElementById("ev-messages")||(clearInterval($n),l&&ve(),y(),W(),ye(!1),La.disconnect())});La.observe(t,{childList:!0})}const Ce="pk.eyJ1Ijoic3Rhc2gxMiIsImEiOiJjbW1qY3FwbnowNnRyMnJzYWhvNnZuN3dwIn0.UdkyD-K7763L-JaB7j79Kg";let B=null,Wt=null,Kt=null,qe=[],Ae=null,xe=null,ht=[],It=0;const ft=[76.5,27.5],xn=7;async function Pl(){if(!D.isAuthenticated()){window.location.href="/auth";return}const t=document.getElementById("app");if(t){if(!document.querySelector('link[href*="font-awesome"]')){const e=document.createElement("link");e.rel="stylesheet",e.href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",document.head.appendChild(e)}t.innerHTML=`
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
    `,setTimeout(async()=>{Vl(),await $l()},100)}}async function $l(){try{if(!Ce||!Ce.startsWith("pk."))throw new Error("Invalid Mapbox public token. Set VITE_MAPBOX_API_KEY to a valid public key (pk...).");if(!document.querySelector('link[href*="mapbox-gl.css"]')){const a=document.createElement("link");a.rel="stylesheet",a.href="https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.css",document.head.appendChild(a)}if(window.mapboxgl||await new Promise((a,s)=>{const n=document.createElement("script");n.src="https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.js",n.async=!0,n.onload=()=>a(),n.onerror=()=>s(new Error("Failed to load Mapbox GL script.")),document.head.appendChild(n)}),!window.mapboxgl)throw new Error("Mapbox GL is unavailable.");window.mapboxgl.accessToken=Ce;const t=document.getElementById("google-map");if(!t)throw new Error("Map container not found.");B&&(B.remove(),B=null,Wt=null,Kt=null,qe=[]);const e=document.getElementById("map-loading");e&&e.remove(),t.style.position="absolute",t.style.inset="0",t.style.width="100%",t.style.height="100%",B=new window.mapboxgl.Map({container:t,style:"mapbox://styles/mapbox/dark-v11",center:ft,zoom:xn,attributionControl:!0}),B.addControl(new window.mapboxgl.NavigationControl,"top-right"),B.addControl(new window.mapboxgl.FullscreenControl,"top-right"),B.on("error",a=>{const s=a?.error?.message??"Unknown Mapbox error";console.error("[EVBharat Maps] Mapbox error:",s)}),B.on("load",()=>{requestAnimationFrame(()=>B?.resize()),setTimeout(()=>B?.resize(),300),setTimeout(()=>B?.resize(),1200),vn(),xt({origin:ft,silent:!0})}),setTimeout(()=>B?.resize(),500),setTimeout(()=>B?.resize(),2e3)}catch(t){const e=t instanceof Error?t.message:String(t);console.error("[EVBharat Maps]",e),Rl(e)}}let oe=[];function Rl(t){const e=document.getElementById("map-loading");if(e){const a=t.toLowerCase().includes("token")||t.toLowerCase().includes("api key")||t.toLowerCase().includes("script failed"),s=t.toLowerCase().includes("endpoint")||t.toLowerCase().includes("port 3001");let n="";s?n=`
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
            </div>`}}function Vl(){const t=document.getElementById("route-options");if(t){const c=[{id:"1",name:"Energy Efficient",distance:268,duration:"4h 15m",energyConsumption:42,chargingStops:1,traffic:"low",recommended:!0},{id:"2",name:"Fastest Route",distance:255,duration:"3h 45m",energyConsumption:48,chargingStops:1,traffic:"high",recommended:!1},{id:"3",name:"Scenic Route",distance:295,duration:"5h 00m",energyConsumption:52,chargingStops:2,traffic:"low",recommended:!1}];t.innerHTML=c.map(u=>`
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
        `).join("")}se(oe),document.getElementById("calculate-route-btn")?.addEventListener("click",()=>{Gt()});const a=document.getElementById("start-location"),s=document.getElementById("end-location");if(a&&s){const c=async()=>ls(a.value,"origin"),u=async()=>ls(s.value,"destination");a.addEventListener("change",c),s.addEventListener("change",u),a.addEventListener("blur",c),s.addEventListener("blur",u);const m=b=>{b.key==="Enter"&&Gt()};a.addEventListener("keydown",m),s.addEventListener("keydown",m)}sd(),document.getElementById("swap-route-btn")?.addEventListener("click",()=>{const c=document.getElementById("start-location"),u=document.getElementById("end-location");if(!c||!u)return;const m=c.value;c.value=u.value,u.value=m,H("Origin and destination swapped","success")}),document.getElementById("map-locate-btn")?.addEventListener("click",()=>{ql()}),document.getElementById("map-fit-route-btn")?.addEventListener("click",()=>{Wl()}),document.getElementById("map-reset-view-btn")?.addEventListener("click",()=>{Gl()});const l=document.getElementById("connector-filter"),p=document.getElementById("available-only");l?.addEventListener("change",()=>se(ce())),p?.addEventListener("change",()=>se(ce()));const d=document.querySelectorAll(".route-option");d.forEach(c=>{c.addEventListener("click",()=>{d.forEach(u=>{u.classList.remove("border-pagani-gold","ring-2","ring-pagani-gold/30"),u.classList.add("border-pagani-gold/20")}),c.classList.remove("border-pagani-gold/20"),c.classList.add("border-pagani-gold","ring-2","ring-pagani-gold/30")})})}function H(t,e){const a=document.createElement("div");a.className=`fixed top-24 right-8 px-6 py-4 rounded-lg backdrop-blur-sm z-50 font-orbitron text-sm fade-in-section ${e==="success"?"bg-green-500/20 border border-green-500/50 text-green-400":"bg-red-500/20 border border-red-500/50 text-red-400"}`,a.innerHTML=`<i class="fa-solid ${e==="success"?"fa-check-circle":"fa-exclamation-circle"} mr-2"></i>${t}`,document.body.appendChild(a),setTimeout(()=>a.remove(),3e3)}function Fl(t){const e=t.toLowerCase(),a=[];return e.includes("ccs")&&a.push("CCS2"),e.includes("chademo")&&a.push("CHAdeMO"),/\btype\s*2\b/.test(e)&&a.push("Type 2"),a.length===0&&a.push("CCS2"),a}function jl(t,e){return e>=6&&e<=38&&t>=68&&t<=98}function Dl(t){return[t.AddressLine1,t.AddressLine2,t.Town,t.StateOrProvince,t.Postcode].filter(a=>!!(a&&a.trim())).join(", ")||t.Title||"Address unavailable"}async function Ol(t,e,a=8){const[s,n]=t,i=new URLSearchParams({access_token:Ce,types:"poi,address",proximity:`${s},${n}`,limit:String(a),autocomplete:"true"});jl(s,n)&&i.set("country","IN");const r=`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(e)}.json?${i.toString()}`;try{const o=await fetch(r);if(!o.ok)return[];const l=await o.json();return Array.isArray(l.features)?l.features:[]}catch{return[]}}async function Nl(t,e=10){const[a,s]=t,i=`https://api.openchargemap.io/v3/poi/?${new URLSearchParams({output:"json",latitude:String(s),longitude:String(a),distance:"80",distanceunit:"KM",maxresults:String(e),compact:"true",verbose:"false"}).toString()}`;try{const r=await fetch(i);if(!r.ok)return[];const o=await r.json();return Array.isArray(o)?o.map((l,p)=>{const d=l.AddressInfo,c=d?.Latitude,u=d?.Longitude;if(typeof c!="number"||typeof u!="number")return null;const m=(l.Connections??[]).map(I=>I.ConnectionType?.Title?.trim()).filter(I=>!!(I&&I.length>0)),b=Math.max(...(l.Connections??[]).map(I=>Number(I.PowerKW)).filter(I=>Number.isFinite(I))),E=Math.max(1,Number(l.NumberOfPoints)||(l.Connections?.length??0)||1),k=(d?.Title||`Charging Station ${p+1}`).trim();return{id:l.ID?`ocm-${l.ID}`:`ocm-fallback-${s.toFixed(4)}-${a.toFixed(4)}-${p}`,name:k,address:d?Dl(d):"Address unavailable",lat:c,lng:u,distance:Math.max(1,Math.round(mt(s,a,c,u))),connectors:m.length>0?m:["CCS2"],available:E,total:E,power:Number.isFinite(b)?`${Math.round(b)} kW`:"Unknown",price:l.UsageCost?.trim()||"--",rating:4,amenities:["Public Access"]}}).filter(l=>l!==null):[]}catch{return[]}}function zl(t){const e=[];t.origin&&e.push(t.origin),t.destination&&e.push(t.destination);const a=t.routeGeometry?.coordinates;return a&&a.length>0&&e.push(a[Math.floor(a.length/2)]),e.length===0&&e.push(ft),e}async function xt(t={}){const e=++It,a=document.getElementById("charging-count");a&&(a.textContent="Finding nearby stations...");const s=zl(t),n=!!Ce.startsWith("pk."),i=["ev charging station","electric vehicle charging station","charging station","fast charger"],r=n?await Promise.all(s.flatMap((d,c)=>i.map(u=>Ol(d,u,Math.max(6,12-c*2))))):[];if(e!==It)return;const o=t.origin??s[0],l=new Map;let p=0;if(r.flat().forEach(d=>{if(!d.center||d.center.length<2)return;const c=Number(d.center[0]),u=Number(d.center[1]);if(!Number.isFinite(u)||!Number.isFinite(c))return;const m=(d.text||d.place_name||"Charging Station").trim(),b=(d.place_name||m).trim(),E=`${m.toLowerCase()}|${u.toFixed(4)}|${c.toFixed(4)}`,k=Math.max(1,Math.round(mt(o[1],o[0],u,c))),C={id:d.id||`dynamic-${p++}`,name:m,address:b,lat:u,lng:c,distance:k,connectors:Fl(`${m} ${b}`),available:1,total:1,power:"Unknown",price:"--",rating:4,amenities:["Public Access"]},I=l.get(E);(!I||C.distance<I.distance)&&l.set(E,C)}),l.size<6){const d=await Promise.all(s.slice(0,3).map((c,u)=>Nl(c,Math.max(8,14-u*2))));if(e!==It)return;d.flat().forEach(c=>{const u=`${c.name.toLowerCase()}|${c.lat.toFixed(4)}|${c.lng.toFixed(4)}`,m={...c,distance:Math.max(1,Math.round(mt(o[1],o[0],c.lat,c.lng)))},b=l.get(u);(!b||m.distance<b.distance)&&l.set(u,m)})}oe=Array.from(l.values()).sort((d,c)=>d.distance-c.distance).slice(0,15),Ae&&!oe.some(d=>d.id===Ae)&&(Ae=null),vn(),se(ce()),!t.silent&&oe.length===0&&H("No nearby charging stations found for this route area","error")}function vn(){!B||!window.mapboxgl||(qe.forEach(({marker:t})=>t.remove()),qe=[],oe.forEach(t=>{const e=document.createElement("div");e.style.width="12px",e.style.height="12px",e.style.borderRadius="9999px",e.style.background="#22d3ee",e.style.border="2px solid #0a0a0a",e.style.boxShadow="0 0 0 2px rgba(34,211,238,0.2)";const a=new window.mapboxgl.Popup({offset:14}).setHTML(`
            <div style="color:#0f172a;font-family:sans-serif;min-width:200px">
                <strong>${t.name}</strong><br>
                <span style="font-size:12px">${t.address}</span><br>
                <span style="font-size:11px;color:#334155">${t.available}/${t.total} available | ${t.power}</span>
            </div>
        `),s=new window.mapboxgl.Marker(e).setLngLat([t.lng,t.lat]).setPopup(a).addTo(B);s.getElement().addEventListener("click",()=>{Ae=t.id,se(ce())}),qe.push({stationId:t.id,marker:s})}))}function mt(t,e,a,s){const n=l=>l*(Math.PI/180),i=n(a-t),r=n(s-e),o=Math.sin(i/2)**2+Math.cos(n(t))*Math.cos(n(a))*Math.sin(r/2)**2;return 6371*(2*Math.atan2(Math.sqrt(o),Math.sqrt(1-o)))}function Hl(t,e){const a=e.coordinates,s=Math.max(1,Math.floor(a.length/120));let n=Number.POSITIVE_INFINITY;for(let i=0;i<a.length;i+=s){const[r,o]=a[i],l=mt(t.lat,t.lng,o,r);l<n&&(n=l)}return Number.isFinite(n)?n:t.distance}function _l(){return xe?oe.map(t=>({...t,routeDeviationKm:Hl(t,xe.geometry)})).sort((t,e)=>(t.routeDeviationKm??Number.MAX_SAFE_INTEGER)-(e.routeDeviationKm??Number.MAX_SAFE_INTEGER)):oe}function ce(){const t=document.getElementById("connector-filter"),e=document.getElementById("available-only"),a=t?.value??"all",s=!!e?.checked;return _l().filter(n=>{const i=a==="all"||n.connectors.includes(a),r=!s||n.available>0;return i&&r})}function se(t){const e=document.getElementById("charging-stations"),a=document.getElementById("charging-count");if(e){if(a&&(a.textContent=`${t.length} station${t.length===1?"":"s"} found`),t.length===0){const s=oe.length===0?"No nearby charging stations found yet. Set source and destination or use Locate Me to search again.":"No stations match your filters. Try changing connector type or availability filter.";e.innerHTML=`
            <div class="p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-300">
                ${s}
            </div>
        `;return}e.innerHTML=t.map((s,n)=>{const i=Ae===s.id,o=typeof s.routeDeviationKm=="number"?`~${s.routeDeviationKm.toFixed(1)} km from route`:`${s.distance} km away`;return`
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
        `}).join(""),Ul()}}function Ul(){const t=e=>oe.find(a=>a.id===e);document.querySelectorAll(".focus-station-btn").forEach(e=>{e.onclick=()=>{const a=t(e.dataset.stationId??"");if(!a)return;Ae=a.id,B&&B.flyTo({center:[a.lng,a.lat],zoom:12,duration:900}),qe.find(n=>n.stationId===a.id)?.marker.togglePopup(),se(ce()),H(`Focused on ${a.name}`,"success")}}),document.querySelectorAll(".set-stop-btn").forEach(e=>{e.onclick=()=>{const a=t(e.dataset.stationId??"");if(!a)return;const s=document.getElementById("end-location"),n=document.getElementById("start-location");s&&(Ae=a.id,s.value=`${a.name}, ${a.address}`,Re("destination",[a.lng,a.lat],"#ef4444"),B&&B.flyTo({center:[a.lng,a.lat],zoom:12,duration:900}),H(`${a.name} selected as destination`,"success"),se(ce()),n?.value.trim()&&Gt())}}),document.querySelectorAll(".navigate-station-btn").forEach(e=>{e.onclick=()=>{const a=t(e.dataset.stationId??"");if(!a)return;const s=`https://www.google.com/maps/dir/?api=1&destination=${a.lat},${a.lng}`;window.open(s,"_blank","noopener,noreferrer")}})}function yn(t){if(!B||!window.mapboxgl||t.coordinates.length===0)return;const e=t.coordinates.reduce((a,s)=>a.extend(s),new window.mapboxgl.LngLatBounds(t.coordinates[0],t.coordinates[0]));B.fitBounds(e,{padding:50,duration:900})}function ql(){if(!("geolocation"in navigator)){H("Geolocation is not supported by your browser","error");return}navigator.geolocation.getCurrentPosition(t=>{const e=[t.coords.longitude,t.coords.latitude];Re("origin",e,"#22c55e"),B&&B.flyTo({center:e,zoom:12,duration:900});const a=document.getElementById("start-location");a&&!a.value.trim()&&(a.value=`${e[1].toFixed(5)}, ${e[0].toFixed(5)}`),xt({origin:e,silent:!0}),H("Map centered to your current location","success")},()=>H("Unable to access your location","error"))}function Wl(){if(!xe){H("No active route to fit yet","error");return}yn(xe.geometry)}function Kl(){if(!B)return;const t="route-line";B.getLayer(t)&&B.removeLayer(t),B.getSource(t)&&B.removeSource(t)}function Gl(){xe=null,ht=[],Kl(),B&&B.flyTo({center:ft,zoom:xn,duration:900});const t=document.getElementById("route-steps-panel"),e=document.getElementById("route-steps");t&&t.classList.add("hidden"),e&&(e.innerHTML=""),Xt(),se(ce()),H("Map reset to default view","success")}function Gt(){const t=document.getElementById("calculate-route-btn"),e=document.getElementById("start-location"),a=document.getElementById("end-location");if(!t||!e||!a)return;const s=e.value.trim(),n=a.value.trim();if(!s||!n){H("Please enter both origin and destination","error");return}t.innerHTML='<i class="fa-solid fa-spinner animate-spin mr-2"></i> Calculating...',B&&window.mapboxgl?Promise.all([Yt(s),Yt(n)]).then(async([i,r])=>{if(!i||!r){t.innerHTML='<i class="fa-solid fa-exclamation-triangle mr-2"></i> Invalid Locations',H("Could not find one or both locations. Please check spelling.","error"),Xt(),setTimeout(()=>{t.innerHTML='<i class="fa-solid fa-magnifying-glass-location mr-2"></i> Calculate Route'},3e3);return}const o=await Xl(i.center,r.center);if(o.length===0){t.innerHTML='<i class="fa-solid fa-exclamation-triangle mr-2"></i> Route Failed',H("No route found between these locations","error"),Xt(),setTimeout(()=>{t.innerHTML='<i class="fa-solid fa-magnifying-glass-location mr-2"></i> Calculate Route'},3e3);return}ht=o;const l=ad(o);Re("origin",i.center,"#22c55e"),Re("destination",r.center,"#ef4444"),kn(l),ld(o,l),await xt({origin:i.center,destination:r.center,routeGeometry:xe?.geometry??null,silent:!0}),t.innerHTML='<i class="fa-solid fa-check mr-2"></i> Route Calculated!',H(`Route from ${i.name} to ${r.name} calculated`,"success"),od(i.center[1],i.center[0],r.center[1],r.center[0],i.name,r.name),setTimeout(()=>{t.innerHTML='<i class="fa-solid fa-magnifying-glass-location mr-2"></i> Calculate Route'},3e3)}).catch(()=>{t.innerHTML='<i class="fa-solid fa-exclamation-triangle mr-2"></i> Route Failed',H("Route calculation failed. Please retry.","error"),setTimeout(()=>{t.innerHTML='<i class="fa-solid fa-magnifying-glass-location mr-2"></i> Calculate Route'},3e3)}):(H("Mapbox map not loaded yet. Please wait and try again.","error"),setTimeout(()=>{t.innerHTML='<i class="fa-solid fa-magnifying-glass-location mr-2"></i> Calculate Route'},2e3))}async function ls(t,e){const a=t.trim();if(!a||!B||!window.mapboxgl)return;const s=await Yt(a);s&&(Re(e,s.center,e==="origin"?"#22c55e":"#ef4444"),B.flyTo({center:s.center,zoom:10,duration:900}))}async function Yt(t){try{const e=Yl(t);if(e)return{center:[e.lng,e.lat],name:`${e.lat.toFixed(5)}, ${e.lng.toFixed(5)}`};const a=`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(t)}.json?access_token=${Ce}&country=IN&limit=1`,s=await fetch(a);if(!s.ok)return null;const i=(await s.json())?.features?.[0];return i?.center?{center:i.center,name:i.place_name||t}:null}catch{return null}}function Yl(t){const e=t.split(",").map(n=>n.trim());if(e.length!==2)return null;const a=Number(e[0]),s=Number(e[1]);return!Number.isFinite(a)||!Number.isFinite(s)||a<-90||a>90||s<-180||s>180?null:{lat:a,lng:s}}async function Xl(t,e){try{const s=`https://api.mapbox.com/directions/v5/mapbox/driving/${`${t[0]},${t[1]};${e[0]},${e[1]}`}?alternatives=true&geometries=geojson&overview=full&steps=true&access_token=${Ce}`,n=await fetch(s);if(!n.ok)return[];const r=(await n.json())?.routes;return Array.isArray(r)?r:[]}catch{return[]}}function Re(t,e,a){if(!B||!window.mapboxgl)return;const s=t==="origin"?Wt:Kt;if(s){s.setLngLat(e);return}const n=new window.mapboxgl.Marker({color:a}).setLngLat(e).addTo(B);t==="origin"?Wt=n:Kt=n}function Jl(t){if(!B||!window.mapboxgl)return;const e="route-line";B.getLayer(e)&&B.removeLayer(e),B.getSource(e)&&B.removeSource(e),B.addSource(e,{type:"geojson",data:{type:"Feature",geometry:t,properties:{}}}),B.addLayer({id:e,type:"line",source:e,paint:{"line-color":"#22d3ee","line-width":5,"line-opacity":.9}}),yn(t)}function Zl(t){return t.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function xa(t){const e=t.distance/1e3,a=t.duration/3600,s=a>0?e/a:0;return s<38?"high":s<55?"medium":"low"}function va(t,e){return Math.round(t*(e==="high"?.22:e==="medium"?.2:.18))}function wn(t){return t>392?Math.ceil((t-392)/300):0}function Ql(t,e,a,s){const n=document.querySelector('[data-trip="km"]'),i=document.querySelector('[data-trip="dur"]'),r=document.querySelector('[data-trip="energy"]'),o=document.querySelector('[data-trip="stops"]');n&&(n.textContent=String(t)),i&&(i.textContent=e),r&&(r.textContent=`${a} kWh`),o&&(o.textContent=String(s))}function ed(t){const e=document.getElementById("route-steps-panel"),a=document.getElementById("route-steps");if(!e||!a)return;const s=t.legs?.[0]?.steps??[];if(s.length===0){e.classList.add("hidden"),a.innerHTML="";return}e.classList.remove("hidden"),a.innerHTML=s.slice(0,14).map((n,i)=>{const r=Math.max(1,Math.round(n.distance)),o=r>=1e3?`${(r/1e3).toFixed(1)} km`:`${r} m`,l=Zl(n.maneuver?.instruction||n.name||"Continue straight");return`
            <div class="p-3 rounded-lg border border-pagani-gold/15 bg-pagani-black/40">
                <div class="flex items-start gap-3">
                    <span class="w-6 h-6 shrink-0 rounded-full bg-pagani-gold/25 text-pagani-gold text-xs font-bold flex items-center justify-center">${i+1}</span>
                    <div>
                        <p class="text-sm text-gray-100">${l}</p>
                        <p class="text-xs text-gray-400 mt-1">${o} • ${ya(Math.max(1,Math.round(n.duration/60)))}</p>
                    </div>
                </div>
            </div>
        `}).join("")}function td(t){const e=document.getElementById("route-options");e&&e.querySelectorAll(".route-option").forEach(a=>{const s=Number(a.dataset.routeIndex)===t;a.classList.remove("border-pagani-gold","ring-2","ring-pagani-gold/30","border-pagani-gold/20"),s?a.classList.add("border-pagani-gold","ring-2","ring-pagani-gold/30"):a.classList.add("border-pagani-gold/20")})}function ad(t){if(t.length===0)return 0;let e=0,a=Number.POSITIVE_INFINITY;return t.forEach((s,n)=>{const i=s.distance/1e3,r=s.duration/60,o=xa(s),l=va(i,o),p=r*.55+l*.45;p<a&&(a=p,e=n)}),e}function kn(t){const e=ht[t];if(!e)return;xe=e,Jl(e.geometry);const a=Math.round(e.distance/1e3),s=ya(Math.max(1,Math.round(e.duration/60))),n=xa(e),i=va(a,n),r=wn(a);Ql(a,s,i,r),ed(e),se(ce()),td(t)}function Xt(){xe=null,ht=[];const t=document.querySelector('[data-trip="km"]'),e=document.querySelector('[data-trip="dur"]'),a=document.querySelector('[data-trip="energy"]'),s=document.querySelector('[data-trip="stops"]');t&&(t.textContent="--"),e&&(e.textContent="--"),a&&(a.textContent="-- kWh"),s&&(s.textContent="--");const n=document.getElementById("weather-panel");n&&n.classList.add("hidden");const i=document.getElementById("weather-ev-impact");i&&i.classList.add("hidden");const r=document.getElementById("route-steps-panel"),o=document.getElementById("route-steps");r&&r.classList.add("hidden"),o&&(o.innerHTML="");const l=document.querySelector(".bg-green-500\\/10 p, .bg-yellow-500\\/10 p, .bg-blue-500\\/10 p");l&&(l.innerHTML=`
            <i class="fa-solid fa-info-circle mr-1"></i>
            Enter route details to calculate optimal charging strategy.
        `,l.parentElement.className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg",l.className="text-xs text-blue-400"),se(ce())}function sd(){const t=document.getElementById("start-location");if(t&&!document.getElementById("current-location-btn")){const e=t.parentElement;if(e){const a=document.createElement("button");a.id="current-location-btn",a.type="button",a.className="absolute right-3 top-1/2 -translate-y-1/2 text-pagani-gold hover:text-bright-gold transition-colors",a.innerHTML='<i class="fa-solid fa-location-crosshairs text-sm"></i>',a.title="Use current location",a.addEventListener("click",()=>{"geolocation"in navigator?(a.innerHTML='<i class="fa-solid fa-spinner animate-spin text-sm"></i>',navigator.geolocation.getCurrentPosition(s=>{const n=s.coords.latitude,i=s.coords.longitude;a.innerHTML='<i class="fa-solid fa-location-crosshairs text-sm"></i>',t.value=`${n.toFixed(5)}, ${i.toFixed(5)}`,Re("origin",[i,n],"#22c55e"),B&&B.flyTo({center:[i,n],zoom:12}),xt({origin:[i,n],silent:!0}),H("Current location detected","success")},s=>{a.innerHTML='<i class="fa-solid fa-location-crosshairs text-sm"></i>',H("Location access denied or unavailable","error")})):H("Geolocation not supported by this browser","error")}),e.appendChild(a)}}}async function ds(t,e){try{const s=await fetch(`/api/weather?lat=${t}&lng=${e}`);if(s.ok){const n=await s.json();if(n.success&&n.weather)return n.weather}}catch{}try{const s=`https://api.open-meteo.com/v1/forecast?latitude=${t}&longitude=${e}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,visibility&wind_speed_unit=kmh`,n=await fetch(s);if(!n.ok)throw new Error(`Open-Meteo returned ${n.status}`);const r=(await n.json()).current;if(!r)return null;const o=nd(r.weather_code??0);return{main:{temp:r.temperature_2m??25,feels_like:r.apparent_temperature??r.temperature_2m??25,humidity:r.relative_humidity_2m??50},weather:[{description:o.description,icon:o.icon,main:o.main}],wind:{speed:(r.wind_speed_10m??0)/3.6},visibility:r.visibility??1e4,name:""}}catch(s){return console.error("[EVBharat] Weather fetch error:",s),null}}function nd(t){return t===0?{description:"Clear sky",icon:"01d",main:"Clear"}:t<=3?{description:"Partly cloudy",icon:"02d",main:"Clouds"}:t<=49?{description:"Foggy",icon:"50d",main:"Fog"}:t<=59?{description:"Drizzle",icon:"09d",main:"Drizzle"}:t<=69?{description:"Rain",icon:"10d",main:"Rain"}:t<=79?{description:"Snow",icon:"13d",main:"Snow"}:t<=82?{description:"Rain showers",icon:"09d",main:"Rain"}:t<=86?{description:"Snow showers",icon:"13d",main:"Snow"}:t<=99?{description:"Thunderstorm",icon:"11d",main:"Thunderstorm"}:{description:"Unknown",icon:"01d",main:"Clear"}}function id(t){const e=t.main.temp,a=t.weather[0]?.main?.toLowerCase()??"",s=Math.round(t.wind.speed*3.6);return a.includes("rain")||a.includes("drizzle")||a.includes("thunderstorm")?{text:"Rainy conditions — reduced traction. Drive cautiously, regenerative braking may be less effective on wet roads.",icon:"fa-cloud-showers-heavy",color:"text-blue-400"}:a.includes("snow")||a.includes("sleet")?{text:"Snow/ice possible — battery range reduced by ~20-30%. Pre-condition cabin before departure.",icon:"fa-snowflake",color:"text-cyan-300"}:a.includes("fog")||a.includes("mist")||a.includes("haze")?{text:"Low visibility — use fog lights. Maintain safe following distance.",icon:"fa-smog",color:"text-gray-300"}:e>40?{text:"Extreme heat — A/C load will reduce range by ~15%. Battery cooling active.",icon:"fa-temperature-arrow-up",color:"text-red-400"}:e>35?{text:"High temperature — expect slightly reduced range due to cabin cooling.",icon:"fa-sun",color:"text-orange-400"}:e<5?{text:"Cold weather — battery range reduced ~15-25%. Pre-heat cabin while plugged in.",icon:"fa-temperature-arrow-down",color:"text-blue-300"}:s>40?{text:`Strong winds (${s} km/h) — increased energy consumption, especially on highways.`,icon:"fa-wind",color:"text-cyan-400"}:{text:"Good driving conditions — optimal battery performance expected.",icon:"fa-check-circle",color:"text-green-400"}}function rd(t,e){const a=[],s=((t?.main.temp??25)+(e?.main.temp??25))/2,n=Math.max(Math.round((t?.wind.speed??0)*3.6),Math.round((e?.wind.speed??0)*3.6));let i=0;s<5?i=-20:s<15?i=-10:s>40?i=-15:s>35&&(i=-8),n>30&&(i-=5);const r=[t,e].some(o=>o?.weather[0]?.main?.toLowerCase().includes("rain")||o?.weather[0]?.main?.toLowerCase().includes("thunderstorm"));return r&&(i-=5),i!==0?a.push(`<div class="flex items-center gap-2 p-2 bg-gray-800/50 rounded text-xs">
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
        </div>`),a}function cs(t,e,a){const s=(o,l)=>{const p=document.getElementById(o);p&&(p.textContent=l)};s(`weather-${t}-name`,a),s(`weather-${t}-temp`,`${Math.round(e.main.temp)}°C`),s(`weather-${t}-desc`,e.weather[0]?.description??""),s(`weather-${t}-feels`,String(Math.round(e.main.feels_like))),s(`weather-${t}-wind`,String(Math.round(e.wind.speed*3.6))),s(`weather-${t}-humidity`,String(e.main.humidity)),s(`weather-${t}-visibility`,String(Math.round((e.visibility??1e4)/1e3)));const n=document.getElementById(`weather-${t}-icon`);n&&e.weather[0]?.icon&&(n.src=`https://openweathermap.org/img/wn/${e.weather[0].icon}@2x.png`,n.alt=e.weather[0].description,n.classList.remove("hidden"));const i=id(e),r=document.getElementById(`weather-${t}-advisory`);r&&(r.innerHTML=`<i class="fa-solid ${i.icon} mr-1 ${i.color}"></i> ${i.text}`)}async function od(t,e,a,s,n,i){const r=document.getElementById("weather-panel");r&&r.classList.remove("hidden");const[o,l]=await Promise.all([ds(t,e),ds(a,s)]);o&&cs("origin",o,n),l&&cs("dest",l,i);const p=document.getElementById("weather-ev-impact"),d=document.getElementById("weather-impact-items");if(p&&d&&(o||l)){const c=rd(o,l);d.innerHTML=c.join(""),p.classList.remove("hidden")}}function ld(t,e){const a=document.getElementById("route-options");if(!a)return;const s=["Balanced Route","Fastest Route","Energy Saver","Alternative Route"],n=t.slice(0,4).map((i,r)=>{const o=Math.round(i.distance/1e3),l=ya(Math.max(1,Math.round(i.duration/60))),p=xa(i);return{id:`${r+1}`,name:s[r]||`Route ${r+1}`,distance:o,duration:l,energyConsumption:va(o,p),chargingStops:wn(o),traffic:p,recommended:r===e}});a.innerHTML=n.map((i,r)=>`
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
    `).join(""),a.querySelectorAll(".route-option").forEach(i=>{i.addEventListener("click",()=>{const r=Number(i.dataset.routeIndex??"-1");!Number.isFinite(r)||r<0||kn(r)})})}function ya(t){const e=Math.floor(t/60),a=t%60;return e>0?`${e}h ${a.toString().padStart(2,"0")}m`:`${a}m`}async function dd(){if(!D.isAuthenticated()){window.location.href="/auth";return}const t=document.getElementById("app");if(t){if(!document.querySelector('link[href*="font-awesome"]')){const e=document.createElement("link");e.rel="stylesheet",e.href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",document.head.appendChild(e)}t.innerHTML=`
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
    `,setTimeout(()=>{cd()},100)}}function cd(){const t=[{id:"1",type:"critical",category:"battery",title:"Battery Cell Degradation Detected",message:"Cell #67 showing abnormal degradation (72% health). Recommend immediate inspection to prevent further battery pack damage.",timestamp:"10 minutes ago",read:!1,actionable:!0,action:"Schedule Service"},{id:"2",type:"warning",category:"battery",title:"High Battery Temperature",message:"Battery temperature reached 42°C during fast charging. Reduced charging speed to protect battery longevity.",timestamp:"25 minutes ago",read:!1,actionable:!1},{id:"3",type:"warning",category:"safety",title:"Lane Departure Warning",message:"Multiple lane departures detected in the last trip. Driver attention monitoring activated.",timestamp:"1 hour ago",read:!1,actionable:!1},{id:"4",type:"info",category:"v2e",title:"V2E Connection Established",message:"Successfully connected to nearby traffic infrastructure via VLC. Real-time traffic signal data now available.",timestamp:"1 hour ago",read:!0,actionable:!1},{id:"5",type:"warning",category:"safety",title:"Obstacle Detected Ahead",message:"Stationary vehicle detected 200m ahead on NH-48. Proceed with caution.",timestamp:"2 hours ago",read:!0,actionable:!1},{id:"6",type:"info",category:"v2e",title:"Emergency Vehicle Approaching",message:"V2E alert: Ambulance approaching from rear. Please make way.",timestamp:"3 hours ago",read:!0,actionable:!1},{id:"7",type:"success",category:"battery",title:"Charging Complete",message:"Battery fully charged to 100%. Total energy added: 58 kWh. Ready for 450 km range.",timestamp:"4 hours ago",read:!0,actionable:!1},{id:"8",type:"info",category:"maintenance",title:"Scheduled Maintenance Reminder",message:"Your vehicle is due for scheduled maintenance in 45 days. Book your service appointment.",timestamp:"1 day ago",read:!0,actionable:!0,action:"Book Now"},{id:"9",type:"info",category:"system",title:"Software Update Available",message:"EVBharat OS v3.2.1 is available. Includes improved battery management and new V2E features.",timestamp:"2 days ago",read:!0,actionable:!0,action:"Update Now"}];pd(t),gd(),ud(),md(t)}function pd(t){const e=document.getElementById("alerts-list");if(!e)return;const a=n=>{switch(n){case"critical":return{bg:"from-red-900/30 to-red-900/10",border:"border-red-500/50",icon:"fa-circle-exclamation",iconColor:"text-red-400"};case"warning":return{bg:"from-yellow-900/30 to-yellow-900/10",border:"border-yellow-500/50",icon:"fa-triangle-exclamation",iconColor:"text-yellow-400"};case"info":return{bg:"from-blue-900/30 to-blue-900/10",border:"border-blue-500/50",icon:"fa-circle-info",iconColor:"text-blue-400"};case"success":return{bg:"from-green-900/30 to-green-900/10",border:"border-green-500/50",icon:"fa-circle-check",iconColor:"text-green-400"}}},s=n=>{switch(n){case"battery":return"fa-car-battery";case"safety":return"fa-shield-halved";case"v2e":return"fa-tower-broadcast";case"emergency":return"fa-truck-medical";case"maintenance":return"fa-wrench";case"system":return"fa-gear"}};e.innerHTML=t.map((n,i)=>{const r=a(n.type),o=s(n.category);return`
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
        `}).join("")}function gd(){const t=document.querySelectorAll(".alert-filter");t.forEach(e=>{e.addEventListener("click",()=>{t.forEach(n=>{n.classList.remove("active","bg-pagani-gold","text-black"),n.classList.add("bg-pagani-black/50","text-white")}),e.classList.add("active","bg-pagani-gold","text-black"),e.classList.remove("bg-pagani-black/50","text-white");const a=e.getAttribute("data-filter");document.querySelectorAll(".alert-item").forEach(n=>{const i=n.getAttribute("data-category");a==="all"||i===a?n.style.display="block":n.style.display="none"})})})}function ud(){const t=document.getElementById("sos-btn");if(!t)return;let e=null,a=!1;t.addEventListener("mousedown",()=>{a=!0,t.innerHTML='<i class="fa-solid fa-spinner animate-spin mr-2"></i> HOLD 3 SECONDS...',e=setTimeout(()=>{a&&(t.innerHTML='<i class="fa-solid fa-check mr-2"></i> SOS ACTIVATED!',t.classList.remove("bg-red-600","hover:bg-red-500","animate-pulse"),t.classList.add("bg-green-600"),fd())},3e3)}),t.addEventListener("mouseup",()=>{a=!1,e&&(clearTimeout(e),t.innerHTML='<i class="fa-solid fa-circle-exclamation mr-2"></i> EMERGENCY SOS')}),t.addEventListener("mouseleave",()=>{a=!1,e&&(clearTimeout(e),t.innerHTML='<i class="fa-solid fa-circle-exclamation mr-2"></i> EMERGENCY SOS')})}function fd(){const t=document.createElement("div");t.className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4 fade-in-section",t.innerHTML=`
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
    `,document.body.appendChild(t),t.querySelector("#cancel-sos")?.addEventListener("click",()=>{t.remove();const a=document.getElementById("sos-btn");a&&(a.innerHTML='<i class="fa-solid fa-circle-exclamation mr-2"></i> EMERGENCY SOS',a.classList.remove("bg-green-600"),a.classList.add("bg-red-600","hover:bg-red-500","animate-pulse"))})}function md(t){document.getElementById("mark-all-read")?.addEventListener("click",()=>{t.forEach(a=>a.read=!0),document.querySelectorAll(".alert-item").forEach(a=>{a.classList.remove("ring-2","ring-white/10")}),document.querySelectorAll(".alert-item .w-2.h-2.bg-pagani-gold").forEach(a=>{a.remove()}),bd("All alerts marked as read")})}function bd(t,e){const a=document.createElement("div");a.className="fixed top-24 right-8 px-6 py-4 rounded-lg backdrop-blur-sm z-50 font-orbitron text-sm fade-in-section bg-green-500/20 border border-green-500/50 text-green-400",a.innerHTML=`<i class="fa-solid fa-check-circle mr-2"></i>${t}`,document.body.appendChild(a),setTimeout(()=>a.remove(),3e3)}function hd(){const t=D.getCurrentUser();if(!t){window.location.href="/auth";return}const e=document.getElementById("app");e.innerHTML=`
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
    `,xd()}function xd(){const t=document.querySelectorAll(".profile-tab"),e=document.querySelectorAll(".tab-content");t.forEach(n=>{n.addEventListener("click",()=>{const i=n.dataset.tab;t.forEach(o=>o.classList.remove("active")),e.forEach(o=>{o.classList.remove("active"),o.classList.add("hidden")}),n.classList.add("active");const r=document.getElementById(`${i}-tab`);r&&(r.classList.add("active"),r.classList.remove("hidden"))})});const a=new gt;a.addRule("firstName",{required:!0,minLength:2}),a.addRule("lastName",{required:!0,minLength:2}),a.addRule("email",{required:!0,email:!0}),a.addRule("phone",{phone:!0});const s=new gt;s.addRule("currentPassword",{required:!0,minLength:6}),s.addRule("newPassword",{required:!0,minLength:8}),s.addRule("confirmPassword",{required:!0}),yd(a,s),wd(),Ed(),vd()}async function vd(){const t=await D.fetchProfile();if(!t.success||!t.data)return;const{profile:e,preferences:a,vehicle:s}=t.data,n=(i,r)=>{const o=document.getElementById(i);o&&r&&(o.value=r)};if(e&&(n("phone",e.phone),n("dateOfBirth",e.date_of_birth),n("address",e.address),n("city",e.city),n("state",e.state)),a){const i=(r,o)=>{const l=document.getElementById(r);l&&(l.checked=o)};i("emailNotifications",a.emailNotifications),i("batteryAlerts",a.batteryAlerts),i("maintenanceAlerts",a.maintenanceAlerts),i("twoFactor",a.twoFactorEnabled),n("distanceUnit",a.distanceUnit),n("temperatureUnit",a.temperatureUnit),n("language",a.language)}s&&(n("vehicleMake",s.make),n("vehicleModel",s.model),n("vehicleYear",s.year?.toString()),n("batteryCapacity",s.batteryCapacity?.toString()),n("range",s.rangeKm?.toString()),n("vehicleNotes",s.notes),Array.isArray(s.chargingTypes)&&s.chargingTypes.forEach(i=>{const r=document.querySelector(`input[name="chargingType"][value="${i}"]`);r&&(r.checked=!0)}))}function yd(t,e){const a=document.getElementById("personal-form");a?.addEventListener("submit",async r=>{r.preventDefault();const o=new FormData(a),l=t.validate(o);if(!l.isValid){N(l.errors.join(", "),"error");return}N("Processing...","info");try{const p=await D.updateProfile({firstName:o.get("firstName"),lastName:o.get("lastName"),email:o.get("email"),phone:o.get("phone"),dateOfBirth:o.get("dateOfBirth"),address:o.get("address"),city:o.get("city"),state:o.get("state")});p.success?(N(p.message,"success"),setTimeout(()=>window.location.reload(),1500)):N(p.message,"error")}catch{N("Failed to update information. Please try again.","error")}});const s=document.getElementById("security-form");s?.addEventListener("submit",async r=>{r.preventDefault();const o=new FormData(s),l=e.validate(o);if(!l.isValid){N(l.errors.join(", "),"error");return}const p=o.get("currentPassword"),d=o.get("newPassword"),c=o.get("confirmPassword");if(d!==c){N("Passwords do not match","error");return}N("Updating security settings...","info");try{const u=await D.updatePassword(p,d);u.success?(N(u.message,"success"),s.reset()):N(u.message,"error")}catch{N("Failed to update security settings. Please try again.","error")}}),document.getElementById("preferences-form")?.addEventListener("submit",async r=>{r.preventDefault(),N("Saving preferences...","info");try{const o=await D.updatePreferences({emailNotifications:document.getElementById("emailNotifications")?.checked??!0,batteryAlerts:document.getElementById("batteryAlerts")?.checked??!0,maintenanceAlerts:document.getElementById("maintenanceAlerts")?.checked??!0,distanceUnit:document.getElementById("distanceUnit")?.value??"km",temperatureUnit:document.getElementById("temperatureUnit")?.value??"celsius",language:document.getElementById("language")?.value??"en",twoFactorEnabled:document.getElementById("twoFactor")?.checked??!1});o.success?N(o.message,"success"):N(o.message,"error")}catch{N("Failed to save preferences. Please try again.","error")}});const i=document.getElementById("vehicle-form");i?.addEventListener("submit",async r=>{r.preventDefault(),N("Saving vehicle information...","info");try{const o=i.querySelectorAll('input[name="chargingType"]:checked'),l=Array.from(o).map(d=>d.value),p=await D.updateVehicle({make:document.getElementById("vehicleMake")?.value??"",model:document.getElementById("vehicleModel")?.value??"",year:parseInt(document.getElementById("vehicleYear")?.value)||null,batteryCapacity:parseFloat(document.getElementById("batteryCapacity")?.value)||null,rangeKm:parseFloat(document.getElementById("range")?.value)||null,chargingTypes:l,notes:document.getElementById("vehicleNotes")?.value??""});p.success?N(p.message,"success"):N(p.message,"error")}catch{N("Failed to save vehicle information. Please try again.","error")}})}function wd(){const t=document.getElementById("newPassword"),e=document.getElementById("password-strength");t?.addEventListener("input",a=>{const s=a.target.value,n=kd(s);e&&(e.style.width=`${n.percentage}%`,e.className=`h-2 rounded-full transition-all duration-300 ${n.colorClass}`)})}function kd(t){let e=0;t.length>=8&&(e+=25),/[a-z]/.test(t)&&(e+=25),/[A-Z]/.test(t)&&(e+=25),/[0-9]/.test(t)&&(e+=25),/[^A-Za-z0-9]/.test(t)&&(e+=25);let a="bg-red-500";return e>=75?a="bg-green-500":e>=50?a="bg-yellow-500":e>=25&&(a="bg-orange-500"),{percentage:Math.min(100,e),colorClass:a}}function Ed(){document.getElementById("change-avatar-btn")?.addEventListener("click",()=>{N("Avatar upload feature coming soon!","info")})}function N(t,e){const a=document.getElementById("profile-message");if(!a)return;const s=e==="success"?"bg-green-500/20 border-green-500/30 text-green-400":e==="error"?"bg-red-500/20 border-red-500/30 text-red-400":"bg-blue-500/20 border-blue-500/30 text-blue-400";a.className=`mb-6 p-4 rounded-lg border ${s}`,a.textContent=t,a.classList.remove("hidden"),(e==="success"||e==="info")&&setTimeout(()=>{a.classList.add("hidden")},3e3)}window.togglePassword=function(t){const e=document.getElementById(t),a=e?.nextElementSibling?.querySelector("i");e&&a&&(e.type==="password"?(e.type="text",a.className="fa-solid fa-eye-slash"):(e.type="password",a.className="fa-solid fa-eye"))};async function Sd(){if(!D.isAuthenticated()){window.location.href="/auth";return}const t=document.getElementById("app");if(!t)return;const e=D.getCurrentUser();t.innerHTML=`
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
    `}async function Td(){const t=document.getElementById("app");t&&(t.innerHTML=`
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
    `)}const Cd=new Dn;document.addEventListener("DOMContentLoaded",async()=>{new Fn,new jn,U.register("/","EVBharat | AI-Powered EV Intelligence",Qo),U.register("/about","About Us | EVBharat",tl),U.register("/technology","Technology | EVBharat",sl),U.register("/contact","Contact Us | EVBharat",rl),U.register("/gallery","Gallery | EVBharat",ll),U.register("/auth","Login | EVBharat",dl),U.register("/dashboard","Dashboard | EVBharat",ml),U.register("/factory-dashboard","Dark Factory | EVBharat",Sd),U.register("/battery","Battery Management | EVBharat",vl),U.register("/battery-analytics","AI Battery Analytics | EVBharat",Sl),U.register("/rag-chat","AI Assistant | EVBharat",Bl),U.register("/map","Route Planner | EVBharat",Pl),U.register("/alerts","Alerts | EVBharat",dd),U.register("/profile","Profile | EVBharat",hd),U.register("/404","404 Not Found | EVBharat",Td),U.init(),setTimeout(()=>{Cd.hide()},1500)});
