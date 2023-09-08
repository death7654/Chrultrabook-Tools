// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
use std::process::{Command, Stdio};

use tauri::Invoke;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            get_bios_version,
            get_os,
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
async fn get_cpu_temp() -> String {
    let cmd_cpu_temp: Result<std::process::Output, std::io::Error> =
        std::process::Command::new("C:\\Program Files\\crosec\\ectool")
            .args(["temps", "all"])
            .output();
    let cpu_temp: String = match cmd_cpu_temp {
        Ok(output) => String::from_utf8_lossy(&output.stdout).to_string(),
        Err(e) => {
            println!("cpuTempError `{}`.", e);
            String::from("") // This match returns a blank string.
        }
    };
    return String::from(cpu_temp);
}
#[tauri::command]
async fn get_bios_version() -> String {
    let cmd_bios: Result<std::process::Output, std::io::Error> = std::process::Command::new("wmic")
        .args(["get", "bios", "smbiosbiosversion"])
        .output();
    let bios: String = match cmd_bios {
        Ok(output) => String::from_utf8_lossy(&output.stdout).to_string(),
        Err(e) => {
            println!("biosError `{}`.", e);
            String::from("") // This match returns a blank string.
        }
    };
    return String::from(bios);
}
#[tauri::command]
async fn get_board_name() -> String {
    let cmd_boardname: Result<std::process::Output, std::io::Error> =
        std::process::Command::new("wmic")
            .args(["baseboard", "get", "Product"])
            .output();
    let boardname: String = match cmd_boardname {
        Ok(output) => String::from_utf8_lossy(&output.stdout).to_string(),
        Err(e) => {
            println!("boardnameError `{}`.", e);
            String::from("") // This match returns a blank string.
        }
    };
    return String::from(boardname);
}
#[tauri::command]
async fn get_cpu_cores() -> String {
    let cmd_core_count: Result<std::process::Output, std::io::Error> =
        std::process::Command::new("wmic")
            .args(["cpu", "get", "NumberOfCores"])
            .output();
    let cpuCores: String = match cmd_core_count {
        Ok(output) => String::from_utf8_lossy(&output.stdout).to_string(),
        Err(e) => {
            println!("cpuCoresError `{}`.", e);
            String::from("") // This match returns a blank string.
        }
    };
    return String::from(cpuCores);
}
#[tauri::command]
async fn get_cpu_name() -> String {
    let cmd_core_name: Result<std::process::Output, std::io::Error> =
        std::process::Command::new("wmic")
            .args(["cpu", "get", "NumberOfCores"])
            .output();
    let cpuName: String = match cmd_core_name {
        Ok(output) => String::from_utf8_lossy(&output.stdout).to_string(),
        Err(e) => {
            println!("cpunamesError `{}`.", e);
            String::from("") // This match returns a blank string.
        }
    };
    return String::from(cpuName);
}
#[tauri::command]
async fn get_hostname() -> String {
    let cmd_hostname: Result<std::process::Output, std::io::Error> =
        std::process::Command::new("wmic").output();
    let hostname: String = match cmd_hostname {
        Ok(output) => String::from_utf8_lossy(&output.stdout).to_string(),
        Err(e) => {
            println!("hostnameError `{}`.", e);
            String::from("") // This match returns a blank string.
        }
    };
    return String::from(hostname);
}
#[tauri::command]
async fn get_os() -> String {
    let cmd_os: Result<std::process::Output, std::io::Error> =
        std::process::Command::new("systeminfo")
            .args(["|", "/B", "/C:'OS Name'"])
            .output();
    let os: String = match cmd_os {
        Ok(output) => String::from_utf8_lossy(&output.stdout).to_string(),
        Err(e) => {
            println!("osError `{}`.", e);
            String::from("") // This match returns a blank string.
        }
    };
    return String::from(os);
}

#[tauri::command]
async fn get_fan_rpm() -> String {
    let cmd_fan_rpm: Result<std::process::Output, std::io::Error> =
        std::process::Command::new("C:\\Program Files\\crosec\\ectool")
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
fn set_fan_max() {
    std::process::Command::new("C:\\Program Files\\crosec\\ectool")
        .args(["fanduty", "100"])
        .output();
    return;
}
#[tauri::command]
fn set_fan_off() {
    std::process::Command::new("C:\\Program Files\\crosec\\ectool")
        .args(["fanduty", "0"])
        .output();
    return;
}
#[tauri::command]
fn set_fan_auto() {
    std::process::Command::new("C:\\Program Files\\crosec\\ectool")
        .args(["autofanctrl"])
        .output();
    return;
}
#[tauri::command]
async fn get_cbmem() -> String {
    let cmd_cbmem: Result<std::process::Output, std::io::Error> =
        std::process::Command::new("C:\\Program Files\\crosec\\cbmem").output();
    let cbmem: String = match cmd_cbmem {
        Ok(output) => String::from_utf8_lossy(&output.stdout).to_string(),
        Err(e) => {
            println!("cbmemError `{}`.", e);
            String::from("") // This match returns a blank string.
        }
    };
    return String::from(cbmem);
}
