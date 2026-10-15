// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod activity_light;
mod custom_fan;
mod execute;
mod keyboard_remap;
mod keyboard_light;
mod open_window;
mod save_to_files;
mod save_to_local;
mod settings_file;
mod temps;

//external crates
use std::fs;
use tauri::image::Image;
use tauri::menu::{IconMenuItemBuilder, MenuBuilder, MenuItemBuilder};
use tauri::tray::TrayIconBuilder;
use tauri::{AppHandle, Emitter, EventTarget, Manager};
use tauri_plugin_autostart::{MacosLauncher, ManagerExt};
use tauri_plugin_clipboard_manager::ClipboardExt;
use tauri_plugin_dialog::DialogExt;

#[cfg(target_os = "windows")]
use winreg::enums::*;
#[cfg(target_os = "windows")]
use winreg::RegKey;

//open windows
#[tauri::command]
async fn open_window(
    handle: tauri::AppHandle,
    _window: tauri::Window,
    name: &str,
    width: f64,
    height: f64,
    zoom: f64,
) -> Result<(), String> {
    if !["Custom_Fans", "Settings", "Keyboard_extra", "Diagnostics", "Battery"].contains(&name) {
        return Err("Unknown application window".into());
    }
    if !width.is_finite() || !height.is_finite() { return Err("Invalid window dimensions".into()); }
    let monitor = handle.get_webview_window("main").and_then(|main| main.current_monitor().ok().flatten());
    let (max_width, max_height) = monitor.map(|m| (
        (m.size().width as f64 / m.scale_factor() * 0.95).max(320.0),
        (m.size().height as f64 / m.scale_factor() * 0.9).max(240.0),
    )).unwrap_or((1600.0, 900.0));
    let target = open_window::new_window(&handle, name, name,
        width.clamp(320.0, max_width), height.clamp(240.0, max_height), true).await?;
    #[cfg(not(windows))]
    let _ = zoom;
    #[cfg(windows)]
    target.set_zoom(if zoom.is_finite() { zoom.clamp(0.5, 2.0) } else { 1.0 }).map_err(|e| e.to_string())?;
    target.show().map_err(|e| e.to_string())?;
    target.unminimize().map_err(|e| e.to_string())?;
    target.set_focus().map_err(|e| e.to_string())?;
    Ok(())
}

//commands
#[tauri::command]
async fn execute(handle: tauri::AppHandle, program: String, arguments: Vec<String>, reply: bool) -> String {
    tauri::async_runtime::spawn_blocking(move || execute::execute_relay(handle, &program, arguments, reply))
        .await.unwrap_or_else(|error| error.to_string())
}

#[tauri::command]
async fn execute_checked(handle: tauri::AppHandle, program: String, arguments: Vec<String>) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || execute::execute_relay_checked(handle, &program, arguments, true))
        .await.map_err(|error| error.to_string())?
}

#[tauri::command]
async fn set_keyboard_brightness(handle: tauri::AppHandle, percentage: u8) -> Result<u8, String> {
    tauri::async_runtime::spawn_blocking(move || execute::set_brightness(handle, percentage))
        .await.map_err(|error| error.to_string())?
}

#[tauri::command]
async fn get_sensors(handle: tauri::AppHandle) -> Result<String, String> {
    let output = execute_checked(handle, "ectool".into(), vec!["temps".into(), "all".into()]).await?;
    let names: Vec<&str> = temps::sensor_rows(&output).map(|(name, _)| name).collect();
    if names.is_empty() { return Err("No temperature sensors available".into()); }
    Ok(names.join("\n"))
}

