use std::fs::{self, File};
use std::io::Write;
use std::mem;
use std::path::Path;
use std::io;

use serde::{Serialize, Deserialize};
use serde_json;
use tauri_plugin_dialog::DialogExt;

// config file location
const CONFIG_PATH: &str = "C:\\Windows\\System32\\drivers\\croskbsettings.bin";
const BACKUP_PATH: &str = "C:\\kbremapbackups\\croskbsettings.bin";

// Keycodes and constants
const K_LCTRL: u16 = 0x1D;
const K_LALT: u16 = 0x38;
const K_LSHFT: u16 = 0x2A;
const K_LWIN: u16 = 0x5B;
const K_RSHFT: u16 = 0x36;

const K_BACKSP: u16 = 0x0E;
const K_DELETE: u16 = 0x53;
const K_LOCK: u16 = 0x5D;

const K_UP: u16 = 0x48;
const K_DOWN: u16 = 0x50;
const K_LEFT: u16 = 0x4B;
const K_RIGHT: u16 = 0x4D;

const K_PGUP: u16 = 0x49;
const K_HOME: u16 = 0x47;
const K_END: u16 = 0x4F;
const K_PGDN: u16 = 0x51;

// Vivaldi Keycodes
const VIVALDI_BACK: u16 = 0x6A;
const VIVALDI_FWD: u16 = 0x69;
const VIVALDI_REFRESH: u16 = 0x67;
const VIVALDI_FULLSCREEN: u16 = 0x11;
const VIVALDI_OVERVIEW: u16 = 0x12;
const VIVALDI_SNAPSHOT: u16 = 0x13;
const VIVALDI_BRIGHTNESS_DN: u16 = 0x14;
const VIVALDI_BRIGHTNESS_UP: u16 = 0x15;
const VIVALDI_PRIVACY_TOGGLE: u16 = 0x16;
const VIVALDI_KBD_BKLIGHT_DOWN: u16 = 0x17;
const VIVALDI_KBD_BKLIGHT_UP: u16 = 0x18;
const VIVALDI_KBD_BKLIGHT_TOGGLE: u16 = 0x1E;
const VIVALDI_PLAY_PAUSE: u16 = 0x1A;
const VIVALDI_MUTE: u16 = 0x20;
const VIVALDI_VOL_DN: u16 = 0x2E;
const VIVALDI_VOL_UP: u16 = 0x30;
const VIVALDI_NEXT_TRACK: u16 = 0x19;
const VIVALDI_PREV_TRACK: u16 = 0x10;
const VIVALDI_MIC_MUTE: u16 = 0x1B;

const KEY_BREAK: u16 = 1;
const KEY_E0: u16 = 2;

// C++ multi-char literal 'CrKB' on little-endian systems stores bytes as: 42 4B 72 43
// Which reads as "BKrC" in ASCII. We need to match this exact byte sequence.
const CFG_MAGIC: u32 = u32::from_le_bytes(*b"BKrC");

const FUNCTION_KEYS: [u16; 16] = [
    0x3B, 0x3C, 0x3D, 0x3E, 0x3F, 0x40, 0x41, 0x42, 0x43, 0x44, 0x57, 0x58,
    0x64, 0x65, 0x66, 0x67, // F13-F16
];

// enums on c and rust are not the same, hence this structure
type RemapCfgKeyState = i32;
const KEY_STATE_NO_DETECT: i32 = 0;
const KEY_STATE_ENFORCE: i32 = 1;
const KEY_STATE_ENFORCE_NOT: i32 = 2;

type RemapCfgOverride = i32;
const REMAP_AUTO_DETECT: i32 = 0;
const REMAP_ENABLE: i32 = 1;
const REMAP_DISABLE: i32 = 2;

// binary structures
#[repr(C, packed(1))]
#[derive(Debug, Copy, Clone)]
struct RemapCfgKey {
    make_code: u16,
    flags: u16,
}

impl RemapCfgKey {
    const fn new() -> Self {
        Self {
            make_code: 0,
            flags: 0,
        }
    }

    const fn with_values(make_code: u16, flags: u16) -> Self {
        Self { make_code, flags }
    }
}

#[repr(C, packed(1))]
#[derive(Copy, Clone)]
struct RemapCfg {
    left_ctrl: i32,
    left_alt: i32,
    search: i32,
    assistant: i32,
    left_shift: i32,
    right_ctrl: i32,
    right_alt: i32,
    right_shift: i32,
    original_key: RemapCfgKey,
    remap_vivaldi_to_fn_keys: u8,
    remapped_key: RemapCfgKey,
    additional_keys: [RemapCfgKey; 8],
}

