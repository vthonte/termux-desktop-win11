#!/data/data/com.termux/files/usr/bin/python3
import sys
import subprocess
import os

if len(sys.argv) != 2:
    sys.exit(1)

package = sys.argv[1].strip()

# Check if Samsung DeX Mode (scrcpy) is running. If not, auto-launch DeX window in RDP!
try:
    pgrep_res = subprocess.run("pgrep -f scrcpy", shell=True, capture_output=True, text=True)
    if pgrep_res.returncode != 0:
        env = os.environ.copy()
        env["DISPLAY"] = env.get("DISPLAY", ":1")
        subprocess.Popen("/data/data/com.termux/files/usr/bin/launch-dex", shell=True, env=env)
except Exception:
    pass

# Dismiss Keyguard lock screen overlay in memory so activity routes to active scrcpy window
try:
    subprocess.run("/data/data/com.termux/files/usr/bin/am start -a android.intent.action.MAIN -c android.intent.category.HOME 2>/dev/null", shell=True)
    subprocess.run("wm dismiss-keyguard 2>/dev/null", shell=True)
    subprocess.run("input keyevent 82 2>/dev/null", shell=True)
except Exception:
    pass

parts = package.split('.')
last_part = parts[-1]
second_part = parts[1] if len(parts) > 1 else ""

activities = [
    f"{package}/com.amazon.mShop.home.HomeActivity",
    f"{package}/com.amazon.mShop.splash.SplashActivity",
    f"{package}/.MainActivity",
    f"{package}/.Main",
    f"{package}/.HomeActivity",
    f"{package}/.SplashActivity",
    f"{package}/.LauncherActivity",
    f"{package}/.App",
    f"{package}/com.{second_part}.{last_part.capitalize()}",
    f"{package}/com.{second_part}.home.HomeActivity",
    f"{package}/com.{second_part}.main.MainActivity",
    f"{package}/com.{second_part}.splash.SplashActivity",
    f"{package}/.{last_part.capitalize()}",
    f"{package}/.{last_part}",
]

launched = False
for act in activities:
    res = subprocess.run(
        f"/data/data/com.termux/files/usr/bin/am start -n {act}",
        shell=True,
        capture_output=True,
        text=True
    )
    output = (res.stdout or "") + (res.stderr or "")
    if "Error:" not in output and "Exception" not in output and "unable to resolve" not in output:
        launched = True
        break

if not launched:
    subprocess.run(
        f"/data/data/com.termux/files/usr/bin/am start -a android.intent.action.MAIN -c android.intent.category.LAUNCHER -p {package}",
        shell=True
    )
