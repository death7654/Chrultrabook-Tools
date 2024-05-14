// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
async fn new_window(handle: &tauri::AppHandle, label: &str, angular_path: &str) -> tauri::Window<tauri::Wry> {
  return tauri::WindowBuilder::new(
    handle,
    label, /* the unique window label */
    tauri::WindowUrl::App(angular_path.parse().unwrap())
  ).build().unwrap();
}

#[tauri::command]
async fn open_custom_fan(handle: tauri::AppHandle)
{
  new_window(&handle, "fan", "custom_fan").await;
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![open_custom_fan])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
