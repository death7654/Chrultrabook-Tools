// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
async fn new_window(handle: &tauri::AppHandle, label: &str, angular_path: &str, width: f64, height: f64) -> tauri::Window<tauri::Wry> {
  return tauri::WindowBuilder::new(
    handle,
    label, /* the unique window label */
    tauri::WindowUrl::App(angular_path.parse().unwrap())
  ).inner_size(width, height).build().unwrap();
}

#[tauri::command]
async fn open_custom_fan(handle: tauri::AppHandle)
{
  new_window(&handle, "fan", "custom_fan", 500.0, 300.0).await;
}

#[tauri::command]
async fn open_keyboard_extra(handle: tauri::AppHandle)
{
  new_window(&handle, "keyboard", "keyboard_extra", 500.0, 300.0).await;
}


#[tauri::command]
async fn open_diagnostics(handle: tauri::AppHandle)
{
  new_window(&handle, "diagnostics", "diagnostics", 500.0, 300.0).await;
}

#[tauri::command]
async fn open_settings(handle: tauri::AppHandle)
{
  new_window(&handle, "settings", "settings", 500.0, 325.0).await;
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![open_custom_fan, open_keyboard_extra,open_diagnostics,open_settings ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
