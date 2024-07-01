pub fn calculate_fan_percentage(temp: i16, array: Vec<i8>) -> i8 {
    let fan_speed;
    if temp < 85 && temp > 35 {
        let cpu_temp = temp as f64;
        let base_value = cpu_temp - 30.0;
        let avaliable_percentages = [1.0, 0.2, 0.4, 0.6, 0.8];
        let percentages = avaliable_percentages[base_value as usize % 5];
        let mut index = (base_value - (base_value % 5.0)) / 5.0;
        let temp1 = array[index as usize];
        index = index + 1.0;
        let temp2 = array[index as usize];

        if cpu_temp % 5.0 == 0.0 {
            fan_speed = temp1;
        } else {
            let calculate_fan_speed_between =
                (temp2 as f64 - temp1 as f64) * percentages + temp1 as f64;
            fan_speed = calculate_fan_speed_between as i8;
        }
    } else if temp > 85 {
        fan_speed = 100;
    } else {
        fan_speed = 0;
    }
    return fan_speed;
}
