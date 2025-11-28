// =====================================================
// ADMIN DASHBOARD - JAVASCRIPT
// AI Attendance System
// =====================================================

// Global Chart Instances
let lineChartInstance, barChartInstance, donutChartInstance;

// ===== MODULE NAVIGATION =====
// ===== SIDEBAR TOGGLE =====
function toggleSidebar(forceState) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (!sidebar) return;

    if (forceState === false) {
        sidebar.classList.remove('mobile-active');
        if (overlay) overlay.classList.remove('active');
    } else {
        sidebar.classList.toggle('mobile-active');
        if (overlay) overlay.classList.toggle('active');
    }
}

// ===== MODULE NAVIGATION =====
function showModule(moduleName) {
    // Hide all modules
    document.querySelectorAll('.module-section').forEach(module => {
        module.classList.remove('active');
    });

    // Show selected module
    const targetModule = document.getElementById(moduleName);
    if (targetModule) {
        targetModule.classList.add('active');

        // Refresh data when module is shown
        if (moduleName === 'students') refreshStudentTable();
        if (moduleName === 'subjects') refreshSubjectTable();
        if (moduleName === 'records') refreshAttendanceTable();
        if (moduleName === 'facescan') loadFaceScanSubjects();
        if (moduleName === 'dashboard') updateDashboardStats();
    }

    // Update menu active state
    document.querySelectorAll('.menu-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick') && link.getAttribute('onclick').includes(moduleName)) {
            link.classList.add('active');
        }
    });

    // Close sidebar on mobile
    if (window.innerWidth <= 1024) {
        toggleSidebar(false);
    }
}



// ===== STUDENT MANAGEMENT =====

// Register New Student
function registerStudent() {
    const name = document.getElementById('studentName')?.value;
    const roll = document.getElementById('rollNumber')?.value;
    const email = document.getElementById('email')?.value;
    const phone = document.getElementById('phone')?.value;
    const classVal = document.getElementById('class')?.value;
    const dept = document.getElementById('department')?.value;

    if (!name || !roll || !email || !phone || !classVal || !dept) {
        showToast('⚠️ Please fill all required fields!', 'warning');
        return;
    }

    showLoading('Registering student...');

    setTimeout(() => {
        const newStudent = {
            rollNo: roll,
            name: name,
            class: classVal,
            email: email,
            phone: phone,
            department: dept
        };

        DataManager.addStudent(newStudent);
        hideLoading();
        showToast(`✅ Student "${name}" registered successfully!`, 'success');
        resetForm();
        updateDashboardStats();
    }, 1000);
}

// Reset Registration Form
function resetForm() {
    const fields = ['studentName', 'rollNumber', 'email', 'phone', 'class', 'department'];
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) element.value = '';
    });

    // Reset camera preview if active
    const preview = document.querySelector('.face-scan-preview');
    if (preview) {
        preview.innerHTML = `
            <div class="scan-placeholder">
                <i class="fas fa-camera"></i>
                <p>Click to capture face</p>
                <div class="scanning-line"></div>
            </div>
        `;
    }
    CameraUtils.stopCamera();
}

// Refresh Student Table
function refreshStudentTable() {
    const tbody = document.querySelector('#students .modern-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const students = DataManager.getStudents();

    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No students found.</td></tr>';
        return;
    }

    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.rollNo}</td>
            <td>${student.name}</td>
            <td>${student.class}</td>
            <td>${student.email}</td>
            <td>${student.phone}</td>
            <td class="table-actions">
                <button class="table-btn delete" onclick="deleteStudent(${student.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Delete Student
function deleteStudent(id) {
    if (confirm(`Are you sure you want to delete this student?`)) {
        DataManager.deleteStudent(id);
        showToast(`✅ Student deleted successfully!`, 'success');
        refreshStudentTable();
        updateDashboardStats();
    }
}

// ===== SUBJECT MANAGEMENT =====

