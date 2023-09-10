// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
use std::{
    os::windows::process::CommandExt,
    process::{Command, Stdio},
};
use sysinfo::{CpuExt, NetworkExt, NetworksExt, ProcessExt, System, SystemExt};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
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
            set_fan_max,
            set_fan_off,
            set_fan_auto,
            get_cbmem
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn get_ram_usage() -> String {
    let mut sys = System::new_all();
    sys.refresh_all();
    let ram_total = sys.total_memory();
    let ram_usage = sys.used_memory();
    let ram_percent = (ram_usage * 100 / ram_total);
    return ram_percent.to_string();
}

#[tauri::command]
async fn get_cpu_usage() -> String {
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

#[tauri::command]
async fn get_cpu_temp() -> String {
    let cmd_cpu_temp: Result<std::process::Output, std::io::Error> =
        std::process::Command::new("C:\\Program Files\\crosec\\ectool")
            .creation_flags(0x08000000)
            .args(["temps", "all"])
            .output();
    let cpu_temp_long: String = match cmd_cpu_temp {
        Ok(output) => String::from_utf8_lossy(&output.stdout).to_string(),
        Err(e) => {
            println!("cpuTempError `{}`.", e);
            String::from("") // This match returns a blank string.
        }
    };
    let cpu_temp = cpu_temp_long.trim();
    return String::from(cpu_temp);
}
#[tauri::command]
async fn get_bios_version() -> String {
    let cmd_bios: Result<std::process::Output, std::io::Error> = std::process::Command::new("wmic")
        .creation_flags(0x08000000)
        .args(["bios", "get", "smbiosbiosversion"])
        .output();
    let bioslong: String = match cmd_bios {
        Ok(output) => String::from_utf8_lossy(&output.stdout).to_string(),
        Err(e) => {
            println!("biosError `{}`.", e);
            String::from("") // This match returns a blank string.
        }
    };
    let bios = bioslong.trim();
    return String::from(bios);
}
#[tauri::command]
async fn get_board_name() -> String {
    let cmd_boardname: Result<std::process::Output, std::io::Error> =
        std::process::Command::new("wmic")
            .creation_flags(0x08000000)
            .args(["baseboard", "get", "Product"])
            .output();
    let boardnamelong: String = match cmd_boardname {
        Ok(output) => String::from_utf8_lossy(&output.stdout).to_string(),
        Err(e) => {
            println!("boardnameError `{}`.", e);
            String::from("") // This match returns a blank string.
        }
    };
    let boardname = boardnamelong.trim();
    return String::from(boardname);
}
#[tauri::command]
async fn get_cpu_cores() -> String {
    let cmd_core_count: Result<std::process::Output, std::io::Error> =
        std::process::Command::new("wmic")
            .creation_flags(0x08000000)
            .args(["cpu", "get", "NumberOfCores"])
            .output();
    let cpu_cores_long: String = match cmd_core_count {
        Ok(output) => String::from_utf8_lossy(&output.stdout).to_string(),
        Err(e) => {
            println!("cpuCoresError `{}`.", e);
            String::from("") // This match returns a blank string.
        }
    };
    let cpu_cores = cpu_cores_long.trim();
    return String::from(cpu_cores);
}
#[tauri::command]
async fn get_cpu_name() -> String {
    let cmd_core_name: Result<std::process::Output, std::io::Error> =
        std::process::Command::new("wmic")
            .creation_flags(0x08000000)
            .args(["cpu", "get", "name"])
            .output();
    let cpu_name_long: String = match cmd_core_name {
        Ok(output) => String::from_utf8_lossy(&output.stdout).to_string(),
        Err(e) => {
            println!("cpunamesError `{}`.", e);
            String::from("") // This match returns a blank string.
        }
    };
    let cpu_name = cpu_name_long.trim();
    return String::from(cpu_name);
}
#[tauri::command]
async fn get_hostname() -> String {
    let cmd_hostname: Result<std::process::Output, std::io::Error> =
        std::process::Command::new("hostname")
            .creation_flags(0x08000000)
            .output();
    let hostnamelong: String = match cmd_hostname {
        Ok(output) => String::from_utf8_lossy(&output.stdout).to_string(),
        Err(e) => {
            println!("hostnameError `{}`.", e);
            String::from("") // This match returns a blank string.
        }
    };
    let hostname = hostnamelong.trim();
    return String::from(hostname);
}

#[tauri::command]
async fn get_fan_rpm() -> String {
    let cmd_fan_rpm: Result<std::process::Output, std::io::Error> =
        std::process::Command::new("C:\\Program Files\\crosec\\ectool")
            .creation_flags(0x08000000)
            .args(["pwmgetfanrpm"])
            .output();
    let fan_rpm: String = match cmd_fan_rpm {
        Ok(output) => String::from_utf8_lossy(&output.stdout).to_string(),
        Err(e) => {
            println!("fanRPMError `{}`.", e);
            String::from("") // This match returns a blank string.
        }
    };
    return String::from(fan_rpm);
}

#[tauri::command]
async fn set_fan_max() {
    let _ = std::process::Command::new("C:\\Program Files\\crosec\\ectool")
        .creation_flags(0x08000000)
        .args(["fanduty", "100"])
        .output();
    return;
}
#[tauri::command]
async fn set_fan_off() {
    let _ = std::process::Command::new("C:\\Program Files\\crosec\\ectool")
        .creation_flags(0x08000000)
        .args(["fanduty", "0"])
        .output();
    return;
}
#[tauri::command]
async fn set_fan_auto() {
    let _ = std::process::Command::new("C:\\Program Files\\crosec\\ectool")
        .creation_flags(0x08000000)
        .args(["autofanctrl"])
        .output();
    return;
}
#[tauri::command]
async fn get_cbmem() -> String {
    let cmd_cbmem: Result<std::process::Output, std::io::Error> =
        std::process::Command::new("C:\\Program Files\\crosec\\cbmem")
            .creation_flags(0x08000000)
            .output();
    let cbmem: String = match cmd_cbmem {
        Ok(output) => String::from_utf8_lossy(&output.stdout).to_string(),
        Err(e) => {
            println!("cbmemError `{}`.", e);
            String::from("") // This match returns a blank string.
        }
    };
    return String::from(cbmem);
}
#[tauri::command]
async fn open_link(){
    open::that("https://github.com/death7654/Chrultrabook-Windows-Controller");
    return;
}

