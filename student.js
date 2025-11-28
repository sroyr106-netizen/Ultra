// =====================================================
// STUDENT DASHBOARD - JAVASCRIPT
// AI Attendance System
// =====================================================

// ===== STUDENT DATA (Demo User) =====
const studentInfo = {
    id: '1',
    name: 'Rahul Sharma',
    rollNo: '001',
    class: '12-A',
    email: 'rahul@example.com',
    phone: '+91 9876543210',
    department: 'Science'
};

// ===== ATTENDANCE HISTORY =====
// Fetch from DataManager and filter for this student
function getStudentAttendance() {
    const allRecords = DataManager.getAttendance();
    // Filter by Roll No
    let studentRecords = allRecords.filter(r => r.rollNo === studentInfo.rollNo);

    // If no records found, show some demo data or empty
    if (studentRecords.length === 0) {
        return [];
    }

    // Sort by date (newest first)
    return studentRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

let attendanceHistory = getStudentAttendance();

// ===== STATISTICS CALCULATION =====
function calculateStatistics() {
    const totalClasses = attendanceHistory.length;
    const presentClasses = attendanceHistory.filter(a => a.status === 'Present').length;
    const absentClasses = attendanceHistory.filter(a => a.status === 'Absent').length;
    const lateClasses = attendanceHistory.filter(a => a.status === 'Late').length;
    const overallPercentage = Math.round((presentClasses / totalClasses) * 100);

    return {
        overall: overallPercentage,
        total: totalClasses,
        attended: presentClasses,
        missed: absentClasses + lateClasses
    };
}

// ===== UPDATE STATS DISPLAY =====
function updateStatsDisplay() {
    const stats = calculateStatistics();

    const statCards = document.querySelectorAll('.quick-stat-card .stat-value-large');
    if (statCards.length >= 4) {
        statCards[0].textContent = stats.overall + '%';
        statCards[1].textContent = stats.total;
        statCards[2].textContent = stats.attended;
        statCards[3].textContent = stats.missed;
    }
}

// ===== RENDER ATTENDANCE TIMELINE =====
// ===== RENDER ATTENDANCE TIMELINE =====
function renderAttendanceTimeline() {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;

    timeline.innerHTML = '';

    if (attendanceHistory.length === 0) {
        timeline.innerHTML = '<div style="text-align:center; color:rgba(255,255,255,0.5); padding:2rem;">No attendance records found.</div>';
        return;
    }

    attendanceHistory.forEach((record, index) => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.style.animationDelay = `${index * 0.1}s`;

        const statusClass = record.status === 'Present' ? 'status-present' :
            record.status === 'Absent' ? 'status-absent' : 'status-late';

        const statusIcon = record.status === 'Present' ? 'fa-check-circle' :
            record.status === 'Absent' ? 'fa-times-circle' : 'fa-exclamation-triangle';

        // Parse Timestamp
        const dateObj = new Date(record.timestamp || Date.now());
        const dateStr = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        // Defaults
        const professor = record.professor || 'AI System';
        const type = record.type || 'Face Scan';

        item.innerHTML = `
            <div class="timeline-header">
                <h3 class="timeline-subject">${record.subject}</h3>
                <span class="timeline-status ${statusClass}">
                    <i class="fas ${statusIcon}"></i> ${record.status}
                </span>
            </div>
            <div class="timeline-details">
                <div class="timeline-detail">
                    <i class="fas fa-calendar"></i>
                    <span>${dateStr}</span>
                </div>
                <div class="timeline-detail">
                    <i class="fas fa-clock"></i>
                    <span>${timeStr}</span>
                </div>
                <div class="timeline-detail">
                    <i class="fas fa-user"></i>
                    <span>${professor}</span>
                </div>
                <div class="timeline-detail">
                    <i class="fas fa-book"></i>
                    <span>${type}</span>
                </div>
            </div>
        `;

        timeline.appendChild(item);
    });
}

// ===== FILTER ATTENDANCE =====
function filterAttendance(filterType) {
    let filtered = [...attendanceHistory];

    switch (filterType) {
        case 'present':
            filtered = attendanceHistory.filter(a => a.status === 'Present');
            break;
        case 'absent':
            filtered = attendanceHistory.filter(a => a.status === 'Absent');
            break;
        case 'late':
            filtered = attendanceHistory.filter(a => a.status === 'Late');
            break;
        case 'week':
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filtered = attendanceHistory.filter(a => new Date(a.date) >= weekAgo);
            break;
        case 'month':
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            filtered = attendanceHistory.filter(a => new Date(a.date) >= monthAgo);
            break;
    }

    return filtered;
}

// ===== SEARCH ATTENDANCE =====
function searchAttendance(query) {
    const filtered = attendanceHistory.filter(record =>
        record.subject.toLowerCase().includes(query.toLowerCase()) ||
        record.professor.toLowerCase().includes(query.toLowerCase()) ||
        record.date.includes(query)
    );

    return filtered;
}

// ===== DATE FORMATTING =====
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// ===== THEME TOGGLE =====
let isDarkMode = true;

function toggleTheme() {
    isDarkMode = !isDarkMode;
    const themeBtn = document.querySelector('.theme-toggle i');
    const body = document.body;

    if (isDarkMode) {
        themeBtn.className = 'fas fa-moon';
        body.classList.remove('light-mode');
        showToast('🌙 Dark mode activated', 'info');
    } else {
        themeBtn.className = 'fas fa-sun';
        body.classList.add('light-mode');
        showToast('☀️ Light mode activated', 'info');
    }
}

// ===== ACCOUNT SETTINGS =====
function openSettings() {
    showNotification('⚙️ Settings', 'Account settings panel coming soon!');
}

