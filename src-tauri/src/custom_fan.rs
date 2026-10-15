/// Map a CPU temperature (°C) to a fan duty cycle using a curve array.
///
/// The array holds duty percentages at 5°C steps starting at 30°C:
/// index 0 → 30°C, index 1 → 35°C, …, index 12 → 85°C.
/// Values between steps are linearly interpolated and clamped to 0–100.
/// Temperatures at or above 85°C always return 100.
pub fn calculate_fan_percentage(temp: u16, array: Vec<u8>) -> u8 {
    if array.is_empty() {
        return 0;
    }

    // Hot path: never leave the fan at 0% when at/above the top of the curve.
    if temp >= 85 {
        return 100;
    }

    const BASE: u16 = 30;
    const STEP: u16 = 5;

    // Temperatures at or below the first slot use the first curve point
    // (so the 30°C entry is live, unlike the old temp<=35 → 0 path).
    if temp <= BASE {
        return array[0].min(100);
    }

    let offset = temp - BASE;
    let idx = (offset / STEP) as usize;
    let last = array.len() - 1;

    if idx >= last {
        return array[last].min(100);
    }

    let t1 = array[idx] as f32;
    let t2 = array[idx + 1] as f32;
    let frac = (offset % STEP) as f32 / STEP as f32;
    let speed = t1 + (t2 - t1) * frac;
    speed.round().clamp(0.0, 100.0) as u8
}

#[cfg(test)]
mod tests {
    use super::calculate_fan_percentage;

    // Cooling curve from the handoff doc
    fn cooling() -> Vec<u8> {
        vec![40, 55, 70, 85, 95, 100, 100, 100, 100, 100, 100, 100, 100]
    }

    #[test]
    fn temp_85_is_full() {
        assert_eq!(calculate_fan_percentage(85, cooling()), 100);
    }

    #[test]
    fn temp_above_85_is_full() {
        assert_eq!(calculate_fan_percentage(90, cooling()), 100);
    }

    #[test]
    fn temp_30_uses_first_slot() {
        assert_eq!(calculate_fan_percentage(30, cooling()), 40);
    }

    #[test]
    fn temp_below_30_uses_first_slot() {
        assert_eq!(calculate_fan_percentage(25, cooling()), 40);
    }

    #[test]
    fn temp_55_is_full_on_cooling() {
        // index for 55°C = (55-30)/5 = 5 → 100
        assert_eq!(calculate_fan_percentage(55, cooling()), 100);
    }

    #[test]
    fn linear_interp_between_slots() {
        // 32°C: between 40 and 55, frac=0.4 → 40+15*0.4=46
        assert_eq!(calculate_fan_percentage(32, cooling()), 46);
    }

    #[test]
    fn empty_array_returns_zero() {
        assert_eq!(calculate_fan_percentage(50, vec![]), 0);
    }
}
