use tauri_plugin_clipboard_manager::ClipboardExt;

pub fn copy_text(app: &tauri::AppHandle, text: String)
{
    app.clipboard().write_text(text).unwrap();
}
