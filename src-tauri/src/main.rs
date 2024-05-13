// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
async fn open_custom_fan(handle: tauri::AppHandle) {
  let _docs_window = tauri::WindowBuilder::new(
    &handle,
    "custom-fan", /* the unique window label */
    tauri::WindowUrl::App("CustomFanComponent".parse().unwrap())
  ).build().unwrap();
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![open_custom_fan])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
