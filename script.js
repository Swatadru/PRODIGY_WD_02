class NeoChron {
    constructor() {
        this.startTime = 0;
        this.elapsedTime = 0;
        this.isRunning = false;
        this.laps = [];
        this.animationId = null;
        
        // DOM Elements
        this.hoursElement = document.getElementById('hours');
        this.minutesElement = document.getElementById('minutes');
        this.secondsElement = document.getElementById('seconds');
        this.millisecondsElement = document.getElementById('milliseconds');
        this.mainBtn = document.getElementById('mainBtn');
        this.lapBtn = document.getElementById('lapBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.lapsContainer = document.getElementById('lapsContainer');
        this.lapCount = document.getElementById('lapCount');
        this.themeBtn = document.getElementById('themeBtn');
        this.appContainer = document.querySelector('.app-container');
        
        // Initialize
        this.setupEventListeners();
        this.updateDisplay();
    }
    
    setupEventListeners() {
        this.mainBtn.addEventListener('click', () => this.toggle());
        this.lapBtn.addEventListener('click', () => this.recordLap());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.themeBtn.addEventListener('click', () => this.toggleTheme());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.toggle();
            } else if (e.code === 'KeyL' && !this.lapBtn.disabled) {
                this.recordLap();
            } else if (e.code === 'KeyR') {
                this.reset();
            } else if (e.code === 'KeyT') {
                this.toggleTheme();
            }
        });
    }
    
    toggle() {
        if (this.isRunning) {
            this.stop();
        } else {
            this.start();
        }
    }
    
    start() {
        if (!this.isRunning) {
            this.startTime = Date.now() - this.elapsedTime;
            this.isRunning = true;
            this.updateTimer();
            
            // Update UI
            this.mainBtn.innerHTML = '<i class="fas fa-stop"></i><span>Stop</span>';
            this.mainBtn.style.backgroundColor = 'var(--error)';
            this.lapBtn.disabled = false;
        }
    }
    
    stop() {
        if (this.isRunning) {
            cancelAnimationFrame(this.animationId);
            this.isRunning = false;
            
            // Update UI
            this.mainBtn.innerHTML = '<i class="fas fa-play"></i><span>Start</span>';
            this.mainBtn.style.backgroundColor = 'var(--primary-accent)';
        }
    }
    
    reset() {
        this.stop();
        this.elapsedTime = 0;
        this.laps = [];
        this.updateDisplay();
        this.renderLaps();
        this.lapCount.textContent = '0';
        this.lapBtn.disabled = true;
    }
    
    recordLap() {
        if (this.elapsedTime > 0) {
            const totalTime = this.elapsedTime;
            const lapTime = this.laps.length > 0 ? 
                totalTime - this.laps[this.laps.length - 1].totalTime : 
                totalTime;
            
            this.laps.push({
                number: this.laps.length + 1,
                time: lapTime,
                totalTime: totalTime
            });
            
            this.renderLaps();
            this.lapCount.textContent = this.laps.length;
        }
    }
    
    updateTimer() {
        this.elapsedTime = Date.now() - this.startTime;
        this.updateDisplay();
        
        if (this.isRunning) {
            this.animationId = requestAnimationFrame(() => this.updateTimer());
        }
    }
    
    updateDisplay() {
        const date = new Date(this.elapsedTime);
        
        this.hoursElement.textContent = date.getUTCHours().toString().padStart(2, '0');
        this.minutesElement.textContent = date.getUTCMinutes().toString().padStart(2, '0');
        this.secondsElement.textContent = date.getUTCSeconds().toString().padStart(2, '0');
        this.millisecondsElement.textContent = date.getUTCMilliseconds().toString().padStart(3, '0');
    }
    
    renderLaps() {
        if (this.laps.length === 0) {
            this.lapsContainer.innerHTML = '<div class="no-laps">Press Lap to record times</div>';
            return;
        }
        
        // Find fastest and slowest laps
        const lapTimes = this.laps.map(lap => lap.time);
        const fastestLap = Math.min(...lapTimes);
        const slowestLap = Math.max(...lapTimes);
        
        this.lapsContainer.innerHTML = '';
        
        this.laps.slice().reverse().forEach(lap => {
            const lapElement = document.createElement('div');
            lapElement.className = 'lap-item';
            
            // Calculate difference from previous lap
            let difference = '';
            if (lap.number > 1) {
                const prevLap = this.laps[lap.number - 2];
                const diff = lap.time - prevLap.time;
                const absDiff = Math.abs(diff);
                const formattedDiff = this.formatTime(absDiff, true).slice(1);
                
                if (diff > 0) {
                    difference = `+${formattedDiff}`;
                } else if (diff < 0) {
                    difference = `-${formattedDiff}`;
                } else {
                    difference = `±${formattedDiff}`;
                }
            }
            
            // Determine if this is fastest or slowest lap
            let lapClass = '';
            if (lap.time === fastestLap && this.laps.length > 1) {
                lapClass = 'fastest';
            } else if (lap.time === slowestLap && this.laps.length > 1) {
                lapClass = 'slowest';
            }
            
            lapElement.innerHTML = `
                <div class="lap-number">${lap.number}</div>
                <div class="lap-time ${lapClass}">${this.formatTime(lap.time, true)}</div>
                <div class="lap-difference">${difference}</div>
            `;
            
            this.lapsContainer.appendChild(lapElement);
        });
    }
    
    formatTime(time, includeHours = false) {
        const date = new Date(time);
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const seconds = date.getUTCSeconds().toString().padStart(2, '0');
        const milliseconds = date.getUTCMilliseconds().toString().padStart(3, '0').slice(0, 2);
        
        return includeHours || hours !== '00' ? 
            `${hours}:${minutes}:${seconds}.${milliseconds}` :
            `${minutes}:${seconds}.${milliseconds}`;
    }
    
    toggleTheme() {
        const currentTheme = this.appContainer.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.appContainer.setAttribute('data-theme', newTheme);
        
        // Update theme icon
        const icon = this.themeBtn.querySelector('i');
        icon.className = newTheme === 'dark' ? 'fas fa-palette' : 'fas fa-palette';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NeoChron();
});