#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

#[cfg(target_os = "linux")]
use std::fs;
#[cfg(windows)]
use std::os::windows::process::CommandExt;
use sysinfo::{CpuExt, System, SystemExt};
use tauri::Manager;
use tauri::{CustomMenuItem, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem};
use tauri_plugin_autostart::MacosLauncher;

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let show = CustomMenuItem::new("show".to_string(), "Show");
    let tray_menu = SystemTrayMenu::new()
        .add_item(quit)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(show);

    tauri::Builder::default()
        .system_tray(SystemTray::new().with_menu(tray_menu))
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => {
                let _item_handle = app.tray_handle().get_item(&id);
                match id.as_str() {
                    "show" => {
                        let _window = app.get_window("main").unwrap();
                        _window.show();
                        return;
                    }
                    "quit" => {
                        std::process::exit(0);
                    }
                    _ => {}
                }
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            is_windows,
            get_bios_version,
            open_link,
            get_cpu_usage,
            get_ram_usage,
            get_hostname,
            get_cpu_name,
            get_cpu_cores,
            get_board_name,
            get_cpu_temp,
            get_fan_rpm,
            ectool,
            cbmem
        ])
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--flag1", "--flag2"]),
        ))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
#[tauri::command]
async fn is_windows() -> bool {
    return os_info::get().os_type() == os_info::Type::Windows;
}
#[tauri::command]
async fn get_ram_usage() -> String {
    let mut sys = System::new();
    sys.refresh_memory();

    let ram_total = sys.total_memory();
    let ram_usage = sys.used_memory();
    let ram_percent = ram_usage * 100 / ram_total;
    return ram_percent.to_string();
}

#[tauri::command]
async fn get_cpu_usage() -> String {
    #[cfg(target_os = "linux")]
    {
        let mut sys = System::new();
        sys.refresh_cpu();
        let usage = sys.global_cpu_info().cpu_usage();
        std::thread::sleep(System::MINIMUM_CPU_UPDATE_INTERVAL);
        let cpu_usage = usage.round();
        println!("usage {}", usage);
        println!("cpuusage {}", cpu_usage);
        return cpu_usage.to_string();
    }
    #[cfg(windows)]
    {
        let mut sys = System::new_all();
        sys.refresh_cpu(); // Refreshing CPU information.

        let mut num: i32 = 0;
        let mut total: i32 = 0;
        for cpu in sys.cpus() {
            let cpu_usage = cpu.cpu_usage();
            total += 1;
            num = num + (cpu_usage as i32);
        }

        return (num / total).to_string();
    }
}

#[tauri::command]
async fn get_cpu_temp() -> Option<String> {
    #[cfg(target_os = "linux")]
    {
        let paths = fs::read_dir("/sys/class/hwmon/").unwrap();
        for path in paths {
            let name =
                fs::read_to_string(format!("{}/name", path.as_ref().unwrap().path().display()))
                    .unwrap();
            if name.contains("k10temp") || name.contains("coretemp") {
                return Some(
                    (fs::read_to_string(format!(
                        "{}/temp1_input",
                        path.as_ref().unwrap().path().display()
                    ))
                    .unwrap()
                    .split('\n')
                    .collect::<Vec<_>>()[0]
                        .parse::<i32>()
                        .unwrap()
                        / 1000)
                        .to_string(),
                );
            };
        }
        return None;
    };

    #[cfg(windows)]
    {
        let cmd = std::process::Command::new("C:\\Program Files\\crosec\\ectool")
            .creation_flags(0x08000000)
            .args(["temps", "all"])
            .output();
        return Some(match_result(cmd));
    }
}

#[tauri::command]
async fn get_bios_version() -> String {
    let cmd: Result<std::process::Output, std::io::Error>;

    #[cfg(target_os = "linux")]
    {
        cmd = std::process::Command::new("cat")
            .args(["/sys/class/dmi/id/bios_version"])
            .output();
        return match_result(cmd);
    }

    #[cfg(windows)]
    {
        cmd = std::process::Command::new("wmic")
            .creation_flags(0x08000000)
            .args(["bios", "get", "smbiosbiosversion"])
            .output();
        return match_result_vec(cmd);
    }
}

