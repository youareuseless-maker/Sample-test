// FixMate App - Complete JavaScript Implementation
class FixMateApp {
    constructor() {
        // Supabase configuration
        this.supabaseUrl = 'https://mzxiyjkujfrnpwtucleg.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16eGl5amt1amZybnB3dHVjbGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0Mjk1MjMsImV4cCI6MjA3NDAwNTUyM30.3D6JQTu1oaYOPBne_AN7ZzlmYX-GuKIOwiXKHQfYmno';
        
        // Initialize Supabase client
        this.supabase = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
        
        // App data
        this.currentUser = null;
        this.currentScreen = 'splash-screen';
        this.onboardingStep = 0;
        this.authMode = 'login';
        
        // Service data
        this.serviceCategories = [
            {id: 1, name: "Plumbing", icon: "🔧", requests: 1250, avgRating: 4.8},
            {id: 2, name: "Electrical", icon: "⚡", requests: 980, avgRating: 4.7},
            {id: 3, name: "Cleaning", icon: "🧹", requests: 2100, avgRating: 4.9},
            {id: 4, name: "Carpentry", icon: "🔨", requests: 750, avgRating: 4.6},
            {id: 5, name: "Painting", icon: "🎨", requests: 650, avgRating: 4.5},
            {id: 6, name: "HVAC", icon: "❄️", requests: 420, avgRating: 4.8}
        ];
        
        this.featuredProviders = [
            {id: 1, name: "Mike Johnson", service: "Plumbing", rating: 4.9, reviews: 156, distance: "0.8 miles", price: "$45/hr", experience: "8 years", availability: "Available now"},
            {id: 2, name: "Sarah Chen", service: "Electrical", rating: 4.8, reviews: 203, distance: "1.2 miles", price: "$55/hr", experience: "12 years", availability: "Available in 30 min"},
            {id: 3, name: "David Rodriguez", service: "Cleaning", rating: 5.0, reviews: 89, distance: "0.5 miles", price: "$35/hr", experience: "5 years", availability: "Available now"},
            {id: 4, name: "Lisa Thompson", service: "Carpentry", rating: 4.7, reviews: 124, distance: "2.1 miles", price: "$50/hr", experience: "10 years", availability: "Available tomorrow"}
        ];
        
        this.onboardingSlides = [
            {title: "Request Services", description: "Find and book trusted local service providers instantly", icon: "📱"},
            {title: "Track Progress", description: "Monitor your service provider's arrival and progress in real-time", icon: "📍"},
            {title: "Rate & Review", description: "Share your experience and help others find the best providers", icon: "⭐"},
            {title: "Get Started", description: "Join thousands of satisfied customers today", icon: "🚀"}
        ];
        
        this.statusSteps = [
            {id: 1, title: "Request Received", description: "Your service request has been submitted", completed: true},
            {id: 2, title: "Provider Assigned", description: "A service provider has been matched", completed: true},
            {id: 3, title: "Provider En Route", description: "Provider is on the way to your location", completed: false},
            {id: 4, title: "Service In Progress", description: "Work has started at your location", completed: false},
            {id: 5, title: "Service Completed", description: "Work completed successfully", completed: false}
        ];
        
        // Sample requests data
        this.sampleRequests = [
            {
                id: 1,
                service: "Plumbing",
                description: "Fix kitchen sink leak",
                status: "in-progress",
                date: "2025-09-21",
                address: "123 Main St, City",
                provider: "Mike Johnson"
            },
            {
                id: 2,
                service: "Electrical",
                description: "Install ceiling fan",
                status: "pending",
                date: "2025-09-22",
                address: "456 Oak Ave, City",
                provider: null
            }
        ];
        
        // Sample chat messages
        this.sampleMessages = [
            {id: 1, text: "Hi! I'm on my way to your location.", sent: false, timestamp: new Date()},
            {id: 2, text: "Great! How long will it take?", sent: true, timestamp: new Date()},
            {id: 3, text: "About 15 minutes. I'll text when I arrive.", sent: false, timestamp: new Date()}
        ];
        
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        this.showSplashScreen();
        
        // Check for existing session
        const { data: { session } } = await this.supabase.auth.getSession();
        if (session) {
            this.currentUser = session.user;
            setTimeout(() => this.showScreen('home-screen'), 2000);
        } else {
            setTimeout(() => this.showScreen('onboarding-screen'), 2000);
        }
        
        this.setupAuthStateListener();
    }
    
