#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use hidapi::{HidApi, HidDevice};
use num_cpus;
#[cfg(windows)]
use std::os::windows::process::CommandExt;
use std::{env, fs};
use sysinfo::{CpuExt, System, SystemExt};
use tauri::{CustomMenuItem, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem};
use tauri::{Manager, Window};
use tauri_plugin_autostart::MacosLauncher;

#[cfg(target_os = "linux")]
const EC: &str = "ectool";
#[cfg(windows)]
const EC: &str = "C:\\Program Files\\crosec\\ectool";
#[cfg(target_os = "macos")]
const EC: &str = "/usr/local/bin/ectool";

#[cfg(target_os = "linux")]
const MEM: &str = "cbmem";
#[cfg(windows)]
const MEM: &str = "C:\\Program Files\\crosec\\cbmem";
//#[cfg(target_os = "macos")]
//const MEM: &str = "";

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
                        app.get_window("main").unwrap().show().unwrap();
                    }
                    "quit" => {
                        match_result(exec(EC, Some(vec!["autofanctrl"])));
                        std::process::exit(0);
                    }
                    _ => {}
                }
            }
            SystemTrayEvent::LeftClick { .. } => {
                app.get_window("main").unwrap().show().unwrap();
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            quit_cmd,
            close_splashscreen,
            check_os,
            get_cpu_usage,
            get_temp_ec,
            get_temp_sys,
            get_ram_usage,
            get_bios_version,
            get_board_name,
            manufacturer,
            get_cpu_cores,
            get_cpu_threads,
            get_cpu_name,
            get_hostname,
            get_fan_rpm,
            set_battery_limit,
            custom_fan_speeds,
            ectool,
            cbmem,
            get_system_info,
            chargecontrol,
            set_activity_light,
            check_ec
        ])
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--flag1", "--flag2"]),
        ))
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            println!("{}, {argv:?}, {cwd}", app.package_info().name);
        }))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn quit_cmd(window: Window) {
    match_result(exec(EC, Some(vec!["autofanctrl"])));
    window.close().unwrap();
}

#[tauri::command]
async fn check_os() -> String {
    return env::consts::OS.to_string();
}

#[tauri::command]
async fn close_splashscreen(window: Window) {
    // Close splashscreen
    window
        .get_window("splashscreen")
        .expect("no window labeled 'splashscreen' found")
        .close()
        .unwrap();
    // Show main window
    window
        .get_window("main")
        .expect("no window labeled 'main' found")
        .show()
        .unwrap();
}

