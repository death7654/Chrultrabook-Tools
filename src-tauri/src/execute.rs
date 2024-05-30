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
/*
pub fn execute_command()
{
let shell = app_handle.shell();
let output = tauri::async_runtime::block_on(async move {
    shell
        .command("echo")
        .args(["Hello from Rust!"])
        .output()
        .await
        .unwrap()
});
if output.status.success() {
    println!("Result: {:?}", String::from_utf8(output.stdout));
} else {
    println!("Exit with code: {}", output.status.code().unwrap());
}
}


pub fn execute_ectool_one_time()
{

}
 */