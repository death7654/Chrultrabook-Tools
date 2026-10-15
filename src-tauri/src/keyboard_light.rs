pub fn parse_brightness(output: &str) -> Result<u8, String> {
    let text = output.trim();
    if text.eq_ignore_ascii_case("Keyboard backlight disabled.") { return Ok(0); }
    let value = text.strip_prefix("Current keyboard backlight percent:")
        .ok_or_else(|| "Invalid keyboard brightness response".to_string())?
        .trim().trim_end_matches('%').trim().parse::<u8>()
        .map_err(|_| "Invalid keyboard brightness response".to_string())?;
    if value > 100 { return Err("Invalid keyboard brightness response".into()); }
    Ok(value)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test] fn disabled_is_supported_zero() { assert_eq!(parse_brightness("Keyboard backlight disabled.").unwrap(), 0); }
    #[test] fn valid_percentages() {
        for value in [0, 30, 60, 100] {
            assert_eq!(parse_brightness(&format!("Current keyboard backlight percent: {value}\n")).unwrap(), value);
        }
    }
    #[test] fn rejects_command_errors() { assert!(parse_brightness("EC result 1 (INVALID_COMMAND)").is_err()); }
    #[test] fn rejects_out_of_range() { assert!(parse_brightness("Current keyboard backlight percent: 101").is_err()); }
    #[test] fn rejects_incomplete_response() { assert!(parse_brightness("Current keyboard backlight percent:").is_err()); }
    #[test] fn rejects_negative_response() { assert!(parse_brightness("Current keyboard backlight percent: -1").is_err()); }
}
