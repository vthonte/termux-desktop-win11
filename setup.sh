#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "========================================================"
echo "   Termux Desktop Windows 11 Light Mode & RDP Installer"
echo "========================================================"

# 1. Update and install required packages
echo "[1/5] Installing core desktop and RDP packages..."
pkg update -y
pkg install -y xfce4 xfce4-terminal xrdp tigervnc x11vnc pulseaudio dbus git wget curl nodejs

# 2. Create bin directory and copy scripts
echo "[2/5] Installing launcher commands..."
mkdir -p /data/data/com.termux/files/usr/bin
cp -f bin/* /data/data/com.termux/files/usr/bin/
chmod +x /data/data/com.termux/files/usr/bin/termux-desktop-*
chmod +x /data/data/com.termux/files/usr/bin/apply-windows-theme

# 3. Create icon and wallpaper directories
echo "[3/5] Setting up Windows 11 Light Mode icons and wallpapers..."
mkdir -p /data/data/com.termux/files/usr/share/icons/
mkdir -p /data/data/com.termux/files/usr/share/backgrounds/

if [ -f "assets/windows-logo.png" ]; then
    cp -f assets/windows-logo.png /data/data/com.termux/files/usr/share/icons/windows-logo.png
fi

if [ -f "assets/windows11-light.jpg" ]; then
    cp -f assets/windows11-light.jpg /data/data/com.termux/files/usr/share/backgrounds/windows11-light.jpg
fi

# 4. Set VNC password to 123456
echo "[4/5] Setting default credentials..."
mkdir -p ~/.vnc
vncpasswd -f <<< "123456" > ~/.vnc/passwd
chmod 600 ~/.vnc/passwd

# 5. Apply Windows 11 Theme
echo "[5/5] Applying Windows 11 Light Mode Theme..."
/data/data/com.termux/files/usr/bin/apply-windows-theme :0 2>/dev/null || true

echo "========================================================"
echo "   Installation Completed Successfully!"
echo "   Commands available:"
echo "   - termux-desktop-x11 : Launch local X11 desktop (:0)"
echo "   - termux-desktop-rdp : Launch wireless RDP server (Port 3390)"
echo "   - termux-desktop-stop-x11 : Stop all desktop sessions"
echo "========================================================"
