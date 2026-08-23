# 🪟 Termux Desktop Windows 11 Light Mode & RDP Suite

A complete, high-performance desktop suite for **Android Termux** featuring a 100% styled **Windows 11 Light Mode Desktop**, **60+ FPS Vulkan Zink GPU Acceleration**, **Wireless RDP Remote Access (Port 3390)**, and an **HTML5 Control Dashboard**.

---

## 🌟 Key Features

- **🎨 Windows 11 Light Mode Aesthetic**:
  - `Fluent-Light` GTK Theme & Windows 11 `Fluent-light` Icon Pack.
  - Official blue 4-square Windows Start Menu button (`whiskermenu`).
  - Windows 11 Light Bloom 4K Wallpaper.
  - Top-Right Window Controls (`|HMC`).

- **📡 Wireless RDP Remote Server**:
  - Direct connection via **Microsoft Remote Desktop** app on Port **`3390`** (`10.57.65.155:3390`).
  - **Independent Display Sessions (`DISPLAY=:1`)**: Use your PC and phone concurrently without session conflicts.
  - Automatic VNC backend bridging (`-SecurityTypes None` on localhost loopback).

- **⚡ Native Local X11 Acceleration**:
  - **60+ FPS GPU acceleration** via Snapdragon 8 Gen 2 Adreno Vulkan Zink on `DISPLAY=:0`.
  - Auto-launches `com.termux.x11` app automatically.

- **🎛️ Control Center & GUI API**:
  - Node.js Control Server (`http://127.0.0.1:7860`) with REST API endpoints for starting/stopping X11, RDP, VNC, and retrieving system metrics.
  - HTML5 Web Control Hub on Port 7860.

---

## 🚀 Quick Installation

Run the 1-click automated setup script in Termux:

```bash
git clone git@github.com:vthonte/termux-desktop-win11.git ~/work/x11
cd ~/work/x11
chmod +x setup.sh
./setup.sh
```

---

## 💻 Usage Commands

| Action | Terminal Command | Details |
| :--- | :--- | :--- |
| **Launch Local X11** | `termux-desktop-x11` | Starts Windows 11 desktop on local phone screen (`DISPLAY=:0`). |
| **Launch RDP Server** | `termux-desktop-rdp` | Starts RDP server on **Port 3390** (`10.57.65.155:3390`). |
| **Apply Win11 Theme** | `apply-windows-theme [display]` | Forces theme, wallpaper, and icons on target display (`:0` or `:1`). |
| **Stop All Sessions** | `termux-desktop-stop-x11` | Stops all X11, VNC, RDP, and D-Bus processes cleanly. |

---

## 📡 Remote Connection Guide

### 1. Microsoft Remote Desktop App (PC / Laptop / Client Device):
- **PC Address**: `10.57.65.155:3390` (or `192.168.43.1:3390`)
- **Password**: `123456`
- **Module**: `Xvnc` / `Termux Desktop`

### 2. Native Local X11 App (Phone Screen):
- Open **Termux:X11** app.

---

## 📁 Repository Structure

```
.
├── assets/
│   ├── windows-logo.png       # Official blue Windows Start logo
│   └── windows11-light.jpg     # 4K Windows 11 Light Bloom Wallpaper
├── bin/
│   ├── apply-windows-theme     # Win11 theme & wallpaper application engine
│   ├── termux-desktop-rdp      # RDP server launcher (Port 3390)
│   ├── termux-desktop-stop-x11 # Session cleanup daemon
│   ├── termux-desktop-vnc      # VNC display :1 session launcher
│   └── termux-desktop-x11      # Local X11 display :0 launcher
├── public/                     # HTML5 Web Dashboard UI
├── x11-launcher.sh             # Backend shell controller
├── server.js                   # Node.js Control Server API (Port 7860)
├── setup.sh                    # 1-click automated setup script
└── README.md
```

---

## 📄 License
MIT License. Created for Termux Android Desktop environments.
