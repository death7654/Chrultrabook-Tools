//execute shell commands
use tauri_plugin_shell::ShellExt;

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

    let output = shell.command(program).args(arguments).output().await;

    if reply {
        match output {
            Ok(out) => {
                if out.status.success() {
                    return Ok(String::from_utf8(out.stdout)
                        .unwrap_or_else(|_| "execute_failure: invalid utf8".to_string()));
                } else {
                    return Err(String::from_utf8(out.stderr).unwrap_or_else(|_| "N/A".to_string()));
                }
            }
            Err(e) => {
                return Err(format!("Shell command error: {}", e));
            }
        }
    }

    Ok(String::new())
}

pub fn execute_relay(
    handle: tauri::AppHandle,
    wanted_program: &str,
    arguments: Vec<String>,
    reply: bool,
) -> String {
    let program = match wanted_program {
        "ectool" => ECTOOL,
        "cbmem" => CBMEM,
        "cat" => GETSYSINFO,
        "keyboard" => KEYBOARD,
        _ => "echo",
    };
    let output =
        tauri::async_runtime::block_on(async { execute(&handle, program, arguments, reply).await });

    output.unwrap_or_else(|e| e)
}