#[tauri::command]
async fn get_board_name() -> String {
    let cmd: Result<std::process::Output, std::io::Error>;

    #[cfg(target_os = "linux")]
    {
        cmd = std::process::Command::new("cat")
            .args(["/sys/class/dmi/id/product_name"])
            .output();
        return match_result(cmd);
    }

    #[cfg(windows)]
    {
        cmd = std::process::Command::new("wmic")
            .creation_flags(0x08000000)
            .args(["baseboard", "get", "Product"])
            .output();
        return match_result_vec(cmd);
    }
}

#[tauri::command]
async fn get_cpu_cores() -> String {
    let cmd: Result<std::process::Output, std::io::Error>;

    #[cfg(target_os = "linux")]
    {
        cmd = std::process::Command::new("nproc").output();
        return match_result(cmd);
    }

    #[cfg(windows)]
    {
        cmd = std::process::Command::new("wmic")
            .creation_flags(0x08000000)
            .args(["cpu", "get", "NumberOfLogicalProcessors"])
            .output();
        return match_result_vec(cmd);
    }
}

#[tauri::command]
async fn get_cpu_name() -> String {
    let cmd: Result<std::process::Output, std::io::Error>;

    #[cfg(target_os = "linux")]
    {
        cmd = std::process::Command::new("lscpu")
            .args(["--parse=MODELNAME"])
            .output();
        return match_result(cmd).split('\n').collect::<Vec<_>>()[4].to_string();
    }

    #[cfg(windows)]
    {
        cmd = std::process::Command::new("wmic")
            .creation_flags(0x08000000)
            .args(["cpu", "get", "name"])
            .output();
        return match_result_vec(cmd);
    }
}

#[tauri::command]
async fn get_hostname() -> String {
    let cmd: Result<std::process::Output, std::io::Error>;

    #[cfg(target_os = "linux")]
    {
        cmd = std::process::Command::new("cat")
            .args(["/proc/sys/kernel/hostname"])
            .output();
    }

    #[cfg(windows)]
    {
        cmd = std::process::Command::new("hostname")
            .creation_flags(0x08000000)
            .output();
    }

    return match_result(cmd);
}

#[tauri::command]
async fn get_fan_rpm() -> String {
    let cmd: Result<std::process::Output, std::io::Error>;

    #[cfg(target_os = "linux")]
    {
        cmd = std::process::Command::new("ectool")
            .args(["pwmgetfanrpm"])
            .output();
    }

    #[cfg(windows)]
    {
        cmd = std::process::Command::new("C:\\Program Files\\crosec\\ectool")
            .creation_flags(0x08000000)
            .args(["pwmgetfanrpm"])
            .output();
    }
    return match_result(cmd);
}

#[tauri::command]
async fn ectool(value: String, value2: String) -> String {
    let cmd: Result<std::process::Output, std::io::Error>;

    #[cfg(target_os = "linux")]
    {
        cmd = std::process::Command::new("ectool")
            .arg(value)
            .arg(value2)
            .output();
    }

    #[cfg(windows)]
    {
        cmd = std::process::Command::new("C:\\Program Files\\crosec\\ectool")
            .creation_flags(0x08000000)
            .arg(value)
            .arg(value2)
            .output();
    }

    return match_result(cmd);
}

#[tauri::command]
async fn cbmem(value: String) -> String {
    let cmd: Result<std::process::Output, std::io::Error>;

    #[cfg(target_os = "linux")]
    {
        cmd = std::process::Command::new("cbmem").arg(value).output();
    }
    #[cfg(windows)]
    {
        cmd = std::process::Command::new("C:\\Program Files\\crosec\\cbmem")
            .creation_flags(0x08000000)
            .arg(value)
            .output();
    }

    return match_result(cmd);
}

#[tauri::command]
async fn open_link() {
    open::that("https://github.com/death7654/Chrultrabook-Windows-Controller").unwrap();
}

// Helper functions

fn match_result(result: Result<std::process::Output, std::io::Error>) -> String {
    let str = match result {
        Ok(output) => String::from_utf8_lossy(&output.stdout).to_string(),
        Err(e) => {
            println!("Error `{}`.", e);
            String::new()
        }
    };
    return str.trim().to_string();
}

fn match_result_vec(result: Result<std::process::Output, std::io::Error>) -> String {
    let str = match result {
        Ok(output) => String::from_utf8_lossy(&output.stdout)
            .split("\n")
            .map(|x| x.to_string())
            .collect::<Vec<String>>()[1]
            .clone(),
        Err(e) => {
            println!("Error `{}`.", e);
            String::new()
        }
    };
    return str.trim().to_string();
}
