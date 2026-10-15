#[allow(dead_code)]
fn get_temp_sys() -> u16 {
    let paths = match std::fs::read_dir("/sys/class/hwmon/") { Ok(paths) => paths, Err(_) => return 0 };
    paths.filter_map(Result::ok).filter_map(|entry| {
        let path = entry.path();
        let name = std::fs::read_to_string(path.join("name")).ok()?;
        if !name.contains("k10temp") && !name.contains("coretemp") { return None; }
        let value: u32 = std::fs::read_to_string(path.join("temp1_input")).ok()?.trim().parse().ok()?;
        let temp = value / 1000;
        (temp > 0 && temp <= 150).then_some(temp as u16)
    }).max().unwrap_or(0)
}

/// Selection indices stay tied to sensor rows, including unavailable sensors.
pub fn sensor_rows(output: &str) -> impl Iterator<Item = (&str, Option<u16>)> {
    output.lines().filter_map(|line| {
        let (name, rest) = line.trim().split_once(char::is_whitespace)?;
        let (kelvin, _) = rest.trim().split_once(" K")?;
        let kelvin: u16 = kelvin.trim().parse().ok()?;
        let temperature = rest.split_once("(=")
            .and_then(|(_, value)| value.split_once(" C)"))
            .and_then(|(value, _)| value.trim().parse::<u16>().ok())
            .filter(|value| *value > 0 && *value <= 150 && kelvin >= 273);
        Some((name, temperature))
    })
}

pub fn get_temp(ec_temps: String, sensors: String, changes: bool) -> u16 {
    let selected: Vec<bool> = sensors.split_whitespace()
        .map(|value| !value.eq_ignore_ascii_case("false")).collect();
    let filter = changes && selected.iter().any(|value| *value);
    let maximum = sensor_rows(&ec_temps).enumerate().filter_map(|(index, (_, value))| {
        if filter && !selected.get(index).copied().unwrap_or(true) { None } else { value }
    }).max().unwrap_or(0);
    #[cfg(target_os = "linux")]
    if maximum == 0 { return get_temp_sys(); }
    maximum
}

#[cfg(test)]
mod tests {
    use super::*;
    const SAMPLE: &str = "--sensor name --- temperature ---\nDDR 314 K (= 41 C) N/A\nSOC 319 K (= 46 C) N/A\nCharger 320 K (= 47 C) N/A\nRegulator 311 K (= 38 C) N/A";
    #[test] fn maximum_ignores_headers_and_ratios() { assert_eq!(get_temp(SAMPLE.into(), "".into(), false), 47); }
    #[test] fn selection_is_respected() { assert_eq!(get_temp(SAMPLE.into(), "false true false false".into(), true), 46); }
    #[test] fn short_selection_includes_new_sensors() { assert_eq!(get_temp(SAMPLE.into(), "false true".into(), true), 47); }
    #[test] fn empty_selection_never_panics() { assert_eq!(get_temp(SAMPLE.into(), "".into(), true), 47); }
    #[test] fn all_false_settings_use_available_sensors() { assert_eq!(get_temp(SAMPLE.into(), "false false false false".into(), true), 47); }
    #[test] fn invalid_sensor_retains_slot() {
        let sample = "DDR 0 K (= -273 C) N/A\nSOC 320 K (= 47 C) N/A\nCharger 323 K (= 50 C) N/A";
        assert_eq!(get_temp(sample.into(), "false true false".into(), true), 47);
    }
    #[test] fn errors_are_not_sensors() { assert_eq!(sensor_rows("EC error 4\nERROR: 100").count(), 0); }
}
