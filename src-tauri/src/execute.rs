//execute shell commands
use tauri_plugin_shell::ShellExt;

#[cfg(target_os = "linux")]
const ECTOOL: &str = "ectool";
#[cfg(windows)]
const ECTOOL: &str = "C:\\Program Files\\crosec\\ectool";
#[cfg(target_os = "macos")]
const ECTOOL: &str = "/usr/local/bin/ectool";

#[cfg(target_os = "linux")]
const CBMEM: &str = "cbmem";
#[cfg(windows)]
const CBMEM: &str = "C:\\Program Files\\crosec\\cbmem";

