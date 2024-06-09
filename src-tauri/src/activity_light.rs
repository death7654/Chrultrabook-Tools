use hidapi::{HidApi, HidDevice};

pub fn set_color(color: String) {
    let hid_dev = &HidApi::new().unwrap();
    let device: HidDevice = match HidApi::open(hid_dev, 0x04d8, 0x0b28) {
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
    let filler: [u8; 60] = [
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        255, 255, 255, 255, 255, 255,
    ];
    let command: [u8; 64] = {
        let mut whole: [u8; 64] = [0; 64];
        let (one, two) = whole.split_at_mut(color_data.len());
        one.copy_from_slice(&color_data);
        two.copy_from_slice(&filler);
        whole
    };
    device.write(&command).unwrap();
}