#[tauri::command]
async fn get_cpu_usage() -> String {
    #[cfg(any(target_os = "linux", target_os = "macos"))]
    {
        let mut sys = System::new();
        sys.refresh_cpu();
        let usage = sys.global_cpu_info().cpu_usage();
        std::thread::sleep(System::MINIMUM_CPU_UPDATE_INTERVAL);
        let cpu_usage = usage.round();
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
async fn get_ram_usage() -> String {
    let mut sys = System::new();
    sys.refresh_memory();

    let ram_total = sys.total_memory();
    let ram_usage = sys.used_memory();
    let ram_percent = ram_usage * 100 / ram_total;
    return ram_percent.to_string();
}

#[tauri::command]
async fn get_temp_sys() -> i16 {
    let paths = match fs::read_dir("/sys/class/hwmon/") {
        Ok(out) => out,
        Err(_err) => return 0,
    };
    for path in paths {
        let name = fs::read_to_string(format!("{}/name", path.as_ref().unwrap().path().display()))
            .unwrap();
        if name.contains("k10temp") || name.contains("coretemp") {
            match fs::read_to_string(format!(
                "{}/temp1_input",
                path.as_ref().unwrap().path().display()
            ))
            .unwrap()
            .split('\n')
            .collect::<Vec<_>>()[0]
                .parse::<i16>()
            {
                Ok(i) => return i / 1000,
                Err(_err) => return 0,
            };
        };
    }
    return 0;
}

#[tauri::command]
async fn get_temp_ec() -> i16 {
    let ec_temps = match_result(exec(EC, Some(vec!["temps", "all"])));
    let mut sensors: i16 = 0;
    let temps: i16 = ec_temps
        .split("\n")
        .into_iter()
        .map(|l: &str| {
            match l.split("C)").collect::<Vec<_>>()[0]
                .trim()
                .split(" ")
                .collect::<Vec<_>>()
                .last()
            {
                Some(temp) => match temp.parse::<i16>() {
                    Ok(num) => {
                        sensors += 1;
                        return num;
                    }
                    Err(_e) => return 0,
                },
                None => return 0,
            }
        })
        .collect::<Vec<_>>()
        .iter()
        .sum();

    if sensors == 0 || temps == 0 {
        if env::consts::OS == "linux" {
            return get_temp_sys().await;
        } // */
        return 0;
    }
    return temps / sensors;
}

#[tauri::command]
async fn get_bios_version() -> String {
    #[cfg(target_os = "macos")]
    return String::from("unknown");

    #[cfg(target_os = "linux")]
    return match_result(exec("cat", Some(vec!["/sys/class/dmi/id/bios_version"])));

    #[cfg(windows)]
    return match_result_vec(exec("wmic", Some(vec!["bios", "get", "smbiosbiosversion"])));
}

#[tauri::command]
async fn get_board_name() -> String {
    #[cfg(target_os = "macos")]
    return String::from("unknown");

    #[cfg(target_os = "linux")]
    return match_result(exec("cat", Some(vec!["/sys/class/dmi/id/product_name"])));

    #[cfg(windows)]
    return match_result_vec(exec("wmic", Some(vec!["baseboard", "get", "Product"])));
}

#[tauri::command]
async fn manufacturer() -> String {
    #[cfg(target_os = "macos")]
    {
        //Main.js expects "Google", but everything is spoofed. Check ectool version for MrChromebox...?
        if match_result(exec(EC, Some(vec!["version"]))).contains("MrChromebox") {
            return String::from("Google");
        }
        return String::from("Apple");
    }

    #[cfg(target_os = "linux")]
    return match_result(exec("cat", Some(vec!["/sys/class/dmi/id/sys_vendor"])));

    #[cfg(windows)]
    return match_result_vec(exec("wmic", Some(vec!["baseboard", "get", "manufacturer"])));
}

#[tauri::command]
async fn get_cpu_cores() -> String {
    let num = num_cpus::get_physical();
    return num.to_string();
}
#[tauri::command]
async fn get_cpu_threads() -> String {
    let num = num_cpus::get();
    return num.to_string();
}

#[tauri::command]
async fn get_cpu_name() -> String {
    #[cfg(target_os = "macos")]
    return match_result(exec("sysctl", Some(vec!["-n", "machdep.cpu.brand_string"])));

    #[cfg(target_os = "linux")]
    {
        let mut cpuname = "";
        let cpuinfo = fs::read_to_string("/proc/cpuinfo").unwrap();
        for line in cpuinfo.split("\n").collect::<Vec<_>>() {
            if line.starts_with("model name") {
                cpuname = line.split(":").collect::<Vec<_>>()[1].trim();
                break;
            }
        }
        return String::from(cpuname);
    }

    #[cfg(windows)]
    return match_result_vec(exec("wmic", Some(vec!["cpu", "get", "name"])));
}

#[tauri::command]
async fn get_hostname() -> String {
    #[cfg(target_os = "macos")]
    return match_result(exec("sysctl", Some(vec!["-n", "kern.hostname"])));

    #[cfg(target_os = "linux")]
    return match_result(exec("cat", Some(vec!["/proc/sys/kernel/hostname"])));

    #[cfg(windows)]
    return match_result(exec("hostname", None));
}

#[tauri::command]
async fn get_fan_rpm() -> String {
    let output: String = match_result(exec(EC, Some(vec!["pwmgetfanrpm"])));
    let array: Vec<&str> = output.split(" ").collect::<Vec<_>>();
    if array.len() == 4 {
        return array[3].to_string();
    } else {
        return "0".to_string();
    }
}

#[tauri::command]
async fn set_battery_limit(value: String, value2: String) -> String {
    return match_result(exec(
        EC,
        Some(vec![
            "chargecontrol",
            "normal",
            &value.as_str(),
            &value2.as_str(),
        ]),
    ));
}

#[tauri::command]
async fn custom_fan_speeds(value: Vec<u8>) {
    let cpu_temp: f64 = get_temp_ec().await as f64;
    if cpu_temp < 40.0 {
        ectool("fanduty".to_string(), "0".to_string()).await;
    }
    if cpu_temp >= 80.0 {
        ectool("fanduty".to_string(), "100".to_string()).await;
    }
    let base_value = cpu_temp - 40.0;
    let avaliable_percentages = [1.0, 0.2, 0.4, 0.6, 0.8];
    let percentages = avaliable_percentages[base_value as usize % 5];
    let mut index = (base_value - (base_value % 5.0)) / 5.0;
    let temp1 = value[index as usize];
    index = index + 1.0;
    let temp2 = value[index as usize];

    if cpu_temp % 5.0 == 0.0 {
        ectool("fanduty".to_string(), temp1.to_string()).await;
    } else {
        let calculate_fan_speed_between =
            (temp2 as f64 - temp1 as f64) * percentages + temp1 as f64;
        let fan_speed_between = calculate_fan_speed_between as i16;
        ectool("fanduty".to_string(), fan_speed_between.to_string()).await;
    }
}

#[tauri::command]
async fn ectool(value: String, value2: String) -> String {
    return match_result(exec(EC, Some(vec![&value.as_str(), &value2.as_str()])));
}

#[tauri::command]
async fn cbmem(value: String) -> String {
    #[cfg(target_os = "macos")]
    return String::from("Not available on this platform");

    #[cfg(any(windows, target_os = "linux"))]
    return match_result(exec(MEM, Some(vec![&value])));
}

#[tauri::command]
async fn get_system_info(value: String) -> String {
    let requested_info: String = match value.as_str() {
        "Boot Timestamps" => cbmem("-t".to_string()).await,
        "Coreboot Log" => cbmem("-c1".to_string()).await,
        "Coreboot Extended Log" => cbmem("-c".to_string()).await,
        "EC Console Log" => ectool("console".to_string(), " ".to_string()).await,
        "Battery Info" => ectool("battery".to_string(), "".to_string()).await,
        "EC Chip Info" => ectool("chipinfo".to_string(), " ".to_string()).await,
        "SPI Info" => ectool("flashspiinfo".to_string(), " ".to_string()).await,
        "EC Protocol Info" => ectool("protoinfo".to_string(), " ".to_string()).await,
        "Temp Sensor Info" => ectool("tempsinfo".to_string(), "all".to_string()).await,
        "Power Delivery Info" => ectool("pdlog".to_string(), " ".to_string()).await,
        _ => "Please Select Something".to_string(),
    };
    return requested_info.to_string();
}

#[tauri::command]
async fn chargecontrol() -> Option<String> {
    return Some(match_result(exec(EC, Some(vec!["chargecontrol"]))));
}

#[tauri::command]
async fn set_activity_light(color: String) {
    let hid_dev = &HidApi::new().unwrap();
    let activity_light: HidDevice = match HidApi::open(hid_dev, 0x04d8, 0x0b28) {
        Ok(dev) => dev,
        Err(_err) => match HidApi::open(hid_dev, 0x046d, 0xc33c) {
            Ok(dev) => dev,
            Err(_e) => return,
        },
    };

    let color_data: [u8; 4] = match color.as_str() {
        "Red" => [17, 1, 127, 32],
        "Green" => [17, 2, 146, 32],
        "Blue" => [17, 3, 165, 32],
        "Yellow" => [17, 4, 184, 32],
        "Magenta" => [17, 5, 203, 32],
        "Cyan" => [17, 6, 222, 32],
        "White" => [17, 7, 241, 32],
        "Black" => [17, 8, 5, 32],
        _ => [0, 0, 0, 0],
    };
    let right_array: [u8; 60] = [
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        255, 255, 255, 255, 255, 255,
    ];
    let command: [u8; 64] = {
        let mut whole: [u8; 64] = [0; 64];
        let (one, two) = whole.split_at_mut(color_data.len());
        one.copy_from_slice(&color_data);
        two.copy_from_slice(&right_array);
        whole
    };
    activity_light.write(&command).unwrap();
}

#[tauri::command]
async fn check_ec() -> bool {
    return exec(EC, Some(vec!["hello"])).is_ok();
}

fn exec(program: &str, args: Option<Vec<&str>>) -> Result<std::process::Output, std::io::Error> {
    let mut cmd = std::process::Command::new(program);
    #[cfg(windows)]
    cmd.creation_flags(0x08000000);
    if let Some(arg_vec) = args {
        for arg in arg_vec {
            cmd.arg(arg);
        }
    }
    return cmd.output();
}

fn match_result(result: Result<std::process::Output, std::io::Error>) -> String {
    let str = match result {
        Ok(output) => String::from_utf8_lossy(&output.stdout).to_string(),
        Err(e) => {
            let error_string = e.to_string();
            if error_string.find("os error 2").is_some() {
                println!("Missing Ectools or Cbmem Binaries");
            } else {
                println!("Error `{}`.", e);
            }
            return e.to_string();
        }
    };
    return str.trim().to_string();
}

#[cfg(windows)]
fn match_result_vec(result: Result<std::process::Output, std::io::Error>) -> String {
    let str = match result {
        Ok(output) => String::from_utf8_lossy(&output.stdout)
            .split("\n")
            .map(|x| x.to_string())
            .collect::<Vec<String>>()[1]
            .clone(),
        Err(e) => {
            let error_string = e.to_string();
            if error_string.find("os error 2") != None {
                println!("Missing Ectools or Cbmem Binaries");
            } else {
                println!("Error `{}`.", e);
            }
            return "0".to_string();
        }
    };
    return str.trim().to_string();
}