function updateProfile() {
    showToast('Profile update feature coming soon!', 'info');
}

function changePassword() {
    showToast('Password change feature coming soon!', 'info');
}

// ===== DOWNLOAD ATTENDANCE REPORT =====
function downloadReport(format) {
    showLoading(`Generating ${format.toUpperCase()} report...`);

    setTimeout(() => {
        hideLoading();

        if (format === 'pdf') {
            showToast('📄 PDF report downloaded!', 'success');
        } else if (format === 'csv') {
            // Generate CSV
            let csv = 'Subject,Date,Time,Professor,Status\n';
            attendanceHistory.forEach(record => {
                csv += `${record.subject},${record.date},${record.time},${record.professor},${record.status}\n`;
            });

            // Download
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance_${studentInfo.rollNo}_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();

            showToast('📊 CSV report downloaded!', 'success');
        }
    }, 2000);
}

// ===== ANALYTICS CHARTS =====
function initializeStudentCharts() {
    if (typeof Chart === 'undefined') return;

    // Monthly Attendance Trends
    const ctxMonthly = document.getElementById('monthlyChart');
    if (ctxMonthly) {
        new Chart(ctxMonthly.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Attendance %',
                    data: [90, 88, 94, 92],
                    borderColor: '#b24bf3',
                    backgroundColor: 'rgba(178, 75, 243, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3,
                    pointBackgroundColor: '#b24bf3',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff',
                            font: { family: "'Rajdhani', sans-serif" }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10, 10, 31, 0.95)',
                        titleColor: '#00d4ff',
                        bodyColor: '#ffffff',
                        borderColor: '#b24bf3',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            color: '#ffffff',
                            font: { family: "'Rajdhani', sans-serif" }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        beginAtZero: true,
                        max: 100
                    },
                    x: {
                        ticks: {
                            color: '#ffffff',
                            font: { family: "'Rajdhani', sans-serif" }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    // Subject-wise Attendance
    const ctxSubject = document.getElementById('subjectChart');
    if (ctxSubject) {
        new Chart(ctxSubject.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Math', 'Physics', 'Chemistry', 'English', 'CS', 'Biology'],
                datasets: [{
                    label: 'Attendance %',
                    data: [95, 90, 88, 94, 85, 92],
                    backgroundColor: [
                        'rgba(0, 212, 255, 0.7)',
                        'rgba(178, 75, 243, 0.7)',
                        'rgba(255, 0, 110, 0.7)',
                        'rgba(0, 255, 136, 0.7)',
                        'rgba(255, 200, 0, 0.7)',
                        'rgba(0, 255, 255, 0.7)'
                    ],
                    borderColor: ['#00d4ff', '#b24bf3', '#ff006e', '#00ff88', '#ffc800', '#00ffff'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff',
                            font: { family: "'Rajdhani', sans-serif" }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10, 10, 31, 0.95)',
                        titleColor: '#00d4ff',
                        bodyColor: '#ffffff',
                        borderColor: '#00d4ff',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            color: '#ffffff',
                            font: { family: "'Rajdhani', sans-serif" }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        beginAtZero: true,
                        max: 100
                    },
                    x: {
                        ticks: {
                            color: '#ffffff',
                            font: { family: "'Rajdhani', sans-serif" }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }
}

// ===== NOTIFICATIONS =====
function showNotification(title, message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background: rgba(10, 10, 31, 0.95);
        backdrop-filter: blur(20px);
        border: 2px solid #b24bf3;
        border-radius: 16px;
        padding: 1.5rem;
        max-width: 350px;
        z-index: 10001;
        animation: slideInRight 0.5s ease;
        box-shadow: 0 0 30px rgba(178, 75, 243, 0.4);
    `;

    notification.innerHTML = `
        <h4 style="color: #b24bf3; margin-bottom: 0.5rem; font-family: 'Orbitron', sans-serif;">
            ${title}
        </h4>
        <p style="color: rgba(255, 255, 255, 0.8); margin: 0; font-family: 'Rajdhani', sans-serif;">
            ${message}
        </p>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

// ===== LOGOUT =====
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        showLoading('Logging out...');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// ===== VIEW ATTENDANCE DETAILS =====
function viewDetails(recordId) {
    const record = attendanceHistory.find(r => r.id === recordId);
    if (!record) return;

    showNotification(
        `📚 ${record.subject}`,
        `Date: ${formatDate(record.date)}<br>
         Time: ${record.time}<br>
         Status: ${record.status}<br>
         Professor: ${record.professor}`
    );
}

// ===== PRINT ATTENDANCE =====
function printAttendance() {
    window.print();
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('👨‍🎓 Student Dashboard Initialized');

    // Update statistics
    updateStatsDisplay();

    // Render timeline
    renderAttendanceTimeline();

    // Initialize charts
    if (typeof Chart !== 'undefined') {
        initializeStudentCharts();
    }

    // Show welcome message
    setTimeout(() => {
        showNotification(
            `Welcome back, ${studentInfo.name}!`,
            `Your overall attendance is ${calculateStatistics().overall}%. Keep it up! 🎓`
        );
    }, 1000);

    // Add animation to timeline items
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-30px)';
            item.style.transition = 'all 0.5s ease';

            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, 100);
        }, index * 100);
    });
});

// ===== EXPORT FUNCTIONS =====
window.studentDashboard = {
    filterAttendance,
    searchAttendance,
    downloadReport,
    toggleTheme,
    openSettings,
    viewDetails,
    printAttendance
};

console.log('%c👨‍🎓 Student.js Loaded', 'color: #b24bf3; font-size: 16px; font-weight: bold;');
