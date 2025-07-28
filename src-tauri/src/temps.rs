use std::fs;

#[allow(dead_code)]
fn get_temp_sys() -> u16 {
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
            .unwrap_or("0".to_string())
            .split('\n')
            .collect::<Vec<_>>()[0]
                .parse::<u16>()
            {
                Ok(i) => return i / 1000,
                Err(_err) => return 0,
            };
        };
    }
    0
}

pub fn get_temp(ec_temps: String, sensors: String, changes: bool) -> u16 {
    let mut sensors_wanted = vec![];
    if changes {
        sensors_wanted = parse_bool_vec(&sensors);
    }

    let mut max_temp: u16 = 0;
    let mut counter: usize = 0;

    let mut vector = Vec::new();
    let _ = ec_temps
        .split("\n")
        .map(|l: &str| {
            match l.split("C)").collect::<Vec<_>>()[0]
                .trim()
                .split(" ")
                .collect::<Vec<_>>()
                .last()
            {
                Some(temp) => match temp.parse::<u16>() {
                    Ok(num) => {
                        if changes {
                            if sensors_wanted.len() == counter {
                                counter -= 1;
                            }
                            if sensors_wanted[counter] && max_temp < num {
                                max_temp = num;
                                vector.push(max_temp);
                            }
                        } else if max_temp < num {
                            max_temp = num;
                            vector.push(max_temp);
                        }
                        counter += 1;
                        0
                    }
                    Err(_e) => 0,
                },
                None => 0,
            }
        })
        .collect::<Vec<_>>();

    #[allow(unreachable_code)]
    match vector.iter().max() {
        Some(_) => *vector.iter().max().unwrap(),
        None => {
            #[cfg(target_os = "linux")]
            {
                return get_temp_sys();
            }
            0
        }
    }
}

fn parse_bool_vec(input: &str) -> Vec<bool> {
    input
        .split_whitespace()
        .filter_map(|word| match word.to_lowercase().as_str() {
            "true" => Some(true),
            "false" => Some(false),
            _ => None,
        })
        .collect()
}
