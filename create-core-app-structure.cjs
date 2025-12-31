const fs = require("fs");
const path = require("path");

const structure = [
  // lib
  "src/lib/supabase.js",

  // services
  "src/services/authService.js",
  "src/services/packageService.js",
  "src/services/invoiceService.js",

  // context
  "src/context/AuthContext.jsx",

  // components
  "src/components/layout/Navbar.jsx",
  "src/components/layout/Footer.jsx",
  "src/components/ui/.gitkeep",

  // pages
  "src/pages/.gitkeep",

  // root app
  "src/App.jsx",
];

structure.forEach((filePath) => {
  const dir = path.dirname(filePath);

  // Pastikan folder ada
  fs.mkdirSync(dir, { recursive: true });

  // Jika .gitkeep → buat file kosong
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "");
    console.log("Created:", filePath);
  } else {
    console.log("Skipped (exists):", filePath);
  }
});

console.log("\n🎉 Struktur core aplikasi berhasil dibuat!");
