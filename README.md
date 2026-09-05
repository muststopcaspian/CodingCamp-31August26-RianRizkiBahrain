# CodingCamp/31August2026//To-Do List Life Dashboard

Web application untuk mengelola tugas harian dengan **AI CHATBOT** dan **BRUTALISM SEMI-MINIMALIST DESIGN**.

## 🚀 Fitur Utama

### ✨ Core Features
- **Dynamic Greeting**: Menampilkan sapaan berdasarkan waktu (Good Morning/Afternoon/Evening) dan tanggal real-time
- **👤 Profile Picture**: Upload foto profil (max 2MB), simpan di localStorage, display di header
- **Focus Timer (Pomodoro)**: Timer produktivitas yang dapat dikustomisasi (default 25 menit)
  - Start/Pause/Reset functionality
  - Browser notifications saat timer selesai
  - Customizable timer duration (1-60 menit)
- **To-Do List Management**: Kelola tugas dengan fitur lengkap
  - Add, edit, delete tasks
  - Mark tasks as completed
  - Priority levels (Low, Medium, High) dengan **COLOR-CODED BORDERS**
  - Duplicate task prevention
  - Sort by priority, date, or status
  - Clear completed tasks
  - Task statistics (total, active, completed)
- **Quick Links**: Akses cepat ke website favorit
  - Add, edit, delete links
  - Open in new tab with security (noopener, noreferrer)
  - URL validation
- **Light/Dark Mode**: Tema BRUTALIST yang dapat disesuaikan
- **Custom Settings**: 
  - Upload & manage profile picture
  - Personalisasi nama pengguna
  - Custom Pomodoro time
  - API key untuk AI chatbot
- **🤖 AI CHATBOT (NEW!)**: Conversational assistant untuk task management
  - **Chat interface** - bukan hanya evaluation!
  - **Context-aware** - tahu current task list Anda
  - **Conversation history** - maintains last 10 messages
  - **Pattern matching** - intelligent fallback responses
  - OpenAI GPT-3.5-turbo integration
  - Fallback rule-based responses (works without API key!)
  - Ask untuk evaluation, tips, motivation, priorities, dan insights

### 🎨 BRUTALISM Semi-Minimalist Design (NEW!)
- **Monospace font** (Courier New) - techy, authentic vibe
- **Bold 3-4px borders** - no rounded corners, pure geometry
- **Stark black/white** contrast - high readability
- **Neon accent colors** - bright green/yellow/red for priorities
- **No soft shadows** - solid offset shadows on hover only
- **Double border effect** on cards - signature brutalist touch
- **Uppercase labels** dengan wide letter-spacing
- **Geometric shapes** - rectangles only, no curves
- **Brutalist buttons** - offset shadow hover effect
- **Bold typography** - strong visual hierarchy

## 📁 Struktur Project

```
To-Do List Life Dashboard/
├── index.html          # Main HTML file
├── css/
│   └── style.css      # Single CSS file (850+ lines)
├── js/
│   └── script.js      # Single JavaScript file (1000+ lines)
└── README.md          # Documentation
```

## 🛠️ Teknologi

- **HTML5**: Struktur aplikasi dengan semantic markup
- **CSS3**: Styling dengan 3D interactive design
  - CSS Variables untuk theming
  - Flexbox & Grid layouts
  - Animations & Transitions
  - Responsive design
- **Vanilla JavaScript**: Logic aplikasi (ES6+, no frameworks)
- **Local Storage API**: Penyimpanan data client-side
- **Fetch API**: Integrasi dengan LLM API

## 🎯 Requirements

- Browser modern (Chrome, Firefox, Edge, Safari)
- Tidak memerlukan backend server
- Tidak memerlukan instalasi dependencies
- (Optional) OpenAI API key untuk AI evaluation

## 📝 Cara Menggunakan

### 1. Setup Awal
1. Buka `index.html` di browser Anda
2. Klik icon ⚙️ (Settings) di header
3. Masukkan nama Anda
4. (Optional) Set Pomodoro time sesuai preferensi
5. (Optional) Masukkan OpenAI API key untuk AI evaluation
6. Klik "Save Settings"

