pub fn local_storage(function: &str, option: &str, value: &str) -> String {
    if function == "get" {
        match web_local_storage_api::get_item(option) {
            Ok(out) => return out.unwrap_or(String::new()),
            Err(_err) => return String::new(),
        }
    } else if function == "remove" {
        let _ = web_local_storage_api::remove_item(option);
        return String::new();
    } else if function == "save" {
        let _ = web_local_storage_api::set_item(option, value);
        return String::new();
    } else if function == "clear" {
        let _ = web_local_storage_api::clear();
        return String::new();
    }
    String::new()
}
