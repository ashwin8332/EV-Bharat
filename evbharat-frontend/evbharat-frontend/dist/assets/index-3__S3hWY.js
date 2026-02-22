(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const r of n.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function a(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(i){if(i.ep)return;i.ep=!0;const n=a(i);fetch(i.href,n)}})();class Ls{routes=new Map;currentPath="";constructor(){window.addEventListener("popstate",()=>this.handleRoute()),document.addEventListener("click",e=>this.handleLinkClick(e))}register(e,a,s){this.routes.set(e,{path:e,title:a,render:s})}navigate(e,a=!0){if(this.currentPath===e)return;const s=this.routes.get(e);if(!s){this.navigate("/404",a);return}this.currentPath=e,a&&window.history.pushState({path:e},s.title,e),document.title=s.title,this.showPageTransition(async()=>{await s.render(),window.scrollTo({top:0,behavior:"instant"})})}handleRoute(){const e=window.location.pathname;this.navigate(e,!1)}handleLinkClick(e){const a=e.target.closest("a");if(!a)return;const s=a.getAttribute("href");!s||s.startsWith("http")||s.startsWith("#")||this.routes.has(s)&&(e.preventDefault(),this.navigate(s))}showPageTransition(e){const a=document.getElementById("app");if(!a)return e();a.style.opacity="0",a.style.transition="opacity 0.3s ease-out",setTimeout(async()=>{await e(),a.style.opacity="1"},300)}init(){this.handleRoute()}}const O=new Ls;class Bs{storageKey="evbharat_auth";userKey="evbharat_user";apiBase="";getAuthState(){const e=localStorage.getItem(this.storageKey),a=localStorage.getItem(this.userKey);if(e&&a)try{return{isAuthenticated:!0,user:JSON.parse(a),token:e}}catch{return{isAuthenticated:!1,user:null,token:null}}return{isAuthenticated:!1,user:null,token:null}}isAuthenticated(){return this.getAuthState().isAuthenticated}getCurrentUser(){return this.getAuthState().user}async login(e,a){return this.requestAuth("/api/auth/login",{email:e,password:a})}async signup(e,a,s){return this.requestAuth("/api/auth/signup",{name:e,email:a,password:s})}logout(){localStorage.removeItem(this.storageKey),localStorage.removeItem(this.userKey)}getDefaultCredentials(){return null}persistAuth(e,a){localStorage.setItem(this.storageKey,e),localStorage.setItem(this.userKey,JSON.stringify(a))}async requestAuth(e,a){try{const s=await fetch(`${this.apiBase}${e}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)}),i=await s.json().catch(()=>({}));return s.ok?(i?.token&&i?.user&&this.persistAuth(i.token,i.user),{success:!0,message:i?.message??"Success",user:i?.user}):{success:!1,message:i?.message??"Request failed. Please try again."}}catch{return{success:!1,message:"Network error. Please try again."}}}async authFetch(e,a="GET",s){const{token:i}=this.getAuthState();if(!i)return{ok:!1,data:{message:"Not authenticated."}};const n={method:a,headers:{"Content-Type":"application/json",Authorization:`Bearer ${i}`}};s&&(n.body=JSON.stringify(s));const r=await fetch(`${this.apiBase}${e}`,n),o=await r.json().catch(()=>({}));return{ok:r.ok,data:o}}async fetchProfile(){try{const{ok:e,data:a}=await this.authFetch("/api/profile");return e?{success:!0,data:a.data}:{success:!1,message:a?.message??"Failed to load profile."}}catch{return{success:!1,message:"Network error."}}}async updateProfile(e){if(!this.isAuthenticated())return{success:!1,message:"User not authenticated"};try{const{ok:a,data:s}=await this.authFetch("/api/profile/personal","PUT",e);if(!a)return{success:!1,message:s?.message??"Failed to update profile."};if(s?.user){const i=s.token??this.getAuthState().token;this.persistAuth(i,s.user)}return{success:!0,message:s?.message??"Profile updated successfully",user:s?.user}}catch{return{success:!1,message:"Network error. Please try again."}}}async updatePassword(e,a){if(!this.isAuthenticated())return{success:!1,message:"User not authenticated"};try{const{ok:s,data:i}=await this.authFetch("/api/profile/password","PUT",{currentPassword:e,newPassword:a});return s?{success:!0,message:i?.message??"Password updated successfully"}:{success:!1,message:i?.message??"Failed to update password."}}catch{return{success:!1,message:"Network error. Please try again."}}}async updatePreferences(e){if(!this.isAuthenticated())return{success:!1,message:"Not authenticated"};try{const{ok:a,data:s}=await this.authFetch("/api/profile/preferences","PUT",e);return a?{success:!0,message:s?.message??"Preferences saved."}:{success:!1,message:s?.message??"Failed to save preferences."}}catch{return{success:!1,message:"Network error."}}}async updateVehicle(e){if(!this.isAuthenticated())return{success:!1,message:"Not authenticated"};try{const{ok:a,data:s}=await this.authFetch("/api/profile/vehicle","PUT",e);return a?{success:!0,message:s?.message??"Vehicle info saved."}:{success:!1,message:s?.message??"Failed to save vehicle."}}catch{return{success:!1,message:"Network error."}}}}const D=new Bs;class Ps{navbar=null;mobileMenu=null;isMenuOpen=!1;constructor(){this.render(),this.attachEventListeners()}render(){const e=D.isAuthenticated(),a=D.getCurrentUser(),s=`
            <nav class="fixed top-0 left-0 w-full z-50 px-4 md:px-8 py-3 md:py-4 transition-all duration-300" id="navbar">
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
                                <a href="/dashboard" class="nav-link text-xs xl:text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-pagani-gold/10 border border-transparent hover:border-pagani-gold/30">
                                    <i class="fa-solid fa-gauge-high text-xs"></i>
                                    <span class="hidden xl:inline">Dashboard</span>
                                </a>
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
                                <h2 class="text-pagani-gold font-orbitron text-lg uppercase tracking-wider">EV Control Center</h2>
                                <div class="w-16 h-0.5 bg-pagani-gold mx-auto mt-2"></div>
                            </div>
                            <div class="grid grid-cols-2 gap-4 mb-6">
                                <a href="/dashboard" class="mobile-nav-card flex flex-col items-center justify-center gap-3 p-6 border border-pagani-gold/30 rounded-xl hover:bg-pagani-gold/10 hover:border-pagani-gold transition-all duration-300 min-h-[100px]">
                                    <i class="fa-solid fa-gauge-high text-3xl text-pagani-gold"></i>
                                    <span class="text-xs uppercase tracking-wider text-center">Dashboard</span>
                                </a>
                                <a href="/battery" class="mobile-nav-card flex flex-col items-center justify-center gap-3 p-6 border border-pagani-gold/30 rounded-xl hover:bg-pagani-gold/10 hover:border-pagani-gold transition-all duration-300 min-h-[100px]">
                                    <i class="fa-solid fa-car-battery text-3xl text-pagani-gold"></i>
                                    <span class="text-xs uppercase tracking-wider text-center">Battery</span>
                                </a>
                                <a href="/rag-chat" class="mobile-nav-card flex flex-col items-center justify-center gap-3 p-6 border border-pagani-gold/30 rounded-xl hover:bg-pagani-gold/10 hover:border-pagani-gold transition-all duration-300 min-h-[100px]">
                                    <i class="fa-solid fa-robot text-3xl text-pagani-gold"></i>
                                    <span class="text-xs uppercase tracking-wider text-center">AI Chat</span>
                                </a>
                                <a href="/map" class="mobile-nav-card flex flex-col items-center justify-center gap-3 p-6 border border-pagani-gold/30 rounded-xl hover:bg-pagani-gold/10 hover:border-pagani-gold transition-all duration-300 min-h-[100px]">
                                    <i class="fa-solid fa-route text-3xl text-pagani-gold"></i>
                                    <span class="text-xs uppercase tracking-wider text-center">Routes</span>
                                </a>
                            </div>
                            <a href="/alerts" class="mobile-nav-card w-full flex items-center justify-center gap-4 p-4 border border-pagani-gold/30 rounded-xl hover:bg-pagani-gold/10 hover:border-pagani-gold transition-all duration-300">
                                <i class="fa-solid fa-bell text-2xl text-pagani-gold"></i>
                                <span class="text-sm uppercase tracking-wider">Smart Alerts & Notifications</span>
                            </a>
                        </div>
                        `:""}
                        <div class="flex flex-col gap-4 w-full mt-8">
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
        `;document.body.insertAdjacentHTML("afterbegin",s),this.navbar=document.getElementById("navbar"),this.mobileMenu=document.getElementById("mobile-menu")}attachEventListeners(){const e=document.getElementById("logout-btn"),a=document.getElementById("logout-mobile-btn");e?.addEventListener("click",()=>this.handleLogout()),a?.addEventListener("click",()=>this.handleLogout()),document.getElementById("mobile-menu-btn")?.addEventListener("click",()=>this.toggleMobileMenu()),document.querySelectorAll(".mobile-nav-link, .mobile-nav-card").forEach(n=>{n.addEventListener("click",()=>this.closeMobileMenu())}),window.addEventListener("scroll",()=>this.handleScroll(),{passive:!0}),this.updateActiveLink(),window.addEventListener("popstate",()=>this.updateActiveLink())}handleLogout(){D.logout(),window.location.href="/"}toggleMobileMenu(){this.isMenuOpen=!this.isMenuOpen,this.isMenuOpen?(this.mobileMenu?.classList.remove("translate-x-full"),document.querySelector(".menu-icon")?.classList.add("hidden"),document.querySelector(".close-icon")?.classList.remove("hidden"),document.body.style.overflow="hidden"):this.closeMobileMenu()}closeMobileMenu(){this.isMenuOpen=!1,this.mobileMenu?.classList.add("translate-x-full"),document.querySelector(".menu-icon")?.classList.remove("hidden"),document.querySelector(".close-icon")?.classList.add("hidden"),document.body.style.overflow=""}handleScroll(){if(!this.navbar)return;window.scrollY>50?this.navbar.classList.add("bg-pagani-black/80","backdrop-blur-md","shadow-lg"):this.navbar.classList.remove("bg-pagani-black/80","backdrop-blur-md","shadow-lg")}updateActiveLink(){const e=window.location.pathname;document.querySelectorAll(".nav-link, .mobile-nav-link, .mobile-nav-card").forEach(s=>{s.getAttribute("href")===e?(s.classList.add("text-pagani-gold"),s.classList.contains("mobile-nav-card")&&s.classList.add("bg-pagani-gold/20","border-pagani-gold")):(s.classList.remove("text-pagani-gold"),s.classList.contains("mobile-nav-card")&&s.classList.remove("bg-pagani-gold/20","border-pagani-gold"))})}destroy(){this.navbar?.remove()}}class Rs{constructor(){this.render()}render(){document.body.insertAdjacentHTML("beforeend",`
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
        `),this.attachEventListeners()}attachEventListeners(){document.getElementById("newsletter-form")?.addEventListener("submit",s=>{s.preventDefault(),alert("Thank you for subscribing! 🎉"),s.target.reset()});const a=document.getElementById("back-to-top");window.addEventListener("scroll",()=>{window.scrollY>500?a?.classList.remove("opacity-0","pointer-events-none"):a?.classList.add("opacity-0","pointer-events-none")},{passive:!0}),a?.addEventListener("click",()=>{window.scrollTo({top:0,behavior:"smooth"})})}}class Vs{loader=null;constructor(){this.render()}render(){document.body.insertAdjacentHTML("afterbegin",`
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
        `),this.loader=document.getElementById("page-loader")}hide(){this.loader&&(this.loader.style.opacity="0",setTimeout(()=>{this.loader?.remove()},500))}show(){this.loader?this.loader.style.opacity="1":this.render()}}class $s{canvas;ctx;images=[];totalFrames=240;isLoaded=!1;currentFrameIndex=-1;constructor(e,a=240){if(this.canvas=document.getElementById(e),!this.canvas)throw new Error(`Canvas with id ${e} not found`);this.ctx=this.canvas.getContext("2d",{alpha:!1}),this.totalFrames=a,this.ctx&&(this.ctx.imageSmoothingEnabled=!0,this.ctx.imageSmoothingQuality="high"),this.resize(),window.addEventListener("resize",()=>this.resize()),this.preloadImages()}resize(){if(!this.canvas||!this.ctx)return;const e=window.devicePixelRatio||1,a=this.canvas.parentElement?.getBoundingClientRect();a&&(this.canvas.width=a.width*e,this.canvas.height=a.height*e,this.ctx.scale(e,e),this.ctx.imageSmoothingEnabled=!0,this.ctx.imageSmoothingQuality="high",this.currentFrameIndex>=0&&this.renderFrame(this.currentFrameIndex))}preloadImages(){let e=0;for(let a=1;a<=this.totalFrames;a++){const s=new Image;s.src=`/images/zonda-sequence/${a}.jpg`,s.onload=()=>{e++,e===this.totalFrames&&(this.isLoaded=!0,this.renderFrame(0))},this.images.push(s)}}update(e){if(!this.isLoaded)return;const a=Math.min(this.totalFrames-1,Math.max(0,Math.floor(e*this.totalFrames)));a!==this.currentFrameIndex&&(this.renderFrame(a),this.currentFrameIndex=a)}renderFrame(e){if(!this.ctx||!this.canvas)return;const a=this.images[e];if(!a)return;const s=window.devicePixelRatio||1;this.ctx.clearRect(0,0,this.canvas.width/s,this.canvas.height/s);const i=this.canvas.width/s,n=this.canvas.height/s,r=Math.min(i/a.width,n/a.height),o=i/2-a.width/2*r,l=n/2-a.height/2*r;this.ctx.drawImage(a,o,l,a.width*r,a.height*r)}}function Ds(t,e){t.indexOf(e)===-1&&t.push(e)}function wa(t,e){const a=t.indexOf(e);a>-1&&t.splice(a,1)}const ie=(t,e,a)=>a>e?e:a<t?t:a;let vt=()=>{};const J={},ka=t=>/^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(t);function Fs(t){return typeof t=="object"&&t!==null}const Ea=t=>/^0[^.\s]+$/u.test(t);function yt(t){let e;return()=>(e===void 0&&(e=t()),e)}const fe=t=>t,js=(t,e)=>a=>e(t(a)),wt=(...t)=>t.reduce(js),kt=(t,e,a)=>{const s=e-t;return s===0?1:(a-t)/s};class Ta{constructor(){this.subscriptions=[]}add(e){return Ds(this.subscriptions,e),()=>wa(this.subscriptions,e)}notify(e,a,s){const i=this.subscriptions.length;if(i)if(i===1)this.subscriptions[0](e,a,s);else for(let n=0;n<i;n++){const r=this.subscriptions[n];r&&r(e,a,s)}}getSize(){return this.subscriptions.length}clear(){this.subscriptions.length=0}}const X=t=>t*1e3,_=t=>t/1e3;function Sa(t,e){return e?t*(1e3/e):0}const Os=(t,e,a)=>{const s=e-t;return((a-t)%s+s)%s+t},Aa=(t,e,a)=>(((1-3*a+3*e)*t+(3*a-6*e))*t+3*e)*t,Ns=1e-7,Hs=12;function zs(t,e,a,s,i){let n,r,o=0;do r=e+(a-e)/2,n=Aa(r,s,i)-t,n>0?a=r:e=r;while(Math.abs(n)>Ns&&++o<Hs);return r}function Re(t,e,a,s){if(t===e&&a===s)return fe;const i=n=>zs(n,0,1,t,a);return n=>n===0||n===1?n:Aa(i(n),e,s)}const Ca=t=>e=>e<=.5?t(2*e)/2:(2-t(2*(1-e)))/2,Ia=t=>e=>1-t(1-e),Ma=Re(.33,1.53,.69,.99),Et=Ia(Ma),La=Ca(Et),Ba=t=>(t*=2)<1?.5*Et(t):.5*(2-Math.pow(2,-10*(t-1))),Tt=t=>1-Math.sin(Math.acos(t)),_s=Ia(Tt),Pa=Ca(Tt),qs=Re(.42,0,1,1),Us=Re(0,0,.58,1),Ra=Re(.42,0,.58,1),Va=t=>Array.isArray(t)&&typeof t[0]!="number";function $a(t,e){return Va(t)?t[Os(0,t.length,e)]:t}const Da=t=>Array.isArray(t)&&typeof t[0]=="number",Ws={linear:fe,easeIn:qs,easeInOut:Ra,easeOut:Us,circIn:Tt,circInOut:Pa,circOut:_s,backIn:Et,backInOut:La,backOut:Ma,anticipate:Ba},Gs=t=>typeof t=="string",_t=t=>{if(Da(t)){vt(t.length===4);const[e,a,s,i]=t;return Re(e,a,s,i)}else if(Gs(t))return Ws[t];return t},Fe=["setup","read","resolveKeyframes","preUpdate","update","preRender","render","postRender"];function Ks(t,e){let a=new Set,s=new Set,i=!1,n=!1;const r=new WeakSet;let o={delta:0,timestamp:0,isProcessing:!1};function l(d){r.has(d)&&(c.schedule(d),t()),d(o)}const c={schedule:(d,p=!1,u=!1)=>{const x=u&&i?a:s;return p&&r.add(d),x.has(d)||x.add(d),d},cancel:d=>{s.delete(d),r.delete(d)},process:d=>{if(o=d,i){n=!0;return}i=!0,[a,s]=[s,a],a.forEach(l),a.clear(),i=!1,n&&(n=!1,c.process(d))}};return c}const Ys=40;function Fa(t,e){let a=!1,s=!0;const i={delta:0,timestamp:0,isProcessing:!1},n=()=>a=!0,r=Fe.reduce((S,T)=>(S[T]=Ks(n),S),{}),{setup:o,read:l,resolveKeyframes:c,preUpdate:d,update:p,preRender:u,render:m,postRender:x}=r,y=()=>{const S=J.useManualTiming?i.timestamp:performance.now();a=!1,J.useManualTiming||(i.delta=s?1e3/60:Math.max(Math.min(S-i.timestamp,Ys),1)),i.timestamp=S,i.isProcessing=!0,o.process(i),l.process(i),c.process(i),d.process(i),p.process(i),u.process(i),m.process(i),x.process(i),i.isProcessing=!1,a&&e&&(s=!1,t(y))},v=()=>{a=!0,s=!0,i.isProcessing||t(y)};return{schedule:Fe.reduce((S,T)=>{const h=r[T];return S[T]=(C,B=!1,k=!1)=>(a||v(),h.schedule(C,B,k)),S},{}),cancel:S=>{for(let T=0;T<Fe.length;T++)r[Fe[T]].cancel(S)},state:i,steps:r}}const{schedule:Z,cancel:tt,state:He}=Fa(typeof requestAnimationFrame<"u"?requestAnimationFrame:fe,!0);let Ne;function Xs(){Ne=void 0}const H={now:()=>(Ne===void 0&&H.set(He.isProcessing||J.useManualTiming?He.timestamp:performance.now()),Ne),set:t=>{Ne=t,queueMicrotask(Xs)}},ja=t=>e=>typeof e=="string"&&e.startsWith(t),Oa=ja("--"),Js=ja("var(--"),St=t=>Js(t)?Zs.test(t.split("/*")[0].trim()):!1,Zs=/var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;function qt(t){return typeof t!="string"?!1:t.split("/*")[0].includes("var(--")}const me={test:t=>typeof t=="number",parse:parseFloat,transform:t=>t},Ie={...me,transform:t=>ie(0,1,t)},je={...me,default:1},Ae=t=>Math.round(t*1e5)/1e5,At=/-?(?:\d+(?:\.\d+)?|\.\d+)/gu;function Qs(t){return t==null}const ei=/^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu,Ct=(t,e)=>a=>!!(typeof a=="string"&&ei.test(a)&&a.startsWith(t)||e&&!Qs(a)&&Object.prototype.hasOwnProperty.call(a,e)),Na=(t,e,a)=>s=>{if(typeof s!="string")return s;const[i,n,r,o]=s.match(At);return{[t]:parseFloat(i),[e]:parseFloat(n),[a]:parseFloat(r),alpha:o!==void 0?parseFloat(o):1}},ti=t=>ie(0,255,t),Ke={...me,transform:t=>Math.round(ti(t))},oe={test:Ct("rgb","red"),parse:Na("red","green","blue"),transform:({red:t,green:e,blue:a,alpha:s=1})=>"rgba("+Ke.transform(t)+", "+Ke.transform(e)+", "+Ke.transform(a)+", "+Ae(Ie.transform(s))+")"};function ai(t){let e="",a="",s="",i="";return t.length>5?(e=t.substring(1,3),a=t.substring(3,5),s=t.substring(5,7),i=t.substring(7,9)):(e=t.substring(1,2),a=t.substring(2,3),s=t.substring(3,4),i=t.substring(4,5),e+=e,a+=a,s+=s,i+=i),{red:parseInt(e,16),green:parseInt(a,16),blue:parseInt(s,16),alpha:i?parseInt(i,16)/255:1}}const at={test:Ct("#"),parse:ai,transform:oe.transform},Ve=t=>({test:e=>typeof e=="string"&&e.endsWith(t)&&e.split(" ").length===1,parse:parseFloat,transform:e=>`${e}${t}`}),ae=Ve("deg"),ge=Ve("%"),b=Ve("px"),si=Ve("vh"),ii=Ve("vw"),Ut={...ge,parse:t=>ge.parse(t)/100,transform:t=>ge.transform(t*100)},pe={test:Ct("hsl","hue"),parse:Na("hue","saturation","lightness"),transform:({hue:t,saturation:e,lightness:a,alpha:s=1})=>"hsla("+Math.round(t)+", "+ge.transform(Ae(e))+", "+ge.transform(Ae(a))+", "+Ae(Ie.transform(s))+")"},$={test:t=>oe.test(t)||at.test(t)||pe.test(t),parse:t=>oe.test(t)?oe.parse(t):pe.test(t)?pe.parse(t):at.parse(t),transform:t=>typeof t=="string"?t:t.hasOwnProperty("red")?oe.transform(t):pe.transform(t),getAnimatableNone:t=>{const e=$.parse(t);return e.alpha=0,$.transform(e)}},ni=/(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;function ri(t){return isNaN(t)&&typeof t=="string"&&(t.match(At)?.length||0)+(t.match(ni)?.length||0)>0}const Ha="number",za="color",oi="var",li="var(",Wt="${}",di=/var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;function Me(t){const e=t.toString(),a=[],s={color:[],number:[],var:[]},i=[];let n=0;const o=e.replace(di,l=>($.test(l)?(s.color.push(n),i.push(za),a.push($.parse(l))):l.startsWith(li)?(s.var.push(n),i.push(oi),a.push(l)):(s.number.push(n),i.push(Ha),a.push(parseFloat(l))),++n,Wt)).split(Wt);return{values:a,split:o,indexes:s,types:i}}function _a(t){return Me(t).values}function qa(t){const{split:e,types:a}=Me(t),s=e.length;return i=>{let n="";for(let r=0;r<s;r++)if(n+=e[r],i[r]!==void 0){const o=a[r];o===Ha?n+=Ae(i[r]):o===za?n+=$.transform(i[r]):n+=i[r]}return n}}const ci=t=>typeof t=="number"?0:$.test(t)?$.getAnimatableNone(t):t;function pi(t){const e=_a(t);return qa(t)(e.map(ci))}const ne={test:ri,parse:_a,createTransformer:qa,getAnimatableNone:pi};function Ye(t,e,a){return a<0&&(a+=1),a>1&&(a-=1),a<1/6?t+(e-t)*6*a:a<1/2?e:a<2/3?t+(e-t)*(2/3-a)*6:t}function gi({hue:t,saturation:e,lightness:a,alpha:s}){t/=360,e/=100,a/=100;let i=0,n=0,r=0;if(!e)i=n=r=a;else{const o=a<.5?a*(1+e):a+e-a*e,l=2*a-o;i=Ye(l,o,t+1/3),n=Ye(l,o,t),r=Ye(l,o,t-1/3)}return{red:Math.round(i*255),green:Math.round(n*255),blue:Math.round(r*255),alpha:s}}function ze(t,e){return a=>a>0?e:t}const be=(t,e,a)=>t+(e-t)*a,Xe=(t,e,a)=>{const s=t*t,i=a*(e*e-s)+s;return i<0?0:Math.sqrt(i)},ui=[at,oe,pe],fi=t=>ui.find(e=>e.test(t));function Gt(t){const e=fi(t);if(!e)return!1;let a=e.parse(t);return e===pe&&(a=gi(a)),a}const Kt=(t,e)=>{const a=Gt(t),s=Gt(e);if(!a||!s)return ze(t,e);const i={...a};return n=>(i.red=Xe(a.red,s.red,n),i.green=Xe(a.green,s.green,n),i.blue=Xe(a.blue,s.blue,n),i.alpha=be(a.alpha,s.alpha,n),oe.transform(i))},st=new Set(["none","hidden"]);function mi(t,e){return st.has(t)?a=>a<=0?t:e:a=>a>=1?e:t}function bi(t,e){return a=>be(t,e,a)}function It(t){return typeof t=="number"?bi:typeof t=="string"?St(t)?ze:$.test(t)?Kt:vi:Array.isArray(t)?Ua:typeof t=="object"?$.test(t)?Kt:hi:ze}function Ua(t,e){const a=[...t],s=a.length,i=t.map((n,r)=>It(n)(n,e[r]));return n=>{for(let r=0;r<s;r++)a[r]=i[r](n);return a}}function hi(t,e){const a={...t,...e},s={};for(const i in a)t[i]!==void 0&&e[i]!==void 0&&(s[i]=It(t[i])(t[i],e[i]));return i=>{for(const n in s)a[n]=s[n](i);return a}}function xi(t,e){const a=[],s={color:0,var:0,number:0};for(let i=0;i<e.values.length;i++){const n=e.types[i],r=t.indexes[n][s[n]],o=t.values[r]??0;a[i]=o,s[n]++}return a}const vi=(t,e)=>{const a=ne.createTransformer(e),s=Me(t),i=Me(e);return s.indexes.var.length===i.indexes.var.length&&s.indexes.color.length===i.indexes.color.length&&s.indexes.number.length>=i.indexes.number.length?st.has(t)&&!i.values.length||st.has(e)&&!s.values.length?mi(t,e):wt(Ua(xi(s,i),i.values),a):ze(t,e)};function Wa(t,e,a){return typeof t=="number"&&typeof e=="number"&&typeof a=="number"?be(t,e,a):It(t)(t,e)}const yi=t=>{const e=({timestamp:a})=>t(a);return{start:(a=!0)=>Z.update(e,a),stop:()=>tt(e),now:()=>He.isProcessing?He.timestamp:H.now()}},Ga=(t,e,a=10)=>{let s="";const i=Math.max(Math.round(e/a),2);for(let n=0;n<i;n++)s+=Math.round(t(n/(i-1))*1e4)/1e4+", ";return`linear(${s.substring(0,s.length-2)})`},_e=2e4;function Mt(t){let e=0;const a=50;let s=t.next(e);for(;!s.done&&e<_e;)e+=a,s=t.next(e);return e>=_e?1/0:e}function Ka(t,e=100,a){const s=a({...t,keyframes:[0,e]}),i=Math.min(Mt(s),_e);return{type:"keyframes",ease:n=>s.next(i*n).value/e,duration:_(i)}}const wi=5;function Ya(t,e,a){const s=Math.max(e-wi,0);return Sa(a-t(s),e-s)}const P={stiffness:100,damping:10,mass:1,velocity:0,duration:800,bounce:.3,visualDuration:.3,restSpeed:{granular:.01,default:2},restDelta:{granular:.005,default:.5},minDuration:.01,maxDuration:10,minDamping:.05,maxDamping:1},Je=.001;function ki({duration:t=P.duration,bounce:e=P.bounce,velocity:a=P.velocity,mass:s=P.mass}){let i,n,r=1-e;r=ie(P.minDamping,P.maxDamping,r),t=ie(P.minDuration,P.maxDuration,_(t)),r<1?(i=c=>{const d=c*r,p=d*t,u=d-a,m=it(c,r),x=Math.exp(-p);return Je-u/m*x},n=c=>{const p=c*r*t,u=p*a+a,m=Math.pow(r,2)*Math.pow(c,2)*t,x=Math.exp(-p),y=it(Math.pow(c,2),r);return(-i(c)+Je>0?-1:1)*((u-m)*x)/y}):(i=c=>{const d=Math.exp(-c*t),p=(c-a)*t+1;return-Je+d*p},n=c=>{const d=Math.exp(-c*t),p=(a-c)*(t*t);return d*p});const o=5/t,l=Ti(i,n,o);if(t=X(t),isNaN(l))return{stiffness:P.stiffness,damping:P.damping,duration:t};{const c=Math.pow(l,2)*s;return{stiffness:c,damping:r*2*Math.sqrt(s*c),duration:t}}}const Ei=12;function Ti(t,e,a){let s=a;for(let i=1;i<Ei;i++)s=s-t(s)/e(s);return s}function it(t,e){return t*Math.sqrt(1-e*e)}const Si=["duration","bounce"],Ai=["stiffness","damping","mass"];function Yt(t,e){return e.some(a=>t[a]!==void 0)}function Ci(t){let e={velocity:P.velocity,stiffness:P.stiffness,damping:P.damping,mass:P.mass,isResolvedFromDuration:!1,...t};if(!Yt(t,Ai)&&Yt(t,Si))if(t.visualDuration){const a=t.visualDuration,s=2*Math.PI/(a*1.2),i=s*s,n=2*ie(.05,1,1-(t.bounce||0))*Math.sqrt(i);e={...e,mass:P.mass,stiffness:i,damping:n}}else{const a=ki(t);e={...e,...a,mass:P.mass},e.isResolvedFromDuration=!0}return e}function Le(t=P.visualDuration,e=P.bounce){const a=typeof t!="object"?{visualDuration:t,keyframes:[0,1],bounce:e}:t;let{restSpeed:s,restDelta:i}=a;const n=a.keyframes[0],r=a.keyframes[a.keyframes.length-1],o={done:!1,value:n},{stiffness:l,damping:c,mass:d,duration:p,velocity:u,isResolvedFromDuration:m}=Ci({...a,velocity:-_(a.velocity||0)}),x=u||0,y=c/(2*Math.sqrt(l*d)),v=r-n,w=_(Math.sqrt(l/d)),I=Math.abs(v)<5;s||(s=I?P.restSpeed.granular:P.restSpeed.default),i||(i=I?P.restDelta.granular:P.restDelta.default);let S;if(y<1){const h=it(w,y);S=C=>{const B=Math.exp(-y*w*C);return r-B*((x+y*w*v)/h*Math.sin(h*C)+v*Math.cos(h*C))}}else if(y===1)S=h=>r-Math.exp(-w*h)*(v+(x+w*v)*h);else{const h=w*Math.sqrt(y*y-1);S=C=>{const B=Math.exp(-y*w*C),k=Math.min(h*C,300);return r-B*((x+y*w*v)*Math.sinh(k)+h*v*Math.cosh(k))/h}}const T={calculatedDuration:m&&p||null,next:h=>{const C=S(h);if(m)o.done=h>=p;else{let B=h===0?x:0;y<1&&(B=h===0?X(x):Ya(S,h,C));const k=Math.abs(B)<=s,M=Math.abs(r-C)<=i;o.done=k&&M}return o.value=o.done?r:C,o},toString:()=>{const h=Math.min(Mt(T),_e),C=Ga(B=>T.next(h*B).value,h,30);return h+"ms "+C},toTransition:()=>{}};return T}Le.applyToOptions=t=>{const e=Ka(t,100,Le);return t.ease=e.ease,t.duration=X(e.duration),t.type="keyframes",t};function nt({keyframes:t,velocity:e=0,power:a=.8,timeConstant:s=325,bounceDamping:i=10,bounceStiffness:n=500,modifyTarget:r,min:o,max:l,restDelta:c=.5,restSpeed:d}){const p=t[0],u={done:!1,value:p},m=k=>o!==void 0&&k<o||l!==void 0&&k>l,x=k=>o===void 0?l:l===void 0||Math.abs(o-k)<Math.abs(l-k)?o:l;let y=a*e;const v=p+y,w=r===void 0?v:r(v);w!==v&&(y=w-p);const I=k=>-y*Math.exp(-k/s),S=k=>w+I(k),T=k=>{const M=I(k),j=S(k);u.done=Math.abs(M)<=c,u.value=u.done?w:j};let h,C;const B=k=>{m(u.value)&&(h=k,C=Le({keyframes:[u.value,x(u.value)],velocity:Ya(S,k,u.value),damping:i,stiffness:n,restDelta:c,restSpeed:d}))};return B(0),{calculatedDuration:null,next:k=>{let M=!1;return!C&&h===void 0&&(M=!0,T(k),B(k)),h!==void 0&&k>=h?C.next(k-h):(!M&&T(k),u)}}}function Ii(t,e,a){const s=[],i=a||J.mix||Wa,n=t.length-1;for(let r=0;r<n;r++){let o=i(t[r],t[r+1]);if(e){const l=Array.isArray(e)?e[r]||fe:e;o=wt(l,o)}s.push(o)}return s}function Mi(t,e,{clamp:a=!0,ease:s,mixer:i}={}){const n=t.length;if(vt(n===e.length),n===1)return()=>e[0];if(n===2&&e[0]===e[1])return()=>e[1];const r=t[0]===t[1];t[0]>t[n-1]&&(t=[...t].reverse(),e=[...e].reverse());const o=Ii(e,s,i),l=o.length,c=d=>{if(r&&d<t[0])return e[0];let p=0;if(l>1)for(;p<t.length-2&&!(d<t[p+1]);p++);const u=kt(t[p],t[p+1],d);return o[p](u)};return a?d=>c(ie(t[0],t[n-1],d)):c}function Xa(t,e){const a=t[t.length-1];for(let s=1;s<=e;s++){const i=kt(0,e,s);t.push(be(a,1,i))}}function Ja(t){const e=[0];return Xa(e,t.length-1),e}function Li(t,e){return t.map(a=>a*e)}function Bi(t,e){return t.map(()=>e||Ra).splice(0,t.length-1)}function Ce({duration:t=300,keyframes:e,times:a,ease:s="easeInOut"}){const i=Va(s)?s.map(_t):_t(s),n={done:!1,value:e[0]},r=Li(a&&a.length===e.length?a:Ja(e),t),o=Mi(r,e,{ease:Array.isArray(i)?i:Bi(e,i)});return{calculatedDuration:t,next:l=>(n.value=o(l),n.done=l>=t,n)}}const Pi=t=>t!==null;function Lt(t,{repeat:e,repeatType:a="loop"},s,i=1){const n=t.filter(Pi),o=i<0||e&&a!=="loop"&&e%2===1?0:n.length-1;return!o||s===void 0?n[o]:s}const Ri={decay:nt,inertia:nt,tween:Ce,keyframes:Ce,spring:Le};function Za(t){typeof t.type=="string"&&(t.type=Ri[t.type])}class Bt{constructor(){this.updateFinished()}get finished(){return this._finished}updateFinished(){this._finished=new Promise(e=>{this.resolve=e})}notifyFinished(){this.resolve()}then(e,a){return this.finished.then(e,a)}}const Vi=t=>t/100;class Pt extends Bt{constructor(e){super(),this.state="idle",this.startTime=null,this.isStopped=!1,this.currentTime=0,this.holdTime=null,this.playbackSpeed=1,this.stop=()=>{const{motionValue:a}=this.options;a&&a.updatedAt!==H.now()&&this.tick(H.now()),this.isStopped=!0,this.state!=="idle"&&(this.teardown(),this.options.onStop?.())},this.options=e,this.initAnimation(),this.play(),e.autoplay===!1&&this.pause()}initAnimation(){const{options:e}=this;Za(e);const{type:a=Ce,repeat:s=0,repeatDelay:i=0,repeatType:n,velocity:r=0}=e;let{keyframes:o}=e;const l=a||Ce;l!==Ce&&typeof o[0]!="number"&&(this.mixKeyframes=wt(Vi,Wa(o[0],o[1])),o=[0,100]);const c=l({...e,keyframes:o});n==="mirror"&&(this.mirroredGenerator=l({...e,keyframes:[...o].reverse(),velocity:-r})),c.calculatedDuration===null&&(c.calculatedDuration=Mt(c));const{calculatedDuration:d}=c;this.calculatedDuration=d,this.resolvedDuration=d+i,this.totalDuration=this.resolvedDuration*(s+1)-i,this.generator=c}updateTime(e){const a=Math.round(e-this.startTime)*this.playbackSpeed;this.holdTime!==null?this.currentTime=this.holdTime:this.currentTime=a}tick(e,a=!1){const{generator:s,totalDuration:i,mixKeyframes:n,mirroredGenerator:r,resolvedDuration:o,calculatedDuration:l}=this;if(this.startTime===null)return s.next(0);const{delay:c=0,keyframes:d,repeat:p,repeatType:u,repeatDelay:m,type:x,onUpdate:y,finalKeyframe:v}=this.options;this.speed>0?this.startTime=Math.min(this.startTime,e):this.speed<0&&(this.startTime=Math.min(e-i/this.speed,this.startTime)),a?this.currentTime=e:this.updateTime(e);const w=this.currentTime-c*(this.playbackSpeed>=0?1:-1),I=this.playbackSpeed>=0?w<0:w>i;this.currentTime=Math.max(w,0),this.state==="finished"&&this.holdTime===null&&(this.currentTime=i);let S=this.currentTime,T=s;if(p){const k=Math.min(this.currentTime,i)/o;let M=Math.floor(k),j=k%1;!j&&k>=1&&(j=1),j===1&&M--,M=Math.min(M,p+1),M%2&&(u==="reverse"?(j=1-j,m&&(j-=m/o)):u==="mirror"&&(T=r)),S=ie(0,1,j)*o}const h=I?{done:!1,value:d[0]}:T.next(S);n&&(h.value=n(h.value));let{done:C}=h;!I&&l!==null&&(C=this.playbackSpeed>=0?this.currentTime>=i:this.currentTime<=0);const B=this.holdTime===null&&(this.state==="finished"||this.state==="running"&&C);return B&&x!==nt&&(h.value=Lt(d,this.options,v,this.speed)),y&&y(h.value),B&&this.finish(),h}then(e,a){return this.finished.then(e,a)}get duration(){return _(this.calculatedDuration)}get iterationDuration(){const{delay:e=0}=this.options||{};return this.duration+_(e)}get time(){return _(this.currentTime)}set time(e){e=X(e),this.currentTime=e,this.startTime===null||this.holdTime!==null||this.playbackSpeed===0?this.holdTime=e:this.driver&&(this.startTime=this.driver.now()-e/this.playbackSpeed),this.driver?.start(!1)}get speed(){return this.playbackSpeed}set speed(e){this.updateTime(H.now());const a=this.playbackSpeed!==e;this.playbackSpeed=e,a&&(this.time=_(this.currentTime))}play(){if(this.isStopped)return;const{driver:e=yi,startTime:a}=this.options;this.driver||(this.driver=e(i=>this.tick(i))),this.options.onPlay?.();const s=this.driver.now();this.state==="finished"?(this.updateFinished(),this.startTime=s):this.holdTime!==null?this.startTime=s-this.holdTime:this.startTime||(this.startTime=a??s),this.state==="finished"&&this.speed<0&&(this.startTime+=this.calculatedDuration),this.holdTime=null,this.state="running",this.driver.start()}pause(){this.state="paused",this.updateTime(H.now()),this.holdTime=this.currentTime}complete(){this.state!=="running"&&this.play(),this.state="finished",this.holdTime=null}finish(){this.notifyFinished(),this.teardown(),this.state="finished",this.options.onComplete?.()}cancel(){this.holdTime=null,this.startTime=0,this.tick(0),this.teardown(),this.options.onCancel?.()}teardown(){this.state="idle",this.stopDriver(),this.startTime=this.holdTime=null}stopDriver(){this.driver&&(this.driver.stop(),this.driver=void 0)}sample(e){return this.startTime=0,this.tick(e,!0)}attachTimeline(e){return this.options.allowFlatten&&(this.options.type="keyframes",this.options.ease="linear",this.initAnimation()),this.driver?.stop(),e.observe(this)}}function $i(t){for(let e=1;e<t.length;e++)t[e]??(t[e]=t[e-1])}const le=t=>t*180/Math.PI,rt=t=>{const e=le(Math.atan2(t[1],t[0]));return ot(e)},Di={x:4,y:5,translateX:4,translateY:5,scaleX:0,scaleY:3,scale:t=>(Math.abs(t[0])+Math.abs(t[3]))/2,rotate:rt,rotateZ:rt,skewX:t=>le(Math.atan(t[1])),skewY:t=>le(Math.atan(t[2])),skew:t=>(Math.abs(t[1])+Math.abs(t[2]))/2},ot=t=>(t=t%360,t<0&&(t+=360),t),Xt=rt,Jt=t=>Math.sqrt(t[0]*t[0]+t[1]*t[1]),Zt=t=>Math.sqrt(t[4]*t[4]+t[5]*t[5]),Fi={x:12,y:13,z:14,translateX:12,translateY:13,translateZ:14,scaleX:Jt,scaleY:Zt,scale:t=>(Jt(t)+Zt(t))/2,rotateX:t=>ot(le(Math.atan2(t[6],t[5]))),rotateY:t=>ot(le(Math.atan2(-t[2],t[0]))),rotateZ:Xt,rotate:Xt,skewX:t=>le(Math.atan(t[4])),skewY:t=>le(Math.atan(t[1])),skew:t=>(Math.abs(t[1])+Math.abs(t[4]))/2};function lt(t){return t.includes("scale")?1:0}function dt(t,e){if(!t||t==="none")return lt(e);const a=t.match(/^matrix3d\(([-\d.e\s,]+)\)$/u);let s,i;if(a)s=Fi,i=a;else{const o=t.match(/^matrix\(([-\d.e\s,]+)\)$/u);s=Di,i=o}if(!i)return lt(e);const n=s[e],r=i[1].split(",").map(Oi);return typeof n=="function"?n(r):r[n]}const ji=(t,e)=>{const{transform:a="none"}=getComputedStyle(t);return dt(a,e)};function Oi(t){return parseFloat(t.trim())}const he=["transformPerspective","x","y","z","translateX","translateY","translateZ","scale","scaleX","scaleY","rotate","rotateX","rotateY","rotateZ","skew","skewX","skewY"],xe=new Set(he),Qt=t=>t===me||t===b,Ni=new Set(["x","y","z"]),Hi=he.filter(t=>!Ni.has(t));function zi(t){const e=[];return Hi.forEach(a=>{const s=t.getValue(a);s!==void 0&&(e.push([a,s.get()]),s.set(a.startsWith("scale")?1:0))}),e}const se={width:({x:t},{paddingLeft:e="0",paddingRight:a="0"})=>t.max-t.min-parseFloat(e)-parseFloat(a),height:({y:t},{paddingTop:e="0",paddingBottom:a="0"})=>t.max-t.min-parseFloat(e)-parseFloat(a),top:(t,{top:e})=>parseFloat(e),left:(t,{left:e})=>parseFloat(e),bottom:({y:t},{top:e})=>parseFloat(e)+(t.max-t.min),right:({x:t},{left:e})=>parseFloat(e)+(t.max-t.min),x:(t,{transform:e})=>dt(e,"x"),y:(t,{transform:e})=>dt(e,"y")};se.translateX=se.x;se.translateY=se.y;const de=new Set;let ct=!1,pt=!1,gt=!1;function Qa(){if(pt){const t=Array.from(de).filter(s=>s.needsMeasurement),e=new Set(t.map(s=>s.element)),a=new Map;e.forEach(s=>{const i=zi(s);i.length&&(a.set(s,i),s.render())}),t.forEach(s=>s.measureInitialState()),e.forEach(s=>{s.render();const i=a.get(s);i&&i.forEach(([n,r])=>{s.getValue(n)?.set(r)})}),t.forEach(s=>s.measureEndState()),t.forEach(s=>{s.suspendedScrollY!==void 0&&window.scrollTo(0,s.suspendedScrollY)})}pt=!1,ct=!1,de.forEach(t=>t.complete(gt)),de.clear()}function es(){de.forEach(t=>{t.readKeyframes(),t.needsMeasurement&&(pt=!0)})}function _i(){gt=!0,es(),Qa(),gt=!1}class Rt{constructor(e,a,s,i,n,r=!1){this.state="pending",this.isAsync=!1,this.needsMeasurement=!1,this.unresolvedKeyframes=[...e],this.onComplete=a,this.name=s,this.motionValue=i,this.element=n,this.isAsync=r}scheduleResolve(){this.state="scheduled",this.isAsync?(de.add(this),ct||(ct=!0,Z.read(es),Z.resolveKeyframes(Qa))):(this.readKeyframes(),this.complete())}readKeyframes(){const{unresolvedKeyframes:e,name:a,element:s,motionValue:i}=this;if(e[0]===null){const n=i?.get(),r=e[e.length-1];if(n!==void 0)e[0]=n;else if(s&&a){const o=s.readValue(a,r);o!=null&&(e[0]=o)}e[0]===void 0&&(e[0]=r),i&&n===void 0&&i.set(e[0])}$i(e)}setFinalKeyframe(){}measureInitialState(){}renderEndStyles(){}measureEndState(){}complete(e=!1){this.state="complete",this.onComplete(this.unresolvedKeyframes,this.finalKeyframe,e),de.delete(this)}cancel(){this.state==="scheduled"&&(de.delete(this),this.state="pending")}resume(){this.state==="pending"&&this.scheduleResolve()}}const qi=t=>t.startsWith("--");function Ui(t,e,a){qi(e)?t.style.setProperty(e,a):t.style[e]=a}const Wi=yt(()=>window.ScrollTimeline!==void 0),Gi={};function Ki(t,e){const a=yt(t);return()=>Gi[e]??a()}const ts=Ki(()=>{try{document.createElement("div").animate({opacity:0},{easing:"linear(0, 1)"})}catch{return!1}return!0},"linearEasing"),Te=([t,e,a,s])=>`cubic-bezier(${t}, ${e}, ${a}, ${s})`,ea={linear:"linear",ease:"ease",easeIn:"ease-in",easeOut:"ease-out",easeInOut:"ease-in-out",circIn:Te([0,.65,.55,1]),circOut:Te([.55,0,1,.45]),backIn:Te([.31,.01,.66,-.59]),backOut:Te([.33,1.53,.69,.99])};function as(t,e){if(t)return typeof t=="function"?ts()?Ga(t,e):"ease-out":Da(t)?Te(t):Array.isArray(t)?t.map(a=>as(a,e)||ea.easeOut):ea[t]}function Yi(t,e,a,{delay:s=0,duration:i=300,repeat:n=0,repeatType:r="loop",ease:o="easeOut",times:l}={},c=void 0){const d={[e]:a};l&&(d.offset=l);const p=as(o,i);Array.isArray(p)&&(d.easing=p);const u={delay:s,duration:i,easing:Array.isArray(p)?"linear":p,fill:"both",iterations:n+1,direction:r==="reverse"?"alternate":"normal"};return c&&(u.pseudoElement=c),t.animate(d,u)}function Vt(t){return typeof t=="function"&&"applyToOptions"in t}function Xi({type:t,...e}){return Vt(t)&&ts()?t.applyToOptions(e):(e.duration??(e.duration=300),e.ease??(e.ease="easeOut"),e)}class Ji extends Bt{constructor(e){if(super(),this.finishedTime=null,this.isStopped=!1,this.manualStartTime=null,!e)return;const{element:a,name:s,keyframes:i,pseudoElement:n,allowFlatten:r=!1,finalKeyframe:o,onComplete:l}=e;this.isPseudoElement=!!n,this.allowFlatten=r,this.options=e,vt(typeof e.type!="string");const c=Xi(e);this.animation=Yi(a,s,i,c,n),c.autoplay===!1&&this.animation.pause(),this.animation.onfinish=()=>{if(this.finishedTime=this.time,!n){const d=Lt(i,this.options,o,this.speed);this.updateMotionValue?this.updateMotionValue(d):Ui(a,s,d),this.animation.cancel()}l?.(),this.notifyFinished()}}play(){this.isStopped||(this.manualStartTime=null,this.animation.play(),this.state==="finished"&&this.updateFinished())}pause(){this.animation.pause()}complete(){this.animation.finish?.()}cancel(){try{this.animation.cancel()}catch{}}stop(){if(this.isStopped)return;this.isStopped=!0;const{state:e}=this;e==="idle"||e==="finished"||(this.updateMotionValue?this.updateMotionValue():this.commitStyles(),this.isPseudoElement||this.cancel())}commitStyles(){this.isPseudoElement||this.animation.commitStyles?.()}get duration(){const e=this.animation.effect?.getComputedTiming?.().duration||0;return _(Number(e))}get iterationDuration(){const{delay:e=0}=this.options||{};return this.duration+_(e)}get time(){return _(Number(this.animation.currentTime)||0)}set time(e){this.manualStartTime=null,this.finishedTime=null,this.animation.currentTime=X(e)}get speed(){return this.animation.playbackRate}set speed(e){e<0&&(this.finishedTime=null),this.animation.playbackRate=e}get state(){return this.finishedTime!==null?"finished":this.animation.playState}get startTime(){return this.manualStartTime??Number(this.animation.startTime)}set startTime(e){this.manualStartTime=this.animation.startTime=e}attachTimeline({timeline:e,observe:a}){return this.allowFlatten&&this.animation.effect?.updateTiming({easing:"linear"}),this.animation.onfinish=null,e&&Wi()?(this.animation.timeline=e,fe):a(this)}}const ss={anticipate:Ba,backInOut:La,circInOut:Pa};function Zi(t){return t in ss}function Qi(t){typeof t.ease=="string"&&Zi(t.ease)&&(t.ease=ss[t.ease])}const Ze=10;class en extends Ji{constructor(e){Qi(e),Za(e),super(e),e.startTime!==void 0&&(this.startTime=e.startTime),this.options=e}updateMotionValue(e){const{motionValue:a,onUpdate:s,onComplete:i,element:n,...r}=this.options;if(!a)return;if(e!==void 0){a.set(e);return}const o=new Pt({...r,autoplay:!1}),l=Math.max(Ze,H.now()-this.startTime),c=ie(0,Ze,l-Ze);a.setWithVelocity(o.sample(Math.max(0,l-c)).value,o.sample(l).value,c),o.stop()}}const ta=(t,e)=>e==="zIndex"?!1:!!(typeof t=="number"||Array.isArray(t)||typeof t=="string"&&(ne.test(t)||t==="0")&&!t.startsWith("url("));function tn(t){const e=t[0];if(t.length===1)return!0;for(let a=0;a<t.length;a++)if(t[a]!==e)return!0}function an(t,e,a,s){const i=t[0];if(i===null)return!1;if(e==="display"||e==="visibility")return!0;const n=t[t.length-1],r=ta(i,e),o=ta(n,e);return!r||!o?!1:tn(t)||(a==="spring"||Vt(a))&&s}function ut(t){t.duration=0,t.type="keyframes"}const sn=new Set(["opacity","clipPath","filter","transform"]),nn=yt(()=>Object.hasOwnProperty.call(Element.prototype,"animate"));function rn(t){const{motionValue:e,name:a,repeatDelay:s,repeatType:i,damping:n,type:r}=t;if(!(e?.owner?.current instanceof HTMLElement))return!1;const{onUpdate:l,transformTemplate:c}=e.owner.getProps();return nn()&&a&&sn.has(a)&&(a!=="transform"||!c)&&!l&&!s&&i!=="mirror"&&n!==0&&r!=="inertia"}const on=40;class ln extends Bt{constructor({autoplay:e=!0,delay:a=0,type:s="keyframes",repeat:i=0,repeatDelay:n=0,repeatType:r="loop",keyframes:o,name:l,motionValue:c,element:d,...p}){super(),this.stop=()=>{this._animation&&(this._animation.stop(),this.stopTimeline?.()),this.keyframeResolver?.cancel()},this.createdAt=H.now();const u={autoplay:e,delay:a,type:s,repeat:i,repeatDelay:n,repeatType:r,name:l,motionValue:c,element:d,...p},m=d?.KeyframeResolver||Rt;this.keyframeResolver=new m(o,(x,y,v)=>this.onKeyframesResolved(x,y,u,!v),l,c,d),this.keyframeResolver?.scheduleResolve()}onKeyframesResolved(e,a,s,i){this.keyframeResolver=void 0;const{name:n,type:r,velocity:o,delay:l,isHandoff:c,onUpdate:d}=s;this.resolvedAt=H.now(),an(e,n,r,o)||((J.instantAnimations||!l)&&d?.(Lt(e,s,a)),e[0]=e[e.length-1],ut(s),s.repeat=0);const u={startTime:i?this.resolvedAt?this.resolvedAt-this.createdAt>on?this.resolvedAt:this.createdAt:this.createdAt:void 0,finalKeyframe:a,...s,keyframes:e},m=!c&&rn(u)?new en({...u,element:u.motionValue.owner.current}):new Pt(u);m.finished.then(()=>this.notifyFinished()).catch(fe),this.pendingTimeline&&(this.stopTimeline=m.attachTimeline(this.pendingTimeline),this.pendingTimeline=void 0),this._animation=m}get finished(){return this._animation?this.animation.finished:this._finished}then(e,a){return this.finished.finally(e).then(()=>{})}get animation(){return this._animation||(this.keyframeResolver?.resume(),_i()),this._animation}get duration(){return this.animation.duration}get iterationDuration(){return this.animation.iterationDuration}get time(){return this.animation.time}set time(e){this.animation.time=e}get speed(){return this.animation.speed}get state(){return this.animation.state}set speed(e){this.animation.speed=e}get startTime(){return this.animation.startTime}attachTimeline(e){return this._animation?this.stopTimeline=this.animation.attachTimeline(e):this.pendingTimeline=e,()=>this.stop()}play(){this.animation.play()}pause(){this.animation.pause()}complete(){this.animation.complete()}cancel(){this._animation&&this.animation.cancel(),this.keyframeResolver?.cancel()}}class dn{constructor(e){this.stop=()=>this.runAll("stop"),this.animations=e.filter(Boolean)}get finished(){return Promise.all(this.animations.map(e=>e.finished))}getAll(e){return this.animations[0][e]}setAll(e,a){for(let s=0;s<this.animations.length;s++)this.animations[s][e]=a}attachTimeline(e){const a=this.animations.map(s=>s.attachTimeline(e));return()=>{a.forEach((s,i)=>{s&&s(),this.animations[i].stop()})}}get time(){return this.getAll("time")}set time(e){this.setAll("time",e)}get speed(){return this.getAll("speed")}set speed(e){this.setAll("speed",e)}get state(){return this.getAll("state")}get startTime(){return this.getAll("startTime")}get duration(){return aa(this.animations,"duration")}get iterationDuration(){return aa(this.animations,"iterationDuration")}runAll(e){this.animations.forEach(a=>a[e]())}play(){this.runAll("play")}pause(){this.runAll("pause")}cancel(){this.runAll("cancel")}complete(){this.runAll("complete")}}function aa(t,e){let a=0;for(let s=0;s<t.length;s++){const i=t[s][e];i!==null&&i>a&&(a=i)}return a}class cn extends dn{then(e,a){return this.finished.finally(e).then(()=>{})}}const pn=/^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u;function gn(t){const e=pn.exec(t);if(!e)return[,];const[,a,s,i]=e;return[`--${a??s}`,i]}function is(t,e,a=1){const[s,i]=gn(t);if(!s)return;const n=window.getComputedStyle(e).getPropertyValue(s);if(n){const r=n.trim();return ka(r)?parseFloat(r):r}return St(i)?is(i,e,a+1):i}function ns(t,e){return t?.[e]??t?.default??t}const un={type:"spring",stiffness:500,damping:25,restSpeed:10},fn=t=>({type:"spring",stiffness:550,damping:t===0?2*Math.sqrt(550):30,restSpeed:10}),mn={type:"keyframes",duration:.8},bn={type:"keyframes",ease:[.25,.1,.35,1],duration:.3},hn=(t,{keyframes:e})=>e.length>2?mn:xe.has(t)?t.startsWith("scale")?fn(e[1]):un:bn;function xn({when:t,delay:e,delayChildren:a,staggerChildren:s,staggerDirection:i,repeat:n,repeatType:r,repeatDelay:o,from:l,elapsed:c,...d}){return!!Object.keys(d).length}const vn=t=>t!==null;function yn(t,{repeat:e,repeatType:a="loop"},s){const i=t.filter(vn),n=e&&a!=="loop"&&e%2===1?0:i.length-1;return i[n]}const rs=(t,e,a,s={},i,n)=>r=>{const o=ns(s,t)||{},l=o.delay||s.delay||0;let{elapsed:c=0}=s;c=c-X(l);const d={keyframes:Array.isArray(a)?a:[null,a],ease:"easeOut",velocity:e.getVelocity(),...o,delay:-c,onUpdate:u=>{e.set(u),o.onUpdate&&o.onUpdate(u)},onComplete:()=>{r(),o.onComplete&&o.onComplete()},name:t,motionValue:e,element:n?void 0:i};xn(o)||Object.assign(d,hn(t,d)),d.duration&&(d.duration=X(d.duration)),d.repeatDelay&&(d.repeatDelay=X(d.repeatDelay)),d.from!==void 0&&(d.keyframes[0]=d.from);let p=!1;if((d.type===!1||d.duration===0&&!d.repeatDelay)&&(ut(d),d.delay===0&&(p=!0)),(J.instantAnimations||J.skipAnimations)&&(p=!0,ut(d),d.delay=0),d.allowFlatten=!o.type&&!o.ease,p&&!n&&e.get()!==void 0){const u=yn(d.keyframes,o);if(u!==void 0){Z.update(()=>{d.onUpdate(u),d.onComplete()});return}}return o.isSync?new Pt(d):new ln(d)},os=new Set(["width","height","top","left","right","bottom",...he]),sa=30,wn=t=>!isNaN(parseFloat(t));class kn{constructor(e,a={}){this.canTrackVelocity=null,this.events={},this.updateAndNotify=s=>{const i=H.now();if(this.updatedAt!==i&&this.setPrevFrameValue(),this.prev=this.current,this.setCurrent(s),this.current!==this.prev&&(this.events.change?.notify(this.current),this.dependents))for(const n of this.dependents)n.dirty()},this.hasAnimated=!1,this.setCurrent(e),this.owner=a.owner}setCurrent(e){this.current=e,this.updatedAt=H.now(),this.canTrackVelocity===null&&e!==void 0&&(this.canTrackVelocity=wn(this.current))}setPrevFrameValue(e=this.current){this.prevFrameValue=e,this.prevUpdatedAt=this.updatedAt}onChange(e){return this.on("change",e)}on(e,a){this.events[e]||(this.events[e]=new Ta);const s=this.events[e].add(a);return e==="change"?()=>{s(),Z.read(()=>{this.events.change.getSize()||this.stop()})}:s}clearListeners(){for(const e in this.events)this.events[e].clear()}attach(e,a){this.passiveEffect=e,this.stopPassiveEffect=a}set(e){this.passiveEffect?this.passiveEffect(e,this.updateAndNotify):this.updateAndNotify(e)}setWithVelocity(e,a,s){this.set(a),this.prev=void 0,this.prevFrameValue=e,this.prevUpdatedAt=this.updatedAt-s}jump(e,a=!0){this.updateAndNotify(e),this.prev=e,this.prevUpdatedAt=this.prevFrameValue=void 0,a&&this.stop(),this.stopPassiveEffect&&this.stopPassiveEffect()}dirty(){this.events.change?.notify(this.current)}addDependent(e){this.dependents||(this.dependents=new Set),this.dependents.add(e)}removeDependent(e){this.dependents&&this.dependents.delete(e)}get(){return this.current}getPrevious(){return this.prev}getVelocity(){const e=H.now();if(!this.canTrackVelocity||this.prevFrameValue===void 0||e-this.updatedAt>sa)return 0;const a=Math.min(this.updatedAt-this.prevUpdatedAt,sa);return Sa(parseFloat(this.current)-parseFloat(this.prevFrameValue),a)}start(e){return this.stop(),new Promise(a=>{this.hasAnimated=!0,this.animation=e(a),this.events.animationStart&&this.events.animationStart.notify()}).then(()=>{this.events.animationComplete&&this.events.animationComplete.notify(),this.clearAnimation()})}stop(){this.animation&&(this.animation.stop(),this.events.animationCancel&&this.events.animationCancel.notify()),this.clearAnimation()}isAnimating(){return!!this.animation}clearAnimation(){delete this.animation}destroy(){this.dependents?.clear(),this.events.destroy?.notify(),this.clearListeners(),this.stop(),this.stopPassiveEffect&&this.stopPassiveEffect()}}function Be(t,e){return new kn(t,e)}function ia(t){const e=[{},{}];return t?.values.forEach((a,s)=>{e[0][s]=a.get(),e[1][s]=a.getVelocity()}),e}function ls(t,e,a,s){if(typeof e=="function"){const[i,n]=ia(s);e=e(a!==void 0?a:t.custom,i,n)}if(typeof e=="string"&&(e=t.variants&&t.variants[e]),typeof e=="function"){const[i,n]=ia(s);e=e(a!==void 0?a:t.custom,i,n)}return e}function En(t,e,a){const s=t.getProps();return ls(s,e,s.custom,t)}const Tn=t=>Array.isArray(t);function Sn(t,e,a){t.hasValue(e)?t.getValue(e).set(a):t.addValue(e,Be(a))}function An(t){return Tn(t)?t[t.length-1]||0:t}function Cn(t,e){const a=En(t,e);let{transitionEnd:s={},transition:i={},...n}=a||{};n={...n,...s};for(const r in n){const o=An(n[r]);Sn(t,r,o)}}const N=t=>!!(t&&t.getVelocity);function In(t){return!!(N(t)&&t.add)}function Mn(t,e){const a=t.getValue("willChange");if(In(a))return a.add(e);if(!a&&J.WillChange){const s=new J.WillChange("auto");t.addValue("willChange",s),s.add(e)}}function $t(t){return t.replace(/([A-Z])/g,e=>`-${e.toLowerCase()}`)}const Ln="framerAppearId",Bn="data-"+$t(Ln);function Pn(t){return t.props[Bn]}function Rn({protectedKeys:t,needsAnimating:e},a){const s=t.hasOwnProperty(a)&&e[a]!==!0;return e[a]=!1,s}function Vn(t,e,{delay:a=0,transitionOverride:s,type:i}={}){let{transition:n=t.getDefaultTransition(),transitionEnd:r,...o}=e;s&&(n=s);const l=[],c=i&&t.animationState&&t.animationState.getState()[i];for(const d in o){const p=t.getValue(d,t.latestValues[d]??null),u=o[d];if(u===void 0||c&&Rn(c,d))continue;const m={delay:a,...ns(n||{},d)},x=p.get();if(x!==void 0&&!p.isAnimating&&!Array.isArray(u)&&u===x&&!m.velocity)continue;let y=!1;if(window.MotionHandoffAnimation){const w=Pn(t);if(w){const I=window.MotionHandoffAnimation(w,d,Z);I!==null&&(m.startTime=I,y=!0)}}Mn(t,d),p.start(rs(d,p,u,t.shouldReduceMotion&&os.has(d)?{type:!1}:m,t,y));const v=p.animation;v&&l.push(v)}return r&&Promise.all(l).then(()=>{Z.update(()=>{r&&Cn(t,r)})}),l}const $n={test:t=>t==="auto",parse:t=>t},ds=t=>e=>e.test(t),cs=[me,b,ge,ae,ii,si,$n],na=t=>cs.find(ds(t));function Dn(t){return typeof t=="number"?t===0:t!==null?t==="none"||t==="0"||Ea(t):!0}const Fn=new Set(["brightness","contrast","saturate","opacity"]);function jn(t){const[e,a]=t.slice(0,-1).split("(");if(e==="drop-shadow")return t;const[s]=a.match(At)||[];if(!s)return t;const i=a.replace(s,"");let n=Fn.has(e)?1:0;return s!==a&&(n*=100),e+"("+n+i+")"}const On=/\b([a-z-]*)\(.*?\)/gu,ft={...ne,getAnimatableNone:t=>{const e=t.match(On);return e?e.map(jn).join(" "):t}},ra={...me,transform:Math.round},Nn={rotate:ae,rotateX:ae,rotateY:ae,rotateZ:ae,scale:je,scaleX:je,scaleY:je,scaleZ:je,skew:ae,skewX:ae,skewY:ae,distance:b,translateX:b,translateY:b,translateZ:b,x:b,y:b,z:b,perspective:b,transformPerspective:b,opacity:Ie,originX:Ut,originY:Ut,originZ:b},Dt={borderWidth:b,borderTopWidth:b,borderRightWidth:b,borderBottomWidth:b,borderLeftWidth:b,borderRadius:b,radius:b,borderTopLeftRadius:b,borderTopRightRadius:b,borderBottomRightRadius:b,borderBottomLeftRadius:b,width:b,maxWidth:b,height:b,maxHeight:b,top:b,right:b,bottom:b,left:b,inset:b,insetBlock:b,insetBlockStart:b,insetBlockEnd:b,insetInline:b,insetInlineStart:b,insetInlineEnd:b,padding:b,paddingTop:b,paddingRight:b,paddingBottom:b,paddingLeft:b,paddingBlock:b,paddingBlockStart:b,paddingBlockEnd:b,paddingInline:b,paddingInlineStart:b,paddingInlineEnd:b,margin:b,marginTop:b,marginRight:b,marginBottom:b,marginLeft:b,marginBlock:b,marginBlockStart:b,marginBlockEnd:b,marginInline:b,marginInlineStart:b,marginInlineEnd:b,backgroundPositionX:b,backgroundPositionY:b,...Nn,zIndex:ra,fillOpacity:Ie,strokeOpacity:Ie,numOctaves:ra},Hn={...Dt,color:$,backgroundColor:$,outlineColor:$,fill:$,stroke:$,borderColor:$,borderTopColor:$,borderRightColor:$,borderBottomColor:$,borderLeftColor:$,filter:ft,WebkitFilter:ft},ps=t=>Hn[t];function gs(t,e){let a=ps(t);return a!==ft&&(a=ne),a.getAnimatableNone?a.getAnimatableNone(e):void 0}const zn=new Set(["auto","none","0"]);function _n(t,e,a){let s=0,i;for(;s<t.length&&!i;){const n=t[s];typeof n=="string"&&!zn.has(n)&&Me(n).values.length&&(i=t[s]),s++}if(i&&a)for(const n of e)t[n]=gs(a,i)}class qn extends Rt{constructor(e,a,s,i,n){super(e,a,s,i,n,!0)}readKeyframes(){const{unresolvedKeyframes:e,element:a,name:s}=this;if(!a||!a.current)return;super.readKeyframes();for(let d=0;d<e.length;d++){let p=e[d];if(typeof p=="string"&&(p=p.trim(),St(p))){const u=is(p,a.current);u!==void 0&&(e[d]=u),d===e.length-1&&(this.finalKeyframe=p)}}if(this.resolveNoneKeyframes(),!os.has(s)||e.length!==2)return;const[i,n]=e,r=na(i),o=na(n),l=qt(i),c=qt(n);if(l!==c&&se[s]){this.needsMeasurement=!0;return}if(r!==o)if(Qt(r)&&Qt(o))for(let d=0;d<e.length;d++){const p=e[d];typeof p=="string"&&(e[d]=parseFloat(p))}else se[s]&&(this.needsMeasurement=!0)}resolveNoneKeyframes(){const{unresolvedKeyframes:e,name:a}=this,s=[];for(let i=0;i<e.length;i++)(e[i]===null||Dn(e[i]))&&s.push(i);s.length&&_n(e,s,a)}measureInitialState(){const{element:e,unresolvedKeyframes:a,name:s}=this;if(!e||!e.current)return;s==="height"&&(this.suspendedScrollY=window.pageYOffset),this.measuredOrigin=se[s](e.measureViewportBox(),window.getComputedStyle(e.current)),a[0]=this.measuredOrigin;const i=a[a.length-1];i!==void 0&&e.getValue(s,i).jump(i,!1)}measureEndState(){const{element:e,name:a,unresolvedKeyframes:s}=this;if(!e||!e.current)return;const i=e.getValue(a);i&&i.jump(this.measuredOrigin,!1);const n=s.length-1,r=s[n];s[n]=se[a](e.measureViewportBox(),window.getComputedStyle(e.current)),r!==null&&this.finalKeyframe===void 0&&(this.finalKeyframe=r),this.removedTransforms?.length&&this.removedTransforms.forEach(([o,l])=>{e.getValue(o).set(l)}),this.resolveNoneKeyframes()}}function Un(t,e,a){if(t instanceof EventTarget)return[t];if(typeof t=="string"){let s=document;const i=a?.[t]??s.querySelectorAll(t);return i?Array.from(i):[]}return Array.from(t)}const us=(t,e)=>e&&typeof t=="number"?e.transform(t):t,{schedule:Wn}=Fa(queueMicrotask,!1);function fs(t){return Fs(t)&&"ownerSVGElement"in t}function Gn(t){return fs(t)&&t.tagName==="svg"}const Kn=[...cs,$,ne],Yn=t=>Kn.find(ds(t)),oa=()=>({min:0,max:0}),Ft=()=>({x:oa(),y:oa()}),mt={current:null},ms={current:!1},Xn=typeof window<"u";function Jn(){if(ms.current=!0,!!Xn)if(window.matchMedia){const t=window.matchMedia("(prefers-reduced-motion)"),e=()=>mt.current=t.matches;t.addEventListener("change",e),e()}else mt.current=!1}const Pe=new WeakMap;function Zn(t){return t!==null&&typeof t=="object"&&typeof t.start=="function"}function Qn(t){return typeof t=="string"||Array.isArray(t)}const er=["animate","whileInView","whileFocus","whileHover","whileTap","whileDrag","exit"],tr=["initial",...er];function bs(t){return Zn(t.animate)||tr.some(e=>Qn(t[e]))}function ar(t){return!!(bs(t)||t.variants)}function sr(t,e,a){for(const s in e){const i=e[s],n=a[s];if(N(i))t.addValue(s,i);else if(N(n))t.addValue(s,Be(i,{owner:t}));else if(n!==i)if(t.hasValue(s)){const r=t.getValue(s);r.liveStyle===!0?r.jump(i):r.hasAnimated||r.set(i)}else{const r=t.getStaticValue(s);t.addValue(s,Be(r!==void 0?r:i,{owner:t}))}}for(const s in a)e[s]===void 0&&t.removeValue(s);return e}const la=["AnimationStart","AnimationComplete","Update","BeforeLayoutMeasure","LayoutMeasure","LayoutAnimationStart","LayoutAnimationComplete"];let da={};class hs{scrapeMotionValuesFromProps(e,a,s){return{}}constructor({parent:e,props:a,presenceContext:s,reducedMotionConfig:i,blockInitialAnimation:n,visualState:r},o={}){this.current=null,this.children=new Set,this.isVariantNode=!1,this.isControllingVariants=!1,this.shouldReduceMotion=null,this.values=new Map,this.KeyframeResolver=Rt,this.features={},this.valueSubscriptions=new Map,this.prevMotionValues={},this.events={},this.propEventSubscriptions={},this.notifyUpdate=()=>this.notify("Update",this.latestValues),this.render=()=>{this.current&&(this.triggerBuild(),this.renderInstance(this.current,this.renderState,this.props.style,this.projection))},this.renderScheduledAt=0,this.scheduleRender=()=>{const u=H.now();this.renderScheduledAt<u&&(this.renderScheduledAt=u,Z.render(this.render,!1,!0))};const{latestValues:l,renderState:c}=r;this.latestValues=l,this.baseTarget={...l},this.initialValues=a.initial?{...l}:{},this.renderState=c,this.parent=e,this.props=a,this.presenceContext=s,this.depth=e?e.depth+1:0,this.reducedMotionConfig=i,this.options=o,this.blockInitialAnimation=!!n,this.isControllingVariants=bs(a),this.isVariantNode=ar(a),this.isVariantNode&&(this.variantChildren=new Set),this.manuallyAnimateOnMount=!!(e&&e.current);const{willChange:d,...p}=this.scrapeMotionValuesFromProps(a,{},this);for(const u in p){const m=p[u];l[u]!==void 0&&N(m)&&m.set(l[u])}}mount(e){this.current=e,Pe.set(e,this),this.projection&&!this.projection.instance&&this.projection.mount(e),this.parent&&this.isVariantNode&&!this.isControllingVariants&&(this.removeFromVariantTree=this.parent.addVariantChild(this)),this.values.forEach((a,s)=>this.bindToMotionValue(s,a)),this.reducedMotionConfig==="never"?this.shouldReduceMotion=!1:this.reducedMotionConfig==="always"?this.shouldReduceMotion=!0:(ms.current||Jn(),this.shouldReduceMotion=mt.current),this.parent?.addChild(this),this.update(this.props,this.presenceContext)}unmount(){this.projection&&this.projection.unmount(),tt(this.notifyUpdate),tt(this.render),this.valueSubscriptions.forEach(e=>e()),this.valueSubscriptions.clear(),this.removeFromVariantTree&&this.removeFromVariantTree(),this.parent?.removeChild(this);for(const e in this.events)this.events[e].clear();for(const e in this.features){const a=this.features[e];a&&(a.unmount(),a.isMounted=!1)}this.current=null}addChild(e){this.children.add(e),this.enteringChildren??(this.enteringChildren=new Set),this.enteringChildren.add(e)}removeChild(e){this.children.delete(e),this.enteringChildren&&this.enteringChildren.delete(e)}bindToMotionValue(e,a){this.valueSubscriptions.has(e)&&this.valueSubscriptions.get(e)();const s=xe.has(e);s&&this.onBindTransform&&this.onBindTransform();const i=a.on("change",r=>{this.latestValues[e]=r,this.props.onUpdate&&Z.preRender(this.notifyUpdate),s&&this.projection&&(this.projection.isTransformDirty=!0),this.scheduleRender()});let n;typeof window<"u"&&window.MotionCheckAppearSync&&(n=window.MotionCheckAppearSync(this,e,a)),this.valueSubscriptions.set(e,()=>{i(),n&&n(),a.owner&&a.stop()})}sortNodePosition(e){return!this.current||!this.sortInstanceNodePosition||this.type!==e.type?0:this.sortInstanceNodePosition(this.current,e.current)}updateFeatures(){let e="animation";for(e in da){const a=da[e];if(!a)continue;const{isEnabled:s,Feature:i}=a;if(!this.features[e]&&i&&s(this.props)&&(this.features[e]=new i(this)),this.features[e]){const n=this.features[e];n.isMounted?n.update():(n.mount(),n.isMounted=!0)}}}triggerBuild(){this.build(this.renderState,this.latestValues,this.props)}measureViewportBox(){return this.current?this.measureInstanceViewportBox(this.current,this.props):Ft()}getStaticValue(e){return this.latestValues[e]}setStaticValue(e,a){this.latestValues[e]=a}update(e,a){(e.transformTemplate||this.props.transformTemplate)&&this.scheduleRender(),this.prevProps=this.props,this.props=e,this.prevPresenceContext=this.presenceContext,this.presenceContext=a;for(let s=0;s<la.length;s++){const i=la[s];this.propEventSubscriptions[i]&&(this.propEventSubscriptions[i](),delete this.propEventSubscriptions[i]);const n="on"+i,r=e[n];r&&(this.propEventSubscriptions[i]=this.on(i,r))}this.prevMotionValues=sr(this,this.scrapeMotionValuesFromProps(e,this.prevProps||{},this),this.prevMotionValues),this.handleChildMotionValue&&this.handleChildMotionValue()}getProps(){return this.props}getVariant(e){return this.props.variants?this.props.variants[e]:void 0}getDefaultTransition(){return this.props.transition}getTransformPagePoint(){return this.props.transformPagePoint}getClosestVariantNode(){return this.isVariantNode?this:this.parent?this.parent.getClosestVariantNode():void 0}addVariantChild(e){const a=this.getClosestVariantNode();if(a)return a.variantChildren&&a.variantChildren.add(e),()=>a.variantChildren.delete(e)}addValue(e,a){const s=this.values.get(e);a!==s&&(s&&this.removeValue(e),this.bindToMotionValue(e,a),this.values.set(e,a),this.latestValues[e]=a.get())}removeValue(e){this.values.delete(e);const a=this.valueSubscriptions.get(e);a&&(a(),this.valueSubscriptions.delete(e)),delete this.latestValues[e],this.removeValueFromRenderState(e,this.renderState)}hasValue(e){return this.values.has(e)}getValue(e,a){if(this.props.values&&this.props.values[e])return this.props.values[e];let s=this.values.get(e);return s===void 0&&a!==void 0&&(s=Be(a===null?void 0:a,{owner:this}),this.addValue(e,s)),s}readValue(e,a){let s=this.latestValues[e]!==void 0||!this.current?this.latestValues[e]:this.getBaseTargetFromProps(this.props,e)??this.readValueFromInstance(this.current,e,this.options);return s!=null&&(typeof s=="string"&&(ka(s)||Ea(s))?s=parseFloat(s):!Yn(s)&&ne.test(a)&&(s=gs(e,a)),this.setBaseTarget(e,N(s)?s.get():s)),N(s)?s.get():s}setBaseTarget(e,a){this.baseTarget[e]=a}getBaseTarget(e){const{initial:a}=this.props;let s;if(typeof a=="string"||typeof a=="object"){const n=ls(this.props,a,this.presenceContext?.custom);n&&(s=n[e])}if(a&&s!==void 0)return s;const i=this.getBaseTargetFromProps(this.props,e);return i!==void 0&&!N(i)?i:this.initialValues[e]!==void 0&&s===void 0?void 0:this.baseTarget[e]}on(e,a){return this.events[e]||(this.events[e]=new Ta),this.events[e].add(a)}notify(e,...a){this.events[e]&&this.events[e].notify(...a)}scheduleRenderMicrotask(){Wn.render(this.render)}}class xs extends hs{constructor(){super(...arguments),this.KeyframeResolver=qn}sortInstanceNodePosition(e,a){return e.compareDocumentPosition(a)&2?1:-1}getBaseTargetFromProps(e,a){const s=e.style;return s?s[a]:void 0}removeValueFromRenderState(e,{vars:a,style:s}){delete a[e],delete s[e]}handleChildMotionValue(){this.childSubscription&&(this.childSubscription(),delete this.childSubscription);const{children:e}=this.props;N(e)&&(this.childSubscription=e.on("change",a=>{this.current&&(this.current.textContent=`${a}`)}))}}function ir({top:t,left:e,right:a,bottom:s}){return{x:{min:e,max:a},y:{min:t,max:s}}}function nr(t,e){if(!e)return t;const a=e({x:t.left,y:t.top}),s=e({x:t.right,y:t.bottom});return{top:a.y,left:a.x,bottom:s.y,right:s.x}}function rr(t,e){return ir(nr(t.getBoundingClientRect(),e))}const or={x:"translateX",y:"translateY",z:"translateZ",transformPerspective:"perspective"},lr=he.length;function dr(t,e,a){let s="",i=!0;for(let n=0;n<lr;n++){const r=he[n],o=t[r];if(o===void 0)continue;let l=!0;if(typeof o=="number"?l=o===(r.startsWith("scale")?1:0):l=parseFloat(o)===0,!l||a){const c=us(o,Dt[r]);if(!l){i=!1;const d=or[r]||r;s+=`${d}(${c}) `}a&&(e[r]=c)}}return s=s.trim(),a?s=a(e,i?"":s):i&&(s="none"),s}function vs(t,e,a){const{style:s,vars:i,transformOrigin:n}=t;let r=!1,o=!1;for(const l in e){const c=e[l];if(xe.has(l)){r=!0;continue}else if(Oa(l)){i[l]=c;continue}else{const d=us(c,Dt[l]);l.startsWith("origin")?(o=!0,n[l]=d):s[l]=d}}if(e.transform||(r||a?s.transform=dr(e,t.transform,a):s.transform&&(s.transform="none")),o){const{originX:l="50%",originY:c="50%",originZ:d=0}=n;s.transformOrigin=`${l} ${c} ${d}`}}function ys(t,{style:e,vars:a},s,i){const n=t.style;let r;for(r in e)n[r]=e[r];i?.applyProjectionStyles(n,s);for(r in a)n.setProperty(r,a[r])}function ca(t,e){return e.max===e.min?0:t/(e.max-e.min)*100}const Ee={correct:(t,e)=>{if(!e.target)return t;if(typeof t=="string")if(b.test(t))t=parseFloat(t);else return t;const a=ca(t,e.target.x),s=ca(t,e.target.y);return`${a}% ${s}%`}},cr={correct:(t,{treeScale:e,projectionDelta:a})=>{const s=t,i=ne.parse(t);if(i.length>5)return s;const n=ne.createTransformer(t),r=typeof i[0]!="number"?1:0,o=a.x.scale*e.x,l=a.y.scale*e.y;i[0+r]/=o,i[1+r]/=l;const c=be(o,l,.5);return typeof i[2+r]=="number"&&(i[2+r]/=c),typeof i[3+r]=="number"&&(i[3+r]/=c),n(i)}},pr={borderRadius:{...Ee,applyTo:["borderTopLeftRadius","borderTopRightRadius","borderBottomLeftRadius","borderBottomRightRadius"]},borderTopLeftRadius:Ee,borderTopRightRadius:Ee,borderBottomLeftRadius:Ee,borderBottomRightRadius:Ee,boxShadow:cr};function gr(t,{layout:e,layoutId:a}){return xe.has(t)||t.startsWith("origin")||(e||a!==void 0)&&(!!pr[t]||t==="opacity")}function ws(t,e,a){const s=t.style,i=e?.style,n={};if(!s)return n;for(const r in s)(N(s[r])||i&&N(i[r])||gr(r,t)||a?.getValue(r)?.liveStyle!==void 0)&&(n[r]=s[r]);return n}function ur(t){return window.getComputedStyle(t)}class fr extends xs{constructor(){super(...arguments),this.type="html",this.renderInstance=ys}readValueFromInstance(e,a){if(xe.has(a))return this.projection?.isProjecting?lt(a):ji(e,a);{const s=ur(e),i=(Oa(a)?s.getPropertyValue(a):s[a])||0;return typeof i=="string"?i.trim():i}}measureInstanceViewportBox(e,{transformPagePoint:a}){return rr(e,a)}build(e,a,s){vs(e,a,s.transformTemplate)}scrapeMotionValuesFromProps(e,a,s){return ws(e,a,s)}}const mr={offset:"stroke-dashoffset",array:"stroke-dasharray"},br={offset:"strokeDashoffset",array:"strokeDasharray"};function hr(t,e,a=1,s=0,i=!0){t.pathLength=1;const n=i?mr:br;t[n.offset]=b.transform(-s);const r=b.transform(e),o=b.transform(a);t[n.array]=`${r} ${o}`}const xr=["offsetDistance","offsetPath","offsetRotate","offsetAnchor"];function vr(t,{attrX:e,attrY:a,attrScale:s,pathLength:i,pathSpacing:n=1,pathOffset:r=0,...o},l,c,d){if(vs(t,o,c),l){t.style.viewBox&&(t.attrs.viewBox=t.style.viewBox);return}t.attrs=t.style,t.style={};const{attrs:p,style:u}=t;p.transform&&(u.transform=p.transform,delete p.transform),(u.transform||p.transformOrigin)&&(u.transformOrigin=p.transformOrigin??"50% 50%",delete p.transformOrigin),u.transform&&(u.transformBox=d?.transformBox??"fill-box",delete p.transformBox);for(const m of xr)p[m]!==void 0&&(u[m]=p[m],delete p[m]);e!==void 0&&(p.x=e),a!==void 0&&(p.y=a),s!==void 0&&(p.scale=s),i!==void 0&&hr(p,i,n,r,!1)}const ks=new Set(["baseFrequency","diffuseConstant","kernelMatrix","kernelUnitLength","keySplines","keyTimes","limitingConeAngle","markerHeight","markerWidth","numOctaves","targetX","targetY","surfaceScale","specularConstant","specularExponent","stdDeviation","tableValues","viewBox","gradientTransform","pathLength","startOffset","textLength","lengthAdjust"]),yr=t=>typeof t=="string"&&t.toLowerCase()==="svg";function wr(t,e,a,s){ys(t,e,void 0,s);for(const i in e.attrs)t.setAttribute(ks.has(i)?i:$t(i),e.attrs[i])}function kr(t,e,a){const s=ws(t,e,a);for(const i in t)if(N(t[i])||N(e[i])){const n=he.indexOf(i)!==-1?"attr"+i.charAt(0).toUpperCase()+i.substring(1):i;s[n]=t[i]}return s}class Er extends xs{constructor(){super(...arguments),this.type="svg",this.isSVGTag=!1,this.measureInstanceViewportBox=Ft}getBaseTargetFromProps(e,a){return e[a]}readValueFromInstance(e,a){if(xe.has(a)){const s=ps(a);return s&&s.default||0}return a=ks.has(a)?a:$t(a),e.getAttribute(a)}scrapeMotionValuesFromProps(e,a,s){return kr(e,a,s)}build(e,a,s){vr(e,a,this.isSVGTag,s.transformTemplate,s.style)}renderInstance(e,a,s,i){wr(e,a,s,i)}mount(e){this.isSVGTag=yr(e.tagName),super.mount(e)}}function Tr(t,e){return t in e}class Sr extends hs{constructor(){super(...arguments),this.type="object"}readValueFromInstance(e,a){if(Tr(a,e)){const s=e[a];if(typeof s=="string"||typeof s=="number")return s}}getBaseTargetFromProps(){}removeValueFromRenderState(e,a){delete a.output[e]}measureInstanceViewportBox(){return Ft()}build(e,a){Object.assign(e.output,a)}renderInstance(e,{output:a}){Object.assign(e,a)}sortInstanceNodePosition(){return 0}}function Ar(t,e,a){const s=N(t)?t:Be(t);return s.start(rs("",s,e,a)),s.animation}function jt(t){return typeof t=="object"&&!Array.isArray(t)}function Es(t,e,a,s){return typeof t=="string"&&jt(e)?Un(t,a,s):t instanceof NodeList?Array.from(t):Array.isArray(t)?t:[t]}function Cr(t,e,a){return t*(e+1)}function pa(t,e,a,s){return typeof e=="number"?e:e.startsWith("-")||e.startsWith("+")?Math.max(0,t+parseFloat(e)):e==="<"?a:e.startsWith("<")?Math.max(0,a+parseFloat(e.slice(1))):s.get(e)??t}function Ir(t,e,a){for(let s=0;s<t.length;s++){const i=t[s];i.at>e&&i.at<a&&(wa(t,i),s--)}}function Mr(t,e,a,s,i,n){Ir(t,i,n);for(let r=0;r<e.length;r++)t.push({value:e[r],at:be(i,n,s[r]),easing:$a(a,r)})}function Lr(t,e){for(let a=0;a<t.length;a++)t[a]=t[a]/(e+1)}function Br(t,e){return t.at===e.at?t.value===null?1:e.value===null?-1:0:t.at-e.at}const Pr="easeInOut";function Rr(t,{defaultTransition:e={},...a}={},s,i){const n=e.duration||.3,r=new Map,o=new Map,l={},c=new Map;let d=0,p=0,u=0;for(let m=0;m<t.length;m++){const x=t[m];if(typeof x=="string"){c.set(x,p);continue}else if(!Array.isArray(x)){c.set(x.name,pa(p,x.at,d,c));continue}let[y,v,w={}]=x;w.at!==void 0&&(p=pa(p,w.at,d,c));let I=0;const S=(T,h,C,B=0,k=0)=>{const M=Vr(T),{delay:j=0,times:L=Ja(M),type:Q="keyframes",repeat:ee,repeatType:zt,repeatDelay:Ge=0,...ve}=h;let{ease:U=e.ease||"easeOut",duration:z}=h;const De=typeof j=="function"?j(B,k):j,ye=M.length,g=Vt(Q)?Q:i?.[Q||"keyframes"];if(ye<=2&&g){let R=100;if(ye===2&&Fr(M)){const we=M[1]-M[0];R=Math.abs(we)}const re={...ve};z!==void 0&&(re.duration=X(z));const te=Ka(re,R,g);U=te.ease,z=te.duration}z??(z=n);const f=p+De;L.length===1&&L[0]===0&&(L[1]=1);const E=L.length-M.length;if(E>0&&Xa(L,E),M.length===1&&M.unshift(null),ee){z=Cr(z,ee);const R=[...M],re=[...L];U=Array.isArray(U)?[...U]:[U];const te=[...U];for(let we=0;we<ee;we++){M.push(...R);for(let ke=0;ke<R.length;ke++)L.push(re[ke]+(we+1)),U.push(ke===0?"linear":$a(te,ke-1))}Lr(L,ee)}const A=f+z;Mr(C,M,U,L,f,A),I=Math.max(De+z,I),u=Math.max(A,u)};if(N(y)){const T=ga(y,o);S(v,w,ua("default",T))}else{const T=Es(y,v,s,l),h=T.length;for(let C=0;C<h;C++){v=v,w=w;const B=T[C],k=ga(B,o);for(const M in v)S(v[M],$r(w,M),ua(M,k),C,h)}}d=p,p+=I}return o.forEach((m,x)=>{for(const y in m){const v=m[y];v.sort(Br);const w=[],I=[],S=[];for(let h=0;h<v.length;h++){const{at:C,value:B,easing:k}=v[h];w.push(B),I.push(kt(0,u,C)),S.push(k||"easeOut")}I[0]!==0&&(I.unshift(0),w.unshift(w[0]),S.unshift(Pr)),I[I.length-1]!==1&&(I.push(1),w.push(null)),r.has(x)||r.set(x,{keyframes:{},transition:{}});const T=r.get(x);T.keyframes[y]=w,T.transition[y]={...e,duration:u,ease:S,times:I,...a}}}),r}function ga(t,e){return!e.has(t)&&e.set(t,{}),e.get(t)}function ua(t,e){return e[t]||(e[t]=[]),e[t]}function Vr(t){return Array.isArray(t)?t:[t]}function $r(t,e){return t&&t[e]?{...t,...t[e]}:{...t}}const Dr=t=>typeof t=="number",Fr=t=>t.every(Dr);function jr(t){const e={presenceContext:null,props:{},visualState:{renderState:{transform:{},transformOrigin:{},style:{},vars:{},attrs:{}},latestValues:{}}},a=fs(t)&&!Gn(t)?new Er(e):new fr(e);a.mount(t),Pe.set(t,a)}function Or(t){const e={presenceContext:null,props:{},visualState:{renderState:{output:{}},latestValues:{}}},a=new Sr(e);a.mount(t),Pe.set(t,a)}function Nr(t,e){return N(t)||typeof t=="number"||typeof t=="string"&&!jt(e)}function Ts(t,e,a,s){const i=[];if(Nr(t,e))i.push(Ar(t,jt(e)&&e.default||e,a&&(a.default||a)));else{const n=Es(t,e,s),r=n.length;for(let o=0;o<r;o++){const l=n[o],c=l instanceof Element?jr:Or;Pe.has(l)||c(l);const d=Pe.get(l),p={...a};"delay"in p&&typeof p.delay=="function"&&(p.delay=p.delay(o,r)),i.push(...Vn(d,{...e,transition:p},{}))}}return i}function Hr(t,e,a){const s=[];return Rr(t,e,a,{spring:Le}).forEach(({keyframes:n,transition:r},o)=>{s.push(...Ts(o,n,r))}),s}function zr(t){return Array.isArray(t)&&t.some(Array.isArray)}function _r(t){function e(a,s,i){let n=[],r;if(zr(a))n=Hr(a,s,t);else{const{onComplete:l,...c}=i||{};typeof l=="function"&&(r=l),n=Ts(a,s,c,t)}const o=new cn(n);return r&&o.finished.then(r),o}return e}const bt=_r();class qr{modal=null;isOpen=!1;open(e,a){if(this.isOpen)return;const s=`
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
        `;document.body.insertAdjacentHTML("beforeend",s),this.modal=document.getElementById("modal-overlay"),this.isOpen=!0,document.body.style.overflow="hidden";const i=document.getElementById("modal-content");i&&bt(i,{opacity:[0,1],transform:["scale(0.9)","scale(1)"]},{duration:.3}),document.getElementById("modal-close")?.addEventListener("click",()=>this.close()),this.modal?.addEventListener("click",r=>{r.target===this.modal&&this.close()});const n=r=>{r.key==="Escape"&&(this.close(),document.removeEventListener("keydown",n))};document.addEventListener("keydown",n)}close(){if(!this.isOpen||!this.modal)return;const e=document.getElementById("modal-content");e&&bt(e,{opacity:0,transform:"scale(0.9)"},{duration:.2}).finished.then(()=>{this.modal?.remove(),this.modal=null,this.isOpen=!1,document.body.style.overflow=""})}}const We=new qr;class Ur{container;heroEl;designEl;engineEl;constructor(e){if(this.container=document.getElementById(e),!this.container)throw new Error(`HUD container with id ${e} not found`);this.container.innerHTML="",this.heroEl=this.createPhaseElement("hero",`
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
        `;We.open(e,"BATTERY HEALTH PREDICTION")}createPhaseElement(e,a){const s=document.createElement("div");return s.id=`phase-${e}`,s.className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 transition-opacity duration-500",s.innerHTML=a,s}setPhaseOpacity(e,a){bt(e,{opacity:a},{duration:.5})}update(e){if(e<.25)this.setPhaseOpacity(this.heroEl,1),this.setPhaseOpacity(this.designEl,0),this.setPhaseOpacity(this.engineEl,0);else if(e>=.25&&e<.35){const a=(e-.25)/.1;this.setPhaseOpacity(this.heroEl,1-a),this.setPhaseOpacity(this.designEl,a),this.setPhaseOpacity(this.engineEl,0)}else if(e>=.35&&e<.6)this.setPhaseOpacity(this.heroEl,0),this.setPhaseOpacity(this.designEl,1),this.setPhaseOpacity(this.engineEl,0);else if(e>=.6&&e<.7){const a=(e-.6)/.1;this.setPhaseOpacity(this.heroEl,0),this.setPhaseOpacity(this.designEl,1-a),this.setPhaseOpacity(this.engineEl,a)}else this.setPhaseOpacity(this.heroEl,0),this.setPhaseOpacity(this.designEl,0),this.setPhaseOpacity(this.engineEl,1)}}const Wr=[{id:"battery-health",icon:"🔋",title:"AI Battery Health Monitoring",description:"Real-time ML-powered battery degradation analysis and predictive maintenance alerts",category:"ai"},{id:"smart-routing",icon:"🗺️",title:"Intelligent Route Optimization",description:"Traffic-aware energy-efficient routing optimized for Indian road conditions",category:"routing"},{id:"energy-prediction",icon:"⚡",title:"Energy Consumption Prediction",description:"ML models predict range based on driving patterns, terrain, and weather",category:"ai"},{id:"fast-charging",icon:"⚡",title:"800V Ultra-Fast Charging",description:"10-80% charge in 18 minutes with advanced thermal management",category:"battery"},{id:"quad-motor",icon:"🏎️",title:"Quad Motor Torque Vectoring",description:"Independent motor control for each wheel delivering unmatched handling",category:"performance"},{id:"range",icon:"🎯",title:"850 KM Range",description:"Solid-state battery technology with graphene enhancement",category:"battery"},{id:"charging-network",icon:"📍",title:"Smart Charging Network",description:"AI-powered charging station recommendations based on availability and pricing",category:"routing"},{id:"performance",icon:"🚀",title:"0-100 in 2.1s",description:"Hypercar-level acceleration with instant torque delivery",category:"performance"}],Gr=[{id:"1",name:"Vikram Singh",role:"Tech Entrepreneur",company:"Mumbai",content:"The AI-powered battery management is a game-changer. I drive 200km daily and the range prediction is incredibly accurate.",rating:5,image:"/images/testimonials/1.jpg"},{id:"2",name:"Ananya Desai",role:"Business Executive",company:"Bangalore",content:"Smart routing saves me 30 minutes daily on my commute. The traffic-aware navigation is brilliant for Indian roads.",rating:5,image:"/images/testimonials/2.jpg"},{id:"3",name:"Rahul Kapoor",role:"Automotive Journalist",company:"Delhi",content:"This is not just an EV, it's a technological masterpiece. The performance rivals any hypercar I've driven.",rating:5,image:"/images/testimonials/3.jpg"}];class $e{observer;constructor(e=.1){this.observer=new IntersectionObserver(a=>{a.forEach(s=>{s.isIntersecting&&s.target.classList.add("animate-in")})},{threshold:e})}observe(e){this.observer.observe(e)}observeAll(e){document.querySelectorAll(e).forEach(s=>this.observe(s))}disconnect(){this.observer.disconnect()}}function Kr(t,e,a,s=2e3,i=""){const n=Date.now(),r=()=>{const o=Date.now()-n,l=Math.min(o/s,1),c=1-Math.pow(1-l,3),d=Math.floor(e+(a-e)*c);t.textContent=d.toLocaleString()+i,l<1&&requestAnimationFrame(r)};r()}async function Yr(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
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
                    ${Wr.map((o,l)=>`
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
                    ${Gr.map((o,l)=>`
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
    `;const e=new $s("zonda-canvas",241),a=new Ur("zonda-hud"),s=document.querySelector("#scroll-container"),i=()=>{if(!s)return;const o=s.getBoundingClientRect(),l=window.innerHeight,d=s.offsetHeight-l,p=-o.top,u=Math.min(1,Math.max(0,p/d));e.update(u),a.update(u)};window.addEventListener("scroll",i,{passive:!0}),i(),new $e(.1).observeAll(".fade-in-section");const r=new IntersectionObserver(o=>{o.forEach(l=>{if(l.isIntersecting){const c=l.target,d=parseFloat(c.dataset.counter||"0"),p=c.dataset.counter?.includes(".")?"s":"";Kr(c,0,d,2e3,p),r.unobserve(c)}})});document.querySelectorAll("[data-counter]").forEach(o=>{r.observe(o)})}const Xr=[{id:"ceo",name:"Karthik Janardhan",role:"CEO & Founder",image:"/images/ceo.jpg"},{id:"cto",name:"Anushka Kotal",role:"CTO",image:"/images/cto.jpg"},{id:"design",name:"Stash Lopes",role:"Head of Design",image:"/images/design.jpg"},{id:"engineering",name:"Ashwin Vincent Koonissery",role:"Chief Engineer",image:"/images/engineering.jpg"}];async function Jr(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
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
                    ${Xr.map((a,s)=>`
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
    `,new $e(.1).observeAll(".fade-in-section")}const Zr=[{category:"Performance",specs:[{label:"0-100 km/h",value:"2.1 seconds"},{label:"Top Speed",value:"350 km/h"},{label:"Power Output",value:"1,400 kW (1,877 HP)"},{label:"Torque",value:"2,300 Nm"},{label:"Drive Type",value:"Quad Motor AWD"}]},{category:"Battery & Range",specs:[{label:"Battery Capacity",value:"120 kWh"},{label:"Battery Type",value:"Solid-State Graphene"},{label:"Range (WLTP)",value:"850 km"},{label:"Charging",value:"800V Architecture"},{label:"10-80% Charge Time",value:"18 minutes"}]},{category:"Dimensions & Weight",specs:[{label:"Length",value:"4,650 mm"},{label:"Width",value:"2,050 mm"},{label:"Height",value:"1,150 mm"},{label:"Wheelbase",value:"2,750 mm"},{label:"Dry Weight",value:"1,150 kg"}]},{category:"AI & Technology",specs:[{label:"AI Processor",value:"NVIDIA Drive Orin"},{label:"Sensors",value:"12 Cameras, 8 Radars, 4 LiDAR"},{label:"Connectivity",value:"5G, V2X"},{label:"OTA Updates",value:"Full Stack"},{label:"Autonomous Level",value:"Level 3"}]}];async function Qr(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
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
                        <h2 class="text-4xl md:text-5xl font-orbitron font-bold mb-6 cursor-pointer hover:text-pagani-gold transition-colors" id="intelligent-routing-title">INTELLIGENT<br><span class="text-pagani-gold">ROUTING</span></h2>
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
                    ${Zr.map((i,n)=>`
                        <div class="fade-in-section bg-pagani-black border border-white/10 p-8" style="animation-delay: ${n*100}ms">
                            <h3 class="text-2xl font-orbitron font-bold text-pagani-gold mb-6 uppercase tracking-wider">${i.category}</h3>
                            <div class="space-y-4">
                                ${i.specs.map(r=>`
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
                    ${[{title:"Solid-State Battery",desc:"Graphene-enhanced solid-state cells delivering 850km range with superior safety and longevity",icon:"⚡"},{title:"Quad Motor System",desc:"Independent motor control for each wheel enabling precise torque vectoring and unmatched handling",icon:"🏎️"},{title:"800V Architecture",desc:"Ultra-fast charging capability with advanced thermal management for optimal performance",icon:"🔌"}].map((i,n)=>`
                        <div class="fade-in-section bg-gradient-to-br from-pagani-gold/5 to-transparent border border-pagani-gold/30 p-8 hover:border-pagani-gold transition-all group" style="animation-delay: ${n*100}ms">
                            <div class="text-6xl mb-6 group-hover:scale-110 transition-transform">${i.icon}</div>
                            <h3 class="text-2xl font-orbitron font-bold mb-4 group-hover:text-pagani-gold transition-colors">${i.title}</h3>
                            <p class="text-gray-400 leading-relaxed">${i.desc}</p>
                        </div>
                    `).join("")}
                </div>
            </div>
        </section>
    `,new $e(.1).observeAll(".fade-in-section");const a=document.getElementById("battery-health-title");a&&a.addEventListener("click",eo);const s=document.getElementById("intelligent-routing-title");s&&s.addEventListener("click",to)}function eo(){const t=`
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
    `;We.open(t,"BATTERY HEALTH PREDICTION")}function to(){We.open(`
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
    `,"INTELLIGENT ROUTING SYSTEM")}class qe{rules=new Map;addRule(e,a){this.rules.set(e,a)}validate(e){const a=[];return this.rules.forEach((s,i)=>{const n=e.get(i)||"",r=this.validateField(i,n,s);a.push(...r)}),{isValid:a.length===0,errors:a}}validateField(e,a,s){const i=[];return s.required&&!a.trim()?(i.push(`${this.formatFieldName(e)} is required`),i):(a&&s.email&&!this.isValidEmail(a)&&i.push(`${this.formatFieldName(e)} must be a valid email address`),a&&s.phone&&!this.isValidPhone(a)&&i.push(`${this.formatFieldName(e)} must be a valid phone number`),a&&s.minLength&&a.length<s.minLength&&i.push(`${this.formatFieldName(e)} must be at least ${s.minLength} characters`),a&&s.maxLength&&a.length>s.maxLength&&i.push(`${this.formatFieldName(e)} must not exceed ${s.maxLength} characters`),a&&s.pattern&&!s.pattern.test(a)&&i.push(`${this.formatFieldName(e)} format is invalid`),a&&s.custom&&!s.custom(a)&&i.push(`${this.formatFieldName(e)} is invalid`),i)}isValidEmail(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}isValidPhone(e){return/^[\d\s\-\+\(\)]+$/.test(e)&&e.replace(/\D/g,"").length>=10}formatFieldName(e){return e.split(/[-_]/).map(a=>a.charAt(0).toUpperCase()+a.slice(1)).join(" ")}}async function ao(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
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
    `;const e=new qe;e.addRule("name",{required:!0,minLength:2}),e.addRule("email",{required:!0,email:!0}),e.addRule("phone",{phone:!0}),e.addRule("subject",{required:!0}),e.addRule("message",{required:!0,minLength:10});const a=document.getElementById("contact-form");a?.addEventListener("submit",i=>{i.preventDefault();const n=new FormData(a),r=e.validate(n);r.isValid?(alert("Thank you for your message! We will get back to you soon. 🎉"),a.reset()):alert(r.errors.join(`
`))}),document.querySelectorAll(".faq-question").forEach(i=>{i.addEventListener("click",()=>{const r=i.parentElement?.querySelector(".faq-answer"),o=i.querySelector(".faq-icon");r?.classList.contains("hidden")?(r.classList.remove("hidden"),o&&(o.textContent="−")):(r?.classList.add("hidden"),o&&(o.textContent="+"))})}),new $e(.1).observeAll(".fade-in-section")}const fa=[{id:1,category:"exterior",title:"Front View",description:"Aggressive front fascia with LED headlights",src:"/images/gallery/ev_car_front_1768921597944.png"},{id:2,category:"exterior",title:"Side Profile - Black",description:"Midnight black with aerodynamic design",src:"/images/gallery/ev_car_side_black_1768921527957.png"},{id:3,category:"exterior",title:"Side Profile - Gold",description:"Pagani gold metallic finish",src:"/images/gallery/ev_car_side_gold_1768921550995.png"},{id:4,category:"exterior",title:"Side Profile - White",description:"Arctic white with carbon fiber accents",src:"/images/gallery/ev_car_side_white_1768921572922.png"},{id:5,category:"exterior",title:"Rear View",description:"Integrated LED light bar and diffuser",src:"/images/gallery/ev_car_rear_1768921622132.png"},{id:6,category:"interior",title:"Dashboard",description:"Minimalist digital cockpit with OLED displays",src:"/images/gallery/ev_car_interior_dashboard_1768921641324.png"},{id:7,category:"technology",title:"Front Design",description:"Advanced aerodynamics and LED technology",src:"/images/gallery/ev_car_front_1768921597944.png"},{id:8,category:"technology",title:"Rear Technology",description:"Active aero and thermal management",src:"/images/gallery/ev_car_rear_1768921622132.png"},{id:9,category:"interior",title:"Cockpit View",description:"Driver-focused interior design",src:"/images/gallery/ev_car_interior_dashboard_1768921641324.png"}];async function so(){const t=document.getElementById("app");if(!t)return;t.innerHTML=`
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
                    ${fa.map((n,r)=>`
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
    `;const e=document.querySelectorAll(".filter-btn"),a=document.querySelectorAll(".gallery-item"),s=document.getElementById("no-results");e.forEach(n=>{n.addEventListener("click",()=>{e.forEach(l=>{l.classList.remove("active","bg-pagani-gold","text-black"),l.classList.add("border-white/20")}),n.classList.add("active","bg-pagani-gold","text-black"),n.classList.remove("border-white/20");const r=n.getAttribute("data-filter");let o=0;a.forEach(l=>{const c=l.getAttribute("data-category");r==="all"||c===r?(l.classList.remove("hidden"),o++):l.classList.add("hidden")}),o===0?s?.classList.remove("hidden"):s?.classList.add("hidden")})}),a.forEach(n=>{n.addEventListener("click",()=>{const r=n.getAttribute("data-id"),o=fa.find(l=>l.id===parseInt(r||"0"));if(o){const l=`
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
                `;We.open(l)}})}),new $e(.1).observeAll(".fade-in-section")}function Ss(t){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)}function As(t){return t.length>=8}async function io(){const t=document.getElementById("app");if(t){if(!document.querySelector('link[href*="font-awesome"]')){const e=document.createElement("link");e.rel="stylesheet",e.href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",document.head.appendChild(e)}t.innerHTML=`
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
    `,setTimeout(()=>{no()},100)}}function no(){const t=document.getElementById("authContainer"),e=document.getElementById("showRegister"),a=document.getElementById("showLogin"),s=document.getElementById("showRegisterMobile"),i=document.getElementById("showLoginMobile"),n=document.getElementById("loginContainer"),r=document.getElementById("registerContainer");e?.addEventListener("click",()=>{t?.classList.add("right-panel-active")}),a?.addEventListener("click",()=>{t?.classList.remove("right-panel-active")}),s?.addEventListener("click",()=>{n?.classList.add("hidden"),r?.classList.add("active")}),i?.addEventListener("click",()=>{n?.classList.remove("hidden"),r?.classList.remove("active")}),document.getElementById("useDemoBtn")?.addEventListener("click",()=>{t?.classList.remove("right-panel-active"),n?.classList.remove("hidden"),r?.classList.remove("active");const u=D.getDefaultCredentials(),m=document.getElementById("login-email"),x=document.getElementById("login-password"),y=document.getElementById("login-status");if(!u){ue(y,"Demo account is not configured.","error");return}m&&x&&(m.value=u.email,x.value=u.password,m.classList.add("border-pagani-gold"),x.classList.add("border-pagani-gold"),setTimeout(()=>{m.classList.remove("border-pagani-gold"),x.classList.remove("border-pagani-gold")},1e3))}),document.querySelectorAll(".toggle-password").forEach(u=>{u.addEventListener("click",m=>{m.preventDefault();const x=u.parentElement;if(x){const y=x.querySelector("input");if(y){const v=y.type==="password";y.type=v?"text":"password";const w=u.querySelector("i");w&&(w.className=v?"fa-solid fa-eye-slash":"fa-solid fa-eye")}}})});const c=document.getElementById("register-password");c?.addEventListener("input",()=>{ro(c.value)});const d=document.getElementById("loginForm"),p=document.getElementById("registerForm");d?.addEventListener("submit",u=>{u.preventDefault(),oo()}),p?.addEventListener("submit",u=>{u.preventDefault(),lo()}),location.hash==="#register"&&(t?.classList.add("right-panel-active"),n?.classList.add("hidden"),r?.classList.add("active"))}function ro(t){let e=0;t.length>=8&&e++,t.match(/[a-z]/)&&t.match(/[A-Z]/)&&e++,t.match(/\d/)&&e++,t.match(/[@$!%*?&#]/)&&e++;const a=document.querySelectorAll(".strength-bar"),s=document.querySelector(".strength-text"),i=["bg-red-500","bg-orange-500","bg-yellow-500","bg-green-500"],n=["Weak","Fair","Good","Strong"];a.forEach((r,o)=>{r.classList.remove("bg-red-500","bg-orange-500","bg-yellow-500","bg-green-500","bg-gray-600"),o<e?r.classList.add(i[e-1]):r.classList.add("bg-gray-600")}),s&&(s.textContent=e>0?n[e-1]:"Weak",s.className="strength-text text-xs w-14 text-right "+(e===0||e===1?"text-red-400":e===2?"text-orange-400":e===3?"text-yellow-400":"text-green-400"))}function W(t,e){t&&(t.textContent=e,t.style.display="block")}function ht(t){t&&(t.textContent="",t.style.display="none")}function ue(t,e,a){t&&(t.textContent=e,t.className=`form-status show ${a}`)}async function oo(){const t=document.getElementById("login-email"),e=document.getElementById("login-password"),a=document.getElementById("login-email-error"),s=document.getElementById("login-password-error"),i=document.getElementById("login-status");let n=!0;if(ht(a),ht(s),i&&(i.className="form-status"),t.value.trim()?Ss(t.value)||(W(a,"Please enter a valid email"),n=!1):(W(a,"Email is required"),n=!1),e.value.trim()?As(e.value)||(W(s,"Password must be at least 8 characters"),n=!1):(W(s,"Password is required"),n=!1),!n)return;const r=await D.login(t.value,e.value);r.success?(ue(i,"Login successful! Redirecting...","success"),setTimeout(()=>{window.location.href="/dashboard"},1500)):ue(i,r.message,"error")}async function lo(){const t=document.getElementById("register-name"),e=document.getElementById("register-email"),a=document.getElementById("register-password"),s=document.getElementById("register-confirm"),i=document.getElementById("terms-checkbox"),n=document.getElementById("register-name-error"),r=document.getElementById("register-email-error"),o=document.getElementById("register-password-error"),l=document.getElementById("register-confirm-error"),c=document.getElementById("register-status");let d=!0;if([n,r,o,l].forEach(ht),c&&(c.className="form-status"),t.value.trim()||(W(n,"Name is required"),d=!1),e.value.trim()?Ss(e.value)||(W(r,"Please enter a valid email"),d=!1):(W(r,"Email is required"),d=!1),a.value.trim()?As(a.value)||(W(o,"Password must be at least 8 characters"),d=!1):(W(o,"Password is required"),d=!1),a.value!==s.value&&(W(l,"Passwords do not match"),d=!1),i.checked||(ue(c,"Please accept the Terms of Service","error"),d=!1),!d)return;const p=await D.signup(t.value,e.value,a.value);p.success?(ue(c,"Registration successful! Redirecting...","success"),setTimeout(()=>{window.location.href="/dashboard"},1500)):ue(c,p.message,"error")}async function co(){if(!D.isAuthenticated()){window.location.href="/auth";return}const t=document.getElementById("app");if(!t)return;const e=D.getCurrentUser();if(!document.querySelector('link[href*="font-awesome"]')){const a=document.createElement("link");a.rel="stylesheet",a.href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",document.head.appendChild(a)}t.innerHTML=`
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
    `,setTimeout(()=>{po()},100)}function po(){const t=document.getElementById("refresh-dashboard");t?.addEventListener("click",()=>{t.classList.add("animate-spin"),setTimeout(()=>{t.classList.remove("animate-spin")},1e3)});const e=document.getElementById("sos-btn");let a;e?.addEventListener("mousedown",()=>{a=setTimeout(()=>{alert("Emergency SOS activated! Contacting emergency services...")},3e3)}),e?.addEventListener("mouseup",()=>{clearTimeout(a)}),e?.addEventListener("mouseleave",()=>{clearTimeout(a)}),document.getElementById("vehicle-diagnostics")?.addEventListener("click",()=>{alert("Running vehicle diagnostics... All systems operational!")});const i=document.querySelectorAll(".fade-in-section"),n=new IntersectionObserver(r=>{r.forEach(o=>{o.isIntersecting&&o.target.classList.add("animate-fadeInUp")})},{threshold:.1});i.forEach(r=>n.observe(r))}async function go(){if(!D.isAuthenticated()){window.location.href="/auth";return}const t=document.getElementById("app");if(t){if(!document.querySelector('link[href*="font-awesome"]')){const e=document.createElement("link");e.rel="stylesheet",e.href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",document.head.appendChild(e)}t.innerHTML=`
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
    `,setTimeout(()=>{uo()},100)}}function uo(){const t=document.getElementById("cell-grid");if(t){const s=fo(96);t.innerHTML=s.map(i=>{const n=i.health>=95?"bg-green-500":i.health>=85?"bg-yellow-500":i.health>=75?"bg-orange-500":"bg-red-500";return`
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
        `).join("")}const a=document.getElementById("refresh-btn");a?.addEventListener("click",()=>{a.classList.add("animate-spin"),setTimeout(()=>{a.classList.remove("animate-spin"),bo("Battery data refreshed")},1e3)}),mo()}function fo(t){const e=[];for(let a=1;a<=t;a++)e.push({id:a,voltage:3.6+Math.random()*.5,temperature:28+Math.random()*10,health:85+Math.random()*15});return e[23].health=78,e[45].health=82,e[67].health=72,e}function mo(){setInterval(()=>{const t=document.getElementById("soc-display"),e=document.getElementById("battery-fill");if(t&&e){const a=parseInt(t.textContent||"87");if(a<100){const s=Math.min(a+1,100);t.textContent=`${s}%`,e.style.height=`${s}%`;const i=document.getElementById("range-value");i&&(i.textContent=`${Math.round(s*4.5)}km`)}}},5e3)}function bo(t,e){const a=document.createElement("div");a.className="fixed top-24 right-8 px-6 py-4 rounded-lg backdrop-blur-sm z-50 font-orbitron text-sm fade-in-section bg-green-500/20 border border-green-500/50 text-green-400",a.innerHTML=`<i class="fa-solid fa-check-circle mr-2"></i>${t}`,document.body.appendChild(a),setTimeout(()=>a.remove(),3e3)}async function ho(){if(!D.isAuthenticated()){window.location.href="/auth";return}const t=document.getElementById("app");t&&(t.innerHTML=`
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
    `,xo())}function xo(){const t=document.getElementById("battery-input-form"),e=new qe;e.addRule("voltage",{required:!0,custom:l=>parseFloat(l)>=2.5&&parseFloat(l)<=4.2}),e.addRule("current",{required:!0,custom:l=>parseFloat(l)>=-100&&parseFloat(l)<=100}),e.addRule("temperature",{required:!0,custom:l=>parseFloat(l)>=-20&&parseFloat(l)<=60});const a=[];s(),t?.addEventListener("submit",async l=>{l.preventDefault();const c=new FormData(t),d=e.validate(c);if(!d.isValid){Oe(d.errors[0],"error");return}await i(c)});function s(){Object.entries({"scenario-normal":{voltage:3.7,current:-5,temperature:25,cell_age:"fresh",cycle_count:75,age_days:200},"scenario-charging":{voltage:4,current:15,temperature:35,cell_age:"fresh",cycle_count:120,age_days:150},"scenario-cold":{voltage:3.5,current:-3,temperature:-5,cell_age:"fresh",cycle_count:90,age_days:180},"scenario-critical":{voltage:3.1,current:-1,temperature:20,cell_age:"aged",cycle_count:800,age_days:1200}}).forEach(([c,d])=>{document.getElementById(c)?.addEventListener("click",()=>{document.getElementById("voltage-input").value=d.voltage.toString(),document.getElementById("current-input").value=d.current.toString(),document.getElementById("temperature-input").value=d.temperature.toString(),document.getElementById("cell-age-input").value=d.cell_age,document.getElementById("cycle-count-input").value=d.cycle_count.toString(),document.getElementById("age-days-input").value=d.age_days.toString(),Oe(`Applied ${c.split("-")[1]} scenario`,"success")})})}async function i(l){const c=document.getElementById("prediction-loading"),d=document.getElementById("prediction-results");if(!(!c||!d)){c.classList.remove("hidden"),d.innerHTML="";try{const p=await vo({voltage:parseFloat(l.get("voltage")),current:parseFloat(l.get("current")),temperature:parseFloat(l.get("temperature")),cell_age:l.get("cell_age"),cycle_count:parseInt(l.get("cycle_count"))||150,age_days:parseInt(l.get("age_days"))||400});c.classList.add("hidden"),p.status==="success"?(n(p,d),r(p),o()):Oe(p.error||"Prediction failed","error")}catch{c.classList.add("hidden"),Oe("ML model communication error","error")}}}function n(l,c){if(!l.predictions||!l.analysis)return;const{predictions:d,analysis:p}=l,m={LOW:{bg:"bg-green-500/20",border:"border-green-500/50",text:"text-green-400"},MEDIUM:{bg:"bg-yellow-500/20",border:"border-yellow-500/50",text:"text-yellow-400"},CRITICAL:{bg:"bg-red-500/20",border:"border-red-500/50",text:"text-red-400"}}[p.risk_level];c.innerHTML=`
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
        `}setInterval(()=>{const l=document.getElementById("last-update");l&&(l.textContent=new Date().toLocaleTimeString())},3e4)}async function vo(t){try{const e="http://localhost:8000",a={voltage:t.voltage,current:t.current,temperature:t.temperature,cycle_count:t.cycle_count||150,age_days:t.age_days||(t.cell_age==="fresh"?200:800)},s=await fetch(`${e}/predict`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)});if(s.ok){const i=await s.json();return{status:i.status,predictions:i.predictions,analysis:i.analysis,error:i.error}}else throw new Error(`ML API returned ${s.status}`)}catch(e){console.warn("ML API not available, using fallback simulation:",e),await new Promise(w=>setTimeout(w,2e3));const{voltage:a,current:s,temperature:i,cycle_count:n=150,age_days:r=400}=t;let o=Math.max(0,Math.min(100,(a-2.5)/(4.2-2.5)*100)),l=Math.min(30,n/100),c=Math.min(20,r/365*5),d=Math.abs(i-25)*.3,p=100-l-c-d;p=Math.max(50,Math.min(100,p));const u=(l+c)/(n+r/7);let m=Math.max(50,(p-80)/(u+.001)*7);m=Math.max(100,Math.min(3e3,m));const x=(o+p)/2;let y;const v=[];return x>=80?(y="LOW",v.push({type:"Battery Health Excellent",message:"Your battery is operating within optimal parameters.",level:"INFO",recommendation:"Continue current charging habits for maximum lifespan."})):x>=65?(y="MEDIUM",v.push({type:"Moderate Degradation Detected",message:"Battery showing signs of aging but still functional.",level:"WARNING",recommendation:"Avoid extreme temperatures and deep discharge cycles."})):(y="CRITICAL",v.push({type:"Battery Health Critical",message:"Significant degradation detected. Consider replacement.",level:"CRITICAL",recommendation:"Schedule immediate battery inspection and replacement planning."})),i>40?v.push({type:"High Temperature Warning",message:"Battery temperature exceeds safe operating range.",level:"WARNING",recommendation:"Allow battery to cool before charging or heavy usage."}):i<0&&v.push({type:"Cold Temperature Alert",message:"Low temperature may reduce battery performance.",level:"INFO",recommendation:"Pre-condition battery before use in cold weather."}),Math.abs(s)>50&&v.push({type:"High Current Draw",message:"Excessive current may accelerate battery degradation.",level:"WARNING",recommendation:"Reduce power demand or use more conservative driving mode."}),{status:"success",predictions:{SOC:o,SOH:p,RUL:m,confidence:.85+Math.random()*.1},analysis:{overall_health:x,risk_level:y,alerts:v,intelligence_version:"EVBharat AI v2.1",assessment_confidence:Math.round((.85+Math.random()*.1)*100)}}}}function Oe(t,e){const a=document.createElement("div");a.className=`fixed top-24 right-8 px-6 py-4 rounded-lg backdrop-blur-sm z-50 font-orbitron text-sm fade-in-section ${e==="success"?"bg-green-500/20 border border-green-500/50 text-green-400":"bg-red-500/20 border border-red-500/50 text-red-400"}`,a.innerHTML=`<i class="fa-solid ${e==="success"?"fa-check-circle":"fa-exclamation-circle"} mr-2"></i>${t}`,document.body.appendChild(a),setTimeout(()=>a.remove(),3e3)}class yo{baseUrl;constructor(){this.baseUrl="/api/rag",console.log("🔗 Backend via Vite proxy:",this.baseUrl)}async healthCheck(){return(await this.fetchR(`${this.baseUrl}/health`,{method:"GET"})).json()}async freeChat(e){const a=await this.fetchR(`${this.baseUrl}/free-chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:e})});if(!a.ok){const s=await a.json().catch(()=>({detail:"Network error"}));throw new Error(s.detail||"Chat failed")}return a.json()}async uploadPDF(e){const a=new FormData;a.append("file",e);const s=await this.fetchR(`${this.baseUrl}/upload`,{method:"POST",body:a},3);if(!s.ok){const i=await s.json().catch(()=>({detail:"Upload failed"}));throw new Error(i.detail||"Upload failed")}return s.json()}async docChat(e,a){const s=await this.fetchR(`${this.baseUrl}/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:e,session_id:a})});if(!s.ok){const i=await s.json().catch(()=>({detail:"Chat failed"}));throw new Error(i.detail||"Chat failed")}return s.json()}async sessionStatus(e){return(await fetch(`${this.baseUrl}/sessions/${e}/status`)).json()}async deleteSession(e){await fetch(`${this.baseUrl}/sessions/${e}`,{method:"DELETE"})}async fetchR(e,a,s=2){let i=null;for(let n=0;n<=s;n++)try{const r=new AbortController,o=setTimeout(()=>r.abort(),3e4),l=await fetch(e,{...a,signal:r.signal});if(clearTimeout(o),(l.status===429||l.status===503)&&n<s){await this.wait(2**n*1e3);continue}return l}catch(r){i=r,n<s&&await this.wait(2**n*1e3)}throw i||new Error("Request failed after all retries")}wait(e){return new Promise(a=>setTimeout(a,e))}}const ce=new yo,ma=[{icon:"fa-hand-holding-dollar",q:"What subsidies are available under FAME II for e-2W buyers?",color:"rgba(34, 197, 94, 0.15)"},{icon:"fa-file-invoice",q:"List the EV registration & road-tax exemptions in Maharashtra.",color:"rgba(59, 130, 246, 0.15)"},{icon:"fa-battery-full",q:"Explain BIS AIS-156 battery safety standards.",color:"rgba(168, 85, 247, 0.15)"},{icon:"fa-percent",q:"What are the GST rates on EVs vs ICE vehicles?",color:"rgba(245, 158, 11, 0.15)"},{icon:"fa-charging-station",q:"How to get approval for setting up a public EV charging station?",color:"rgba(20, 184, 166, 0.15)"},{icon:"fa-landmark",q:"What is Section 80EEB income-tax benefit on EV loans?",color:"rgba(236, 72, 153, 0.15)"}],Ot="evbharat_chat_history";function ba(t){try{localStorage.setItem(Ot,JSON.stringify(t.map(e=>({...e,timestamp:e.timestamp.toISOString()}))))}catch{}}function wo(){try{const t=localStorage.getItem(Ot);return t?JSON.parse(t).map(e=>({...e,timestamp:new Date(e.timestamp)})):[]}catch{return[]}}function ko(){localStorage.removeItem(Ot)}const ha=()=>Math.random().toString(36).slice(2,10),Se=t=>t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),xa=t=>t.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});function Eo(t){let e=Se(t);return e=e.replace(/```(\w*)\n?([\s\S]*?)```/g,(a,s,i)=>`<div style="position:relative;margin:8px 0"><pre style="background:rgba(0,0,0,.45);border:1px solid rgba(75,85,99,.3);border-radius:8px;padding:12px 14px;overflow-x:auto;font-size:12px;line-height:1.6"><code>${s?`<span style="position:absolute;top:4px;right:8px;font-size:9px;color:#6b7280;text-transform:uppercase">${s}</span>`:""}${i.trim()}</code></pre></div>`),e=e.replace(/`([^`]+)`/g,'<code style="background:rgba(55,65,81,.6);color:rgba(212,175,55,.85);padding:1px 6px;border-radius:4px;font-size:12px">$1</code>'),e=e.replace(/\*\*(.+?)\*\*/g,'<strong style="color:#e5e7eb;font-weight:600">$1</strong>'),e=e.replace(/\*(.+?)\*/g,"<em>$1</em>"),e=e.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener" style="color:#D4AF37;text-decoration:underline">$1</a>'),e=e.replace(/^####\s+(.+)$/gm,'<h5 style="font-weight:600;color:rgba(212,175,55,.8);margin-top:8px;font-size:11px;text-transform:uppercase;letter-spacing:.5px">$1</h5>'),e=e.replace(/^###\s+(.+)$/gm,'<h4 style="font-weight:600;color:#D4AF37;margin-top:10px;font-size:14px">$1</h4>'),e=e.replace(/^##\s+(.+)$/gm,'<h3 style="font-weight:700;color:#D4AF37;margin-top:12px;font-size:16px">$1</h3>'),e=e.replace(/^#\s+(.+)$/gm,'<h2 style="font-weight:700;color:#D4AF37;margin-top:12px;font-size:18px">$1</h2>'),e=e.replace(/^[\-\*]\s+(.+)$/gm,'<li style="margin-left:16px;list-style:disc;color:#d1d5db">$1</li>'),e=e.replace(/^\d+\.\s+(.+)$/gm,'<li style="margin-left:16px;list-style:decimal;color:#d1d5db">$1</li>'),e=e.replace(/^---$/gm,'<hr style="border-color:rgba(75,85,99,.3);margin:12px 0">'),e=e.replace(/\n/g,"<br>"),e}async function To(){if(!D.isAuthenticated()){window.location.href="/auth";return}const t=document.getElementById("app");if(!t)return;const e=wo();let a="free",s=null,i=!1,n=!1,r=null,o=!1;async function l(){try{const g=await ce.healthCheck();return o=g.status==="healthy",c(o,g.active_sessions),o}catch{return o=!1,c(!1,0),!1}}function c(g,f){document.querySelectorAll(".ev-health-dot").forEach(A=>{A.style.background=g?"linear-gradient(135deg, #10b981, #34d399)":"linear-gradient(135deg, #ef4444, #f87171)",A.style.boxShadow=g?"0 0 12px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)":"0 0 12px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",A.style.animation=g?"evPulse 2s infinite":"none"}),document.querySelectorAll(".ev-health-text").forEach(A=>{A.textContent=g?"🟢 Online":"🔴 Offline",A.style.color=g?"#10b981":"#ef4444",A.style.fontWeight="600"});const E=document.getElementById("ev-sessions");E&&(E.textContent=g?`⚡ ${f} active session${f!==1?"s":""}`:"⚠️ Backend unreachable")}function d(){const g=document.getElementById("ev-messages");if(g){if(!e.length){g.innerHTML=p(),u();return}g.innerHTML=e.map(f=>{if(f.role==="system")return`<div style="display:flex;justify-content:center;margin:12px 0"><span style="font-size:11px;color:#6b7280;background:rgba(31,41,55,.6);padding:3px 12px;border-radius:999px"><i class="fa-solid fa-info-circle" style="margin-right:4px;color:#3b82f6"></i>${Se(f.content)}</span></div>`;const E=f.role==="user",A=E?"👤":"🤖";return`
            <div style="display:flex;justify-content:${E?"flex-end":"flex-start"};margin-bottom:16px" class="ev-msg-row">
                ${E?"":`<div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,rgba(212,175,55,.25),rgba(212,175,55,.08));display:flex;align-items:center;justify-content:center;margin-right:10px;margin-top:2px;flex-shrink:0;border:1px solid rgba(212,175,55,.15)"><span style="font-size:12px">${A}</span></div>`}
                <div style="max-width:78%;padding:12px 16px;border-radius:16px;${E?"border-bottom-right-radius:6px;background:linear-gradient(135deg,rgba(212,175,55,.1),rgba(212,175,55,.04));border:1px solid rgba(212,175,55,.18)":"border-bottom-left-radius:6px;background:rgba(31,41,55,.45);border:1px solid rgba(55,65,81,.4)"};box-shadow:0 2px 8px rgba(0,0,0,.15)">
                    <div style="font-size:13px;line-height:1.65;color:${E?"#e5e7eb":"#d1d5db"}">${E?Se(f.content):Eo(f.content)}</div>
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px;padding-top:6px;border-top:1px solid rgba(55,65,81,.2);gap:8px">
                        <span style="font-size:10px;color:#4b5563">🕐 ${xa(f.timestamp)}</span>
                        <div style="display:flex;align-items:center;gap:6px">
                            ${f.processingTime!=null?`<span style="font-size:10px;color:#6b7280"><i class="fa-solid fa-stopwatch" style="margin-right:2px;color:#8b5cf6"></i>${f.processingTime.toFixed(2)}s</span>`:""}
                            ${E?"":`<button data-copy="${f.id}" class="ev-copy" style="opacity:0;font-size:10px;color:#6b7280;cursor:pointer;background:none;border:none;transition:all .15s" title="📋 Copy"><i class="fa-regular fa-copy"></i></button>`}
                        </div>
                    </div>
                </div>
                ${E?`<div style="width:28px;height:28px;border-radius:8px;background:rgba(212,175,55,.12);display:flex;align-items:center;justify-content:center;margin-left:10px;margin-top:2px;flex-shrink:0;border:1px solid rgba(212,175,55,.12)"><span style="font-size:12px">${A}</span></div>`:""}
            </div>`}).join(""),document.querySelectorAll(".ev-copy").forEach(f=>{f.addEventListener("click",()=>{const E=e.find(A=>A.id===f.dataset.copy);E&&navigator.clipboard.writeText(E.content).then(()=>{f.innerHTML='<i class="fa-solid fa-check" style="color:#34d399"></i>',setTimeout(()=>{f.innerHTML='<i class="fa-regular fa-copy"></i>'},1500)})})}),m()}}function p(){return`
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:40px 20px;text-align:center">
            <div style="width:80px;height:80px;border-radius:20px;background:linear-gradient(135deg, #D4AF37, rgba(212,175,55,.6));border:2px solid rgba(212,175,55,.25);display:flex;align-items:center;justify-content:center;margin-bottom:32px;box-shadow:0 8px 32px rgba(212,175,55,.15), inset 0 2px 0 rgba(255,255,255,.1);position:relative;overflow:hidden" class="ev-logo-animate">
                <i class="fa-solid fa-bolt" style="color:#000;font-size:32px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))"></i>
                <div style="position:absolute;inset:0;background:linear-gradient(45deg, transparent 30%, rgba(255,255,255,.1) 50%, transparent 70%);animation:evShimmer 3s infinite"></div>
            </div>
            <h3 style="font-family:'Orbitron',sans-serif;font-size:24px;font-weight:800;margin-bottom:12px;letter-spacing:.5px;background:linear-gradient(135deg, #D4AF37, #FFD700);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 2px 8px rgba(212,175,55,.3)">⚡ EV Compliance Advisor</h3>
            <p style="font-size:15px;color:#c1c7cd;max-width:480px;margin-bottom:8px;line-height:1.5;font-weight:400">🔍 Ask any question about Indian EV regulations, subsidies, licensing, or upload a document for in-depth analysis.</p>
            <p style="font-size:12px;color:#64748b;max-width:420px;margin-bottom:40px;line-height:1.4">🚀 Powered by Google Gemini │ 📊 Knowledge covers FAME II, PM E-DRIVE, PLI, state policies & more</p>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;width:100%;max-width:640px">
                ${ma.map((g,f)=>`
                <button data-chip="${f}" class="ev-chip" style="display:flex;align-items:flex-start;gap:12px;text-align:left;font-size:13px;padding:16px 18px;border-radius:16px;border:1px solid rgba(55,65,81,.3);background:linear-gradient(135deg, rgba(31,41,55,.4), rgba(17,24,39,.6));color:#d1d5db;cursor:pointer;transition:all .3s cubic-bezier(0.4, 0, 0.2, 1);line-height:1.5;position:relative;overflow:hidden;backdrop-filter:blur(8px);box-shadow:0 2px 8px rgba(0,0,0,.1)">
                    <div style="width:32px;height:32px;border-radius:8px;background:${g.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.1)">
                        <i class="fa-solid ${g.icon}" style="color:#D4AF37;font-size:14px"></i>
                    </div>
                    <span style="font-weight:500">${Se(g.q)}</span>
                    <div style="position:absolute;inset:0;background:linear-gradient(135deg, transparent, rgba(212,175,55,.05));opacity:0;transition:opacity .3s"></div>
                </button>`).join("")}
            </div>
        </div>`}function u(){document.querySelectorAll(".ev-chip").forEach(g=>{g.addEventListener("click",()=>{g.style.transform="scale(0.98)",setTimeout(()=>{g.style.transform=""},150),v(ma[+(g.dataset.chip||"0")].q)}),g.addEventListener("mouseenter",()=>{g.style.borderColor="rgba(212,175,55,.4)",g.style.background="linear-gradient(135deg, rgba(212,175,55,.08), rgba(31,41,55,.6))",g.style.color="#f1f5f9",g.style.transform="translateY(-2px)",g.style.boxShadow="0 8px 25px rgba(212,175,55,.15), 0 2px 8px rgba(0,0,0,.1)";const f=g.querySelector("div:last-child");f&&(f.style.opacity="1")}),g.addEventListener("mouseleave",()=>{g.style.borderColor="rgba(55,65,81,.3)",g.style.background="linear-gradient(135deg, rgba(31,41,55,.4), rgba(17,24,39,.6))",g.style.color="#d1d5db",g.style.transform="",g.style.boxShadow="0 2px 8px rgba(0,0,0,.1)";const f=g.querySelector("div:last-child");f&&(f.style.opacity="0")})})}function m(){const g=document.getElementById("ev-messages");g&&requestAnimationFrame(()=>{g.scrollTop=g.scrollHeight})}function x(){const g=document.getElementById("ev-messages");if(!g)return;const f=a==="document"?"🔍 Searching document & analysing…":"🧠 Thinking…";g.insertAdjacentHTML("beforeend",`
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
        </div>`),m()}function y(){document.getElementById("ev-thinking")?.remove()}async function v(g){if(i||!g.trim())return;if(!o&&!await l()){w("assistant","❌ Backend server is offline. Please check if the server is running on port 8001 and try again.");return}const f=document.getElementById("ev-input");f&&(f.value=""),i=!0,I(!1),w("user",g,!1),d(),x();try{const E=a==="document"&&s?await ce.docChat(g,s):await ce.freeChat(g);y(),e.push({id:ha(),role:"assistant",content:E.response,timestamp:new Date,processingTime:E.processing_time})}catch(E){y();const A=E.message,R=A.includes("Failed to fetch")||A.includes("aborted");w("assistant",R?"Unable to reach the backend. Check that the API is running on port 8001.":`Error: ${A}`,!1),R&&(o=!1,c(!1,0))}finally{i=!1,I(!0),d(),ba(e)}}function w(g,f,E=!0){e.push({id:ha(),role:g,content:f,timestamp:new Date}),E&&(d(),ba(e))}function I(g){const f=document.getElementById("ev-send");f&&(f.disabled=!g,f.style.opacity=g?"1":".35")}async function S(g){if(n)return;const f=g.name.toLowerCase(),E=f.endsWith(".pdf"),A=f.match(/\.(jpg|jpeg|png|webp|gif|bmp)$/i);if(!(E||A)){h("Only PDF or image files (JPG, PNG, WebP, GIF, BMP) accepted.","error");return}if(g.size>50*1024*1024){h("File too large (max 50 MB).","error");return}n=!0,h(`Uploading ${g.name}…`,"info"),T(40);try{const R=await ce.uploadPDF(g);s=R.session_id,r=g.name,a="document",T(100);const re=E?"PDF":"Image";h(`${g.name} — ${R.document_count} chunks`,"success"),B();try{const te=await ce.sessionStatus(R.session_id);te.exists&&te.document_count&&C(te)}catch{}w("system",`${re} loaded: ${g.name}. Switched to document mode.`,!1),w("assistant",`I've processed **${g.name}** (${re}) and extracted **${R.document_count}** content chunks.

You can now ask questions about this ${E?"document":"image"}. I'll cross-reference with Indian EV regulations.

**File hash:** \`${R.file_hash.slice(0,12)}…\``)}catch(R){T(0),h(`Upload failed: ${R.message}`,"error")}finally{n=!1}}function T(g){const f=document.getElementById("ev-upload-bar");f&&(f.style.width=`${g}%`,f.style.opacity=g>0?"1":"0")}function h(g,f){const E=document.getElementById("ev-upload-status");if(!E)return;const R={error:{color:"#f87171",icon:"fa-circle-xmark",symbol:"❌"},success:{color:"#34d399",icon:"fa-circle-check",symbol:"✅"},info:{color:"#D4AF37",icon:"fa-spinner fa-spin",symbol:"⏳"}}[f];E.innerHTML=`<div style="display:flex;align-items:center;gap:6px;color:${R.color}"><span style="font-size:12px">${R.symbol}</span><i class="fa-solid ${R.icon}" style="font-size:10px"></i><span style="font-size:11px">${g}</span></div>`}function C(g){const f=document.getElementById("ev-doc-stats");!f||!g.exists||(f.innerHTML=`<div style="font-size:10px;color:#6b7280;margin-top:6px;padding-top:6px;border-top:1px solid rgba(55,65,81,.25)">🧩 <i class="fa-solid fa-puzzle-piece" style="color:rgba(212,175,55,.35);margin-right:4px"></i>${g.document_count} chunks${g.processed_at?` │ ⏰ Processed ${new Date(g.processed_at*1e3).toLocaleTimeString("en-IN")}`:""}</div>`)}function B(){const g=document.getElementById("ev-mode");g&&(a==="document"&&r?(g.innerHTML=`<div style="display:flex;align-items:center;gap:6px;background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.18);border-radius:8px;padding:4px 10px">
                📄 <i class="fa-solid fa-file-pdf" style="color:#34d399;font-size:10px"></i>
                <span style="font-size:11px;color:#6ee7b7;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${Se(r)}</span>
                <button id="ev-rm-doc" style="color:#6b7280;cursor:pointer;background:none;border:none;transition:color .15s" title="🗑️ Remove"><i class="fa-solid fa-xmark" style="font-size:10px"></i></button>
            </div>`,document.getElementById("ev-rm-doc")?.addEventListener("click",k)):g.innerHTML=`<div style="display:flex;align-items:center;gap:6px;background:rgba(212,175,55,.04);border:1px solid rgba(212,175,55,.12);border-radius:8px;padding:4px 10px">
                💬 <i class="fa-solid fa-comments" style="color:#D4AF37;font-size:10px"></i>
                <span style="font-size:11px;color:#9ca3af">Free advisory mode</span>
            </div>`)}function k(){s&&ce.deleteSession(s).catch(()=>{}),s=null,r=null,a="free",B(),h("","info"),T(0);const g=document.getElementById("ev-doc-stats");g&&(g.innerHTML=""),w("system","Document removed. Switched back to free advisory mode.")}function M(){if(!e.length)return;const g=e.filter(A=>A.role!=="system").map(A=>`[${xa(A.timestamp)}] ${A.role==="user"?"You":"EV Advisor"}:
${A.content}
`),f=`EVBharat EV Compliance Advisor — Chat Export
${"=".repeat(50)}
Exported: ${new Date().toLocaleString("en-IN")}
Messages: ${g.length}
${"=".repeat(50)}

${g.join(`
`)}`,E=document.createElement("a");E.href=URL.createObjectURL(new Blob([f],{type:"text/plain"})),E.download=`ev-chat-${Date.now()}.txt`,E.click(),URL.revokeObjectURL(E.href)}function j(){e.length=0,ko(),d()}t.innerHTML=`
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
                            <div style="display:flex;gap:10px">
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
                            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;padding:0 4px">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;const L=document.getElementById("ev-upload-area"),Q=document.getElementById("ev-file-input"),ee=document.getElementById("ev-input"),zt=document.getElementById("ev-send");L.addEventListener("click",()=>Q.click()),L.addEventListener("dragover",g=>{g.preventDefault(),L.style.borderColor="rgba(212,175,55,.5)",L.style.background="linear-gradient(135deg, rgba(212,175,55,.08), rgba(255,215,0,.04))",L.style.transform="scale(1.02)";const f=L.querySelector("i");f&&(f.style.color="#D4AF37",f.style.transform="scale(1.1)")}),L.addEventListener("dragleave",g=>{g.preventDefault(),L.style.borderColor="rgba(212,175,55,.25)",L.style.background="linear-gradient(135deg, rgba(212,175,55,.03), rgba(17,24,39,.3))",L.style.transform="";const f=L.querySelector("i");f&&(f.style.color="#64748b",f.style.transform="")}),L.addEventListener("drop",g=>{g.preventDefault(),L.style.borderColor="rgba(212,175,55,.25)",L.style.background="linear-gradient(135deg, rgba(212,175,55,.03), rgba(17,24,39,.3))",L.style.transform="";const f=L.querySelector("i");f&&(f.style.color="#64748b",f.style.transform=""),g.dataTransfer?.files[0]&&S(g.dataTransfer.files[0])}),Q.addEventListener("change",()=>{Q.files?.[0]&&S(Q.files[0])}),zt.addEventListener("click",()=>v(ee.value.trim())),ee.addEventListener("keydown",g=>{g.key==="Enter"&&!g.shiftKey&&(g.preventDefault(),v(ee.value.trim()))});const Ge=document.getElementById("ev-sidebar"),ve=document.getElementById("ev-overlay"),U=()=>{Ge.classList.add("open"),ve.style.display="block"},z=()=>{Ge.classList.remove("open"),ve.style.display="none"};document.getElementById("ev-sb-toggle")?.addEventListener("click",U),document.getElementById("ev-sb-close")?.addEventListener("click",z),ve.addEventListener("click",z),document.getElementById("ev-export")?.addEventListener("click",M),document.getElementById("ev-clear")?.addEventListener("click",j),document.getElementById("ev-test-connection")?.addEventListener("click",async()=>{w("system","🔍 Testing backend connection...");const g=await l();w("system",g?"✅ Connection successful!":"❌ Connection failed – check console (F12)")}),["ev-export","ev-clear","ev-test-connection"].forEach(g=>{const f=document.getElementById(g);if(f){const E=g==="ev-clear"?"#ef4444":g==="ev-test-connection"?"#3b82f6":"#D4AF37",A=g==="ev-clear"?"239,68,68":g==="ev-test-connection"?"59,130,246":"212,175,55";f.addEventListener("mouseenter",()=>{f.style.color=E,f.style.background=`linear-gradient(135deg, rgba(${A},.1), rgba(${A},.05))`,f.style.borderColor=`rgba(${A},.4)`,f.style.transform="translateY(-1px)",f.style.boxShadow=`0 4px 12px rgba(${A},.15)`}),f.addEventListener("mouseleave",()=>{f.style.color="#9ca3af",f.style.background="linear-gradient(135deg, rgba(31,41,55,.6), rgba(17,24,39,.4))",f.style.borderColor="rgba(75,85,99,.25)",f.style.transform="",f.style.boxShadow="none"})}}),B(),d(),l();const De=setInterval(l,3e4),ye=new MutationObserver(()=>{document.getElementById("ev-messages")||(clearInterval(De),ye.disconnect())});ye.observe(t,{childList:!0})}async function So(){if(!D.isAuthenticated()){window.location.href="/auth";return}const t=document.getElementById("app");if(t){if(!document.querySelector('link[href*="font-awesome"]')){const e=document.createElement("link");e.rel="stylesheet",e.href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",document.head.appendChild(e)}t.innerHTML=`
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
    `,setTimeout(()=>{Lo(),Io()},100)}}let F=null,G=null,xt=null,K=null,Y=null,Qe=null,et=null;const Ao=[{lat:27.9878,lng:76.3867,name:"Tata Power EV Station",address:"NH-48, Neemrana"},{lat:27.875,lng:76.2795,name:"EESL Charging Hub",address:"Behror Service Area"},{lat:27.399,lng:75.971,name:"Fortum Charge Station",address:"Shahpura, NH-48"},{lat:27.0505,lng:75.857,name:"ChargeZone Ultra",address:"Near Jaipur Toll"},{lat:26.945,lng:75.7625,name:"Statiq Hypercharger",address:"Jaipur Ring Road"}],Co=[{featureType:"poi.business",stylers:[{visibility:"off"}]},{featureType:"poi.medical",stylers:[{visibility:"off"}]},{featureType:"poi.school",stylers:[{visibility:"off"}]},{featureType:"road.highway",elementType:"geometry",stylers:[{color:"#4285f4"},{weight:1}]},{featureType:"road.arterial",elementType:"geometry",stylers:[{color:"#34a853"}]}];async function Io(){try{const e=await fetch("/api/maps/key");if(!e.ok)throw new Error(`Key endpoint returned ${e.status}`);const a=await e.json();if(!a.key)throw new Error("No key in response");const s=a.key;if(typeof google>"u"||!google.maps){document.querySelectorAll('script[src*="maps.googleapis.com"]').forEach(n=>n.remove());const i="__evbInitMap_"+Date.now();await new Promise((n,r)=>{window[i]=()=>{delete window[i],n()};const o=document.createElement("script");o.src=`https://maps.googleapis.com/maps/api/js?key=${s}&libraries=places&callback=${i}`,o.async=!0,o.onerror=()=>{delete window[i],r(new Error("Google Maps script failed to load"))},document.head.appendChild(o),setTimeout(()=>r(new Error("Google Maps load timed out")),15e3)})}Mo()}catch(e){console.error("[EVBharat] Google Maps load error:",e),Cs(String(e))}}function Cs(t){const e=document.getElementById("map-loading");e&&(e.innerHTML=`
            <div class="text-center">
                <i class="fa-solid fa-triangle-exclamation text-red-400 text-3xl mb-3"></i>
                <p class="text-red-400 text-sm font-orbitron mb-1">Failed to load map</p>
                <p class="text-gray-500 text-xs">${t}</p>
            </div>`)}function Mo(){const t=document.getElementById("google-map");if(!t){console.error("[EVBharat] #google-map container not found");return}if(typeof google>"u"){console.error("[EVBharat] google is undefined");return}try{F=new google.maps.Map(t,{center:{lat:27.5,lng:76.5},zoom:7,mapTypeId:google.maps.MapTypeId.ROADMAP,styles:Co,disableDefaultUI:!1,zoomControl:!0,zoomControlOptions:{position:google.maps.ControlPosition.RIGHT_TOP},mapTypeControl:!0,mapTypeControlOptions:{style:google.maps.MapTypeControlStyle.HORIZONTAL_BAR,position:google.maps.ControlPosition.TOP_CENTER,mapTypeIds:[google.maps.MapTypeId.ROADMAP,google.maps.MapTypeId.SATELLITE,google.maps.MapTypeId.HYBRID,google.maps.MapTypeId.TERRAIN]},streetViewControl:!0,streetViewControlOptions:{position:google.maps.ControlPosition.RIGHT_TOP},fullscreenControl:!0,fullscreenControlOptions:{position:google.maps.ControlPosition.RIGHT_TOP},scaleControl:!0,gestureHandling:"greedy"}),xt=new google.maps.StreetViewService,G=new google.maps.DirectionsRenderer({map:F,suppressMarkers:!0,polylineOptions:{strokeColor:"#22c55e",strokeWeight:5,strokeOpacity:.9}}),Ao.forEach((a,s)=>{const i=new google.maps.Marker({position:{lat:a.lat,lng:a.lng},map:F,title:`${a.name} - Right-click for Street View`,icon:{path:google.maps.SymbolPath.CIRCLE,scale:s===0?10:8,fillColor:s===0?"#eab308":"#3b82f6",fillOpacity:.95,strokeColor:"#000000",strokeWeight:2}}),n=`
                <div style="color:#000;font-family:sans-serif;padding:4px 0">
                    <strong style="font-size:14px">${a.name}</strong><br>
                    <span style="color:#555;font-size:12px">${a.address}</span>
                    ${s===0?'<br><span style="background:#eab308;color:#000;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:bold;margin-top:4px;display:inline-block">RECOMMENDED STOP</span>':""}
                    <br><small style="color:#888;font-size:10px">Right-click for Street View</small>
                </div>`,r=new google.maps.InfoWindow({content:n});i.addListener("click",()=>r.open(F,i)),Ht(i,{lat:a.lat,lng:a.lng})});const e=document.getElementById("map-loading");e&&(e.style.display="none"),console.log("[EVBharat] Google Map initialized successfully")}catch(e){console.error("[EVBharat] initGoogleMap error:",e),Cs(String(e))}}function Is(t,e){if(!F)return;const a=new google.maps.OverlayView;a.onAdd=function(){const s=document.createElement("div");s.style.cssText="position:absolute;background:#ffffff;color:#1565c0;padding:2px 8px;border-radius:4px;font-size:11px;font-family:Orbitron,sans-serif;white-space:nowrap;border:1px solid rgba(21,101,192,0.3);pointer-events:none;transform:translate(-50%,8px);box-shadow:0 2px 4px rgba(0,0,0,0.1)",s.textContent=e,this.getPanes()?.overlayLayer.appendChild(s),a.draw=function(){const n=this.getProjection().fromLatLngToDivPixel(t.getPosition());n&&(s.style.left=n.x+"px",s.style.top=n.y+"px")}},a.setMap(F)}function Lo(){Bo();const t=document.getElementById("route-options");if(t){const i=[{id:"1",name:"Energy Efficient",distance:268,duration:"4h 15m",energyConsumption:42,chargingStops:1,traffic:"low",recommended:!0},{id:"2",name:"Fastest Route",distance:255,duration:"3h 45m",energyConsumption:48,chargingStops:1,traffic:"high",recommended:!1},{id:"3",name:"Scenic Route",distance:295,duration:"5h 00m",energyConsumption:52,chargingStops:2,traffic:"low",recommended:!1}];t.innerHTML=i.map(n=>`
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
        `).join("")}document.getElementById("calculate-route-btn")?.addEventListener("click",()=>{Po()}),Vo();const s=document.querySelectorAll(".route-option");s.forEach(i=>{i.addEventListener("click",()=>{s.forEach(n=>{n.classList.remove("border-pagani-gold","ring-2","ring-pagani-gold/30"),n.classList.add("border-pagani-gold/20")}),i.classList.remove("border-pagani-gold/20"),i.classList.add("border-pagani-gold","ring-2","ring-pagani-gold/30")})})}function q(t,e){const a=document.createElement("div");a.className=`fixed top-24 right-8 px-6 py-4 rounded-lg backdrop-blur-sm z-50 font-orbitron text-sm fade-in-section ${e==="success"?"bg-green-500/20 border border-green-500/50 text-green-400":"bg-red-500/20 border border-red-500/50 text-red-400"}`,a.innerHTML=`<i class="fa-solid ${e==="success"?"fa-check-circle":"fa-exclamation-circle"} mr-2"></i>${t}`,document.body.appendChild(a),setTimeout(()=>a.remove(),3e3)}function Bo(){setTimeout(()=>{if(typeof google>"u"||!google.maps.places)return;const t=document.getElementById("start-location"),e=document.getElementById("end-location");if(t&&e){const a={componentRestrictions:{country:"IN"},fields:["place_id","geometry","name","formatted_address"],types:["(cities)"]};Qe=new google.maps.places.Autocomplete(t,a),et=new google.maps.places.Autocomplete(e,a),Qe.addListener("place_changed",()=>{const s=Qe.getPlace();s.geometry?.location&&Nt(s.geometry.location,s.name||s.formatted_address||"Origin")}),et.addListener("place_changed",()=>{const s=et.getPlace();s.geometry?.location&&Ms(s.geometry.location,s.name||s.formatted_address||"Destination")}),t.addEventListener("input",s=>{s.target.value.trim()||(K&&(K.setMap(null),K=null),G&&(G.setMap(null),G.setMap(F)),Ue())}),e.addEventListener("input",s=>{s.target.value.trim()||(Y&&(Y.setMap(null),Y=null),G&&(G.setMap(null),G.setMap(F)),Ue())})}},1e3)}function Nt(t,e){if(!F)return;const a={lat:t.lat(),lng:t.lng()};K?(K.setPosition(a),K.setTitle(`${e} - Right-click for Street View`)):(K=new google.maps.Marker({position:a,map:F,title:`${e} - Right-click for Street View`,icon:{path:google.maps.SymbolPath.CIRCLE,scale:12,fillColor:"#22c55e",fillOpacity:1,strokeColor:"#000000",strokeWeight:3}}),Ht(K)),Is(K,e)}function Ms(t,e){if(!F)return;const a={lat:t.lat(),lng:t.lng()};Y?(Y.setPosition(a),Y.setTitle(`${e} - Right-click for Street View`)):(Y=new google.maps.Marker({position:a,map:F,title:`${e} - Right-click for Street View`,icon:{path:google.maps.SymbolPath.CIRCLE,scale:12,fillColor:"#ef4444",fillOpacity:1,strokeColor:"#000000",strokeWeight:3}}),Ht(Y)),Is(Y,e)}function Po(){const t=document.getElementById("calculate-route-btn"),e=document.getElementById("start-location"),a=document.getElementById("end-location");if(!t||!e||!a)return;const s=e.value.trim(),i=a.value.trim();if(!s||!i){q("Please enter both origin and destination","error");return}if(t.innerHTML='<i class="fa-solid fa-spinner animate-spin mr-2"></i> Calculating...',typeof google<"u"&&F&&G){const n=new google.maps.DirectionsService,r=new google.maps.Geocoder;Promise.all([va(r,s),va(r,i)]).then(([o,l])=>{o&&l?(Nt(o.geometry.location,o.formatted_address),Ms(l.geometry.location,l.formatted_address),n.route({origin:o.geometry.location,destination:l.geometry.location,travelMode:google.maps.TravelMode.DRIVING,unitSystem:google.maps.UnitSystem.METRIC},(c,d)=>{if(d===google.maps.DirectionsStatus.OK&&c){G.setDirections(c);const p=c.routes[0]?.legs[0];if(p){const m=Math.round((p.distance?.value??0)/1e3),x=document.querySelector('[data-trip="km"]'),y=document.querySelector('[data-trip="dur"]'),v=document.querySelector('[data-trip="energy"]'),w=document.querySelector('[data-trip="stops"]');x&&(x.textContent=String(m)),y&&(y.textContent=p.duration?.text??"");const I=Math.round(m*.2);v&&(v.textContent=`${I} kWh`);const S=392,T=m>S?Math.ceil((m-S)/300):0;w&&(w.textContent=String(T));const h=document.querySelector(".bg-blue-500\\/10 p");h&&(T===0?(h.innerHTML=`
                                        <i class="fa-solid fa-check-circle mr-1"></i>
                                        Your current range covers this ${m}km trip without charging stops needed.
                                    `,h.parentElement.className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg",h.className="text-xs text-green-400"):(h.innerHTML=`
                                        <i class="fa-solid fa-lightbulb mr-1"></i>
                                        Your ${m}km trip will need ${T} charging stop${T>1?"s":""}.
                                    `,h.parentElement.className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg",h.className="text-xs text-yellow-400"))}const u=new google.maps.LatLngBounds;u.extend(o.geometry.location),u.extend(l.geometry.location),F.fitBounds(u,{top:40,right:40,bottom:40,left:40}),t.innerHTML='<i class="fa-solid fa-check mr-2"></i> Route Calculated!',q(`Route from ${o.address_components?.[0]?.long_name} to ${l.address_components?.[0]?.long_name} calculated`,"success")}else Ro(d);setTimeout(()=>{t.innerHTML='<i class="fa-solid fa-magnifying-glass-location mr-2"></i> Calculate Route'},3e3)})):(t.innerHTML='<i class="fa-solid fa-exclamation-triangle mr-2"></i> Invalid Locations',q("Could not find one or both locations. Please check spelling.","error"),Ue(),setTimeout(()=>{t.innerHTML='<i class="fa-solid fa-magnifying-glass-location mr-2"></i> Calculate Route'},3e3))})}else setTimeout(()=>{t.innerHTML='<i class="fa-solid fa-check mr-2"></i> Route Calculated!',q("Route calculated with fallback method","success"),setTimeout(()=>{t.innerHTML='<i class="fa-solid fa-magnifying-glass-location mr-2"></i> Calculate Route'},2e3)},1500)}function va(t,e){return new Promise(a=>{t.geocode({address:e,componentRestrictions:{country:"IN"}},(s,i)=>{i===google.maps.GeocoderStatus.OK&&s?.[0]?a(s[0]):a(null)})})}function Ro(t){const e=document.getElementById("calculate-route-btn");if(!e)return;let a="Could not calculate route";switch(t){case google.maps.DirectionsStatus.NOT_FOUND:a="One or both locations not found";break;case google.maps.DirectionsStatus.ZERO_RESULTS:a="No route found between these locations";break;case google.maps.DirectionsStatus.OVER_QUERY_LIMIT:a="Too many requests. Please try again later.";break;case google.maps.DirectionsStatus.REQUEST_DENIED:a="Directions request denied";break}e.innerHTML='<i class="fa-solid fa-exclamation-triangle mr-2"></i> Route Failed',q(a,"error"),Ue()}function Ue(){const t=document.querySelector('[data-trip="km"]'),e=document.querySelector('[data-trip="dur"]'),a=document.querySelector('[data-trip="energy"]'),s=document.querySelector('[data-trip="stops"]');t&&(t.textContent="--"),e&&(e.textContent="--"),a&&(a.textContent="-- kWh"),s&&(s.textContent="--");const i=document.querySelector(".bg-green-500\\/10 p, .bg-yellow-500\\/10 p, .bg-blue-500\\/10 p");i&&(i.innerHTML=`
            <i class="fa-solid fa-info-circle mr-1"></i>
            Enter route details to calculate optimal charging strategy.
        `,i.parentElement.className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg",i.className="text-xs text-blue-400")}function Vo(){const t=document.getElementById("start-location");if(t&&!document.getElementById("current-location-btn")){const e=t.parentElement;if(e){const a=document.createElement("button");a.id="current-location-btn",a.type="button",a.className="absolute right-3 top-1/2 -translate-y-1/2 text-pagani-gold hover:text-bright-gold transition-colors",a.innerHTML='<i class="fa-solid fa-location-crosshairs text-sm"></i>',a.title="Use current location",a.addEventListener("click",()=>{"geolocation"in navigator?(a.innerHTML='<i class="fa-solid fa-spinner animate-spin text-sm"></i>',navigator.geolocation.getCurrentPosition(s=>{const i=s.coords.latitude,n=s.coords.longitude;typeof google<"u"&&new google.maps.Geocoder().geocode({location:{lat:i,lng:n}},(o,l)=>{a.innerHTML='<i class="fa-solid fa-location-crosshairs text-sm"></i>',l===google.maps.GeocoderStatus.OK&&o?.[0]?(t.value=o[0].formatted_address,Nt(new google.maps.LatLng(i,n),"Current Location"),q("Current location detected","success")):q("Could not determine address from location","error")})},s=>{a.innerHTML='<i class="fa-solid fa-location-crosshairs text-sm"></i>',q("Location access denied or unavailable","error")})):q("Geolocation not supported by this browser","error")}),e.appendChild(a)}}}function Ht(t,e){t.addListener("rightclick",()=>{const a=t.getPosition();a&&ya({lat:a.lat(),lng:a.lng()})}),t.addListener("dblclick",()=>{const a=t.getPosition();a&&ya({lat:a.lat(),lng:a.lng()})})}function ya(t){!xt||!F||xt.getPanorama({location:t,radius:1e3,source:google.maps.StreetViewSource.DEFAULT},(e,a)=>{if(a===google.maps.StreetViewStatus.OK&&e?.location?.latLng){const s=F.getStreetView();s.setPosition(e.location.latLng),s.setPov({heading:0,pitch:0}),s.setVisible(!0),q("Street View opened. Click the X or press Esc to return.","success")}else q("No Street View coverage at this location.","error")})}async function $o(){if(!D.isAuthenticated()){window.location.href="/auth";return}const t=document.getElementById("app");if(t){if(!document.querySelector('link[href*="font-awesome"]')){const e=document.createElement("link");e.rel="stylesheet",e.href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",document.head.appendChild(e)}t.innerHTML=`
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
    `,setTimeout(()=>{Do()},100)}}function Do(){const t=[{id:"1",type:"critical",category:"battery",title:"Battery Cell Degradation Detected",message:"Cell #67 showing abnormal degradation (72% health). Recommend immediate inspection to prevent further battery pack damage.",timestamp:"10 minutes ago",read:!1,actionable:!0,action:"Schedule Service"},{id:"2",type:"warning",category:"battery",title:"High Battery Temperature",message:"Battery temperature reached 42°C during fast charging. Reduced charging speed to protect battery longevity.",timestamp:"25 minutes ago",read:!1,actionable:!1},{id:"3",type:"warning",category:"safety",title:"Lane Departure Warning",message:"Multiple lane departures detected in the last trip. Driver attention monitoring activated.",timestamp:"1 hour ago",read:!1,actionable:!1},{id:"4",type:"info",category:"v2e",title:"V2E Connection Established",message:"Successfully connected to nearby traffic infrastructure via VLC. Real-time traffic signal data now available.",timestamp:"1 hour ago",read:!0,actionable:!1},{id:"5",type:"warning",category:"safety",title:"Obstacle Detected Ahead",message:"Stationary vehicle detected 200m ahead on NH-48. Proceed with caution.",timestamp:"2 hours ago",read:!0,actionable:!1},{id:"6",type:"info",category:"v2e",title:"Emergency Vehicle Approaching",message:"V2E alert: Ambulance approaching from rear. Please make way.",timestamp:"3 hours ago",read:!0,actionable:!1},{id:"7",type:"success",category:"battery",title:"Charging Complete",message:"Battery fully charged to 100%. Total energy added: 58 kWh. Ready for 450 km range.",timestamp:"4 hours ago",read:!0,actionable:!1},{id:"8",type:"info",category:"maintenance",title:"Scheduled Maintenance Reminder",message:"Your vehicle is due for scheduled maintenance in 45 days. Book your service appointment.",timestamp:"1 day ago",read:!0,actionable:!0,action:"Book Now"},{id:"9",type:"info",category:"system",title:"Software Update Available",message:"EVBharat OS v3.2.1 is available. Includes improved battery management and new V2E features.",timestamp:"2 days ago",read:!0,actionable:!0,action:"Update Now"}];Fo(t),jo(),Oo(),Ho(t)}function Fo(t){const e=document.getElementById("alerts-list");if(!e)return;const a=i=>{switch(i){case"critical":return{bg:"from-red-900/30 to-red-900/10",border:"border-red-500/50",icon:"fa-circle-exclamation",iconColor:"text-red-400"};case"warning":return{bg:"from-yellow-900/30 to-yellow-900/10",border:"border-yellow-500/50",icon:"fa-triangle-exclamation",iconColor:"text-yellow-400"};case"info":return{bg:"from-blue-900/30 to-blue-900/10",border:"border-blue-500/50",icon:"fa-circle-info",iconColor:"text-blue-400"};case"success":return{bg:"from-green-900/30 to-green-900/10",border:"border-green-500/50",icon:"fa-circle-check",iconColor:"text-green-400"}}},s=i=>{switch(i){case"battery":return"fa-car-battery";case"safety":return"fa-shield-halved";case"v2e":return"fa-tower-broadcast";case"emergency":return"fa-truck-medical";case"maintenance":return"fa-wrench";case"system":return"fa-gear"}};e.innerHTML=t.map((i,n)=>{const r=a(i.type),o=s(i.category);return`
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
        `}).join("")}function jo(){const t=document.querySelectorAll(".alert-filter");t.forEach(e=>{e.addEventListener("click",()=>{t.forEach(i=>{i.classList.remove("active","bg-pagani-gold","text-black"),i.classList.add("bg-pagani-black/50","text-white")}),e.classList.add("active","bg-pagani-gold","text-black"),e.classList.remove("bg-pagani-black/50","text-white");const a=e.getAttribute("data-filter");document.querySelectorAll(".alert-item").forEach(i=>{const n=i.getAttribute("data-category");a==="all"||n===a?i.style.display="block":i.style.display="none"})})})}function Oo(){const t=document.getElementById("sos-btn");if(!t)return;let e=null,a=!1;t.addEventListener("mousedown",()=>{a=!0,t.innerHTML='<i class="fa-solid fa-spinner animate-spin mr-2"></i> HOLD 3 SECONDS...',e=setTimeout(()=>{a&&(t.innerHTML='<i class="fa-solid fa-check mr-2"></i> SOS ACTIVATED!',t.classList.remove("bg-red-600","hover:bg-red-500","animate-pulse"),t.classList.add("bg-green-600"),No())},3e3)}),t.addEventListener("mouseup",()=>{a=!1,e&&(clearTimeout(e),t.innerHTML='<i class="fa-solid fa-circle-exclamation mr-2"></i> EMERGENCY SOS')}),t.addEventListener("mouseleave",()=>{a=!1,e&&(clearTimeout(e),t.innerHTML='<i class="fa-solid fa-circle-exclamation mr-2"></i> EMERGENCY SOS')})}function No(){const t=document.createElement("div");t.className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4 fade-in-section",t.innerHTML=`
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
    `,document.body.appendChild(t),t.querySelector("#cancel-sos")?.addEventListener("click",()=>{t.remove();const a=document.getElementById("sos-btn");a&&(a.innerHTML='<i class="fa-solid fa-circle-exclamation mr-2"></i> EMERGENCY SOS',a.classList.remove("bg-green-600"),a.classList.add("bg-red-600","hover:bg-red-500","animate-pulse"))})}function Ho(t){document.getElementById("mark-all-read")?.addEventListener("click",()=>{t.forEach(a=>a.read=!0),document.querySelectorAll(".alert-item").forEach(a=>{a.classList.remove("ring-2","ring-white/10")}),document.querySelectorAll(".alert-item .w-2.h-2.bg-pagani-gold").forEach(a=>{a.remove()}),zo("All alerts marked as read")})}function zo(t,e){const a=document.createElement("div");a.className="fixed top-24 right-8 px-6 py-4 rounded-lg backdrop-blur-sm z-50 font-orbitron text-sm fade-in-section bg-green-500/20 border border-green-500/50 text-green-400",a.innerHTML=`<i class="fa-solid fa-check-circle mr-2"></i>${t}`,document.body.appendChild(a),setTimeout(()=>a.remove(),3e3)}function _o(){const t=D.getCurrentUser();if(!t){window.location.href="/auth";return}const e=document.getElementById("app");e.innerHTML=`
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
    `,qo()}function qo(){const t=document.querySelectorAll(".profile-tab"),e=document.querySelectorAll(".tab-content");t.forEach(i=>{i.addEventListener("click",()=>{const n=i.dataset.tab;t.forEach(o=>o.classList.remove("active")),e.forEach(o=>{o.classList.remove("active"),o.classList.add("hidden")}),i.classList.add("active");const r=document.getElementById(`${n}-tab`);r&&(r.classList.add("active"),r.classList.remove("hidden"))})});const a=new qe;a.addRule("firstName",{required:!0,minLength:2}),a.addRule("lastName",{required:!0,minLength:2}),a.addRule("email",{required:!0,email:!0}),a.addRule("phone",{phone:!0});const s=new qe;s.addRule("currentPassword",{required:!0,minLength:6}),s.addRule("newPassword",{required:!0,minLength:8}),s.addRule("confirmPassword",{required:!0}),Wo(a,s),Go(),Yo(),Uo()}async function Uo(){const t=await D.fetchProfile();if(!t.success||!t.data)return;const{profile:e,preferences:a,vehicle:s}=t.data,i=(n,r)=>{const o=document.getElementById(n);o&&r&&(o.value=r)};if(e&&(i("phone",e.phone),i("dateOfBirth",e.date_of_birth),i("address",e.address),i("city",e.city),i("state",e.state)),a){const n=(r,o)=>{const l=document.getElementById(r);l&&(l.checked=o)};n("emailNotifications",a.emailNotifications),n("batteryAlerts",a.batteryAlerts),n("maintenanceAlerts",a.maintenanceAlerts),n("twoFactor",a.twoFactorEnabled),i("distanceUnit",a.distanceUnit),i("temperatureUnit",a.temperatureUnit),i("language",a.language)}s&&(i("vehicleMake",s.make),i("vehicleModel",s.model),i("vehicleYear",s.year?.toString()),i("batteryCapacity",s.batteryCapacity?.toString()),i("range",s.rangeKm?.toString()),i("vehicleNotes",s.notes),Array.isArray(s.chargingTypes)&&s.chargingTypes.forEach(n=>{const r=document.querySelector(`input[name="chargingType"][value="${n}"]`);r&&(r.checked=!0)}))}function Wo(t,e){const a=document.getElementById("personal-form");a?.addEventListener("submit",async r=>{r.preventDefault();const o=new FormData(a),l=t.validate(o);if(!l.isValid){V(l.errors.join(", "),"error");return}V("Processing...","info");try{const c=await D.updateProfile({firstName:o.get("firstName"),lastName:o.get("lastName"),email:o.get("email"),phone:o.get("phone"),dateOfBirth:o.get("dateOfBirth"),address:o.get("address"),city:o.get("city"),state:o.get("state")});c.success?(V(c.message,"success"),setTimeout(()=>window.location.reload(),1500)):V(c.message,"error")}catch{V("Failed to update information. Please try again.","error")}});const s=document.getElementById("security-form");s?.addEventListener("submit",async r=>{r.preventDefault();const o=new FormData(s),l=e.validate(o);if(!l.isValid){V(l.errors.join(", "),"error");return}const c=o.get("currentPassword"),d=o.get("newPassword"),p=o.get("confirmPassword");if(d!==p){V("Passwords do not match","error");return}V("Updating security settings...","info");try{const u=await D.updatePassword(c,d);u.success?(V(u.message,"success"),s.reset()):V(u.message,"error")}catch{V("Failed to update security settings. Please try again.","error")}}),document.getElementById("preferences-form")?.addEventListener("submit",async r=>{r.preventDefault(),V("Saving preferences...","info");try{const o=await D.updatePreferences({emailNotifications:document.getElementById("emailNotifications")?.checked??!0,batteryAlerts:document.getElementById("batteryAlerts")?.checked??!0,maintenanceAlerts:document.getElementById("maintenanceAlerts")?.checked??!0,distanceUnit:document.getElementById("distanceUnit")?.value??"km",temperatureUnit:document.getElementById("temperatureUnit")?.value??"celsius",language:document.getElementById("language")?.value??"en",twoFactorEnabled:document.getElementById("twoFactor")?.checked??!1});o.success?V(o.message,"success"):V(o.message,"error")}catch{V("Failed to save preferences. Please try again.","error")}});const n=document.getElementById("vehicle-form");n?.addEventListener("submit",async r=>{r.preventDefault(),V("Saving vehicle information...","info");try{const o=n.querySelectorAll('input[name="chargingType"]:checked'),l=Array.from(o).map(d=>d.value),c=await D.updateVehicle({make:document.getElementById("vehicleMake")?.value??"",model:document.getElementById("vehicleModel")?.value??"",year:parseInt(document.getElementById("vehicleYear")?.value)||null,batteryCapacity:parseFloat(document.getElementById("batteryCapacity")?.value)||null,rangeKm:parseFloat(document.getElementById("range")?.value)||null,chargingTypes:l,notes:document.getElementById("vehicleNotes")?.value??""});c.success?V(c.message,"success"):V(c.message,"error")}catch{V("Failed to save vehicle information. Please try again.","error")}})}function Go(){const t=document.getElementById("newPassword"),e=document.getElementById("password-strength");t?.addEventListener("input",a=>{const s=a.target.value,i=Ko(s);e&&(e.style.width=`${i.percentage}%`,e.className=`h-2 rounded-full transition-all duration-300 ${i.colorClass}`)})}function Ko(t){let e=0;t.length>=8&&(e+=25),/[a-z]/.test(t)&&(e+=25),/[A-Z]/.test(t)&&(e+=25),/[0-9]/.test(t)&&(e+=25),/[^A-Za-z0-9]/.test(t)&&(e+=25);let a="bg-red-500";return e>=75?a="bg-green-500":e>=50?a="bg-yellow-500":e>=25&&(a="bg-orange-500"),{percentage:Math.min(100,e),colorClass:a}}function Yo(){document.getElementById("change-avatar-btn")?.addEventListener("click",()=>{V("Avatar upload feature coming soon!","info")})}function V(t,e){const a=document.getElementById("profile-message");if(!a)return;const s=e==="success"?"bg-green-500/20 border-green-500/30 text-green-400":e==="error"?"bg-red-500/20 border-red-500/30 text-red-400":"bg-blue-500/20 border-blue-500/30 text-blue-400";a.className=`mb-6 p-4 rounded-lg border ${s}`,a.textContent=t,a.classList.remove("hidden"),(e==="success"||e==="info")&&setTimeout(()=>{a.classList.add("hidden")},3e3)}window.togglePassword=function(t){const e=document.getElementById(t),a=e?.nextElementSibling?.querySelector("i");e&&a&&(e.type==="password"?(e.type="text",a.className="fa-solid fa-eye-slash"):(e.type="password",a.className="fa-solid fa-eye"))};async function Xo(){const t=document.getElementById("app");t&&(t.innerHTML=`
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
    `)}const Jo=new Vs;document.addEventListener("DOMContentLoaded",async()=>{new Ps,new Rs,O.register("/","EVBharat | AI-Powered EV Intelligence",Yr),O.register("/about","About Us | EVBharat",Jr),O.register("/technology","Technology | EVBharat",Qr),O.register("/contact","Contact Us | EVBharat",ao),O.register("/gallery","Gallery | EVBharat",so),O.register("/auth","Login | EVBharat",io),O.register("/dashboard","Dashboard | EVBharat",co),O.register("/battery","Battery Management | EVBharat",go),O.register("/battery-analytics","AI Battery Analytics | EVBharat",ho),O.register("/rag-chat","AI Assistant | EVBharat",To),O.register("/map","Route Planner | EVBharat",So),O.register("/alerts","Alerts | EVBharat",$o),O.register("/profile","Profile | EVBharat",_o),O.register("/404","404 Not Found | EVBharat",Xo),O.init(),setTimeout(()=>{Jo.hide()},1500)});