#[tauri::command]
async fn diagnostics(handle: tauri::AppHandle, selected: String) -> Result<String, String> {
    let (program, args) = match selected.as_str() {
        "Boot Timestraps" => ("cbmem", vec!["-t"]),
        "Coreboot Log" => ("cbmem", vec!["-c1"]),
        "Coreboot Extended Log" => ("cbmem", vec!["-c"]),
        "EC Console Log" => ("ectool", vec!["console"]),
        "Battery Information" => ("ectool", vec!["battery"]),
        "EC Chip Information" => ("ectool", vec!["chipinfo"]),
        "SPI Information" => ("ectool", vec!["flashspiinfo"]),
        "EC Protocol Information" => ("ectool", vec!["protoinfo"]),
        "Temperature Sensor Information" => ("ectool", vec!["tempsinfo", "all"]),
        "Power Delivery Information" => ("ectool", vec!["pdlog"]),
        value if value.starts_with("cbi") => {
            let index = &value[3..];
            let number: u8 = index.parse().map_err(|_| "Invalid board information request")?;
            if number > 10 { return Err("Invalid board information request".into()); }
            ("ectool", vec!["cbi", "get", index])
        }
        _ => return Err("Select a diagnostic report".into()),
    };
    let output = execute_checked(handle, program.into(), args.into_iter().map(String::from).collect()).await?;
    Ok(output.lines().filter(|line| !line.trim().is_empty()).collect::<Vec<_>>().join("\n"))
}
#[tauri::command]
fn copy(handle: tauri::AppHandle, text: String) -> Result<(), String> {
    handle.clipboard().write_text(text).map_err(|error| error.to_string())
}

#[tauri::command]
async fn save(app: tauri::AppHandle, filename: String, content: String) -> Result<bool, String> {
    save_to_files::select_path(app, filename, content).await
}

#[tauri::command]
fn local_storage(function: &str, option: &str, value: &str) -> Result<String, String> {
    save_to_local::local_storage(function, option, value)
}

#[tauri::command]
async fn get_temps(handle: tauri::AppHandle) -> u16 {
    let output = execute_checked(handle, "ectool".into(), vec!["temps".into(), "all".into()]).await.unwrap_or_default();
    let sensors = local_storage("get", "sensor_selection", "").unwrap_or_default();
    temps::get_temp(output, sensors, true)
}
#[tauri::command]
fn boardname(handle: tauri::AppHandle) -> String {
    #[cfg(windows)]
    let _ = &handle;
    #[cfg(windows)]
    {
        let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);

        hklm.open_subkey("HARDWARE\\DESCRIPTION\\System\\BIOS")
            .and_then(|bios_key| bios_key.get_value::<String, _>("BaseBoardProduct"))
            .unwrap_or_else(|_| String::from("Unknown"))
    }
    #[cfg(target_os = "linux")]
    {
        execute::execute_relay(
            handle,
            "cat",
            vec!["/sys/class/dmi/id/product_name".to_string()],
            true,
        )
        .trim()
        .to_string()
    }

    #[cfg(target_os = "macos")]
    {
        String::from("unknown")
    }
}

#[tauri::command]
#[allow(unreachable_code)]
fn os() -> String {
    #[cfg(target_os = "macos")]
    {
        return String::from("macOS");
    }
    #[cfg(target_os = "linux")]
    {
        return String::from("linux");
    }

    String::from("not macOS")
}

#[tauri::command]
fn change_activity_light(selected: String) -> Result<(), String> {
    activity_light::set_color(selected)
}

#[tauri::command]
fn autostart(app: AppHandle, value: bool) -> Result<(), String> {
    let autolaunch = app.autolaunch();

    if value { autolaunch.enable() } else { autolaunch.disable() }.map_err(|error| error.to_string())
}

