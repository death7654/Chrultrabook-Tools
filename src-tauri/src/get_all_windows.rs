use tauri::Manager;

pub fn window(window: &tauri::Window, label: &str) -> bool {
    let windows = window.webview_windows();
    for (_, window) in windows.iter() {
        let name = window.label();
        if name == label {
            return true;
        }
    }
    false
}
