use std::fs::{self, File};
use std::io::{self, Write};
use std::path::Path;

/// Commit in the same directory so an interrupted write cannot truncate settings.
pub fn atomic_write(path: &Path, bytes: &[u8]) -> io::Result<()> {
    if let Some(parent) = path.parent() { fs::create_dir_all(parent)?; }
    let temporary = path.with_extension("json.tmp");
    let result = (|| {
        let mut file = File::create(&temporary)?;
        file.write_all(bytes)?;
        file.sync_all()?;
        drop(file);
        if path.is_file() { fs::copy(path, path.with_extension("json.bak"))?; }
        fs::rename(&temporary, path)
    })();
    if result.is_err() { let _ = fs::remove_file(&temporary); }
    result
}

#[cfg(test)]
mod tests {
    use super::*;
    fn directory() -> std::path::PathBuf {
        let nonce = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_nanos();
        let path = std::env::temp_dir().join(format!("fan-settings-test-{}-{nonce}", std::process::id()));
        fs::create_dir_all(&path).unwrap(); path
    }
    #[test]
    fn creates_nested_settings_without_partial_files() {
        let dir = directory(); let path = dir.join("nested/settings.json");
        atomic_write(&path, br#"{"a":1}"#).unwrap();
        assert_eq!(fs::read(&path).unwrap(), br#"{"a":1}"#);
        assert!(!path.with_extension("json.tmp").exists());
        fs::remove_dir_all(dir).unwrap();
    }
    #[test]
    fn replacement_keeps_previous_complete_settings() {
        let dir = directory(); let path = dir.join("settings.json");
        atomic_write(&path, b"old").unwrap(); atomic_write(&path, b"new").unwrap();
        assert_eq!(fs::read(&path).unwrap(), b"new");
        assert_eq!(fs::read(path.with_extension("json.bak")).unwrap(), b"old");
        fs::remove_dir_all(dir).unwrap();
    }
    #[test]
    fn failed_commit_preserves_existing_destination() {
        let dir = directory(); let path = dir.join("settings.json");
        fs::create_dir(&path).unwrap(); fs::write(path.join("keep"), b"keep").unwrap();
        assert!(atomic_write(&path, b"new").is_err());
        assert_eq!(fs::read(path.join("keep")).unwrap(), b"keep");
        assert!(!path.with_extension("json.tmp").exists());
        fs::remove_dir_all(dir).unwrap();
    }
}
