// =====================================================
// SHARED UTILITIES & DATA MANAGER
// AI Attendance System
// =====================================================

// ===== DATA MANAGER (Centralized LocalStorage) =====
const DataManager = {
    // Keys
    KEYS: {
        STUDENTS: 'ai_attendance_students',
        SUBJECTS: 'ai_attendance_subjects',
        ATTENDANCE: 'ai_attendance_records'
    },

    // Initialize Data (if empty)
    init: function () {
        if (!localStorage.getItem(this.KEYS.STUDENTS)) {
            const defaultStudents = [
                { id: 1, rollNo: '001', name: 'Rahul Sharma', class: '12-A', email: 'rahul@example.com', phone: '+91 9876543210', department: 'Science' },
                { id: 2, rollNo: '002', name: 'Priya Singh', class: '11-B', email: 'priya@example.com', phone: '+91 9876543211', department: 'Commerce' }
            ];
            localStorage.setItem(this.KEYS.STUDENTS, JSON.stringify(defaultStudents));
        }

        if (!localStorage.getItem(this.KEYS.SUBJECTS)) {
            const defaultSubjects = [
                { id: 1, code: 'MAT101', name: 'Mathematics', class: '12-A' },
                { id: 2, code: 'PHY101', name: 'Physics', class: '12-A' }
            ];
            localStorage.setItem(this.KEYS.SUBJECTS, JSON.stringify(defaultSubjects));
        }

        if (!localStorage.getItem(this.KEYS.ATTENDANCE)) {
            localStorage.setItem(this.KEYS.ATTENDANCE, JSON.stringify([]));
        }
    },

    // --- STUDENTS ---
    getStudents: function () {
        return JSON.parse(localStorage.getItem(this.KEYS.STUDENTS) || '[]');
    },
    saveStudents: function (students) {
        localStorage.setItem(this.KEYS.STUDENTS, JSON.stringify(students));
    },
    addStudent: function (student) {
        const students = this.getStudents();
        student.id = Date.now(); // Unique ID
        students.push(student);
        this.saveStudents(students);
    },
    deleteStudent: function (id) {
        let students = this.getStudents();
        students = students.filter(s => s.id != id);
        this.saveStudents(students);
    },

    // --- SUBJECTS ---
    getSubjects: function () {
        return JSON.parse(localStorage.getItem(this.KEYS.SUBJECTS) || '[]');
    },
    saveSubjects: function (subjects) {
        localStorage.setItem(this.KEYS.SUBJECTS, JSON.stringify(subjects));
    },
    addSubject: function (subject) {
        const subjects = this.getSubjects();
        subject.id = Date.now();
        subjects.push(subject);
        this.saveSubjects(subjects);
    },
    deleteSubject: function (id) {
        let subjects = this.getSubjects();
        subjects = subjects.filter(s => s.id != id);
        this.saveSubjects(subjects);
    },

    // --- ATTENDANCE ---
    getAttendance: function () {
        return JSON.parse(localStorage.getItem(this.KEYS.ATTENDANCE) || '[]');
    },
    addAttendance: function (record) {
        const records = this.getAttendance();
        record.id = Date.now();
        record.timestamp = new Date().toISOString();
        records.push(record);
        localStorage.setItem(this.KEYS.ATTENDANCE, JSON.stringify(records));
    },
    deleteAttendance: function (id) {
        let records = this.getAttendance();
        records = records.filter(r => r.id != id);
        localStorage.setItem(this.KEYS.ATTENDANCE, JSON.stringify(records));
    },
    updateAttendance: function (updatedRecord) {
        let records = this.getAttendance();
        const index = records.findIndex(r => r.id == updatedRecord.id);
        if (index !== -1) {
            records[index] = updatedRecord;
            localStorage.setItem(this.KEYS.ATTENDANCE, JSON.stringify(records));
        }
    },

    // Reset Data
    resetAll: function () {
        localStorage.removeItem(this.KEYS.STUDENTS);
        localStorage.removeItem(this.KEYS.SUBJECTS);
        localStorage.removeItem(this.KEYS.ATTENDANCE);
        this.init();
        location.reload();
    }
};

// Initialize Data on Load
DataManager.init();

// ===== CAMERA UTILITIES =====
const CameraUtils = {
    stream: null,

    startCamera: async function (videoElementId) {
        const video = document.getElementById(videoElementId);
        if (!video) {
            console.error("Video element not found:", videoElementId);
            return false;
        }

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = this.stream;
            video.play();
            return true;
        } catch (err) {
            console.error("Error accessing camera:", err);
            showToast("Could not access camera. Please ensure you have allowed camera permissions.", "error");
            return false;
        }
    },

    stopCamera: function () {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    },

    captureSnapshot: function (videoElementId) {
        const video = document.getElementById(videoElementId);
        if (!video || !video.srcObject) return null;

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        return canvas.toDataURL('image/png');
    }
};

// ===== UI UTILITIES =====
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(10, 10, 31, 0.95);
        border-left: 4px solid ${type === 'success' ? '#00ff88' : type === 'error' ? '#ff006e' : '#00d4ff'};
        color: #fff;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        font-family: 'Rajdhani', sans-serif;
    `;

    let icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showLoading(message = 'Processing...') {
    const loader = document.createElement('div');
    loader.id = 'globalLoader';
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        backdrop-filter: blur(5px);
        z-index: 99999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #00d4ff;
        font-family: 'Orbitron', sans-serif;
    `;
    loader.innerHTML = `
        <div class="spinner" style="
            width: 50px; 
            height: 50px; 
            border: 3px solid rgba(0, 212, 255, 0.3); 
            border-top-color: #00d4ff; 
            border-radius: 50%; 
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;">
        </div>
        <div>${message}</div>
    `;
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.getElementById('globalLoader');
    if (loader) loader.remove();
}

// Global Animation Keyframes
const styleSheet = document.createElement("style");
styleSheet.innerText = `
    @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    @keyframes spin { to { transform: rotate(360deg); } }
`;
document.head.appendChild(styleSheet);

// Initialize Particles (Shared)
document.addEventListener('DOMContentLoaded', () => {
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        particlesContainer.innerHTML = ''; // Clear existing
        for (let i = 0; i < 30; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDelay = Math.random() * 5 + 's';
            p.style.animationDuration = (Math.random() * 10 + 10) + 's';
            particlesContainer.appendChild(p);
        }
    }
});

// Logout Function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = 'index.html';
    }
}
