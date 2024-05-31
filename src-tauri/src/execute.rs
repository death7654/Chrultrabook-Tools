//execute shell commands
use tauri_plugin_shell::ShellExt;


pub fn test(app: &tauri::AppHandle, program: &str, arguements: &[&str], reply: bool) {
    let shell = app.shell();
    let output = tauri::async_runtime::block_on(async move {
        shell
            .command(program)
            .args(arguements)
            .output()
            .await
            .unwrap()
    });
    let output_string = String::from_utf8(output.stdout);
    if reply == true {
        if output.status.success() {
            println!("Result: {:?}", output_string.expect("REASON").trim());
        } else {
            println!("Exit with code: {}", output.status.code().unwrap());
        }
    }
}