#[tauri::command]
async fn get_fan_json() -> Result<String, String> {
    let output = local_storage("get", "profiles", "")?;
    let default_array = String::from("[{\"id\":0,\"name\":\"Default\",\"array\":[0,10,25,40,60,80,95,100,100,100,100,100,100],\"selected\":true,\"disabled\":true,\"class\":\"transparent\",\"img_class\":\"btn-outline-info\",\"img\":\"\\uF4CB\"},{\"id\":1,\"name\":\"Aggressive\",\"array\":[0,10,40,50,60,90,100,100,100,100,100,100,100],\"selected\":false,\"disabled\":true,\"class\":\"transparent\",\"img_class\":\"btn-outline-info\",\"img\":\"\\uF4CB\"},{\"id\":2,\"name\":\"Quiet\",\"array\":[0,15,20,30,40,55,90,100,100,100,100,100,100],\"selected\":false,\"disabled\":true,\"class\":\"transparent\",\"img_class\":\"btn-outline-info\",\"img\":\"\\uF4CB\"}]");
    if output.is_empty() { return Ok(default_array); }
    let parsed: serde_json::Value = serde_json::from_str(&output).map_err(|error| error.to_string())?;
    if !parsed.is_array() { return Err("Fan profiles must be an array".into()); }
    Ok(output)
}

#[tauri::command]
async fn get_rgb_json() -> Result<String, String> {
    local_storage("get", "rgbprofiles", "")
}

#[tauri::command]
async fn set_fan_duty(handle: tauri::AppHandle, window: tauri::Window, duty: u8) -> Result<(), String> {
    if window.label() != "main" || duty > 100 {
        return Err("Invalid fan duty request".into());
    }
    execute_checked(handle, "ectool".into(), vec!["fanduty".into(), duty.to_string()]).await.map(|_| ())
}