// Refresh Subject Table
function refreshSubjectTable() {
    const tbody = document.querySelector('#subjects .modern-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const subjects = DataManager.getSubjects();

    if (subjects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No subjects found.</td></tr>';
        return;
    }

    subjects.forEach(subject => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${subject.code}</td>
            <td>${subject.name}</td>
            <td class="table-actions">
                <button class="table-btn delete" onclick="deleteSubject(${subject.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Add Subject
function addSubject() {
    const container = document.querySelector('#subjects .form-grid');
    const nameInput = container.querySelector('input[placeholder="e.g., Mathematics"]');
    const codeInput = container.querySelector('input[placeholder="e.g., MAT101"]');
    const classSelect = container.querySelector('select');

    const name = nameInput.value;
    const code = codeInput.value;
    const classVal = classSelect.value;

    if (!name || !code || !classVal) {
        showToast('⚠️ Please fill all subject details!', 'warning');
        return;
    }

    const newSubject = {
        code: code,
        name: name,
        class: classVal
    };

    DataManager.addSubject(newSubject);
    showToast('✅ Subject added successfully!', 'success');

    // Clear inputs
    nameInput.value = '';
    codeInput.value = '';
    classSelect.value = '';

    refreshSubjectTable();
    updateDashboardStats();
}

// Delete Subject
function deleteSubject(id) {
    if (confirm('Are you sure you want to delete this subject?')) {
        DataManager.deleteSubject(id);
        showToast('✅ Subject deleted successfully!', 'success');
        refreshSubjectTable();
        updateDashboardStats();
    }
}

// ===== FACE CAPTURE (Register Student) =====
function captureface() {
    const preview = document.querySelector('#register .face-scan-preview');
    if (!preview) return;

    // Check if video already exists
    if (document.getElementById('registerVideo')) {
        // Capture
        const imageData = CameraUtils.captureSnapshot('registerVideo');
        if (imageData) {
            CameraUtils.stopCamera();
            preview.innerHTML = `
                <img src="${imageData}" style="width:100%; height:100%; object-fit:cover; border-radius:16px;">
                <button class="action-btn secondary" onclick="captureface()" style="position:absolute; bottom:10px;">Retake</button>
            `;
            showToast('✅ Face captured!', 'success');
        }
    } else {
        // Start Camera
        preview.innerHTML = `<video id="registerVideo" style="width:100%; height:100%; object-fit:cover; border-radius:16px;" autoplay playsinline></video>`;
        CameraUtils.startCamera('registerVideo');
    }
}

// ===== FACE SCAN ATTENDANCE (Admin Module) =====
function loadFaceScanSubjects() {
    const select = document.querySelector('#facescan select');
    if (!select) return;

    const subjects = DataManager.getSubjects();
    select.innerHTML = '<option value="">Choose Subject</option>';

    subjects.forEach(sub => {
        select.innerHTML += `<option value="${sub.name}">${sub.name} (${sub.class})</option>`;
    });
}

function toggleFaceScanCamera() {
    const preview = document.querySelector('#facescan .face-scan-preview');
    const btn = document.querySelector('#facescan .action-btn'); // Start Camera button

    if (document.getElementById('scanVideo')) {
        // Stop
        CameraUtils.stopCamera();
        preview.classList.remove('scanning');
        preview.innerHTML = `
            <div class="scan-placeholder">
                <i class="fas fa-video"></i>
                <p>Start camera for scanning</p>
                <div class="scanning-line"></div>
            </div>
        `;
        btn.innerHTML = '<i class="fas fa-camera"></i> Start Camera';
    } else {
        // Start - VALIDATION ADDED
        const subjectSelect = document.querySelector('#facescan select');
        if (!subjectSelect || !subjectSelect.value) {
            showToast('⚠️ Please select a subject before scanning!', 'warning');
            return;
        }

        preview.innerHTML = `
            <video id="scanVideo" style="width:100%; height:100%; object-fit:cover; border-radius:16px;" autoplay playsinline></video>
            <div class="scanning-line"></div>
        `;
        CameraUtils.startCamera('scanVideo').then(success => {
            if (success) {
                preview.classList.add('scanning');
                btn.innerHTML = '<i class="fas fa-stop"></i> Stop Camera';
                // Simulate scanning
                startScanningSimulation();
            }
        });
    }
}

function startScanningSimulation() {
    // Simulate finding a face frequently
    const interval = setInterval(() => {
        if (!document.getElementById('scanVideo')) {
            clearInterval(interval);
            return;
        }

        // Randomly pick a student to mark attendance for
        const students = DataManager.getStudents();
        const subject = document.querySelector('#facescan select').value;

        if (!subject) return; // Wait for subject selection

        // Higher probability (80%) to ensure it works
        if (students.length > 0 && Math.random() > 0.2) {
            const student = students[Math.floor(Math.random() * students.length)];

            // Check if already marked today
            const records = DataManager.getAttendance();
            const today = new Date().toLocaleDateString();
            const alreadyMarked = records.some(r => r.rollNo === student.rollNo && r.subject === subject && new Date(r.timestamp).toLocaleDateString() === today);

            if (!alreadyMarked) {
                const record = {
                    rollNo: student.rollNo,
                    name: student.name,
                    subject: subject,
                    status: 'Present'
                };
                DataManager.addAttendance(record);

                // Success Feedback - "Mass Show" (Clear Message)
                showToast(`✅ FACE DETECTED! Attendance Marked for ${student.name}`, 'success');

                // Visual feedback (flash)
                const video = document.getElementById('scanVideo');
                if (video) {
                    video.style.border = '4px solid #00ff88';
                }

                // Stop Scanning automatically after success
                setTimeout(() => {
                    const stopBtn = document.querySelector('#facescan .action-btn');
                    if (stopBtn) stopBtn.click(); // Trigger stop
                }, 1500);

                clearInterval(interval); // Stop this interval
                updateDashboardStats(); // Update analytics immediately
            }
        }
    }, 1000); // Check every 1 second
}


// ===== VIEW RECORDS =====
function refreshAttendanceTable() {
    const tbody = document.querySelector('#records .modern-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const records = DataManager.getAttendance();

    if (records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No attendance records found.</td></tr>';
        return;
    }

    // Sort by latest
    records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    records.forEach(record => {
        const date = new Date(record.timestamp).toLocaleDateString();
        const statusClass = record.status === 'Present' ? 'badge-success' : 'badge-danger';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="Roll No">${record.rollNo}</td>
            <td data-label="Student Name">${record.name}</td>
            <td data-label="Subject">${record.subject}</td>
            <td data-label="Date">${date}</td>
            <td data-label="Status"><span class="badge ${statusClass}">${record.status}</span></td>
            <td data-label="Actions" class="table-actions">
                <button class="table-btn edit" onclick="editRecord(${record.id})" title="Edit Status">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="table-btn delete" onclick="deleteRecord(${record.id})" title="Delete Record">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Edit Record
function editRecord(id) {
    const records = DataManager.getAttendance();
    const record = records.find(r => r.id === id);
    if (!record) return;

    const newStatus = prompt(`Update status for ${record.name} (Present/Absent/Late):`, record.status);

    if (newStatus && ['Present', 'Absent', 'Late'].includes(newStatus)) {
        record.status = newStatus;
        DataManager.updateAttendance(record);
        showToast('✅ Attendance status updated!', 'success');
        refreshAttendanceTable();
        updateDashboardStats();
    } else if (newStatus) {
        showToast('⚠️ Invalid status! Use Present, Absent, or Late.', 'warning');
    }
}

// Delete Record
function deleteRecord(id) {
    if (confirm('Are you sure you want to delete this attendance record?')) {
        DataManager.deleteAttendance(id);
        showToast('✅ Record deleted successfully!', 'success');
        refreshAttendanceTable();
        updateDashboardStats();
    }
}

// ===== EXPORT FUNCTIONS =====
function exportToPDF() {
    window.print();
    showToast('📄 Printing to PDF...', 'info');
}

function exportToExcel() {
    const records = DataManager.getAttendance();
    if (records.length === 0) {
        showToast('⚠️ No data to export!', 'warning');
        return;
    }

    let csv = 'Roll No,Name,Subject,Date,Status\n';
    records.forEach(r => {
        const date = new Date(r.timestamp).toLocaleDateString();
        csv += `${r.rollNo},${r.name},${r.subject},${date},${r.status}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('📊 Excel/CSV Exported!', 'success');
}

function copyData() {
    const records = DataManager.getAttendance();
    if (records.length === 0) {
        showToast('⚠️ No data to copy!', 'warning');
        return;
    }

    let text = 'Name\tRoll No\n';
    records.forEach(r => {
        text += `${r.name}\t${r.rollNo}\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
        showToast('✅ Name and Roll No copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Copy failed:', err);
        showToast('❌ Failed to copy data', 'error');
    });
}

// ===== STATISTICS & CHARTS =====

function initCharts() {
    // Line Chart (Weekly Trends)
    const ctxLine = document.getElementById('lineChart')?.getContext('2d');
    if (ctxLine) {
        lineChartInstance = new Chart(ctxLine, {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Attendance Count', data: [], borderColor: '#00d4ff', tension: 0.4, fill: true, backgroundColor: 'rgba(0, 212, 255, 0.1)' }] },
            options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }, x: { ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { display: false } } } }
        });
    }

    // Bar Chart (Subject-wise)
    const ctxBar = document.getElementById('barChart')?.getContext('2d');
    if (ctxBar) {
        barChartInstance = new Chart(ctxBar, {
            type: 'bar',
            data: { labels: [], datasets: [{ label: 'Attendance', data: [], backgroundColor: '#b24bf3', borderRadius: 5 }] },
            options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }, x: { ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { display: false } } } }
        });
    }

    // Donut Chart (Distribution)
    const ctxDonut = document.getElementById('donutChart')?.getContext('2d');
    if (ctxDonut) {
        donutChartInstance = new Chart(ctxDonut, {
            type: 'doughnut',
            data: { labels: ['Present', 'Absent', 'Late'], datasets: [{ data: [0, 0, 0], backgroundColor: ['#00ff88', '#ff006e', '#ffcc00'], borderWidth: 0 }] },
            options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#fff' } } } }
        });
    }
}

function updateDashboardStats() {
    const students = DataManager.getStudents();
    const subjects = DataManager.getSubjects();
    const records = DataManager.getAttendance();

    // 1. Total Students
    const totalStudentsEl = document.querySelectorAll('.stat-number')[0];
    if (totalStudentsEl) totalStudentsEl.textContent = students.length;

    // 2. Total Classes (Subjects)
    const totalClassesEl = document.querySelectorAll('.stat-number')[1];
    if (totalClassesEl) totalClassesEl.textContent = subjects.length;

    // 3. Today's Attendance (Only PRESENT students)
    const today = new Date().toLocaleDateString();
    const todayRecords = records.filter(r =>
        new Date(r.timestamp).toLocaleDateString() === today &&
        r.status === 'Present'
    );
    // Count unique students present today
    const uniqueStudentsToday = [...new Set(todayRecords.map(r => r.rollNo))].length;
    const todayPercent = students.length > 0 ? Math.round((uniqueStudentsToday / students.length) * 100) : 0;

    const todayAttEl = document.querySelectorAll('.stat-number')[2];
    if (todayAttEl) todayAttEl.textContent = todayPercent + '%';

    // 4. Average Attendance (Over all recorded days, only PRESENT)
    const allDates = [...new Set(records.map(r => new Date(r.timestamp).toLocaleDateString()))];
    let totalPercentSum = 0;

    if (allDates.length > 0) {
        allDates.forEach(date => {
            const dailyRecords = records.filter(r =>
                new Date(r.timestamp).toLocaleDateString() === date &&
                r.status === 'Present'
            );
            const uniqueStudents = [...new Set(dailyRecords.map(r => r.rollNo))].length;
            const dailyPercent = students.length > 0 ? (uniqueStudents / students.length) * 100 : 0;
            totalPercentSum += dailyPercent;
        });
        const avgPercent = Math.round(totalPercentSum / allDates.length);
        const avgAttEl = document.querySelectorAll('.stat-number')[3];
        if (avgAttEl) avgAttEl.textContent = avgPercent + '%';
    } else {
        const avgAttEl = document.querySelectorAll('.stat-number')[3];
        if (avgAttEl) avgAttEl.textContent = '0%';
    }

    // 5. Update Charts with Real Data
    updateCharts(records, subjects);
}

function updateCharts(records, subjects) {
    // Weekly Trends (Last 7 Days) - Only PRESENT
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString();
    }).reverse();

    const weeklyData = last7Days.map(date => {
        return records.filter(r =>
            new Date(r.timestamp).toLocaleDateString() === date &&
            r.status === 'Present'
        ).length;
    });

    if (lineChartInstance) {
        lineChartInstance.data.labels = last7Days;
        lineChartInstance.data.datasets[0].data = weeklyData;
        lineChartInstance.update();
    }

    // Subject-wise Attendance - Only PRESENT
    const subjectLabels = subjects.map(s => s.name);
    const subjectData = subjects.map(s => {
        return records.filter(r =>
            r.subject === s.name &&
            r.status === 'Present'
        ).length;
    });

    if (barChartInstance) {
        barChartInstance.data.labels = subjectLabels;
        barChartInstance.data.datasets[0].data = subjectData;
        barChartInstance.update();
    }

    // Distribution (Present/Absent/Late)
    const present = records.filter(r => r.status === 'Present').length;
    const absent = records.filter(r => r.status === 'Absent').length;
    const late = records.filter(r => r.status === 'Late').length;

    if (donutChartInstance) {
        donutChartInstance.data.datasets[0].data = [present, absent, late];
        donutChartInstance.update();
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 Admin Dashboard Initialized');

    // Safety Check for DataManager
    if (typeof DataManager === 'undefined') {
        console.error('❌ DataManager not found! Check script.js loading.');
        if (typeof showToast === 'function') showToast('Error: System modules not loaded', 'error');
        return;
    }

    // Initialize Charts (Safe Mode)
    try {
        if (typeof Chart !== 'undefined') {
            initCharts();
        } else {
            console.warn('⚠️ Chart.js not loaded. Charts will be disabled.');
        }
    } catch (e) {
        console.error('Chart initialization failed:', e);
    }

    // Initialize Data & UI
    try {
        updateDashboardStats();
        refreshStudentTable();
    } catch (e) {
        console.error('Dashboard data update failed:', e);
    }

    // Attach event listeners
    const addSubjectBtn = document.querySelector('#subjects .action-btn');
    if (addSubjectBtn) addSubjectBtn.onclick = addSubject;

    const scanBtn = document.querySelector('#facescan .action-btn');
    if (scanBtn) scanBtn.onclick = toggleFaceScanCamera;

    // Mobile Sidebar Toggle Fix
    const mobileBtn = document.querySelector('.mobile-menu-toggle');
    if (mobileBtn) {
        mobileBtn.onclick = () => toggleSidebar();
    }
});

// Export functions for global access
window.AdminFunctions = {
    registerStudent,
    resetForm,
    deleteStudent,
    deleteSubject,
    captureface,
    exportPDF: exportToPDF,
    exportExcel: exportToExcel,
    copyData: copyData,
    editRecord,
    deleteRecord
};
