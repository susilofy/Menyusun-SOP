const { app, BrowserWindow, shell, ipcMain, Menu } = require("electron");
const path = require("path");
const http = require("http");
const { fork } = require("child_process");

let mainWindow = null;
let serverProcess = null;
const SERVER_PORT = 3000;
const SERVER_URL = `http://127.0.0.1:${SERVER_PORT}`;

// Function to check if the local server is reachable
function checkServerReady(url, maxRetries = 40, interval = 500) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      attempts++;
      const req = http.get(url + "/api/health", (res) => {
        if (res.statusCode === 200) {
          resolve(true);
        } else if (attempts < maxRetries) {
          setTimeout(check, interval);
        } else {
          reject(new Error("Server responded with status " + res.statusCode));
        }
      });

      req.on("error", () => {
        if (attempts < maxRetries) {
          setTimeout(check, interval);
        } else {
          reject(new Error("Gagal terhubung ke server lokal"));
        }
      });

      req.end();
    };

    check();
  });
}

// Start the bundled Node.js/Express server in production
function startLocalServer() {
  const isPackaged = app.isPackaged;
  let serverScriptPath = "";

  if (isPackaged) {
    const unpackedPath = path.join(process.resourcesPath, "app.asar.unpacked", "dist", "server.cjs");
    const asarPath = path.join(process.resourcesPath, "app.asar", "dist", "server.cjs");
    if (require("fs").existsSync(unpackedPath)) {
      serverScriptPath = unpackedPath;
    } else if (require("fs").existsSync(asarPath)) {
      serverScriptPath = asarPath;
    } else {
      serverScriptPath = path.join(__dirname, "..", "dist", "server.cjs");
    }
  } else {
    serverScriptPath = path.join(__dirname, "..", "dist", "server.cjs");
  }

  try {
    serverProcess = fork(serverScriptPath, [], {
      env: {
        ...process.env,
        NODE_ENV: "production",
        PORT: String(SERVER_PORT),
      },
      stdio: "inherit",
    });

    serverProcess.on("error", (err) => {
      console.error("[Electron Server Error]", err);
    });

    serverProcess.on("exit", (code) => {
      console.log("[Electron Server Exited]", code);
    });
  } catch (err) {
    console.error("Gagal menjalankan server lokal:", err);
  }
}

function createApplicationMenu() {
  const template = [
    {
      label: "Berkas",
      submenu: [
        {
          label: "Cetak Dokumen (Print)",
          accelerator: "CmdOrCtrl+P",
          click: () => {
            if (mainWindow) mainWindow.webContents.print();
          },
        },
        { type: "separator" },
        {
          label: "Tutup Jendela",
          accelerator: "CmdOrCtrl+W",
          role: "close",
        },
        {
          label: "Keluar dari Aplikasi",
          accelerator: "CmdOrCtrl+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { label: "Urungkan (Undo)", role: "undo" },
        { label: "Ulangi (Redo)", role: "redo" },
        { type: "separator" },
        { label: "Potong (Cut)", role: "cut" },
        { label: "Salin (Copy)", role: "copy" },
        { label: "Tempel (Paste)", role: "paste" },
        { label: "Pilih Semua", role: "selectAll" },
      ],
    },
    {
      label: "Tampilan",
      submenu: [
        { label: "Muat Ulang Halaman", accelerator: "CmdOrCtrl+R", role: "reload" },
        { label: "Muat Ulang Paksa", accelerator: "CmdOrCtrl+Shift+R", role: "forceReload" },
        { type: "separator" },
        { label: "Perbesar Tampilan", role: "zoomIn" },
        { label: "Perkecil Tampilan", role: "zoomOut" },
        { label: "Ukuran Normal (100%)", role: "resetZoom" },
        { type: "separator" },
        { label: "Mode Layar Penuh", accelerator: "F11", role: "togglefullscreen" },
        {
          label: "Alat Pengembang (DevTools)",
          accelerator: "CmdOrCtrl+Shift+I",
          click: () => {
            if (mainWindow) mainWindow.webContents.toggleDevTools();
          },
        },
      ],
    },
    {
      label: "Bantuan",
      submenu: [
        {
          label: "Kunjungi Website Pengembang (GuruMerangkum.com)",
          click: () => {
            shell.openExternal("https://www.gurumerangkum.com/");
          },
        },
        { type: "separator" },
        {
          label: "Tentang Penyusun SOP Sekolah",
          click: () => {
            const { dialog } = require("electron");
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "Tentang Aplikasi",
              message: "SOP SMART SCHOOL - Penyusun & Manajemen SOP Satuan Pendidikan SD",
              detail:
                "Aplikasi berbasis AI untuk memfasilitasi analisis kebutuhan, wawancara pembuatan draft, pelaksana mutu baku, verifikasi regulasi, checklist kelengkapan, pengesahan, dan ekspor Word serta PDF A4 Landscape.\n\nPengembang: Susilo Fitri Yatmoko, M.Pd\nWebsite: https://www.gurumerangkum.com/",
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    title: "Penyusun SOP Sekolah - SOP SMART SCHOOL",
    icon: path.join(__dirname, "assets", "icon.png"),
    backgroundColor: "#f8fafc",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  });

  createApplicationMenu();

  // Route external links to the default system browser (Chrome/Edge/Firefox)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http:") || url.startsWith("https:")) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  // Handle IPC calls
  ipcMain.handle("print-page", () => {
    if (mainWindow) {
      mainWindow.webContents.print({ silent: false, printBackground: true });
    }
  });

  ipcMain.handle("open-external", (_event, url) => {
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      shell.openExternal(url);
    }
  });

  ipcMain.handle("get-app-version", () => {
    return app.getVersion();
  });

  const isDev = !app.isPackaged && process.env.NODE_ENV !== "production";

  if (isDev) {
    const devUrl = process.env.ELECTRON_START_URL || SERVER_URL;
    try {
      await checkServerReady(devUrl, 30, 800);
      mainWindow.loadURL(devUrl);
    } catch {
      mainWindow.loadURL(devUrl);
    }
  } else {
    // Packaged mode: start local backend and wait
    startLocalServer();
    try {
      await checkServerReady(SERVER_URL, 35, 600);
      mainWindow.loadURL(SERVER_URL);
    } catch {
      // Fallback: load static file directly if server didn't respond in time
      const possibleIndexPaths = [
        path.join(process.resourcesPath, "app.asar", "dist", "index.html"),
        path.join(__dirname, "..", "dist", "index.html"),
        path.join(app.getAppPath(), "dist", "index.html"),
      ];
      const foundPath = possibleIndexPaths.find((p) => require("fs").existsSync(p));
      if (foundPath) {
        mainWindow.loadFile(foundPath);
      } else {
        mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
      }
    }
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});
