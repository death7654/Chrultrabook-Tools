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
const GETSYSINFO: &str = "wmic";


fn execute(app: &tauri::AppHandle, program: &str, arguments: Vec<String>, reply: bool) -> String {
    let shell = app.shell();
    let output = tauri::async_runtime::block_on(async move {
        shell.command(program).args(arguments).output().await
    });
    if reply == true {
        if let Ok(out) = output {
            if out.status.success() {
                return String::from_utf8(out.stdout).unwrap_or(String::from("execute_failure"));
            }
        } else {
            return format!("Exit with message: {}", output.unwrap_err());
        }
    }
    String::new()
}

pub fn execute_relay(
    handle: tauri::AppHandle,
    wanted_program: &str,
    arguments: Vec<String>,
    reply: bool,
) -> String {
    let program;
    match wanted_program {
        "ectool" => program = ECTOOL,
        "cbmem" => program = CBMEM,
        "wmic" | "cat" => program = GETSYSINFO,
        _ => program = "echo",
    }
    execute(&handle, program, arguments, reply).to_string()
}
