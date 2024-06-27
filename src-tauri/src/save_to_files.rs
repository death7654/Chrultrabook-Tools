use std::fs;
use tauri_plugin_dialog::DialogExt;

pub fn select_path(app: tauri::AppHandle, file_name: String, content: String) {
    app.dialog()
        .file()
        .set_file_name(file_name)
        .add_filter("File Extension", &["txt"])
        .save_file(|file_path| match file_path {
            Some(ref _out) => {
                let file = file_path.unwrap();
                fs::write(&file, content).expect("unable to write")
            }
            None => {}
        });
}
