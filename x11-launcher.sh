#!/data/data/com.termux/files/usr/bin/bash

# Termux X11 & Desktop Environment Manager Script

export DISPLAY=:0
export PULSE_SERVER=127.0.0.1
export XDG_RUNTIME_DIR="${TMPDIR:-/data/data/com.termux/files/usr/tmp}/runtime-${USER:-termux}"
mkdir -p "$XDG_RUNTIME_DIR"
chmod 700 "$XDG_RUNTIME_DIR"

ACTION="${1:-status}"
DE_TARGET="${2:-xfce4}"

is_x11_running() {
    pgrep -f "termux-x11" >/dev/null 2>&1
}

is_rdp_running() {
    pgrep -f "xrdp" >/dev/null 2>&1
}

is_pulse_running() {
    pgrep -f "pulseaudio" >/dev/null 2>&1
}

get_active_de() {
    if pgrep -f "xfce4-session|startxfce4" >/dev/null 2>&1; then
        echo "xfce4"
    elif pgrep -f "lxqt-session|startlxqt" >/dev/null 2>&1; then
        echo "lxqt"
    elif pgrep -f "openbox" >/dev/null 2>&1; then
        echo "openbox"
    elif pgrep -f "i3" >/dev/null 2>&1; then
        echo "i3"
    elif pgrep -f "fluxbox" >/dev/null 2>&1; then
        echo "fluxbox"
    elif pgrep -f "mate-session" >/dev/null 2>&1; then
        echo "mate"
    else
        echo "none"
    fi
}

start_x11_server() {
    if ! is_x11_running; then
        echo "[X11 Launcher] Starting termux-x11 server on :0..."
        termux-x11 :0 -ac &
        sleep 1
    else
        echo "[X11 Launcher] termux-x11 server is already running."
    fi

    if ! is_pulse_running; then
        echo "[X11 Launcher] Starting PulseAudio..."
        pulseaudio --start --load="module-native-protocol-tcp auth-anonymous=1" --exit-idle-time=-1 2>/dev/null || true
    fi
}

start_rdp_server() {
    echo "[RDP Launcher] Launching RDP Server on Port 3390..."
    /data/data/com.termux/files/usr/bin/termux-desktop-rdp
}

stop_all_des() {
    echo "[X11 Launcher] Stopping active desktop session..."
    pkill -f "xfce4-session|startxfce4|lxqt-session|startlxqt|openbox|i3|fluxbox|mate-session|dbus-launch|xrdp|Xvnc" 2>/dev/null || true
    sleep 1
}

stop_everything() {
    echo "[X11 Launcher] Stopping desktop session and X11/RDP servers..."
    stop_all_des
    pkill -f "termux-x11" 2>/dev/null || true
    echo "[X11 Launcher] Stopped successfully."
}

launch_de() {
    DE="$1"
    echo "[X11 Launcher] Launching $DE..."
    
    stop_all_des
    start_x11_server

    case "$DE" in
        xfce4)
            if which startxfce4 >/dev/null 2>&1; then
                dbus-launch --exit-with-session startxfce4 &
            else
                echo "XFCE4 is not installed. Installing..."
                pkg install -y xfce4 xfce4-terminal
                dbus-launch --exit-with-session startxfce4 &
            fi
            ;;
        lxqt)
            if which startlxqt >/dev/null 2>&1; then
                dbus-launch --exit-with-session startlxqt &
            else
                echo "LXQt is not installed. Installing..."
                pkg install -y lxqt
                dbus-launch --exit-with-session startlxqt &
            fi
            ;;
        openbox)
            if which openbox-session >/dev/null 2>&1 || which openbox >/dev/null 2>&1; then
                dbus-launch --exit-with-session openbox-session &
            else
                echo "Openbox is not installed. Installing..."
                pkg install -y openbox
                dbus-launch --exit-with-session openbox-session &
            fi
            ;;
        i3)
            if which i3 >/dev/null 2>&1; then
                dbus-launch --exit-with-session i3 &
            else
                echo "i3 is not installed. Installing..."
                pkg install -y i3
                dbus-launch --exit-with-session i3 &
            fi
            ;;
        fluxbox)
            if which fluxbox >/dev/null 2>&1; then
                dbus-launch --exit-with-session startfluxbox &
            else
                echo "Fluxbox is not installed. Installing..."
                pkg install -y fluxbox
                dbus-launch --exit-with-session startfluxbox &
            fi
            ;;
        mate)
            if which mate-session >/dev/null 2>&1; then
                dbus-launch --exit-with-session mate-session &
            else
                echo "MATE Desktop is not installed. Installing..."
                pkg install -y mate-desktop
                dbus-launch --exit-with-session mate-session &
            fi
            ;;
        *)
            echo "Unknown DE: $DE. Defaulting to XFCE4."
            dbus-launch --exit-with-session startxfce4 &
            ;;
    esac

    am start -n com.termux.x11/com.termux.x11.MainActivity >/dev/null 2>&1 || am start com.termux.x11/.MainActivity >/dev/null 2>&1 || true
    echo "[X11 Launcher] $DE launched successfully!"
}

clean_space() {
    echo "[X11 Launcher] Cleaning package caches and temporary files..."
    apt-get clean 2>/dev/null || true
    npm cache clean --force 2>/dev/null || true
    pip cache purge 2>/dev/null || true
    rm -rf ~/.cache/* ~/.cpan/* /tmp/* "${TMPDIR:-/tmp}"/* 2>/dev/null || true
    echo "[X11 Launcher] Cleanup completed!"
}

open_x11_app() {
    am start -n com.termux.x11/com.termux.x11.MainActivity >/dev/null 2>&1 || am start com.termux.x11/.MainActivity >/dev/null 2>&1 || true
}

case "$ACTION" in
    start)
        start_x11_server
        open_x11_app
        ;;
    rdp)
        start_rdp_server
        ;;
    stop)
        stop_everything
        ;;
    launch)
        launch_de "$DE_TARGET"
        ;;
    open)
        open_x11_app
        ;;
    clean)
        clean_space
        ;;
    status)
        echo "x11_running=$(is_x11_running && echo true || echo false)"
        echo "rdp_running=$(is_rdp_running && echo true || echo false)"
        echo "pulse_running=$(is_pulse_running && echo true || echo false)"
        echo "active_de=$(get_active_de)"
        ;;
    *)
        echo "Usage: $0 {start|rdp|stop|launch <de>|open|clean|status}"
        exit 1
        ;;
esac
