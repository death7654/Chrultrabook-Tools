use std::fs;
use tauri_plugin_dialog::DialogExt;

pub async fn select_path(
    app: tauri::AppHandle,
    file_name: String,
    content: String,
) -> Result<bool, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let file = app
            .dialog()
            .file()
            .set_file_name(file_name)
            .add_filter("Text File", &["txt"])
            .blocking_save_file();
        if let Some(file) = file {
            fs::write(file.to_string(), content).map_err(|error| error.to_string())?;
            Ok(true)
        } else {
            Ok(false)
        }
    })
    .await
    .map_err(|error| error.to_string())?
}