impl RemapCfg {
    fn new() -> Self {
        Self {
            left_ctrl: KEY_STATE_NO_DETECT,
            left_alt: KEY_STATE_NO_DETECT,
            search: KEY_STATE_NO_DETECT,
            assistant: KEY_STATE_NO_DETECT,
            left_shift: KEY_STATE_NO_DETECT,
            right_ctrl: KEY_STATE_NO_DETECT,
            right_alt: KEY_STATE_NO_DETECT,
            right_shift: KEY_STATE_NO_DETECT,
            original_key: RemapCfgKey::new(),
            remap_vivaldi_to_fn_keys: 0,
            remapped_key: RemapCfgKey::new(),
            additional_keys: [RemapCfgKey::new(); 8],
        }
    }
}

#[repr(C, packed(1))]
struct RemapCfgsHeader {
    magic: u32,
    remappings: u32,
    flip_search_and_assistant_on_pixelbook: u8,
    has_assistant_key: i32,
    is_non_chrome_ec: i32,
}

// json structures

#[derive(Debug, Serialize, Deserialize, Clone)]
struct RemapCfgKeyJson {
    make_code: u16,
    #[serde(skip_serializing_if = "String::is_empty", default)]
    make_code_hex: String,
    flags: u16,
    #[serde(skip_serializing_if = "Vec::is_empty", default)]
    flags_decoded: Vec<String>,
}

impl RemapCfgKeyJson {
    fn new(make_code: u16, flags: u16) -> Self {
        let mut flags_decoded = Vec::new();
        if flags & 0x0001 != 0 { flags_decoded.push("KEY_BREAK".to_string()); }
        if flags & 0x0002 != 0 { flags_decoded.push("KEY_E0".to_string()); }
        if flags & 0x0004 != 0 { flags_decoded.push("KEY_E1".to_string()); }
        
        Self {
            make_code,
            make_code_hex: format!("0x{:02X}", make_code),
            flags,
            flags_decoded,
        }
    }
    
