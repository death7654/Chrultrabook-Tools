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


fn execute(app: &tauri::AppHandle, program: &str, arguments: &[&str], reply: bool) -> String {
    let shell = app.shell();
    let output = tauri::async_runtime::block_on(async move {
        shell
            .command(program)
            .args(arguments)
            .output()
            .await
            .unwrap()
    });
    if reply == true {
        if output.status.success() {
            return String::from_utf8(output.stdout).expect("execute_failure").to_string()
        } else {
            println!("Exit with code: {}", output.status.code().unwrap());
            return output.status.code().unwrap().to_string()
        }
    }
    else {
        return " ".to_string()
        }
    }

pub fn execute_relay(handle: tauri::AppHandle, wanted_program: &str, arguments: &[&str], reply: bool) -> String
{
    let program;
    match wanted_program {
        "ectool" => program = ECTOOL,
        "cbmem" => program = CBMEM,
        _ => program = "echo"
    }
    execute(&handle, program, arguments, reply).to_string()
}
