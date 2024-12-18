use std::{fs};

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
    return 0;
}

pub fn get_temp(ec_temps: String) -> u16 {
    let mut max_temp: u16 = 0;
    let mut vector = Vec::new();
    let temps = ec_temps
        .split("\n")
        .into_iter()
        .map(|l: &str| {
            match l.split("C)").collect::<Vec<_>>()[0]
                .trim()
                .split(" ")
                .collect::<Vec<_>>()
                .last()
            {
                Some(temp) => match temp.parse::<u16>() {
                    Ok(num) => {
                        if max_temp < num {
                            max_temp = num;
                            vector.push(max_temp);
                        }
                        return num;
                    }
                    Err(_e) => return 0,
                },
                None => return 0,
            }
        })
        .collect::<Vec<_>>();

    match vector.iter().max() {
        Some(_) => *vector.iter().max().unwrap(),
        None => {
            #[cfg(target_os = "linux")]
            {
                return get_temp_sys();
            }
            return 0;
        }
    }
}