    fn is_empty(&self) -> bool {
        self.make_code == 0 && self.flags == 0
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct ConfigEntryJson {
    index: u32,    
    left_ctrl: String,
    left_alt: String,
    search: String,
    assistant: String,
    left_shift: String,
    right_ctrl: String,
    right_alt: String,
    right_shift: String,
    
    original_key: RemapCfgKeyJson,
    remap_vivaldi_to_fn: bool,
    
    remapped_key: Option<RemapCfgKeyJson>,
    
    additional_keys: Vec<RemapCfgKeyJson>,
}

fn is_no_detect(s: &String) -> bool {
    s == "NoDetect"
}

#[derive(Debug, Serialize, Deserialize)]
struct ConfigFileJson {
    magic: String,
    magic_hex: String,
    valid: bool,
    remappings: u32,
    flip_search_and_assistant_on_pixelbook: bool,
    has_assistant_key: String,
    is_non_chrome_ec: String,
    file_size_bytes: usize,
    expected_size_bytes: usize,
    configs: Vec<ConfigEntryJson>,
}



// config generators

pub fn generate_config_from_json(app: tauri::AppHandle, json_data: &str) -> Result<(), Box<dyn std::error::Error>> {
    
    let config_json: ConfigFileJson = serde_json::from_str(&json_data)?;
    
    println!("Loaded {} configuration entries from JSON", config_json.configs.len());
    
    // validate
    if config_json.configs.len() > 255 {
        return Err("Too many configurations (max 255)".into());
    }
    
    let num_configs = config_json.configs.len();
    let header_size = mem::size_of::<RemapCfgsHeader>();
    let cfg_size = mem::size_of::<RemapCfg>();
    let total_size = header_size + cfg_size * num_configs;
    
    // println!("Generating binary config:");
    // println!("  Header size: {} bytes", header_size);
    // println!("  Config entry size: {} bytes", cfg_size);
    // println!("  Number of configs: {}", num_configs);
    // println!("  Total size: {} bytes\n", total_size);
    
    let mut buffer = vec![0u8; total_size];
    
    // Write header
    unsafe {
        let header = buffer.as_mut_ptr() as *mut RemapCfgsHeader;
        (*header).magic = CFG_MAGIC;
        (*header).remappings = num_configs as u32;
        (*header).flip_search_and_assistant_on_pixelbook = if config_json.flip_search_and_assistant_on_pixelbook { 1 } else { 0 };
        (*header).has_assistant_key = match config_json.has_assistant_key.as_str() {
            "Enable" => REMAP_ENABLE,
            "Disable" => REMAP_DISABLE,
            _ => REMAP_AUTO_DETECT,
        };
        (*header).is_non_chrome_ec = match config_json.is_non_chrome_ec.as_str() {
            "Enable" => REMAP_ENABLE,
            "Disable" => REMAP_DISABLE,
            _ => REMAP_AUTO_DETECT,
        };
    }
    
    // get mutable slice for configs
    let cfg_array = unsafe {
        let ptr = buffer.as_mut_ptr().add(header_size);
        std::slice::from_raw_parts_mut(ptr as *mut RemapCfg, num_configs)
    };
    
    // parse and write each config entry
    for (i, json_config) in config_json.configs.iter().enumerate() {
        let mut cfg = RemapCfg::new();
        
        // parse modifier states
        cfg.left_ctrl = parse_key_state(&json_config.left_ctrl);
        cfg.left_alt = parse_key_state(&json_config.left_alt);
        cfg.search = parse_key_state(&json_config.search);
        cfg.assistant = parse_key_state(&json_config.assistant);
        cfg.left_shift = parse_key_state(&json_config.left_shift);
        cfg.right_ctrl = parse_key_state(&json_config.right_ctrl);
        cfg.right_alt = parse_key_state(&json_config.right_alt);
        cfg.right_shift = parse_key_state(&json_config.right_shift);
        
        // parse original key
        cfg.original_key = RemapCfgKey::with_values(
            json_config.original_key.make_code,
            json_config.original_key.flags,
        );
        
        // parse remap flag
        cfg.remap_vivaldi_to_fn_keys = if json_config.remap_vivaldi_to_fn { 1 } else { 0 };
        
        // parse remapped key
        if let Some(ref remapped) = json_config.remapped_key {
            cfg.remapped_key = RemapCfgKey::with_values(
                remapped.make_code,
                remapped.flags,
            );
        }
        
        // parse additional keys
        for (j, add_key) in json_config.additional_keys.iter().enumerate() {
            if j < 8 {
                cfg.additional_keys[j] = RemapCfgKey::with_values(
                    add_key.make_code,
                    add_key.flags,
                );
            }
        }
        
        cfg_array[i] = cfg;
    }

    app.dialog()
    .file()
    .set_file_name("croskbsettings.bin")
    .add_filter("Binary File", &["bin"]) 
    .save_file(move |file_path| {
        if let Some(ref _out) = file_path {
            let file = file_path.unwrap();
            fs::write(file.to_string(), &buffer).expect("unable to write")        
        } 
    });
        
    Ok(())
}

fn parse_key_state(state_str: &str) -> i32 {
    match state_str {
        "Enforce" => KEY_STATE_ENFORCE,
        "EnforceNot" => KEY_STATE_ENFORCE_NOT,
        _ => KEY_STATE_NO_DETECT,
    }
}

pub fn read_config(hard_reset: bool) -> String {

    // read file
    let path: &str;
    if !hard_reset
    {
        path = CONFIG_PATH;
    }
    else
    {
        path = BACKUP_PATH;
    }
    let data = match fs::read(path) {
        Ok(d) => d,
        Err(e) => {
            println!("Error reading file: {}", e);
            return String::new();
        }
    };

    // validate minimum file size
    if data.len() < 17 {
        println!("File too small (need at least 17 bytes for header, got {})", data.len());
        return String::new();
    }
    
    // Read magic (0x0000-0x0003)
    let magic_bytes = &data[0..4];
    let magic_u32 = bytes_to_u32(magic_bytes).unwrap();
    let magic_str = String::from_utf8_lossy(magic_bytes).to_string();

    let valid = magic_u32 == CFG_MAGIC;

    if !valid {
        println!("Invalid magic number: expected 0x{:08X}, got 0x{:08X} ('{}')", 
                 CFG_MAGIC, magic_u32, magic_str);
        return String::new();
    }

    // println!("Valid CrosKB settings file");
    // println!("  Magic: '{}' (0x{:08X})", magic_str, magic_u32);

    // Read remappings (0x0004-0x0007)
    let remappings = bytes_to_u32(&data[4..8]).unwrap();
    // println!("  Number of remappings: {}", remappings);

    // Read flip_search_assistant (0x0008)
    let flip_search_assistant = data[8] != 0;
    // println!("  Flip search and assistant: {}", flip_search_assistant);

    // Read has_assistant_key (0x0009-0x000C)
    let has_assistant_key = bytes_to_i32(&data[0x0009..0x000D]).unwrap();
    let has_assistant_str = match has_assistant_key {
        0 => "AutoDetect",
        1 => "Enable",
        2 => "Disable",
        _ => "Unknown",
    };
    // println!("  Has assistant key: {} ({})", has_assistant_key, has_assistant_str);

    // Read is_non_chrome_ec (0x000D-0x0010)
    let is_non_chrome_ec = bytes_to_i32(&data[0x000D..0x0011]).unwrap();
    let is_non_chrome_ec_str = match is_non_chrome_ec {
        0 => "AutoDetect",
        1 => "Enable",
        2 => "Disable",
        _ => "Unknown",
    };
    // println!("  Is non-Chrome EC: {} ({})", is_non_chrome_ec, is_non_chrome_ec_str);

    // println!("\nConfiguration Entries\n");

    let expected_size = 17 + (remappings as usize * 73);
    if data.len() < expected_size {
        println!("Warning: File size mismatch. Expected {} bytes, got {} bytes", 
                 expected_size, data.len());
    }

    let available_configs = (data.len() - 17) / 73;
    let configs_to_read = remappings.min(available_configs as u32);

    let mut configs = Vec::new();

    for i in 0..configs_to_read {
        let offset = 17 + (i as usize * 73);
        
        if offset + 73 > data.len() {
            println!("Config {}: Incomplete (not enough data)", i);
            break;
        }

        let config_data = &data[offset..offset + 73];
        
        // Read modifier states
        let left_ctrl = bytes_to_i32(&config_data[0x00..0x04]).unwrap();
        let left_alt = bytes_to_i32(&config_data[0x04..0x08]).unwrap();
        let search = bytes_to_i32(&config_data[0x08..0x0C]).unwrap();
        let assistant = bytes_to_i32(&config_data[0x0C..0x10]).unwrap();
        let left_shift = bytes_to_i32(&config_data[0x10..0x14]).unwrap();
        let right_ctrl = bytes_to_i32(&config_data[0x14..0x18]).unwrap();
        let right_alt = bytes_to_i32(&config_data[0x18..0x1C]).unwrap();
        let right_shift = bytes_to_i32(&config_data[0x1C..0x20]).unwrap();

        // Read original key
        let orig_make_code = bytes_to_u16(&config_data[0x20..0x22]).unwrap();
        let orig_flags = bytes_to_u16(&config_data[0x22..0x24]).unwrap();

        // Read remap flag
        let remap_vivaldi = config_data[0x24] != 0;

        // Read remapped key
        let remap_make_code = bytes_to_u16(&config_data[0x25..0x27]).unwrap();
        let remap_flags = bytes_to_u16(&config_data[0x27..0x29]).unwrap();

        // Read additional keys
        let mut additional_keys_vec = Vec::new();
        for j in 0..8 {
            let key_offset = 0x29 + (j * 4);
            let make_code = bytes_to_u16(&config_data[key_offset..key_offset + 2]).unwrap();
            let flags = bytes_to_u16(&config_data[key_offset + 2..key_offset + 4]).unwrap();
            
            if make_code != 0 || flags != 0 {
                additional_keys_vec.push(RemapCfgKeyJson::new(make_code, flags));
            }
        }

        // Create JSON entry
        let remapped_key_obj = RemapCfgKeyJson::new(remap_make_code, remap_flags);
        
        let config_entry = ConfigEntryJson {
            index: i,
            left_ctrl: format_key_state(left_ctrl).to_string(),
            left_alt: format_key_state(left_alt).to_string(),
            search: format_key_state(search).to_string(),
            assistant: format_key_state(assistant).to_string(),
            left_shift: format_key_state(left_shift).to_string(),
            right_ctrl: format_key_state(right_ctrl).to_string(),
            right_alt: format_key_state(right_alt).to_string(),
            right_shift: format_key_state(right_shift).to_string(),
            original_key: RemapCfgKeyJson::new(orig_make_code, orig_flags),
            remap_vivaldi_to_fn: remap_vivaldi,
            remapped_key: if remapped_key_obj.is_empty() { None } else { Some(remapped_key_obj) },
            additional_keys: additional_keys_vec.clone(),
        };

        // Print config entry
        // println!("Config Entry {}:", i);
        // println!("  File offset: 0x{:04X}", offset);
        
        // Print modifiers if not NoDetect (0)
        let mut modifiers = Vec::new();
        if left_ctrl != 0 { modifiers.push(format!("LeftCtrl={}", format_key_state(left_ctrl))); }
        if left_alt != 0 { modifiers.push(format!("LeftAlt={}", format_key_state(left_alt))); }
        if search != 0 { modifiers.push(format!("Search={}", format_key_state(search))); }
        if assistant != 0 { modifiers.push(format!("Assistant={}", format_key_state(assistant))); }
        if left_shift != 0 { modifiers.push(format!("LeftShift={}", format_key_state(left_shift))); }
        if right_ctrl != 0 { modifiers.push(format!("RightCtrl={}", format_key_state(right_ctrl))); }
        if right_alt != 0 { modifiers.push(format!("RightAlt={}", format_key_state(right_alt))); }
        if right_shift != 0 { modifiers.push(format!("RightShift={}", format_key_state(right_shift))); }
        
        if !modifiers.is_empty() {
            println!("  Modifiers: {}", modifiers.join(", "));
        }

        // println!("  Original key: 0x{:02X} (flags: {})", orig_make_code, format_flags(orig_flags));
        
        // if remap_vivaldi {
        //     println!("  Remap to: Vivaldi -> Function key");
        // } else if remap_make_code != 0 || remap_flags != 0 {
        //     println!("  Remap to: 0x{:02X} (flags: {})", remap_make_code, format_flags(remap_flags));
        // }

        // if !additional_keys_vec.is_empty() {
        //     println!("  Additional keys:");
        //     for (idx, key) in additional_keys_vec.iter().enumerate() {
        //         println!("    [{}] 0x{:02X} (flags: {})", idx, key.make_code, 
        //                  if key.flags_decoded.is_empty() { "NONE".to_string() } else { key.flags_decoded.join("|") });
        //     }
        // }

        // println!();
        
        configs.push(config_entry);
    }

    println!("Successfully read {} configuration entries", configs_to_read);

    // Create and write JSON output
    let json_output = ConfigFileJson {
        magic: magic_str,
        magic_hex: format!("0x{:08X}", magic_u32),
        valid,
        remappings,
        flip_search_and_assistant_on_pixelbook: flip_search_assistant,
        has_assistant_key: has_assistant_str.to_string(),
        is_non_chrome_ec: is_non_chrome_ec_str.to_string(),
        file_size_bytes: data.len(),
        expected_size_bytes: expected_size,
        configs,
    };

    match serde_json::to_string_pretty(&json_output) {
        Ok(json_string) => {
            return json_string;
        }
        Err(e) => {
            println!("\nError serializing to JSON: {}", e);
            return String::new();
        }
    }
}


pub fn create_backup() -> io::Result<()> {
    let backup_dir = Path::new("C:\\kbremapbackups");

    if !backup_dir.is_dir() {
        fs::create_dir_all(backup_dir)?;
    }

    fs::copy(CONFIG_PATH, backup_dir.join("croskbsettings.bin"))?;

    Ok(())
}


//helper 
fn bytes_to_u32(bytes: &[u8]) -> Option<u32> {
    if bytes.len() < 4 {
        return None;
    }
    Some(u32::from_le_bytes([bytes[0], bytes[1], bytes[2], bytes[3]]))
}

fn bytes_to_i32(bytes: &[u8]) -> Option<i32> {
    if bytes.len() < 4 {
        return None;
    }
    Some(i32::from_le_bytes([bytes[0], bytes[1], bytes[2], bytes[3]]))
}

fn bytes_to_u16(bytes: &[u8]) -> Option<u16> {
    if bytes.len() < 2 {
        return None;
    }
    Some(u16::from_le_bytes([bytes[0], bytes[1]]))
}

fn format_key_state(state: i32) -> &'static str {
    match state {
        0 => "NoDetect",
        1 => "Enforce",
        2 => "EnforceNot",
        _ => "Unknown",
    }
}

fn format_flags(flags: u16) -> String {
    let mut flag_strs = Vec::new();
    
    if flags & 0x0001 != 0 { flag_strs.push("BREAK"); }
    if flags & 0x0002 != 0 { flag_strs.push("E0"); }
    if flags & 0x0004 != 0 { flag_strs.push("E1"); }
    
    if flag_strs.is_empty() {
        "NONE".to_string()
    } else {
        flag_strs.join("|")
    }
}