    setupEventListeners() {
        // Onboarding
        document.getElementById('next-btn').addEventListener('click', () => this.nextOnboardingSlide());
        document.getElementById('skip-btn').addEventListener('click', () => this.showScreen('auth-screen'));
        
        // Auth
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchAuthMode(e.target.dataset.mode));
        });
        document.getElementById('auth-form').addEventListener('submit', (e) => this.handleAuth(e));
        
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleNavigation(e.target.dataset.screen));
        });
        
        // Back buttons
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => this.goBack());
        });
        
        // Service interactions
        document.getElementById('new-request-btn').addEventListener('click', () => this.showScreen('request-screen'));
        document.getElementById('service-request-form').addEventListener('submit', (e) => this.handleServiceRequest(e));
        document.getElementById('chat-btn').addEventListener('click', () => this.showScreen('chat-screen'));
        
        // Chat
        document.getElementById('send-btn').addEventListener('click', () => this.sendMessage());
        document.getElementById('message-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        // Profile
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());
        document.getElementById('profile-btn').addEventListener('click', () => this.showScreen('profile-screen'));
        
        // Service cards (will be added dynamically)
        this.setupDynamicEventListeners();
    }
    
    setupDynamicEventListeners() {
        // These will be set up when content is rendered
        document.addEventListener('click', (e) => {
            if (e.target.closest('.service-card')) {
                this.showScreen('request-screen');
            }
            if (e.target.closest('.category-card')) {
                this.showScreen('request-screen');
            }
            if (e.target.closest('.request-item')) {
                this.showRequestDetails(e.target.closest('.request-item').dataset.id);
            }
        });
    }
    
    async setupAuthStateListener() {
        this.supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                this.currentUser = session.user;
                this.showScreen('home-screen');
                this.renderHomeContent();
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.showScreen('auth-screen');
            }
        });
    }
    
    showSplashScreen() {
        // Already shown by default, just ensure it's visible
        this.currentScreen = 'splash-screen';
    }
    
    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;
        
        // Update navigation
        this.updateNavigation(screenId);
        
        // Load screen-specific content
        this.loadScreenContent(screenId);
    }
    
    updateNavigation(screenId) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-screen="${screenId.replace('-screen', '')}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }
    
    loadScreenContent(screenId) {
        switch (screenId) {
            case 'home-screen':
                this.renderHomeContent();
                break;
            case 'services-screen':
                this.renderServicesContent();
                break;
            case 'requests-screen':
                this.renderRequestsContent();
                break;
            case 'profile-screen':
                this.renderProfileContent();
                break;
            case 'request-screen':
                this.renderRequestForm();
                break;
            case 'chat-screen':
                this.renderChatContent();
                break;
        }
    }
    
    nextOnboardingSlide() {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');
        const nextBtn = document.getElementById('next-btn');
        
        // Hide current slide
        slides[this.onboardingStep].classList.remove('active');
        dots[this.onboardingStep].classList.remove('active');
        
        this.onboardingStep++;
        
        if (this.onboardingStep < slides.length) {
            // Show next slide
            slides[this.onboardingStep].classList.add('active');
            dots[this.onboardingStep].classList.add('active');
            
            // Update button text for last slide
            if (this.onboardingStep === slides.length - 1) {
                nextBtn.textContent = 'Get Started';
            }
        } else {
            // Go to auth screen
            this.showScreen('auth-screen');
        }
    }
    
    switchAuthMode(mode) {
        this.authMode = mode;
        
        // Update toggle buttons
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        // Show/hide confirm password field
        const confirmGroup = document.getElementById('confirm-password-group');
        const submitBtn = document.getElementById('auth-submit-btn');
        
        if (mode === 'signup') {
            confirmGroup.style.display = 'block';
            submitBtn.textContent = 'Sign Up';
        } else {
            confirmGroup.style.display = 'none';
            submitBtn.textContent = 'Login';
        }
    }
    
    async handleAuth(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const errorDiv = document.getElementById('auth-error');
        
        // Clear previous errors
        errorDiv.textContent = '';
        
        if (this.authMode === 'signup' && password !== confirmPassword) {
            errorDiv.textContent = 'Passwords do not match';
            return;
        }
        
        try {
            let result;
            
            if (this.authMode === 'signup') {
                result = await this.supabase.auth.signUp({
                    email,
                    password
                });
                
                if (result.error) throw result.error;
                
                if (result.data.user && !result.data.user.email_confirmed_at) {
                    errorDiv.textContent = 'Please check your email to confirm your account';
                    errorDiv.style.color = '#16a34a';
                    return;
                }
            } else {
                result = await this.supabase.auth.signInWithPassword({
                    email,
                    password
                });
                
                if (result.error) throw result.error;
            }
            
            // Success - user will be redirected by auth state listener
            
        } catch (error) {
            errorDiv.textContent = error.message || 'An error occurred during authentication';
            errorDiv.style.color = '#dc2626';
        }
    }
    
    renderHomeContent() {
        this.renderServiceGrid();
        this.renderProviderList();
        
        if (this.currentUser) {
            document.querySelector('.header-content h1').textContent = `Welcome back!`;
            document.getElementById('profile-name').textContent = this.currentUser.email || 'User';
            document.getElementById('profile-email').textContent = this.currentUser.email || '';
        }
    }
    
    renderServiceGrid() {
        const container = document.getElementById('service-grid');
        container.innerHTML = '';
        
        this.serviceCategories.forEach(service => {
            const card = document.createElement('div');
            card.className = 'service-card';
            card.innerHTML = `
                <div class="service-icon">${service.icon}</div>
                <div class="service-name">${service.name}</div>
                <div class="service-stats">${service.requests} requests • ${service.avgRating} ★</div>
            `;
            container.appendChild(card);
        });
    }
    
    renderProviderList() {
        const container = document.getElementById('provider-list');
        container.innerHTML = '';
        
        this.featuredProviders.forEach(provider => {
            const card = document.createElement('div');
            card.className = 'provider-card';
            card.innerHTML = `
                <div class="provider-header">
                    <div class="profile-avatar"></div>
                    <div>
                        <div class="provider-name">${provider.name}</div>
                        <div class="provider-rating">★ ${provider.rating} (${provider.reviews} reviews)</div>
                    </div>
                </div>
                <div class="provider-details">
                    <div><span class="info-label">Service:</span> ${provider.service}</div>
                    <div><span class="info-label">Distance:</span> ${provider.distance}</div>
                    <div><span class="info-label">Price:</span> ${provider.price}</div>
                    <div><span class="info-label">Experience:</span> ${provider.experience}</div>
                </div>
                <div class="provider-availability">${provider.availability}</div>
            `;
            container.appendChild(card);
        });
    }
    
    renderServicesContent() {
        const container = document.getElementById('service-categories');
        container.innerHTML = '';
        
        this.serviceCategories.forEach(category => {
            const card = document.createElement('div');
            card.className = 'category-card';
            card.innerHTML = `
                <div class="category-icon">${category.icon}</div>
                <div class="category-name">${category.name}</div>
                <div class="category-stats">${category.requests} requests • ${category.avgRating} ★ rating</div>
            `;
            container.appendChild(card);
        });
    }
    
    renderRequestsContent() {
        const container = document.getElementById('request-list');
        container.innerHTML = '';
        
        if (this.sampleRequests.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #707070;">
                    <p>No service requests yet.</p>
                    <button class="btn btn--primary" onclick="app.showScreen('request-screen')">Create Your First Request</button>
                </div>
            `;
            return;
        }
        
        this.sampleRequests.forEach(request => {
            const item = document.createElement('div');
            item.className = 'request-item';
            item.dataset.id = request.id;
            
            const statusClass = request.status.replace('-', '');
            const statusText = request.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            item.innerHTML = `
                <div class="request-header">
                    <div class="request-title">${request.service} Service</div>
                    <div class="request-status ${statusClass}">${statusText}</div>
                </div>
                <div class="request-meta">
                    <div>${request.description}</div>
                    <div style="margin-top: 0.5rem; font-size: 0.75rem;">
                        ${request.date} • ${request.address}
                        ${request.provider ? ` • Provider: ${request.provider}` : ''}
                    </div>
                </div>
            `;
            container.appendChild(item);
        });
    }
    
    renderProfileContent() {
        if (this.currentUser) {
            document.getElementById('profile-name').textContent = this.currentUser.user_metadata?.full_name || 'User';
            document.getElementById('profile-email').textContent = this.currentUser.email;
        }
    }
    
    renderRequestForm() {
        const select = document.getElementById('service-type');
        select.innerHTML = '<option value="">Select a service</option>';
        
        this.serviceCategories.forEach(service => {
            const option = document.createElement('option');
            option.value = service.name;
            option.textContent = service.name;
            select.appendChild(option);
        });
        
        // Set minimum date to today
        const dateInput = document.getElementById('service-date');
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        dateInput.value = today;
    }
    
    async handleServiceRequest(e) {
        e.preventDefault();
        
        const formData = {
            service_type: document.getElementById('service-type').value,
            description: document.getElementById('service-description').value,
            preferred_date: document.getElementById('service-date').value,
            preferred_time: document.getElementById('service-time').value,
            address: document.getElementById('service-address').value,
            user_id: this.currentUser?.id,
            status: 'pending',
            created_at: new Date().toISOString()
        };
        
        try {
            // In a real app, this would save to Supabase
            // For demo, we'll add to our sample data
            const newRequest = {
                id: this.sampleRequests.length + 1,
                service: formData.service_type,
                description: formData.description,
                status: 'pending',
                date: formData.preferred_date,
                address: formData.address,
                provider: null
            };
            
            this.sampleRequests.unshift(newRequest);
            
            // Show success message
            alert('Service request submitted successfully!');
            
            // Navigate to requests screen
            this.showScreen('requests-screen');
            
        } catch (error) {
            console.error('Error creating service request:', error);
            alert('Failed to create service request. Please try again.');
        }
    }
    
    showRequestDetails(requestId) {
        const request = this.sampleRequests.find(r => r.id == requestId);
        if (!request) return;
        
        // Update status steps based on request status
        const statusSteps = [...this.statusSteps];
        if (request.status === 'in-progress') {
            statusSteps[0].completed = true;
            statusSteps[1].completed = true;
            statusSteps[2].completed = true;
        } else if (request.status === 'completed') {
            statusSteps.forEach(step => step.completed = true);
        }
        
        // Render status tracker
        const container = document.getElementById('status-steps');
        container.innerHTML = '';
        
        statusSteps.forEach((step, index) => {
            const stepEl = document.createElement('div');
            stepEl.className = 'status-step';
            stepEl.innerHTML = `
                <div class="step-indicator ${step.completed ? 'completed' : ''}">${step.completed ? '✓' : index + 1}</div>
                <div class="step-content">
                    <div class="step-title">${step.title}</div>
                    <div class="step-description">${step.description}</div>
                </div>
            `;
            container.appendChild(stepEl);
        });
        
        // Render request info
        const requestInfo = document.getElementById('request-info');
        requestInfo.innerHTML = `
            <div class="info-title">Request Details</div>
            <div class="info-row">
                <span class="info-label">Service:</span>
                <span class="info-value">${request.service}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Description:</span>
                <span class="info-value">${request.description}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Date:</span>
                <span class="info-value">${request.date}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Address:</span>
                <span class="info-value">${request.address}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value">${request.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            </div>
        `;
        
        // Render provider info
        const providerInfo = document.getElementById('provider-info');
        if (request.provider) {
            const provider = this.featuredProviders.find(p => p.name === request.provider);
            providerInfo.innerHTML = `
                <div class="info-title">Provider Details</div>
                <div class="info-row">
                    <span class="info-label">Name:</span>
                    <span class="info-value">${provider.name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Rating:</span>
                    <span class="info-value">★ ${provider.rating} (${provider.reviews} reviews)</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Experience:</span>
                    <span class="info-value">${provider.experience}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Price:</span>
                    <span class="info-value">${provider.price}</span>
                </div>
            `;
        } else {
            providerInfo.innerHTML = `
                <div class="info-title">Provider Details</div>
                <p style="color: #707070; text-align: center; padding: 1rem;">
                    No provider assigned yet. We're finding the best match for you.
                </p>
            `;
        }
        
        this.showScreen('request-details-screen');
    }
    
    renderChatContent() {
        const container = document.getElementById('chat-messages');
        container.innerHTML = '';
        
        this.sampleMessages.forEach(message => {
            const messageEl = document.createElement('div');
            messageEl.className = `message ${message.sent ? 'sent' : 'received'}`;
            messageEl.textContent = message.text;
            container.appendChild(messageEl);
        });
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }
    
    sendMessage() {
        const input = document.getElementById('message-input');
        const text = input.value.trim();
        
        if (!text) return;
        
        // Add message to chat
        const newMessage = {
            id: this.sampleMessages.length + 1,
            text,
            sent: true,
            timestamp: new Date()
        };
        
        this.sampleMessages.push(newMessage);
        
        // Clear input
        input.value = '';
        
        // Re-render chat
        this.renderChatContent();
        
        // Simulate response after 2 seconds
        setTimeout(() => {
            const response = {
                id: this.sampleMessages.length + 1,
                text: "Thanks for your message! I'll get back to you soon.",
                sent: false,
                timestamp: new Date()
            };
            this.sampleMessages.push(response);
            this.renderChatContent();
        }, 2000);
    }
    
    handleNavigation(screen) {
        const screenMap = {
            'home': 'home-screen',
            'services': 'services-screen',
            'requests': 'requests-screen',
            'profile': 'profile-screen'
        };
        
        this.showScreen(screenMap[screen]);
    }
    
    goBack() {
        // Simple back navigation logic
        const backMap = {
            'services-screen': 'home-screen',
            'request-screen': 'home-screen',
            'request-details-screen': 'requests-screen',
            'chat-screen': 'request-details-screen'
        };
        
        const targetScreen = backMap[this.currentScreen] || 'home-screen';
        this.showScreen(targetScreen);
    }
    
    async logout() {
        try {
            await this.supabase.auth.signOut();
        } catch (error) {
            console.error('Error logging out:', error);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FixMateApp();
});