### 2. Mengelola To-Do List
- **Menambah Task**: Ketik task di input field, pilih priority, klik "Add Task" atau tekan Enter
- **Mengedit Task**: Klik "Edit" pada task, ubah text/priority, save
- **Menandai Selesai**: Centang checkbox pada task
- **Menghapus Task**: Klik "Delete" pada task
- **Sort Tasks**: Gunakan dropdown "Sort by" untuk mengurutkan
- **Clear Completed**: Klik "Clear Completed" untuk hapus semua task yang sudah selesai

### 3. Menggunakan Focus Timer
1. Klik "Start" untuk memulai timer
2. Klik "Pause" untuk jeda timer
3. Klik "Reset" untuk reset ke waktu awal
4. Browser akan mengirim notification saat timer selesai

### 4. Quick Links
- **Add Link**: Klik "+ Add", masukkan nama dan URL
- **Open Link**: Klik "Open" pada link (akan terbuka di tab baru)
- **Edit/Delete**: Gunakan tombol Edit atau Delete per link

### 5. AI Evaluation
1. Pastikan sudah ada tasks di to-do list
2. Set OpenAI API key di Settings
3. Klik "Evaluate My Tasks"
4. AI akan menganalisis task list dan memberikan feedback

### 6. Light/Dark Mode
- Klik icon 🌙/☀️ di header untuk toggle theme
- Theme tersimpan otomatis di Local Storage

## 🔑 OpenAI API Key

Untuk menggunakan fitur AI Evaluation:
1. Daftar di [OpenAI Platform](https://platform.openai.com/)
2. Buat API key di dashboard
3. Masukkan API key di Settings aplikasi
4. API key disimpan secara lokal di browser Anda (tidak di-share)

**Note**: Jika tidak memasukkan API key, aplikasi akan menggunakan fallback evaluation (rule-based) yang tetap memberikan insights berguna.

## 🎨 Fitur Design

- **3D Interactive Cards**: Hover effects dengan transforms dan shadows
- **Animated Greeting**: Shimmer effect dan smooth transitions
- **Responsive Layout**: Optimal di desktop, tablet, dan mobile
- **Accessibility**: Focus indicators, keyboard navigation, reduced motion support
- **Visual Feedback**: Toast notifications untuk setiap aksi
- **Color-coded Priorities**: Visual distinction untuk task priorities

## 💾 Data Storage

Semua data disimpan di Browser Local Storage:
- Tasks dan status completion
- Quick links
- User settings (nama, theme, pomodoro time, API key)
- Data tetap tersimpan setelah browser ditutup
- Data hanya tersimpan di device Anda (privacy-first)

## 🔒 Security & Privacy

- ✅ Semua data disimpan locally (tidak ada server)
- ✅ API key tidak pernah di-share atau dikirim ke server lain
- ✅ XSS protection dengan HTML escaping
- ✅ URL validation untuk quick links
- ✅ Secure external link opening (noopener, noreferrer)

## 📱 Browser Compatibility

Tested dan compatible dengan:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🐛 Known Limitations

- Browser notifications memerlukan permission dari user
- API calls ke OpenAI memerlukan internet connection
- Local Storage terbatas ~5-10MB per domain
- API key harus valid OpenAI key atau compatible endpoint

## 🚀 Future Enhancements (Ideas)

- [ ] Task categories/tags
- [ ] Recurring tasks
- [ ] Data export/import (JSON)
- [ ] Multiple theme options
- [ ] Task search/filter
- [ ] Sync across devices (optional cloud)
- [ ] More LLM provider support (Anthropic, local models)

## 📄 License

Personal Project - Kiro Workspace  
Created: September 2026

---

## 💡 Tips Penggunaan

1. **Gunakan Priority Wisely**: Set high priority untuk tasks yang urgent dan important
2. **Break Down Large Tasks**: Tasks besar lebih mudah dikerjakan jika dipecah jadi subtasks
3. **Use Pomodoro Timer**: 25 menit focused work + 5 menit break = produktivitas optimal
4. **Review Regularly**: Gunakan AI Evaluation untuk insights tentang task management
5. **Keep It Updated**: Tandai tasks selesai segera setelah dikerjakan untuk motivasi
6. **Limit Active Tasks**: Jangan overload - fokus pada 3-5 tasks penting per hari

## 🙏 Credits

Built with ❤️ using pure HTML, CSS, and JavaScript  
AI Evaluation powered by OpenAI GPT-3.5-turbo
