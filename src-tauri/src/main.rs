// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod open_window;
mod execute;


#[tauri::command]
async fn open_custom_fan(handle: tauri::AppHandle) {
    open_window::new_window(&handle, "fan", "custom_fan", 600.0, 450.0).await;
}

#[tauri::command]
async fn open_keyboard_extra(handle: tauri::AppHandle) {
    open_window::new_window(&handle, "keyboard", "keyboard_extra", 500.0, 300.0).await;
}

#[tauri::command]
async fn open_diagnostics(handle: tauri::AppHandle) {
    open_window::new_window(&handle, "diagnostics", "diagnostics", 600.0, 420.0).await;
}

#[tauri::command]
async fn open_settings(handle: tauri::AppHandle) {
    open_window::new_window(&handle, "settings", "settings", 500.0, 350.0).await;
}



fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            open_custom_fan,
            open_keyboard_extra,
            open_diagnostics,
            open_settings
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
