// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod copy;
mod execute;
mod open_window;
mod save;
mod temps;
mod helper;

//external crates
use web_local_storage_api;

//open windows

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

//commands
#[tauri::command]
fn execute(handle: tauri::AppHandle, program: &str, arguments: Vec<String>, reply: bool) -> String {
    execute::execute_relay(handle, &program, arguments, reply)
}
#[tauri::command]
fn diagnostics(handle: tauri::AppHandle, selected: &str) -> String
{
    let output;
    match selected 
    {
        "Boot Timestraps" => output = execute(handle, "cbmem", helper::to_vec_string(vec!["-t"]), true),
        "Coreboot Log" => output = execute(handle, "cbmem", helper::to_vec_string(vec!["-c1"]), true),
        "Coreboot Extended Log" => output = execute(handle, "cbmem", helper::to_vec_string(vec!["-c"]), true),
        "EC Console Log" => output = execute(handle, "ectool", helper::to_vec_string(vec!["console"]), true),
        "Battery Information" => output = execute(handle, "ectool", helper::to_vec_string(vec!["battery"]), true),
        "EC Chip Information" => output = execute(handle, "ectool", helper::to_vec_string(vec!["chipinfo"]), true),
        "SPI Information" => output = execute(handle, "ectool", helper::to_vec_string(vec!["flashspiinfo"]), true),
        "EC Protocol Information" => output = execute(handle, "ectool", helper::to_vec_string(vec!["protoinfo"]), true),
        "Temperature Sensor Information" => output = execute(handle, "ectool", helper::to_vec_string(vec!["tempsinfo", "all"]), true),
        "Power Delivery Information" => output = execute(handle, "ectool", helper::to_vec_string(vec!["pdlog"]), true),
        _ => output = "Select An Option".to_string()
    }
    return output.trim().to_string()
}


#[tauri::command]
fn copy(handle: tauri::AppHandle, text: String) {
    copy::copy_text(&handle, text)
}
#[tauri::command]
fn save(app: tauri::AppHandle, filename: String, content: String) {
    save::select_path(app, filename, content);
}

#[tauri::command]
fn local_storage_save(option: &str, value: &str)
{
    let _ = web_local_storage_api::set_item(option, value);
}
#[tauri::command]
fn local_storage_get(option: &str) -> Option<String>
{
    if let Ok(output) = web_local_storage_api::get_item(option)
    {
        return output
    }
    else
    {
        return Some(" ".to_string())
    }
}

#[tauri::command]
fn get_temps(handle: tauri::AppHandle) -> i16 {
    let temps: String = execute::execute_relay(
        handle,
        "ectool",
        vec!["temps".to_string(), "all".to_string()],
        true,
    );
    temps::get_temp(temps)
}

#[tauri::command]
fn boardname(handle: tauri::AppHandle) -> String {
    #[cfg(windows)]
    {
        return execute::execute_relay(
            handle,
            "wmic",
            vec![
                "baseboard".to_string(),
                "get".to_string(),
                "Product".to_string(),
            ],
            true,
        );
    }
    #[cfg(target_os = "linux")]
    {
        return execute::execute_relay(
            handle,
            "cat",
            vec!["/sys/class/dmi/id/product_name".to_string()],
            true,
        );
    }

    #[cfg(target_os = "macos")]
    {
        return String::from("unknown");
    }
}
#[tauri::command]
fn os() -> String {
    #[cfg(target_os = "macos")]
    {
        return String::from("macOS");
    }
    return String::from("not macOS");
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_single_instance::init(|_app, _args, _cwd| {}))
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            open_custom_fan,
            open_keyboard_extra,
            open_diagnostics,
            open_settings,
            execute,
            diagnostics,
            copy,
            save,
            local_storage_save,
            local_storage_get,
            get_temps,
            boardname,
            os
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
