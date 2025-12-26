const fs = require("fs");
const path = require("path");

const structure = [
  // Services (DIP)
  "src/services/authService.js",
  "src/services/dataService.js",
  "src/services/storageService.js",

  // Hooks (SRP)
  "src/hooks/useAuth.jsx",
  "src/hooks/useDashboardData.jsx",

  // Components (SRP)
  "src/components/Navbar.jsx",
  "src/components/admin/PackageForm.jsx",
  "src/components/admin/ProgramManager.jsx",
  "src/components/common/InvoiceTable.jsx",

  // Pages
  "src/pages/Auth.jsx",
  "src/pages/LandingPage.jsx",
  "src/pages/Dashboard/index.jsx",
  "src/pages/Dashboard/AdminDashboard.jsx",
  "src/pages/Dashboard/StudentDashboard.jsx",
];

structure.forEach((filePath) => {
  const dir = path.dirname(filePath);

  // Pastikan folder ada
  fs.mkdirSync(dir, { recursive: true });

  // Buat file jika belum ada
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "");
    console.log("Created:", filePath);
  } else {
    console.log("Skipped (exists):", filePath);
  }
});

console.log("\n🎉 Struktur aplikasi berhasil dibuat!");
