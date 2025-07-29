pub fn calculate_fan_percentage(temp: u16, array: Vec<u8>) -> u8 {
    let fan_speed: u8;
    if temp < 85 && temp > 35 {
        let cpu_temp = temp;
        let base_value = cpu_temp - 30;
        let avaliable_percentages = [1.0, 0.2, 0.4, 0.6, 0.8];
        let percentages = avaliable_percentages[base_value as usize % 5];
        let mut index = ((base_value - (base_value % 5)) as f32) / 5.0;
        let temp1: u8 = array[index as usize];
        index += 1.0;
        let temp2: u8 = array[index as usize];

        if cpu_temp % 5 == 0 {
            fan_speed = temp1;
        } else {
            let calculate_fan_speed_between = (temp2 - temp1) as f32 * percentages + temp1 as f32;
            fan_speed = calculate_fan_speed_between as u8;
        }
    } else if temp > 85 {
        fan_speed = 100;
    } else {
        fan_speed = 0;
    }
    fan_speed
}
