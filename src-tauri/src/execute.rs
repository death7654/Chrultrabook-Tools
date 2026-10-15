//execute shell commands
use std::io::Write;
use std::sync::Mutex;
use tauri_plugin_shell::ShellExt;
static EC_ACCESS: Mutex<()> = Mutex::new(());

//location of ectool excuteable
#[cfg(target_os = "linux")]
const ECTOOL: &str = "ectool";
#[cfg(windows)]
const ECTOOL: &str = "C:\\Program Files\\crosec\\ectool";
#[cfg(target_os = "macos")]
const ECTOOL: &str = "/usr/local/bin/ectool";

//location of cbmem excuteable
#[cfg(target_os = "linux")]
const CBMEM: &str = "cbmem";
#[cfg(windows)]
const CBMEM: &str = "C:\\Program Files\\crosec\\cbmem";
#[cfg(target_os = "macos")]
const CBMEM: &str = "echo";

//executeable to get system information
#[cfg(any(target_os = "linux", target_os = "macos"))]
const GETSYSINFO: &str = "cat";
#[cfg(windows)]
const GETSYSINFO: &str = "echo";

// croskbreload
const KEYBOARD: &str = "C:\\Program Files\\crosec\\croskbreload";

pub async fn execute(
    app: &tauri::AppHandle,
    program: &str,
    arguments: Vec<String>,
    reply: bool,
) -> Result<String, String> {
    let shell = app.shell();

    let output = shell.command(program).args(&arguments).output().await;
    if std::env::args().any(|argument| argument == "--trace-ec") {
        let path = std::env::var("APPDATA").unwrap_or_else(|_| ".".into());
        if let Ok(mut file) = std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(std::path::Path::new(&path).join("chrultrabook-tools/ec-trace.log"))
        {
            let readable = output.as_ref().map(|out| {
                (
                    out.status.success(),
                    String::from_utf8_lossy(&out.stdout).to_string(),
                    String::from_utf8_lossy(&out.stderr).to_string(),
                )
            });
            let _ = writeln!(
                file,
                "{:?} {:?} => {:?}",
                std::time::SystemTime::now(),
                arguments,
                readable
            );
        }
    }

    match output {
        Ok(out) => {
            if out.status.success() {
                if !reply {
                    return Ok(String::new());
                }
                return String::from_utf8(out.stdout).map_err(|error| error.to_string());
            } else {
                let stderr = String::from_utf8_lossy(&out.stderr);
                let stdout = String::from_utf8_lossy(&out.stdout);
                return Err(format!(
                    "Command failed: {} {}",
                    stderr.trim(),
                    stdout.trim()
                ));
            }
        }
        Err(e) => {
            return Err(format!("Shell command error: {}", e));
        }
    }
}

pub fn execute_relay(
    handle: tauri::AppHandle,
    wanted_program: &str,
    arguments: Vec<String>,
    reply: bool,
) -> String {
    execute_relay_checked(handle, wanted_program, arguments, reply).unwrap_or_else(|e| e)
}

pub fn execute_relay_checked(
    handle: tauri::AppHandle,
    wanted_program: &str,
    arguments: Vec<String>,
    reply: bool,
) -> Result<String, String> {
    let _ec_guard = if wanted_program == "ectool" {
        Some(
            EC_ACCESS
                .lock()
                .map_err(|_| "EC access lock failed".to_string())?,
        )
    } else {
        None
    };
    let program = match wanted_program {
        "ectool" => ECTOOL,
        "cbmem" => CBMEM,
        "cat" => GETSYSINFO,
        "keyboard" => KEYBOARD,
        _ => return Err("Unknown device tool".into()),
    };
    let output =
        tauri::async_runtime::block_on(async { execute(&handle, program, arguments, reply).await });

    output
}

/// Keep write and verification together: fan polling cannot enter the EC in
/// the middle of a keyboard-backlight update.
pub fn set_brightness(handle: tauri::AppHandle, percentage: u8) -> Result<u8, String> {
    if percentage > 100 {
        return Err("Invalid keyboard brightness".into());
    }
    let _guard = EC_ACCESS
        .lock()
        .map_err(|_| "EC access lock failed".to_string())?;
    tauri::async_runtime::block_on(async {
        for _ in 0..3 {
            execute(
                &handle,
                ECTOOL,
                vec!["pwmsetkblight".into(), percentage.to_string()],
                true,
            )
            .await?;
            let response = execute(&handle, ECTOOL, vec!["pwmgetkblight".into()], true).await?;
            let actual = crate::keyboard_light::parse_brightness(&response)?;
            if actual == percentage {
                return Ok(actual);
            }
            std::thread::sleep(std::time::Duration::from_millis(40));
        }
        Err("Keyboard brightness readback did not match the requested value".into())
    })
}