#[tauri::command]
async fn set_custom_fan(handle: tauri::AppHandle, window: tauri::Window, temp: u16, array: Vec<u8>) -> Result<(), String> {
    if temp == 0 || array.len() < 12 || array.iter().any(|value| *value > 100) {
        return Err("Invalid fan curve or temperature".into());
    }
    set_fan_duty(handle, window, custom_fan::calculate_fan_percentage(temp, array)).await
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct FanCurveRequest {
    request_id: String,
    name: String,
    array: Vec<u8>,
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct FanCurveResult {
    request_id: String,
    applied: bool,
}

#[tauri::command]
fn transfer_fan_curves(app: AppHandle, curves: FanCurveRequest) -> Result<(), String> {
    if curves.name.trim().is_empty() || curves.array.len() < 12 || curves.array.iter().any(|value| *value > 100) {
        return Err("Invalid fan curve".into());
    }
    app.emit_to(EventTarget::webview_window("main"), "fan_curve", &curves)
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn fan_curve_feedback(app: AppHandle, window: tauri::Window, result: FanCurveResult) -> Result<(), String> {
    if window.label() != "main" { return Err("Only main can confirm fan control".into()); }
    app.emit_to(EventTarget::webview_window("Custom_Fans"), "fan_curve_applied", &result)
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn transfer_rgb(app: AppHandle, rgb: String) -> Result<(), String> {
    app.emit_to(EventTarget::webview_window("main"), "rgb", &rgb).map_err(|error| error.to_string())
}

#[tauri::command]
fn setzoom(handle: tauri::AppHandle, scale: f64) -> Result<(), String> {
    let scale = if scale.is_finite() && scale > 0.0 { scale.clamp(0.5, 2.0) } else { 1.0 };
    let windows = handle.webview_windows();
    for (_, window) in windows.iter() {
        window.set_zoom(scale).map_err(|error| error.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn reset(handle: tauri::AppHandle) -> Result<(), String> {
    autostart(handle.clone(), false)?;
    local_storage("clear", "", "")?;
    handle.restart();
}
#[tauri::command]
fn get_remap_json(hard_reset: bool) -> String {
    keyboard_remap::read_config(hard_reset)
}

#[tauri::command]
async fn set_remap(handle: tauri::AppHandle, params: String) -> Result<bool, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let buffer = keyboard_remap::generate_config_from_json(&params).map_err(|error| error.to_string())?;
        keyboard_remap::create_backup().map_err(|error| error.to_string())?;
        let file = handle.dialog().file().set_file_name("croskbsettings.bin")
            .set_directory("C:/Windows/System32/drivers").add_filter("Binary File", &["bin"]).blocking_save_file();
        if let Some(file) = file {
            fs::write(file.to_string(), buffer).map_err(|error| error.to_string())?;
            execute::execute_relay_checked(handle, "keyboard", Vec::new(), true)?;
            Ok(true)
        } else { Ok(false) }
    }).await.map_err(|error| error.to_string())?
}
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            //to hide app if user wants it hidden upon boot
            let start_app_in_tray = local_storage("get", "start_app_tray", "").unwrap_or_default();
            if start_app_in_tray == "true" && !std::env::args().any(|arg| arg == "--show") {
                let window = app.get_webview_window("main").unwrap();
                window.hide().unwrap();
            }

            let img = IconMenuItemBuilder::new("Chrultrabook Tools")
                .id("app")
                .enabled(false)
                .icon(Image::from_bytes(include_bytes!("../icons/icon.png")).unwrap())
                .build(app)
                .unwrap();
            let show = MenuItemBuilder::new("Show").id("show").build(app).unwrap();
            let hide = MenuItemBuilder::new("Hide").id("hide").build(app).unwrap();
            let quit = MenuItemBuilder::new("Quit").id("quit").build(app).unwrap();
            let github = MenuItemBuilder::new("Check for Updates")
                .id("github")
                .build(app)
                .unwrap();

            // we could opt handle an error case better than calling unwrap
            let menu = MenuBuilder::new(app)
                .item(&img)
                .separator()
                .items(&[&show, &hide, &quit])
                .separator()
                .item(&github)
                .build()
                .unwrap();

            let _ = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "quit" => app.exit(0),
                    "hide" => {
                        let window = app.webview_windows();
                        for (_, window) in window.iter() {
                            let _ = window.hide();
                        }
                    }
                    "show" => {
                        let window = app.webview_windows();
                        for (_, window) in window.iter() {
                            let _ = window.show();
                        }
                    }
                    "github" => {
                        let _ =
                            open::that("https://github.com/death7654/Chrultrabook-Tools/releases");
                    }
                    _ => {}
                })
                .tooltip("Chrultrabook Tools")
                .build(app);

            // B6: detect sleep→wake via wall-clock jump and ask the UI to
            // re-assert the custom fan curve within a few seconds.
            let resume_handle = app.handle().clone();
            std::thread::spawn(move || {
                loop {
                    let wall_before = std::time::SystemTime::now();
                    std::thread::sleep(std::time::Duration::from_secs(1));
                    let jumped = wall_before
                        .elapsed()
                        .map(|d| d.as_secs() >= 3)
                        .unwrap_or(false);
                    if jumped {
                        let _ = resume_handle.emit("system_resume", ());
                    }
                }
            });
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                // Secondary windows close normally. Never recursively close the
                // same window from its own CloseRequested callback.
                if window.label() == "main" {
                    if local_storage("get", "app_tray", "").unwrap_or_default() == "true" {
                        api.prevent_close();
                        let _ = window.hide();
                        for (label, child) in window.webview_windows() {
                            if label != "main" { let _ = child.destroy(); }
                        }
                    } else { window.app_handle().exit(0); }
                }
            }
        })
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--auto"]),
        ))
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
            if !args.iter().any(|arg| arg == "--auto") {
                if let Some(main) = app.get_webview_window("main") {
                    let _ = main.show(); let _ = main.unminimize(); let _ = main.set_focus();
                }
            }
        }))
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            open_window,
            execute,
            execute_checked,
            set_keyboard_brightness,
            get_sensors,
            diagnostics,
            copy,
            save,
            local_storage,
            get_temps,
            boardname,
            os,
            change_activity_light,
            autostart,
            get_fan_json,
            get_rgb_json,
            set_custom_fan,
            set_fan_duty,
            transfer_fan_curves,
            fan_curve_feedback,
            transfer_rgb,
            setzoom,
            reset,
            get_remap_json,
            set_remap,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
