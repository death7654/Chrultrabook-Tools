use std::{env, fs};

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
            .unwrap()
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
    let mut sensors: u16 = 0;
    let temps: u16 = ec_temps
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
            return get_temp_sys();
        } // */
        return 0;
    }
    return temps / sensors;
}
